import { useState, useEffect, useCallback } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './ClinicConnection.css'

function ClinicConnection({
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
  const [isConnected, setIsConnected] = useState(true)
  const [checking, setChecking] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  const checkServerConnection = useCallback(async () => {
    setChecking(true)
    setStatusNote('')
    try {
      const result = await cliniqApi.checkHealth()
      if (result && (result.status === 'CONNECTED' || result.ok !== false)) {
        setIsConnected(true)
        setStatusNote('')
      } else {
        setIsConnected(false)
        setStatusNote('Server responded without CONNECTED status.')
      }
    } catch (err) {
      setIsConnected(false)
      setStatusNote(err?.message || 'Unable to reach clinic server.')
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkServerConnection()
  }, [checkServerConnection])

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      onClick: onHome,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      ),
    },
    {
      key: 'queue',
      label: 'Queue',
      onClick: onQueue,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <circle cx="4" cy="6" r="1.5" />
          <rect x="8" y="4.5" width="13" height="3" rx="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <rect x="8" y="10.5" width="13" height="3" rx="1.5" />
          <circle cx="4" cy="18" r="1.5" />
          <rect x="8" y="16.5" width="13" height="3" rx="1.5" />
        </svg>
      ),
    },
    {
      key: 'visits',
      label: 'Visits',
      onClick: onVisits,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <circle cx="8" cy="11" r="1" fill="#ffffff" />
          <circle cx="12" cy="11" r="1" fill="#ffffff" />
          <circle cx="16" cy="11" r="1" fill="#ffffff" />
          <circle cx="8" cy="15" r="1" fill="#ffffff" />
          <circle cx="12" cy="15" r="1" fill="#ffffff" />
          <circle cx="16" cy="15" r="1" fill="#ffffff" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      onClick: onProfile,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="9" r="3" fill="#ffffff" />
          <path d="M6.5 18.5c1.5-3.2 9.5-3.2 11 0" fill="#ffffff" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="cliniq-connection-page"
      style={{
        minHeight: '100dvh',
        backgroundColor: '#fdf8f8',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Top Pink Header Bar */}
      <header
        style={{
          backgroundColor: '#fde8e8',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottomLeftRadius: '14px',
          borderBottomRightRadius: '14px',
        }}
      >
        <button
          type="button"
          onClick={() => onBack?.()}
          aria-label="Back to Profile"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9b0000"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <span
          style={{
            color: '#9b0000',
            fontSize: '15px',
            fontWeight: 700,
          }}
        >
          Connection
        </span>
      </header>

      {/* Main Centered Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px 24px',
          textAlign: 'center',
        }}
      >
        {/* Maroon Wi-Fi Circle */}
        <div
          style={{
            width: '132px',
            height: '132px',
            borderRadius: '50%',
            backgroundColor: '#9b0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(155, 0, 0, 0.22)',
            marginBottom: '20px',
          }}
        >
          {isConnected ? (
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 9.2C7.8 4.6 16.2 4.6 21.5 9.2"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M6.2 13C9.6 10.1 14.4 10.1 17.8 13"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M9.8 16.6C11.1 15.5 12.9 15.5 14.2 16.6"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="12" cy="19.6" r="1.7" fill="#ffffff" />
            </svg>
          ) : (
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 9.2C7.8 4.6 16.2 4.6 21.5 9.2"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M6.2 13C9.6 10.1 14.4 10.1 17.8 13"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M9.8 16.6C11.1 15.5 12.9 15.5 14.2 16.6"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="12" cy="19.6" r="1.7" fill="#ffffff" />
              <line
                x1="4.5"
                y1="4.5"
                x2="19.5"
                y2="19.5"
                stroke="#ffffff"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            margin: '0 0 6px 0',
            fontSize: '24px',
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {isConnected ? (
            <>
              <span style={{ color: '#9b0000' }}>Connected</span> to Wi-Fi!
            </>
          ) : (
            <>
              <span style={{ color: '#9b0000' }}>Connection</span> lost
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '13px',
            color: '#333333',
            lineHeight: 1.45,
            maxWidth: '280px',
          }}
        >
          {isConnected
            ? "You're now connected to the clinic server."
            : 'Live queue updates are unavailable until you reconnect to the clinic Wi-Fi.'}
        </p>

        {/* Banner Card */}
        <section
          style={{
            width: '100%',
            maxWidth: '330px',
            backgroundColor: '#b94444',
            borderRadius: '16px',
            padding: '14px 18px',
            color: '#ffffff',
            textAlign: 'left',
            boxShadow: '0 6px 16px rgba(155, 0, 0, 0.18)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10.2" stroke="#ffffff" strokeWidth="1.9" />
              <line x1="12" y1="7" x2="12" y2="13.2" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" />
              <circle cx="12" cy="16.6" r="1.2" fill="#ffffff" />
            </svg>
            <strong style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.2 }}>
              {isConnected ? 'Clinic network connected' : 'Clinic network required'}
            </strong>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: 1.4,
              opacity: 0.95,
            }}
          >
            {isConnected
              ? 'Enjoy seamless connection and access to CLINIQ.'
              : statusNote || 'Reconnect to CLINIQ. Queue details will refresh when available.'}
          </p>
        </section>

        {/* Try Again Button */}
        {!isConnected && (
          <button
            type="button"
            onClick={checkServerConnection}
            disabled={checking}
            style={{
              marginTop: '20px',
              backgroundColor: '#9b0000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: checking ? 'wait' : 'pointer',
              opacity: checking ? 0.75 : 1,
              boxShadow: '0 6px 14px rgba(155, 0, 0, 0.25)',
              touchAction: 'manipulation',
            }}
          >
            {checking ? 'Checking...' : 'Try Again'}
          </button>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          minHeight: '64px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: '#8b0000',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingLeft: '8px',
          paddingRight: '8px',
          color: '#ffffff',
          zIndex: 50,
          boxSizing: 'border-box',
        }}
      >
        {navItems.map((tab) => {
          const isActive = tab.key === 'profile'
          return (
            <button
              key={tab.key}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => tab.onClick?.()}
              style={{
                background: 'transparent',
                borderTop: isActive ? '1.5px solid #ffffff' : '1.5px solid transparent',
                borderLeft: isActive ? '1.5px solid #ffffff' : '1.5px solid transparent',
                borderRight: isActive ? '1.5px solid #ffffff' : '1.5px solid transparent',
                borderBottom: 'none',
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                flex: 1,
                maxWidth: '84px',
                height: '58px',
                boxSizing: 'border-box',
                touchAction: 'manipulation',
              }}
            >
              {tab.icon}
              <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default ClinicConnection