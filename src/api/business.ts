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