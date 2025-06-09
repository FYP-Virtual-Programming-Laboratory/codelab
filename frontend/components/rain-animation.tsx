"use client"

import { useEffect, useState } from "react"

interface Raindrop {
  id: number
  left: number
  animationDuration: number
  opacity: number
  size: number
}

export function RainAnimation() {
  const [raindrops, setRaindrops] = useState<Raindrop[]>([])

  useEffect(() => {
    const drops: Raindrop[] = []
    for (let i = 0; i < 100; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: Math.random() * 3 + 2, // 2-5 seconds
        opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
        size: Math.random() * 3 + 1, // 1-4px
      })
    }
    setRaindrops(drops)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {raindrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute bg-white/30 rounded-full animate-bounce"
          style={{
            left: `${drop.left}%`,
            width: `${drop.size}px`,
            height: `${drop.size * 4}px`,
            opacity: drop.opacity,
            animation: `fall ${drop.animationDuration}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  )
}
