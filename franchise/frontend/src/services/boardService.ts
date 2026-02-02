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
        // The base URL in lib/api.ts is 'http://localhost:8080/api'
        // So we just need '/board/posts'
        const response = await api.get<any>('/board/posts', { params });
        // Handle BOTH direct list and ApiResponse wrapped list
        const data = response.data.data || response.data || [];
        return Array.isArray(data) ? data : [];
    },

    // GET /api/board/posts/{id}
    getPost: async (id: number | string): Promise<BoardDetail | null> => {
        try {
            const response = await api.get<any>(`/board/posts/${id}`);
            const data = response.data.data || response.data;
            return data || null;
        } catch (error) {
            console.error(`Failed to fetch post ${id}:`, error);
            return null;
        }
    },

    // POST /api/board/posts
    createPost: async (data: { title: string; content: string; isPinned?: boolean }): Promise<boolean> => {
        try {
            await api.post('/board/posts', data);
            return true;
        } catch (error) {
            console.error('Failed to create post:', error);
            return false;
        }
    },

    // PATCH /api/board/posts/{id}
    updatePost: async (id: number | string, data: Partial<BoardDetail>): Promise<boolean> => {
        try {
            await api.patch(`/board/posts/${id}`, data);
            return true;
        } catch (error) {
            console.error(`Failed to update post ${id}:`, error);
            return false;
        }
    },
    // DELETE /api/board/posts/{id}
    deletePost: async (id: number | string): Promise<boolean> => {
        try {
            await api.delete(`/board/posts/${id}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete post ${id}:`, error);
            return false;
        }
    },
};
