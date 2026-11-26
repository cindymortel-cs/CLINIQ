import { useState } from 'react'

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '',
  autoComplete,
  required = false,
  className = '',
  style = {},
  disabled = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'block',
        marginBottom: '14px',
      }}
    >
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={className}
        style={{
          width: '100%',
          margin: 0,
          marginBottom: 0,
          paddingRight: '44px',
          boxSizing: 'border-box',
          ...style,
        }}
      />

      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: '12px',
          top: 0,
          bottom: 0,
          height: '100%',
          background: 'transparent',
          border: 'none',
          padding: '0 4px',
          margin: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7a1c1c',
          touchAction: 'manipulation',
        }}
      >
        {visible ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}