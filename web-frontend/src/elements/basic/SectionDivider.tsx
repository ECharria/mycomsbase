import { CSSProperties } from 'react';

type InputProps = {
  label: string;
  componentStyle?: CSSProperties;
  labelStyle?: CSSProperties;
};

function SectionDivider({
  label,
  componentStyle = {},
  labelStyle = {},
}: InputProps) {
  return (
    <div
      style={{
        marginTop: 30,
        marginBottom: 30,
        paddingLeft: 16,
        ...componentStyle,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          backgroundColor: '#2d2d2d',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 14,
          letterSpacing: '0.05em',
          padding: '4px 16px',
          borderRadius: 20,
          ...labelStyle,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default SectionDivider;
