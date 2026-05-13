import { memo } from 'react';
import { Content } from 'antd/es/layout/layout';
import {
  SearchOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  FilterOutlined,
  CodeOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  UnlockOutlined,
  DatabaseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { usePropertiesContext } from '../../../../context/properties/properties';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const featureCards = [
  {
    icon: <SearchOutlined style={{ fontSize: 22, color: '#7b1c1c' }} />,
    title: 'Compound Search',
    description: 'Find compounds by name, accession ID, chemical identifier, CCS values, or fungal producer.',
    path: 'search',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 22, color: '#7b1c1c' }} />,
    title: 'Spectral Search',
    description: 'Search against MS/MS spectra using peak lists or spectra files with the SpecReBoot framework.',
    path: 'search',
  },
  {
    icon: <ApartmentOutlined style={{ fontSize: 22, color: '#7b1c1c' }} />,
    title: 'Structure Search',
    description: 'Query by chemical structure or substructure similarity.',
    path: 'search',
  },
  {
    icon: <FilterOutlined style={{ fontSize: 22, color: '#7b1c1c' }} />,
    title: 'Metadata Filters',
    description: 'Filter results by taxonomy, compound class, pathway, and more.',
    path: 'content',
  },
  {
    icon: <CodeOutlined style={{ fontSize: 22, color: '#7b1c1c' }} />,
    title: 'API Access',
    description: 'Programmatic access to data and functionality via RESTful API.',
    path: '',
  },
];

const whyItems = [
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#7b1c1c' }} />,
    title: 'Curated Quality',
    description: 'Manually curated spectra and metadata for reliability.',
  },
  {
    icon: <GlobalOutlined style={{ fontSize: 24, color: '#7b1c1c' }} />,
    title: 'Fungal Focus',
    description: 'Specialized resource for fungal natural products.',
  },
  {
    icon: <UnlockOutlined style={{ fontSize: 24, color: '#7b1c1c' }} />,
    title: 'Open & Accessible',
    description: 'Open-source, free to use, and community-driven.',
  },
  {
    icon: <DatabaseOutlined style={{ fontSize: 24, color: '#7b1c1c' }} />,
    title: 'Rich Metadata',
    description: 'Detailed annotations for advanced discovery.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 24, color: '#7b1c1c' }} />,
    title: 'Community Built',
    description: 'Contributions and feedback to improve the resource.',
  },
];

function FeaturesOverview() {
  const { baseUrl } = usePropertiesContext();
  const navigate = useNavigate();

  const handleCardClick = useCallback(
    (path: string) => {
      navigate(baseUrl + '/' + path);
    },
    [baseUrl, navigate],
  );

  return (
    <Content style={{ width: '100%', padding: '40px 56px 48px', background: '#fff' }}>
      {/* Feature cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          marginBottom: 52,
        }}
      >
        {featureCards.map((card) => (
          <div
            key={card.title}
            onClick={() => card.path && handleCardClick(card.path)}
            style={{
              background: '#fff',
              border: '1px solid #f0e8e8',
              borderRadius: 12,
              padding: '20px 18px',
              cursor: card.path ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'box-shadow 0.2s, border-color 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
              if (!card.path) return;
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = '0 10px 25px rgba(70,35,25,0.08)';
              el.style.borderColor = '#8b1824';
              el.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              if (!card.path) return;
              const el = e.currentTarget as HTMLDivElement;
              el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
              el.style.borderColor = '#f0e8e8';
              el.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fdf0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#2d2d2d', margin: 0 }}>
              {card.title}
            </p>
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6, flex: 1 }}>
              {card.description}
            </p>
            {card.path && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ArrowRightOutlined style={{ color: '#7b1c1c', fontSize: 13 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Why MycoMSBase */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          background: '#fdf6f0',
          borderRadius: 16,
          padding: '24px 32px',
        }}
      >
        <div style={{ flexShrink: 0, width: 200 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#2d2d2d', margin: 0, whiteSpace: 'nowrap' }}>
            Why MycoMSBase?
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 24,
            flex: 1,
          }}
        >
          {whyItems.map((item) => (
            <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.icon}
              <p style={{ fontWeight: 700, fontSize: 13, color: '#2d2d2d', margin: 0 }}>
                {item.title}
              </p>
              <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Content>
  );
}

export default memo(FeaturesOverview);
