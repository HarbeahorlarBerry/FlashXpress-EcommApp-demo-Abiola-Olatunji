import axios from "axios";


const orderService =
  axios.create({
    baseURL:
      "http://localhost:9003",
    withCredentials:
      true,
  });


export default orderService;