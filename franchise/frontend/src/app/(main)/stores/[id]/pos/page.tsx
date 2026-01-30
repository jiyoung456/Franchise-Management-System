'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StoreService } from '@/services/storeService';
import { StoreKPICard } from '@/components/features/stores/StoreKPICard';
import { StoreDetail } from '@/types';

export default function PosDetailPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [store, setStore] = useState<StoreDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            if (!storeId) return;
            try {
                const data = await StoreService.getStore(storeId);
                setStore(data);
            } catch (error) {
                console.error("Failed to load store", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStore();
    }, [storeId]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!store) return <div className="p-8 text-center">Store not found</div>;

    return (
        <div className="p-6">
            <StoreKPICard
                store={store}
                onBack={() => router.back()}  // Or router.push('/performance') depending on desired flow, but back is safer
                isModal={false}
                embedded={false}
            />
        </div>
    );
}
