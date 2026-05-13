import { memo } from 'react';
import { Content } from 'antd/es/layout/layout';
import { Button } from 'antd';
import {
  BarChartOutlined,
  UnlockOutlined,
  TagsOutlined,
  ExperimentOutlined,
  CodeOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import ServiceStatusView from './ServiceStatusView';

const tocItems = [
  { id: 'information', label: 'Information' },
  { id: 'service-status', label: 'Service Status' },
  { id: 'acknowledgement', label: 'Acknowledgement' },
  { id: 'supporters', label: 'Supporters' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'imprint', label: 'Imprint' },
];

const sectionCard: React.CSSProperties = {
  background: '#fbf8f6',
  border: '1px solid #eee3df',
  borderRadius: 14,
  padding: 24,
  marginBottom: 18,
  scrollMarginTop: 80,
};

const bodyText: React.CSSProperties = {
  fontSize: 13,
  color: '#555',
  margin: 0,
  lineHeight: 1.75,
};

type SectionProps = {
  id: string;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

function Section({ id, icon, label, children }: SectionProps) {
  return (
    <div id={id} style={sectionCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ color: '#7b1c1c', fontSize: 18, display: 'flex' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#2d2d2d' }}>{label}</h3>
      </div>
      {children}
    </div>
  );
}

const miniCardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e8e0dc',
  borderRadius: 10,
  padding: '14px 16px',
  flex: 1,
  minWidth: 0,
};

function AboutView() {
  return (
    <Content
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: '32px 40px',
        background: '#f5f0ee',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d', margin: '0 0 8px' }}>
            About
          </h1>
          <p style={{ fontSize: 13, color: '#777', margin: 0, lineHeight: 1.7 }}>
            Learn about MycoMSBase, service status, acknowledgements, and how to get involved.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Information */}
            <Section id="information" icon={<InfoCircleOutlined />} label="Information">
              <p style={{ ...bodyText, marginBottom: 10 }}>
                MycoMSBase is an open-source reference library for fungal MS/MS spectra and
                curated metabolite metadata. It is designed to support dereplication, compound
                annotation, and natural-product discovery in fungal metabolomics studies.
              </p>
              <p style={{ ...bodyText, marginBottom: 18 }}>
                The platform provides read-only access to curated records, including compound
                identity, molecular formula, exact mass, structure, acquisition metadata, annotated
                spectra, and downloadable spectral data. MycoMSBase is built to complement
                community resources such as MassBank, GNPS, and related metabolomics
                infrastructures, while focusing specifically on fungal secondary metabolites.
              </p>
              {/* Three feature mini-cards */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <BarChartOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Curated fungal spectra
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Reference MS/MS data from fungal natural products.
                  </p>
                </div>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <TagsOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Metadata-rich records
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Compound, taxonomy, instrument, ionisation mode, precursor, collision energy,
                    and annotations.
                  </p>
                </div>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <UnlockOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Open access
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Search, browse, download, and access records programmatically through the API.
                  </p>
                </div>
              </div>
            </Section>

            {/* Service Status */}
            <Section id="service-status" icon={<CheckCircleOutlined />} label="Service Status">
              <ServiceStatusView />
            </Section>

            {/* Acknowledgement */}
            <Section
              id="acknowledgement"
              icon={<SafetyCertificateOutlined />}
              label="Acknowledgement"
            >
              <p style={{ ...bodyText, marginBottom: 10 }}>
                MycoMSBase builds on open-source metabolomics and cheminformatics infrastructure
                and benefits from the work of the natural-products, fungal biology, and metabolomics
                communities.
              </p>
              <p style={bodyText}>
                We acknowledge the developers and maintainers of tools and resources that support
                spectral data curation, compound annotation, and metabolomics data exchange,
                including MassBank-related infrastructure and community standards for MS/MS data
                sharing. Specific names, institutions, grants, and contributors will be listed here
                as the project grows.
              </p>
            </Section>

            {/* Supporters */}
            <Section id="supporters" icon={<TeamOutlined />} label="Supporters and Contributors">
              <p style={{ ...bodyText, marginBottom: 18 }}>
                MycoMSBase is developed as a community-oriented resource for fungal metabolomics
                and natural-product discovery. The platform welcomes contributions of high-quality
                fungal MS/MS spectra, curated metadata, feedback, and technical suggestions.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <ExperimentOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Data contributors
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Researchers contributing fungal MS/MS spectra and metadata.
                  </p>
                </div>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <CodeOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Technical contributors
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Developers supporting infrastructure, database design, and API functionality.
                  </p>
                </div>
                <div style={miniCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <MessageOutlined style={{ color: '#7b1c1c', fontSize: 15 }} />
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#2d2d2d' }}>
                      Community feedback
                    </p>
                  </div>
                  <p style={{ ...bodyText, fontSize: 12 }}>
                    Users helping improve usability, documentation, and record quality.
                  </p>
                </div>
              </div>
            </Section>

            {/* Accessibility */}
            <Section id="accessibility" icon={<CheckCircleOutlined />} label="Accessibility">
              <p style={{ ...bodyText, marginBottom: 10 }}>
                We aim to make MycoMSBase accessible, readable, and usable across common browsers
                and screen sizes. The interface uses clear navigation, readable contrast, descriptive
                labels, and keyboard-accessible controls where possible.
              </p>
              <p style={bodyText}>
                If you encounter accessibility issues, please contact the MycoMSBase team via{' '}
                <a
                  href="https://github.com/ECharria/mycomsbase/issues"
                  target="_blank"
                  style={{ color: '#7b1c1c', textDecoration: 'underline' }}
                >
                  GitHub
                </a>{' '}
                so we can improve the platform.
              </p>
            </Section>

            {/* Imprint */}
            <Section id="imprint" icon={<IdcardOutlined />} label="Imprint">
              <p style={{ ...bodyText, marginBottom: 16 }}>
                This website is hosted and distributed as part of the MycoMSBase project.
              </p>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0d0c8',
                  borderRadius: 10,
                  padding: '16px 20px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#444',
                  lineHeight: 1.9,
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 13, color: '#2d2d2d', margin: '0 0 6px' }}>
                  Responsible contact
                </p>
                Esteban Charria Giron
                <br />
                Wageningen University &amp; Research
                <br />
                Bioinformatics Group
                <br />
                <a
                  href="mailto:esteban.charriagiron@wur.nl"
                  style={{ color: '#7b1c1c', textDecoration: 'underline' }}
                >
                  esteban.charriagiron@wur.nl
                </a>
              </div>
              <p style={bodyText}>
                For technical issues, bug reports, or feature requests, please use the project{' '}
                <a
                  href="https://github.com/ECharria/mycomsbase"
                  target="_blank"
                  style={{ color: '#7b1c1c', textDecoration: 'underline' }}
                >
                  GitHub repository
                </a>
                .
              </p>
            </Section>
          </div>

          {/* Right sticky TOC */}
          <div style={{ width: 200, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #eee3df',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 11,
                  color: '#999',
                  margin: '0 0 10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                On this page
              </p>
              {tocItems.map((item, i) => (
                <a
                  key={item.id}
                  href={'#' + item.id}
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#555',
                    textDecoration: 'none',
                    padding: '6px 0',
                    borderBottom: i < tocItems.length - 1 ? '1px solid #f5f0ee' : 'none',
                    lineHeight: 1.4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#7b1c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Content>
  );
}

export default memo(AboutView);
