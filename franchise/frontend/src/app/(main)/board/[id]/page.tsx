import BoardDetailClient from './BoardDetailClient';

export const dynamic = 'force-dynamic';

export default async function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BoardDetailClient id={id} />;
}
