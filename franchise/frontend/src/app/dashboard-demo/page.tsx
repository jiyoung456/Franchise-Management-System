"use client"
import React, { useState, useEffect } from "react"
import AIInsightsCard from "@/components/dashboard/AIInsightsCard"
import StoresTable from "@/components/dashboard/StoresTable"
import SupervisorCard from "@/components/dashboard/SupervisorCard"
import StoreReportDrawer from "@/components/dashboard/StoreReportDrawer"
import ActionComposer from "@/components/dashboard/ActionComposer"
import { fetchDashboardMock } from "@/services/dashboardService"
import type { StoreRiskSummary } from "@/types/dashboard"

export default function DashboardDemoPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [stores, setStores] = useState<StoreRiskSummary[]>([])
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeStore, setActiveStore] = useState<StoreRiskSummary | null>(null)

  useEffect(() => {
    fetchDashboardMock().then(data => {
      setInsights(data.insights)
      setStores(data.stores)
      setSupervisors(data.supervisors)
    })
  }, [])

  function handleViewReport(store: StoreRiskSummary) {
    setActiveStore(store)
    setDrawerOpen(true)
  }

  function handleCreateAction(storeOrIds: any) {
    // simple demo behavior: log and update UI if needed
    console.log('Create action', storeOrIds)
    alert('Create action: ' + JSON.stringify(storeOrIds))
  }

  return (
    <div className="p-6">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manager Dashboard (Demo)</h1>
      </header>

      {insights.length > 0 && (
        <AIInsightsCard insight={insights[0]} onCreateAction={ids => handleCreateAction(ids)} onViewAffected={ids => { /* could filter table */ }} />
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <StoresTable stores={stores} onViewReport={handleViewReport} onCreateAction={s => handleCreateAction(s)} />
        </div>
        <aside className="col-span-1 space-y-3">
          {supervisors.map((sup: any) => (
            <SupervisorCard key={sup.id} supervisor={sup} onClick={id => alert('Filter to ' + id)} />
          ))}
        </aside>
      </div>

      <StoreReportDrawer open={drawerOpen} store={activeStore} onClose={() => setDrawerOpen(false)} onCreateAction={(s) => handleCreateAction(s)} />

      <div className="mt-6">
        <ActionComposer store={activeStore} onSubmit={(payload) => { console.log('Submitted action', payload); alert('Submitted action'); }} />
      </div>
    </div>
  )
}
