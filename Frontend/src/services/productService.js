import axios from "axios";


const productService =
  axios.create({
    baseURL:
      "http://localhost:9002",
    withCredentials:
      true,
  });


export default productService;