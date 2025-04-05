import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get all groups
export const getAllGroups = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get group by ID
export const getGroupById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create group
export const createGroup = async (groupData) => {
  try {
    const response = await axios.post(API_URL, groupData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update group
export const updateGroup = async (id, groupData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, groupData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete group
export const deleteGroup = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 