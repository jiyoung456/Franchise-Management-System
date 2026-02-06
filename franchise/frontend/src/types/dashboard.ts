export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'

export interface StoreRiskSummary {
  id: string
  name: string
  region?: string
  riskLevel: RiskLevel
  aiRecommendation: string
  assignedSupervisorId?: string
  lastUpdated: string
}

export interface SupervisorSummary {
  id: string
  name: string
  avatarUrl?: string
  riskyStoresCount: number
  pendingActionsCount: number
}

export interface UrgentInsight {
  id: string
  headline: string
  affectedStoreIds: string[]
  confidence: number
  details: string[]
}
