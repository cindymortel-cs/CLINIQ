import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import PasswordInput from './PasswordInput'
import './SignIn.css'

function SignIn({ onCreateAccount, onSignInSuccess }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot Password Mode States
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      const authRes = await cliniqApi.login(identifier, password)
      if (onSignInSuccess) {
        onSignInSuccess(authRes)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetSuccess('')

    if (!resetIdentifier.trim()) {
      setResetError('Please enter your SR-Code, Application Number, or Employee ID.')
      return
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetLoading(true)
    try {
      await cliniqApi.resetPassword(resetIdentifier.trim(), newPassword)
      setResetSuccess('Password updated! You can now sign in with your new password.')
      setIdentifier(resetIdentifier.trim())
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = String(err.message || '')
      if (msg.includes('404')) {
        setResetError(
          'Password reset endpoint is not enabled on the clinic server yet. Please contact the University Clinic desk.'
        )
      } else {
        setResetError(msg || 'Unable to reset password. Check your ID and try again.')
      }
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="signin-screen">
      {/* CLINIQ Header */}
      <header className="signin-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="signin-brand-logo"
        />
      </header>

      <main className="signin-content">
        {!isForgotMode ? (
          <>
            {/* Welcome Message */}
            <h1 className="signin-title">
              Welcome
              <br />
              <span>Back!</span>
            </h1>

            <p className="signin-subtitle">
              Sign in using your CLINIQ credentials.
            </p>

            {/* Sign In Form */}
            <form className="signin-form" onSubmit={handleSubmit}>
              <label htmlFor="sr-code">SR-Code</label>
              <input
                type="text"
                id="sr-code"
                name="srCode"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {errorMsg && (
                <p style={{ color: '#b91c1c', fontSize: '0.88rem', margin: '4px 0 8px' }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  setResetIdentifier(identifier)
                  setResetError('')
                  setResetSuccess('')
                  setIsForgotMode(true)
                }}
                style={{ touchAction: 'manipulation' }}
              >
                Forgot password?
              </button>

              <button
                type="submit"
                className="signin-button"
                disabled={loading}
                style={{ touchAction: 'manipulation' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="register-text">
                New to CLINIQ?{' '}
                <button
                  type="button"
                  className="register-link"
                  onClick={onCreateAccount}
                  style={{ touchAction: 'manipulation' }}
                >
                  Create an account
                </button>
              </p>
            </form>
          </>
        ) : (
          <>
            {/* Forgot Password View */}
            <h1 className="signin-title">
              Reset
              <br />
              <span>Password</span>
            </h1>

            <p className="signin-subtitle">
              Enter your registered ID and set a new password.
            </p>

            <form className="signin-form" onSubmit={handleResetSubmit}>
              <label htmlFor="reset-id">SR-Code / Application No. / Employee ID</label>
              <input
                type="text"
                id="reset-id"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                required
              />

              <label htmlFor="new-password">New Password</label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <label htmlFor="confirm-password">Confirm New Password</label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {resetError && (
                <p style={{ color: '#b91c1c', fontSize: '0.88rem', margin: '4px 0 8px' }}>
                  {resetError}
                </p>
              )}

              {resetSuccess && (
                <p style={{ color: '#15803d', fontSize: '0.88rem', fontWeight: 600, margin: '4px 0 8px' }}>
                  {resetSuccess}
                </p>
              )}

              <button
                type="submit"
                className="signin-button"
                disabled={resetLoading}
                style={{ touchAction: 'manipulation', marginTop: '8px' }}
              >
                {resetLoading ? 'Updating...' : 'Reset Password'}
              </button>

              <p className="register-text">
                Remembered your password?{' '}
                <button
                  type="button"
                  className="register-link"
                  onClick={() => {
                    setIsForgotMode(false)
                    setErrorMsg('')
                  }}
                  style={{ touchAction: 'manipulation' }}
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

export default SignIn