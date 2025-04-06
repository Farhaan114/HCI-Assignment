import axiosInstance from '../axiosInstance';

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`/api/users`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create user
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('api/users', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`api/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`api/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 