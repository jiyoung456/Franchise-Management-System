import ActionDetailClient from './ActionDetailClient';
import { MOCK_ACTIONS } from '@/lib/mock/mockActionData';

export async function generateStaticParams() {
    return MOCK_ACTIONS.map((action) => ({
        id: action.id,
    }));
}

export default function ActionDetailPage({ params }: { params: { id: string } }) {
    const action = MOCK_ACTIONS.find(a => a.id === params.id) || MOCK_ACTIONS[0];

    return <ActionDetailClient action={action} id={params.id} />;
}
