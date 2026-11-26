import { useState, useEffect, useCallback, useRef } from 'react'
import SignIn from './SignIn'
import SelectAccountType from './SelectAccountType'
import StudentRegistration from './StudentRegistration'
import NewApplicantRegistration from './NewApplicantRegistration'
import PersonnelRegistration from './PersonnelRegistration'
import SecureAccount from './SecureAccount'
import RegistrationSuccess from './RegistrationSuccess'
import Home from './Home'
import ClinicService from './ClinicService'
import ApplicantClinicService from './ApplicantClinicService'
import ReviewCheckIn from './ReviewCheckIn'
import QueueTicket from './QueueTicket'
import QueueTracking from './QueueTracking'
import './App.css'
import QueueNotification from './QueueNotification'
import NowServing from './NowServing'
import VisitCompleted from './VisitCompleted'
import NoActiveQueue from './NoActiveQueue'
import DuplicateQueue from './DuplicateQueue'
import VisitHistory from './VisitHistory'
import VisitDetails from './VisitDetails'
import Profile from './Profile'
import PersonalInformation from './PersonalInformation'
import NotificationPreferences from './NotificationPreferences'
import ClinicConnection from './ClinicConnection'
import AboutCliniq from './AboutCliniq'
import StaffSignIn from './StaffSignIn'
import StaffDashboard from './StaffDashboard'
import StaffQueue from './StaffQueue'
import StaffPriority from './StaffPriority'
import StaffCallNext from './StaffCallNext'
import StaffCompleteVisit from './StaffCompleteVisit'
import StaffVisitRecords from './StaffVisitRecords'
import AccountSecurity from './AccountSecurity'
import StaffAnnouncement from './StaffAnnouncement'
import StaffSettings from './StaffSettings'
import PatientAnnouncements from './PatientAnnouncements'
import { cliniqApi, API_BASE, connectQueueSocket } from './api/cliniqApi'
import { initMobileNotifications, triggerQueueNotification, playAlertChime } from './mobileNotifications'

function ReconnectionStatusBanner({ onReconnectSync }) {
  const [connState, setConnState] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'
  )
  const [showSyncedToast, setShowSyncedToast] = useState(false)
  const wasDisconnectedRef = useRef(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )
  const syncCallbackRef = useRef(onReconnectSync)

  useEffect(() => {
    syncCallbackRef.current = onReconnectSync
  }, [onReconnectSync])

  useEffect(() => {
    let isMounted = true
    let retryTimer = null

    const verifyAndSync = async () => {
      if (!isMounted) return
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        wasDisconnectedRef.current = true
        setConnState('offline')
        return
      }

      try {
        await cliniqApi.getAnnouncements()

        if (!isMounted) return
        setConnState('online')

        if (wasDisconnectedRef.current) {
          wasDisconnectedRef.current = false
          if (typeof syncCallbackRef.current === 'function') {
            await syncCallbackRef.current()
          }
          if (isMounted) {
            setShowSyncedToast(true)
            playAlertChime()
            setTimeout(() => {
              if (isMounted) setShowSyncedToast(false)
            }, 3000)
          }
        }
      } catch {
        if (!isMounted) return
        wasDisconnectedRef.current = true
        setConnState(navigator.onLine ? 'reconnecting' : 'offline')
        clearTimeout(retryTimer)
        retryTimer = setTimeout(verifyAndSync, 1500)
      }
    }

    const handleOffline = () => {
      wasDisconnectedRef.current = true
      setConnState('offline')
    }

    const handleOnline = () => {
      setConnState('reconnecting')
      clearTimeout(retryTimer)
      verifyAndSync()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    verifyAndSync()
    const healthPoll = setInterval(verifyAndSync, 2500)

    return () => {
      isMounted = false
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      clearTimeout(retryTimer)
      clearInterval(healthPoll)
    }
  }, [])

  if (connState === 'online' && !showSyncedToast) return null

  const isSynced = connState === 'online' && showSyncedToast

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        backgroundColor: isSynced
          ? '#15803d'
          : connState === 'offline'
            ? '#991b1b'
            : '#b45309',
        color: '#ffffff',
        fontSize: '12.5px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'inline-block',
        }}
      />
      {isSynced && 'Back online — Queue status synchronized!'}
      {!isSynced &&
        connState === 'offline' &&
        'You are offline. Waiting for Wi-Fi connection to sync queue...'}
      {!isSynced &&
        connState === 'reconnecting' &&
        'Connection lost. Reconnecting to clinic server...'}
    </div>
  )
}

function CutOffNoticeModal({ modalData, onClose }) {
  useEffect(() => {
    if (modalData) {
      playAlertChime()
    }
  }, [modalData])

  if (!modalData) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cutoff-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          backgroundColor: '#ffffff',
          border: '2px solid #990000',
          borderRadius: '18px',
          padding: '22px 20px',
          boxShadow: '0 14px 30px rgba(0, 0, 0, 0.28)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 12px',
            borderRadius: '50%',
            backgroundColor: '#ffe0e0',
            border: '1.5px solid #990000',
            color: '#990000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 800,
          }}
        >
          !
        </div>

        <h2
          id="cutoff-modal-title"
          style={{
            margin: '0 0 8px',
            fontSize: '18px',
            fontWeight: 800,
            color: '#990000',
          }}
        >
          Check-Ins Temporarily Unavailable
        </h2>

        <p
          style={{
            margin: '0 0 18px',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#1f2937',
          }}
        >
          {modalData.reason}
        </p>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: '#990000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          OK, Got It
        </button>
      </div>
    </div>
  )
}

