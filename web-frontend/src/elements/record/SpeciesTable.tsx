import './Table.scss';

import { CSSProperties, useMemo } from 'react';
import Species from '../../types/record/Species';
import { Table } from 'antd';
import LinksTable from './LinksTable';
import { Content } from 'antd/es/layout/layout';
import copyTextToClipboard from '../../utils/copyTextToClipboard';
import { getLineage, getTaxid } from '../../utils/taxonomyLookup';

type InputProps = {
  species: Species | undefined;
  width: CSSProperties['width'];
  height: CSSProperties['height'];
};

function SpeciesTable({ species, width, height }: InputProps) {
  return useMemo(() => {
    const columns = [
      {
        title: 'Parameter',
        dataIndex: 'parameter',
        key: 'parameter',
        align: 'center' as const,
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        align: 'center' as const,
      },
    ];

    const lineage = species?.name ? getLineage(species.name) : [];
    const taxid = species?.name ? getTaxid(species.name) : '';
    const ncbiUrl = taxid
      ? `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${taxid}`
      : '';

    const dataSource = [
      {
        key: '1',
        parameter: 'Name',
        value: species?.name ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{ fontStyle: 'italic', cursor: 'pointer' }}
              title="Copy species name to clipboard"
              onClick={() => copyTextToClipboard('Species Name', species.name)}
            >
              {species.name}
            </span>
            {ncbiUrl && (
              <a
                href={ncbiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#7b1c1c', whiteSpace: 'nowrap' }}
              >
                NCBI Taxonomy ↗
              </a>
            )}
          </div>
        ) : '',
      },
      {
        key: '2',
        parameter: 'Lineage',
        value: lineage.length > 0 ? (
          <span style={{ color: '#444', fontSize: 13 }}>
            {lineage.join(' › ')}
          </span>
        ) : '',
      },
    ];

    return (
      <Content
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Table
          className="table"
          style={{ width, height: 'auto', marginBottom: 10 }}
          sticky
          columns={columns}
          dataSource={dataSource}
          pagination={false}
        />

        {species?.link && species.link.length > 0 && (
          <LinksTable
            links={species.link}
            width={width}
            height="auto"
            title={
              <Content
                style={{
                  width,
                  fontWeight: 'bolder',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                Links
              </Content>
            }
          />
        )}
      </Content>
    );
  }, [height, species, width]);
}

export default SpeciesTable;
