import { useEffect, useRef, useState } from 'react'
import InteractiveMeshCanvas from './InteractiveMeshCanvas'

export default function InteractiveMeshBackground({ children, className = '' }) {
  const containerRef = useRef(null)
  const spotlightRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const isHoveredRef = useRef(false)
  const hasMoved = useRef(false)

  // Target and interpolated position
  const mousePos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const animFrame = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Initialize to center of container
    const rect = container.getBoundingClientRect()
    const initialX = rect.width / 2
    const initialY = rect.height / 2
    mousePos.current = { x: initialX, y: initialY }
    currentPos.current = { x: initialX, y: initialY }

    const handleMouseMove = (e) => {
      const containerRect = container.getBoundingClientRect()
      const x = e.clientX - containerRect.left
      const y = e.clientY - containerRect.top
      mousePos.current = { x, y }

      // On first cursor movement inside container, instantly snap to cursor without lag
      if (!hasMoved.current) {
        currentPos.current = { x, y }
        hasMoved.current = true
      }
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      isHoveredRef.current = true
    }
    const handleMouseLeave = () => {
      setIsHovered(false)
      isHoveredRef.current = false
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    // Snappy, closely-following animation loop
    const updatePosition = () => {
      const factor = 0.28
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * factor
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * factor

      const curX = currentPos.current.x
      const curY = currentPos.current.y

      // Position spotlight orb centered directly at (curX, curY)
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`
      }

      animFrame.current = requestAnimationFrame(updatePosition)
    }

    animFrame.current = requestAnimationFrame(updatePosition)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (animFrame.current) {
        cancelAnimationFrame(animFrame.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 select-none ${className}`}
    >
      {/* 1. Ambient atmospheric breathing corner orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[130px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/18 blur-[130px] animate-pulse"
        style={{ animationDuration: '10s' }}
      />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[150px]" />

      {/* 2. Dynamic glowing spotlight orb closely following mouse hover */}
      <div
        ref={spotlightRef}
        className={`pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] rounded-full will-change-transform transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.22) 35%, rgba(56, 189, 248, 0.12) 55%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />

      {/* 3. Interactive Elastic Mesh where every node reacts to mouse */}
      <InteractiveMeshCanvas mousePos={mousePos} isHovered={isHoveredRef} />

      {/* Card Content Layer */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
