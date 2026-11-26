import './Profile.css'

function Profile({
  userName = 'Guest',
  accountType = 'student',
  userId = '',
  profilePhoto = null,
  onPersonalInformation,
  onAccountSecurity,
  onNotificationPreferences,
  onClinicConnection,
  onAboutCliniq,
  onSignOut,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
  const accountLabels = {
    student: 'Enrolled student',
    applicant: 'New applicant',
    personnel: 'University personnel'
  }

  const accountLabel =
    accountLabels[accountType] || 'CLINIQ user'

  const menuItems = [
    {
      label: 'Personal information',
      onClick: onPersonalInformation
    },
    {
      label: 'Account & security',
      onClick: onAccountSecurity
    },
    {
      label: 'Notification preferences',
      onClick: onNotificationPreferences
    },
    {
      label: 'Clinic connection',
      onClick: onClinicConnection
    },
    {
      label: 'About CLINIQ',
      onClick: onAboutCliniq
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
    <div className="profile-screen">
      {/* CLINIQ Header */}
      <header className="profile-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="profile-logo"
        />
      </header>

      <main className="profile-content">
        {/* Page Heading */}
        <section className="profile-intro">
          <h1>Profile</h1>
          <p>
            View and manage your personal and account
            details.
          </p>
        </section>

        {/* Profile Information Card */}
        <section className="profile-user-card">
          <div className="profile-user-avatar">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="User profile"
                className="profile-user-photo"
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <svg
                viewBox="0 0 64 64"
                width="64"
                height="64"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="29"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx="32"
                  cy="23"
                  r="11"
                  fill="white"
                />
                <path
                  d="M13 51C15 40 22 35 32 35C42 35 49 40 51 51"
                  fill="white"
                />
              </svg>
            )}
          </div>

          <div className="profile-user-details">
            <h2>{userName}</h2>
            <p className="profile-account-type">{accountLabel}</p>
            <p className="profile-user-id">
              {userId
                ? `${accountType === 'student' ? 'SR-CODE' : 'ID'}: ${userId}`
                : 'ID not provided'}
            </p>
          </div>
        </section>

        {/* Profile Settings Menu */}
        <section className="profile-menu" aria-label="Profile settings">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="profile-menu-item"
              onClick={() => item.onClick?.()}
            >
              <span>{item.label}</span>
              <span className="profile-menu-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </section>

        {/* Sign Out Button */}
        <button
          type="button"
          className="profile-signout-button"
          onClick={() => onSignOut?.()}
        >
          Sign out
        </button>
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

export default Profile