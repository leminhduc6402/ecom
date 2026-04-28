import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const server = app.getHttpAdapter().getInstance();

  const router = server._router || server.router;

  if (!router) {
    throw new Error('Router not found');
  }
  const permissionsInDb = await prisma.permission.findMany({ where: { deletedAt: null } });
  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string }[] = router.stack
    .filter((layer) => layer.route)
    .map((layer) => {
      const path = layer.route.path;
      const method = Object.keys(layer.route.methods)[0].toUpperCase() as keyof typeof HTTPMethod;

      return {
        path,
        method,
        name: `${method} ${path}`,
      };
    });
  //Tạo object map với key là method + path để dễ dàng kiểm tra
  const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});
  // Tạo object availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item;
    return acc;
  }, {});

  // Tìm permissions trong database mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`];
  });
  // Xóa permissions không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id),
        },
      },
    });
    console.log('Deleted permissions:', deleteResult.count);
  } else {
    console.log('No permissions to delete');
  }
  // Tìm routes mà không tồn tại trong permissionsInDb
  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionInDbMap[`${item.method}-${item.path}`];
  });
  // Thêm các routes này dưới dạng permissions database
  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: false,
    });
    console.log('Added permissions:', permissionsToAdd.count);
  } else {
    console.log('No permissions to add');
  }
  // Lấy lại permissions từ database sau khi thêm mới hoặc bị xóa
  const updatedPermissionsInDb = await prisma.permission.findMany({ where: { deletedAt: null } });
  // Cập nhật lại các permission trong admin role
  await prisma.role.update({
    where: { name: RoleName.Admin, deletedAt: null },
    data: {
      permissions: {
        set: updatedPermissionsInDb.map((permission) => ({ id: permission.id })),
      },
    },
  });

  process.exit(0);
}
bootstrap();
