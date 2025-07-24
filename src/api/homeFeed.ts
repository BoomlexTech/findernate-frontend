import axios from './base' 

export const getHomeFeed = async() => {
    const response = await axios.get('/posts/home-feed')

    return response.data
}

export const getPostsByUserid = async(userId: string) => {
    const response = await axios.get(`/posts/user/${userId}/profile`)

    return response.data
}