import { Content } from 'antd/es/layout/layout';
import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import ResultTableSortOptionType from '../../types/ResultTableSortOptionType';
import resultTableSortOptionValues from '../../constants/resultTableSortOptionValues';
import ResultPanel from '../result/ResultPanel';
import Hit from '../../types/Hit';
import Peak from '../../types/peak/Peak';
import { Spin, Splitter } from 'antd';
import ResultTableSortOption from '../../types/ResultTableSortOption';
import collapseButtonWidth from '../../constants/collapseButtonWidth';
import useIsMobile from '../../utils/useIsMobile';

type InputProps = {
  searchPanel: JSX.Element;
  width: number;
  height: number;
  searchPanelWidth: number;
  widthOverview: number;
  heightOverview: number;
  hits: Hit[];
  isRequesting: boolean;
  reference?: Peak[];
  onSort: (sortValue: ResultTableSortOption) => void;
  onResize: (searchPanelWidth: number) => void;
};

function SearchAndResultPanel({
  searchPanel,
  width,
  height,
  searchPanelWidth,
  widthOverview,
  heightOverview,
  hits,
  isRequesting,
  reference = [],
  onSort,
  onResize,
}: InputProps) {
  const isMobile = useIsMobile();
  const [panelWidths, setPanelWidths] = useState<{
    searchPanel: number;
    resultPanel: number;
  }>({ searchPanel: 0, resultPanel: 0 });

  useEffect(() => {
    setPanelWidths({
      searchPanel: searchPanelWidth,
      resultPanel: width - searchPanelWidth,
    });
  }, [searchPanelWidth, width]);

  const sortOptions = useMemo(() => {
    const _sortOptions: ResultTableSortOptionType[] = [];
    Object.keys(resultTableSortOptionValues).forEach((key: string) => {
      _sortOptions.push({
        value: key,
        label: resultTableSortOptionValues[key],
      });
      if (key === 'score') {
        _sortOptions.push({
          value: key + '_asc',
          label: resultTableSortOptionValues[key] + ' (asc)',
        });
      } else {
        _sortOptions.push({
          value: key + '_desc',
          label: resultTableSortOptionValues[key] + ' (desc)',
        });
      }
    });

    return _sortOptions;
  }, []);

  const handleOnSelectSort = useCallback(
    (sortValue: ResultTableSortOption) => {
      onSort(sortValue);
    },
    [onSort],
  );

  const handleOnResize = useCallback(
    (sizes: number[]) => {
      const _searchPanelWidth = sizes[0];
      onResize(_searchPanelWidth);
    },
    [onResize],
  );

  // Mobile: stacked layout (search on top, results below)
  if (isMobile) {
    return (
      <Content
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          userSelect: 'none',
        }}
      >
        <div style={{ width: '100%', flexShrink: 0 }}>
          {searchPanel}
        </div>
        <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
          <Spin size="large" spinning={isRequesting} />
          {!isRequesting && (
            <ResultPanel
              reference={reference}
              hits={hits}
              width={width}
              height={height * 0.65}
              sortOptions={sortOptions}
              onSort={handleOnSelectSort}
              widthOverview={width}
              heightOverview={heightOverview}
            />
          )}
        </div>
      </Content>
    );
  }

  return useMemo(
    () => (
      <Content
        style={{
          width,
          height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        <Splitter style={{ width, height }} onResize={handleOnResize}>
          <Splitter.Panel
            size={panelWidths.searchPanel}
            min={200 + collapseButtonWidth}
          >
            {searchPanel}
          </Splitter.Panel>
          <Splitter.Panel
            size={panelWidths.resultPanel}
            min={400}
            resizable={panelWidths.searchPanel !== collapseButtonWidth}
          >
            <Content
              style={{
                width: panelWidths.resultPanel,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin size="large" spinning={isRequesting} />
              {!isRequesting && (
                <Content
                  style={{
                    width: width - searchPanelWidth,
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ResultPanel
                    reference={reference}
                    hits={hits}
                    width={width - searchPanelWidth}
                    height={height}
                    sortOptions={sortOptions}
                    onSort={handleOnSelectSort}
                    widthOverview={widthOverview}
                    heightOverview={heightOverview}
                  />
                </Content>
              )}
            </Content>
          </Splitter.Panel>
        </Splitter>
      </Content>
    ),
    [
      width,
      height,
      handleOnResize,
      panelWidths.searchPanel,
      panelWidths.resultPanel,
      searchPanel,
      isRequesting,
      searchPanelWidth,
      reference,
      hits,
      sortOptions,
      handleOnSelectSort,
      widthOverview,
      heightOverview,
    ],
  );
}

export default SearchAndResultPanel;
