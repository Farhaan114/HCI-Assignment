import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get all chats
export const getAllChats = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get chat by ID
export const getChatById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create chat
export const createChat = async (chatData) => {
  try {
    const response = await axios.post(API_URL, chatData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update chat
export const updateChat = async (id, chatData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, chatData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete chat
export const deleteChat = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get chat messages between two users
export const getChatMessagesBetweenUsers = async (userId1, userId2) => {
  try {
    const response = await axios.get(`${API_URL}/between/${userId1}/${userId2}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 