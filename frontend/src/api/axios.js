import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends cookies automatically with every request (needed for JWT cookie auth)
});

export default axiosInstance;
