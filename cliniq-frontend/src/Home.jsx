import './Home.css'

function HomeIcon({ type, size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === 'home' && (
        <>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <path d="M9 21v-8h6v8" />
        </>
      )}

      {type === 'queue' && (
        <>
          <path d="M9 6h12M9 12h12M9 18h12" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </>
      )}

      {type === 'visits' && (
        <>
          <path d="M6 2h9l5 5v14H6z" />
          <path d="M15 2v5h5M9 12h8M9 16h8" />
        </>
      )}

      {type === 'calendar' && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 2v6M17 2v6M3 10h18" />
          <path d="M8 14h2M14 14h2M8 18h2" />
        </>
      )}

      {type === 'profile' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
        </>
      )}

      {type === 'announcement' && (
        <>
          <path d="M3 10v4h4l10 5V5L7 10z" />
          <path d="m7 14 2 6M20 9l2-2M20 15l2 2" />
        </>
      )}
    </svg>
  )
}

function Home({
  userName = 'Yela Cueto',
  activeTicket = null,
  announcements = [],
  onVisitClinic,
  onQueue,
  onVisits,
  onProfile,
  onAnnouncement,
  onUpcomingAppointment,
}) {
  const latestAnnouncement = announcements.find(
    (a) => (a.announcementType || 'ANNOUNCEMENT').toUpperCase() !== 'APPOINTMENT'
  )

  const latestAppointmentEvent = announcements.find(
    (a) => (a.announcementType || '').toUpperCase() === 'APPOINTMENT'
  )

  const handleUpcomingClick = () => {
    if (onUpcomingAppointment) {
      onUpcomingAppointment()
    } else if (activeTicket) {
      onQueue?.()
    } else if (latestAppointmentEvent) {
      onAnnouncement?.()
    } else {
      onVisits?.()
    }
  }

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      onClick: null,
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
    <div className="home-screen">
      {/* CLINIQ Header */}
      <header className="home-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="home-logo"
        />
      </header>

      <main className="home-content">
        {/* Greeting */}
        <div className="home-greeting">
          <h1>
            Good day,
            <br />
            <span>{userName}!</span>
          </h1>
        </div>

        {/* Visit Clinic */}
        <button
          type="button"
          className="home-visit-clinic"
          onClick={() => onVisitClinic?.()}
          style={{ touchAction: 'manipulation' }}
        >
          <div>
            <h2>Visit Clinic</h2>
            <p>Check in and get a queue number</p>
          </div>

          <span className="home-visit-arrow">❯</span>
        </button>

        {/* My Queue and Visit History */}
        <div className="home-feature-grid">
          <button
            type="button"
            className="home-feature-card"
            onClick={() => onQueue?.()}
            style={{ touchAction: 'manipulation' }}
          >
            <HomeIcon type="queue" size={42} />
            <h3>My Queue</h3>
            <p>
              {activeTicket
                ? `Ticket ${activeTicket.queueNumber} • ${activeTicket.status.replace('_', ' ')}`
                : 'Track your current queue'}
            </p>
          </button>

          <button
            type="button"
            className="home-feature-card"
            onClick={() => onVisits?.()}
            style={{ touchAction: 'manipulation' }}
          >
            <HomeIcon type="visits" size={42} />
            <h3>Visit History</h3>
            <p>View past clinic visits</p>
          </button>
        </div>

        <hr className="home-divider" />

        {/* Clinic Announcement */}
        <section
          className="home-announcement"
          role="button"
          tabIndex={0}
          onClick={() => onAnnouncement?.()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onAnnouncement?.()
            }
          }}
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
        >
          <div className="home-section-heading">
            <HomeIcon type="announcement" size={26} />
            <h3>Clinic Announcement</h3>
          </div>

          <p>
            {latestAnnouncement
              ? `${latestAnnouncement.title}${latestAnnouncement.eventDate ? ` (${latestAnnouncement.eventDate})` : ''}: ${latestAnnouncement.message}`
              : 'Clinic announcements will appear here.'}
          </p>
        </section>

        {/* Upcoming Appointment */}
        <section
          className="home-appointment"
          role="button"
          tabIndex={0}
          onClick={handleUpcomingClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleUpcomingClick()
            }
          }}
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
        >
          <div className="home-section-heading">
            <HomeIcon type="calendar" size={26} />
            <h3>Upcoming Appointment</h3>
          </div>

          <p>
            {activeTicket
              ? `Queue ${activeTicket.queueNumber} (${activeTicket.serviceName}) • Est. wait ~${activeTicket.estimatedWaitMinutes} mins`
              : latestAppointmentEvent
                ? `${latestAppointmentEvent.title}${latestAppointmentEvent.eventDate ? ` (${latestAppointmentEvent.eventDate})` : ''}: ${latestAppointmentEvent.message}`
                : 'No upcoming appointments yet.'}
          </p>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
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
          const isActive = tab.key === 'home'
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

export default Home