import axios from "axios";

const API = axios.create({
  baseURL: "https://oa-delta.vercel.app",
});

export default API;