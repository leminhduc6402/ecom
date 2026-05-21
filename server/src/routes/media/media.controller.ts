import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import path from 'path';
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from 'src/routes/media/media.dto';
import { MediaService } from 'src/routes/media/media.service';
import { ParseFilePipeUnlinkPipe } from 'src/routes/media/parse-file-pipe-unlink.pipe';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('images/upload')
  @ZodSerializerDto(UploadFilesResDTO)
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 2MB
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeUnlinkPipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/, skipMagicNumbersValidation: true }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files);
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENPOINT}/${file.filename}`,
    // }))
  }

  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found');
        res.status(notfound.getStatus()).json(notfound.getResponse());
      }
    });
  }

  @IsPublic()
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @Post('images/upload/presigned-url')
  async getPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body);
  }
}
