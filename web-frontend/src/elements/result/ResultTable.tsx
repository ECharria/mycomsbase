import Hit from '../../types/Hit';
import Peak from '../../types/peak/Peak';

import { memo, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import ResultTableDataType from '../../types/ResultTableDataType';
import Chart from '../basic/Chart';
import StructureView from '../basic/StructureView';
import { Content } from 'antd/es/layout/layout';
import { usePropertiesContext } from '../../context/properties/properties';
import routes from '../../constants/routes';

type InputProps = {
  reference?: Peak[];
  hits: Hit[];
  height: number;
  onDoubleClick: (slideIndex: number) => void;
  rowHeight?: number;
  chartWidth?: number;
  imageWidth?: number;
};

function ResultTable({
  reference,
  hits,
  height,
  onDoubleClick,
  rowHeight = 110,
  chartWidth = 220,
  imageWidth = 150,
}: InputProps) {
  const { baseUrl, frontendUrl } = usePropertiesContext();

  const buildCompoundCell = useCallback(
    (hit: Hit) => {
      const record = hit.record;
      const compoundName =
        record?.compound?.names?.[0] || record?.title || hit.accession;
      const instrumentType = record?.acquisition?.instrument_type || '';
      const msType = record?.acquisition?.mass_spectrometry?.ms_type || '';
      const ionMode = record?.acquisition?.mass_spectrometry?.ion_mode || '';
      const metaParts = [instrumentType, msType, ionMode].filter(Boolean);
      const metaLine = metaParts.join(' · ');

      const url =
        frontendUrl +
        baseUrl +
        '/' +
        routes.accession.path +
        '?id=' +
        hit.accession;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <a
            href={url}
            target="_blank"
            style={{
              color: '#7b1c1c',
              fontWeight: 700,
              fontSize: 11,
              fontFamily: 'monospace',
              textDecoration: 'none',
              letterSpacing: '0.03em',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {hit.accession}
          </a>
          <span
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: '#2d2d2d',
              lineHeight: 1.3,
            }}
          >
            {compoundName}
          </span>
          {metaLine && (
            <span style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>
              {metaLine}
            </span>
          )}
        </div>
      );
    },
    [baseUrl, frontendUrl],
  );

  const buildChart = useCallback(
    (hit: Hit) =>
      reference && reference.length > 0 ? (
        <Content
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Chart
            peakData={reference}
            peakData2={
              (hit.record ? hit.record.peak.peak.values : []) as Peak[]
            }
            width={chartWidth}
            height={rowHeight}
            disableZoom
            disableLabels
            disableOnHover
          />
        </Content>
      ) : (
        <Content
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Chart
            peakData={(hit.record ? hit.record.peak.peak.values : []) as Peak[]}
            width={chartWidth}
            height={rowHeight}
            disableZoom
            disableLabels
            disableOnHover
          />
        </Content>
      ),
    [chartWidth, reference, rowHeight],
  );

  const buildStructure = useCallback(
    (smiles: string) => (
      <Content
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StructureView
          smiles={smiles}
          imageWidth={imageWidth}
          imageHeight={rowHeight}
          disableExport
        />
      </Content>
    ),
    [imageWidth, rowHeight],
  );

  const dataSource: ResultTableDataType[] = useMemo(() => {
    return hits.map((hit) => ({
      key: 'result-table-row_' + hit.index + '_' + hit.score,
      index: hit.index + 1,
      score: hit.score ? hit.score.toFixed(4) : undefined,
      matchSupport:
        hit.matchSupport !== undefined
          ? hit.matchSupport.toFixed(3)
          : undefined,
      accession: hit.accession,
      title: hit.record ? buildCompoundCell(hit) : hit.accession,
      chart: hit.record ? buildChart(hit) : null,
      structure: hit.record
        ? buildStructure(hit.record.compound.smiles)
        : null,
    }));
  }, [buildCompoundCell, buildChart, buildStructure, hits]);

  const handleOnDoubleClick = useCallback(
    (record: ResultTableDataType) => ({
      onDoubleClick: () => onDoubleClick(record.index - 1),
    }),
    [onDoubleClick],
  );

  const columns = useMemo(() => {
    const defaultColumns = [
      {
        title: 'Compound',
        dataIndex: 'title',
        key: 'title',
        width: 270,
        onCell: () => ({ style: { verticalAlign: 'middle' as const } }),
      },
      {
        title: 'Spectrum',
        dataIndex: 'chart',
        key: 'chart',
        width: chartWidth + 20,
        onCell: () => ({ style: { padding: '4px 8px' } }),
      },
      {
        title: 'Structure',
        dataIndex: 'structure',
        key: 'structure',
        width: imageWidth + 20,
        onCell: () => ({ style: { padding: '4px 4px' } }),
      },
    ];

    const _columns = [...defaultColumns];

    if (hits.find((hit) => hit.score !== undefined)) {
      _columns.unshift({
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        width: 72,
        onCell: () => ({
          style: {
            textAlign: 'center' as const,
            fontSize: 12,
            color: '#555',
            verticalAlign: 'middle' as const,
          },
        }),
      });
    }

    if (hits.find((hit) => hit.matchSupport !== undefined)) {
      const scoreIdx = _columns.findIndex((c) => c.key === 'score');
      _columns.splice(scoreIdx + 1, 0, {
        title: 'Support',
        dataIndex: 'matchSupport',
        key: 'matchSupport',
        width: 72,
        onCell: () => ({
          style: {
            textAlign: 'center' as const,
            fontSize: 12,
            color: '#555',
            verticalAlign: 'middle' as const,
          },
        }),
      });
    }

    return _columns;
  }, [chartWidth, hits, imageWidth]);

  return (
    <Table<ResultTableDataType>
      style={{ width: '100%', height }}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      onRow={handleOnDoubleClick}
      scroll={{ x: 'max-content', y: height - 56 }}
      sticky
      size="small"
      rowStyle={{ cursor: 'pointer', height: rowHeight }}
    />
  );
}

export default memo(ResultTable);
