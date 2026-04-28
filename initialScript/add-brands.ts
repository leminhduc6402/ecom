import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();

async function addBrands() {
  const brand = Array(10000)
    .fill(0)
    .map((_, index) => {
      const name = `Brand ${index + 1}`;
      return {
        name,
        logo: `https://ui-avatars.com/api/?background=random&color=random&name=${name}`,
      };
    });
  try {
    const { count } = await prisma.brand.createMany({
      data: brand,
      skipDuplicates: false,
    });
    console.log('count', count);
  } catch (error) {
    console.log(error);
  }
}

addBrands().finally(() => {
  prisma.$disconnect();
});
