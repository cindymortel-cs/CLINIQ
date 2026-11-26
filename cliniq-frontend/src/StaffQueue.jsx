import { useState } from 'react'
import './StaffQueue.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

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

function StaffQueue({ dashboardData, staffUser, onNavigate, onProfile, onCallNext }) {
  const [search, setSearch] = useState('')
  const [selectedTicket, setSelectedTicket] = useState('')
  const [notice, setNotice] = useState('')

  let staffPhoto = staffUser?.profilePhoto || null
  if (!staffPhoto) {
    try {
      const saved = JSON.parse(localStorage.getItem('cliniq_staff_settings_extra') || '{}')
      staffPhoto = saved.profilePhoto || null
    } catch {
      staffPhoto = null
    }
  }

  const liveQueue = (dashboardData?.activeQueue || []).map((item) => {
    const { isAtClinic, cleanNote } = parseQueueNote(
      item.urgentNote,
      item.atClinic || item.isAtClinic
    )
    return {
      id: item.id,
      ticket: item.queueNumber,
      patient: item.patientName,
      service: item.serviceName,
      status:
        item.status === 'NOW_SERVING'
          ? 'Serving'
          : item.status === 'APPROACHING'
            ? 'Approaching'
            : 'Waiting',
      priority: item.priority === 'URGENT' ? 'Urgent' : 'Regular',
      urgentNote: cleanNote,
      isAtClinic,
    }
  })

  const filteredQueue = liveQueue.filter((person) => {
    const keyword = search.trim().toLowerCase()
    return (
      person.ticket.toLowerCase().includes(keyword) ||
      person.patient.toLowerCase().includes(keyword) ||
      person.urgentNote.toLowerCase().includes(keyword) ||
      (person.isAtClinic && 'at clinic arrived'.includes(keyword))
    )
  })

  const effectiveSelectedTicket = selectedTicket || filteredQueue[0]?.ticket || ''
  const selectedPatient = filteredQueue.find(
    (person) => person.ticket === effectiveSelectedTicket
  )

  const handleNavigation = (page) => {
    if (page === 'Queue') return
    if (onNavigate) {
      onNavigate(page.toLowerCase())
    }
  }

  const handleSelectPatient = (ticket) => {
    setSelectedTicket(ticket)
    setNotice('')
  }

  const handleOpenPriority = (person) => {
    setSelectedTicket(person.ticket)
    if (onNavigate) {
      onNavigate('priority', person)
    }
  }

  const handleCallNext = () => {
    if (onCallNext) {
      onCallNext()
    }
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  return (
    <div className="staff-queue-screen">
      <aside className="staff-queue-sidebar">
        <div className="staff-queue-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-queue-logo"
          />
        </div>

        <nav className="staff-queue-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Queue'
                  ? 'staff-queue-menu-item active'
                  : 'staff-queue-menu-item'
              }
              aria-current={item === 'Queue' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="staff-queue-main">
        <header className="staff-queue-topbar">
          <button
            type="button"
            className="staff-queue-profile"
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

        <main className="staff-queue-content">
          <h1 className="staff-queue-title">
            Queue <span>Management</span>
          </h1>

          <p className="staff-queue-subtitle">
            Select a ticket to call, prioritize or view.
          </p>

          <div className="staff-queue-toolbar">
            <input
              type="search"
              className="staff-queue-search"
              placeholder="Search by ticket, patient, or note"
              aria-label="Search by ticket or patient"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button
              type="button"
              className="staff-queue-call-next"
              onClick={handleCallNext}
            >
              Call next
            </button>
          </div>

          <div className="staff-queue-table-wrapper">
            <table className="staff-queue-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Priority</th>
                </tr>
              </thead>

              <tbody>
                {filteredQueue.map((person) => {
                  const hasNote = Boolean(person.urgentNote?.trim())
                  const isUrgent = person.priority === 'Urgent'

                  return (
                    <tr
                      key={person.ticket}
                      className={
                        effectiveSelectedTicket === person.ticket
                          ? 'staff-queue-row selected'
                          : 'staff-queue-row'
                      }
                      onClick={() => handleSelectPatient(person.ticket)}
                    >
                      <td>
                        <button
                          type="button"
                          className="staff-queue-ticket-button"
                          onClick={() => handleSelectPatient(person.ticket)}
                          aria-label={`Select ticket ${person.ticket}, ${person.patient}`}
                          aria-pressed={effectiveSelectedTicket === person.ticket}
                        >
                          {person.ticket}
                        </button>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                            <span>{person.patient}</span>
                            {person.isAtClinic && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: '#dcfce7',
                                  border: '1px solid #16a34a',
                                  color: '#15803d',
                                  borderRadius: '999px',
                                  padding: '1px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                                title="Patient confirmed arrival at the clinic"
                              >
                                ● At Clinic
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
                                border: '1px solid #990000',
                                color: '#8b0000',
                                borderRadius: '999px',
                                padding: '2px 9px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                              }}
                              title={person.urgentNote}
                            >
                              Note: {person.urgentNote}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>{person.service}</td>
                      <td>{person.status}</td>

                      <td style={{ width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenPriority(person)
                          }}
                          aria-label={`Manage priority for ${person.ticket}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '78px',
                            height: '28px',
                            padding: '0 10px',
                            borderRadius: '999px',
                            border: '1.5px solid #990000',
                            backgroundColor: isUrgent ? '#990000' : '#ffffff',
                            color: isUrgent ? '#ffffff' : '#990000',
                            fontWeight: 700,
                            fontSize: '12.5px',
                            lineHeight: 1,
                            cursor: 'pointer',
                            margin: '0 auto',
                          }}
                        >
                          {person.priority}
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan="5" className="staff-queue-empty">
                      No matching tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="staff-queue-bottom">
            {selectedPatient && (
              <div className="staff-queue-selected-banner" role="status">
                <div>
                  <strong>
                    Selected: {selectedPatient.ticket} ({selectedPatient.patient})
                  </strong>{' '}
                  {selectedPatient.isAtClinic && (
                    <span style={{ color: '#15803d', fontWeight: 700 }}>
                      — Patient is at the clinic
                    </span>
                  )}{' '}
                  – click the Priority button to override.
                </div>
                {selectedPatient.urgentNote?.trim() && (
                  <div style={{ marginTop: '4px', fontSize: '13px' }}>
                    <strong>Patient Urgent Note:</strong> “{selectedPatient.urgentNote}”
                  </div>
                )}
              </div>
            )}

            {notice && (
              <div className="staff-queue-notice" role="status">
                {notice}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default StaffQueue