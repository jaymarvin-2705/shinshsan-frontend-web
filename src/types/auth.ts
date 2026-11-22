export interface Role {
  role_name: string;
}

export interface User {
  user_id: number;
  fullname: string;
  email: string;
  phone: string | null;
  status: string;
  role: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: User;
  };
}