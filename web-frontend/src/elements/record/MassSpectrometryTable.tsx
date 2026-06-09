import './Table.scss';

import { Table } from 'antd';
import { CSSProperties, JSX, useMemo } from 'react';
import { splitStringAndCapitaliseFirstLetter } from '../../utils/stringUtils';
import ExportableContent from '../common/ExportableContent';
import copyTextToClipboard from '../../utils/copyTextToClipboard';
import MassSpectrometry from '../../types/record/MassSpectrometry';

type InputProps = {
  massSpectrometry: MassSpectrometry | undefined;
  comments?: { value: string }[];
  width: CSSProperties['width'];
  height: CSSProperties['height'];
};

function MassSpectrometryTable({
  massSpectrometry,
  comments,
  width,
  height,
}: InputProps) {
  return useMemo(() => {
    if (!massSpectrometry) {
      return null;
    }

    const columns = [
      {
        title: 'Parameter',
        dataIndex: 'Parameter',
        key: 'parameter',
        align: 'center' as const,
      },
      {
        title: 'Value',
        dataIndex: 'Value',
        key: 'value',
        align: 'center' as const,
      },
    ];

    const dataSource: { [key: string]: string | JSX.Element }[] = [];

    if (massSpectrometry.focused_ion) {
      massSpectrometry.focused_ion.forEach((c, i) => {
        const isCcs = c.subtag.toUpperCase() === 'CCS';
        const label = isCcs
          ? 'Collision Cross Section (CCS)'
          : splitStringAndCapitaliseFirstLetter(c.subtag, '_', ' ');

        let displayValue = c.value;
        if (isCcs && !isNaN(Number(c.value))) {
          displayValue = `${Number(c.value).toFixed(1)} Å²`;
        } else if (
          label.toLowerCase().includes('precursor m/z') &&
          !isNaN(Number(c.value))
        ) {
          displayValue = Number(c.value).toFixed(4);
        }

        dataSource.push({
          Parameter: label,
          Value: (
            <ExportableContent
              mode="copy"
              title={`Copy '${label}' to clipboard`}
              component={displayValue}
              onClick={() => copyTextToClipboard(label, displayValue)}
            />
          ),
          key: `key-chromatography-${i}`,
        });
      });
    }

    
    const allComments = comments || (massSpectrometry as any)?.comments || [];

    if (Array.isArray(allComments) && allComments.length > 0) {
      const ccsComment = allComments.find(
        (c: any) =>
          typeof c.value === 'string' && c.value.toLowerCase().includes('ccs'),
      );

      if (ccsComment) {
        const match = ccsComment.value.match(/[-+]?[0-9]*\.?[0-9]+/);
        if (match) {
          const ccsDisplay = `${Number(match[0]).toFixed(1)} Å²`;
          dataSource.push({
            Parameter: 'Collision Cross Section (CCS)',
            Value: (
              <ExportableContent
                mode="copy"
                title="Copy 'CCS' to clipboard"
                component={ccsDisplay}
                onClick={() => copyTextToClipboard('CCS', ccsDisplay)}
              />
            ),
            key: 'key-ccs',
          });
        }
      }
    }

    // console.log('CCS Comments Detected:', allComments);


    return (
      <Table
        className="table"
        style={{ width, height }}
        sticky
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    );
  }, [height, massSpectrometry, comments, width]);
}

export default MassSpectrometryTable;
