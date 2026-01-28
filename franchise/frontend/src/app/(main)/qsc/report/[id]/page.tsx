
import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import ReportClient from './ReportClient';

export async function generateStaticParams() {
    return MOCK_INSPECTIONS.map((inspection) => ({
        id: inspection.id,
    }));
}


export default async function InspectionReportPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params;
    const { storeId } = await searchParams;

    // storeId can be string or array, extract first if array
    const storeIdStr = Array.isArray(storeId) ? storeId[0] : storeId;

    return <ReportClient id={id} storeId={storeIdStr} />;
}

