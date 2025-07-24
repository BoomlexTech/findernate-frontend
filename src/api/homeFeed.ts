import axios from './base' 

export const getHomeFeed = async({page, limit}: {page: number, limit: number}) => {
    const response = await axios.get(`/posts/home-feed?page=${page}&limit=${limit}`)

    return response.data
}

export const getPostsByUserid = async(userId: string) => {
    const response = await axios.get(`/posts/user/${userId}/profile`)

    return response.data
}