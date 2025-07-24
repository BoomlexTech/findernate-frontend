import axios from "./base";

export const getUserProfile = async () => {
    const response = await axios.get('/users/profile')

    return response.data.data
}