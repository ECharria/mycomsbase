interface CompoundSearchFilterOptions {
  compoundName?: string;
  compoundClass?: string;
  exactMass?: number;
  massTolerance?: number;
  massMin?: number;
  massMax?: number;
  formula?: string;
  inchi?: string;
  structure?: string;
}

export default CompoundSearchFilterOptions;
