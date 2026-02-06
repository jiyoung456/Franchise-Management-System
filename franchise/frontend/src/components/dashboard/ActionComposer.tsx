"use client"
import React, { useState } from "react"
import type { StoreRiskSummary } from "@/types/dashboard"

interface Props {
  store?: StoreRiskSummary | null
  onSubmit: (payload: { title: string; description: string; assigneeId?: string }) => void
}

export default function ActionComposer({ store, onSubmit }: Props) {
  const [title, setTitle] = useState(store ? `Follow up: ${store.name}` : "New action")
  const [description, setDescription] = useState(store?.aiRecommendation ?? "")
  const [assignee, setAssignee] = useState<string | undefined>(store?.assignedSupervisorId)

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="text-sm text-gray-700 mb-2">Create action</div>
      <input className="w-full border px-2 py-1 mb-2" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full border px-2 py-1 mb-2" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
      <div className="flex gap-2">
        <input className="border px-2 py-1" placeholder="Assignee ID" value={assignee ?? ""} onChange={e => setAssignee(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => onSubmit({ title, description, assigneeId: assignee })}>Submit</button>
      </div>
    </div>
  )
}
