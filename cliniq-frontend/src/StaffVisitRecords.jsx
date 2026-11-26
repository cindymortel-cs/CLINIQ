import { useState, useMemo } from 'react'
import './StaffVisitRecords.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

function generateExpectedSlipCode(record) {
  const rawQueue = String(record?.queueNumber || record?.ticket || '000')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
  const rawId = String(record?.patientIdentifier || record?.studentId || record?.id || 'CLQ')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(-4)
  const rawDate = String(record?.queueDate || record?.date || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6)
  return `CLQ-${rawQueue}-${rawId || 'VER'}-${rawDate || '2026'}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function normalizeRecordDateToIso(dateStr) {
  if (!dateStr) return ''
  const trimmed = String(dateStr).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return ''
}

function getTodayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function StaffVisitRecords({ records = [], staffUser, onNavigate, onProfile }) {
  const [notice, setNotice] = useState('')
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)

  // Date & Status filters (default: today's date, with quick button for All Dates)
  const todayIso = useMemo(() => getTodayIso(), [])
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [statusFilter, setStatusFilter] = useState('ALL')

  let staffPhoto = staffUser?.profilePhoto || null
  if (!staffPhoto) {
    try {
      const saved = JSON.parse(localStorage.getItem('cliniq_staff_settings_extra') || '{}')
      staffPhoto = saved.profilePhoto || null
    } catch {
      staffPhoto = null
    }
  }

  const allVisitRecords = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        id: r.id,
        ticket: r.queueNumber,
        service: r.serviceName,
        date: r.queueDate,
        isoDate: normalizeRecordDateToIso(r.queueDate),
        patientName: r.patientName || r.fullName || 'Student / Patient',
        patientIdentifier: r.patientIdentifier || r.studentId || '',
        checkedInAt: r.checkedInAt || '',
        completedAt: r.completedAt || '',
        staffNotes: r.staffNotes || '',
        slipCode: generateExpectedSlipCode(r),
        rawStatus: String(r.status || '').toUpperCase(),
        status:
          r.status === 'COMPLETED'
            ? 'Completed'
            : r.status === 'CANCELLED'
              ? 'Cancelled'
              : r.status === 'NOW_SERVING'
                ? 'Now serving'
                : 'In queue',
      })),
    [records]
  )

  const filteredRecords = useMemo(() => {
    return allVisitRecords.filter((rec) => {
      const matchesDate = !selectedDate || rec.isoDate === selectedDate
      const matchesStatus =
        statusFilter === 'ALL' || rec.rawStatus === statusFilter
      return matchesDate && matchesStatus
    })
  }, [allVisitRecords, selectedDate, statusFilter])

  const handleVerifySlip = (e) => {
    e.preventDefault()
    const cleaned = verifyInput.trim().toUpperCase()
    if (!cleaned) {
      setVerifyResult({
        valid: false,
        message: 'Please enter or paste a Verification Reference Code first (e.g., CLQ-A004-9850-NOV262).',
      })
      return
    }

    const parts = cleaned.split('-')
    const ticketToken = parts[1] || cleaned

    const matched = allVisitRecords.find(
      (rec) =>
        rec.slipCode === cleaned ||
        String(rec.ticket || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase() === ticketToken
    )

    if (!matched) {
      setVerifyResult({
        valid: false,
        message: `No clinic record found for code "${cleaned}".`,
      })
      return
    }

    if (matched.rawStatus !== 'COMPLETED') {
      setVerifyResult({
        valid: false,
        message: `Ticket ${matched.ticket} is currently marked as "${matched.status}" (not yet Completed).`,
      })
      return
    }

    setVerifyResult({
      valid: true,
      record: matched,
    })
  }

  const handleExportExcelTable = () => {
    if (filteredRecords.length === 0) {
      setNotice('No records available for the selected filter or date to export.')
      setTimeout(() => setNotice(''), 3000)
      return
    }

    const dateLabel = selectedDate ? selectedDate : 'All-Dates'

    const tableRowsHtml = filteredRecords
      .map((rec, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : '#fff7f7'
        const slipValue = rec.rawStatus === 'COMPLETED' ? rec.slipCode : 'N/A'
        return `
          <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #990000; padding: 8px; text-align: center; font-weight: bold;">${escapeHtml(rec.ticket)}</td>
            <td style="border: 1px solid #990000; padding: 8px;">${escapeHtml(rec.date)}</td>
            <td style="border: 1px solid #990000; padding: 8px;">${escapeHtml(rec.patientName)}</td>
            <td style="border: 1px solid #990000; padding: 8px; text-align: center;">${escapeHtml(rec.patientIdentifier || 'N/A')}</td>
            <td style="border: 1px solid #990000; padding: 8px;">${escapeHtml(rec.service)}</td>
            <td style="border: 1px solid #990000; padding: 8px; text-align: center; font-weight: bold;">${escapeHtml(rec.status)}</td>
            <td style="border: 1px solid #990000; padding: 8px; text-align: center;">${escapeHtml(rec.checkedInAt || '-')}</td>
            <td style="border: 1px solid #990000; padding: 8px; text-align: center;">${escapeHtml(rec.completedAt || '-')}</td>
            <td style="border: 1px solid #990000; padding: 8px;">${escapeHtml(rec.staffNotes || '-')}</td>
            <td style="border: 1px solid #990000; padding: 8px; font-family: monospace;">${escapeHtml(slipValue)}</td>
          </tr>
        `
      })
      .join('')

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">
            <thead>
              <tr>
                <th colspan="10" style="background-color: #990000; color: #ffffff; font-size: 15px; padding: 12px; text-align: left; border: 1px solid #990000;">
                  CLINIQ — University Clinic Consultation Logbook (${selectedDate ? `Date: ${escapeHtml(selectedDate)}` : 'All Dates'})
                </th>
              </tr>
              <tr style="background-color: #ffe5e5; color: #990000; font-weight: bold;">
                <th style="border: 1px solid #990000; padding: 8px;">Queue Number</th>
                <th style="border: 1px solid #990000; padding: 8px;">Date</th>
                <th style="border: 1px solid #990000; padding: 8px;">Patient Name</th>
                <th style="border: 1px solid #990000; padding: 8px;">ID / SR-CODE</th>
                <th style="border: 1px solid #990000; padding: 8px;">Service</th>
                <th style="border: 1px solid #990000; padding: 8px;">Status</th>
                <th style="border: 1px solid #990000; padding: 8px;">Check-In Time</th>
                <th style="border: 1px solid #990000; padding: 8px;">Completed Time</th>
                <th style="border: 1px solid #990000; padding: 8px;">Staff Remarks</th>
                <th style="border: 1px solid #990000; padding: 8px;">Verification Code</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob(['\uFEFF' + excelHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `CLINIQ_Consultation_Logbook_${dateLabel}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setNotice(
      `Exported ${filteredRecords.length} record(s) (${selectedDate || 'All Dates'}) as an Excel table.`
    )
    setTimeout(() => setNotice(''), 3500)
  }

  const handleNavigation = (page) => {
    if (page === 'Reports') return
    if (onNavigate) onNavigate(page.toLowerCase())
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  return (
    <div className="staff-visit-records-screen">
      <aside className="staff-visit-records-sidebar">
        <div className="staff-visit-records-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-visit-records-logo"
          />
        </div>

        <nav className="staff-visit-records-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Reports'
                  ? 'staff-visit-records-menu-item active'
                  : 'staff-visit-records-menu-item'
              }
              aria-current={item === 'Reports' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="staff-visit-records-main">
        <header className="staff-visit-records-topbar">
          <button
            type="button"
            className="staff-visit-records-profile"
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

        <main className="staff-visit-records-content">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '6px',
            }}
          >
            <div>
              <h1 className="staff-visit-records-title" style={{ marginBottom: '4px' }}>
                Visit <span>Records</span>
              </h1>
              <p className="staff-visit-records-subtitle" style={{ margin: 0 }}>
                Administrative review of clinic visit transactions and daily consultation logbooks.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportExcelTable}
              style={{
                backgroundColor: '#990000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 3px 8px rgba(153, 0, 0, 0.22)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Logbook Table ({filteredRecords.length})
            </button>
          </div>

          {/* Verify Excuse Slip / Reference Code Box */}
          <section
            aria-label="Verify Clinic Excuse Slip"
            style={{
              marginTop: '14px',
              marginBottom: '16px',
              padding: '14px 18px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #990000',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#990000', marginBottom: '4px' }}>
              Verify Student Clinic Excuse Slip
            </div>
            <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#555555' }}>
              Paste the Verification Reference Code from the student&apos;s digital proof to verify clinic attendance.
            </p>

            <form
              onSubmit={handleVerifySlip}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}
            >
              <input
                type="text"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                placeholder="e.g. CLQ-E003-1122-NOV262"
                aria-label="Verification Reference Code"
                style={{
                  flex: '1 1 240px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13.5px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#990000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Verify Code
              </button>
              {verifyResult && (
                <button
                  type="button"
                  onClick={() => {
                    setVerifyInput('')
                    setVerifyResult(null)
                  }}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            {verifyResult && (
              <div
                role="status"
                style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: verifyResult.valid ? '#ecfdf5' : '#fef2f2',
                  border: verifyResult.valid ? '1.5px solid #16a34a' : '1.5px solid #dc2626',
                  color: verifyResult.valid ? '#14532d' : '#7f1d1d',
                  fontSize: '13px',
                }}
              >
                {verifyResult.valid ? (
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: '4px' }}>
                      OFFICIAL VERIFIED ATTENDANCE — Ticket {verifyResult.record.ticket}
                    </div>
                    <div>
                      <strong>Patient:</strong> {verifyResult.record.patientName}
                      {verifyResult.record.patientIdentifier
                        ? ` (${verifyResult.record.patientIdentifier})`
                        : ''}
                      {' | '}
                      <strong>Service:</strong> {verifyResult.record.service}
                      {' | '}
                      <strong>Date:</strong> {verifyResult.record.date}
                      {verifyResult.record.checkedInAt
                        ? ` (${verifyResult.record.checkedInAt}${verifyResult.record.completedAt ? ` – ${verifyResult.record.completedAt}` : ''})`
                        : ''}
                    </div>
                  </div>
                ) : (
                  <strong>{verifyResult.message}</strong>
                )}
              </div>
            )}
          </section>

          {/* Date & Status Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '12px',
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #f0c2c2',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <label
                htmlFor="logbook-date-filter"
                style={{ fontSize: '13px', fontWeight: 700, color: '#990000' }}
              >
                Filter by Date:
              </label>
              <input
                id="logbook-date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  color: '#111827',
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedDate(todayIso)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #990000',
                  backgroundColor: selectedDate === todayIso ? '#990000' : '#ffffff',
                  color: selectedDate === todayIso ? '#ffffff' : '#990000',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #990000',
                  backgroundColor: selectedDate === '' ? '#990000' : '#ffffff',
                  color: selectedDate === '' ? '#ffffff' : '#990000',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                All Dates
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label
                htmlFor="logbook-status-filter"
                style={{ fontSize: '13px', fontWeight: 700, color: '#990000' }}
              >
                Status:
              </label>
              <select
                id="logbook-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  color: '#111827',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed Only</option>
                <option value="WAITING">In Queue</option>
                <option value="NOW_SERVING">Now Serving</option>
                <option value="CANCELLED">Cancelled / No-Show</option>
              </select>
            </div>
          </div>

          <section className="staff-visit-records-section" aria-label="Clinic visit records">
            <div className="staff-visit-records-table-wrapper">
              <table className="staff-visit-records-table">
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Service</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id || record.ticket}>
                        <td>{record.ticket}</td>
                        <td>{record.service}</td>
                        <td>{record.date}</td>
                        <td>{record.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '16px' }}>
                        No clinic visit records found for {selectedDate || 'the selected filter'}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {notice && (
            <div className="staff-visit-records-notice" role="status">
              {notice}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffVisitRecords