import api from "./api";


export const getPredictions =
  () =>
    api.get(
      "/ml/predictions"
    );


export const getSegments =
  () =>
    api.get(
      "/ml/segments"
    );