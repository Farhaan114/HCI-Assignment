import axiosInstance from '../axiosInstance';

// Register user
export const registerUser = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(`auth/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post(`/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}; 