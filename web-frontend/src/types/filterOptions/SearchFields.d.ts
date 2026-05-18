import CompoundSearchFilterOptions from './CompoundSearchFilterOptions';
import PropertyFilterOptions from './PropertyFilterOptions';
import SpectralSearchFilterOptions from './SpectralSearchFilterOptions';
import TaxonomyFilterOptions from './TaxonomyFilterOptions';

interface SearchFields {
  compoundSearchFilterOptions?: CompoundSearchFilterOptions;
  spectralSearchFilterOptions?: SpectralSearchFilterOptions;
  propertyFilterOptions?: PropertyFilterOptions;
  taxonomyFilterOptions?: TaxonomyFilterOptions;
}

export default SearchFields;
