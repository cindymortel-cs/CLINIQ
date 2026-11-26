import { useState } from 'react'
import './VisitHistory.css'

function VisitHistory({
  visits = [],
  onHome,
  onQueue,
  onVisits,
  onProfile,
  onSelectVisit
}) {
  const [activeFilter, setActiveFilter] = useState('All')

  const normalizedVisits = visits.map((v) => {
    const rawStatus = (v.status || '').toUpperCase()
    const isOngoing = ['WAITING', 'APPROACHING', 'NOW_SERVING'].includes(rawStatus)
    const displayStatus =
      rawStatus === 'NOW_SERVING'
        ? 'Now serving'
        : rawStatus === 'APPROACHING'
          ? 'Approaching'
          : rawStatus === 'WAITING'
            ? 'In queue'
            : rawStatus === 'CANCELLED'
              ? 'Cancelled'
              : 'Completed'

    return {
      ...v,
      ticketId: v.id,
      id: v.queueNumber || v.id,
      service: v.serviceName || v.service,
      date: v.queueDate ? `${v.queueDate} - ${v.checkedInAt || ''}` : v.date,
      fullDate: v.queueDate || v.fullDate,
      checkInTime: v.checkedInAt || v.checkInTime,
      status: displayStatus,
      type: isOngoing ? 'Ongoing' : 'Completed',
    }
  })

  const filteredVisits = normalizedVisits.filter((visit) => {
    if (activeFilter === 'All') return true
    return visit.type === activeFilter
  })

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
    <div className="visit-history-screen">
      {/* CLINIQ Header */}
      <header className="visit-history-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="visit-history-logo"
        />
      </header>

      <main className="visit-history-content">
        {/* Page Title */}
        <section className="visit-history-intro">
          <h1>Visits</h1>
          <p>Your clinic transactions and queue history.</p>
        </section>

        {/* Filter Buttons */}
        <div className="visit-history-filters">
          {['All', 'Ongoing', 'Completed'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                activeFilter === filter
                  ? 'visit-history-filter active'
                  : 'visit-history-filter'
              }
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Visit Records */}
        <section className="visit-history-list">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <button
                key={visit.ticketId || visit.id}
                type="button"
                className="visit-history-card"
                onClick={() => onSelectVisit?.(visit)}
                style={{
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <div className="visit-history-card-top">
                  <h2>{visit.id}</h2>

                  <span
                    className={
                      visit.type === 'Ongoing'
                        ? 'visit-history-status ongoing'
                        : 'visit-history-status completed'
                    }
                  >
                    {visit.status}
                  </span>
                </div>

                <p className="visit-history-service">{visit.service}</p>
                <p className="visit-history-date">{visit.date}</p>
              </button>
            ))
          ) : (
            <p className="visit-history-empty">No visits found.</p>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
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
          const isActive = tab.key === 'visits'
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

export default VisitHistory