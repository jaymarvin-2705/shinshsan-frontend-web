import api from './api';

export interface AuthMessageResponse {
  success: boolean;
  message: string;
}

export async function requestPasswordReset(
  email: string
): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/forgot-password',
    { email }
  );
  return response.data;
}

export async function resetPassword(
  email: string,
  otp: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/reset-password',
    {
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation,
    }
  );
  return response.data;
}

export async function changePassword(
  currentPassword: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthMessageResponse> {
  const response = await api.post<AuthMessageResponse>(
    '/auth/change-password',
    {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    }
  );
  return response.data;
}
