import { useState } from 'react'
import './ReviewCheckIn.css'

function ReviewCheckIn({
  patientName = 'Sample User',
  accountType = 'student',
  selectedService = 'General consultation',
  onBack,
  onConfirm,
  onHome,
  onQueue,
  onVisits,
  onProfile
}) {
  const accountLabels = {
    student: 'Enrolled student',
    applicant: 'New student applicant',
    personnel: 'University personnel'
  }

  const accountLabel = accountLabels[accountType] || 'Enrolled student'
  const [urgentNote, setUrgentNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onConfirm?.(urgentNote.trim())
    } finally {
      setSubmitting(false)
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
    <div className="review-checkin-screen">
      {/* Header */}
      <header className="review-checkin-header">
        <button
          type="button"
          className="review-checkin-back"
          onClick={() => onBack?.()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            touchAction: 'manipulation',
          }}
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
          <span>Review Check-in</span>
        </button>
      </header>

      <main className="review-checkin-content">
        {/* Page Title */}
        <h1 className="review-checkin-title">
          <span>Confirm</span>
          <br />
          your visit
        </h1>

        {/* Check-in Details */}
        <section className="review-checkin-card">
          <div className="review-checkin-row">
            <span>Patient</span>
            <strong>{patientName}</strong>
          </div>

          <div className="review-checkin-row">
            <span>Account Type</span>
            <strong>{accountLabel}</strong>
          </div>

          <div className="review-checkin-row">
            <span>Service</span>
            <strong>{selectedService}</strong>
          </div>

          <div className="review-checkin-row">
            <span>Clinic</span>
            <strong>University Clinic</strong>
          </div>

          <div className="review-checkin-row">
            <span>Queue type</span>
            <strong>Regular</strong>
          </div>
        </section>

        {/* Urgent Note Section */}
        <section className="review-checkin-urgent-note">
          <label htmlFor="review-urgent-note">
            Urgent Note
          </label>

          <textarea
            id="review-urgent-note"
            name="urgentNote"
            rows={4}
            placeholder="Optional note for clinic staff"
            aria-label="Urgent Note"
            value={urgentNote}
            onChange={(event) => setUrgentNote(event.target.value)}
          />
        </section>

        {/* Warning Message */}
        <div className="review-checkin-warning">
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9.5" />
              <line x1="12" y1="7.5" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r="1" fill="#ffffff" stroke="none" />
            </svg>
          </span>
          <p>
            Submitting again will not create a
            second active queue ticket.
          </p>
        </div>

        {/* Confirm Check-in Button */}
        <button
          type="button"
          className="review-checkin-confirm"
          onClick={handleConfirm}
          disabled={submitting}
          style={{ touchAction: 'manipulation' }}
        >
          {submitting ? 'Confirming...' : 'Confirm Check-in'}
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

export default ReviewCheckIn