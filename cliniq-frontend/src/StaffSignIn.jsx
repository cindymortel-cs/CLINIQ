import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import PasswordInput from './PasswordInput'
import './StaffSignIn.css'

function StaffSignIn({ onSignIn }) {
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot Password Mode States
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [resetStaffId, setResetStaffId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!staffId.trim() || !password.trim()) {
      setError('Please enter your Staff ID and password.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const authRes = await cliniqApi.login(staffId.trim(), password)
      if (authRes.user?.role !== 'STAFF') {
        setError('Access denied. Staff credentials required.')
        return
      }
      onSignIn?.(authRes)
    } catch (err) {
      setError(err.message || 'Invalid Staff ID or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (event) => {
    event.preventDefault()
    setResetError('')
    setResetSuccess('')

    if (!resetStaffId.trim()) {
      setResetError('Please enter your Staff ID or Username.')
      return
    }
    if (newPassword.length < 4) {
      setResetError('New password must be at least 4 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetLoading(true)
    try {
      await cliniqApi.resetPassword(resetStaffId.trim(), newPassword)
      setResetSuccess('Password updated! You can now sign in with your new password.')
      setStaffId(resetStaffId.trim())
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setResetError(err.message || 'Unable to reset staff password. Check your Staff ID.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="staff-signin-screen">
      {/* CLINIQ Header */}
      <header className="staff-signin-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="staff-signin-logo"
        />
      </header>

      <main className="staff-signin-content">
        {!isForgotMode ? (
          <>
            {/* Page Heading */}
            <h1>Staff sign in</h1>

            <p className="staff-signin-description">
              Authorized clinic receptionists, nurses
              and administration only.
            </p>

            {/* Staff Login Form */}
            <form className="staff-signin-form" onSubmit={handleSubmit}>
              <div className="staff-signin-field">
                <label htmlFor="staff-id">Staff ID</label>

                <input
                  id="staff-id"
                  type="text"
                  value={staffId}
                  onChange={(event) => {
                    setStaffId(event.target.value)
                    setError('')
                  }}
                  autoComplete="username"
                />
              </div>

              <div className="staff-signin-field">
                <label htmlFor="staff-password">Password</label>

                <PasswordInput
                  id="staff-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  autoComplete="current-password"
                />
              </div>

              {/* Forgot Password */}
              <button
                type="button"
                className="staff-signin-forgot"
                onClick={() => {
                  setResetStaffId(staffId)
                  setResetError('')
                  setResetSuccess('')
                  setIsForgotMode(true)
                }}
              >
                Forgot password?
              </button>

              {/* Validation Message */}
              {error && (
                <p className="staff-signin-error" role="alert">
                  {error}
                </p>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                className="staff-signin-submit"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Reset Staff Password View */}
            <h1>Reset password</h1>

            <p className="staff-signin-description">
              Enter your authorized Staff ID and set a new password.
            </p>

            <form className="staff-signin-form" onSubmit={handleResetSubmit}>
              <div className="staff-signin-field">
                <label htmlFor="reset-staff-id">Staff ID / Username</label>
                <input
                  id="reset-staff-id"
                  type="text"
                  value={resetStaffId}
                  onChange={(event) => {
                    setResetStaffId(event.target.value)
                    setResetError('')
                  }}
                  autoComplete="username"
                />
              </div>

              <div className="staff-signin-field">
                <label htmlFor="reset-staff-new-pass">New Password</label>
                <PasswordInput
                  id="reset-staff-new-pass"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value)
                    setResetError('')
                  }}
                  autoComplete="new-password"
                />
              </div>

              <div className="staff-signin-field">
                <label htmlFor="reset-staff-confirm-pass">Confirm New Password</label>
                <PasswordInput
                  id="reset-staff-confirm-pass"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setResetError('')
                  }}
                  autoComplete="new-password"
                />
              </div>

              {resetError && (
                <p className="staff-signin-error" role="alert">
                  {resetError}
                </p>
              )}

              {resetSuccess && (
                <p
                  role="status"
                  style={{
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: 600,
                    margin: '4px 0 10px',
                    textAlign: 'center',
                  }}
                >
                  {resetSuccess}
                </p>
              )}

              <button
                type="submit"
                className="staff-signin-submit"
                disabled={resetLoading}
              >
                {resetLoading ? 'Updating...' : 'Reset Password'}
              </button>

              <button
                type="button"
                className="staff-signin-forgot"
                onClick={() => {
                  setIsForgotMode(false)
                  setError('')
                }}
                style={{ marginTop: '10px', display: 'block', width: '100%', textAlign: 'center' }}
              >
                Back to Staff Sign In
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default StaffSignIn