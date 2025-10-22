import { Content } from 'antd/es/layout/layout';
import Paragraph from 'antd/es/typography/Paragraph';
import { memo } from 'react';

import massbankLogo from '../../../../assets/logo.svg';

function InfoText() {
  return (
    <Content
      style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={massbankLogo}
        style={{ width: 300, marginTop: 10, marginBottom: 10 }}
        key={'massbank-logo-overview'}
        alt="MycoMSBase logo"
      />
      <Content style={{ padding: 10 }}>
        <Paragraph>
          MycoMSBase is an open-source MS/MS spectral library for fungi, designed to
          speed up dereplication of secondary metabolites in metabolomics studies. The
          content is based on UHPLC-DAD-IMS-MS/MS data acquired centrally under
          harmonized workflows. This instance is <strong>read-only</strong>; multiple
          search options are available for browsing curated records. Records follow the{' '}
          {
            <a
              href="https://github.com/MassBank/MassBank-web/blob/main/Documentation/MassBankRecordFormat.md"
              target="_blank"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              MassBank record format
            </a>
          }
          . The REST API is available at{' '}
          {
            <a
              href="/MassBank-api"
              target="_blank"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              /MassBank-api
            </a>
          }
          .
        </Paragraph>

        <Paragraph>
          Technical issues and ideas can be reported via{' '}
          {
            <a
              href="https://github.com/ECharria/mycomsbase"
              target="_blank"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              GitHub
            </a>
          }
          . For general questions, contact us at{' '}
          {
            <a
              href="mailto:esteban.charriagiron@wur.nl"
              style={{ color: 'black', textDecoration: 'underline' }}
            >
              esteban.charriagiron@wur.nl
            </a>
          }
          .
        </Paragraph>
      </Content>
    </Content>
  );
}

export default memo(InfoText);
