import { useState, useEffect } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './StaffDashboard.css'

function parseQueueNote(rawNote, explicitArrivedFlag) {
  const noteStr = String(rawNote || '').trim()
  const hasAtClinicTag =
    Boolean(explicitArrivedFlag) ||
    /\[AT[_\s-]?CLINIC\]/i.test(noteStr) ||
    /^I['’]?m at the clinic\.?$/i.test(noteStr)

  const cleanedNote = noteStr
    .replace(/\[AT[_\s-]?CLINIC\]\s*/gi, '')
    .replace(/^I['’]?m at the clinic\.?\s*/i, '')
    .trim()

  return {
    isAtClinic: hasAtClinicTag,
    cleanNote: cleanedNote,
  }
}

function StaffDashboard({ dashboardData, staffUser, onNavigate, onProfile, onCallNext, onRefresh }) {
  const [notice, setNotice] = useState('')
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)
  const [isCheckInPaused, setIsCheckInPaused] = useState(false)
  const [pauseReason, setPauseReason] = useState('')
  const [isTogglingPause, setIsTogglingPause] = useState(false)

  useEffect(() => {
    let mounted = true
    cliniqApi
      .getQueueStatus()
      .then((res) => {
        if (!mounted || !res) return
        setIsCheckInPaused(res.paused === 'true' || res.paused === true)
        setPauseReason(res.reason || '')
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

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
  const waitingCount = dashboardData?.waitingCount ?? 0
  const nowServing = dashboardData?.nowServing || 'None'
  const urgentCount = dashboardData?.urgentCount ?? 0
  const avgWaitMinutes = dashboardData?.avgWaitMinutes ?? 0

  const queueData = activeQueue.map((item) => {
    const { isAtClinic, cleanNote } = parseQueueNote(
      item.urgentNote,
      item.atClinic || item.isAtClinic
    )
    return {
      ...item,
      id: item.id,
      ticket: item.queueNumber,
      patient: item.patientName,
      service: item.serviceName,
      urgentNote: cleanNote,
      isAtClinic,
      rawStatus: item.status,
      status:
        item.status === 'NOW_SERVING'
          ? 'Serving'
          : item.status === 'APPROACHING'
            ? 'Approaching'
            : 'Waiting',
      priority: item.priority === 'URGENT' ? 'Urgent' : 'Regular',
    }
  })

  const menuItems = [
    'Dashboard',
    'Queue',
    'Visits',
    'Reports',
    'Announcement',
    'Settings'
  ]

  const handleNavigation = (page) => {
    if (page === 'Dashboard') return

    if (onNavigate) {
      onNavigate(page.toLowerCase())
    } else {
      setNotice(`${page} screen is not connected yet.`)
    }
  }

  const handleRowClick = (patient) => {
    if (!onNavigate) return
    if (patient.rawStatus === 'NOW_SERVING') {
      onNavigate('visits', patient)
    } else {
      onNavigate('priority', patient)
    }
  }

  const handleCallNext = () => {
    if (onCallNext) {
      onCallNext()
    } else {
      setNotice('Call Next Patient screen is not connected yet.')
    }
  }

  const handleMarkNoShow = async () => {
    if (!nowServing || nowServing === 'None' || isMarkingNoShow) return

    const confirmed = window.confirm(
      `Mark ticket ${nowServing} as No-Show and call the next patient?`
    )
    if (!confirmed) return

    setIsMarkingNoShow(true)
    setNotice('')
    try {
      const data = await cliniqApi.markNoShow()
      setNotice(data?.message || `Ticket ${nowServing} marked as No-Show.`)
      if (onRefresh) {
        await onRefresh()
      }
    } catch (err) {
      setNotice(err.message || 'Failed to mark patient as No-Show.')
    } finally {
      setIsMarkingNoShow(false)
    }
  }

  const handleToggleCheckInStatus = async () => {
    if (isTogglingPause) return
    const nextPausedState = !isCheckInPaused

    let reasonInput = undefined
    if (nextPausedState) {
      const entered = window.prompt(
        'Enter cut-off reason for patients (leave blank for default):',
        'Clinic check-ins have reached daily cut-off. Please check back during the next clinic schedule.'
      )
      if (entered === null) return
      reasonInput = entered.trim()
    }

    setIsTogglingPause(true)
    setNotice('')
    try {
      const res = await cliniqApi.setQueueStatus(nextPausedState, reasonInput)
      setIsCheckInPaused(res.paused === 'true' || res.paused === true)
      setPauseReason(res.reason || '')
      setNotice(res.message || (nextPausedState ? 'Clinic check-in cut-off enabled.' : 'Clinic check-in resumed.'))
    } catch (err) {
      setNotice(err.message || 'Failed to update clinic check-in status.')
    } finally {
      setIsTogglingPause(false)
    }
  }

  const handleProfile = () => {
    if (onProfile) {
      onProfile()
    } else if (onNavigate) {
      onNavigate('settings')
    }
  }

  return (
    <div className="staff-dashboard-screen">
      {/* Sidebar */}
      <aside className="staff-dashboard-sidebar">
        <div className="staff-dashboard-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-dashboard-logo"
          />
        </div>

        <nav className="staff-dashboard-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Dashboard'
                  ? 'staff-dashboard-menu-item active'
                  : 'staff-dashboard-menu-item'
              }
              aria-current={item === 'Dashboard' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Right Side of Dashboard */}
      <div className="staff-dashboard-main">
        <header className="staff-dashboard-topbar">
          <button
            type="button"
            className="staff-dashboard-profile"
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

        <main className="staff-dashboard-content">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h1 className="staff-dashboard-title">
                Staff <span>Dashboard</span>
              </h1>
              <p className="staff-dashboard-subtitle">
                Manage live patient queue and visits.
              </p>
            </div>

            {/* Clinic Cut-Off Check-In Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #990000',
                borderRadius: '14px',
                padding: '10px 16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                  Check-In Status
                </span>
                <strong
                  style={{
                    fontSize: '14px',
                    color: isCheckInPaused ? '#990000' : '#15803d',
                  }}
                >
                  {isCheckInPaused ? 'CUT-OFF' : 'OPEN (Accepting)'}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleToggleCheckInStatus}
                disabled={isTogglingPause}
                aria-pressed={isCheckInPaused}
                style={{
                  backgroundColor: isCheckInPaused ? '#990000' : '#ffffff',
                  color: isCheckInPaused ? '#ffffff' : '#990000',
                  border: '1.5px solid #990000',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isTogglingPause ? 'not-allowed' : 'pointer',
                }}
              >
                {isTogglingPause
                  ? 'Updating...'
                  : isCheckInPaused
                    ? 'Resume Check-In'
                    : 'Cut-Off'}
              </button>
            </div>
          </div>

          {isCheckInPaused && (
            <div
              role="status"
              style={{
                marginTop: '6px',
                marginBottom: '22px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ffe0e0',
                border: '1.5px solid #990000',
                color: '#8b0000',
                fontSize: '13.5px',
                fontWeight: 700,
              }}
            >
              Clinic Cut-Off Active: {pauseReason}
            </div>
          )}

          {/* Statistics Cards */}
          <section className="staff-dashboard-stats" aria-label="Queue statistics">
            <div className="staff-dashboard-stat-card">
              <h3>Waiting</h3>
              <strong>{waitingCount}</strong>
            </div>

            <div className="staff-dashboard-stat-card">
              <h3>Now serving</h3>
              <strong>{nowServing}</strong>
            </div>

            <div className="staff-dashboard-stat-card">
              <h3>Priority</h3>
              <strong>{urgentCount}</strong>
            </div>

            <div className="staff-dashboard-stat-card">
              <h3>Avg. wait</h3>
              <strong>~ {avgWaitMinutes} min</strong>
            </div>
          </section>

          {/* Call Next & Mark No-Show Buttons */}
          <div
            className="staff-dashboard-actions"
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <button
              type="button"
              className="staff-dashboard-call-next"
              onClick={handleCallNext}
            >
              Call next
            </button>

            {nowServing && nowServing !== 'None' && (
              <button
                type="button"
                className="staff-dashboard-call-next"
                onClick={handleMarkNoShow}
                disabled={isMarkingNoShow}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#990000',
                  border: '1.5px solid #990000',
                  cursor: isMarkingNoShow ? 'not-allowed' : 'pointer',
                  opacity: isMarkingNoShow ? 0.7 : 1,
                }}
              >
                {isMarkingNoShow ? 'Marking No-Show...' : 'Mark No-Show'}
              </button>
            )}
          </div>

          {/* Live Queue Table */}
          <section className="staff-dashboard-queue">
            <h2>Live queue</h2>

            <div className="staff-dashboard-table-wrapper">
              <table className="staff-dashboard-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {queueData.length > 0 ? (
                    queueData.map((patient) => {
                      const hasNote = Boolean(patient.urgentNote?.trim())
                      return (
                        <tr
                          key={patient.ticket}
                          className="staff-dashboard-clickable-row"
                          tabIndex={0}
                          role="button"
                          aria-label={
                            patient.rawStatus === 'NOW_SERVING'
                              ? `Complete visit for ${patient.ticket} ${patient.patient}`
                              : `Check priority for ${patient.ticket} ${patient.patient}`
                          }
                          onClick={() => handleRowClick(patient)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleRowClick(patient)
                            }
                          }}
                        >
                          <td>{patient.ticket}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                                <span>{patient.patient}</span>
                                {patient.isAtClinic && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      backgroundColor: '#dcfce7',
                                      border: '1.5px solid #16a34a',
                                      color: '#15803d',
                                      borderRadius: '999px',
                                      padding: '1px 9px',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                    }}
                                    title="Patient confirmed arrival at the clinic"
                                  >
                                    ● At the Clinic
                                  </span>
                                )}
                              </div>
                              {hasNote && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    alignSelf: 'flex-start',
                                    backgroundColor: '#ffe0e0',
                                    border: '1.5px solid #990000',
                                    color: '#8b0000',
                                    borderRadius: '999px',
                                    padding: '2px 10px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Urgent Note: {patient.urgentNote}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{patient.service}</td>
                          <td>{patient.status}</td>
                          <td>{patient.priority}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>
                        No active patients in queue today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {notice && (
            <p className="staff-dashboard-notice" role="status">
              {notice}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffDashboard