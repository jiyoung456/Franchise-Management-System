"use client"
import React from "react"
import type { StoreRiskSummary } from "@/types/dashboard"

interface Props {
  open: boolean
  store?: StoreRiskSummary | null
  onClose: () => void
  onCreateAction?: (store: StoreRiskSummary) => void
}

export default function StoreReportDrawer({ open, store, onClose, onCreateAction }: Props) {
  if (!open || !store) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-40">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{store.name}</h3>
          <div className="text-sm text-gray-500">Last updated: {new Date(store.lastUpdated).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="p-4 space-y-4 overflow-auto">
        <section>
          <h4 className="font-medium">Key metrics</h4>
          <div className="mt-2 text-sm text-gray-700">Hygiene score: <span className="font-semibold">64</span></div>
          <div className="text-sm text-gray-700">Sales delta: <span className="font-semibold">-8%</span></div>
        </section>

        <section>
          <h4 className="font-medium">AI reasoning</h4>
          <div className="mt-2 text-sm text-gray-700">{store.aiRecommendation}</div>
        </section>

        <section>
          <h4 className="font-medium">Actions</h4>
          <div className="mt-2">
            <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => onCreateAction?.(store)}>Create action</button>
          </div>
        </section>
      </div>
    </div>
  )
}
