import { useState, useEffect, useRef } from 'react';
import { catalogHttp } from '../../http/catalog';

const PER_PAGE = 30;

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export function ImagePickerField({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setShowGallery(false);
    setImages([]);
    setPage(0);
    setError('');
  }, [open]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await catalogHttp.listUploadedPhotos();
      setImages(res.data.files || []);
    } catch {}
    setLoading(false);
  };

  const handleOpenGallery = () => {
    setShowGallery(true);
    setPage(0);
    if (images.length === 0) loadImages();
  };

  const totalPages = Math.ceil(images.length / PER_PAGE);
  const pageItems = images.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await catalogHttp.uploadPhoto(file);
      onChange(result.data.filename);
      setOpen(false);
      fileRef.current!.value = '';
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
    }
    setUploading(false);
  };

  return (
    <div className="image-picker-field">
      {label && <div className="image-picker-label">{label}</div>}
      <div className="image-picker-preview">
        {value ? (
          <div className="image-picker-thumb-wrap">
            <img src={`/uploads/${value}`} alt="" className="image-picker-thumb" />
          </div>
        ) : (
          <div className="image-picker-placeholder">Нет фото</div>
        )}
        <div className="image-picker-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            {value ? 'Изменить' : 'Выбрать'}
          </button>
          {value && (
            <button type="button" className="btn btn-sm btn-remove-photo" onClick={() => onChange('')}>
              Удалить
            </button>
          )}
        </div>
      </div>

      {open && <div className="modal-overlay" onClick={() => setOpen(false)} />}
      {open && (
        <div className="modal-content image-picker-modal">
          <div className="modal-header">
            <h3>{value ? 'Изменить изображение' : 'Выбрать изображение'}</h3>
            <button className="modal-close" onClick={() => setOpen(false)}>&times;</button>
          </div>

          <div className="modal-body">
            <div className="picker-preview-area">
              {value ? (
                <img key={value} src={`/uploads/${value}`} alt="" className="picker-preview-img" />
              ) : (
                <div className="picker-preview-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>Изображение не выбрано</span>
                </div>
              )}
            </div>

            <div className="picker-actions-row">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
              <button type="button" className="picker-btn picker-btn-upload" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploading ? 'Загрузка...' : 'Загрузить с устройства'}
              </button>
              <button type="button" className={`picker-btn picker-btn-gallery${showGallery ? ' active' : ''}`} onClick={handleOpenGallery}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Выбрать из загруженных
              </button>
            </div>

            {error && <div className="picker-error">{error}</div>}

            {showGallery && (
              <div className="picker-gallery">
                <div className="picker-gallery-header">Ранее загруженные изображения</div>

                {loading ? (
                  <div className="picker-loader"><div className="picker-spinner" /><span>Загрузка...</span></div>
                ) : images.length > 0 ? (
                  <>
                    <div className="picker-gallery-grid">
                      {pageItems.map(src => (
                        <div
                          key={src}
                          className={`picker-gallery-item${value === src ? ' selected' : ''}`}
                          onClick={() => { onChange(src); setOpen(false); }}
                        >
                          <img src={`/uploads/${src}`} alt="" loading="lazy" />
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="picker-pagination">
                        <button
                          type="button"
                          className="picker-page-btn"
                          disabled={page === 0}
                          onClick={() => setPage(p => p - 1)}
                        >&laquo; Назад</button>
                        <span className="picker-page-info">{page + 1} / {totalPages}</span>
                        <button
                          type="button"
                          className="picker-page-btn"
                          disabled={page >= totalPages - 1}
                          onClick={() => setPage(p => p + 1)}
                        >Вперёд &raquo;</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="picker-gallery-empty">Нет загруженных изображений</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
