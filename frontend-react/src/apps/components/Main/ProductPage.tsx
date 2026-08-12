import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product, PropertyField } from '../../types';
import { catalogHttp } from '../../http/catalog';
import { Breadcrumb } from '../Common/Breadcrumb';
import { Preloader } from '../Common/Preloader';
import { ProgressiveImage } from '../Common/ProgressiveImage';

type TabId = 'description' | 'specs';

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryProps, setCategoryProps] = useState<PropertyField[]>([]);
  const [productProps, setProductProps] = useState<Record<string, string>>({});
  const [excludedProps, setExcludedProps] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('description');

  useEffect(() => {
    if (id) {
      catalogHttp.getProduct(Number(id)).then(r => {
        const p = r.data;
        setProduct(p);
        if ((p as any).categoryProperties) setCategoryProps((p as any).categoryProperties);
        if (p.properties) setProductProps(p.properties);
        if ((p as any).excludedProperties) setExcludedProps((p as any).excludedProperties);
        const first = p.photos && p.photos.length > 0 ? p.photos[0].name : p.categoryPhoto || null;
        setActivePhoto(first);
      });
    }
  }, [id]);

  useEffect(() => {
    if (product) document.title = `${product.displayName || product.sku} | Пульсар`;
  }, [product]);

  if (!product) return <div className="space"><div className="container"><div className="section-loading"><Preloader /></div></div></div>;

  const allPhotos = product.photos && product.photos.length > 0
    ? product.photos.map(ph => ph.name)
    : product.categoryPhoto ? [product.categoryPhoto] : [];

  const inheritedProps = categoryProps.filter(f => !excludedProps.includes(f.label));
  const uniqueProps = Object.entries(productProps).filter(([k]) => !categoryProps.some(f => f.label === k));
  const allVisibleProps = [
    ...inheritedProps.filter(f => f.label in productProps).map(f => ({ label: f.label, value: productProps[f.label] })),
    ...uniqueProps.map(([k, v]) => ({ label: k, value: v })),
  ];

  return (
    <>
      <Breadcrumb
        title={product.displayName || product.sku}
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: product.displayName || product.sku },
        ]}
      />

      <section className="space">
        <div className="container">
          <div className="product-card">
            <div className="product-card-gallery">
              <div className="product-card-main-img">
                {activePhoto ? (
                  <ProgressiveImage src={`/uploads/${activePhoto}`} alt={product.displayName || product.sku} loading="eager" sizes="640px" />
                ) : (
                  <div className="product-card-no-img">
                    <i className="fa-regular fa-image" />
                    <span>Нет фото</span>
                  </div>
                )}
              </div>
              {allPhotos.length > 1 && (
                <div className="product-card-thumbs">
                  {allPhotos.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`product-card-thumb ${activePhoto === name ? 'active' : ''}`}
                      onClick={() => setActivePhoto(name)}
                    >
                      <ProgressiveImage src={`/uploads/${name}`} alt="" sizes="96px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-card-info">
              <div className="product-card-header">
                <span className="product-card-category">{product.categoryName || 'Прочее'}</span>
                <h1 className="product-card-title">{product.displayName || product.sku}</h1>
                <p className="product-card-sku">Артикул: {product.sku}</p>
              </div>

              <div className="product-tabs">
                <div className="product-tabs-nav">
                  <button
                    type="button"
                    className={`product-tabs-btn${activeTab === 'description' ? ' active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    <i className="fa-solid fa-align-left" /> Описание
                  </button>
                  <button
                    type="button"
                    className={`product-tabs-btn${activeTab === 'specs' ? ' active' : ''}`}
                    onClick={() => setActiveTab('specs')}
                  >
                    <i className="fa-solid fa-list" /> Характеристики
                  </button>
                </div>
                <div className="product-tabs-content">
                  {activeTab === 'description' && (
                    <div className="product-tab-desc">
                      {product.description && product.description.trim().length > 0 ? (
                        <p>{product.description}</p>
                      ) : (
                        <p style={{ color: '#999' }}>Описание не указано</p>
                      )}
                    </div>
                  )}
                  {activeTab === 'specs' && (
                    <div className="product-tab-specs">
                      {allVisibleProps.length > 0 ? (
                        <table className="specs-table-v2">
                          <tbody>
                            {allVisibleProps.map((f, i) => (
                              <tr key={i}>
                                <td className="specs-label">{f.label}</td>
                                <td className="specs-value">{f.value || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: '#999' }}>Характеристики не указаны</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {product.documents && product.documents.length > 0 && (
                <div className="product-card-docs">
                  <h3 className="product-card-section-title">
                    <i className="fa-solid fa-file-lines" /> Документы
                  </h3>
                  <ul>
                    {product.documents.map(doc => (
                      <li key={doc.id}>
                        <a href={`/uploads/${doc.filename}`} download>
                          <i className="fa-regular fa-file" />
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
