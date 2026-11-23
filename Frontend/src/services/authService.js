import axios from "axios";


const authService =
  axios.create({
    baseURL:
      "http://localhost:9001",
    withCredentials:
      true,
  });


export default authService;