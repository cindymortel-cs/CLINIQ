import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './StaffPriority.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

function StaffPriority({
  patient = {
    id: null,
    ticket: '—',
    patient: 'No patient selected',
    service: '—'
  },
  staffUser,
  onRefresh,
  onNavigate,
  onProfile,
  onConfirm
}) {
  const [priority, setPriority] = useState(
    patient.priority === 'Urgent' || patient.urgentNote?.trim() ? 'Urgent' : 'Regular'
  )
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  let staffPhoto = staffUser?.profilePhoto || null
  if (!staffPhoto) {
    try {
      const saved = JSON.parse(localStorage.getItem('cliniq_staff_settings_extra') || '{}')
      staffPhoto = saved.profilePhoto || null
    } catch {
      staffPhoto = null
    }
  }

  const handleNavigation = (page) => {
    if (onNavigate) onNavigate(page.toLowerCase())
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  const handleConfirm = async () => {
    if (!patient.id) {
      setNotice('Please select a patient from the Queue screen first.')
      return
    }
    setSaving(true)
    try {
      await cliniqApi.setPriority(patient.id, priority.toUpperCase(), patient.urgentNote || '')
      if (onRefresh) await onRefresh()
      if (onConfirm) {
        onConfirm(priority)
      } else if (onNavigate) {
        onNavigate('queue')
      }
    } catch (err) {
      setNotice(err.message || 'Failed to update priority.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="staff-priority-screen">
      <aside className="staff-priority-sidebar">
        <div className="staff-priority-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-priority-logo"
          />
        </div>

        <nav className="staff-priority-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Queue'
                  ? 'staff-priority-menu-item active'
                  : 'staff-priority-menu-item'
              }
              aria-current={item === 'Queue' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="staff-priority-main">
        <header className="staff-priority-topbar">
          <button
            type="button"
            className="staff-priority-profile"
            onClick={handleProfile}
            aria-label="Staff profile"
          >
            {staffPhoto ? (
              <img
                src={staffPhoto}
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

        <main className="staff-priority-content">
          <h1 className="staff-priority-title">
            Mark Urgent <span>Priority</span>
          </h1>

          <p className="staff-priority-subtitle">
            Staff action requires confirmation.
          </p>

          <section className="staff-priority-card">
            <h2 className="staff-priority-patient">
              Patient: {patient.ticket} – {patient.patient}
            </h2>

            <p className="staff-priority-service">
              Service: {patient.service}
            </p>

            {patient.urgentNote?.trim() && (
              <p className="staff-priority-urgent-note">
                <strong>Urgent Note:</strong>
                <span>{patient.urgentNote}</span>
              </p>
            )}

            <div className="staff-priority-divider" />

            <label
              className={
                priority === 'Urgent'
                  ? 'staff-priority-option selected'
                  : 'staff-priority-option'
              }
            >
              <input
                type="radio"
                name="patient-priority"
                value="Urgent"
                checked={priority === 'Urgent'}
                onChange={() => {
                  setPriority('Urgent')
                  setNotice('')
                }}
              />

              <span className="staff-priority-option-content">
                <strong>Urgent priority</strong>
                <span>Move ahead of regular waiting tickets</span>
              </span>
            </label>

            <label
              className={
                priority === 'Regular'
                  ? 'staff-priority-option selected'
                  : 'staff-priority-option'
              }
            >
              <input
                type="radio"
                name="patient-priority"
                value="Regular"
                checked={priority === 'Regular'}
                onChange={() => {
                  setPriority('Regular')
                  setNotice('')
                }}
              />

              <span className="staff-priority-option-content">
                <strong>Regular</strong>
                <span>Keep normal queue position</span>
              </span>
            </label>
          </section>

          <div className="staff-priority-actions">
            <button
              type="button"
              className="staff-priority-confirm"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : priority === 'Urgent'
                  ? 'Confirm priority override'
                  : 'Confirm regular queue'}
            </button>
          </div>

          {notice && (
            <p className="staff-priority-notice" role="status">
              {notice}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffPriority