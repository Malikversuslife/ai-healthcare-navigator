export default function PhotoBreakSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed photography placeholder */}
      {/* Required: Contemporary Nigerian person in a quiet everyday moment — */}
      {/* sitting on a couch, looking at phone, warm natural light from a window. */}
      {/* NOT a hospital. NOT a clinical setting. NOT stock corporate. */}
      <div className="absolute inset-0 bg-gradient-to-br from-soft-stone-200 via-bone-200 to-aubergine-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(90,45,95,0.08),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-5">
        <h2 className="font-display text-display-xl text-ink-900 text-balance">
          Healthcare decisions<br />
          <span className="italic text-aubergine-600">happen everywhere.</span>
        </h2>
        <p className="text-body-lg text-ink-500 mt-6 max-w-md mx-auto">
          Not just in hospitals. In living rooms. On commutes. In quiet moments when something doesn't feel right.
        </p>
      </div>
    </section>
  )
}
