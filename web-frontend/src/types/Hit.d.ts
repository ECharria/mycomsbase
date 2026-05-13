export default interface Hit {
  index: number;
  accession: string;
  atomcount: number;
  score?: number;
  matchSupport?: number;
  peakPairs?: string[];
  record?: Record;
}
