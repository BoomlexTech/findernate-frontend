import axios from "./base";
import { followEvents } from "@/utils/followEvents";

export const getUserProfile = async () => {
    const response = await axios.get('/users/profile')

    return response.data.data
}

export const getOtherUserProfile = async (username: string) => {
    try {
        console.log("=== DEBUG: getOtherUserProfile called with username:", username);
        const response = await axios.get(`/users/profile/other`, {
            params: {
                identifier: username
            },
        });
        
        console.log("=== DEBUG: API response for getOtherUserProfile:", response.data);
        console.log("=== DEBUG: API response data.data:", response.data.data);
        
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
        if (error.response?.status === 400 && 
            (error.response?.data?.message === 'Already following' || 
             error.response?.data?.message?.includes('Already following'))) {
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
        if (error.response?.status === 400 && 
            (error.response?.data?.message === 'Not following this user' || 
             error.response?.data?.message?.includes('Not following'))) {
            // If not following, emit event and return success response
            followEvents.emit(userId, false);
            return { success: true, message: 'Not following this user' };
        }
        
        throw error;
    }
}

export const getFollowers = async (userId: string) => {
    console.log("=== DEBUG: getFollowers API called with userId:", userId);
    console.log("=== DEBUG: Current token in localStorage:", localStorage.getItem('token') ? 'Present' : 'Missing');
    const response = await axios.get(`/users/followers/${userId}`);
    console.log("=== DEBUG: getFollowers raw response:", response.data);
    console.log("=== DEBUG: getFollowers response.data.data:", response.data.data);
    const result = Array.isArray(response.data.data) ? response.data.data : [];
    console.log("=== DEBUG: getFollowers final result:", result);
    return result;
}

export const getFollowing = async (userId: string) => {
    console.log("=== DEBUG: getFollowing API called with userId:", userId);
    const response = await axios.get(`/users/following/${userId}`);
    console.log("=== DEBUG: getFollowing raw response:", response.data);
    console.log("=== DEBUG: getFollowing response.data.data:", response.data.data);
    const result = Array.isArray(response.data.data) ? response.data.data : [];
    console.log("=== DEBUG: getFollowing final result:", result);
    return result;
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

// Block user functionality
export const blockUser = async (blockedUserId: string, reason?: string) => {
    try {
        const response = await axios.post('/users/block', { 
            blockedUserId,
            reason
        });
        return response.data;
    } catch (error: any) {
        console.error('Block user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            blockedUserId,
            error: error.message
        });
        throw error;
    }
}

export const unblockUser = async (blockedUserId: string) => {
    try {
        const response = await axios.post('/users/unblock', { 
            blockedUserId 
        });
        return response.data;
    } catch (error: any) {
        console.error('Unblock user error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            blockedUserId,
            error: error.message
        });
        throw error;
    }
}

export const getBlockedUsers = async () => {
    try {
        const response = await axios.get('/users/blocked-users');
        return response.data.data?.blockedUsers || [];
    } catch (error: any) {
        console.error('Get blocked users error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
        });
        throw error;
    }
}

export const checkIfUserBlocked = async (userId: string) => {
    try {
        const response = await axios.get(`/users/check-block/${userId}`);
        return response.data.data?.isBlocked || false;
    } catch (error: any) {
        console.error('Check if user blocked error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        throw error;
    }
}