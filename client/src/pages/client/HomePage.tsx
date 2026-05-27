import { Button, Layout, Menu, Row, Col, Card } from 'antd';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Content, Footer } = Layout;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white flex justify-between items-center px-4 md:px-12 shadow-sm sticky top-0 z-50">
        <div className="font-bold text-xl text-indigo-600 cursor-pointer" onClick={() => navigate('/')}>
          EcomStore
        </div>
        <Menu mode="horizontal" className="flex-1 justify-center border-none" items={[
          { key: 'home', label: 'Trang chủ' },
          { key: 'products', label: 'Sản phẩm' },
          { key: 'categories', label: 'Danh mục' },
          { key: 'contact', label: 'Liên hệ' },
        ]} />
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />} />
          <Button 
            type="primary" 
            icon={<UserOutlined />} 
            onClick={handleAuthAction}
          >
            {isAuthenticated ? 'Tài khoản' : 'Đăng nhập'}
          </Button>
          {isAuthenticated && (
            <Button type="default" onClick={() => logout()}>Đăng xuất</Button>
          )}
        </div>
      </Header>

      <Content>
        {/* Hero Section */}
        <div className="bg-indigo-50 py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Mua sắm thả ga, không lo về giá
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Khám phá hàng ngàn sản phẩm công nghệ, thời trang và gia dụng với những ưu đãi tốt nhất mỗi ngày.
            </p>
            <Button type="primary" size="large" className="h-12 px-8 text-lg rounded-full">
              Khám phá ngay
            </Button>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="max-w-6xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Danh mục nổi bật</h2>
          <Row gutter={[24, 24]}>
            {['Điện thoại', 'Laptop', 'Thời trang', 'Gia dụng'].map((cat, idx) => (
              <Col xs={12} md={6} key={idx}>
                <Card 
                  hoverable 
                  className="text-center rounded-xl overflow-hidden border border-gray-100"
                  styles={{ body: { padding: '24px' } }}
                >
                  <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600 text-2xl font-bold">
                    {cat.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-lg">{cat}</h3>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Featured Products */}
        <div className="bg-gray-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Sản phẩm bán chạy</h2>
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4].map((item) => (
                <Col xs={24} sm={12} md={6} key={item}>
                  <Card
                    hoverable
                    cover={
                      <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                        Product Image {item}
                      </div>
                    }
                    className="rounded-xl overflow-hidden"
                  >
                    <Card.Meta 
                      title={`Sản phẩm mẫu ${item}`} 
                      description={
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-red-500 font-bold text-lg">{(item * 199000).toLocaleString()}đ</span>
                          <Button size="small" type="primary" shape="round">Mua</Button>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </Content>

      <Footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left px-4">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">EcomStore</h3>
            <p>Nền tảng thương mại điện tử uy tín, mang đến trải nghiệm mua sắm tuyệt vời cho bạn.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Trang chủ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Sản phẩm</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Khuyến mãi</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Chính sách bảo hành</a></li>
            </ul>
          </div>
        </div>
        <div>EcomStore ©{new Date().getFullYear()} Created by Duc Le</div>
      </Footer>
    </Layout>
  );
}
