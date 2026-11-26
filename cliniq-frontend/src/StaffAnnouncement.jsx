import { useState } from 'react'
import { cliniqApi } from './api/cliniqApi'
import './StaffAnnouncement.css'

const menuItems = [
  'Dashboard',
  'Queue',
  'Visits',
  'Reports',
  'Announcement',
  'Settings'
]

function StaffAnnouncement({ announcements = [], staffUser, onRefresh, onNavigate, onProfile }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [publishUntil, setPublishUntil] = useState('')
  const [activeMenu, setActiveMenu] = useState(null)
  const [editingId, setEditingId] = useState(null)
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
    if (page === 'Announcement') return
    if (onNavigate) onNavigate(page.toLowerCase())
  }

  const handleProfile = () => {
    if (onProfile) onProfile()
    else if (onNavigate) onNavigate('settings')
  }

  const handleCancel = () => {
    setTitle('')
    setMessage('')
    setPublishUntil('')
    setEditingId(null)
    setNotice('')
  }

  const handlePublish = async (event) => {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      setNotice('Please enter an announcement title and message.')
      return
    }

    setSaving(true)
    try {
      if (editingId !== null) {
        await cliniqApi.deleteAnnouncement(editingId)
      }
      await cliniqApi.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        announcementType: 'ANNOUNCEMENT',
        eventDate: publishUntil || null,
        createdBy: staffUser?.id || 1,
      })
      if (onRefresh) await onRefresh()

      setNotice('Announcement published to all connected student devices!')
      setTitle('')
      setMessage('')
      setPublishUntil('')
      setEditingId(null)
      setActiveMenu(null)
    } catch (err) {
      setNotice(err.message || 'Failed to publish announcement.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (announcement) => {
    setTitle(announcement.title)
    setMessage(announcement.message)
    setPublishUntil(announcement.eventDate || '')
    setEditingId(announcement.id)
    setActiveMenu(null)
    setNotice('Editing selected announcement.')
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this announcement?')
    if (!confirmed) return

    try {
      await cliniqApi.deleteAnnouncement(id)
      if (onRefresh) await onRefresh()
      if (editingId === id) {
        setTitle('')
        setMessage('')
        setPublishUntil('')
        setEditingId(null)
      }
      setActiveMenu(null)
      setNotice('Announcement deleted.')
    } catch (err) {
      setNotice(err.message || 'Failed to delete announcement.')
    }
  }

  return (
    <div className="staff-announcement-screen">
      <aside className="staff-announcement-sidebar">
        <div className="staff-announcement-brand">
          <img
            src="/cliniq-header.png"
            alt="CLINIQ Logo"
            className="staff-announcement-logo"
          />
        </div>

        <nav className="staff-announcement-menu" aria-label="Staff navigation">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                item === 'Announcement'
                  ? 'staff-announcement-menu-item active'
                  : 'staff-announcement-menu-item'
              }
              aria-current={item === 'Announcement' ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="staff-announcement-main">
        <header className="staff-announcement-topbar">
          <button
            type="button"
            className="staff-announcement-profile"
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

        <main className="staff-announcement-content">
          <h1 className="staff-announcement-title">Announcement</h1>

          <p className="staff-announcement-subtitle">
            Create and manage announcements for patients and staff.
          </p>

          <section className="staff-announcement-create-card">
            <h2>
              {editingId !== null ? 'Edit Announcement' : 'Create Announcement'}
            </h2>

            <form onSubmit={handlePublish}>
              <div className="staff-announcement-form-grid">
                <div className="staff-announcement-form-left">
                  <div className="staff-announcement-field">
                    <label htmlFor="announcement-title">
                      Title <span>*</span>
                    </label>

                    <input
                      id="announcement-title"
                      type="text"
                      placeholder="Enter announcement title..."
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                    />
                  </div>

                  <div className="staff-announcement-field">
                    <label htmlFor="announcement-message">
                      Message <span>*</span>
                    </label>

                    <textarea
                      id="announcement-message"
                      placeholder="Write your message here..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="staff-announcement-form-right">
                  <div className="staff-announcement-field">
                    <label htmlFor="announcement-date">Publish Until</label>

                    <input
                      id="announcement-date"
                      type="date"
                      value={publishUntil}
                      onChange={(event) => setPublishUntil(event.target.value)}
                    />
                  </div>

                  <div className="staff-announcement-actions">
                    <button
                      type="button"
                      className="staff-announcement-cancel"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="staff-announcement-publish"
                      disabled={saving}
                    >
                      {saving ? 'Publishing...' : editingId !== null ? 'Save' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>

          <section className="staff-announcement-current-card">
            <h2>Current Announcements</h2>

            {announcements.length === 0 ? (
              <p className="staff-announcement-empty">
                No announcements available.
              </p>
            ) : (
              <div className="staff-announcement-list">
                {announcements.map((announcement) => (
                  <article
                    key={announcement.id}
                    className="staff-announcement-item"
                  >
                    <div className="staff-announcement-item-details">
                      <h3>{announcement.title}</h3>
                      <p>{announcement.message}</p>
                    </div>

                    <div className="staff-announcement-item-right">
                      <span className="staff-announcement-item-date">
                        {announcement.createdAt || announcement.date}
                      </span>

                      <div className="staff-announcement-menu-wrapper">
                        <button
                          type="button"
                          className="staff-announcement-more"
                          aria-label={`Manage ${announcement.title}`}
                          aria-expanded={activeMenu === announcement.id}
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === announcement.id ? null : announcement.id
                            )
                          }
                        >
                          ⋮
                        </button>

                        {activeMenu === announcement.id && (
                          <div className="staff-announcement-dropdown">
                            <button
                              type="button"
                              onClick={() => handleEdit(announcement)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(announcement.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {notice && (
            <p className="staff-announcement-notice" role="status">
              {notice}
            </p>
          )}
        </main>
      </div>
    </div>
  )
}

export default StaffAnnouncement