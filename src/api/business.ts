import { CreateBusinessRequest, UpdateBusinessRequest } from "@/types";
import axios from "./base";

export const AddBusinessDetails = async (business: CreateBusinessRequest) => {
    const response = await axios.post("/business/create", business);
    return response.data;
};  

export const GetBusinessDetails = async () => {
    const response = await axios.get("/business/profile");
    return response.data;
}

// Get business ID for the current user
export const getMyBusinessId = async () => {
    try {
        const response = await axios.get("/business/profile");
        return response.data?.data?._id || response.data?._id || null;
    } catch (error: unknown) {
        console.error('Error fetching business ID:', error);
        throw error;
    }
}

export const getBusinessProfileDetails = async (userId: string) => {
    try {
        const response = await axios.get(`/business/profile?userId=${userId}`);
        return response.data;
    } catch (error: unknown) {
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

export const UpdateBusinessSubCategory = async (subcategory: string, category: string) => {
    const response = await axios.patch("/business/update-category", { subcategory, category });
    return response.data;
}

export const GetBusinessCategory = async () => {
    const response = await axios.get("/business/my-category");
    return response.data;
}

export const switchToBusiness = async () => {
    const response = await axios.post("/business/switch-to-business");
    return response.data;
}

export const switchToPersonal = async () => {
    const response = await axios.post("/business/switch-to-personal");
    return response.data;
}

// Toggle allowed post types for business accounts
export const toggleServicePosts = async (businessId: string) => {
    try {
        const response = await axios.post("/business/toggle-service-posts", {
            businessId
        });
        return response.data;
    } catch (error: unknown) {
        throw error;
    }
}

export const toggleProductPosts = async (businessId: string) => {
    try {
        const response = await axios.post("/business/toggle-product-posts", {
            businessId
        });
        return response.data;
    } catch (error: unknown) {
        throw error;
    }
}

export const getBusinessRatingSummary = async (businessId: string) => {
    const response = await axios.get(`/business/${businessId}/rating-summary`);
    return response.data;
}

export const rateBusiness = async (businessId: string, rating: number) => {
    const response = await axios.post(`/business/${businessId}/rate`, { rating });
    return response.data;
}