import { useState } from 'react'
import PrivacyNoticeModal from './PrivacyNoticeModal'
import './PersonnelRegistration.css'

function PersonnelRegistration({ onContinue, onBack, onBackToSignIn }) {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    department: '',
    position: '',
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
    <div className="personnel-registration-screen">
      {/* CLINIQ Header */}
      <header className="personnel-registration-header">
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
            className="personnel-registration-logo"
          />
        </button>
      </header>

      <main className="personnel-registration-content">
        {/* Page Title */}
        <h1 className="personnel-registration-title">
          <span>Personnel</span>
          <br />
          Registration
        </h1>

        <div className="personnel-step">STEP 1 OF 2</div>

        {/* Registration Form */}
        <form
          className="personnel-registration-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="personnelFullName">Full name</label>
          <input
            id="personnelFullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />

          <label htmlFor="department">Office / Department</label>
          <input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            required
          />

          <label htmlFor="position">Position</label>
          <input
            id="position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleChange}
            required
          />

          <label htmlFor="personnelContact">Contact number</label>
          <input
            id="personnelContact"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            autoComplete="tel"
            required
          />

          {/* Privacy Checkbox */}
          <div className="personnel-privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="personnelPrivacyCheck"
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              <label htmlFor="personnelPrivacyCheck" style={{ cursor: 'pointer' }}>
                I have read the{' '}
              </label>
              <button
                type="button"
                className="personnel-privacy-link"
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
            className="personnel-registration-continue"
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

export default PersonnelRegistration