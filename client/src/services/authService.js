import api from './api.js';

/* LOGIN */
export const loginAPI = async (email, password) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  } catch (error) {
    console.error("Login Error:", error.response || error);
    let message = "Login failed";
    if (error.response?.data?.message) message = error.response.data.message;
    throw new Error(message);
  }
};

/* REGISTER */
export const registerAPI = async (userData) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    return data;
  } catch (error) {
    console.error("Register Error:", error.response || error);
    let message = "Registration failed";
    if (error.response?.data?.message) message = error.response.data.message;
    throw new Error(message);
  }
};


export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};


export const logoutUser = () => {
  localStorage.removeItem("token");
};
