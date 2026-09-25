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

export const resendOtp = async (email) => {
  const response = await api.post("/auth/resend-otp", {
    email,
  });

  return response.data;
};

export const logOut = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const verifyResetOtp = async (email, otp) => {
  const response = await api.post("/auth/verify-reset-otp", {
    email,
    otp,
  });

  return response.data;
};

export const resetPassword = async (newPassword, confirmPassword) => {
  const response = await api.post("/auth/reset-password", {
    newPassword,
    confirmPassword,
  });

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
