import { Card, Col, Row, Statistic } from 'antd';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Active Sessions" value={128} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="2FA Enabled" value={84} suffix="%" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Auth Alerts" value={3} valueStyle={{ color: '#ba1a1a' }} />
          </Card>
        </Col>
      </Row>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-headline text-xl font-bold">Admin workspace</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          This protected area confirms role-based routing is active. Use Settings to configure two-factor authentication.
        </p>
      </section>
    </AdminLayout>
  );
}
