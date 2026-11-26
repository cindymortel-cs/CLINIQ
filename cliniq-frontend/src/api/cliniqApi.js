const DEFAULT_HOST = "192.168.1.4:8080";

function resolveServerHost() {
  const isNative = !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor);
  if (!isNative && window.location.host) {
    return window.location.host;
  }
  const savedHost = localStorage.getItem("cliniq_server_host")?.trim();
  return savedHost || DEFAULT_HOST;
}

function resolveIsHttps(host) {
  const isNative = !!(window.Capacitor?.isNativePlatform?.() || window.Capacitor);
  if (!isNative && window.location.protocol === "https:") {
    return true;
  }
  return host.startsWith("https://");
}

const rawHost = resolveServerHost().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
const isHttps = resolveIsHttps(resolveServerHost());

export const SERVER_HOST = rawHost;
export const API_BASE = `${isHttps ? "https:" : "http:"}//${rawHost}/api`;
export const WS_URL = `${isHttps ? "wss:" : "ws:"}//${rawHost}/ws/queue`;

export function setServerHost(newHost) {
  const cleaned = (newHost || "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  if (cleaned) {
    localStorage.setItem("cliniq_server_host", cleaned);
  } else {
    localStorage.removeItem("cliniq_server_host");
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('cliniq_token');
  const timeoutMs = options.timeoutMs ?? 6000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && data.error) ||
        `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Connection timed out (${rawHost}).`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const cliniqApi = {
  // Health Check (used by ClinicConnection / Try Again)
  checkHealth: () => request('/health', { timeoutMs: 4500 }),

  // 1. Authentication & Registration
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (identifier, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  staffLogin: (identifier, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  resetPassword: (identifier, newPassword) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, newPassword }),
    }),

  // 2. User Profile & Settings
  getUser: (userId) => request(`/users/${userId}`),

  updateProfile: (userId, payload) =>
    request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changePassword: (userId, currentPassword, newPassword) =>
    request(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updatePreferences: (userId, prefs) =>
    request(`/users/${userId}/notifications`, {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),

  getUserDevices: (userId, currentDevice) =>
    request(
      `/users/${userId}/devices${
        currentDevice ? `?device=${encodeURIComponent(currentDevice)}` : ''
      }`
    ),

  signOutOtherDevices: (userId) =>
    request(`/users/${userId}/devices/signout-all`, {
      method: 'POST',
    }),

  // 3. Clinic Services & Patient Queue
  getServices: (role) =>
    request(`/services${role ? `?role=${encodeURIComponent(role)}` : ''}`),

  getQueueStatus: () => request('/queue/status'),

  checkIn: (userId, serviceId, urgentNote) =>
    request('/queue/checkin', {
      method: 'POST',
      body: JSON.stringify({ userId, serviceId, urgentNote }),
    }),

  getMyActiveQueue: (userId) => request(`/queue/my-active/${userId}`),

  cancelQueue: (ticketId) =>
    request(`/queue/${ticketId}/cancel`, {
      method: 'POST',
    }),

  getVisitHistory: (userId) => request(`/visits/history/${userId}`),

  // 4. Staff Queue Management
  getStaffDashboard: () => request('/staff/dashboard'),

  setQueueStatus: (paused, reason) =>
    request('/staff/queue-status', {
      method: 'POST',
      body: JSON.stringify({
        paused: String(paused),
        ...(reason ? { reason } : {}),
      }),
    }),

  callNext: () =>
    request('/staff/call-next', {
      method: 'POST',
    }),

  callNextPatient: () =>
    request('/staff/call-next', {
      method: 'POST',
    }),

  markNoShow: () =>
    request('/staff/no-show', {
      method: 'POST',
    }),

  setPriority: (ticketId, priority, urgentNote) =>
    request(`/staff/queue/${ticketId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority, urgentNote }),
    }),

  updatePriority: (ticketId, priority, urgentNote) =>
    request(`/staff/queue/${ticketId}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority, urgentNote }),
    }),

  completeVisit: (ticketId, staffNotes) =>
    request(`/staff/queue/${ticketId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ staffNotes }),
    }),

  getStaffVisitRecords: () => request('/staff/visit-records'),
  getVisitRecords: () => request('/staff/visit-records'),

  // 5. Announcements
  getAnnouncements: () => request('/announcements'),

  createAnnouncement: (payload) =>
    request('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteAnnouncement: (id) =>
    request(`/announcements/${id}`, {
      method: 'DELETE',
    }),
};

export function connectQueueSocket(onEvent) {
  let socket = null;
  let reconnectTimer = null;
  let closed = false;

  const connect = () => {
    if (closed) return;
    try {
      socket = new WebSocket(WS_URL);
      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onEvent?.(parsed);
        } catch {
          // ignore non-JSON frames
        }
      };
      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
      socket.onerror = () => {
        socket?.close();
      };
    } catch {
      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }
  };

  connect();

  return () => {
    closed = true;
    clearTimeout(reconnectTimer);
    socket?.close();
  };
}