interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Paginator({ page, totalPages, onPageChange }: PaginatorProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="paginator">
      <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Назад</button>
      {start > 1 && <><button className="btn btn-sm btn-outline-secondary" onClick={() => onPageChange(1)}>1</button><span className="paginator-dots">...</span></>}
      {pages.map(p => (
        <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {end < totalPages && <><span className="paginator-dots">...</span><button className="btn btn-sm btn-outline-secondary" onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Вперед</button>
    </div>
  );
}
