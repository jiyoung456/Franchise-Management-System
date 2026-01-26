
import TemplateClient from './TemplateClient';

export async function generateStaticParams() {
    return [{ id: 'new' }];
}

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TemplateClient id={id} />;
}
