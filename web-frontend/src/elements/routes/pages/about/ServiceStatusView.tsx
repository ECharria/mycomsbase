import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePropertiesContext } from '../../../../context/properties/properties';
import { Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import StatusResult from '../../../../types/StatusResult';

type ServiceRow = {
  name: string;
  error: string | null;
};

function StatusRow({ name, error }: ServiceRow) {
  const ok = !error || error.length === 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0',
        borderBottom: '1px solid #f0ebe8',
      }}
    >
      {ok ? (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 15 }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 15 }} />
      )}
      <span style={{ flex: 1, fontSize: 13, color: '#2d2d2d' }}>{name}</span>
      <span
        style={{
          fontSize: 12,
          color: ok ? '#52c41a' : '#ff4d4f',
          fontWeight: 600,
        }}
      >
        {ok ? 'Connected' : 'Error'}
      </span>
    </div>
  );
}

function ServiceStatusView() {
  const { backendUrl } = usePropertiesContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [errorPostgres, setErrorPostgres] = useState<string | null>(null);
  const [errorSimilarityService, setErrorSimilarityService] = useState<string | null>(null);
  const [errorExportService, setErrorExportService] = useState<string | null>(null);

  const handleOnCheckServiceStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/status`);
      if (response.status === 200) {
        setErrorApi(null);
        const statusResult = response.data as StatusResult;
        setErrorPostgres(statusResult.postgres.error ?? null);
        setErrorSimilarityService(statusResult.similarity_service.error ?? null);
        setErrorExportService(statusResult.export_service.error ?? null);
      } else {
        setErrorApi(response.statusText);
        setErrorPostgres("Couldn't connect to the API");
        setErrorSimilarityService("Couldn't connect to the API");
        setErrorExportService("Couldn't connect to the API");
      }
    } catch (error: unknown) {
      setErrorApi((error as Error).message);
      setErrorPostgres("Couldn't connect to the API");
      setErrorSimilarityService("Couldn't connect to the API");
      setErrorExportService("Couldn't connect to the API");
    }
    setLastChecked(new Date());
    setIsLoading(false);
  }, [backendUrl]);

  useEffect(() => {
    handleOnCheckServiceStatus();
  }, [handleOnCheckServiceStatus]);

  return useMemo(
    () => (
      <div>
        {isLoading ? (
          <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center' }}>
            <Spin size="default" spinning />
          </div>
        ) : (
          <>
            <StatusRow name="MycoMSBase API" error={errorApi} />
            <StatusRow name="Postgres Database" error={errorPostgres} />
            <StatusRow name="Similarity Service" error={errorSimilarityService} />
            <StatusRow name="Export Service" error={errorExportService} />
          </>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
          }}
        >
          <span style={{ fontSize: 12, color: '#aaa' }}>
            {lastChecked
              ? `Last checked: ${lastChecked.toLocaleTimeString()}`
              : 'Checking…'}
          </span>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleOnCheckServiceStatus}
            disabled={isLoading}
            style={{
              borderColor: '#7b1c1c',
              color: '#7b1c1c',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Refresh
          </Button>
        </div>
      </div>
    ),
    [
      errorApi,
      errorExportService,
      errorPostgres,
      errorSimilarityService,
      handleOnCheckServiceStatus,
      isLoading,
      lastChecked,
    ],
  );
}

export default ServiceStatusView;
