import { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import treeData from '../../../../assets/taxonomy_tree.json';

const CLASS_COLORS: Record<string, string> = {
  'Polyketides':                        '#8b1824',
  'Terpenoids':                         '#c4783a',
  'Alkaloids':                          '#4a6741',
  'Amino acids and Peptides':           '#3a5f7a',
  'Shikimates and Phenylpropanoids':    '#7a5a8b',
  'Fatty acids':                        '#c4a83a',
  'Polyketides / Terpenoids':           '#a85030',
  'Amino acids and Peptides / Polyketides': '#4a6b8b',
  'Alkaloids / Amino acids and Peptides':   '#5a7a4a',
  'Unknown':                            '#aaaaaa',
};
const FALLBACK_COLOR = '#cccccc';

type TreeNode = {
  name: string;
  rank: string;
  class_counts: Record<string, number>;
  children: TreeNode[];
};

type TooltipState = {
  x: number;
  y: number;
  node: d3.HierarchyNode<TreeNode>;
} | null;

const PIE_RADIUS = 18;
const LABEL_OFFSET = PIE_RADIUS + 6;
const RANK_LABELS: Record<string, string> = {
  kingdom: 'Kingdom', phylum: 'Phylum', class: 'Class',
  order: 'Order', family: 'Family', genus: 'Genus', species: 'Species',
};

function PieChart({ counts, r }: { counts: Record<string, number>; r: number }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return <circle r={r} fill="#eee" />;

  const pie = d3.pie<[string, number]>().value(([, v]) => v).sort(null);
  const arc = d3.arc<d3.PieArcDatum<[string, number]>>().innerRadius(0).outerRadius(r);
  const slices = pie(Object.entries(counts));

  return (
    <g>
      {slices.map((s, i) => (
        <path
          key={i}
          d={arc(s) ?? ''}
          fill={CLASS_COLORS[s.data[0]] ?? FALLBACK_COLOR}
          stroke="white"
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}

function Tooltip({ tip }: { tip: TooltipState }) {
  if (!tip) return null;
  const { x, y, node } = tip;
  const d = node.data;
  const counts = d.class_counts as Record<string, number>;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const lines = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <g transform={`translate(${x + 24},${y - 10})`}>
      <rect
        x={0} y={0}
        width={195} height={28 + lines.length * 18}
        rx={6} fill="white" stroke="#ccc" strokeWidth={1}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
      />
      <text x={10} y={18} fontSize={13} fontWeight={700} fill="#2d2d2d">
        {d.name} <tspan fontSize={11} fontWeight={400} fill="#888">({RANK_LABELS[d.rank]})</tspan>
      </text>
      {lines.map(([cls, n], i) => (
        <g key={cls} transform={`translate(10,${28 + i * 18})`}>
          <rect width={10} height={10} y={-9} fill={CLASS_COLORS[cls] ?? FALLBACK_COLOR} rx={2} />
          <text x={15} y={0} fontSize={12} fill="#444">
            {cls}: {n} spectra ({((n / total) * 100).toFixed(1)}%)
          </text>
        </g>
      ))}
    </g>
  );
}

function flattenTree(node: TreeNode, rows: Record<string, string | number>[] = []): Record<string, string | number>[] {
  const total = Object.values(node.class_counts).reduce((a, b) => a + b, 0);
  rows.push({
    rank: RANK_LABELS[node.rank] ?? node.rank,
    name: node.name,
    total,
    ...Object.fromEntries(Object.entries(node.class_counts)),
  });
  for (const child of node.children ?? []) flattenTree(child, rows);
  return rows;
}

function downloadSvg(svgEl: SVGSVGElement) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taxonomy_tree.svg';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(node: TreeNode) {
  const rows = flattenTree(node);
  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const header = allKeys.join(',');
  const body = rows.map((r) => allKeys.map((k) => r[k] ?? 0).join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taxonomy_tree.csv';
  a.click();
  URL.revokeObjectURL(url);
}


const MIN_NODE_SPACING = 32; // px per leaf node vertically

export default function TaxonomyTreeView({ width, height }: { width: number; height: number }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { root, layout, pruned, svgHeight } = useMemo(() => {
    const pruned = treeData as unknown as TreeNode;
    const root = d3.hierarchy<TreeNode>(pruned);

    const marginTop = 40;
    const marginBottom = 40;
    const marginLeft = 80;
    const marginRight = 240;

    // Size the tree by leaf count so nodes never overlap
    const leafCount = root.leaves().length;
    const treeHeight = Math.max(height - marginTop - marginBottom, leafCount * MIN_NODE_SPACING);
    const svgHeight = treeHeight + marginTop + marginBottom;

    const cluster = d3.cluster<TreeNode>()
      .size([treeHeight, width - marginLeft - marginRight]);

    cluster(root);
    return { root, layout: { marginTop, marginLeft }, pruned, svgHeight };
  }, [width, height]);

  const links = root.links();
  const nodes = root.descendants();

  return (
    <div style={{ position: 'relative', width, height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls row — fixed at top, does not scroll */}
      <div style={{
        flexShrink: 0,
        padding: '8px 16px',
        display: 'flex', gap: 16, alignItems: 'center',
        fontSize: 12, color: '#666', flexWrap: 'wrap',
        borderBottom: '1px solid #eee', background: 'white', zIndex: 1,
      }}>
        {/* Legend — only single-pathway classes */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {Object.entries(CLASS_COLORS)
            .filter(([cls]) => !cls.includes('/') && cls !== 'Unknown')
            .map(([cls, color]) => (
              <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 11, height: 11, borderRadius: 3, background: color, flexShrink: 0 }} />
                <span style={{ color: '#444', fontSize: 12 }}>{cls}</span>
              </div>
            ))}
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Export:</span>
          <button
            style={{ padding: '2px 10px', borderRadius: 12, border: '1px solid #ccc', background: 'white', color: '#444', cursor: 'pointer', fontSize: 12 }}
            onClick={() => svgRef.current && downloadSvg(svgRef.current)}
          >
            SVG
          </button>
          <button
            style={{ padding: '2px 10px', borderRadius: 12, border: '1px solid #ccc', background: 'white', color: '#444', cursor: 'pointer', fontSize: 12 }}
            onClick={() => downloadCsv(pruned)}
          >
            CSV table
          </button>
        </div>
      </div>

      {/* Scrollable SVG area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
      <svg ref={svgRef} width={width} height={svgHeight} style={{ fontFamily: 'sans-serif', display: 'block' }}>
        <g transform={`translate(${layout.marginLeft},${layout.marginTop})`}>
          {/* Links */}
          {links.map((link, i) => {
            const s = link.source as d3.HierarchyPointNode<TreeNode>;
            const t = link.target as d3.HierarchyPointNode<TreeNode>;
            return (
              <path
                key={i}
                d={`M${s.y},${s.x} L${t.y},${s.x} L${t.y},${t.x}`}
                fill="none"
                stroke="#ccc"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const n = node as d3.HierarchyPointNode<TreeNode>;
            const isLeaf = !node.children;
            return (
              <g
                key={i}
                transform={`translate(${n.y},${n.x})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ x: n.y, y: n.x, node })}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle r={PIE_RADIUS + 1} fill="white" stroke="#ddd" strokeWidth={1} />
                <PieChart counts={node.data.class_counts} r={PIE_RADIUS} />
                {isLeaf && (
                  <text
                    x={LABEL_OFFSET}
                    y={5}
                    fontSize={11}
                    fill="#333"
                    fontStyle={['genus', 'species'].includes(node.data.rank) ? 'italic' : 'normal'}
                  >
                    {node.data.name}
                  </text>
                )}
                {!isLeaf && node.data.rank !== 'kingdom' && (
                  <text
                    x={0}
                    y={-PIE_RADIUS - 6}
                    fontSize={10}
                    fill="#555"
                    textAnchor="middle"
                    fontStyle={['genus', 'species'].includes(node.data.rank) ? 'italic' : 'normal'}
                  >
                    {node.data.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tooltip */}
          <Tooltip tip={tooltip} />
        </g>
      </svg>
      </div>
    </div>
  );
}
