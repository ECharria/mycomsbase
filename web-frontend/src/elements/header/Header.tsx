import './Header.scss';

import { Header as HeaderAntD } from 'antd/es/layout/layout';
import { useSearchParams } from 'react-router-dom';
import { usePropertiesContext } from '../../context/properties/properties';
import { CSSProperties, useMemo } from 'react';
import logo from '../../assets/logo.svg';
import AccessionSearchInputField from '../common/AccessionSearchInputField';

const backgroundColor: CSSProperties['backgroundColor'] = '#f8f4f1';

type InputProps = {
  height: CSSProperties['height'];
};

function Header({ height }: InputProps) {
  const { baseUrl } = usePropertiesContext();
  const [searchParams] = useSearchParams();
  const accession = searchParams.get('id');

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
          padding: '0 24px',
          flexShrink: 0,
          borderBottom: '1px solid #eee3df',
        }}
      >
        <a
          href={baseUrl + '/'}
          target="_self"
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <img
            src={logo}
            alt="MycoMSBase"
            style={{ height: 46 }}
          />
        </a>
        <AccessionSearchInputField
          accession={accession ?? ''}
          disableLabel
          placeholderText="Search by Accession ID"
          inputStyle={{ width: '300px' }}
          style={{ width: '350px', backgroundColor: 'transparent' }}
        />
      </HeaderAntD>
    ),
    [accession, baseUrl, height],
  );
}

export default Header;
