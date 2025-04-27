import React, { useState } from 'react';
import {
    UserOutlined,
    UploadOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    FundFilled,
    ToolFilled,
    ShoppingOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme, Button } from 'antd';
import { useNavigate, Link } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
};

const items = [
    {
        key: '1',
        icon: <FundFilled />,
        label: 'DashBoard',
    },
    {
        key: '2',
        icon: <ToolFilled />,
        label: 'Manage',
        children: [
            {
                key: '3',
                icon: <UserOutlined />,
                label: <Link to="user">User</Link>,
            },
            {
                key: '4',
                icon: <ShoppingOutlined />,
                label: <Link to="product">Product</Link>
            }
        ]
    },
    {
        key: '5',
        icon: <UploadOutlined />,
        label: 'Upload',
    },
];

const AdminPage = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout hasSider>
            <Sider
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={siderStyle}
            >
                <div className="demo-logo-vertical" onClick={() => navigate('/')}>
                    <h2 style={{ color: '#fff', cursor: 'pointer' }}>
                        {collapsed ? 'Ad' : 'Admin'}
                    </h2>
                </div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items} />
            </Sider>
            <Layout>
                <Header style={{
                    padding: 0,
                    background: colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 16
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                        }}
                    />
                </Header>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            textAlign: 'center',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <p>long content</p>
                        {
                            Array.from({ length: 100 }, (_, index) => (
                                <React.Fragment key={index}>
                                    {index % 20 === 0 && index ? 'more' : '...'}
                                    <br />
                                </React.Fragment>
                            ))
                        }
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminPage;
