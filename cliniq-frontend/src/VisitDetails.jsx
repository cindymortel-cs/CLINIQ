import { useState } from 'react'
import './VisitDetails.css'

function generateSlipCode(visit) {
  const rawQueue = String(visit?.id || '000').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  const rawId = String(visit?.patientIdentifier || visit?.ticketId || 'CLQ')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(-4)
  const rawDate = String(visit?.date || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6)
  return `CLQ-${rawQueue}-${rawId || 'VER'}-${rawDate || '2026'}`
}

function VisitDetails({
  visit,
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile,
  onCancelRequest
}) {
  const [showExcuseSlip, setShowExcuseSlip] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const currentVisit = visit || {
    id: 'A-012',
    service: 'General consultation',
    date: 'Apr 01, 2026',
    checkInTime: '11:25 AM',
    status: 'Completed'
  }

  const normalizedStatus = String(currentVisit.status || '').toLowerCase()
  const isCompleted = normalizedStatus === 'completed'
  const canCancel =
    normalizedStatus === 'in queue' ||
    normalizedStatus === 'approaching' ||
    normalizedStatus === 'waiting'

  const slipCode = generateSlipCode(currentVisit)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard?.writeText(slipCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      setCopiedCode(false)
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
    <div className="visit-details-screen">
      {/* Header (Exact VisitDetails.css classes) */}
      {/* Header */}
      <header className="visit-details-header">
        <button
          type="button"
          className="visit-details-back"
          onClick={onBack}
          aria-label="Go back"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#990000"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h2>Visit details</h2>
      </header>

      {/* Main Content */}
      <main className="visit-details-content">
        {/* Queue Number Card */}
        <section className="visit-details-ticket" aria-label="Queue ticket summary">
          <div className="visit-details-ticket-top">
            <span className="visit-details-label">QUEUE NUMBER</span>
            <span
              className={
                isCompleted
                  ? 'visit-details-badge completed'
                  : 'visit-details-badge ongoing'
              }
            >
              {currentVisit.status}
            </span>
          </div>
          <h1>{currentVisit.id}</h1>
        </section>

        {/* Visit Information Card */}
        <section className="visit-details-info-card">
          <div className="visit-details-info-row">
            <span>Service</span>
            <strong>{currentVisit.service}</strong>
          </div>

          <div className="visit-details-info-row">
            <span>Visit date</span>
            <strong>{currentVisit.date}</strong>
          </div>

          <div className="visit-details-info-row">
            <span>Check-in time</span>
            <strong>{currentVisit.checkInTime}</strong>
          </div>

          {currentVisit.completedAt && (
            <div className="visit-details-info-row">
              <span>Completed time</span>
              <strong>{currentVisit.completedAt}</strong>
            </div>
          )}

          <div className="visit-details-info-row">
            <span>Queue status</span>
            <strong>{currentVisit.status}</strong>
          </div>

          <div className="visit-details-info-row">
            <span>Clinic remarks</span>
            <strong>{currentVisit.staffNotes || 'Basic visit summary'}</strong>
          </div>
        </section>

        {/* Completed Visit Notification */}
        {isCompleted && (
          <div className="visit-details-completed-message" role="status">
            <div className="visit-details-alert-icon" aria-hidden="true">
              !
            </div>
            <p>Your clinic visit is marked completed.</p>
          </div>
        )}

        {/* Digital Clinic Excuse Slip Button */}
        {isCompleted && (
          <button
            type="button"
            onClick={() => setShowExcuseSlip(true)}
            style={{
              display: 'block',
              width: '100%',
              minHeight: '54px',
              marginTop: '18px',
              padding: '14px 18px',
              backgroundColor: '#990000',
              border: 'none',
              borderRadius: '999px',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.22)',
              cursor: 'pointer',
            }}
          >
            View Excuse Slip
          </button>
        )}

        {/* Cancel Queue Request Button */}
        {canCancel && (
          <button
            type="button"
            className="visit-details-cancel-button"
            onClick={onCancelRequest}
          >
            Cancel Request
          </button>
        )}
      </main>

      {/* Digital Excuse Slip / Attendance Proof Modal */}
      {showExcuseSlip && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="excuse-slip-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99997,
            backgroundColor: 'rgba(0, 0, 0, 0.58)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '370px',
              backgroundColor: '#ffffff',
              border: '2px solid #990000',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 16px 34px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Slip Header */}
            <div
              style={{
                backgroundColor: '#990000',
                color: '#ffffff',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                  UNIVERSITY HEALTH SERVICES
                </div>
                <h2
                  id="excuse-slip-title"
                  style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800 }}
                >
                  Official Clinic Attendance Proof
                </h2>
              </div>

              <span
                style={{
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                VERIFIED
              </span>
            </div>

            {/* Slip Body */}
            <div style={{ padding: '16px 18px', fontSize: '13.5px', color: '#1f2937' }}>
              <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#4b5563', lineHeight: 1.4 }}>
                This certifies that the student/patient below was attended at the University Clinic:
              </p>

              <div
                style={{
                  border: '1.5px solid #990000',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  backgroundColor: '#fffafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Patient Name:</span>
                  <strong style={{ textAlign: 'right' }}>
                    {currentVisit.patientName || 'Student / Patient'}
                  </strong>
                </div>

                {currentVisit.patientIdentifier && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ color: '#6b7280' }}>ID / SR-CODE:</span>
                    <strong>{currentVisit.patientIdentifier}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Queue Ticket:</span>
                  <strong>{currentVisit.id}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Service:</span>
                  <strong style={{ textAlign: 'right' }}>{currentVisit.service}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Visit Date:</span>
                  <strong>{currentVisit.date}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#6b7280' }}>Time In / Out:</span>
                  <strong>
                    {currentVisit.checkInTime} – {currentVisit.completedAt || 'Completed'}
                  </strong>
                </div>
              </div>

              {/* Unique Verification Code Box */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px dashed #990000',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
                    Verification Reference Code
                  </div>
                  <strong style={{ fontSize: '13.5px', color: '#990000', letterSpacing: '0.04em' }}>
                    {slipCode}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#990000',
                    border: '1.5px solid #990000',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowExcuseSlip(false)}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  backgroundColor: '#990000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '12px 16px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (100% identical to VisitHistory.jsx) */}
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
          const isActive = tab.key === 'visits'
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

export default VisitDetails