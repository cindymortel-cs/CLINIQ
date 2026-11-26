import { useState } from 'react'
import PrivacyNoticeModal from './PrivacyNoticeModal'
import './StudentRegistration.css'

function StudentRegistration({ onContinue, onBack, onBackToSignIn }) {
  const [formData, setFormData] = useState({
    fullName: '',
    srCode: '',
    college: '',
    yearLevel: '',
    contactNumber: ''
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!privacyAccepted) {
      alert('Please read and accept the data privacy notice.')
      return
    }

    onContinue?.(formData)
  }

  return (
    <div className="student-registration-screen">
      {/* CLINIQ Header */}
      <header className="student-registration-header">
        <button
          type="button"
          onClick={() => (onBackToSignIn ? onBackToSignIn() : onBack?.())}
          aria-label="Back to Sign In"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            touchAction: 'manipulation',
          }}
        >
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="student-registration-logo"
          />
        </button>
      </header>

      <main className="student-registration-content">
        {/* Page Title */}
        <h1 className="student-registration-title">
          <span>Student</span>
          <br />
          Registration
        </h1>

        <div className="student-step">STEP 1 OF 2</div>

        {/* Registration Form */}
        <form
          className="student-registration-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <label htmlFor="srCode">SR-CODE</label>
          <input
            id="srCode"
            name="srCode"
            type="text"
            value={formData.srCode}
            onChange={handleChange}
            required
          />

          <label htmlFor="college">College / Department</label>
          <input
            id="college"
            name="college"
            type="text"
            value={formData.college}
            onChange={handleChange}
            required
          />

          <label htmlFor="yearLevel">Year level</label>
          <input
            id="yearLevel"
            name="yearLevel"
            type="text"
            value={formData.yearLevel}
            onChange={handleChange}
            required
          />

          <label htmlFor="contactNumber">Contact number</label>
          <input
            id="contactNumber"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            autoComplete="tel"
            required
          />

          {/* Privacy Notice */}
          <div className="student-privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="studentPrivacyCheck"
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              <label htmlFor="studentPrivacyCheck" style={{ cursor: 'pointer' }}>
                I have read the{' '}
              </label>
              <button
                type="button"
                className="student-privacy-link"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowPrivacyModal(true)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  color: '#9b0000',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                clinic data privacy notice
              </button>.
            </span>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="student-registration-continue"
          >
            Continue
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => onBack?.()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b0000',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              marginTop: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              touchAction: 'manipulation',
            }}
          >
            Back to account type
          </button>
        </form>
      </main>

      <PrivacyNoticeModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setPrivacyAccepted(true)}
      />
    </div>
  )
}

export default StudentRegistration