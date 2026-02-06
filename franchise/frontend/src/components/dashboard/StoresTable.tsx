"use client"
import React from "react"
import type { StoreRiskSummary } from "@/types/dashboard"

interface Props {
  stores: StoreRiskSummary[]
  onViewReport: (store: StoreRiskSummary) => void
  onCreateAction: (store: StoreRiskSummary) => void
}

function RiskPill({ level }: { level: string }) {
  const bg = level === 'critical' ? 'bg-red-100 text-red-800' : level === 'high' ? 'bg-orange-100 text-orange-800' : level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
  return <span className={`px-2 py-1 rounded text-xs font-medium ${bg}`}>{level}</span>
}

export default function StoresTable({ stores, onViewReport, onCreateAction }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-2">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500">
          <tr>
            <th className="p-2">Store</th>
            <th className="p-2">Risk</th>
            <th className="p-2">Supervisor</th>
            <th className="p-2">AI recommendation</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(s => (
            <tr key={s.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{s.name} <div className="text-xs text-gray-400">{s.region}</div></td>
              <td className="p-2"><RiskPill level={s.riskLevel} /></td>
              <td className="p-2">{s.assignedSupervisorId ?? 'Unassigned'}</td>
              <td className="p-2">{s.aiRecommendation}</td>
              <td className="p-2 flex gap-2">
                <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => onCreateAction(s)}>Create action</button>
                <button className="border px-2 py-1 rounded" onClick={() => onViewReport(s)}>View report</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
