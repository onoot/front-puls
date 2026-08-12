import { useMemo, useState, JSX } from 'react';
import { Product } from '../../types';

export type SelectedFilters = Record<string, string[]>;

interface FacetValue {
  value: string;
  count: number;
}

interface Facet {
  key: string;
  values: FacetValue[];
}

export function parseProductProps(p: Product): Record<string, string> {
  const raw = (p as any).properties;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

export function matchesFilters(p: Product, selected: SelectedFilters): boolean {
  const props = parseProductProps(p);
  for (const [key, values] of Object.entries(selected)) {
    if (values.length === 0) continue;
    if (!values.includes(props[key] ?? '')) return false;
  }
  return true;
}

function buildFacets(products: Product[]): Facet[] {
  const map = new Map<string, Map<string, number>>();
  for (const p of products) {
    const props = parseProductProps(p);
    for (const [key, rawValue] of Object.entries(props)) {
      const k = String(key ?? '').trim();
      const value = String(rawValue ?? '').trim();
      if (!k || !value) continue;
      if (!map.has(k)) map.set(k, new Map());
      const valMap = map.get(k)!;
      valMap.set(value, (valMap.get(value) ?? 0) + 1);
    }
  }
  const facets: Facet[] = [];
  for (const [key, valMap] of map) {
    if (valMap.size < 2) continue;
    facets.push({
      key,
      values: [...valMap.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'ru')),
    });
  }
  return facets.sort((a, b) => a.key.localeCompare(b.key, 'ru'));
}

interface CatalogFiltersProps {
  products: Product[];
  selected: SelectedFilters;
  onFilterChange: (selected: SelectedFilters) => void;
}

export function CatalogFilters({ products, selected, onFilterChange }: CatalogFiltersProps) {
  const facets = useMemo(() => buildFacets(products), [products]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (facets.length === 0) return null;

  const toggleValue = (key: string, value: string) => {
    const current = selected[key] ?? [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...selected, [key]: next });
  };

  const toggleGroup = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(selected).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="widget widget_catalog_filters">
      <div className="widget_filters_header">
        <h3 className="widget_title">Фильтры</h3>
        {activeCount > 0 && (
          <button type="button" className="catalog-filters-clear" onClick={() => onFilterChange({})}>
            Сбросить
          </button>
        )}
      </div>
      <div className="catalog-filters">
        {facets.map(facet => {
          const isCollapsed = collapsed[facet.key];
          const groupSelected = selected[facet.key] ?? [];
          return (
            <div key={facet.key} className="catalog-filter-group">
              <button type="button" className="catalog-filter-group-title" onClick={() => toggleGroup(facet.key)}>
                <span>{facet.key}</span>
                <i className={`fa-regular ${isCollapsed ? 'fa-angle-down' : 'fa-angle-up'}`} />
              </button>
              <div className={`catalog-filter-group-body ${isCollapsed ? 'collapsed' : ''}`}>
                {facet.values.map(v => (
                  <label key={v.value} className="catalog-filter-option">
                    <input
                      type="checkbox"
                      checked={groupSelected.includes(v.value)}
                      onChange={() => toggleValue(facet.key, v.value)}
                    />
                    <span className="catalog-filter-option-check" />
                    <span className="catalog-filter-option-name">{v.value}</span>
                    <span className="catalog-filter-option-count">{v.count}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
