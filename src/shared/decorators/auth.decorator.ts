import { SetMetadata } from '@nestjs/common';
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from '../constants/auth.constant';

export const AUTH_TYPE_KEY = 'authType';
export type AuthTypeDecoratorPayload = {
  authType: AuthTypeType[];
  options: { condition: ConditionGuardType };
};

export const Auth = (authType: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authType,
    options: options ?? { condition: ConditionGuard.And },
  });
};

export const IsPublic = () => Auth([AuthType.None]);
