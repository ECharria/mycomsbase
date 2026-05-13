import { createContext, useContext } from 'react';
import PropertiesContextProps from '../../types/PropertiesContextProps';

const emptyState: PropertiesContextProps = {
  baseUrl: '',
  backendUrl: '',
  frontendUrl: '',
  version: '',
  distributorText: '',
  distributorUrl: '',
  homepageIntroText: '',
  homepageNewsSectionText: '',
  homepageFundingSectionText: '',
  homepageAdditionalSectionName: '',
  homepageAdditionalSectionText: '',
};

const propertiesContext = createContext<PropertiesContextProps>(emptyState);

function usePropertiesContext() {
  return useContext(propertiesContext);
}

export { usePropertiesContext, propertiesContext };
