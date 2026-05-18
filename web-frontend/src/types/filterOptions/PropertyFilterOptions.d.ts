interface PropertyFilterOptions {
  ion_mode: string[];
  genus: string[];
  species: string[];
  adduct_type?: string;
  ccs_min?: number;
  ccs_max?: number;
}

export default PropertyFilterOptions;
