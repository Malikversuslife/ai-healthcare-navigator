import Composer from './Composer'

interface WelcomeViewProps {
  onSend: (message: string) => void
  isLoading: boolean
}

const STARTER_ACTIONS = [
  "I've had a headache since yesterday",
  "I need to see an eye doctor",
  "Find a clinic near me",
  "I have a red, teary eye",
]

function WelcomeLandscape() {
  return (
    <div className="welcome-landscape" aria-hidden="true">
      <svg viewBox="0 0 1440 350" preserveAspectRatio="xMidYMax slice" role="presentation">
        <path className="landscape-hill hill-back" d="M0 248C140 208 243 240 356 215c135-30 210-76 368-45 154 31 241 89 376 59 127-29 201-78 340-45v166H0Z" />
        <path className="landscape-hill hill-front" d="M0 282c127-44 231-23 352-56 131-36 206-79 356-43 130 31 214 77 340 46 160-40 224-61 392-23v94H0Z" />
        <path className="hanya-path" d="M690 350c-9-56 21-79 7-116-13-34-77-39-88-77-12-43 34-61 76-77 53-20 111-41 126-88" />
        <g className="landscape-home">
          <path d="M172 277v-49l37-29 38 29v49Z" /><path d="M163 229l46-36 46 36" /><path d="M197 277v-27h24v27M184 230h12v12h-12zm38 0h12v12h-12z" />
        </g>
        <g className="landscape-pharmacy">
          <path d="M418 282v-68h74v68Z" /><path d="M408 214h94v12h-94z" /><path d="M445 247h20v35h-20zm-16-22h15v14h-15zm37 0h15v14h-15z" /><path className="cross" d="M503 226h10v-10h11v10h10v11h-10v10h-11v-10h-10z" />
        </g>
        <g className="landscape-clinic">
          <path d="M884 277v-83h92v83Z" /><path d="M870 194h120v13H870z" /><path d="M903 217h18v17h-18zm35 0h18v17h-18zm-35 33h18v27h-18zm35 0h18v27h-18z" /><path className="cross" d="M923 181h12v-12h12v12h12v12h-12v12h-12v-12h-12z" />
        </g>
        <g className="landscape-hospital">
          <path d="M1166 290v-112h115v112Z" /><path d="M1153 178h141v13h-141z" /><path d="M1183 207h18v18h-18zm34 0h18v18h-18zm-34 37h18v18h-18zm34 0h18v18h-18z" /><path className="cross" d="M1211 163h13v-13h13v13h13v13h-13v13h-13v-13h-13z" />
        </g>
        <g className="landscape-trees">
          <path d="M300 286v-37m0 15-20-17m20 4 20-20M335 289v-44m0 19-22-18m22 7 20-25M1047 290v-42m0 18-23-18m23 5 21-22M1090 291v-50m0 22-25-20m25 5 21-28M1341 296v-57m0 25-27-22m27 6 25-29" />
          <circle cx="278" cy="238" r="22" /><circle cx="319" cy="220" r="29" /><circle cx="1041" cy="231" r="28" /><circle cx="1096" cy="220" r="32" /><circle cx="1335" cy="216" r="35" />
        </g>
        <g className="landscape-people"><circle cx="584" cy="280" r="5" /><path d="M584 286v16m0-11-8 8m8-8 8 8m-8 3-5 12m5-12 5 12" /><circle cx="808" cy="267" r="5" /><path d="M808 273v17m0-10-8 7m8-7 8 7m-8 3-5 12m5-12 5 12" /></g>
        <g className="landscape-clouds"><path d="M140 100c20-27 55-17 61 6 29-19 62 6 52 30H117c-11-18 2-34 23-36Zm865-45c17-24 49-15 54 5 25-17 55 5 46 26H985c-10-16 1-29 20-31Z" /></g>
      </svg>
    </div>
  )
}

function WelcomeView({ onSend, isLoading }: WelcomeViewProps) {
  return (
    <div className="welcome-world relative -mx-4 -mt-6 md:-mt-10 overflow-hidden flex flex-col items-center px-4 pt-12 sm:pt-16">
      <div className="welcome-content relative z-10 w-full max-w-xl text-center">
        <p className="welcome-kicker">Hanya Navigator</p>
        <h1 className="font-display text-display text-ink-900 mb-4 text-balance">
          What can I help you figure out today?
        </h1>

        <p className="text-body text-ink-500 mb-10">
          Tell Hanya what&apos;s going on. You don&apos;t need to know what kind of care you need.
        </p>

        <div className="mb-7">
          <Composer onSend={onSend} disabled={isLoading} />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {STARTER_ACTIONS.map((action) => (
            <button
              type="button"
              key={action}
              onClick={() => onSend(action)}
              disabled={isLoading}
            className="min-h-11 px-4 py-2 bg-white/90 border border-[#d7dde0] rounded-full text-body-sm text-ink-600 hover:border-aubergine-300 hover:text-aubergine-700 transition-colors disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
      <WelcomeLandscape />
    </div>
  )
}

export default WelcomeView
