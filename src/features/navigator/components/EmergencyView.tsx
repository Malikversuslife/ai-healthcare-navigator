import { emergencyConfig } from '../../../shared/config'

interface EmergencyViewProps {
  onFindEmergencyCare: () => void
}

function EmergencyView({ onFindEmergencyCare }: EmergencyViewProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h2 className="font-display text-heading text-ink-900 mb-3">
        {emergencyConfig.emergencyTitle}
      </h2>

      <p className="text-body text-ink-600 mb-8 max-w-md mx-auto leading-relaxed">
        {emergencyConfig.emergencyBody}
      </p>

      <a
        href={`tel:${emergencyConfig.emergencyNumber}`}
        className="inline-block px-8 py-4 bg-red-600 text-white rounded-2xl font-semibold text-body-lg hover:bg-red-700 transition-colors mb-4"
      >
        Call {emergencyConfig.emergencyNumber}
      </a>

      <div className="mt-4">
        <button
          onClick={onFindEmergencyCare}
          className="text-body-sm text-ink-500 hover:text-ink-700 transition-colors underline"
        >
          Find nearest emergency care
        </button>
      </div>

      <p className="text-caption text-ink-400 mt-8 max-w-sm mx-auto leading-relaxed">
        {emergencyConfig.safetyDisclaimer}
      </p>
    </div>
  )
}

export default EmergencyView
