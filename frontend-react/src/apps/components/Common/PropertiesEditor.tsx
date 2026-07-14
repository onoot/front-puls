import { PropertyField } from '../../types';

interface Props {
  value: PropertyField[];
  onChange: (fields: PropertyField[]) => void;
}

export function PropertiesEditor({ value, onChange }: Props) {
  const addRow = () => {
    onChange([...value, { label: '' }]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, val: string) => {
    const next = [...value];
    next[index] = { label: val };
    onChange(next);
  };

  return (
    <div className="properties-editor">
      <label style={{ marginBottom: 8, display: 'block' }}>
        Характеристики (свойства)
      </label>
      <table className="properties-table">
        <thead>
          <tr>
            <th>Название</th>
            <th style={{ width: 50 }}></th>
          </tr>
        </thead>
        <tbody>
          {value.map((f, i) => (
            <tr key={i}>
              <td>
                <input
                  value={f.label}
                  onChange={e => updateLabel(i, e.target.value)}
                  placeholder="Цвет"
                />
              </td>
              <td>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeRow(i)}>
                  <i className="fa-regular fa-xmark" />
                </button>
              </td>
            </tr>
          ))}
          {value.length === 0 && (
            <tr><td colSpan={2} style={{ textAlign: 'center', color: '#999', padding: 12 }}>Нет характеристик</td></tr>
          )}
        </tbody>
      </table>
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow} style={{ marginTop: 8 }}>
        <i className="fa-regular fa-plus" /> Добавить свойство
      </button>
    </div>
  );
}
