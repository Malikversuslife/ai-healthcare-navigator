import { UserHealthContext } from '../../shared/types'

export interface AIExtractionResult {
  response: string
  extractedContext: Partial<UserHealthContext>
  isReadyForRecommendation: boolean
  followUpQuestion?: string
}

export interface AIService {
  processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult>
}
