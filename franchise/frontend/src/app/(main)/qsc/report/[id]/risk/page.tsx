
import RiskReportClient from './RiskReportClient';
import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';

export async function generateStaticParams() {
    return MOCK_INSPECTIONS.map((inspection) => ({
        id: inspection.id,
    }));
}

export default async function RiskReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RiskReportClient id={id} />;
}
