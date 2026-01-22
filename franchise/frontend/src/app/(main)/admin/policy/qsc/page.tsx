'use client';

import { useState } from 'react';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QscCriteriaPage() {
    const router = useRouter();

    // Mock initial config
    const [grades, setGrades] = useState([
        { grade: 'S', min: 95, max: 100, color: 'text-green-600', bg: 'bg-green-50' },
        { grade: 'A', min: 90, max: 94, color: 'text-blue-600', bg: 'bg-blue-50' },
        { grade: 'B', min: 80, max: 89, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { grade: 'C', min: 70, max: 79, color: 'text-orange-600', bg: 'bg-orange-50' },
        { grade: 'D', min: 0, max: 69, color: 'text-red-600', bg: 'bg-red-50' },
    ]);

    const handleRangeChange = (idx: number, field: 'min' | 'max', value: number) => {
        const newGrades = [...grades];
        newGrades[idx] = { ...newGrades[idx], [field]: value };
        setGrades(newGrades);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">QSC 등급 산정 기준</h1>
                    <p className="text-sm text-gray-500">
                        점검 총점에 따른 등급(S~D) 매핑 구간을 설정합니다.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">등급 (Grade)</th>
                            <th className="px-6 py-4">최소 점수 (Min)</th>
                            <th className="px-6 py-4">최대 점수 (Max)</th>
                            <th className="px-6 py-4">비고</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {grades.map((item, idx) => (
                            <tr key={item.grade} className="group hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${item.bg} ${item.color} border-current opacity-80`}>
                                        {item.grade}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={item.min}
                                            onChange={(e) => handleRangeChange(idx, 'min', Number(e.target.value))}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <span className="absolute right-[-10px] top-1.5 text-gray-400">~</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={item.max}
                                        onChange={(e) => handleRangeChange(idx, 'max', Number(e.target.value))}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {item.grade === 'D' && <span className="text-xs text-red-500 font-medium flex items-center"><HelpCircle className="w-3 h-3 mr-1" />즉시 재점검 대상</span>}
                                    {item.grade === 'S' && <span className="text-xs text-green-600 font-medium">우수 점포 포상 대상</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-2">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
                    초기화
                </button>
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                    onClick={() => alert('등급 기준이 저장되었습니다.')}
                >
                    <Save className="w-4 h-4 mr-2" />
                    저장하기
                </button>
            </div>
        </div>
    );
}
