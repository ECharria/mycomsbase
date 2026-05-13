import './Pagination.scss';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ResultTable from './ResultTable';
import Hit from '../../types/Hit';
import Peak from '../../types/peak/Peak';
import Record from '../../types/record/Record';
import Placeholder from '../basic/Placeholder';
import fetchData from '../../utils/request/fetchData';
import {
  Button,
  Modal,
  Pagination,
  Select,
  Spin,
} from 'antd';
import { Content } from 'antd/es/layout/layout';
import SpectralHitsCarouselView from '../routes/pages/search/SpectralHitsCarouselView';
import ResultTableSortOptionType from '../../types/ResultTableSortOptionType';
import axios from 'axios';
import FileSaver from 'file-saver';
import { usePropertiesContext } from '../../context/properties/properties';
import ResultTableSortOption from '../../types/ResultTableSortOption';
import Tooltip from '../basic/Tooltip';
import { QuestionCircleTwoTone } from '@ant-design/icons';
const { saveAs } = FileSaver;

type InputProps = {
  reference?: Peak[];
  hits: Hit[];
  width: number;
  height: number;
  sortOptions?: ResultTableSortOptionType[];
  onSort?: (value: ResultTableSortOption) => void;
  widthOverview?: number;
  heightOverview?: number;
};

