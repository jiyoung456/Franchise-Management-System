import { EventLog } from '@/types';
import { MOCK_EVENTS } from '@/lib/mock/mockEventData';

const STORAGE_KEY = 'fms_events';

export const EventService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
        }
    },

    getEvents: (): EventLog[] => {
        if (typeof window === 'undefined') return MOCK_EVENTS;
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : MOCK_EVENTS;
    },

    getEvent: (id: string): EventLog | undefined => {
        const events = EventService.getEvents();
        return events.find(e => e.id === id);
    },

    saveEvent: (event: EventLog) => {
        const events = EventService.getEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index !== -1) {
            events[index] = event;
        } else {
            events.unshift(event);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
};
