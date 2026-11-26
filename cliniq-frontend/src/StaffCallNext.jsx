import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './StaffCallNext.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

function StaffCallNext({
  dashboardData,
  staffUser,
  onRefresh,
  onNavigate,
  onProfile
}) {
  const [notice, setNotice] = useState('')
  const [calling, setCalling] = useState(false)

  let staffPhoto = staffUser?.profilePhoto || null
  if (!staffPhoto) {
    try {
      const saved = JSON.parse(localStorage.getItem('cliniq_staff_settings_extra') || '{}')
      staffPhoto = saved.profilePhoto || null
    } catch {
      staffPhoto = null
    }
  }

  const activeQueue = dashboardData?.activeQueue || []
  const nextEligible =
    activeQueue.find((item) => item.status === 'APPROACHING') ||
    activeQueue.find((item) => item.status === 'WAITING') ||
    activeQueue.find((item) => item.status !== 'NOW_SERVING')

  const nextTicket = nextEligible
    ? {
        id: nextEligible.id,
        ticket: nextEligible.queueNumber,
        patient: nextEligible.patientName,
        service: nextEligible.serviceName,
        priority: nextEligible.priority === 'URGENT' ? 'urgent' : 'regular',
      }
    : {
        id: null,
        ticket: 'None',
        patient: 'No waiting patients in queue',
        service: '—',
        priority: 'regular',
      }

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page.toLowerCase())
    }
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  const handleConfirmCall = async () => {
    if (!nextTicket.id) {
      setNotice('No waiting patient available to call.')
      return
    }
    setCalling(true)
    setNotice('')
    try {
      await cliniqApi.callNext()
      if (onRefresh) await onRefresh()
      setNotice(`Now serving ${nextTicket.ticket} (${nextTicket.patient}).`)
      if (onNavigate) {
        onNavigate('queue')
      }
    } catch (err) {
      setNotice(err.message || 'Failed to call next patient.')
    } finally {
      setCalling(false)
    }
  }

  return (
    <div className="staff-call-next-screen">
      {/* Left Sidebar */}
      <aside className="staff-call-next-sidebar">
        <div className="staff-call-next-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-call-next-logo"
          />
        </div>

        <nav className="staff-call-next-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Queue'
                  ? 'staff-call-next-menu-item active'
                  : 'staff-call-next-menu-item'
              }
              aria-current={item === 'Queue' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="staff-call-next-main">
        <header className="staff-call-next-topbar">
          <button
            type="button"
            className="staff-call-next-profile"
            onClick={handleProfile}
            aria-label="Staff profile"
          >
            {staffPhoto ? (
              <img
                src={staffPhoto}
                alt="Staff"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid white',
                }}
              />
            ) : (
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <circle cx="17" cy="17" r="16" stroke="white" strokeWidth="1.5" />
                <circle cx="17" cy="12" r="6" fill="white" />
                <path d="M6 29 C6 19 28 19 28 29" fill="white" />
              </svg>
            )}
          </button>
        </header>

        <main className="staff-call-next-content">
          <h1 className="staff-call-next-title">
            Call Next <span>Patient</span>
          </h1>

          <p className="staff-call-next-subtitle">
            Preview the next eligible ticket in the current queue order.
          </p>

          {/* Red Ticket Preview Card */}
          <section
            className="staff-call-next-card"
            style={{
              backgroundColor: '#9b0000',
              color: '#ffffff',
              borderRadius: '18px',
              padding: '32px 36px',
              marginTop: '20px',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.14)',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                opacity: 0.9,
              }}
            >
              NEXT PATIENT TO CALL
            </p>

            <h2
              style={{
                margin: '0 0 10px 0',
                fontSize: '64px',
                fontWeight: 800,
                lineHeight: 1.05,
              }}
            >
              {nextTicket.ticket}
            </h2>

            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              {nextTicket.id
                ? `${nextTicket.patient} - ${nextTicket.service} (${nextTicket.priority})`
                : nextTicket.patient}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: '13px',
                opacity: 0.85,
              }}
            >
              Server will broadcast the new serving status on clinic Wi-Fi.
            </p>
          </section>

          {/* Confirm Call Button */}
          <div
            className="staff-call-next-actions"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '28px',
            }}
          >
            <button
              type="button"
              className="staff-call-next-confirm"
              onClick={handleConfirmCall}
              disabled={calling || !nextTicket.id}
              style={{
                backgroundColor: nextTicket.id ? '#9b0000' : '#bfa3a3',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 48px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: nextTicket.id ? 'pointer' : 'not-allowed',
              }}
            >
              {calling
                ? 'Calling...'
                : nextTicket.id
                  ? `Confirm: Call ${nextTicket.ticket}`
                  : 'No Patients Waiting'}
            </button>
          </div>

          {notice && (
            <div className="staff-call-next-notice" role="status" style={{ marginTop: '16px' }}>
              {notice}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffCallNext