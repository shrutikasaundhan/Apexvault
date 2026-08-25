import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const fetchUser = async () => {
  const { data } = await axiosWithCreds.get("/user");
  const simulatedName = localStorage.getItem("simulated_name");
  const simulatedPicture = localStorage.getItem("simulated_picture");
  if (simulatedName) data.name = simulatedName;
  if (simulatedPicture) data.picture = simulatedPicture;
  return data;
};

export const fetchAllUsers = async () => {
  const { data } = await axiosWithCreds.get("/users");
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosWithCreds.post("/user/logout");
  return data;
};

export const logoutAllSessions = async () => {
  const { data } = await axiosWithCreds.post("/user/logout-all");
  return data;
};

export const logoutUserById = async (id) => {
  const { data } = await axiosWithCreds.post(`/users/${id}/logout`);
  return data;
};

export const loginUser = async (formData) => {
  const { data } = await axiosWithCreds.post("/user/login", formData);
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosWithoutCreds.post("/user/register", formData);
  return data;
};

export const deleteUserById = async (id) => {
  const { data } = await axiosWithCreds.delete(`/users/${id}`);
  return data;
};

export const updateUserById = async (id, updateData) => {
  const { data } = await axiosWithCreds.patch(`/users/${id}`, updateData);
  return data;
};
