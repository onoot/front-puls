import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogHttp } from '../../http/catalog';
import { ImagePickerField } from '../Common/ImagePickerField';
import { PropertyField } from '../../types';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ sku: '', name: '', description: '', photo: '', categoryId: '', sort: 0, visible: true });
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryPropsFields, setCategoryPropsFields] = useState<PropertyField[]>([]);
  const [excludedKeys, setExcludedKeys] = useState<string[]>([]);
  const [inheritedValues, setInheritedValues] = useState<Record<string, string>>({});
  const [uniqueProps, setUniqueProps] = useState<PropertyField[]>([]);
  const [uniqueValues, setUniqueValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    catalogHttp.listCategories().then(r => setCategories(r.data.items || r.data));
    if (id) {
      setLoading(true);
      catalogHttp.getProduct(Number(id)).then(r => {
        const p = r.data;
        setForm({
          sku: p.sku, name: p.name || '', description: p.description || '', photo: p.photo || '',
          categoryId: (p as any).category_id?.toString() || '', sort: p.sort, visible: p.visible,
        });
        const prodProps: Record<string, string> = p.properties || {};
        if ((p as any).excludedProperties) setExcludedKeys((p as any).excludedProperties);

        if (p.categoryProperties && Array.isArray(p.categoryProperties) && p.categoryProperties.length > 0) {
          const catFields: PropertyField[] = p.categoryProperties;
          setCategoryPropsFields(catFields);
          const inherited: Record<string, string> = {};
          for (const f of catFields) {
            if (prodProps[f.label] !== undefined) inherited[f.label] = prodProps[f.label];
          }
          setInheritedValues(inherited);
          const catLabels = new Set(catFields.map(f => f.label));
          const uniqFields: PropertyField[] = [];
          const uniqVals: Record<string, string> = {};
          for (const [k, v] of Object.entries(prodProps)) {
            if (!catLabels.has(k)) { uniqFields.push({ label: k }); uniqVals[k] = v; }
          }
          setUniqueProps(uniqFields);
          setUniqueValues(uniqVals);
        } else {
          const uniqFields: PropertyField[] = [];
          const uniqVals: Record<string, string> = {};
          for (const [k, v] of Object.entries(prodProps)) {
            uniqFields.push({ label: k });
            uniqVals[k] = v;
          }
          setUniqueProps(uniqFields);
          setUniqueValues(uniqVals);
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const loadCategoryProps = useCallback(async (catId: number) => {
    try {
      const tree = await catalogHttp.getCategoryTree();
      const findCat = (cats: any[]): any => {
        for (const c of cats) {
          if (c.id === catId) return c;
          if (c.children) { const f = findCat(c.children); if (f) return f; }
        }
        return null;
      };
      const cat = findCat(tree.data);
      if (cat?.properties && Array.isArray(cat.properties) && cat.properties.length > 0) {
        setCategoryPropsFields(cat.properties);
        setExcludedKeys([]);
        setInheritedValues({});
      } else {
        setCategoryPropsFields([]);
        setExcludedKeys([]);
        setInheritedValues({});
      }
    } catch {
      setCategoryPropsFields([]);
      setExcludedKeys([]);
      setInheritedValues({});
    }
  }, []);

  useEffect(() => {
    if (form.categoryId) loadCategoryProps(Number(form.categoryId));
  }, [form.categoryId, loadCategoryProps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allProps: Record<string, string> = { ...inheritedValues, ...uniqueValues };
    for (const k of Object.keys(allProps)) {
      if (allProps[k] === '') delete allProps[k];
    }
    const data: any = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      properties: Object.keys(allProps).length > 0 ? allProps : null,
      excludedProperties: excludedKeys.length > 0 ? excludedKeys : null,
    };
    if (isEdit) {
      await catalogHttp.saveProduct({ id: Number(id), ...data });
    } else {
      await catalogHttp.createProduct(data);
    }
    navigate('/dashboard/products');
  };

  const toggleExclude = (label: string) => {
    setExcludedKeys(prev => prev.includes(label) ? prev.filter(k => k !== label) : [...prev, label]);
  };

  const setInheritedValue = (label: string, val: string) => {
    setInheritedValues(prev => ({ ...prev, [label]: val }));
  };

  const addUniqueProp = () => {
    setUniqueProps(prev => [...prev, { label: '' }]);
  };

  const removeUniqueProp = (index: number) => {
    const removed = uniqueProps[index];
    setUniqueProps(prev => prev.filter((_, i) => i !== index));
    if (removed?.label) {
      setUniqueValues(prev => { const n = { ...prev }; delete n[removed.label]; return n; });
    }
  };

  const updateUniqueLabel = (index: number, newLabel: string) => {
    const old = uniqueProps[index];
    setUniqueProps(prev => {
      const next = [...prev];
      next[index] = { label: newLabel };
      return next;
    });
    if (old.label && old.label !== newLabel) {
      setUniqueValues(prev => {
        const n = { ...prev };
        const val = n[old.label];
        delete n[old.label];
        if (newLabel && val) n[newLabel] = val;
        return n;
      });
    }
  };

  const setUniqueValue = (label: string, val: string) => {
    setUniqueValues(prev => ({ ...prev, [label]: val }));
  };

  return (
    <div>
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/products')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название товара <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Например: Компрессор ПКС 200" /></label>
        <label>Артикул <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} required /></label>
        <label>Описание <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} /></label>
        <ImagePickerField label="Фото" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        <label>
          Категория
          <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
            <option value="">— Без категории —</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>Сортировка <input type="number" value={form.sort} onChange={e => setForm(p => ({ ...p, sort: Number(e.target.value) }))} /></label>
        <label>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
          Видимый
        </label>

        {loading && <p style={{ color: '#888', fontSize: 14 }}>Загрузка характеристик...</p>}

        {!loading && categoryPropsFields.length > 0 && (
          <div className="properties-editor">
            <label style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>
              Наследуемые характеристики из категории
            </label>
            <p style={{ fontSize: 12, color: '#999', marginTop: 0, marginBottom: 12 }}>
              Снимите галочку чтобы исключить характеристику из товара. Заполните значение или оставьте пустым.
            </p>
            <table className="properties-table">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>✓</th>
                  <th>Свойство</th>
                  <th>Значение</th>
                </tr>
              </thead>
              <tbody>
                {categoryPropsFields.map(f => {
                  const excluded = excludedKeys.includes(f.label);
                  return (
                    <tr key={f.label} className={excluded ? 'prop-row-disabled' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!excluded}
                          onChange={() => toggleExclude(f.label)}
                        />
                      </td>
                      <td><span style={{ fontWeight: 600 }}>{f.label}</span></td>
                      <td>
                        <input
                          value={inheritedValues[f.label] || ''}
                          onChange={e => setInheritedValue(f.label, e.target.value)}
                          placeholder={f.label}
                          disabled={excluded}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && categoryPropsFields.length === 0 && form.categoryId && (
          <div className="properties-editor" style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, color: '#999', fontSize: 13 }}>
            <i className="fa-regular fa-circle-info" style={{ marginRight: 6 }} />
            У этой категории нет характеристик. Добавьте их в настройках категории или используйте уникальные характеристики ниже.
          </div>
        )}

        <div className="properties-editor" style={{ marginTop: 24 }}>
          <label style={{ marginBottom: 8, display: 'block', fontWeight: 600 }}>
            Уникальные характеристики товара
            <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>собственные свойства, не из категории</span>
          </label>
          <table className="properties-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Значение</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {uniqueProps.map((f, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={f.label}
                      onChange={e => updateUniqueLabel(i, e.target.value)}
                      placeholder="Цвет"
                    />
                  </td>
                  <td>
                    <input
                      value={uniqueValues[f.label] || ''}
                      onChange={e => setUniqueValue(f.label, e.target.value)}
                      placeholder="Красный"
                      disabled={!f.label}
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeUniqueProp(i)}>
                      <i className="fa-regular fa-xmark" />
                    </button>
                  </td>
                </tr>
              ))}
              {uniqueProps.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: 12 }}>Нет уникальных характеристик</td></tr>
              )}
            </tbody>
          </table>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addUniqueProp} style={{ marginTop: 8 }}>
            <i className="fa-regular fa-plus" /> Добавить уникальное свойство
          </button>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>Сохранить</button>
      </form>
    </div>
  );
}
