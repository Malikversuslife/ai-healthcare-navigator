import MarketingHeader from './components/MarketingHeader'
import MarketingFooter from './components/MarketingFooter'
import HeroSection from './sections/HeroSection'
import ProblemSection from './sections/ProblemSection'
import UnderstandingSection from './sections/UnderstandingSection'
import NextStepSection from './sections/NextStepSection'
import ProviderDiscoverySection from './sections/ProviderDiscoverySection'
import BrandMomentSection from './sections/BrandMomentSection'
import PhotoBreakSection from './sections/PhotoBreakSection'
import TrustSection from './sections/TrustSection'
import FAQSection from './sections/FAQSection'
import ClosingSection from './sections/ClosingSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bone-100">
      <MarketingHeader />
      <main>
        {/* Moment 1: Hero + Product */}
        <HeroSection />

        {/* Moment 2: The Problem */}
        <ProblemSection />

        {/* Moment 3: How it Works (Understanding + Next Step + Provider) */}
        <UnderstandingSection />
        <NextStepSection />
        <ProviderDiscoverySection />

        {/* Moment 4: Brand + Photo Break */}
        <BrandMomentSection />
        <PhotoBreakSection />

        {/* Moment 5: Trust + FAQ */}
        <TrustSection />
        <FAQSection />

        {/* Moment 6: Closing */}
        <ClosingSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
