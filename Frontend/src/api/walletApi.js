import api from "./api";


export const getWallet =
  () =>
    api.get(
      "/wallet"
    );


export const withdraw =
  (data) =>
    api.post(
      "/wallet/withdraw",
      data
    );