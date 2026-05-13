type ResultTableDataType = {
  key: React.Key;
  index: number;
  score: number | string | undefined;
  matchSupport: number | string | undefined;
  accession: string | JSX.Element;
  title: string | JSX.Element;
  chart: JSX.Element | null;
  structure: JSX.Element | null;
};

export default ResultTableDataType;
