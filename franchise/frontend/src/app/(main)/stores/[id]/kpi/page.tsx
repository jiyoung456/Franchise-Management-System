import { StoreService } from '@/services/storeService';
import { StoreKPICard } from '@/components/features/stores/StoreKPICard';
import { notFound } from 'next/navigation';

export default async function StoreKPIPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const store = await StoreService.getStore(id);

    if (!store) {
        notFound();
    }

    return (
        <StoreKPICard store={store} />
    );
}
