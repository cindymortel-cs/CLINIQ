import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import PasswordInput from './PasswordInput'
import './SecureAccount.css'

function SecureAccount({ accountType, registrationData, onBack, onCreateAccount }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        role: (accountType || 'student').toUpperCase(),
        fullName: registrationData?.fullName || '',
        password,
        contactNumber: registrationData?.contactNumber || null,
        srCode: registrationData?.srCode || null,
        collegeDepartment:
          registrationData?.collegeDepartment || registrationData?.department || null,
        yearLevel: registrationData?.yearLevel || null,
        applicationNumber: registrationData?.applicationNumber || null,
        seniorHighSchool: registrationData?.seniorHighSchool || null,
        programApplied: registrationData?.programApplied || null,
        campus: registrationData?.campus || null,
        employeeId: registrationData?.employeeId || null,
        position: registrationData?.position || null,
      }

      const authRes = await cliniqApi.register(payload)
      if (onCreateAccount) {
        onCreateAccount(authRes)
      }
    } catch (err) {
      setMessage(err.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="secure-account-screen">
      {/* Header */}
      <header className="secure-account-header">
        <button
          type="button"
          className="secure-back-button"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
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
          <span>Finish registration</span>
        </button>
      </header>

      <main className="secure-account-content">
        {/* Page Title */}
        <h1 className="secure-account-title">
          Secure Your
          <br />
          <span>Account</span>
        </h1>

        {/* Step Indicator */}
        <div className="secure-step">STEP 2 OF 2</div>

        {/* Password Form */}
        <form className="secure-account-form" onSubmit={handleSubmit}>
          <label htmlFor="createPassword">Create password</label>
          <PasswordInput
            id="createPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {/* Privacy Information */}
          <div className="secure-privacy-box">
            <span className="secure-privacy-icon" aria-hidden="true">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b0000"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>

            <div className="secure-privacy-text">
              <h3>Privacy and access</h3>
              <p>
                The clinic stores basic identity, service and visit status on its
                local server.
              </p>
            </div>
          </div>

          {/* Validation Message */}
          {message && (
            <p className="secure-message" role="status">
              {message}
            </p>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            className="secure-create-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default SecureAccount