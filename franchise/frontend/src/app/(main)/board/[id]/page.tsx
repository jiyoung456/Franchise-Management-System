import { MOCK_NOTICES } from '@/lib/storage';
import BoardDetailClient from './BoardDetailClient';

export function generateStaticParams() {
    return MOCK_NOTICES.map((notice) => ({
        id: notice.id,
    }));
}

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BoardDetailClient id={id} />;
}
