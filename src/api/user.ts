import axios from "./base";
import { followEvents } from "@/utils/followEvents";

export const getUserProfile = async () => {
    const response = await axios.get('/users/profile')

    return response.data.data
}

export const getOtherUserProfile = async (username: string) => {
    try {
        const response = await axios.get(`/users/profile/other`, {
            params: {
                identifier: username
            },
        });
        
        return response.data.data;
    } catch (error: any) {
        console.error('Get other user profile error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            username,
            error: error.message,
            url: error.config?.url,
            params: error.config?.params
        });
        throw error;
    }
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
        
        // Emit follow event for message panel integration
        followEvents.emit(userId, true);
        
        return response.data;
    } catch (error: any) {
        console.error('Follow user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        
        // Handle specific cases where we want to return success-like response
        if (error.response?.status === 400 && error.response?.data?.message === 'Already following') {
            // If already following, emit event and return success response
            followEvents.emit(userId, true);
            return { success: true, message: 'Already following' };
        }
        
        throw error;
    }
}

export const unfollowUser = async (userId: string) => {
    try {
        const response = await axios.post('/users/unfollow', { userId });
        
        // Emit unfollow event for message panel integration
        followEvents.emit(userId, false);
        
        return response.data;
    } catch (error: any) {
        console.error('Unfollow user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        
        // Handle specific cases where we want to return success-like response
        if (error.response?.status === 400 && error.response?.data?.message === 'Not following this user') {
            // If not following, emit event and return success response
            followEvents.emit(userId, false);
            return { success: true, message: 'Not following this user' };
        }
        
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

export const getBusinessProfile = async (businessName: string) => {
    try {
        // Try to get business profile by name first
        const response = await axios.get(`/business-owners/profile/${businessName}`);
        console.log('Business profile API response:', response);
        
        // Handle different response structures
        if (response.data && response.data.data) {
            return response.data; // Standard structure
        } else if (response.data) {
            return { data: response.data }; // Direct data structure
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error: any) {
        console.error('Get business profile error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            businessName,
            error: error.message
        });
        throw error;
    }
}