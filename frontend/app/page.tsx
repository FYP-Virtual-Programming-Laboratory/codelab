import { LandingContent } from "@/components/landing-content"
import { RainAnimation } from "@/components/rain-animation"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 relative overflow-hidden">
      <RainAnimation />
      <LandingContent />
    </div>
  )
}
