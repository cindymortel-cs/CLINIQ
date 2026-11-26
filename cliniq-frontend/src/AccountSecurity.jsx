import { useState, useEffect } from 'react'
import { cliniqApi } from './api/cliniqApi'
import PasswordInput from './PasswordInput'

function AccountSecurity({
  userId,
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile,
  onSignOut,
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const isAndroidApp =
    typeof window !== 'undefined' &&
    (Boolean(window.Capacitor) || /Android/i.test(navigator.userAgent))

  const deviceName = isAndroidApp
    ? 'Android Mobile Device'
    : 'Current Browser Session'

  const [devices, setDevices] = useState([deviceName])

  useEffect(() => {
    if (!userId) return
    let active = true

    const syncDevices = async () => {
      try {
        const res = await cliniqApi.getUserDevices(userId, deviceName)
        if (active && Array.isArray(res?.devices) && res.devices.length > 0) {
          setDevices(res.devices)
        }
      } catch {
        // Keep local device fallback
      }
    }

    syncDevices()
    const interval = setInterval(syncDevices, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [userId, deviceName])

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword.trim() || !newPassword.trim()) {
      window.alert('Please enter both your current password and new password.')
      return
    }
    if (newPassword.length < 4) {
      window.alert('New password must be at least 4 characters.')
      return
    }

    setSaving(true)
    try {
      await cliniqApi.changePassword(userId, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      window.alert('Password changed successfully!')
    } catch (err) {
      window.alert(err.message || 'Current password is incorrect.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOutAll = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out from all devices?')
    if (!confirmed) return

    try {
      if (userId) {
        await cliniqApi.signOutAllDevices(userId)
      }
    } catch {
      // Proceed with local sign out
    }
    if (onSignOut) {
      onSignOut()
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
    <div className="mobile-screen" style={{ minHeight: '100vh', background: '#fff5f5', paddingBottom: '90px' }}>
      <div
        onClick={onBack}
        style={{
          background: '#fde8e8',
          padding: '14px 18px',
          color: '#8b0000',
          fontWeight: 700,
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
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
        <span>Account &amp; Security</span>
      </div>

      <div style={{ padding: '18px' }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '28px', lineHeight: 1.15 }}>
          Account &amp;
          <br />
          <span style={{ color: '#8b0000' }}>Security</span>
        </h1>

        <form
          onSubmit={handleSavePassword}
          style={{
            background: '#fde8e8',
            border: '1.5px solid #8b0000',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '18px',
          }}
        >
          <h3 style={{ margin: '0 0 4px', color: '#8b0000', fontSize: '16px' }}>
            Change Password
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#555' }}>
            Update your password regularly to keep your account secure.
          </p>

          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
            Current Password
          </label>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            style={inputStyle}
          />

          <label
            style={{
              fontSize: '12px',
              fontWeight: 700,
              display: 'block',
              marginTop: '10px',
              marginBottom: '4px',
            }}
          >
            New Password
          </label>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: '14px',
              width: '100%',
              background: '#8b0000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>

        <div
          style={{
            background: '#fde8e8',
            border: '1.5px solid #8b0000',
            borderRadius: '14px',
            padding: '16px',
          }}
        >
          <h3 style={{ margin: '0 0 4px', color: '#8b0000', fontSize: '16px' }}>
            Manage Devices
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#555' }}>
            Review devices currently signed in to your account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {devices.map((itemName) => (
              <div
                key={itemName}
                style={{
                  background: '#fff',
                  border: '1px solid #8b0000',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{itemName}</div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                    Active now • Clinic Wi-Fi
                  </div>
                </div>

                {itemName === deviceName && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#8b0000',
                      background: '#fde8e8',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    This device
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSignOutAll}
            style={{
              width: '100%',
              background: '#8b0000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Sign out from all devices
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
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
          const isActive = tab.key === 'profile'
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

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #8b0000',
  fontSize: '14px',
  background: '#fff',
}

export default AccountSecurity