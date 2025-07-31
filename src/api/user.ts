import axios from "./base";

export const getUserProfile = async () => {
    const response = await axios.get('/users/profile')

    return response.data.data
}

export const getOtherUserProfile = async (username: string) => {
    const response = await axios.get(`/users/profile/other`, {
        params: {
            identifier: username
        },
    });
    
    return response.data.data;
}

export const editProfile = async (data: {
    fullName?: string;
    bio?: string;
    location?: string;
    link?: string;
    profileImageUrl?: string;
}) => {
    const response = await axios.put('/users/profile', data);
    return response.data.data;
}

export const followUser = async (userId: string) => {
    try {
        const response = await axios.post('/users/follow', { userId });
        return response.data;
    } catch (error: any) {
        console.error('Follow user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        throw error;
    }
}

export const unfollowUser = async (userId: string) => {
    try {
        const response = await axios.post('/users/unfollow', { userId });
        return response.data;
    } catch (error: any) {
        console.error('Unfollow user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        throw error;
    }
}

export const getFollowers = async (userId: string) => {
    const response = await axios.get(`/users/followers/${userId}`);
    return response.data.data;
}

export const getFollowing = async (userId: string) => {
    const response = await axios.get(`/users/following/${userId}`);
    return response.data.data;
}

export const getUserById = async (userId: string) => {
    const response = await axios.get(`/users/profile/other?identifier=${userId}`);
    return response.data.data;
}

export const getSuggestedUsers = async () => {
    const response = await axios.get('/suggestions/suggested-for-you');
    // Return the suggestions array, not the whole data object
    return response.data.data?.suggestions || [];
}

export const getTrendingBusinessOwners = async () => {
    const response = await axios.get('/business-owners/trending-business-owners')
    return response
}