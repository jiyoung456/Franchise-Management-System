import { MOCK_EVENTS } from '@/lib/mock/mockEventData';
import EventDetailClient from './EventDetailClient';

// Generate static params for 'output: export'
export async function generateStaticParams() {
    return MOCK_EVENTS.map((event) => ({
        id: event.id,
    }));
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EventDetailClient id={id} />;
}
