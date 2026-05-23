import { Result, Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken ?? '');
      navigate('/profile/security', { replace: true });
      return;
    }

    navigate('/login', { replace: true });
  }, [navigate, searchParams]);

  return <Result icon={<Spin size="large" />} title="Completing Google sign in..." />;
}
