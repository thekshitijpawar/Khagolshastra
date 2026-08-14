'use client'

import { useState, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(localValue)
    }, 300)
    return () => clearTimeout(timeout)
  }, [localValue, onChange])

  return (
    <div className="relative animate-in">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-4 h-4 text-mute-gray"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-broadsheet-white border border-rule-gray text-folio-black placeholder-mute-gray focus:outline-none focus:border-folio-black transition-colors text-sm"
        style={{ fontFamily: 'var(--font-plantin)' }}
      />
    </div>
  )
}
