import { useState, useEffect, useRef } from 'react'

function PersonalInformation({
  accountType = 'student',
  registrationData = {},
  onBack,
  onHome,
  onQueue,
  onVisits,
  onProfile,
  onSaveChanges,
}) {
  const fileInputRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    srCode: '',
    collegeDepartment: '',
    yearLevel: '',
    contactNumber: '',
    applicationNumber: '',
    seniorHighSchool: '',
    programAppliedFor: '',
    campus: '',
    employeeId: '',
    officeDepartment: '',
    position: '',
    profilePhoto: '',
  })

  useEffect(() => {
    setFormData({
      fullName: registrationData.fullName || '',
      srCode: registrationData.srCode || '',
      collegeDepartment: registrationData.collegeDepartment || registrationData.college || '',
      yearLevel: registrationData.yearLevel || '',
      contactNumber: registrationData.contactNumber || '',
      applicationNumber: registrationData.applicationNumber || '',
      seniorHighSchool: registrationData.seniorHighSchool || '',
      programAppliedFor: registrationData.programAppliedFor || registrationData.programApplied || '',
      campus: registrationData.campus || '',
      employeeId: registrationData.employeeId || '',
      officeDepartment: registrationData.officeDepartment || registrationData.collegeDepartment || '',
      position: registrationData.position || '',
      profilePhoto: registrationData.profilePhoto || '',
    })
  }, [registrationData])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75)
        handleChange('profilePhoto', compressedDataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      window.alert('Full name is required.')
      return
    }
    setSaving(true)
    try {
      const deptValue =
        accountType === 'personnel'
          ? String(formData.officeDepartment || formData.collegeDepartment || '')
          : String(formData.collegeDepartment || '')
      const programValue = String(formData.programAppliedFor || '')

      const cleanPayload = {
        fullName: String(formData.fullName || ''),
        srCode: String(formData.srCode || ''),
        college: deptValue,
        collegeDepartment: deptValue,
        officeDepartment: deptValue,
        yearLevel: String(formData.yearLevel || ''),
        contactNumber: String(formData.contactNumber || ''),
        applicationNumber: String(formData.applicationNumber || ''),
        seniorHighSchool: String(formData.seniorHighSchool || ''),
        programApplied: programValue,
        programAppliedFor: programValue,
        campus: String(formData.campus || ''),
        employeeId: String(formData.employeeId || ''),
        position: String(formData.position || ''),
        profilePhoto: String(formData.profilePhoto || ''),
      }
      await onSaveChanges(cleanPayload)
    } finally {
      setSaving(false)
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
        <span>Edit profile</span>
      </div>

      <div style={{ padding: '18px' }}>
        <h1 style={{ margin: '0 0 16px', fontSize: '28px', lineHeight: 1.15 }}>
          Personal
          <br />
          <span style={{ color: '#8b0000' }}>Information</span>
        </h1>

        <div
          style={{
            background: '#fff',
            border: '1.5px solid #8b0000',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#8b0000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontWeight: 700,
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (formData.fullName || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
              {formData.fullName || 'User'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#8b0000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Change Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              style={inputStyle}
            />
          </div>

          {accountType === 'student' && (
            <>
              <div>
                <label style={labelStyle}>SR-Code</label>
                <input
                  type="text"
                  value={formData.srCode}
                  onChange={(e) => handleChange('srCode', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>College / Department</label>
                <input
                  type="text"
                  value={formData.collegeDepartment}
                  onChange={(e) => handleChange('collegeDepartment', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Year level</label>
                <input
                  type="text"
                  value={formData.yearLevel}
                  onChange={(e) => handleChange('yearLevel', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Contact number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {accountType === 'applicant' && (
            <>
              <div>
                <label style={labelStyle}>Application number</label>
                <input
                  type="text"
                  value={formData.applicationNumber}
                  onChange={(e) => handleChange('applicationNumber', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Senior high school</label>
                <input
                  type="text"
                  value={formData.seniorHighSchool}
                  onChange={(e) => handleChange('seniorHighSchool', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Program applied for</label>
                <input
                  type="text"
                  value={formData.programAppliedFor}
                  onChange={(e) => handleChange('programAppliedFor', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Contact number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Campus</label>
                <input
                  type="text"
                  value={formData.campus}
                  onChange={(e) => handleChange('campus', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {accountType === 'personnel' && (
            <>
              <div>
                <label style={labelStyle}>Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Office / Department</label>
                <input
                  type="text"
                  value={formData.officeDepartment}
                  onChange={(e) => handleChange('officeDepartment', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Contact number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: '10px',
              background: '#8b0000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
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

const labelStyle = { fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #8b0000',
  fontSize: '14px',
  background: '#fff',
}

export default PersonalInformation