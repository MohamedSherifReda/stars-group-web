export interface User {
  id: number
  email: string
  name: string
  phone_number: string
  role: string
  account_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  data: {
    access_token: string;
    desquare_token: string;
    complete_phone_number_required: boolean;
  };
}