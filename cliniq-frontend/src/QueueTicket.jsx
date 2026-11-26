import './QueueTicket.css'

function QueueTicket({
  queueNumber = 'A-024',
  selectedService = 'General consultation',
  onTrackQueue,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
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
    <div className="queue-ticket-screen">
      {/* CLINIQ Header */}
      <header className="queue-ticket-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="queue-ticket-logo"
        />
      </header>

      <main className="queue-ticket-content">
        {/* Success Checkmark */}
        <div className="queue-ticket-checkmark">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 52 L42 73 L82 27"
              stroke="white"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Confirmation Message */}
        <h1 className="queue-ticket-title">
          Check-in Successful!
        </h1>

        <p className="queue-ticket-subtitle">
          Your queue number has been issued by the clinic server.
        </p>

        {/* Queue Number Card */}
        <div className="queue-ticket-card">
          <h3>YOUR QUEUE NUMBER</h3>
          <h2>{queueNumber}</h2>
          <div className="queue-ticket-divider" />
          <p>{selectedService}</p>
        </div>

        {/* Track My Queue Button */}
        <button
          type="button"
          className="queue-ticket-track"
          onClick={() => onTrackQueue?.()}
          style={{ touchAction: 'manipulation' }}
        >
          Track My Queue
        </button>
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Main navigation"
        className="queue-ticket-bottom-nav"
      >
        {navItems.map((tab) => {
          const isActive = tab.key === 'queue'
          return (
            <button
              key={tab.key}
              type="button"
              className={isActive ? 'active' : undefined}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => tab.onClick?.()}
              style={{ touchAction: 'manipulation' }}
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

export default QueueTicket