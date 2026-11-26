import './QueueTracking.css'

function QueueTracking({
  ticket,
  queueNumber = 'A-024',
  nowServing = 'A-021',
  estimatedWait = '~15 mins',
  patientsAhead = 3,
  onHome,
  onQueue,
  onVisits,
  onProfile,
  onNowServingClick,
  onEstWaitClick,
}) {
  const safeEstimatedWait =
    typeof ticket?.estimatedWaitMinutes === 'number'
      ? `~${ticket.estimatedWaitMinutes} mins`
      : String(estimatedWait).includes('undefined')
        ? '~0 mins'
        : estimatedWait

  const safeAhead =
    typeof ticket?.peopleAhead === 'number' ? ticket.peopleAhead : patientsAhead

  const serviceLabel = ticket?.serviceName || 'General consultation'

  const progressPercent =
    safeAhead === 0 ? '90%' : safeAhead === 1 ? '65%' : safeAhead === 2 ? '45%' : '25%'

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      onClick: onHome,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      ),
    },
    {
      key: 'queue',
      label: 'Queue',
      onClick: onQueue,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="9" r="3" fill="#ffffff" />
          <path d="M6.5 18.5c1.5-3.2 9.5-3.2 11 0" fill="#ffffff" />
        </svg>
      ),
    },
  ]

  return (
    <div className="queue-tracking-screen">
      <header className="queue-tracking-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="queue-tracking-logo"
        />
      </header>

      <main className="queue-tracking-content" style={{ paddingBottom: '96px' }}>
        <h1 className="queue-tracking-title">
          You are in line!
        </h1>

        <p className="queue-tracking-subtitle">
          Updates are delivered on time.
        </p>

        <div className="queue-tracking-number-card">
          <p>YOUR QUEUE NUMBER</p>
          <h2>{queueNumber}</h2>
          <span>{serviceLabel}</span>
        </div>

        <div className="queue-tracking-info">
          <button
            type="button"
            className="queue-tracking-info-card"
            onClick={() => onNowServingClick?.()}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="2" aria-hidden="true">
                <circle cx="4" cy="6" r="1.6" />
                <rect x="8" y="4.5" width="13" height="3" rx="1.5" />
                <circle cx="4" cy="12" r="1.6" />
                <rect x="8" y="10.5" width="13" height="3" rx="1.5" />
                <circle cx="4" cy="18" r="1.6" />
                <rect x="8" y="16.5" width="13" height="3" rx="1.5" />
              </svg>
              <p style={{ margin: 0, lineHeight: 1.15 }}>
                Now
                <br />
                Serving
              </p>
            </div>
            <h3>{nowServing}</h3>
          </button>

          <button
            type="button"
            className="queue-tracking-info-card"
            onClick={() => onEstWaitClick?.()}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              touchAction: 'manipulation',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b0000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9.5" />
                <polyline points="12 7 12 12 15.5 14" />
              </svg>
              <p style={{ margin: 0 }}>Est. wait</p>
            </div>
            <h3>{safeEstimatedWait}</h3>
          </button>
        </div>

        <section className="queue-tracking-progress">
          <div className="queue-progress-bar">
            <div
              className="queue-progress-fill"
              style={{ width: progressPercent }}
            ></div>
          </div>
        </section>

        <div className="queue-tracking-notification">
          <div className="queue-notification-icon">
            !
          </div>

          <div className="queue-notification-text">
            <p>
              {safeAhead === 0
                ? 'You are next in line! Please stay near the clinic.'
                : `${safeAhead} ${safeAhead === 1 ? 'patient' : 'patients'} ahead. Your position may change if staff assign priority`}
            </p>
          </div>
        </div>
      </main>

      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '72px',
          background: '#8b0000',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          padding: '0 10px',
          color: '#ffffff',
          zIndex: 50,
          boxSizing: 'border-box',
        }}
      >
        {navItems.map((tab) => {
          const isActive = tab.key === 'queue'
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
                borderTopLeftRadius: '18px',
                borderTopRightRadius: '18px',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '74px',
                height: '64px',
                paddingBottom: '4px',
                boxSizing: 'border-box',
                touchAction: 'manipulation',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default QueueTracking