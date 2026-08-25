import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";



export const createSubscription = async (planId) => {
  const { data } = await axiosWithCreds.post("/subscription", { planId });
  console.log(data);
  return data;
};
