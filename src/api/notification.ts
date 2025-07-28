import axios from "./base";

export const getNotifications = async () => {
    const response = await axios.get(`/posts/notifications`);
    return response.data;
}

