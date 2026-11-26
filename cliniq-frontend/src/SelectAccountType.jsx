
import { useState } from 'react'
import './SelectAccountType.css'

function SelectAccountType({ onContinue, onSignIn }) {
  const [selectedType, setSelectedType] = useState('student')

  const accountTypes = [
    {
      id: 'student',
      title: 'Enrolled student',
      description: 'Currently studying at the university'
    },
    {
      id: 'applicant',
      title: 'New student applicant',
      description: 'College admission medical requirements'
    },
    {
      id: 'personnel',
      title: 'University personnel',
      description: 'Faculty or staff clinic services'
    }
  ]

  return (
    <div className="account-screen">

      {/* CLINIQ Header */}
      <header className="account-header">
        <img
          src="/cliniq-header.png"
          alt="CLINIQ Logo"
          className="account-logo"
        />
      </header>

      <main className="account-content">

        {/* Page Title */}
        <h1 className="account-title">
          Create an
          <br />
          <span>Account</span>
        </h1>

        {/* Account Type Options */}
        <div className="account-options">
          {accountTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`account-option ${
                selectedType === type.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedType(type.id)}
              aria-pressed={selectedType === type.id}
            >
              <div className="account-option-text">
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>

              <span className="account-arrow">❯</span>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          type="button"
          className="account-continue"
          onClick={() => onContinue?.(selectedType)}
        >
          Continue
        </button>

        {/* Sign In Link */}
        <p className="account-signin-text">
          Already registered?{' '}
          <button
            type="button"
            className="account-signin-link"
            onClick={() => onSignIn?.()}
          >
            Sign in
          </button>
        </p>

      </main>
    </div>
  )
}

export default SelectAccountType
