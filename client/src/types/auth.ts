export type UserRoleName = 'Admin' | 'Client' | string;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: {
    name: UserRoleName;
  };
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type OtpType = 'REGISTER' | 'FORGOT_PASSWORD';

export type TwoFactorSetupResponse = {
  secret: string;
  uri: string;
};
