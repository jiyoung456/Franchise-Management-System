import { Suspense } from 'react';
import { MOCK_STORES } from '@/lib/mock/mockData';
import StoreDetailContent from './StoreDetailContent';

export async function generateStaticParams() {
    return MOCK_STORES.map((store) => ({
        id: store.id,
    }));
}

export default function StoreDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StoreDetailContent />
        </Suspense>
    );
}