function QueueAlertBanner({ alertData }) {
  if (!alertData) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        backgroundColor: '#990000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.28)',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.25 }}>
        {alertData.title || 'CLINIQ Queue Alert'}
      </div>
      {alertData.body && (
        <div style={{ fontSize: '12.5px', fontWeight: 600, opacity: 0.96, marginTop: '2px', lineHeight: 1.3 }}>
          {alertData.body}
        </div>
      )}
    </div>
  )
}

function formatTicketStatus(rawStatus) {
  switch (String(rawStatus || '').toUpperCase()) {
    case 'NOW_SERVING':
      return 'Now serving'
    case 'APPROACHING':
      return 'Approaching'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NO_SHOW':
      return 'No-show'
    case 'WAITING':
      return 'In queue'
    default:
      return rawStatus || 'In queue'
  }
}

function isTicketAtClinic(ticket) {
  if (!ticket) return false
  if (Boolean(ticket.atClinic || ticket.isAtClinic)) return true
  if (/\[AT[_\s-]?CLINIC\]/i.test(String(ticket.urgentNote || ''))) return true
  if (ticket.id) {
    try {
      return localStorage.getItem(`cliniq_at_clinic_${ticket.id}`) === 'true'
    } catch {
      return false
    }
  }
  return false
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('signin')
  const [selectedStaffPatient, setSelectedStaffPatient] = useState(null)

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cliniq_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [accountType, setAccountType] = useState('student')
  const [registrationData, setRegistrationData] = useState({})
  const [selectedService, setSelectedService] = useState('')
  const [servicesList, setServicesList] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [globalNowServing, setGlobalNowServing] = useState('None')
  const [visitHistoryList, setVisitHistoryList] = useState([])
  const [announcementsList, setAnnouncementsList] = useState([])
  const [staffDashboardData, setStaffDashboardData] = useState(null)
  const [staffRecordsList, setStaffRecordsList] = useState([])
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [registrationScreen, setRegistrationScreen] = useState('studentRegistration')
  const [cutOffModal, setCutOffModal] = useState(null)
  const [inAppAlert, setInAppAlert] = useState(null)

  const previousActiveTicketRef = useRef(null)
  const lastNotifiedStatusRef = useRef('')
  const acknowledgedApproachingTicketRef = useRef(null)
  const acknowledgedServingTicketRef = useRef(null)
  const justCheckedInUntilRef = useRef(0)
  const wasPausedRef = useRef(false)
  const isStaffMode = new URLSearchParams(window.location.search).has('staff')

  useEffect(() => {
    let hideTimer = null

    const handleQueueAlertEvent = (event) => {
      const detail = event?.detail || {}
      setInAppAlert({
        title: detail.title || 'CLINIQ Queue Alert',
        body: detail.body || '',
      })
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        setInAppAlert(null)
      }, 6000)
    }

    window.addEventListener('cliniq:queue-alert', handleQueueAlertEvent)
    return () => {
      window.removeEventListener('cliniq:queue-alert', handleQueueAlertEvent)
      clearTimeout(hideTimer)
    }
  }, [])

  // Play alert chime whenever entering It Is Your Turn (nowServing) or Visit Completed screens
  useEffect(() => {
    if (currentScreen === 'nowServing' || currentScreen === 'visitCompleted') {
      playAlertChime()
    }
  }, [currentScreen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (currentUser) {
      setAccountType(currentUser.role.toLowerCase())
      setRegistrationData({
        ...currentUser,
        urgentNote: activeTicket?.urgentNote || '',
      })
    }
  }, [currentUser, activeTicket])

  const sendPushAlertOnce = useCallback((key, title, body) => {
    if (!key || lastNotifiedStatusRef.current === key) return
    lastNotifiedStatusRef.current = key
    triggerQueueNotification(title, body)
  }, [])

  const showCutOffPopup = useCallback((reasonText) => {
    const cleanReason =
      reasonText ||
      'Clinic check-ins are currently paused (Lunch Break / Daily Cut-off). Please check back later before heading to the clinic.'
    setCutOffModal({ reason: cleanReason })
    setCurrentScreen((prev) =>
      prev === 'clinicService' ||
      prev === 'applicantClinicService' ||
      prev === 'reviewCheckIn'
        ? 'home'
        : prev
    )
  }, [])

  const refreshPatientData = useCallback(
    async (userObj = currentUser) => {
      if (!userObj?.id) return
      try {
        const isAndroid =
          typeof window !== 'undefined' &&
          (Boolean(window.Capacitor) || /Android/i.test(navigator.userAgent))
        const currentDeviceLabel = isAndroid
          ? 'Android Mobile Device'
          : 'Current Browser Session'

        const [freshUser, svcs, active, history, anns, dash, qStatus] = await Promise.all([
          cliniqApi.getUser(userObj.id).catch(() => null),
          cliniqApi.getServices(userObj.role),
          cliniqApi.getMyActiveQueue(userObj.id).catch(() => null),
          cliniqApi.getVisitHistory(userObj.id),
          cliniqApi.getAnnouncements(),
          cliniqApi.getStaffDashboard().catch(() => null),
          cliniqApi.getQueueStatus().catch(() => null),
          cliniqApi.getUserDevices(userObj.id, currentDeviceLabel).catch(() => null),
        ])

        if (freshUser && freshUser.id) {
          setCurrentUser((prev) => {
            const mergedUser = { ...prev, ...freshUser }
            if (JSON.stringify(prev) !== JSON.stringify(mergedUser)) {
              localStorage.setItem('cliniq_user', JSON.stringify(mergedUser))
              return mergedUser
            }
            return prev
          })
        }

        const effectiveUser = freshUser?.id ? { ...userObj, ...freshUser } : userObj

        const nowPaused = qStatus?.paused === 'true' || qStatus?.paused === true
        if (nowPaused && !wasPausedRef.current && !active) {
          showCutOffPopup(qStatus?.reason)
        }
        wasPausedRef.current = nowPaused

        const prevTicket = previousActiveTicketRef.current
        previousActiveTicketRef.current = active

        let mergedActive = active
        if (active?.id) {
          try {
            const localConfirmed =
              localStorage.getItem(`cliniq_at_clinic_${active.id}`) === 'true'
            if (
              localConfirmed &&
              !/\[AT[_\s-]?CLINIC\]/i.test(String(active.urgentNote || ''))
            ) {
              const cleanExisting = String(active.urgentNote || '').trim()
              mergedActive = {
                ...active,
                atClinic: true,
                urgentNote: cleanExisting
                  ? `[AT_CLINIC] ${cleanExisting}`
                  : '[AT_CLINIC]',
              }
            }
          } catch {}
        }

        setServicesList(svcs)
        setActiveTicket(mergedActive)
        setVisitHistoryList(history)
        setAnnouncementsList(anns)

        const servingFromDash =
          dash?.nowServing ||
          dash?.activeQueue?.find((item) => item.status === 'NOW_SERVING')?.queueNumber
        const resolvedServing =
          (mergedActive?.nowServingNumber && mergedActive.nowServingNumber !== 'A-023'
            ? mergedActive.nowServingNumber
            : null) ||
          servingFromDash ||
          'None'
        setGlobalNowServing(resolvedServing)

        if (!mergedActive && prevTicket?.id) {
          acknowledgedApproachingTicketRef.current = null
          acknowledgedServingTicketRef.current = null
          const finishedMatch = history.find((item) => item.id === prevTicket.id)
          const finishedStatus = String(finishedMatch?.status || '').toUpperCase()

          if (finishedStatus === 'COMPLETED') {
            sendPushAlertOnce(
              `COMPLETED_${prevTicket.id}`,
              'CLINIQ: Visit Completed',
              `Your clinic visit (${prevTicket.queueNumber || 'ticket'}) has been marked completed.`
            )
            setCurrentScreen((prev) =>
              prev === 'nowServing' ||
              prev === 'queueTracking' ||
              prev === 'queueNotification' ||
              prev === 'queueTicket'
                ? 'visitCompleted'
                : prev
            )
            return
          }

          if (finishedStatus === 'NO_SHOW') {
            sendPushAlertOnce(
              `NO_SHOW_${prevTicket.id}`,
              'CLINIQ: Ticket Marked No-Show',
              `Queue ${prevTicket.queueNumber || 'ticket'} was skipped because you were not at the clinic. You may check in again.`
            )
            setCurrentScreen((prev) =>
              prev === 'nowServing' ||
              prev === 'queueTracking' ||
              prev === 'queueNotification' ||
              prev === 'queueTicket'
                ? 'noActiveQueue'
                : prev
            )
            return
          }
        }

        if (
          mergedActive?.status === 'APPROACHING' &&
          (effectiveUser.approachingTurnAlerts ?? true)
        ) {
          sendPushAlertOnce(
            `APPROACHING_${mergedActive.id}`,
            'CLINIQ: Approaching Your Turn',
            `Queue ${mergedActive.queueNumber} is up next.`
          )
          if (
            Date.now() >= justCheckedInUntilRef.current &&
            acknowledgedApproachingTicketRef.current !== mergedActive.id &&
            !isTicketAtClinic(mergedActive)
          ) {
            acknowledgedApproachingTicketRef.current = mergedActive.id
            setCurrentScreen((prev) =>
              prev === 'queueTicket' ? prev : 'queueNotification'
            )
          }
        }

        if (
          mergedActive?.status === 'NOW_SERVING' &&
          (effectiveUser.inAppAlerts ?? true)
        ) {
          sendPushAlertOnce(
            `NOW_SERVING_${mergedActive.id}`,
            'CLINIQ: It Is Your Turn!',
            `Queue ${mergedActive.queueNumber} is now being served at the University Clinic.`
          )
          if (acknowledgedServingTicketRef.current !== mergedActive.id) {
            acknowledgedServingTicketRef.current = mergedActive.id
            setCurrentScreen('nowServing')
          }
        }
      } catch (err) {
        console.error('Error syncing patient data:', err)
      }
    },
    [currentUser, sendPushAlertOnce, showCutOffPopup]
  )

  const refreshStaffData = useCallback(async () => {
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      const browser = /Edg\//i.test(ua)
        ? 'Microsoft Edge'
        : /Chrome\//i.test(ua)
          ? 'Google Chrome'
          : /Firefox\//i.test(ua)
            ? 'Mozilla Firefox'
            : /Safari\//i.test(ua)
              ? 'Safari'
              : 'Browser'
      const os = /Windows NT 10\.0/i.test(ua)
        ? 'Windows 10/11'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Mac OS X/i.test(ua)
            ? 'macOS'
            : /Android/i.test(ua)
              ? 'Android'
              : 'Desktop'
      const staffDeviceLabel = `${browser} on ${os}`

      const [dash, recs, anns] = await Promise.all([
        cliniqApi.getStaffDashboard(),
        cliniqApi.getStaffVisitRecords(),
        cliniqApi.getAnnouncements(),
        currentUser?.id
          ? cliniqApi.getUserDevices(currentUser.id, staffDeviceLabel).catch(() => null)
          : Promise.resolve(null),
      ])
      setStaffDashboardData(dash)
      setStaffRecordsList(recs)
      setAnnouncementsList(anns)
    } catch (err) {
      console.error('Error syncing staff data:', err)
    }
  }, [currentUser?.id])

  const handleReconnectionSync = useCallback(async () => {
    if (isStaffMode) {
      await refreshStaffData()
    } else if (currentUser?.id) {
      await refreshPatientData(currentUser)
    }
  }, [isStaffMode, currentUser, refreshStaffData, refreshPatientData])

  useEffect(() => {
    if (isStaffMode) {
      refreshStaffData()
      if (currentUser?.id && currentScreen === 'signin') {
        setCurrentScreen('staffDashboard')
      }
    } else if (currentUser?.id) {
      initMobileNotifications()
      refreshPatientData(currentUser)
      if (currentScreen === 'signin') {
        setCurrentScreen('home')
      }
    }
  }, [isStaffMode, currentUser?.id])

  useEffect(() => {
    if (isStaffMode) {
      const staffInterval = setInterval(() => {
        refreshStaffData()
      }, 3000)
      return () => clearInterval(staffInterval)
    }

    if (!currentUser?.id) return
    const interval = setInterval(() => {
      refreshPatientData(currentUser)
    }, 3000)
    return () => clearInterval(interval)
  }, [isStaffMode, currentUser, refreshPatientData, refreshStaffData])

  const handleFullSignOut = useCallback(() => {
    localStorage.removeItem('cliniq_token')
    localStorage.removeItem('cliniq_user')
    previousActiveTicketRef.current = null
    lastNotifiedStatusRef.current = ''
    acknowledgedApproachingTicketRef.current = null
    acknowledgedServingTicketRef.current = null
    wasPausedRef.current = false
    setCutOffModal(null)
    setCurrentUser(null)
    setActiveTicket(null)
    setGlobalNowServing('None')
    setRegistrationData({})
    setAccountType('student')
    setSelectedService('')
    setSelectedVisit(null)
    setCurrentScreen('signin')
  }, [])

  useEffect(() => {
    const disconnect = connectQueueSocket((wsEvent) => {
      if (isStaffMode) {
        if (wsEvent.event === 'FORCE_SIGNOUT' && wsEvent.targetUserId === currentUser?.id) {
          handleFullSignOut()
          return
        }
        refreshStaffData()
        return
      }

      if (currentUser?.id) {
        if (wsEvent.event === 'QUEUE_STATUS_CHANGED') {
          cliniqApi
            .getQueueStatus()
            .then((qStatus) => {
              const nowPaused = qStatus?.paused === 'true' || qStatus?.paused === true
              wasPausedRef.current = nowPaused
              if (nowPaused && !activeTicket) {
                showCutOffPopup(qStatus?.reason || wsEvent.message)
              }
            })
            .catch(() => {})
        }

        refreshPatientData(currentUser)

        if (wsEvent.targetUserId === currentUser.id) {
          const ticketNum = wsEvent.queueNumber || activeTicket?.queueNumber || ''
          const ticketKey = wsEvent.ticketId || activeTicket?.id || ticketNum

          if (
            wsEvent.event === 'APPROACHING_TURN' &&
            (currentUser.approachingTurnAlerts ?? true)
          ) {
            sendPushAlertOnce(
              `APPROACHING_${ticketKey}`,
              'CLINIQ: Approaching Your Turn',
              `Queue ${ticketNum} is up next.`
            )
            if (
              Date.now() >= justCheckedInUntilRef.current &&
              acknowledgedApproachingTicketRef.current !== ticketKey &&
              !isTicketAtClinic(activeTicket)
            ) {
              acknowledgedApproachingTicketRef.current = ticketKey
              setCurrentScreen((prev) =>
                prev === 'queueTicket' ? prev : 'queueNotification'
              )
            }
          } else if (
            wsEvent.event === 'NOW_SERVING' &&
            (currentUser.inAppAlerts ?? true)
          ) {
            sendPushAlertOnce(
              `NOW_SERVING_${ticketKey}`,
              'CLINIQ: It Is Your Turn!',
              `Queue ${ticketNum} is now being served at the University Clinic.`
            )
            if (acknowledgedServingTicketRef.current !== ticketKey) {
              acknowledgedServingTicketRef.current = ticketKey
              setCurrentScreen('nowServing')
            }
          } else if (wsEvent.event === 'VISIT_COMPLETED') {
            sendPushAlertOnce(
              `COMPLETED_${ticketKey}`,
              'CLINIQ: Visit Completed',
              `Your clinic visit (${ticketNum}) has been marked completed.`
            )
            previousActiveTicketRef.current = null
            acknowledgedApproachingTicketRef.current = null
            acknowledgedServingTicketRef.current = null
            setActiveTicket(null)
            setCurrentScreen('visitCompleted')
          } else if (wsEvent.event === 'TICKET_NO_SHOW') {
            sendPushAlertOnce(
              `NO_SHOW_${ticketKey}`,
              'CLINIQ: Ticket Marked No-Show',
              `Queue ${ticketNum} was marked as No-Show. You may check in again.`
            )
            previousActiveTicketRef.current = null
            acknowledgedApproachingTicketRef.current = null
            acknowledgedServingTicketRef.current = null
            setActiveTicket(null)
            setCurrentScreen('noActiveQueue')
          } else if (wsEvent.event === 'FORCE_SIGNOUT') {
            handleFullSignOut()
          }
        }
      }
    })
    return disconnect
  }, [isStaffMode, currentUser, activeTicket, refreshPatientData, refreshStaffData, handleFullSignOut, sendPushAlertOnce, showCutOffPopup])

  const handleConfirmAtClinic = useCallback(
    async (t) => {
      const target = t || activeTicket
      if (!target?.id) return
      const existingNote = String(target.urgentNote || '')
        .replace(/\[AT[_\s-]?CLINIC\]\s*/gi, '')
        .trim()
      const updatedNote = existingNote
        ? `[AT_CLINIC] ${existingNote}`
        : '[AT_CLINIC]'

      try {
        localStorage.setItem(`cliniq_at_clinic_${target.id}`, 'true')
      } catch {}

      acknowledgedApproachingTicketRef.current = target.id

      setActiveTicket((prev) =>
        prev && prev.id === target.id
          ? { ...prev, urgentNote: updatedNote, atClinic: true }
          : prev
      )

      try {
        await cliniqApi.updatePriority(
          target.id,
          target.priority || 'REGULAR',
          updatedNote
        )
        await refreshPatientData()
      } catch {
        try {
          await fetch(`${API_BASE}/staff/queue/${target.id}/priority`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priority: target.priority || 'REGULAR',
              urgentNote: updatedNote,
            }),
          })
          await refreshPatientData()
        } catch (err) {
          console.error('Failed to sync arrival at clinic:', err)
        }
      }
    },
    [activeTicket, refreshPatientData]
  )

  const goToQueueTab = async () => {
    if (currentUser?.id) {
      try {
        const latest = await cliniqApi.getMyActiveQueue(currentUser.id)
        setActiveTicket(latest)
        previousActiveTicketRef.current = latest
        if (latest) {
          if (latest.status === 'APPROACHING' && !isTicketAtClinic(latest)) {
            acknowledgedApproachingTicketRef.current = latest.id
            setCurrentScreen('queueNotification')
          } else {
            setCurrentScreen('queueTracking')
          }
          return
        }
      } catch (err) {
        console.error('Error checking active queue:', err)
        setActiveTicket(null)
        previousActiveTicketRef.current = null
      }
    }
    setCurrentScreen('noActiveQueue')
  }

  const goToVisitsTab = () => {
    refreshPatientData()
    setCurrentScreen('visitHistory')
  }

  const goToProfileTab = () => {
    refreshPatientData()
    setCurrentScreen('profile')
  }

  const startVisitClinic = async () => {
    if (currentUser?.id) {
      try {
        const latest = await cliniqApi.getMyActiveQueue(currentUser.id)
        if (latest) {
          setActiveTicket(latest)
          previousActiveTicketRef.current = latest
          setCurrentScreen('duplicateQueue')
          return
        }
      } catch (err) {
        console.error('Error checking duplicate queue:', err)
        setActiveTicket(null)
        previousActiveTicketRef.current = null
      }
    }

    try {
      const qStatus = await cliniqApi.getQueueStatus()
      if (qStatus?.paused === 'true' || qStatus?.paused === true) {
        wasPausedRef.current = true
        showCutOffPopup(qStatus.reason)
        return
      }
    } catch {
      // backend check-in endpoint will still enforce cut-off
    }

    if (accountType === 'applicant') {
      setCurrentScreen('applicantClinicService')
    } else {
      setCurrentScreen('clinicService')
    }
  }

  const goToSecureAccount = (data, screen) => {
    setRegistrationData(data)
    setRegistrationScreen(screen)
    setCurrentScreen('secureAccount')
  }

  const handleAccountSelection = (selectedType) => {
    setAccountType(selectedType)
    setRegistrationData({})

    if (selectedType === 'student') {
      setCurrentScreen('studentRegistration')
    } else if (selectedType === 'applicant') {
      setCurrentScreen('applicantRegistration')
    } else if (selectedType === 'personnel') {
      setCurrentScreen('personnelRegistration')
    }
  }

  const renderActiveView = () => {
    // ==================== STAFF DESKTOP MODE (?staff) ====================
    if (isStaffMode) {
      const handleStaffNavigation = (page, patient) => {
        if (page === 'dashboard') setCurrentScreen('staffDashboard')
        else if (page === 'queue') {
          refreshStaffData()
          setCurrentScreen('staffQueue')
        } else if (page === 'visits') {
          refreshStaffData()
          setCurrentScreen('staffCompleteVisit')
        } else if (page === 'reports') {
          refreshStaffData()
          setCurrentScreen('staffVisitRecords')
        } else if (page === 'announcement') {
          refreshStaffData()
          setCurrentScreen('staffAnnouncement')
        } else if (page === 'settings') setCurrentScreen('staffSettings')
        else if (page === 'signout') handleFullSignOut()
        else if (page === 'priority') {
          setSelectedStaffPatient(patient)
          setCurrentScreen('staffPriority')
        }
      }

      if (currentScreen === 'staffSettings') {
        return (
          <StaffSettings
            staffUser={currentUser}
            onUpdateUser={(updatedUser) => {
              localStorage.setItem('cliniq_user', JSON.stringify(updatedUser))
              setCurrentUser(updatedUser)
            }}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffAnnouncement') {
        return (
          <StaffAnnouncement
            announcements={announcementsList}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffVisitRecords') {
        return (
          <StaffVisitRecords
            records={staffRecordsList}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffCompleteVisit') {
        return (
          <StaffCompleteVisit
            dashboardData={staffDashboardData}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffCallNext') {
        return (
          <StaffCallNext
            dashboardData={staffDashboardData}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffPriority') {
        return (
          <StaffPriority
            patient={selectedStaffPatient ?? undefined}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffQueue') {
        return (
          <StaffQueue
            dashboardData={staffDashboardData}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onCallNext={() => setCurrentScreen('staffCallNext')}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      if (currentScreen === 'staffDashboard') {
        return (
          <StaffDashboard
            dashboardData={staffDashboardData}
            staffUser={currentUser}
            onRefresh={refreshStaffData}
            onCallNext={() => setCurrentScreen('staffCallNext')}
            onNavigate={handleStaffNavigation}
          />
        )
      }

      return (
        <StaffSignIn
          onSignIn={(authRes) => {
            if (authRes?.user) {
              localStorage.setItem('cliniq_token', authRes.token)
              localStorage.setItem('cliniq_user', JSON.stringify(authRes.user))
              setCurrentUser(authRes.user)
            }
            refreshStaffData()
            setCurrentScreen('staffDashboard')
          }}
        />
      )
    }

    // ==================== PATIENT MOBILE APP MODE ====================
    if (showSplash) {
      return (
        <div className="splash-screen">
          <img src="/cliniq-logo.png" alt="CLINIQ Logo" className="splash-logo" />
        </div>
      )
    }

    if (currentScreen === 'account') {
      return (
        <SelectAccountType
          onSignIn={() => setCurrentScreen('signin')}
          onContinue={handleAccountSelection}
        />
      )
    }

    if (currentScreen === 'studentRegistration') {
      return (
        <StudentRegistration
          onBack={() => setCurrentScreen('account')}
          onBackToSignIn={() => setCurrentScreen('signin')}
          onContinue={(data) => goToSecureAccount(data, 'studentRegistration')}
        />
      )
    }

    if (currentScreen === 'applicantRegistration') {
      return (
        <NewApplicantRegistration
          onBack={() => setCurrentScreen('account')}
          onBackToSignIn={() => setCurrentScreen('signin')}
          onContinue={(data) => goToSecureAccount(data, 'applicantRegistration')}
        />
      )
    }

    if (currentScreen === 'personnelRegistration') {
      return (
        <PersonnelRegistration
          onBack={() => setCurrentScreen('account')}
          onBackToSignIn={() => setCurrentScreen('signin')}
          onContinue={(data) => goToSecureAccount(data, 'personnelRegistration')}
        />
      )
    }

    if (currentScreen === 'secureAccount') {
      return (
        <SecureAccount
          accountType={accountType}
          registrationData={registrationData}
          onBack={() => setCurrentScreen(registrationScreen)}
          onCreateAccount={(authRes) => {
            if (authRes?.user) {
              localStorage.setItem('cliniq_token', authRes.token)
              localStorage.setItem('cliniq_user', JSON.stringify(authRes.user))
              setCurrentUser(authRes.user)
              setRegistrationData(authRes.user)
              initMobileNotifications()
              refreshPatientData(authRes.user)
            }
            setCurrentScreen('registrationSuccess')
          }}
        />
      )
    }

    if (currentScreen === 'registrationSuccess') {
      return (
        <RegistrationSuccess
          registrationData={registrationData}
          accountType={accountType}
          onGoHome={() => setCurrentScreen('home')}
        />
      )
    }

    if (currentScreen === 'home') {
      return (
        <Home
          userName={currentUser?.fullName || registrationData.fullName || 'Guest'}
          activeTicket={activeTicket}
          announcements={announcementsList}
          onVisitClinic={startVisitClinic}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onAnnouncement={() => {
            refreshPatientData()
            setCurrentScreen('patientAnnouncements')
          }}
          onUpcomingAppointment={() => {
            if (activeTicket) {
              goToQueueTab()
            } else {
              goToVisitsTab()
            }
          }}
        />
      )
    }

    if (currentScreen === 'clinicService') {
      return (
        <ClinicService
          services={servicesList}
          onBack={() => setCurrentScreen('home')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onContinue={(service) => {
            setSelectedService(service)
            setCurrentScreen('reviewCheckIn')
          }}
        />
      )
    }

    if (currentScreen === 'applicantClinicService') {
      return (
        <ApplicantClinicService
          services={servicesList}
          onBack={() => setCurrentScreen('home')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onContinue={(service) => {
            setSelectedService(service)
            setCurrentScreen('reviewCheckIn')
          }}
        />
      )
    }

    if (currentScreen === 'reviewCheckIn') {
      return (
        <ReviewCheckIn
          patientName={currentUser?.fullName || registrationData.fullName || 'Guest'}
          accountType={accountType}
          selectedService={selectedService}
          onBack={() => {
            if (accountType === 'applicant') {
              setCurrentScreen('applicantClinicService')
            } else {
              setCurrentScreen('clinicService')
            }
          }}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onConfirm={async (urgentNote) => {
            if (!currentUser?.id) {
              window.alert('Please sign in first before joining the clinic queue.')
              setCurrentScreen('signin')
              return
            }

            try {
              const matchedService =
                servicesList.find(
                  (s) => s.name.toLowerCase() === String(selectedService).toLowerCase()
                ) || servicesList[0]
              const serviceId = matchedService ? matchedService.id : 1

              const ticket = await cliniqApi.checkIn(currentUser.id, serviceId, urgentNote)
              lastNotifiedStatusRef.current = ''
              acknowledgedApproachingTicketRef.current = null
              acknowledgedServingTicketRef.current = null
              justCheckedInUntilRef.current = Date.now() + 2000
              setActiveTicket(ticket)
              previousActiveTicketRef.current = ticket
              setRegistrationData((previous) => ({ ...previous, urgentNote }))
              triggerQueueNotification(
                'CLINIQ: Queue Ticket Confirmed',
                `Your queue number is ${ticket.queueNumber} for ${ticket.serviceName || selectedService}.`
              )
              setCurrentScreen('queueTicket')
              refreshPatientData()
            } catch (err) {
              showCutOffPopup(err.message || 'Unable to join queue.')
            }
          }}
        />
      )
    }

    if (currentScreen === 'queueTicket') {
      return (
        <QueueTicket
          queueNumber={activeTicket?.queueNumber || 'A-001'}
          selectedService={activeTicket?.serviceName || selectedService}
          onHome={() => setCurrentScreen('home')}
          onTrackQueue={goToQueueTab}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'queueTracking') {
      return (
        <QueueTracking
          ticket={activeTicket}
          queueNumber={activeTicket?.queueNumber || '—'}
          nowServing={globalNowServing}
          estimatedWait={
            activeTicket ? `~${activeTicket.estimatedWaitMinutes} mins` : '~0 mins'
          }
          patientsAhead={activeTicket?.peopleAhead ?? 0}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onNowServingClick={() => setCurrentScreen('nowServing')}
          onEstWaitClick={() => setCurrentScreen('queueNotification')}
        />
      )
    }

    if (currentScreen === 'queueNotification') {
      return (
        <QueueNotification
          ticket={activeTicket}
          queueNumber={activeTicket?.queueNumber || '—'}
          nowServing={globalNowServing}
          status="Approaching"
          onHome={() => setCurrentScreen('home')}
          onQueue={() => setCurrentScreen('queueTracking')}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onAtClinic={async (t) => {
            await handleConfirmAtClinic(t)
            setCurrentScreen('queueTracking')
          }}
        />
      )
    }

    if (currentScreen === 'nowServing') {
      return (
        <NowServing
          queueNumber={activeTicket?.queueNumber || '—'}
          selectedService={activeTicket?.serviceName || selectedService}
          onViewQueue={() => {
            if (activeTicket?.id) {
              acknowledgedServingTicketRef.current = activeTicket.id
            }
            setCurrentScreen('queueTracking')
          }}
          onHome={() => {
            if (activeTicket?.id) {
              acknowledgedServingTicketRef.current = activeTicket.id
            }
            setCurrentScreen('home')
          }}
          onQueue={() => {
            if (activeTicket?.id) {
              acknowledgedServingTicketRef.current = activeTicket.id
            }
            setCurrentScreen('queueTracking')
          }}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'visitCompleted') {
      return (
        <VisitCompleted
          queueNumber={visitHistoryList[0]?.queueNumber || '—'}
          selectedService={visitHistoryList[0]?.serviceName || selectedService}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onViewVisitRecord={goToVisitsTab}
        />
      )
    }

    if (currentScreen === 'noActiveQueue') {
      return (
        <NoActiveQueue
          onVisitClinic={startVisitClinic}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'duplicateQueue') {
      return (
        <DuplicateQueue
          queueNumber={activeTicket?.queueNumber || '—'}
          onViewQueue={() => setCurrentScreen('queueTracking')}
          onHome={() => setCurrentScreen('home')}
          onQueue={() => setCurrentScreen('queueTracking')}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'visitHistory') {
      return (
        <VisitHistory
          visits={visitHistoryList}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onSelectVisit={(visit) => {
            setSelectedVisit({
              ...visit,
              id: visit.queueNumber || visit.id,
              ticketId: visit.ticketId || visit.id,
              patientName: visit.patientName || currentUser?.fullName || registrationData.fullName || '',
              patientIdentifier:
                visit.patientIdentifier ||
                currentUser?.srCode ||
                currentUser?.applicationNumber ||
                currentUser?.employeeId ||
                '',
              service: visit.serviceName || visit.service,
              date: visit.queueDate || visit.fullDate || visit.date,
              checkInTime: visit.checkedInAt || visit.checkInTime || '—',
              completedAt: visit.completedAt || null,
              staffNotes: visit.staffNotes || '',
              status: formatTicketStatus(visit.status),
            })
            setCurrentScreen('visitDetails')
          }}
        />
      )
    }

    if (currentScreen === 'visitDetails') {
      const matchedLiveRecord = selectedVisit?.ticketId
        ? visitHistoryList.find((item) => item.id === selectedVisit.ticketId) ||
          (activeTicket?.id === selectedVisit.ticketId ? activeTicket : null)
        : null

      const liveVisit = selectedVisit
        ? {
            ...selectedVisit,
            patientName:
              matchedLiveRecord?.patientName ||
              selectedVisit.patientName ||
              currentUser?.fullName ||
              registrationData.fullName ||
              '',
            patientIdentifier:
              matchedLiveRecord?.patientIdentifier ||
              selectedVisit.patientIdentifier ||
              currentUser?.srCode ||
              currentUser?.applicationNumber ||
              currentUser?.employeeId ||
              '',
            completedAt: matchedLiveRecord?.completedAt || selectedVisit.completedAt || null,
            staffNotes: matchedLiveRecord?.staffNotes || selectedVisit.staffNotes || '',
            status: formatTicketStatus(
              matchedLiveRecord ? matchedLiveRecord.status : selectedVisit.status
            ),
          }
        : {
            id: '—',
            service: 'General consultation',
            date: '—',
            checkInTime: '—',
            status: 'In queue',
          }

      return (
        <VisitDetails
          visit={liveVisit}
          onBack={() => setCurrentScreen('visitHistory')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onCancelRequest={async () => {
            const confirmed = window.confirm(
              'Are you sure you want to cancel your queue request?'
            )
            if (!confirmed) return

            try {
              const targetId = selectedVisit?.ticketId || activeTicket?.id
              if (targetId) {
                await cliniqApi.cancelQueue(targetId)
                previousActiveTicketRef.current = null
                lastNotifiedStatusRef.current = ''
                acknowledgedApproachingTicketRef.current = null
                acknowledgedServingTicketRef.current = null
                setActiveTicket(null)
                await refreshPatientData()
                window.alert('Queue request has been cancelled.')
                setCurrentScreen('visitHistory')
              }
            } catch (err) {
              window.alert(err.message || 'Failed to cancel queue.')
            }
          }}
        />
      )
    }

    if (currentScreen === 'accountSecurity') {
      return (
        <AccountSecurity
          userId={currentUser?.id}
          onBack={() => setCurrentScreen('profile')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onSignOut={handleFullSignOut}
        />
      )
    }

    if (currentScreen === 'patientAnnouncements') {
      return (
        <PatientAnnouncements
          announcements={announcementsList}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'profile') {
      return (
        <Profile
          profilePhoto={currentUser?.profilePhoto || registrationData.profilePhoto || null}
          userName={currentUser?.fullName || registrationData.fullName || 'Guest'}
          accountType={accountType}
          userId={
            accountType === 'student'
              ? currentUser?.srCode || ''
              : accountType === 'applicant'
                ? currentUser?.applicationNumber || ''
                : accountType === 'personnel'
                  ? currentUser?.employeeId || ''
                  : ''
          }
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onPersonalInformation={() => {
            refreshPatientData()
            setCurrentScreen('personalInformation')
          }}
          onAccountSecurity={() => setCurrentScreen('accountSecurity')}
          onNotificationPreferences={() => setCurrentScreen('notificationPreferences')}
          onClinicConnection={() => setCurrentScreen('clinicConnection')}
          onAboutCliniq={() => setCurrentScreen('aboutCliniq')}
          onSignOut={() => {
            const confirmed = window.confirm('Are you sure you want to sign out?')
            if (confirmed) {
              handleFullSignOut()
            }
          }}
        />
      )
    }

    if (currentScreen === 'personalInformation') {
      return (
        <PersonalInformation
          accountType={accountType}
          registrationData={currentUser || registrationData}
          onBack={() => setCurrentScreen('profile')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
          onSaveChanges={async (updatedData) => {
            try {
              if (currentUser?.id) {
                const savedUser = await cliniqApi.updateProfile(currentUser.id, updatedData)
                localStorage.setItem('cliniq_user', JSON.stringify(savedUser))
                setCurrentUser(savedUser)
                setRegistrationData(savedUser)
              } else {
                setRegistrationData(updatedData)
              }
              window.alert('Profile updated successfully!')
              setCurrentScreen('profile')
            } catch (err) {
              window.alert(err.message || 'Failed to save profile changes.')
            }
          }}
        />
      )
    }

    if (currentScreen === 'notificationPreferences') {
      return (
        <NotificationPreferences
          user={currentUser}
          onUpdateUser={(updatedUser) => {
            localStorage.setItem('cliniq_user', JSON.stringify(updatedUser))
            setCurrentUser(updatedUser)
          }}
          onBack={() => setCurrentScreen('profile')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'clinicConnection') {
      return (
        <ClinicConnection
          onBack={() => setCurrentScreen('profile')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    if (currentScreen === 'aboutCliniq') {
      return (
        <AboutCliniq
          onBack={() => setCurrentScreen('profile')}
          onHome={() => setCurrentScreen('home')}
          onQueue={goToQueueTab}
          onVisits={goToVisitsTab}
          onProfile={goToProfileTab}
        />
      )
    }

    return (
      <SignIn
        onCreateAccount={() => setCurrentScreen('account')}
        onSignInSuccess={(authRes) => {
          localStorage.setItem('cliniq_token', authRes.token)
          localStorage.setItem('cliniq_user', JSON.stringify(authRes.user))
          setCurrentUser(authRes.user)
          initMobileNotifications()
          refreshPatientData(authRes.user)
          setCurrentScreen('home')
        }}
      />
    )
  }

  return (
    <>
      {inAppAlert ? (
        <QueueAlertBanner alertData={inAppAlert} />
      ) : (
        <ReconnectionStatusBanner onReconnectSync={handleReconnectionSync} />
      )}
      {!isStaffMode && (
        <CutOffNoticeModal
          modalData={cutOffModal}
          onClose={() => setCutOffModal(null)}
        />
      )}
      {renderActiveView()}
    </>
  )
}

export default App