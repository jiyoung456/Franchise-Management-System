"use client"
import React from "react"
import type { SupervisorSummary } from "@/types/dashboard"

interface Props {
  supervisor: SupervisorSummary
  onClick?: (id: string) => void
}

export default function SupervisorCard({ supervisor, onClick }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-3 cursor-pointer" onClick={() => onClick?.(supervisor.id)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">{supervisor.name.charAt(0)}</div>
        <div>
          <div className="font-medium">{supervisor.name}</div>
          <div className="text-sm text-gray-500">{supervisor.riskyStoresCount} risky stores</div>
        </div>
      </div>
      <div className="mt-3 flex gap-3 text-sm">
        <div className="text-gray-700">Pending actions: <span className="font-semibold">{supervisor.pendingActionsCount}</span></div>
      </div>
    </div>
  )
}
