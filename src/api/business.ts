import { CreateBusinessRequest, UpdateBusinessRequest } from "@/types";
import axios from "./base";

export const AddBusinessDetails = async (business: CreateBusinessRequest) => {
    const response = await axios.post("/business/create", business);
    return response.data;
};  

export const GetBusinessDetails = async () => {
    const response = await axios.get("/business/profile")
    return response.data
}

export const getBusinessProfileDetails = async (userId: string) => {
    try {
        const response = await axios.get(`/business/profile?userId=${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Get business profile details error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            userId,
            error: error.message
        });
        throw error;
    }
}

export const UpdateBusinessDetails = async (business: UpdateBusinessRequest) => {
    const response = await axios.patch("/business/update", business);
    return response.data;
}

export const UpdateBusinessCategory = async (category: string) => {
    const response = await axios.patch("/business/update-category", { category });
    return response.data;
}

export const GetBusinessCategory = async () => {
    const response = await axios.get("/business/my-category");
    return response.data;
}

export const switchToBusiness = async () => {
    try {
        const response = await axios.post("/business/switch-to-business");
        return response.data;
    } catch (error: any) {
        console.error('Switch to business error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
        });
        throw error;
    }
}

export const switchToPersonal = async () => {
    try {
        const response = await axios.post("/business/switch-to-personal");
        return response.data;
    } catch (error: any) {
        console.error('Switch to personal error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
        });
        throw error;
    }
}

export const getBusinessRatingSummary = async (businessId: string) => {
    try {
        const response = await axios.get(`/business/${businessId}/rating-summary`);
        return response.data;
    } catch (error: any) {
        console.error('Get business rating error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            businessId,
            error: error.message
        });
        throw error;
    }
}

export const rateBusiness = async (businessId: string, rating: number) => {
    try {
        const response = await axios.post(`/business/${businessId}/rate`, { rating });
        return response.data;
    } catch (error: any) {
        console.error('Rate business error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            businessId,
            rating,
            error: error.message
        });
        throw error;
    }
}