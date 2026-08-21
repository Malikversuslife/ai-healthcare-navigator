import { emergencyConfig } from '../../../shared/config'

interface EmergencyAlertProps {
  onFindEmergencyCare: () => void
}

function EmergencyAlert({ onFindEmergencyCare }: EmergencyAlertProps) {
  return (
    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">🚨</span>
        <div>
          <h3 className="text-lg font-semibold text-red-900">
            {emergencyConfig.emergencyTitle}
          </h3>
        </div>
      </div>

      {/* Body */}
      <p className="text-red-800 mb-4 leading-relaxed">
        {emergencyConfig.emergencyBody}
      </p>

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        <a
          href={`tel:${emergencyConfig.emergencyNumber}`}
          className="flex items-center justify-center w-full px-6 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
        >
          Call {emergencyConfig.emergencyNumber} Now
        </a>

        <button
          onClick={onFindEmergencyCare}
          className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition-colors"
        >
          Find nearest emergency care
        </button>
      </div>

      {/* Safety Disclaimer */}
      <p className="text-xs text-red-600 leading-relaxed">
        {emergencyConfig.safetyDisclaimer}
      </p>
    </div>
  )
}

export default EmergencyAlert
