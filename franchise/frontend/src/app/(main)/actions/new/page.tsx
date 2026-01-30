'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';

import { StorageService } from '@/lib/storage';
import { ActionService } from '@/services/actionService';
import { AuthService } from '@/services/authService';
import { EventService } from '@/services/eventService';
import { StoreService } from '@/services/storeService';
import { EventLog, User } from '@/types';

function ActionNewForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    const [event, setEvent] = useState<EventLog | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [supervisors, setSupervisors] = useState<User[]>([]);

    const [formData, setFormData] = useState({
        store: '',
        relatedEvent: '',
        type: 'VISIT', // Use ActionType enum values
        assignee: '', // This will be assignedToUserId
        assigneeName: '자동 지정',
        metric: 'QSC',
        deadline: '',
        priority: 'HIGH',
        title: '',
        description: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            StorageService.init();

            // 1. Get current user
            const user = await AuthService.getCurrentUser();
            setCurrentUser(user);
            if (user && user.role === 'SUPERVISOR') {
                setFormData(prev => ({
                    ...prev,
                    assignee: user.id || '',
                    assigneeName: user.userName || ''
                }));
            }

            // 2. Load supervisors if manager
            let svList: User[] = [];
            if (user && user.role === 'MANAGER') {
                const allUsers = await AuthService.getUsers();
                svList = allUsers.filter(u => u.role === 'SUPERVISOR');

                // [Fallback] If users cannot be fetched (e.g. 403 Forbidden), collect SVs from other sources
                if (svList.length === 0) {
                    console.log('Fetching supervisors from fallback sources...');

                    // a) From current and recent actions
                    try {
                        const actions = await ActionService.getActions();
                        const uniqueSvs = new Map<string, User>();
                        actions.forEach(act => {
                            if (act.assignee && act.assigneeName) {
                                uniqueSvs.set(act.assignee, {
                                    id: act.assignee,
                                    userName: act.assigneeName,
                                    loginId: '', email: '', role: 'SUPERVISOR', accountStatus: true,
                                    createdAt: '', updatedAt: ''
                                } as User);
                            }
                        });

                        // b) From recent events
                        const events = await EventService.getEvents({ limit: 50 });
                        events.forEach(evt => {
                            // If event data has assignedToUserId and it's not the manager
                            if (evt.assignedToUserId && evt.assignedToUserId.toString() !== user.id) {
                                const id = evt.assignedToUserId.toString();
                                if (!uniqueSvs.has(id)) {
                                    uniqueSvs.set(id, {
                                        id: id,
                                        userName: '담당자 (ID: ' + id + ')',
                                        loginId: '', email: '', role: 'SUPERVISOR', accountStatus: true,
                                        createdAt: '', updatedAt: ''
                                    } as User);
                                }
                            }
                        });

                        svList = Array.from(uniqueSvs.values());
                    } catch (err) {
                        console.error('Fallback fetch failed', err);
                    }
                }
                setSupervisors(svList);
            }

            // 3. Load event and store data
            if (eventId) {
                try {
                    // Try to get real event data first
                    const realEvent = await EventService.getEvent(eventId);
                    if (realEvent) {
                        setEvent(realEvent);
                        setFormData(prev => ({
                            ...prev,
                            store: realEvent.storeName,
                            relatedEvent: `이벤트 #${realEvent.id} (${realEvent.type})`,
                            priority: realEvent.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
                        }));

                        // If manager, try to find the supervisor of this store
                        if (user?.role === 'MANAGER' && realEvent.storeId) {
                            const storeDetail = await StoreService.getStoreDetail(realEvent.storeId);
                            if (storeDetail) {
                                // If the store has a supervisor login Id, check if we found them in our list
                                // Actually, we don't have IDs for most unless they appear in actions/events.
                                // But if the event itself has an assignee, use it!
                                if (realEvent.assignedToUserId) {
                                    const svId = realEvent.assignedToUserId.toString();
                                    setFormData(prev => ({
                                        ...prev,
                                        assignee: svId,
                                        assigneeName: svList.find(s => s.id === svId)?.userName || `담당자 (ID: ${svId})`
                                    }));
                                }
                            }
                        }
                    } else {
                        // Fallback to storage service for demo data
                        const found = StorageService.getEvent(eventId);
                        if (found) {
                            setEvent(found);
                            setFormData(prev => ({
                                ...prev,
                                store: found.storeName,
                                relatedEvent: `이벤트 #${found.id} (${found.type})`,
                                priority: found.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
                            }));
                        }
                    }
                } catch (err) {
                    console.error('Failed to load event detail', err);
                }
            }
        };

        loadInitialData();
    }, [eventId]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 등록</h1>
            </div>

            {/* Form Table */}
            <div className="bg-white border border-gray-400 rounded-sm">
                <div className="divide-y divide-gray-200">
                    {/* Read Only Fields */}
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">대상 점포</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.store || '-'} (이벤트 연동)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.relatedEvent || '-'} (이벤트 연동)</div>
                    </div>

                    {/* Editable Fields */}
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">조치 유형</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                            >
                                <option value="교육">교육</option>
                                <option value="방문">방문</option>
                                <option value="재점검">재점검</option>
                                <option value="프로모션">프로모션</option>
                                <option value="시설 개선">시설 개선</option>
                                <option value="인력 보강">인력 보강</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">담당자</div>
                        <div className="flex-1 p-2">
                            {currentUser?.role === 'MANAGER' ? (
                                <select
                                    className="w-full border border-gray-300 p-2 rounded bg-white"
                                    value={formData.assignee}
                                    onChange={(e) => {
                                        const sv = supervisors.find(s => s.id === e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            assignee: e.target.value,
                                            assigneeName: sv?.userName || ''
                                        }));
                                    }}
                                >
                                    <option value="">담당자를 선택하세요</option>
                                    {supervisors.map(sv => (
                                        <option key={sv.id} value={sv.id}>
                                            {sv.userName} ({sv.team || 'SV'})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-2 text-gray-500 bg-gray-50 h-full flex items-center">
                                    {formData.assigneeName} (자동)
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">목표 지표</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.metric}
                                onChange={(e) => handleChange('metric', e.target.value)}
                            >
                                <option value="QSC">QSC</option>
                                <option value="매출">매출</option>
                                <option value="위생점수">위생점수</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">기한</div>
                        <div className="flex-1 p-2">
                            <input
                                type="date"
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">우선순위</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                            >
                                <option value="CRITICAL">CRITICAL (즉시 조치)</option>
                                <option value="HIGH">HIGH (빠른 대응)</option>
                                <option value="MEDIUM">MEDIUM (관리 필요)</option>
                                <option value="LOW">LOW (관찰/개선)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title & Description */}
            <div className="border border-gray-400 rounded-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">제목</div>
                    <div className="flex-1 p-2">
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="조치 제목을 입력하세요"
                        />
                    </div>
                </div>
                <div className="p-4 bg-white">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">조치 내용</h3>
                    <textarea
                        className="w-full h-40 p-4 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="조치 내용을 상세히 입력하세요."
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={async () => {
                        if (currentUser?.role === 'MANAGER' && !formData.assignee) {
                            alert('담당자를 선택해주세요.');
                            return;
                        }
                        if (!formData.title) {
                            alert('제목을 입력해주세요.');
                            return;
                        }

                        // 1. Create Action Request for Backend
                        const actionReq = {
                            storeId: Number(event?.storeId || 0),
                            title: formData.title,
                            description: formData.description,
                            actionType: formData.type === '방문' ? 'VISIT' :
                                formData.type === '교육' ? 'TRAINING' :
                                    formData.type === '프로모션' ? 'PROMOTION' :
                                        formData.type === '시설 개선' ? 'FACILITY' :
                                            formData.type === '인력 보강' ? 'PERSONNEL' : 'VISIT',
                            priority: formData.priority,
                            dueDate: formData.deadline,
                            assignedToUserId: Number(formData.assignee),
                            relatedEventId: event ? Number(event.id) : undefined
                        };

                        // 2. Save Action via ActionService
                        const result = await ActionService.createAction(actionReq);

                        if (result) {
                            // 3. Update Event Status (Local storage for sync)
                            if (event) {
                                const updatedEvent = { ...event, status: 'ACKNOWLEDGED' as any };
                                StorageService.saveEvent(updatedEvent);
                            }

                            alert('조치가 등록되었습니다.');
                            router.push(`/events`);
                        } else {
                            alert('조치 등록에 실패했습니다.');
                        }
                    }}
                    className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded hover:bg-blue-700 shadow-sm"
                >
                    등록
                </button>
            </div>
        </div>
    );
}

export default function ActionNewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActionNewForm />
        </Suspense>
    );
}
