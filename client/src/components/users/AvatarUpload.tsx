import { useState } from 'react';
import { message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { mediaApi } from '../../api/media.api';

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isImage) {
      message.error('Chỉ chấp nhận file ảnh JPG/PNG/WEBP!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isImage && isLt2M;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const rcFile = file as RcFile;

    try {
      setLoading(true);
      // 1. Get presigned URL
      const { presignedUrl, url } = await mediaApi.getPresignedUrl({
        filename: rcFile.name,
        contentType: rcFile.type,
      });

      // 2. Upload file directly to S3 via PUT
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': rcFile.type,
        },
        body: rcFile,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // 3. Trigger success
      setLoading(false);
      onSuccess?.(url);
      onChange?.(url);
    } catch (err) {
      setLoading(false);
      onError?.(err as Error);
      message.error('Có lỗi xảy ra khi tải ảnh lên.');
    }
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
    }
    if (info.file.status === 'error') {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-circle"
      className="avatar-uploader"
      showUploadList={false}
      customRequest={customRequest}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {value ? (
        <img src={value} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        uploadButton
      )}
    </Upload>
  );
}
