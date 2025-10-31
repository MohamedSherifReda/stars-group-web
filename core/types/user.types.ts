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
  access_token: string;
  user: User;
}