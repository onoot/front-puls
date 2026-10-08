import { useState, useEffect } from 'react';
import { companyHttp } from '../../http/company';
import { Preloader } from '../Common/Preloader';

export function ContactPage() {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyHttp.getInfo().then(r => setInfo(r.data)).finally(() => setLoading(false));
  }, []);

  const contacts = [
    { icon: 'fa-solid fa-phone', label: 'Телефон', value: info.phone, href: info.phone ? `tel:${info.phone.replace(/[^+\d]/g, '')}` : undefined },
    { icon: 'fa-solid fa-envelope', label: 'Email', value: info.email, href: info.email ? `mailto:${info.email}` : undefined },
    { icon: 'fa-solid fa-location-dot', label: 'Адрес', value: info.address },
    { icon: 'fa-solid fa-clock', label: 'Режим работы', value: info.schedule },
  ].filter(item => item.value);

  return (
    <div id="contact-page">
      {loading && <div className="section-loading"><Preloader /></div>}

      {!loading && (
        <section className="contact-main">
          <div className="container">
            <div className="contact-main-grid">

              {/* Left — contact details, no personal-data form */}
              <div className="contact-info-column">
                <div className="contact-form-header">
                  <h2 className="contact-form-title">Контакты</h2>
                  <p className="contact-form-subtitle">
                    Мы не собираем персональные данные — свяжитесь удобным способом
                  </p>
                </div>

                <div className="contact-info-column_list">
                  {contacts.map(item => (
                    <div key={item.label} className="contact-info-card">
                      <div className="contact-info-card_icon">
                        <i className={item.icon} />
                      </div>
                      <div className="contact-info-card_body">
                        <span className="contact-info-card_label">{item.label}</span>
                        {item.href ? (
                          <a href={item.href} className="contact-info-card_value">{item.value}</a>
                        ) : (
                          <span className="contact-info-card_value">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Map */}
              <div className="contact-map-side">
                {info.map ? (
                  <div className="contact-map-wrap" dangerouslySetInnerHTML={{ __html: info.map }} />
                ) : (
                  <div className="contact-map-placeholder">
                    <i className="fa-solid fa-map-location-dot" />
                    <span>Карта</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
}