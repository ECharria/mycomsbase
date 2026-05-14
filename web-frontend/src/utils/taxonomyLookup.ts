import taxonomyInfo from '../assets/taxonomy_info.json';

type TaxonomyRow = {
  species: string;
  taxid: string;
  genus: string;
  family: string;
  order: string;
  class: string;
  phylum: string;
};

const _rows = taxonomyInfo as TaxonomyRow[];

const _map: Record<string, TaxonomyRow> = {};
for (const row of _rows) {
  _map[row.species.toLowerCase()] = row;
}

export function getLineage(speciesName: string): string[] {
  const row = _map[speciesName.toLowerCase()];
  if (!row) return [];
  return [row.genus, row.family, row.order, row.class, row.phylum].filter(Boolean);
}

export function getTaxid(speciesName: string): string {
  return _map[speciesName.toLowerCase()]?.taxid ?? '';
}
