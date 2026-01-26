
import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import ReportClient from './ReportClient';

export async function generateStaticParams() {
    return MOCK_INSPECTIONS.map((inspection) => ({
        id: inspection.id,
    }));
}


export default async function InspectionReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ReportClient id={id} />;
}

