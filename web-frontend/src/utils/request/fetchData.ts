import axios from 'axios';
import SearchParams from '../../types/SearchParams';

async function fetchData(url: string, searchParams?: SearchParams) {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.keys(searchParams).forEach((key) => {
      // Append each value as a separate param so commas in values
      // (e.g. multi-species taxonomy filter) are not treated as delimiters
      searchParams[key].forEach((val) => params.append(key, val));
    });
  }

  const resp = await axios.get(url, { params });
  if (resp.status === 200) {
    return await resp.data;
  }

  return undefined;
}

export default fetchData;
