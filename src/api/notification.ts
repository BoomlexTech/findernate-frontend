import axios from "./base";

export const getNotifications = async () => {
    const response = await axios.get(`/posts/notifications`);
    return response.data;
}

export const getUnreadCounts = async () => {
    const response = await axios.get(`/notifications/unread-counts`);
    return response.data;
}

export const markNotificationAsRead = async (notificationId: string) => {
    const response = await axios.put(`/notifications/${notificationId}/read`);
    return response.data;
}

export const markAllNotificationsAsRead = async () => {
    const response = await axios.put(`/notifications/mark-all-read`);
    return response.data;
}

