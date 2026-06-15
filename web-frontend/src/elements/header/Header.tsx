import './Header.scss';

import { Header as HeaderAntD } from 'antd/es/layout/layout';
import { useSearchParams } from 'react-router-dom';
import { usePropertiesContext } from '../../context/properties/properties';
import { CSSProperties, ReactNode, useMemo } from 'react';
import logo from '../../assets/logo.svg';
import AccessionSearchInputField from '../common/AccessionSearchInputField';
import useIsMobile from '../../utils/useIsMobile';

const backgroundColor: CSSProperties['backgroundColor'] = '#f8f4f1';

type InputProps = {
  height: CSSProperties['height'];
  mobileMenuButton?: ReactNode;
};

function Header({ height, mobileMenuButton }: InputProps) {
  const { baseUrl } = usePropertiesContext();
  const [searchParams] = useSearchParams();
  const accession = searchParams.get('id');
  const isMobile = useIsMobile();

  return useMemo(
    () => (
      <HeaderAntD
        style={{
          width: '100%',
          height,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor,
          padding: isMobile ? '0 12px' : '0 24px',
          flexShrink: 0,
          borderBottom: '1px solid #eee3df',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mobileMenuButton}
          <a
            href={baseUrl + '/'}
            target="_self"
            style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <img
              src={logo}
              alt="MycoMSBase"
              style={{ height: isMobile ? 34 : 46 }}
            />
          </a>
        </div>
        <AccessionSearchInputField
          accession={accession ?? ''}
          disableLabel
          placeholderText={isMobile ? 'Accession ID' : 'Search by Accession ID'}
          inputStyle={{ width: isMobile ? '140px' : '300px' }}
          style={{ width: isMobile ? '160px' : '350px', backgroundColor: 'transparent' }}
        />
      </HeaderAntD>
    ),
    [accession, baseUrl, height, isMobile, mobileMenuButton],
  );
}

export default Header;
