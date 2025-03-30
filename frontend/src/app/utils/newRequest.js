import axios from "axios";
const newRequest = axios.create({
  baseURL: "http://localhost:7700/api/",
});

export default newRequest;
