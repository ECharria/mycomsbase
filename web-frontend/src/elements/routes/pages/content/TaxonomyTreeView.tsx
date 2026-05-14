import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import treeData from '../../../../assets/taxonomy_tree.json';

const CLASS_COLORS: Record<string, string> = {
  Polyketide:  '#8b1824',
  Terpene:     '#c4783a',
  'NRPS-like': '#5a3827',
  'PKS-NRPS':  '#8b6b5a',
};
const FALLBACK_COLOR = '#d4a574';

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
const LABEL_OFFSET = PIE_RADIUS + 5;
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
  const total = Object.values(d.class_counts).reduce((a, b) => a + b, 0);
  const lines = Object.entries(d.class_counts).sort(([, a], [, b]) => b - a);

  return (
    <g transform={`translate(${x + 24},${y - 10})`}>
      <rect
        x={0} y={0}
        width={180} height={28 + lines.length * 18}
        rx={6} fill="white" stroke="#ccc" strokeWidth={1}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
      />
      <text x={10} y={18} fontSize={12} fontWeight={700} fill="#2d2d2d">
        {d.name} <tspan fontSize={10} fontWeight={400} fill="#888">({RANK_LABELS[d.rank]})</tspan>
      </text>
      {lines.map(([cls, n], i) => (
        <g key={cls} transform={`translate(10,${28 + i * 18})`}>
          <rect width={10} height={10} y={-9} fill={CLASS_COLORS[cls] ?? FALLBACK_COLOR} rx={2} />
          <text x={15} y={0} fontSize={11} fill="#444">
            {cls}: {n} spectra ({((n / total) * 100).toFixed(1)}%)
          </text>
        </g>
      ))}
    </g>
  );
}

export default function TaxonomyTreeView({ width, height }: { width: number; height: number }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [startRank, setStartRank] = useState<string>('family');

  const ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];

  const { root, layout } = useMemo(() => {
    // Prune tree to start from the selected rank
    function pruneToRank(node: TreeNode, fromRank: string): TreeNode | null {
      const rankIdx = ranks.indexOf(node.rank);
      const startIdx = ranks.indexOf(fromRank);
      if (rankIdx < startIdx) {
        // go deeper
        for (const child of node.children) {
          const found = pruneToRank(child, fromRank);
          if (found) return found;
        }
        return null;
      }
      return node;
    }

    const pruned = pruneToRank(treeData as TreeNode, startRank) ?? (treeData as TreeNode);
    const root = d3.hierarchy<TreeNode>(pruned);

    const marginTop = 60;
    const marginBottom = 60;
    const marginLeft = 80;
    const marginRight = 220;

    const cluster = d3.cluster<TreeNode>()
      .size([height - marginTop - marginBottom, width - marginLeft - marginRight]);

    cluster(root);
    return { root, layout: { marginTop, marginLeft } };
  }, [width, height, startRank]);

  const links = root.links();
  const nodes = root.descendants();

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {/* Rank selector + Legend row */}
      <div style={{
        position: 'absolute', top: 8, left: 16, display: 'flex', gap: 16,
        alignItems: 'center', fontSize: 11, color: '#666', zIndex: 1,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Show from:</span>
          {['kingdom', 'family', 'genus'].map(r => (
            <button
              key={r}
              onClick={() => setStartRank(r)}
              style={{
                padding: '2px 10px', borderRadius: 12, border: '1px solid #ccc',
                background: startRank === r ? '#7b1c1c' : 'white',
                color: startRank === r ? 'white' : '#444',
                cursor: 'pointer', fontSize: 11,
              }}
            >
              {RANK_LABELS[r]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {Object.entries(CLASS_COLORS).map(([cls, color]) => (
            <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 11, height: 11, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ color: '#444' }}>{cls}</span>
            </div>
          ))}
        </div>
      </div>

      <svg width={width} height={height} style={{ fontFamily: 'sans-serif' }}>
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
                    y={4}
                    fontSize={10}
                    fill="#333"
                    fontStyle="italic"
                  >
                    {node.data.name}
                  </text>
                )}
                {!isLeaf && node.data.rank !== 'kingdom' && (
                  <text
                    x={0}
                    y={-PIE_RADIUS - 5}
                    fontSize={9}
                    fill="#888"
                    textAnchor="middle"
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
  );
}
