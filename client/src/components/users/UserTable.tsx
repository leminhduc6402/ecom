import { useState, useCallback } from 'react';
import { Table, Tag, Button, Input, Select, Modal, message, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/user.api';
import type { User } from '../../types/user';

const { confirm } = Modal;

export function UserTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles-dropdown'],
    queryFn: () => userApi.getRoles(),
  });

  const roles = rolesData?.data || [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { page, limit, search, roleId, status }],
    queryFn: () => userApi.getList({ page, limit, search, roleId, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      message.success('Xoá người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Không thể xoá người dùng này');
    },
  });

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearch(value || undefined);
      setPage(1);
    }, 400),
    []
  );

  const handleDelete = (user: User) => {
    confirm({
      title: 'Xoá người dùng',
      content: `Bạn có chắc chắn muốn xoá người dùng ${user.name} (${user.email})? Hành động này không thể hoàn tác.`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => {
        return deleteMutation.mutateAsync(user.id);
      },
    });
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {record.avatar ? (
              <img src={record.avatar} alt={record.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-600 font-semibold">{record.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone?: string) => phone || <span className="text-gray-400">Không có</span>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => <Tag color="blue">{role?.name || 'Unknown'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'ACTIVE') return <Badge status="success" text="Hoạt động" />;
        if (status === 'INACTIVE') return <Badge status="warning" text="Tạm ngưng" />;
        return <Badge status="error" text="Đã khoá" />;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: User) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/admin/users/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm theo tên, email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="Lọc theo vai trò"
            className="w-48"
            allowClear
            loading={isLoadingRoles}
            options={roles.map((r) => ({ label: r.name, value: r.id }))}
            onChange={(val) => {
              setRoleId(val);
              setPage(1);
            }}
          />
          <Select
            placeholder="Trạng thái"
            className="w-40"
            allowClear
            options={[
              { label: 'ACTIVE', value: 'ACTIVE' },
              { label: 'INACTIVE', value: 'INACTIVE' },
              { label: 'BLOCKED', value: 'BLOCKED' },
            ]}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/users/create')}
        >
          Thêm người dùng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isFetching}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.totalItems || 0,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
          showSizeChanger: true,
        }}
      />
    </div>
  );
}
