import { Content } from 'antd/es/layout/layout';
import { CSSProperties, useMemo, useState } from 'react';
import { Collapse } from 'antd';
import Metadata from '../../../../types/Metadata';
import {
  BarChartOutlined,
  ExperimentOutlined,
  TagOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

type InputProps = {
  metadata: Metadata | undefined;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #eee3df',
        borderRadius: 12,
        padding: '16px 20px',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#7b1c1c', fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 800, color: '#2d2d2d', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function MetadataPanel({ metadata, width = '100%', height }: InputProps) {
  const content = useMemo(() => {
    if (!metadata) return null;

    const ts = metadata.timestamp
      ? metadata.timestamp.replace('T', ' ').replace('Z', '').split('.')[0]
      : 'N/A';

    const technicalItems = [
      { label: 'Git Commit', value: metadata.git_commit || 'N/A' },
      {
        label: 'Compound Classes (ChemOnt)',
        value:
          metadata.compound_class_chemont?.length > 0
            ? String(metadata.compound_class_chemont.length)
            : 'N/A',
      },
      {
        label: 'Compound Classes (free text)',
        value: String(metadata.compound_class?.length || 0),
      },
    ];

    return (
      <div style={{ width: '100%', padding: '20px 20px 0' }}>
        {/* Stat cards row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <StatCard
            icon={<BarChartOutlined />}
            label="Unique Spectra"
            value={metadata.spectra_count ?? 'N/A'}
          />
          <StatCard
            icon={<ExperimentOutlined />}
            label="Unique Compounds"
            value={metadata.compound_count ?? 'N/A'}
          />
          <StatCard
            icon={<TagOutlined />}
            label="Data Version"
            value={metadata.version || 'N/A'}
          />
          <StatCard
            icon={<CalendarOutlined />}
            label="Last Updated"
            value={ts}
          />
        </div>

        {/* Technical details collapsible */}
        <Collapse
          ghost
          size="small"
          items={[
            {
              key: 'technical',
              label: (
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
                  Technical details
                </span>
              ),
              children: (
                <div
                  style={{
                    background: '#fbf8f6',
                    border: '1px solid #eee3df',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {technicalItems.map((item, i) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        padding: '8px 14px',
                        borderBottom:
                          i < technicalItems.length - 1
                            ? '1px solid #f0ebe8'
                            : 'none',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ width: 220, color: '#888', flexShrink: 0 }}>
                        {item.label}
                      </span>
                      <span
                        style={{
                          color: '#2d2d2d',
                          fontFamily: item.label === 'Git Commit' ? 'monospace' : undefined,
                          fontSize: item.label === 'Git Commit' ? 11 : 12,
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }, [metadata]);

  return useMemo(
    () => (
      <Content
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          overflowY: 'auto',
        }}
      >
        {content ?? (
          <div style={{ padding: 20, color: '#aaa', fontSize: 13 }}>
            No metadata available.
          </div>
        )}
      </Content>
    ),
    [content, height, width],
  );
}

export default MetadataPanel;
