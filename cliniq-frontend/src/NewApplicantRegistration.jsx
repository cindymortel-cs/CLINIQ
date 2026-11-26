import { useState } from 'react'
import PrivacyNoticeModal from './PrivacyNoticeModal'
import './NewApplicantRegistration.css'

function NewApplicantRegistration({ onContinue, onBack, onBackToSignIn }) {
  const [formData, setFormData] = useState({
    fullName: '',
    applicationNumber: '',
    seniorHighSchool: '',
    programApplied: '',
    contactNumber: '',
    campus: ''
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
    <div className="applicant-registration-screen">
      {/* CLINIQ Header */}
      <header className="applicant-registration-header">
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
            className="applicant-registration-logo"
          />
        </button>
      </header>

      <main className="applicant-registration-content">
        {/* Page Title */}
        <h1 className="applicant-registration-title">
          <span>New Applicant</span>
          <br />
          Registration
        </h1>

        <div className="applicant-step">STEP 1 OF 2</div>

        {/* Registration Form */}
        <form
          className="applicant-registration-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="applicantFullName">
            Full name
          </label>
          <input
            id="applicantFullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label htmlFor="applicationNumber">
            Application number
          </label>
          <input
            id="applicationNumber"
            name="applicationNumber"
            type="text"
            value={formData.applicationNumber}
            onChange={handleChange}
            required
          />

          <label htmlFor="seniorHighSchool">
            Senior high school
          </label>
          <input
            id="seniorHighSchool"
            name="seniorHighSchool"
            type="text"
            value={formData.seniorHighSchool}
            onChange={handleChange}
            required
          />

          <label htmlFor="programApplied">
            Program applied for
          </label>
          <input
            id="programApplied"
            name="programApplied"
            type="text"
            value={formData.programApplied}
            onChange={handleChange}
            required
          />

          <label htmlFor="applicantContact">
            Contact number
          </label>
          <input
            id="applicantContact"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />

          <label htmlFor="campus">
            Campus
          </label>
          <input
            id="campus"
            name="campus"
            type="text"
            value={formData.campus}
            onChange={handleChange}
            required
          />

          {/* Privacy Checkbox */}
          <div className="applicant-privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="applicantPrivacyCheck"
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              <label htmlFor="applicantPrivacyCheck" style={{ cursor: 'pointer' }}>
                I have read the{' '}
              </label>
              <button
                type="button"
                className="applicant-privacy-link"
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
            className="applicant-registration-continue"
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

export default NewApplicantRegistration