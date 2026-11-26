import { useState, useEffect } from 'react'
import { cliniqApi } from './api/cliniqApi'
import PasswordInput from './PasswordInput'
import './StaffSettings.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

const staffRoles = [
  'Clinic Staff',
  'Receptionist',
  'Nurse',
  'Administrator'
]

function getDeviceDetails() {
  if (typeof navigator === 'undefined') return 'Clinic Desktop Session'
  const ua = navigator.userAgent

  let os = 'Desktop'
  if (/Windows NT 10\.0/i.test(ua)) os = 'Windows 10/11'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS'

  let browser = 'Browser'
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge'
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  return `${browser} on ${os}`
}

function StaffSettings({ staffUser, onUpdateUser, onRefresh, onNavigate, onProfile }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Clinic Staff')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [isResetMode, setIsResetMode] = useState(false)

  const deviceName = getDeviceDetails()
  const [devices, setDevices] = useState([deviceName])

  // Load saved values mula sa staffUser at localStorage backup
  useEffect(() => {
    let localExtra = {}
    try {
      const raw = localStorage.getItem('cliniq_staff_settings_extra')
      if (raw) localExtra = JSON.parse(raw)
    } catch {
      localExtra = {}
    }

    if (staffUser) {
      setFullName(staffUser.fullName || localExtra.fullName || '')
      setEmail(staffUser.email || localExtra.email || '')
      setRole(staffUser.position || localExtra.position || 'Clinic Staff')
      setPhotoPreview(staffUser.profilePhoto || localExtra.profilePhoto || null)
    } else if (Object.keys(localExtra).length > 0) {
      setFullName(localExtra.fullName || '')
      setEmail(localExtra.email || '')
      setRole(localExtra.position || 'Clinic Staff')
      setPhotoPreview(localExtra.profilePhoto || null)
    }
  }, [staffUser])

  // Sync active staff devices mula sa Ktor backend
  useEffect(() => {
    const targetId = staffUser?.id || 1
    let active = true

    const syncDevices = async () => {
      try {
        const res = await cliniqApi.getUserDevices(targetId, deviceName)
        if (active && Array.isArray(res?.devices) && res.devices.length > 0) {
          setDevices(res.devices)
        }
      } catch {
        // Fallback to local current device
      }
    }

    syncDevices()
    const interval = setInterval(syncDevices, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [staffUser?.id, deviceName])

  const handleNavigation = (page) => {
    if (page === 'Settings') return
    if (onNavigate) {
      onNavigate(page.toLowerCase())
    }
  }

  const handleProfile = () => {
    if (onProfile) {
      onProfile()
    }
  }

  // Helper para mag-save sa MySQL + localStorage + parent state
  const persistStaffAccount = async (overrides = {}) => {
    const nextFullName = (overrides.fullName ?? fullName).trim() || staffUser?.fullName || 'Clinic Staff'
    const nextEmail = (overrides.email ?? email).trim()
    const nextRole = overrides.position ?? (role || 'Clinic Staff')
    const nextPhoto = overrides.profilePhoto !== undefined ? overrides.profilePhoto : (photoPreview || '')

    try {
      localStorage.setItem(
        'cliniq_staff_settings_extra',
        JSON.stringify({
          fullName: nextFullName,
          email: nextEmail,
          position: nextRole,
          profilePhoto: nextPhoto,
        })
      )
    } catch {
      // ignore storage quota issues
    }

    const targetId = staffUser?.id || 1
    const savedUser = await cliniqApi.updateProfile(targetId, {
      fullName: nextFullName,
      email: nextEmail,
      position: nextRole,
      profilePhoto: nextPhoto,
    })

    const mergedUser = {
      ...(staffUser || {}),
      ...(savedUser || {}),
      fullName: nextFullName,
      email: nextEmail,
      position: nextRole,
      profilePhoto: nextPhoto,
    }

    if (onUpdateUser) {
      onUpdateUser(mergedUser)
    }
    if (onRefresh) {
      await onRefresh()
    }
    return mergedUser
  }

  // Auto-save agad ang photo sa MySQL at state pagkapili ng image
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setNotice('Please choose an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        let width = img.width
        let height = img.height
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78)

        setPhotoPreview(compressedDataUrl)
        setSavingAccount(true)
        try {
          await persistStaffAccount({ profilePhoto: compressedDataUrl })
          setNotice('Profile photo updated and saved!')
        } catch (err) {
          setNotice(err.message || 'Photo updated locally, failed to sync to server.')
        } finally {
          setSavingAccount(false)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Save Account Information (Full Name, Email Address, Role, Photo)
  const handleSaveAccount = async (event) => {
    event.preventDefault()

    if (!fullName.trim()) {
      setNotice('Please enter your Full Name.')
      return
    }

    setSavingAccount(true)
    try {
      await persistStaffAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        position: role || 'Clinic Staff',
        profilePhoto: photoPreview || '',
      })
      setNotice('Account information saved successfully!')
    } catch (err) {
      setNotice(err.message || 'Failed to save account changes.')
    } finally {
      setSavingAccount(false)
    }
  }

  // Change Password or Reset Password in MySQL
  const handleUpdatePassword = async (event) => {
    event.preventDefault()

    const form = event.currentTarget
    const next = form.elements.newPassword.value

    if (isResetMode) {
      const staffIdentifier =
        form.elements.staffIdentifier?.value?.trim() ||
        staffUser?.staffUsername ||
        staffUser?.employeeId ||
        ''

      if (!staffIdentifier || !next) {
        setNotice('Please enter your Staff ID and new password.')
        return
      }
      if (next.length < 4) {
        setNotice('New password must be at least 4 characters.')
        return
      }

      setSavingPassword(true)
      try {
        await cliniqApi.resetPassword(staffIdentifier, next)
        form.reset()
        setIsResetMode(false)
        setNotice('Staff password reset successfully!')
      } catch (err) {
        setNotice(err.message || 'Unable to reset staff password.')
      } finally {
        setSavingPassword(false)
      }
      return
    }

    const current = form.elements.currentPassword.value

    if (!current || !next) {
      setNotice('Please fill in both password fields.')
      return
    }

    if (next.length < 4) {
      setNotice('New password must be at least 4 characters.')
      return
    }

    setSavingPassword(true)
    try {
      const targetId = staffUser?.id || 1
      await cliniqApi.changePassword(targetId, current, next)
      form.reset()
      setNotice('Password updated successfully!')
    } catch (err) {
      setNotice(err.message || 'Current password is incorrect.')
    } finally {
      setSavingPassword(false)
    }
  }

  // Sign Out from All Devices
  const handleSignOutDevices = async () => {
    const confirmed = window.confirm('Sign out from all active staff devices?')
    if (!confirmed) return

    try {
      const targetId = staffUser?.id || 1
      await cliniqApi.signOutAllDevices(targetId)
    } catch {
      // Proceed with local sign out
    }

    if (onNavigate) {
      localStorage.removeItem('cliniq_staff_settings_extra')
      onNavigate('signout')
    }
  }

  return (
    <div className="staff-settings-screen">
      {/* LEFT SIDEBAR */}
      <aside className="staff-settings-sidebar">
        <div className="staff-settings-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-settings-logo"
          />
        </div>

        <nav className="staff-settings-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Settings'
                  ? 'staff-settings-menu-item active'
                  : 'staff-settings-menu-item'
              }
              aria-current={item === 'Settings' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* RIGHT MAIN AREA */}
      <div className="staff-settings-main">
        <header className="staff-settings-topbar">
          <button
            type="button"
            className="staff-settings-profile"
            onClick={handleProfile}
            aria-label="Staff profile"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Staff"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid white',
                }}
              />
            ) : (
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <circle cx="17" cy="17" r="16" stroke="white" strokeWidth="1.5" />
                <circle cx="17" cy="12" r="6" fill="white" />
                <path d="M6 29 C6 19 28 19 28 29" fill="white" />
              </svg>
            )}
          </button>
        </header>

        <main className="staff-settings-content">
          <h1 className="staff-settings-title">Settings</h1>

          <p className="staff-settings-subtitle">
            Manage your account preferences and system settings.
          </p>

          {/* ACCOUNT INFORMATION CARD */}
          <section className="staff-settings-account-card">
            <h2>Account Information</h2>

            <div className="staff-settings-account-layout">
              {/* LEFT: PROFILE PHOTO */}
              <div className="staff-settings-photo-section">
                <div className="staff-settings-avatar">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Staff profile"
                      className="staff-settings-avatar-image"
                    />
                  ) : (
                    <svg viewBox="0 0 120 120" width="120" height="120" fill="none" aria-hidden="true">
                      <circle cx="60" cy="60" r="56" stroke="#b00000" strokeWidth="4" />
                      <circle cx="60" cy="45" r="23" fill="#b00000" />
                      <path d="M20 101C23 74 36 68 60 68C84 68 97 74 100 101" fill="#b00000" />
                    </svg>
                  )}
                </div>

                <label
                  htmlFor="staff-settings-photo-upload"
                  className="staff-settings-change-photo"
                >
                  Change Photo
                </label>

                <input
                  id="staff-settings-photo-upload"
                  type="file"
                  accept="image/*"
                  className="staff-settings-photo-input"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* RIGHT: ACCOUNT DETAILS */}
              <form
                className="staff-settings-account-form"
                onSubmit={handleSaveAccount}
              >
                <div className="staff-settings-field">
                  <label htmlFor="staff-settings-name">Full Name</label>
                  <input
                    id="staff-settings-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="staff-settings-field">
                  <label htmlFor="staff-settings-email">Email Address</label>
                  <input
                    id="staff-settings-email"
                    type="email"
                    placeholder="Enter staff email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="staff-settings-field">
                  <label htmlFor="staff-settings-role">Role</label>
                  <select
                    id="staff-settings-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                  >
                    <option value="">Select role</option>
                    {staffRoles.map((staffRole) => (
                      <option key={staffRole} value={staffRole}>
                        {staffRole}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="staff-settings-save"
                  disabled={savingAccount}
                >
                  {savingAccount ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </section>

          {/* TWO BOTTOM CARDS */}
          <div className="staff-settings-bottom-grid">
            {/* CHANGE / RESET PASSWORD CARD */}
            <section className="staff-settings-password-card">
              <h2>{isResetMode ? 'Reset Password' : 'Change Password'}</h2>

              <form onSubmit={handleUpdatePassword} autoComplete="off">
                {isResetMode ? (
                  <div className="staff-settings-field">
                    <label htmlFor="staff-settings-identifier">
                      Staff ID / Username
                    </label>
                    <input
                      id="staff-settings-identifier"
                      name="staffIdentifier"
                      type="text"
                      defaultValue={staffUser?.staffUsername || staffUser?.employeeId || ''}
                      autoComplete="off"
                    />
                  </div>
                ) : (
                  <div className="staff-settings-field">
                    <label htmlFor="staff-settings-current-password">
                      Current Password
                    </label>
                    <PasswordInput
                      id="staff-settings-current-password"
                      name="currentPassword"
                      autoComplete="off"
                    />
                  </div>
                )}

                <div className="staff-settings-field">
                  <label htmlFor="staff-settings-new-password">
                    New Password
                  </label>
                  <PasswordInput
                    id="staff-settings-new-password"
                    name="newPassword"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="button"
                  className="staff-settings-forgot"
                  onClick={() => {
                    setNotice('')
                    setIsResetMode((prev) => !prev)
                  }}
                >
                  {isResetMode ? 'Back to Change Password' : 'Forgot password?'}
                </button>

                <button
                  type="submit"
                  className="staff-settings-update-password"
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? 'Updating...'
                    : isResetMode
                      ? 'Reset Password'
                      : 'Update Password'}
                </button>
              </form>
            </section>

            {/* MANAGE DEVICES CARD */}
            <section className="staff-settings-devices-card">
              <h2>Manage Devices</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {devices.map((itemName) => (
                  <div key={itemName} className="staff-settings-device" style={{ marginBottom: 0 }}>
                    <svg viewBox="0 0 36 30" width="36" height="30" fill="none" aria-hidden="true">
                      <rect x="5" y="3" width="26" height="20" stroke="#222" strokeWidth="1.5" />
                      <path d="M2 26H34L32 28H4L2 26Z" fill="#555" />
                    </svg>

                    <div className="staff-settings-device-info" style={{ flex: 1 }}>
                      <strong>{itemName}</strong>
                      <p style={{ color: '#15803d', fontWeight: 600 }}>
                        Active session • Connected to clinic server
                      </p>
                    </div>

                    {itemName === deviceName && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#8b0000',
                          backgroundColor: '#fde8e8',
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
                className="staff-settings-signout-devices"
                onClick={handleSignOutDevices}
              >
                Sign Out from All Devices
              </button>
            </section>
          </div>

          {notice && (
            <p className="staff-settings-notice" role="status">
              {notice}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffSettings