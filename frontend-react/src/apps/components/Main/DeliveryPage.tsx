import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { Preloader } from '../Common/Preloader';

export function DeliveryPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagesHttp.getPage('delivery').then(r => setContent(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden space" id="delivery-page">
      {loading && <div className="section-loading"><Preloader /></div>}
      {!loading && <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="page-content">
              {content.deliveryDescription?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {content.methodsCaption && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>{content.methodsCaption}</h2>
                <div className="checklist">
                  <ul>
                    {content.methods?.split('\n').map((item, i) => <li key={i}><i className="fa-regular fa-check" /> {item}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {content.leftBlockText && (
              <div style={{ marginTop: 40 }}>
                {content.leftBlockCaption && (
                  <h2 style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>{content.leftBlockCaption}</h2>
                )}
                <div className="checklist">
                  <ul>
                    {content.leftBlockText?.split('\n').map((item, i) => <li key={i}><i className="fa-regular fa-check" /> {item}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="col-lg-4">
            <div className="sidebar-area">
              {content.caption && (
                <div className="widget">
                  <h3 className="widget_title">{content.caption || 'Доставка и оплата'}</h3>
                  <ul className="catalog-menu">
                    {content.methodsCaption && <li><a href="#methods"><i className="fa-regular fa-angle-right" /> {content.methodsCaption}</a></li>}
                    {content.leftBlockCaption && <li><a href="#payment"><i className="fa-regular fa-angle-right" /> {content.leftBlockCaption}</a></li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
