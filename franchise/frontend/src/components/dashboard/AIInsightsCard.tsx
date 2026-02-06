"use client"
import React from "react"
import type { UrgentInsight } from "@/types/dashboard"

interface Props {
  insight: UrgentInsight
  onCreateAction?: (ids: string[]) => void
  onViewAffected?: (ids: string[]) => void
}

export default function AIInsightsCard({ insight, onCreateAction, onViewAffected }: Props) {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{insight.headline}</h3>
          <div className="text-sm text-gray-600 mt-2">
            Confidence: {(insight.confidence * 100).toFixed(0)}%
          </div>
          <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
            {insight.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={() => onCreateAction?.(insight.affectedStoreIds)}>Create action</button>
          <button className="border px-3 py-2 rounded" onClick={() => onViewAffected?.(insight.affectedStoreIds)}>View affected stores</button>
        </div>
      </div>
    </div>
  )
}
