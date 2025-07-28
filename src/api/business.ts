import axios from "./base";

export const BusinessDetails = async (business: any) => {
    const response = await axios.post("/business/create", business);
    return response.data;
};

