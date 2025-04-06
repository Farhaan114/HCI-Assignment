import axiosInstance from '../axiosInstance';

// Get all video calls
export const getAllVideoCalls = async () => {
  try {
    const response = await axiosInstance.get('/api/video-calls');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get video call by ID
export const getVideoCallById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/video-calls/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create video call
export const createVideoCall = async (videoCallData) => {
  try {
    const response = await axiosInstance.post('/api/video-calls', videoCallData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update video call
export const updateVideoCall = async (id, videoCallData) => {
  try {
    const response = await axiosInstance.put(`api/video-calls/${id}`, videoCallData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete video call
export const deleteVideoCall = async (id) => {
  try {
    const response = await axiosInstance.delete(`api/video-calls/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 