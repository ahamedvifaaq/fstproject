import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth"
});

export const registerUser = (data) => API.post("/register", data);

export const loginUser = (data) => API.post("/login", data);

export const logoutUser = () => API.post("/logout");

export const refreshToken = () => API.post("/refresh");