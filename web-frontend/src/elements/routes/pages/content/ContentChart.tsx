import { useMemo } from 'react';
import { splitStringAndCapitaliseFirstLetter, splitStringAndJoin } from '../../../../utils/stringUtils';
import ValueCount from '../../../../types/ValueCount';
import ContentFilterOptions from '../../../../types/filterOptions/ContentFilterOtions';
import { Content } from 'antd/es/layout/layout';
import Plot, { PlotParams } from 'react-plotly.js';

const mycoColors = [
  '#8b1824',
  '#c4783a',
  '#5a3827',
  '#8b6b5a',
  '#d4a574',
  '#7b4f3d',
  '#a8765e',
  '#4a2820',
  '#e0c4b0',
  '#6b3728',
];

type InputProps = {
  content: ContentFilterOptions;
  identifier: string;
  width: number;
  height: number;
};

function ContentChart({ content, identifier, width, height }: InputProps) {
  const topN = 10;

  const chart = useMemo(() => {
    const filteredValueCounts = [...(content[identifier] as ValueCount[])].filter(
      (vc) => vc.flag === true,
    );
    const totalCount =
      filteredValueCounts.length > 0
        ? filteredValueCounts.map((vc) => vc.count).reduce((a, b) => a + b)
        : undefined;

    const sorted = filteredValueCounts
      .sort((a, b) => b.count - a.count)
      .map((vc) => ({
        ...vc,
        percentage: totalCount ? (vc.count / totalCount) * 100 : 0,
        label: splitStringAndJoin(vc.value, '_', ' '),
      }))
      .slice(0, topN);

    const chartTitle =
      (filteredValueCounts.length > topN ? `Top ${topN} of ` : '') +
      splitStringAndCapitaliseFirstLetter(identifier, '_', ' ');

    const innerWidth = width - 24;
    const innerHeight = height - 50;

    // Use horizontal bar chart when one category is dominant (>88%)
    const useBarChart =
      sorted.length > 0 && (sorted[0].percentage > 88 || sorted.length === 1);

    let data: PlotParams['data'];
    let layout: PlotParams['layout'];

    if (useBarChart) {
      const labels = sorted.map((vc) => `${vc.label} (${vc.percentage.toPrecision(3)}%)`);
      const counts = sorted.map((vc) => vc.count);
      const colors = sorted.map((_, i) => mycoColors[i % mycoColors.length]);

      data = [
        {
          type: 'bar',
          orientation: 'h',
          x: counts,
          y: labels,
          marker: { color: colors },
          hovertemplate: '%{y}: %{x}<extra></extra>',
        },
      ];

      layout = {
        title: { text: chartTitle, font: { size: 13 } },
        width: innerWidth,
        height: innerHeight,
        margin: { t: 40, b: 30, l: Math.min(200, innerWidth * 0.45), r: 20 },
        xaxis: { showticklabels: false, showgrid: false, zeroline: false },
        yaxis: { tickfont: { size: 11 } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
      };
    } else {
      data = [
        {
          type: 'pie',
          hole: 0.5,
          labels: sorted.map(
            (vc) => `${vc.label} (${vc.percentage.toPrecision(3)}%)`,
          ),
          values: sorted.map((vc) => vc.count),
          textinfo: 'none',
          hovertemplate: '%{label}: %{value}<extra></extra>',
          marker: { colors: mycoColors },
        },
      ];

      layout = {
        title: { text: chartTitle, font: { size: 13 } },
        width: innerWidth,
        height: innerHeight,
        margin: { t: 40, b: 10, l: 10, r: 10 },
        showlegend: true,
        legend: {
          font: { size: 10 },
          orientation: 'h',
          x: 0,
          y: -0.1,
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
      };
    }

    return (
      <Content
        style={{
          width: '100%',
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px',
          background: '#fff',
          border: '1px solid #eee3df',
          borderRadius: 12,
          boxSizing: 'border-box',
        }}
      >
        <Plot data={data} layout={layout} config={{ displayModeBar: false }} />
      </Content>
    );
  }, [content, height, identifier, width]);

  return useMemo(
    () => (
      <Content
        style={{
          width: '100%',
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 8,
        }}
      >
        {chart}
      </Content>
    ),
    [chart, height, width],
  );
}

export default ContentChart;
