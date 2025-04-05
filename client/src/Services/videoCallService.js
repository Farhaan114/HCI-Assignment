import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get all video calls
export const getAllVideoCalls = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get video call by ID
export const getVideoCallById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create video call
export const createVideoCall = async (videoCallData) => {
  try {
    const response = await axios.post(API_URL, videoCallData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update video call
export const updateVideoCall = async (id, videoCallData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, videoCallData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete video call
export const deleteVideoCall = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 