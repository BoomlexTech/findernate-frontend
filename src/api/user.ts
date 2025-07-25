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