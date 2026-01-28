import ActionDetailClient from './ActionDetailClient';
import { MOCK_ACTIONS } from '@/lib/mock/mockActionData';

export async function generateStaticParams() {
    return MOCK_ACTIONS.map((action) => ({
        id: action.id,
    }));
}

export default async function ActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const action = MOCK_ACTIONS.find(a => a.id === id) || MOCK_ACTIONS[0];

    return <ActionDetailClient action={action} id={id} />;
}
