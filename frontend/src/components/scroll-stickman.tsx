"use client"

import { useEffect, useState } from "react"

export default function ScrollStickman() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle')
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }
      
      setLastScrollY(currentScrollY)
    }

    let timeoutId: NodeJS.Timeout
    const debouncedHandleScroll = () => {
      handleScroll()
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScrollDirection('idle')
      }, 150)
    }

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [lastScrollY])

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none scale-75">
      <div className="relative w-16 h-20">
        {/* Stickman SVG */}
        <svg
          width="64"
          height="80"
          viewBox="0 0 64 80"
          className="absolute inset-0"
        >
          {/* Head */}
          <circle cx="32" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" />
          
          {/* Body */}
          <line x1="32" y1="14" x2="32" y2="45" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" />
          
          {/* Left Arm */}
          <line
            x1="32"
            y1="22"
            x2={scrollDirection === 'up' ? "20" : "18"}
            y2={scrollDirection === 'up' ? "18" : "35"}
            stroke="currentColor"
            strokeWidth="2"
            className={`text-blue-600 dark:text-blue-400 transition-all duration-300 ${scrollDirection === 'up' ? 'animate-pulse' : ''}`}
          />
          
          {/* Right Arm */}
          <line
            x1="32"
            y1="22"
            x2={scrollDirection === 'up' ? "44" : "46"}
            y2={scrollDirection === 'up' ? "18" : "35"}
            stroke="currentColor"
            strokeWidth="2"
            className={`text-blue-600 dark:text-blue-400 transition-all duration-300 ${scrollDirection === 'up' ? 'animate-pulse' : ''}`}
          />
          
          {/* Legs */}
          <line x1="32" y1="45" x2="24" y2="65" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" />
          <line x1="32" y1="45" x2="40" y2="65" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400" />
          
          {/* Dumbbell */}
          <g
            className={`transition-all duration-300 ${scrollDirection === 'down' ? 'translate-y-4' : scrollDirection === 'up' ? '-translate-y-2' : ''}`}
            style={{ transformOrigin: '32px 30px' }}
          >
            <line
              x1="20"
              y1={scrollDirection === 'up' ? "25" : "40"}
              x2="44"
              y2={scrollDirection === 'up' ? "25" : "40"}
              stroke="currentColor"
              strokeWidth="3"
              className="text-gray-700 dark:text-gray-300"
            />
            <rect
              x="16"
              y={scrollDirection === 'up' ? "22" : "37"}
              width="8"
              height="6"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
              rx="1"
            />
            <rect
              x="40"
              y={scrollDirection === 'up' ? "22" : "37"}
              width="8"
              height="6"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
              rx="1"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