function ResultPanel({
  reference,
  hits,
  width,
  height,
  sortOptions = [],
  onSort = () => {},
  widthOverview = width,
  heightOverview = height,
}: InputProps) {
  const { backendUrl } = usePropertiesContext();

  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isRequestingDownload, setIsRequestingDownload] =
    useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [resultPageIndex, setResultPageIndex] = useState<number>(0);
  const [selectedSortOption, setSelectedSortOption] = useState<
    ResultTableSortOption | undefined
  >();
  const [hitsWithRecords, setHitsWithRecords] = useState<Hit[] | undefined>();

  const pageLimit = 20;
  const paginationHeight = 50;

  const resultTableData = useMemo(() => {
    const _resultTableData: Hit[][] = [];
    let counter = 0;
    let resultHits: Hit[] = [];

    for (let i = 0; i < hits.length; i++) {
      if (counter < pageLimit) {
        resultHits.push(hits[i]);
        counter++;
      } else {
        _resultTableData.push(resultHits);
        resultHits = [hits[i]];
        counter = 1;
      }
    }
    if (resultHits.length > 0) {
      _resultTableData.push(resultHits);
    }

    return _resultTableData;
  }, [hits]);

  const fetchRecords = useCallback(async () => {
    setIsRequesting(true);

    const _hits =
      resultTableData.length > 0 ? resultTableData[resultPageIndex] : [];

    let _hitsWithRecords: Hit[] = [];
    if (_hits.length > 0) {
      const from = 0;
      let to = pageLimit;
      if (to > _hits.length) {
        to = _hits.length;
      }

      const range = to - from;
      const accessions = _hits
        .slice(from, from + range)
        .map((h) => h.accession);

      const records: (Record | undefined)[] = [];
      for (const accession of accessions) {
        const url = backendUrl + '/records/' + accession + '/simple';

        const record = await fetchData(url);

        if (record !== undefined && typeof record === 'object') {
          record.peak.peak.values = record.peak.peak.values.map((p: Peak) => {
            return {
              mz: p.mz,
              intensity: p.intensity,
              rel: p.rel,
              id: 'peak-' + p.id,
            } as Peak;
          });

          records.push(record);
        } else {
          records.push(undefined);
        }
      }

      _hitsWithRecords = _hits.slice(from, from + range).map((h, i) => {
        h.record = records[i];
        return h;
      });
    }

    setHitsWithRecords(_hitsWithRecords);
    setIsRequesting(false);
  }, [resultTableData, resultPageIndex, backendUrl]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOnDoubleClick = useCallback((_slideIndex: number) => {
    setSlideIndex(_slideIndex % pageLimit);
    setShowModal(true);
  }, []);

  const resultTable = useMemo(
    () => (
      <ResultTable
        reference={reference}
        hits={hitsWithRecords || []}
        height={height - paginationHeight}
        onDoubleClick={handleOnDoubleClick}
        rowHeight={110}
        chartWidth={220}
        imageWidth={150}
      />
    ),
    [reference, hitsWithRecords, height, handleOnDoubleClick],
  );

  const modal = useMemo(
    () => (
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={widthOverview}
        height={heightOverview}
        centered
        destroyOnHidden
      >
        <SpectralHitsCarouselView
          reference={reference}
          hits={hitsWithRecords || []}
          slideIndex={slideIndex}
          width={widthOverview}
          height={heightOverview}
        />
      </Modal>
    ),
    [
      showModal,
      widthOverview,
      heightOverview,
      reference,
      hitsWithRecords,
      slideIndex,
    ],
  );

  const handleOnSelectPage = useCallback(
    (pageIndex: number | null) => {
      if (
        pageIndex &&
        pageIndex > 0 &&
        pageIndex <= Math.ceil(hits.length / pageLimit)
      ) {
        setResultPageIndex(pageIndex - 1);
      }
    },
    [hits.length],
  );

  const handleOnSelect = useCallback(
    (value: ResultTableSortOption) => {
      setSelectedSortOption(value);
      onSort(value);
    },
    [onSort],
  );

  const similarityBaseUrl = backendUrl.replace(/\/[^/]+$/, '/similarity');

  const handleOnDownloadMgf = useCallback(async () => {
    setIsRequestingDownload(true);
    const url = `${similarityBaseUrl}/export/mgf`;
    const resp = await axios.post(
      url,
      { record_list: hits.map((h) => h.accession) },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/octet-stream',
        },
      },
    );
    if (resp.status === 200) {
      const blob = new Blob([resp.data], { type: 'application/octet-stream' });
      saveAs(blob, 'mycomsbase_export.mgf');
    }
    setIsRequestingDownload(false);
  }, [similarityBaseUrl, hits]);

  const paginationContainer = useMemo(() => {
    return (
      <Content
        style={{
          width: '100%',
          height: paginationHeight,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingLeft: 12,
          paddingRight: 12,
          borderBottom: '1px solid #f0ebe8',
          backgroundColor: '#fdfaf9',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: '#7b1c1c',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {hits.length} records
        </span>
        <Pagination
          className="result-panel-pagination"
          total={hits.length}
          pageSize={pageLimit}
          onChange={handleOnSelectPage}
          current={resultPageIndex + 1}
          showSizeChanger={false}
          showQuickJumper
          locale={{ jump_to: 'Page', page: '' }}
          style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
          size="small"
        />
        {sortOptions.length > 0 && (
          <Select
            defaultValue={selectedSortOption}
            style={{ width: 160, flexShrink: 0 }}
            placeholder="Sort by"
            optionFilterProp="label"
            options={sortOptions}
            onSelect={handleOnSelect}
            size="small"
          />
        )}
        <Button
          size="small"
          onClick={handleOnDownloadMgf}
          style={{
            flexShrink: 0,
            backgroundColor: '#7b1c1c',
            borderColor: '#7b1c1c',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 6,
          }}
        >
          Download MGF
        </Button>
        <Tooltip
          title="Double-click a row to open the carousel view with interactive chart and comparison tools."
          placement="left"
        >
          <QuestionCircleTwoTone
            style={{ fontSize: 16, flexShrink: 0, cursor: 'help' }}
          />
        </Tooltip>
      </Content>
    );
  }, [
    hits.length,
    handleOnSelectPage,
    resultPageIndex,
    sortOptions,
    selectedSortOption,
    handleOnSelect,
    handleOnDownloadMgf,
  ]);

  return useMemo(
    () =>
      resultTableData.length > 0 ? (
        <Content style={{ width, height }}>
          {isRequesting ? (
            <Content
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin size="large" />
            </Content>
          ) : isRequestingDownload ? (
            <Content
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin size="large" />
              <label
                style={{ marginTop: 20, fontSize: 16, fontWeight: 'bolder' }}
              >
                Preparing download...
              </label>
            </Content>
          ) : (
            <Content
              style={{
                width: '100%',
                height,
                overflow: 'auto',
              }}
            >
              {paginationContainer}
              {resultTable}
              {modal}
            </Content>
          )}
        </Content>
      ) : (
        <Placeholder
          child={'No results'}
          style={{
            width,
            height,
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: 'white',
          }}
        />
      ),
    [
      height,
      isRequesting,
      isRequestingDownload,
      modal,
      paginationContainer,
      resultTable,
      resultTableData.length,
      width,
    ],
  );
}

export default ResultPanel;
