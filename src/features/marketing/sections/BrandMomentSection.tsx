import PathwayGraphic from '../components/PathwayGraphic'

export default function BrandMomentSection() {
  return (
    <section className="bg-ink-900 py-section-lg overflow-hidden">
      <div className="section-narrow text-center">
        <h2 className="font-display text-display-xl text-bone-100 mb-16 text-balance">
          From uncertainty<br />
          <span className="italic text-aubergine-300">to direction.</span>
        </h2>

        {/* Pathway graphic — large, centered, art-directed */}
        <div className="flex justify-center mb-16">
          <PathwayGraphic className="w-full max-w-lg" activeSteps={3} />
        </div>

        {/* Subtle decorative elements */}
        <div className="flex justify-center gap-1.5 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-aubergine-400" />
          ))}
        </div>
      </div>
    </section>
  )
}
