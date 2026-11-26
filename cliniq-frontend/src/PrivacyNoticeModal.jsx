function PrivacyNoticeModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.52)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: '#fdf8f8',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #9b0000',
        }}
      >
        {/* Top Maroon Header */}
        <div
          style={{
            backgroundColor: '#9b0000',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L4 5.5v6.2c0 5.1 3.4 9.8 8 11 4.6-1.2 8-5.9 8-11V5.5L12 2z"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polyline
              points="9 12 11 14 15 10"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2
            id="privacy-modal-title"
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
            }}
          >
            Clinic Data Privacy Notice
          </h2>
        </div>

        {/* Body Content */}
        <div
          style={{
            padding: '18px 20px',
            maxHeight: '56vh',
            overflowY: 'auto',
            color: '#222222',
            fontSize: '12.5px',
            lineHeight: 1.55,
            textAlign: 'left',
          }}
        >
          <p style={{ margin: '0 0 10px 0' }}>
            In compliance with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, the University Health Services collects and processes your personal information solely for clinic queue management and medical visit coordination.
          </p>

          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#9b0000' }}>
            Information Collected:
          </p>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px' }}>
            <li>Full name and institutional ID (SR-Code, Application No., or Employee ID)</li>
            <li>Department / College, Year Level, or Position</li>
            <li>Contact number and clinic queue service selection</li>
          </ul>

          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#9b0000' }}>
            Data Protection & Retention:
          </p>
          <p style={{ margin: 0 }}>
            Your records are stored securely on the local clinic network server, accessible only to authorized university clinic personnel, and are never shared with unauthorized third parties.
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '12px 20px 18px',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '12px',
              border: '1.5px solid #9b0000',
              backgroundColor: '#ffffff',
              color: '#9b0000',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onAccept?.()
              onClose?.()
            }}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#9b0000',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyNoticeModal