import { LocalNotifications } from '@capacitor/local-notifications'

function formatNextQueueMessage(body, title) {
  const combined = `${title || ''} ${body || ''}`
  const match = combined.match(/\b([A-Z]+-\d+)\b/i)
  if (match && match[1]) {
    const queueCode = match[1].toUpperCase()
    if (/approaching|up next|your turn/i.test(combined)) {
      return `Queue ${queueCode} is up next.`
    }
  }
  return body || 'Queue update is now available.'
}

async function createAndPlayChime() {
  if (typeof window === 'undefined') return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  let ctx = null
  try {
    ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      await Promise.race([
        ctx.resume(),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ])
    }

    const now = ctx.currentTime
    const notes = [587.33, 880, 1046.5] // D5 -> A5 -> C6 chime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.15)

      gain.gain.setValueAtTime(0.001, now + idx * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.28, now + idx * 0.15 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.32)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.15)
      osc.stop(now + idx * 0.15 + 0.35)
    })

    setTimeout(() => {
      if (ctx && typeof ctx.close === 'function') {
        ctx.close().catch(() => {})
      }
    }, 1000)
  } catch {
    if (ctx && typeof ctx.close === 'function') {
      ctx.close().catch(() => {})
    }
  }
}

export async function unlockAudioContext() {
  await createAndPlayChime()
}

export async function playAlertChime() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([250, 120, 250])
      } catch {
        // Ignore vibrate errors on restricted browsers
      }
    }
    await createAndPlayChime()
  } catch {
    // Ignore audio errors on restricted browsers
  }
}

function emitInAppAlert(title, body) {
  if (typeof window === 'undefined') return
  const formattedBody = formatNextQueueMessage(body, title)
  window.dispatchEvent(
    new CustomEvent('cliniq:queue-alert', {
      detail: { title, body: formattedBody },
    })
  )
}

export async function initMobileNotifications() {
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') {
      await LocalNotifications.requestPermissions()
    }
  } catch {
    if (typeof window !== 'undefined') {
      const onFirstTap = () => {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {})
        }
        window.removeEventListener('pointerdown', onFirstTap)
        window.removeEventListener('keydown', onFirstTap)
      }
      window.addEventListener('pointerdown', onFirstTap, { once: true })
      window.addEventListener('keydown', onFirstTap, { once: true })
    }
  }
}

export async function triggerQueueNotification(title, body) {
  const formattedBody = formatNextQueueMessage(body, title)

  // Always emit in-app banner + sound so web/browser views and banners stay in sync
  emitInAppAlert(title, formattedBody)
  await playAlertChime()

  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions()
      if (req.display !== 'granted') return
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 2147483647),
          title,
          body: formattedBody,
          schedule: { at: new Date(Date.now() + 200) },
          sound: 'default',
        },
      ],
    })
  } catch {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, { body: formattedBody })
        } catch {
          // Fallback already handled via in-app alert + chime
        }
      }
    }
  }
}