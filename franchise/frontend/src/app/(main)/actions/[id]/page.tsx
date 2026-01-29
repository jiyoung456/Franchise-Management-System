import ActionDetailClient from './ActionDetailClient';
export const dynamic = 'force-dynamic';

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ActionDetailClient id={id} />;
}
