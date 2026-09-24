import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const verifyEmail = async (email, otp) => {
  const response = await api.post("/auth/verify-email", {
    email,
    otp,
  });

  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getMe = async (accessToken) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const resendOtp = async (email) => {
  const response = await api.post("/auth/resend-otp", {
    email,
  });

  return response.data;
};
