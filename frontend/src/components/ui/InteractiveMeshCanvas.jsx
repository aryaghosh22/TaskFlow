import { useEffect, useRef } from 'react'

export default function InteractiveMeshCanvas({ mousePos, isHovered }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = null
    let rows = 0
    let cols = 0
    let grid = []

    const SPACING = 38
    const RADIUS = 200 // Smooth light radius
    const FADE_SPEED = 0.12 // Smooth, luxurious lighting transition speed

    const initGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      cols = Math.ceil(width / SPACING) + 2
      rows = Math.ceil(height / SPACING) + 2

      const startX = (width - (cols - 1) * SPACING) / 2
      const startY = (height - (rows - 1) * SPACING) / 2

      grid = []
      for (let r = 0; r < rows; r++) {
        const row = []
        for (let c = 0; c < cols; c++) {
          row.push({
            x: startX + c * SPACING,
            y: startY + r * SPACING,
            intensity: 0, // Lighting intensity: 0 (resting) to 1 (full glow)
          })
        }
        grid.push(row)
      }
    }

    initGrid()

    let resizeTimer = null
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initGrid, 100)
    }
    window.addEventListener('resize', handleResize)

    // Render Loop (Pure illumination & radiance, zero physical displacement/elasticity)
    const render = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const mx = mousePos.current.x
      const my = mousePos.current.y
      const active = isHovered.current

      ctx.clearRect(0, 0, width, height)

      // 1. Update lighting intensity for each node smoothly
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const node = grid[r][c]
          let targetIntensity = 0

          if (active) {
            const dx = node.x - mx
            const dy = node.y - my
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < RADIUS) {
              // Smooth, luxurious cubic ease-out radiance falloff
              targetIntensity = Math.pow(1 - dist / RADIUS, 1.6)
            }
          }

          // Silky smooth asymptotic lighting fade (no elasticity, zero overshoot)
          node.intensity += (targetIntensity - node.intensity) * FADE_SPEED
          if (node.intensity < 0.001) node.intensity = 0
        }
      }

      // 2. Draw Grid Lines (Crisp architectural grid with glowing active lines)
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)'
      ctx.lineWidth = 0.8

      const activeSegments = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const node = grid[r][c]

          // Right neighbor line
          if (c + 1 < cols) {
            const rightNode = grid[r][c + 1]
            const lineIntensity = (node.intensity + rightNode.intensity) / 2

            if (lineIntensity > 0.02) {
              activeSegments.push({
                x1: node.x,
                y1: node.y,
                x2: rightNode.x,
                y2: rightNode.y,
                intensity: lineIntensity,
              })
            } else {
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(rightNode.x, rightNode.y)
            }
          }

          // Bottom neighbor line
          if (r + 1 < rows) {
            const bottomNode = grid[r + 1][c]
            const lineIntensity = (node.intensity + bottomNode.intensity) / 2

            if (lineIntensity > 0.02) {
              activeSegments.push({
                x1: node.x,
                y1: node.y,
                x2: bottomNode.x,
                y2: bottomNode.y,
                intensity: lineIntensity,
              })
            } else {
              ctx.moveTo(node.x, node.y)
              ctx.lineTo(bottomNode.x, bottomNode.y)
            }
          }
        }
      }
      ctx.stroke()

      // Draw active illuminated mesh lines
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i]
        const alpha = 0.06 + seg.intensity * 0.44
        ctx.beginPath()
        ctx.strokeStyle = `rgba(129, 140, 248, ${alpha.toFixed(3)})`
        ctx.lineWidth = 0.8 + seg.intensity * 0.8
        ctx.moveTo(seg.x1, seg.y1)
        ctx.lineTo(seg.x2, seg.y2)
        ctx.stroke()
      }

      // 3. Draw Nodes (Fixed crisp grid points that illuminate and expand smoothly)
      ctx.beginPath()
      ctx.fillStyle = 'rgba(148, 163, 184, 0.18)'
      const activeNodes = []

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const node = grid[r][c]

          if (node.intensity > 0.02) {
            activeNodes.push(node)
          } else {
            ctx.moveTo(node.x + 1.2, node.y)
            ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2)
          }
        }
      }
      ctx.fill()

      // Draw highlighted, radiant reactive nodes
      for (let i = 0; i < activeNodes.length; i++) {
        const node = activeNodes[i]
        const radius = 1.2 + node.intensity * 1.8 // Crisp expansion from 1.2px to 3.0px
        const alpha = 0.2 + node.intensity * 0.8

        // Soft ambient aura halo for nodes under spotlight
        if (node.intensity > 0.25) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(56, 189, 248, ${(node.intensity * 0.32).toFixed(3)})`
          ctx.arc(node.x, node.y, radius * 2.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Crisp luminous node point
        ctx.beginPath()
        ctx.fillStyle = `rgba(165, 180, 252, ${alpha.toFixed(3)})`
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [mousePos, isHovered])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
