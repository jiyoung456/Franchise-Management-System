import api from '@/lib/api';

export interface BoardPost {
    id: number;
    title: string;
    createdByUserId: number;
    createdAt: string; // ISO string from LocalDateTime
    viewCount: number;
    isPinned: boolean;
}

export interface BoardDetail {
    id: number;
    title: string;
    content: string;
    createdByUserId: number;
    createdAt: string;
    viewCount: number;
    isPinned: boolean;
}

export const BoardService = {
    // GET /api/board/posts?keyword=...
    getPosts: async (keyword?: string): Promise<BoardPost[]> => {
        const params = keyword ? { keyword } : {};
        const response = await api.get<BoardPost[]>('/board/posts', { params });
        return response.data;
    },

    // GET /api/board/posts/{id}
    getPost: async (id: number): Promise<BoardDetail> => {
        const response = await api.get<BoardDetail>(`/board/posts/${id}`);
        return response.data;
    },

    // For Admin: Create/Delete (Assuming these endpoints exist or will exist, but for now only Read was requested to be hooked up to what exists.
    // However, the user asked to "connect frontend to backend" and "remove mock".
    // The provided backend controller only has `getPosts` and `getPostDetail`.
    // So distinct generic write/delete methods might not be there yet or I missed them. 
    // I will check the folder list again later if needed, but for now I stick to what I saw: getPosts, getPostDetail.
    // I will add placeholder or simple calls if I find the write endpoints, otherwise I'll leave them as TODO or comment out write features in UI if backend doesn't support it yet.
    // Wait, the user said "remove local mock data". If I remove mock data, write features will break if backend doesn't support them.
    // Let me double check usage in `BoardDetailClient` -> it has handleDelete.
    // `BoardListPage` -> has Write button.
    // I should check if there are other controllers or methods I missed.
    // But I was told "do not touch backend".
    // I will implement read-only for now, and maybe just throw error or log for actions not yet in backend.

    // Actually, looking at the file list `backend/src/main/java/com/franchise/backend/board/controller/BoardController.java` content I saw earlier:
    // It ONLY has `getPosts` and `getPostDetail`.
    // So the backend DOES NOT support creating or deleting posts yet.
    // I will implement only Read methods. The UI might need to hide write/delete buttons or show "Not implemented" alert.
    // Or I can keep the buttons but make them do nothing or alert.
};
