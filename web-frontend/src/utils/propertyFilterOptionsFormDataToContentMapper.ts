import ContentFilterOptions from '../types/filterOptions/ContentFilterOtions';
import SearchFields from '../types/filterOptions/SearchFields';
import ValueCount from '../types/ValueCount';

const propertyFilterOptionsFormDataToContentMapper = (
  formData: SearchFields['propertyFilterOptions'],
  content: ContentFilterOptions | undefined,
) => {
  const mapper = (
    d: string[],
    cont: ValueCount[] | undefined,
  ): ValueCount[] => {
    if (!cont) {
      return (d || []).map((value) => ({ value }) as ValueCount);
    }
    return cont.map((vc) => {
      return {
        ...vc,
        flag: d.includes(vc.value),
      };
    });
  };

  return {
    ion_mode: mapper(formData?.ion_mode ?? [], content?.ion_mode),
    genus: mapper(formData?.genus ?? [], content?.genus),
    species: mapper(formData?.species ?? [], content?.species),
  } as ContentFilterOptions;
};

export default propertyFilterOptionsFormDataToContentMapper;
