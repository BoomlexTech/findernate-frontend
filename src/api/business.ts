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
        const response = await axios.put("/business/switch-to-business");
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