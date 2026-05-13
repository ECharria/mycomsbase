import './UserInterface.scss';

import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Modal } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  DatabaseOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { usePropertiesContext } from '../../context/properties/properties';
import logo from '../../assets/logo.svg';

const headerHeight = 60;
const footerHeight = 50;
const siderWidth = 220;

const navItems = [
  { id: 'home', label: 'Home', path: '/', icon: <HomeOutlined /> },
  { id: 'search', label: 'Search', path: 'search', icon: <SearchOutlined /> },
  { id: 'content', label: 'Content', path: 'content', icon: <DatabaseOutlined /> },
  { id: 'documentation', label: 'Documentation', path: 'documentation', icon: <BookOutlined /> },
  { id: 'about', label: 'About', path: 'about', icon: <InfoCircleOutlined /> },
];

type InputProps = {
  body: JSX.Element;
};

function UserInterface({ body }: InputProps) {
  const location = useLocation();
  const { baseUrl } = usePropertiesContext();

  const [showDataPrivacyModal, setShowDataPrivacyModal] = useState<boolean>(false);
  const [dataPrivacyContainer, setDataPrivacyContainer] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const container = document.getElementById('data-privacy-container');
    if (container) {
      setDataPrivacyContainer(
        container.innerHTML ? (
          <div dangerouslySetInnerHTML={{ __html: container.innerHTML }} />
        ) : null,
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.showDataPrivacyModal === true) {
        setShowDataPrivacyModal(true);
      }
    }
  }, []);

  const handleOnClickDataPrivacy = useCallback(() => {
    setShowDataPrivacyModal(true);
  }, []);

  const sidebar = useMemo(() => (
    <Sider
      width={siderWidth}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <nav style={{ padding: '16px 0' }}>
          {navItems.map((item) => {
            const fullPath = baseUrl + (item.path === '/' ? '/' : '/' + item.path);
            const isActive =
              location.pathname === fullPath ||
              (item.path === '/' && location.pathname === baseUrl + '/');
            return (
              <a key={item.id} href={fullPath} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 20px',
                    backgroundColor: isActive ? '#f9f0f0' : 'transparent',
                    borderRight: isActive ? '3px solid #7b1c1c' : '3px solid transparent',
                    color: isActive ? '#7b1c1c' : '#444',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </div>
              </a>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid #f0f0f0', margin: '0 16px' }} />

        <div style={{ padding: '20px 20px 0', flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#2d2d2d', marginBottom: 8 }}>
            About MycoMSBase
          </p>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>
            An open-source resource curating fungal MS/MS spectra and metadata to
            accelerate natural-product discovery.
          </p>
        </div>

        <div style={{ padding: 16, display: 'flex', justifyContent: 'center', opacity: 0.07 }}>
          <img src={logo} alt="" style={{ width: '85%', maxWidth: 140 }} />
        </div>
      </div>
    </Sider>
  ), [baseUrl, location.pathname]);

  return useMemo(
    () => (
      <Layout className="user-interface">
        <Header height={headerHeight} />
        <Layout style={{ flex: 1, width: '100%', overflow: 'hidden', flexDirection: 'row' }}>
          {sidebar}
          <Content
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {body}
          </Content>
        </Layout>
        <Footer
          height={footerHeight}
          enableDataPrivacyButton={dataPrivacyContainer !== null}
          onClickDataPrivacy={handleOnClickDataPrivacy}
        />
        <Modal
          open={showDataPrivacyModal}
          onCancel={() => setShowDataPrivacyModal(false)}
          width="100%"
          style={{ top: 20 }}
          title="Data Privacy Information"
          cancelButtonProps={{ style: { display: 'none' } }}
          onOk={() => setShowDataPrivacyModal(false)}
        >
          <Content
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {dataPrivacyContainer ? (
              dataPrivacyContainer
            ) : (
              <div style={{ textAlign: 'center' }}>
                No data privacy information available.
              </div>
            )}
          </Content>
        </Modal>
      </Layout>
    ),
    [body, dataPrivacyContainer, handleOnClickDataPrivacy, showDataPrivacyModal, sidebar],
  );
}

export default UserInterface;
