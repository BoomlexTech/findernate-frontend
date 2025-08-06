import axios from "./base";

export const getReels = async () => {
    const response = await axios.get('/reels/suggested');
    return response.data.data;
}

// Like/Unlike functions for reels
export const likeReel = async (reelId: string) => {
    console.log('API: Calling likeReel with reelId:', reelId);
    const response = await axios.post('/posts/like', { postId: reelId }, { timeout: 10000 });
    console.log('API: likeReel response:', response.data);
    return response.data;
}

export const unlikeReel = async (reelId: string) => {
    console.log('API: Calling unlikeReel with reelId:', reelId);
    const response = await axios.post('/posts/unlike', { postId: reelId }, { timeout: 10000 });
    console.log('API: unlikeReel response:', response.data);
    return response.data;
}

// Save/Unsave functions for reels
export const saveReel = async (reelId: string) => {
    const response = await axios.post('/posts/save', { postId: reelId });
    return response.data;
}

export const unsaveReel = async (reelId: string) => {
    const response = await axios.delete(`/posts/save/${reelId}`);
    return response.data;
}