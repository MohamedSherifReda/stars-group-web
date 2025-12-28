export interface User {
  id: number;
  wallet_code: string;
  name: string;
  phone_number: string;
  phone_number_key: string;
  email: string;
  account_verified: boolean;
  de_square_token: string;
  de_square_token_expire_at: string;
  role: string;
  rank: any;
  birthdate: any;
  pending_phone_number: any;
  pending_phone_number_key: string;
  pending_email: any;
  fcm_token: any;
  is_logged_in: boolean;
  ui_configurations: any;
  updated_at: string;
  created_at: string;
  deleted_at: any;
}

export interface AuthResponse {
  data: {
    access_token: string;
    desquare_token: string;
    complete_phone_number_required: boolean;
  };
}

export enum UserRank {
  Silver = 1,
  Gold = 2,
  Platinum = 3,
}

// users ranks / memberships keys...

// 1 >> silver;
// 2 >>> Gold;
// 3 >>> Platinum;