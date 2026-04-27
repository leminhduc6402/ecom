import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe, ZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const CustomZodValidationPipe: typeof ZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: unknown) => {
    const zodError = error as ZodError;
    return new UnprocessableEntityException(
      zodError.issues.map((error) => {
        return { ...error, path: error.path.join('.') };
      }),
    );
  },
});
export default CustomZodValidationPipe;
