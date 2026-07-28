import { useState, useRef, useEffect } from 'react'
import type { Driver } from '../../types'
import { searchDrivers } from '../../utils/drivers'

interface SearchBoxProps {
  onSelect: (driver: Driver) => void
  disabled?: boolean
  guessedIds: Set<string>
}

export function SearchBox({ onSelect, disabled, guessedIds }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Driver[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const filtered = searchDrivers(query).filter((d) => !guessedIds.has(d.id))
    setResults(filtered)
    setSelectedIndex(-1)
    setIsOpen(filtered.length > 0 && query.trim().length > 0)
  }, [query, guessedIds])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (driver: Driver) => {
    onSelect(driver)
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      } else if (results.length > 0) {
        handleSelect(results[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="输入车手名字(中文或英文)..."
        className="w-full px-4 py-3 rounded-lg bg-f1-gray text-f1-text placeholder-gray-400 border-2 border-transparent focus:border-f1-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-2 bg-f1-gray border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-auto">
          {results.map((driver, idx) => (
            <li
              key={driver.id}
              onClick={() => handleSelect(driver)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`px-4 py-3 cursor-pointer flex justify-between items-center ${
                idx === selectedIndex ? 'bg-f1-red' : 'hover:bg-gray-600'
              }`}
            >
              <span className="font-medium">
                {driver.nameCn ? `${driver.nameCn} (${driver.name})` : driver.name}
              </span>
              <span className="text-sm text-gray-400">
                {driver.teamCn ? `${driver.teamCn} (${driver.team})` : driver.team}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
