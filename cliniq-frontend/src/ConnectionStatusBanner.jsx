import React, { useEffect, useRef, useState } from 'react';

export default function ConnectionStatusBanner({ wsPath = '/ws/queue', onSync }) {
  const [status, setStatus] = useState(navigator.onLine ? 'connecting' : 'offline');
  const [showSyncedToast, setShowSyncedToast] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const wasDisconnectedRef = useRef(!navigator.onLine);
  const onSyncRef = useRef(onSync);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    let isMounted = true;

    const triggerSync = async () => {
      if (typeof onSyncRef.current === 'function') {
        try {
          await onSyncRef.current();
        } catch (err) {
          console.error('R4 Reconnection sync failed:', err);
        }
      }
    };

    const connectWebSocket = () => {
      if (!isMounted) return;
      if (!navigator.onLine) {
        setStatus('offline');
        wasDisconnectedRef.current = true;
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${wsPath}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
          if (!isMounted) return;
          setStatus('connected');

          // Kapag galing sa offline/disconnected state, i-sync agad ang latest queue data (< 5s target)
          if (wasDisconnectedRef.current) {
            wasDisconnectedRef.current = false;
            await triggerSync();
            if (isMounted) {
              setShowSyncedToast(true);
              setTimeout(() => isMounted && setShowSyncedToast(false), 3000);
            }
          }
        };

        ws.onmessage = async (event) => {
          // Mag-sync din kapag may dumating na QUEUE_UPDATED / NOW_SERVING / APPROACHING_TURN event
          try {
            const data = JSON.parse(event.data);
            if (data?.event) {
              await triggerSync();
            }
          } catch {
            await triggerSync();
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          wasDisconnectedRef.current = true;
          setStatus(navigator.onLine ? 'reconnecting' : 'offline');

          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(connectWebSocket, 1500);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        wasDisconnectedRef.current = true;
        setStatus('reconnecting');
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connectWebSocket, 1500);
      }
    };

    const handleOffline = () => {
      wasDisconnectedRef.current = true;
      setStatus('offline');
      if (wsRef.current) wsRef.current.close();
    };

    const handleOnline = () => {
      setStatus('reconnecting');
      clearTimeout(reconnectTimerRef.current);
      connectWebSocket();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    connectWebSocket();

    return () => {
      isMounted = false;
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [wsPath]);

  if (status === 'connected' && !showSyncedToast) return null;

  const isSynced = status === 'connected' && showSyncedToast;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        width: '100%',
        padding: '10px 16px',
        backgroundColor: isSynced ? '#15803d' : status === 'offline' ? '#991b1b' : '#b45309',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        transition: 'background-color 0.25s ease',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'inline-block',
        }}
      />
      {isSynced && 'Back online — Queue status synchronized!'}
      {!isSynced && status === 'offline' && 'You are offline. Waiting for Wi-Fi connection to sync queue...'}
      {!isSynced && status === 'reconnecting' && 'Connection lost. Reconnecting to clinic server...'}
      {!isSynced && status === 'connecting' && 'Connecting to live clinic queue...'}
    </div>
  );
}