import { memo, useCallback, useState } from 'react';
import useIsMobile from '../../../../utils/useIsMobile';
import { Content } from 'antd/es/layout/layout';
import { Button, Input } from 'antd';
import { SearchOutlined, SlidersOutlined } from '@ant-design/icons';
import mycomsLogo from '../../../../assets/logo.svg';
import spectrumImage from '../../../../assets/spectrum_with_molecule.svg';
import { usePropertiesContext } from '../../../../context/properties/properties';
import { createSearchParams, useNavigate } from 'react-router-dom';
import routes from '../../../../constants/routes';

function MycoMSInfo() {
  const { baseUrl } = usePropertiesContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');

  const handleSearch = useCallback(() => {
    navigate({
      pathname: baseUrl + '/' + routes.search.path,
      search: `?${createSearchParams({ plain: 'true' })}`,
    });
  }, [baseUrl, navigate]);

  const handleAdvancedSearch = useCallback(() => {
    navigate(baseUrl + '/' + routes.search.path);
  }, [baseUrl, navigate]);

  return (
    <Content
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #fdf6f0 0%, #f5ebe8 50%, #fafafa 100%)',
        padding: isMobile ? '24px 16px 20px' : '40px 56px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 20 : 32,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {/* Left: logo + tagline */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <img
            src={mycomsLogo}
            alt="MycoMSBase"
            style={{ height: isMobile ? 60 : 90, objectFit: 'contain', objectPosition: 'left' }}
          />
          <div>
            <p
              style={{
                fontSize: isMobile ? 15 : 18,
                fontWeight: 600,
                color: '#2d2d2d',
                margin: '0 0 6px',
                lineHeight: 1.4,
              }}
            >
              A curated open-source library of fungal MS/MS spectra and metadata
            </p>
            {!isMobile && (
              <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.6 }}>
                Designed to accelerate fungal natural-product discovery through high-quality data,
                advanced search, and open access.
              </p>
            )}
          </div>
        </div>

        {/* Right: spectrum image — hidden on mobile to save space */}
        {!isMobile && (
          <div
            style={{
              flexShrink: 0,
              width: 380,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 16,
              padding: '20px 24px',
              boxShadow: '0 2px 16px rgba(123,28,28,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={spectrumImage}
              alt="Spectrum with molecular structure"
              style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <Input
          size="large"
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder={isMobile ? 'Search...' : 'Search by Accession ID, Compound name, m/z, or InChIKey...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          style={{ flex: 1, minWidth: isMobile ? '100%' : undefined, borderRadius: 8, fontSize: 14 }}
        />
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : undefined }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSearch}
            style={{
              flex: isMobile ? 1 : undefined,
              backgroundColor: '#7b1c1c',
              borderColor: '#7b1c1c',
              borderRadius: 8,
              fontWeight: 600,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            Search
          </Button>
          <Button
            size="large"
            icon={<SlidersOutlined />}
            onClick={handleAdvancedSearch}
            style={{
              flex: isMobile ? 1 : undefined,
              borderRadius: 8,
              fontWeight: 600,
              borderColor: '#7b1c1c',
              color: '#7b1c1c',
            }}
          >
            {isMobile ? 'Advanced' : 'Advanced Search'}
          </Button>
        </div>
      </div>
    </Content>
  );
}

export default memo(MycoMSInfo);
