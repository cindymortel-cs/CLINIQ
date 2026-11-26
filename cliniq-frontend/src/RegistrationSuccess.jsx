
import './RegistrationSuccess.css'

function RegistrationSuccess({
  registrationData = {},
  accountType = 'student',
  onGoHome
}) {

  // Account information based on selected type
  const accountTypes = {
    student: {
      label: 'Enrolled student',
      idLabel: 'SR-CODE',
      idField: 'srCode'
    },
    applicant: {
      label: 'New student applicant',
      idLabel: 'Application No.',
      idField: 'applicationNumber'
    },
    personnel: {
      label: 'University personnel',
      idLabel: 'Employee ID',
      idField: 'employeeId'
    }
  }

  const account = accountTypes[accountType] || accountTypes.student

  const fullName = registrationData.fullName || 'Sample User'
  const accountId = registrationData[account.idField] || 'Not provided'

  return (
    <div className="registration-success-screen">

      {/* CLINIQ Header */}
      <header className="registration-success-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="registration-success-logo"
        />
      </header>

      <main className="registration-success-content">

        {/* Success Checkmark */}
        <div className="registration-success-icon">
          <svg
            width="110"
            height="110"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M20 52 L42 73 L82 27"
              stroke="white"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Confirmation Message */}
        <h1 className="registration-success-title">
          Registration Complete
        </h1>

        <p className="registration-success-subtitle">
          Your CLINIQ account is ready.
        </p>

        {/* Account Information Card */}
        <div className="registration-success-card">
          <h2>{fullName}</h2>
          <p>{account.label}</p>
          <p>
            {account.idLabel}: {accountId}
          </p>
        </div>

        {/* Go to Home Button */}
        <button
          type="button"
          className="registration-success-home"
          onClick={() => onGoHome?.()}
        >
          Go to Home
        </button>

      </main>
    </div>
  )
}

export default RegistrationSuccess
