import axiosInstance from '../axiosInstance';

// Get all groups
export const getAllGroups = async () => {
  try {
    const response = await axiosInstance.get('api/groups');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get group by ID
export const getGroupById = async (id) => {
  try {
    const response = await axiosInstance.get(`api/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create group
export const createGroup = async (groupData) => {
  try {
    const response = await axiosInstance.post('api/groups', groupData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update group
export const updateGroup = async (id, groupData) => {
  try {
    const response = await axiosInstance.put(`api/groups/${id}`, groupData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete group
export const deleteGroup = async (id) => {
  try {
    const response = await axiosInstance.delete(`api/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 