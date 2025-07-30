import axios from "./base";

export const getReels = async () => {
    const response = await axios.get('/reels/suggested');
    return response.data.data;
}