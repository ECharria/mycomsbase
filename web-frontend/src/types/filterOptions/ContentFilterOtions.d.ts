import ValueCount from './ValueCount';

export default interface ContentFilterOptions {
  contributor: ValueCount[];
  instrument_type: ValueCount[];
  ion_mode: ValueCount[];
  ms_type: ValueCount[];
  compound_class: ValueCount[];
  genus: ValueCount[];
  species: ValueCount[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}
