import type { FormInstance } from 'antd';
import type { ZodSchema } from 'zod';

export function validateWithZod<T>(schema: ZodSchema<T>, values: unknown, form: FormInstance): T | null {
  const result = schema.safeParse(values);
  if (result.success) return result.data;

  form.setFields(
    result.error.issues.map((issue) => ({
      name: issue.path,
      errors: [issue.message],
    })),
  );

  return null;
}
