import axios from "./base";

export const getReels = async () => {
    const response = await axios.get('/reels/suggested');
    return response.data.data;
}

// Since reels are posts with type "reel", we can use the same like/unlike endpoints
export const likeReel = async (reelId: string) => {
    try {
        console.log('likeReel: Starting request for reelId:', reelId);
        console.log('likeReel: Request payload:', { postId: reelId });
        
        const response = await axios.post('/posts/like', { postId: reelId });
        
        console.log('likeReel: Success response:', response.data);
        return response.data;
    } catch (error) {
        console.error('likeReel: Error caught:', {
            reelId,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: (error as any)?.response?.status,
            data: (error as any)?.response?.data
        });
        throw error;
    }
}

export const unlikeReel = async (reelId: string) => {
    try {
        console.log('unlikeReel: Starting request for reelId:', reelId);
        console.log('unlikeReel: Request payload:', { postId: reelId });
        
        const response = await axios.post('/posts/unlike', { postId: reelId });
        
        console.log('unlikeReel: Success response:', response.data);
        return response.data;
    } catch (error) {
        console.error('unlikeReel: Error caught:', {
            reelId,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: (error as any)?.response?.status,
            data: (error as any)?.response?.data
        });
        throw error;
    }
}

export const saveReel = async (reelId: string) => {
    const response = await axios.post('/posts/save', { postId: reelId });
    return response.data;
}

export const unsaveReel = async (reelId: string) => {
    const response = await axios.delete(`/posts/save/${reelId}`);
    return response.data;
}