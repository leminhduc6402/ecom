import { VariantsType } from 'src/routes/product/product.model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type Variants = VariantsType;
  }
}
export {};
