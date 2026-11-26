import './AboutCliniq.css'

function AboutCliniq({
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
  const features = [
    {
      title: 'Digital Queue Management',
      description: 'Join and monitor the clinic queue'
    },
    {
      title: 'Visit Scheduling',
      description: 'View and manage clinic visits'
    },
    {
      title: 'Real-time Notifications',
      description: 'Receive queue and turn updates'
    }
  ]

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
    <div className="about-cliniq-screen">
      {/* Header */}
      <header className="about-cliniq-header">
        <button
          type="button"
          className="about-cliniq-back"
          onClick={() => onBack?.()}
          aria-label="Go back"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b0000"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <h2>About</h2>
      </header>

      <main className="about-cliniq-content">
        {/* Page Title */}
        <section className="about-cliniq-intro">
          <h1>
            <span className="about-cliniq-title-about">About</span>
            <span className="about-cliniq-title-brand">CLINIQ</span>
          </h1>

          <p>
            A Clinical Local-network Integrated Queue
            System designed to make clinic visits
            more organized, accessible, and convenient.
          </p>
        </section>

        {/* CLINIQ Information Card */}
        <section className="about-cliniq-info-card">
          <div className="about-cliniq-symbol">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="27"
                cy="29"
                r="20"
                stroke="#990000"
                strokeWidth="6"
              />
              <path
                d="M39 42 L49 52"
                stroke="#990000"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M7 29 H18 L22 21 L28 37 L33 27 H47"
                stroke="#990000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="about-cliniq-info-divider" />

          <p>
            Making clinic services easier to access
            through a simple and organized queue
            experience.
          </p>
        </section>

        {/* CLINIQ Features */}
        <section className="about-cliniq-features">
          <h2>
            What <span>CLINIQ</span> offers
          </h2>

          <div className="about-cliniq-feature-list">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="about-cliniq-feature-card"
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Version Information */}
        <footer className="about-cliniq-version">
          <p>CLINIQ · Version 1.0</p>
          <p>Developed by Team</p>
        </footer>
      </main>

      {/* Bottom Navigation */}
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

export default AboutCliniq