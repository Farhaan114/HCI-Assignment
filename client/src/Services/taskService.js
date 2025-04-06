import axiosInstance from '../axiosInstance';

// Get all tasks
export const getAllTasks = async () => {
  try {
    const response = await axiosInstance.get('/api/tasks');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get task by ID
export const getTaskById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Create task
export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/api/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update task
export const updateTask = async (id, taskData) => {
  try {
    const response = await axiosInstance.put(`api/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete task
export const deleteTask = async (id) => {
  try {
    const response = await axiosInstance.delete(`api/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 