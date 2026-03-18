import { randomInt } from 'crypto';
import { Prisma } from '../generated/prisma/client';

export function isUniqueConstraintError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
export function isNotFountError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}
export const generateOTP = (): string => {
  return String(randomInt(0, 1000000)).padStart(6, '0');
};
