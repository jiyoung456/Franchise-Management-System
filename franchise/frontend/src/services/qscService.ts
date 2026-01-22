import { QSCTemplate, Inspection } from '@/types';
import { MOCK_TEMPLATES, MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import { StoreService } from './storeService'; // Use other service if needed

const KEY_TEMPLATES = 'fms_qsc_templates';
const KEY_INSPECTIONS = 'fms_inspections';

export const QscService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(KEY_TEMPLATES)) {
            localStorage.setItem(KEY_TEMPLATES, JSON.stringify(MOCK_TEMPLATES));
        }
        if (!localStorage.getItem(KEY_INSPECTIONS)) {
            localStorage.setItem(KEY_INSPECTIONS, JSON.stringify(MOCK_INSPECTIONS));
        }
    },

    // Templates
    getTemplates: (): QSCTemplate[] => {
        if (typeof window === 'undefined') return MOCK_TEMPLATES;
        const json = localStorage.getItem(KEY_TEMPLATES);
        return json ? JSON.parse(json) : MOCK_TEMPLATES;
    },

    getTemplate: (id: string): QSCTemplate | undefined => {
        const templates = QscService.getTemplates();
        return templates.find(t => t.id === id);
    },

    saveTemplate: (template: QSCTemplate) => {
        const templates = QscService.getTemplates();
        const index = templates.findIndex(t => t.id === template.id);

        if (index !== -1) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        localStorage.setItem(KEY_TEMPLATES, JSON.stringify(templates));
    },

    deleteTemplate: (id: string) => {
        const templates = QscService.getTemplates();
        const newTemplates = templates.filter(t => t.id !== id);
        localStorage.setItem(KEY_TEMPLATES, JSON.stringify(newTemplates));
    },

    // Inspections
    getInspections: (): Inspection[] => {
        if (typeof window === 'undefined') return MOCK_INSPECTIONS;
        const json = localStorage.getItem(KEY_INSPECTIONS);
        return json ? JSON.parse(json) : MOCK_INSPECTIONS;
    },

    getInspection: (id: string): Inspection | undefined => {
        const inspections = QscService.getInspections();
        return inspections.find(i => i.id === id);
    },

    saveInspection: (inspection: Inspection) => {
        const inspections = QscService.getInspections();
        const index = inspections.findIndex(i => i.id === inspection.id);
        if (index !== -1) {
            inspections[index] = inspection;
        } else {
            inspections.unshift(inspection);
        }
        localStorage.setItem(KEY_INSPECTIONS, JSON.stringify(inspections));
    }
};
