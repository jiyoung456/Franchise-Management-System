"use client"
import { useState, useEffect } from "react"
import type { StoreRiskSummary, SupervisorSummary, UrgentInsight } from "@/types/dashboard"

export function useMockDashboard() {
  const [insights, setInsights] = useState<UrgentInsight[]>([])
  const [stores, setStores] = useState<StoreRiskSummary[]>([])
  const [supervisors, setSupervisors] = useState<SupervisorSummary[]>([])

  useEffect(() => {
    const mockSupervisors: SupervisorSummary[] = [
      { id: "s1", name: "Lee Min", avatarUrl: "", riskyStoresCount: 3, pendingActionsCount: 2 },
      { id: "s2", name: "Kim Hana", avatarUrl: "", riskyStoresCount: 1, pendingActionsCount: 0 },
      { id: "s3", name: "Park Jun", avatarUrl: "", riskyStoresCount: 0, pendingActionsCount: 1 }
    ]

    const mockStores: StoreRiskSummary[] = [
      { id: "st1", name: "Gangnam Branch A", region: "Gangnam", riskLevel: "critical", aiRecommendation: "Immediate hygiene inspection; deep clean recommended.", assignedSupervisorId: "s1", lastUpdated: new Date().toISOString() },
      { id: "st2", name: "Gangnam Branch B", region: "Gangnam", riskLevel: "high", aiRecommendation: "Schedule hygiene retraining and spot checks.", assignedSupervisorId: "s1", lastUpdated: new Date().toISOString() },
      { id: "st3", name: "Mapo Branch", region: "Mapo", riskLevel: "medium", aiRecommendation: "Monitor weekly hygiene score.", assignedSupervisorId: "s2", lastUpdated: new Date().toISOString() }
    ]

    const mockInsights: UrgentInsight[] = [
      { id: "i1", headline: "3 stores in Gangnam area show hygiene decline", affectedStoreIds: ["st1", "st2"], confidence: 0.91, details: ["Hygiene score -12% week over week", "2 negative customer feedbacks"] }
    ]

    setSupervisors(mockSupervisors)
    setStores(mockStores)
    setInsights(mockInsights)
  }, [])

  return { insights, stores, supervisors }
}

export default useMockDashboard
