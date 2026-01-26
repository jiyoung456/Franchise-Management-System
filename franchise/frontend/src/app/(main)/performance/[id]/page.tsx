
import { MOCK_STORES } from '@/lib/mock/mockData';
import PerformanceClient from './PerformanceClient';

export async function generateStaticParams() {
    return MOCK_STORES.map((store) => ({
        id: store.id,
    }));
}

export default async function PerformanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PerformanceClient id={id} />;
}
