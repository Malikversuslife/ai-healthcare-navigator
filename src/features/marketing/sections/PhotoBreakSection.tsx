export default function PhotoBreakSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed photography — human moment, intentional crop */}
      <div className="absolute inset-0">
        <img
          src="/images/human-break.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_25%] sm:object-center photo-warm"
        />
        {/* Subtle overlay for text contrast — photograph remains dominant */}
        <div className="absolute inset-0 bg-ink-900/35" />
      </div>

      {/* Content — minimal, quiet */}
      <div className="relative z-10 text-center px-5 max-w-2xl">
        <h2 className="font-display text-display-xl text-bone-100 text-balance">
          Healthcare decisions<br />
          <span className="italic text-aubergine-300">happen everywhere.</span>
        </h2>
        <p className="text-body-lg text-soft-stone-200 mt-6">
          Not just in hospitals.
        </p>
      </div>
    </section>
  )
}
