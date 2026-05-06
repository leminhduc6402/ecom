import { randomInt } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export function isUniqueConstraintError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
export function isNotFoundError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}
export function isForeignKeyConstraintError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003';
}
export const generateOTP = (): string => {
  return String(randomInt(0, 1000000)).padStart(6, '0');
};

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename);

  return `${uuidv4()}${ext}`;
};
