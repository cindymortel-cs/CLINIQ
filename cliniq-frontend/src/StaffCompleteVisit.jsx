import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './StaffCompleteVisit.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

function StaffCompleteVisit({
  dashboardData,
  staffUser,
  onRefresh,
  onNavigate,
  onProfile,
  onSave
}) {
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

  const activeQueue = dashboardData?.activeQueue || []
  const servingDto =
    activeQueue.find((item) => item.status === 'NOW_SERVING') || activeQueue[0]

  const patient = servingDto
    ? {
        id: servingDto.id,
        ticket: servingDto.queueNumber,
        patient: servingDto.patientName,
        service: servingDto.serviceName,
      }
    : {
        id: null,
        ticket: 'None',
        patient: 'No active patient currently serving',
        service: '—',
      }

  const handleNavigation = (page) => {
    if (page === 'Visits') return
    if (onNavigate) onNavigate(page.toLowerCase())
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  const handleCompleteVisit = async () => {
    if (!patient.id) {
      setNotice('No active patient ticket to complete.')
      return
    }
    setSaving(true)
    try {
      await cliniqApi.completeVisit(patient.id, patient.service, 'Completed at clinic desk')
      if (onRefresh) await onRefresh()
      if (onSave) {
        onSave({ ...patient, status: 'Completed' })
      } else {
        setNotice(`Visit ${patient.ticket} (${patient.patient}) has been completed and saved.`)
      }
    } catch (err) {
      setNotice(err.message || 'Failed to complete visit.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="staff-complete-visit-screen">
      <aside className="staff-complete-visit-sidebar">
        <div className="staff-complete-visit-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-complete-visit-logo"
          />
        </div>

        <nav className="staff-complete-visit-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Visits'
                  ? 'staff-complete-visit-menu-item active'
                  : 'staff-complete-visit-menu-item'
              }
              aria-current={item === 'Visits' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="staff-complete-visit-main">
        <header className="staff-complete-visit-topbar">
          <button
            type="button"
            className="staff-complete-visit-profile"
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

        <main className="staff-complete-visit-content">
          <h1 className="staff-complete-visit-title">
            Complete <span>Visit</span>
          </h1>

          <p className="staff-complete-visit-subtitle">
            Save basic queue and visit transaction details.
          </p>

          <section className="staff-complete-visit-card">
            <h2 className="staff-complete-visit-patient">
              Ticket {patient.ticket} – {patient.patient}
            </h2>

            <div className="staff-complete-visit-field">
              <label htmlFor="staff-visit-service">Service category</label>
              <input
                id="staff-visit-service"
                type="text"
                value={patient.service}
                readOnly
              />
            </div>

            <div className="staff-complete-visit-field">
              <label htmlFor="staff-visit-status">Queue status</label>
              <input
                id="staff-visit-status"
                type="text"
                value="Completed"
                readOnly
              />
            </div>

            <p className="staff-complete-visit-note">
              Record: date/time, service and status only.
            </p>
          </section>

          <div className="staff-complete-visit-actions">
            <button
              type="button"
              className="staff-complete-visit-save"
              onClick={handleCompleteVisit}
              disabled={saving || !patient.id}
            >
              {saving ? 'Saving...' : 'Complete and Save'}
            </button>
          </div>

          {notice && (
            <div className="staff-complete-visit-notice" role="status">
              {notice}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffCompleteVisit