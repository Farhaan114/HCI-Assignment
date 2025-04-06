import axiosInstance from '../axiosInstance';

// Get all chats
export const getAllChats = async () => {
  try {
    const response = await axiosInstance.get('/api/chats');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get chat by ID
export const getChatById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/chats/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create chat
export const createChat = async (chatData) => {
  try {
    const response = await axiosInstance.post('/api/chats', chatData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update chat
export const updateChat = async (id, chatData) => {
  try {
    const response = await axiosInstance.put(`/api/chats/${id}`, chatData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete chat
export const deleteChat = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/chats/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get chat messages between two users
export const getChatMessagesBetweenUsers = async (userId1, userId2) => {
  try {
    const response = await axiosInstance.get(`/api/chats/between/${userId1}/${userId2}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 