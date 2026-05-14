import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import fetchData from '../../../../utils/request/fetchData';
import { usePropertiesContext } from '../../../../context/properties/properties';

type ScatterPoint = {
  accession: string;
  mz: number;
  ccs: number;
  biosyntheticClass: string;
};

const CLASS_COLORS: Record<string, string> = {
  Polyketide: '#8b1824',
  Terpene: '#c4783a',
  'NRPS-like': '#5a3827',
  'PKS-NRPS': '#8b6b5a',
};
const DEFAULT_COLOR = '#aaa';

type InputProps = {
  width: number;
  height: number;
};

function CcsScatterView({ width, height }: InputProps) {
  const { backendUrl } = usePropertiesContext();
  const [data, setData] = useState<ScatterPoint[]>([]);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    point: ScatterPoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchData(backendUrl + '/records/scatter').then((d) => {
      setData(d as ScatterPoint[]);
    });
  }, [backendUrl]);

  const margin = { top: 30, right: 30, bottom: 60, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const { xScale, yScale, classes } = useMemo(() => {
    if (!data.length) return { xScale: null, yScale: null, classes: [] };

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.mz)! * 1.05])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.ccs)! * 0.95,
        d3.max(data, (d) => d.ccs)! * 1.05,
      ])
      .range([innerHeight, 0]);

    const classes = Array.from(new Set(data.map((d) => d.biosyntheticClass)));

    return { xScale, yScale, classes };
  }, [data, innerWidth, innerHeight]);

  const xTicks = xScale ? xScale.ticks(6) : [];
  const yTicks = yScale ? yScale.ticks(6) : [];

  if (!data.length || !xScale || !yScale) return null;

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg ref={svgRef} width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* grid lines */}
          {yTicks.map((t) => (
            <line
              key={t}
              x1={0} x2={innerWidth}
              y1={yScale(t)} y2={yScale(t)}
              stroke="#e0d8d0" strokeWidth={1}
            />
          ))}
          {xTicks.map((t) => (
            <line
              key={t}
              x1={xScale(t)} x2={xScale(t)}
              y1={0} y2={innerHeight}
              stroke="#e0d8d0" strokeWidth={1}
            />
          ))}

          {/* axes */}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="#888" />
          <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="#888" />

          {/* x tick labels */}
          {xTicks.map((t) => (
            <text
              key={t}
              x={xScale(t)} y={innerHeight + 18}
              textAnchor="middle" fontSize={11} fill="#555"
            >
              {t}
            </text>
          ))}

          {/* y tick labels */}
          {yTicks.map((t) => (
            <text
              key={t}
              x={-8} y={yScale(t) + 4}
              textAnchor="end" fontSize={11} fill="#555"
            >
              {t.toFixed(0)}
            </text>
          ))}

          {/* axis labels */}
          <text
            x={innerWidth / 2} y={innerHeight + 48}
            textAnchor="middle" fontSize={13} fill="#333"
          >
            Precursor m/z
          </text>
          <text
            x={-(innerHeight / 2)} y={-48}
            textAnchor="middle" fontSize={13} fill="#333"
            transform="rotate(-90)"
          >
            CCS (Å²)
          </text>

          {/* points */}
          {data.map((pt) => (
            <circle
              key={pt.accession}
              cx={xScale(pt.mz)}
              cy={yScale(pt.ccs)}
              r={5}
              fill={CLASS_COLORS[pt.biosyntheticClass] ?? DEFAULT_COLOR}
              fillOpacity={0.8}
              stroke="white"
              strokeWidth={0.5}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const rect = svgRef.current!.getBoundingClientRect();
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  point: pt,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}

          {/* legend */}
          {classes.map((cls, i) => (
            <g key={cls} transform={`translate(${innerWidth - 110}, ${10 + i * 20})`}>
              <circle r={5} fill={CLASS_COLORS[cls] ?? DEFAULT_COLOR} />
              <text x={10} y={4} fontSize={11} fill="#333">{cls}</text>
            </g>
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: 12,
            pointerEvents: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltip.point.accession}</div>
          <div>m/z: {tooltip.point.mz.toFixed(4)}</div>
          <div>CCS: {tooltip.point.ccs.toFixed(2)} Å²</div>
          <div style={{ color: CLASS_COLORS[tooltip.point.biosyntheticClass] ?? DEFAULT_COLOR }}>
            {tooltip.point.biosyntheticClass}
          </div>
        </div>
      )}
    </div>
  );
}

export default CcsScatterView;
