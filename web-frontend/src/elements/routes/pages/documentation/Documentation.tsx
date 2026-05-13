import { memo } from 'react';
import { Content } from 'antd/es/layout/layout';
import { Button } from 'antd';
import {
  SearchOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  DownloadOutlined,
  TeamOutlined,
  BookOutlined,
} from '@ant-design/icons';

const tocItems = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'compound-search', label: 'Searching for a compound' },
  { id: 'browsing', label: 'Browsing the library' },
  { id: 'reading-record', label: 'Reading a record' },
  { id: 'downloading', label: 'Downloading data' },
  { id: 'contributing', label: 'Contributing' },
];

const sectionCardStyle: React.CSSProperties = {
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

type DocSectionProps = {
  id: string;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

function DocSection({ id, icon, label, children }: DocSectionProps) {
  return (
    <div id={id} style={sectionCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: '#7b1c1c', fontSize: 18, display: 'flex' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#2d2d2d' }}>{label}</h3>
      </div>
      {children}
    </div>
  );
}

type SearchMethodProps = {
  label: string;
  description: React.ReactNode;
};

function SearchMethod({ label, description }: SearchMethodProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontWeight: 700, fontSize: 13, color: '#2d2d2d', margin: '0 0 3px' }}>
        {label}
      </p>
      <p style={bodyText}>{description}</p>
    </div>
  );
}

function Documentation() {
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
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d', margin: '0 0 8px' }}>
            Documentation
          </h1>
          <p style={{ fontSize: 13, color: '#777', margin: 0, lineHeight: 1.7 }}>
            Learn how to search, browse, interpret, download, and contribute fungal MS/MS records.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <DocSection id="getting-started" icon={<BookOutlined />} label="Getting Started">
              <p style={bodyText}>
                MycoMSBase is a curated reference library of MS/MS spectra from fungal secondary
                metabolites. It is designed to support the identification and dereplication of
                fungal natural products in metabolomics experiments.
              </p>
            </DocSection>

            <DocSection
              id="compound-search"
              icon={<SearchOutlined />}
              label="Searching for a compound"
            >
              <SearchMethod
                label="By name or formula"
                description={
                  <>
                    Go to the <strong>Search</strong> page. Type a compound name, synonym, or
                    molecular formula (e.g.{' '}
                    <code
                      style={{
                        background: '#f0eae6',
                        padding: '1px 5px',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      C20H24O6
                    </code>
                    ) into the search box and press Search. Results are ranked by relevance and can
                    be filtered by instrument type, ionisation mode, and more.
                  </>
                }
              />
              <SearchMethod
                label="By accession number"
                description={
                  <>
                    If you already know the record ID, use the{' '}
                    <strong>Search by Accession ID</strong> box in the top-right corner and click
                    Search.
                  </>
                }
              />
              <SearchMethod
                label="By structure"
                description="On the Search page, use the structure editor to draw or paste a SMILES string for substructure or exact-match searching."
              />
            </DocSection>

            <DocSection id="browsing" icon={<DatabaseOutlined />} label="Browsing the library">
              <p style={bodyText}>
                The <strong>Content</strong> page lets you explore the library without a specific
                query. You can filter by contributor, instrument type, ionisation mode, and compound
                class to get an overview of what is available.
              </p>
            </DocSection>

            <DocSection id="reading-record" icon={<FileTextOutlined />} label="Reading a record">
              <p style={{ ...bodyText, marginBottom: 10 }}>Each record page shows:</p>
              <ul
                style={{
                  fontSize: 13,
                  color: '#555',
                  margin: 0,
                  paddingLeft: 20,
                  lineHeight: 2,
                }}
              >
                <li>
                  <strong>Compound identity</strong> — name, molecular formula, exact mass, and
                  structure
                </li>
                <li>
                  <strong>Acquisition details</strong> — instrument, ionisation method, collision
                  energy, and precursor ion
                </li>
                <li>
                  <strong>An interactive spectrum</strong> — hover over peaks to read m/z values;
                  zoom in by scrolling
                </li>
                <li>
                  <strong>The full annotated peak list</strong>
                </li>
              </ul>
            </DocSection>

            <DocSection id="downloading" icon={<DownloadOutlined />} label="Downloading data">
              <p style={bodyText}>
                From any search result, use the <strong>Download</strong> button to export the
                selected spectra in MGF format, suitable for use in GNPS, MS-DIAL, MZmine, or other
                tools.
              </p>
            </DocSection>

            <DocSection id="contributing" icon={<TeamOutlined />} label="Contributing">
              <p style={{ ...bodyText, marginBottom: 18 }}>
                We welcome contributions of high-quality MS/MS spectra from fungal secondary
                metabolites. Contributed records are curated before inclusion to ensure consistent
                metadata, accurate compound annotation, and reproducible acquisition conditions.
              </p>
              {/* Callout box */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0d0c8',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#2d2d2d',
                      margin: '0 0 4px',
                    }}
                  >
                    Want to contribute spectra?
                  </p>
                  <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>
                    Contact the MycoMSBase team to discuss sample transfer, metadata requirements,
                    and submission steps.
                  </p>
                </div>
                <Button
                  style={{
                    flexShrink: 0,
                    borderColor: '#7b1c1c',
                    color: '#7b1c1c',
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    window.open('https://github.com/ECharria/mycomsbase/issues', '_blank')
                  }
                >
                  Contact the team
                </Button>
              </div>
            </DocSection>
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

export default memo(Documentation);
