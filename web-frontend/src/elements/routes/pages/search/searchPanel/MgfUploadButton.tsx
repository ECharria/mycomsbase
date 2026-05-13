import { useRef, useCallback } from 'react';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';
import SearchFields from '../../../../../types/filterOptions/SearchFields';

function parseMgfToPeakList(content: string): string | null {
  const lines = content.split(/\r?\n/);
  const peaks: { mz: number; intensity: number }[] = [];
  let inBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toUpperCase() === 'BEGIN IONS') {
      inBlock = true;
      continue;
    }
    if (trimmed.toUpperCase() === 'END IONS') {
      break; // take only the first spectrum
    }
    if (!inBlock || trimmed === '' || trimmed.includes('=')) continue;

    const parts = trimmed.split(/[\s\t]+/);
    if (parts.length >= 2) {
      const mz = parseFloat(parts[0]);
      const intensity = parseFloat(parts[1]);
      if (!isNaN(mz) && !isNaN(intensity)) {
        peaks.push({ mz, intensity });
      }
    }
  }

  if (peaks.length === 0) return null;

  const maxIntensity = Math.max(...peaks.map((p) => p.intensity));
  return peaks
    .map((p) => `${p.mz.toFixed(4)} ${Math.round((p.intensity / maxIntensity) * 999)}`)
    .join('\n');
}

function MgfUploadButton() {
  const form = useFormInstance<SearchFields>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        const peakList = parseMgfToPeakList(content);
        if (peakList) {
          form.setFieldValue(
            ['spectralSearchFilterOptions', 'similarity', 'peakList'],
            peakList,
          );
          message.success(
            `Loaded ${peakList.split('\n').length} peaks from ${file.name}`,
          );
        } else {
          message.error('No peaks found in the MGF file. Check the file format.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [form],
  );

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mgf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        size="small"
        icon={<UploadOutlined />}
        onClick={handleButtonClick}
        style={{
          borderColor: '#7b1c1c',
          color: '#7b1c1c',
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        Upload MGF
      </Button>
      <span style={{ fontSize: 11, color: '#aaa' }}>Loads the first spectrum</span>
    </div>
  );
}

export default MgfUploadButton;
