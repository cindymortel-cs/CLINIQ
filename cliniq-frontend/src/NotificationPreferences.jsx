import { useState, useEffect } from 'react'
import './NotificationPreferences.css'
import { cliniqApi } from './api/cliniqApi'

function NotificationPreferences({
  user,
  onUpdateUser,
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
  const [inAppAlerts, setInAppAlerts] = useState(user?.inAppAlerts ?? true)
  const [approachingAlerts, setApproachingAlerts] = useState(
    user?.approachingTurnAlerts ?? true
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setInAppAlerts(user.inAppAlerts ?? true)
      setApproachingAlerts(user.approachingTurnAlerts ?? true)
    }
  }, [user])

  const handleToggle = async (nextInApp, nextApproaching) => {
    setInAppAlerts(nextInApp)
    setApproachingAlerts(nextApproaching)

    if (!user?.id) return
    setSaving(true)
    try {
      await cliniqApi.updateNotifications(user.id, nextInApp, nextApproaching)
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          inAppAlerts: nextInApp,
          approachingTurnAlerts: nextApproaching,
        })
      }
    } catch (err) {
      window.alert(err.message || 'Failed to save notification preferences.')
    } finally {
      setSaving(false)
    }
  }

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
    <div className="notification-preferences-screen">
      {/* Header */}
      <header className="notification-preferences-header">
        <button
          type="button"
          className="notification-preferences-back"
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

        <h2>Notifications</h2>
      </header>

      <main className="notification-preferences-content">
        {/* Page Title */}
        <h1 className="notification-preferences-title">
          Notification
          <span>Preferences</span>
        </h1>

        {/* Notification Settings */}
        <section className="notification-preferences-settings">
          {/* In-app Alerts */}
          <div className="notification-preferences-card">
            <div className="notification-preferences-text">
              <h3>In-app alerts</h3>
              <p>
                Queue updates over clinic
                <br />
                Wi-Fi
              </p>
            </div>

            <button
              type="button"
              className={
                inAppAlerts
                  ? 'notification-preferences-toggle on'
                  : 'notification-preferences-toggle'
              }
              role="switch"
              aria-label="In-app alerts"
              aria-checked={inAppAlerts}
              disabled={saving}
              onClick={() => handleToggle(!inAppAlerts, approachingAlerts)}
            >
              <span className="notification-preferences-knob" />
            </button>
          </div>

          {/* Approaching-turn Alerts */}
          <div className="notification-preferences-card">
            <div className="notification-preferences-text">
              <h3>
                Approaching-turn
                <br />
                alerts
              </h3>
              <p>Notify before your turn</p>
            </div>

            <button
              type="button"
              className={
                approachingAlerts
                  ? 'notification-preferences-toggle on'
                  : 'notification-preferences-toggle'
              }
              role="switch"
              aria-label="Approaching-turn alerts"
              aria-checked={approachingAlerts}
              disabled={saving}
              onClick={() => handleToggle(inAppAlerts, !approachingAlerts)}
            >
              <span className="notification-preferences-knob" />
            </button>
          </div>
        </section>

        {/* Clinic Connection Notice */}
        <div className="notification-preferences-notice">
          <span className="notification-preferences-alert-icon" aria-hidden="true">
            !
          </span>
          <p>
            In-app alerts require a connection to
            the clinic server.
          </p>
        </div>
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

export default NotificationPreferences