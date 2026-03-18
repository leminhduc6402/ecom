export const REQUEST_USER_KEY = 'user';

export const AuthType = {
  APIKey: 'ApiKey',
  Bearer: 'Bearer',
  None: 'None',
} as const;
export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  And: 'And',
  Or: 'Or',
} as const;
export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  INACTIVE: 'INACTIVE',
} as const;

export const TypeOfVerificationCode = {
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  REGISTER: 'REGISTER',
} as const;
