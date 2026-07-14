import { useState, useEffect } from 'react';
import { companyHttp } from '../../http/company';
import { Preloader } from '../Common/Preloader';

export function ContactPage() {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    companyHttp.getInfo().then(r => setInfo(r.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/feedback/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: '', phone: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 5000);
      }
    } catch {
      alert('Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="contact-page">
      {loading && <div className="section-loading"><Preloader /></div>}

      {!loading && (
        <>
          {/* ── Info Cards ── */}
          <section className="contact-info-strip">
            <div className="container">
              <div className="contact-info-grid">
                {[
                  { icon: 'fa-solid fa-phone', label: 'Телефон', value: info.phone, href: info.phone ? `tel:${info.phone.replace(/[^+\d]/g, '')}` : undefined },
                  { icon: 'fa-solid fa-envelope', label: 'Email', value: info.email, href: info.email ? `mailto:${info.email}` : undefined },
                  { icon: 'fa-solid fa-location-dot', label: 'Адрес', value: info.address },
                  { icon: 'fa-solid fa-clock', label: 'Режим работы', value: info.schedule },
                ].map((item, i) => (
                  <div key={i} className="contact-info-card">
                    <div className="contact-info-card_icon">
                      <i className={item.icon} />
                    </div>
                    <div className="contact-info-card_body">
                      <span className="contact-info-card_label">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="contact-info-card_value">{item.value || '—'}</a>
                      ) : (
                        <span className="contact-info-card_value">{item.value || '—'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Form + Map ── */}
          <section className="contact-main">
            <div className="container">
              <div className="contact-main-grid">

                {/* Left — Form */}
                <div className="contact-form-card">
                  <div className="contact-form-header">
                    <h2 className="contact-form-title">Напишите нам</h2>
                    <p className="contact-form-subtitle">Мы ответим в ближайшее время</p>
                  </div>

                  {sent ? (
                    <div className="contact-form-success">
                      <div className="contact-form-success_icon">
                        <i className="fa-solid fa-check" />
                      </div>
                      <h3>Сообщение отправлено!</h3>
                      <p>Мы свяжемся с вами в ближайшее время.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="contact-form-v2">
                      <div className="contact-form-row">
                        <div className="contact-form-group">
                          <label className="contact-form-label" htmlFor="cf-name">
                            Ваше имя <span className="required">*</span>
                          </label>
                          <input
                            id="cf-name"
                            type="text"
                            className="contact-form-input"
                            value={form.name}
                            onChange={handleChange('name')}
                            placeholder="Иван Иванов"
                            required
                          />
                        </div>
                        <div className="contact-form-group">
                          <label className="contact-form-label" htmlFor="cf-phone">
                            Телефон <span className="required">*</span>
                          </label>
                          <input
                            id="cf-phone"
                            type="tel"
                            className="contact-form-input"
                            value={form.phone}
                            onChange={handleChange('phone')}
                            placeholder="+7 (___) ___-__-__"
                            required
                          />
                        </div>
                      </div>

                      <div className="contact-form-row">
                        <div className="contact-form-group">
                          <label className="contact-form-label" htmlFor="cf-email">Email</label>
                          <input
                            id="cf-email"
                            type="email"
                            className="contact-form-input"
                            value={form.email}
                            onChange={handleChange('email')}
                            placeholder="example@company.ru"
                          />
                        </div>
                        <div className="contact-form-group">
                          <label className="contact-form-label" htmlFor="cf-subject">Тема</label>
                          <input
                            id="cf-subject"
                            type="text"
                            className="contact-form-input"
                            value={form.subject}
                            onChange={handleChange('subject')}
                            placeholder="Тема обращения"
                          />
                        </div>
                      </div>

                      <div className="contact-form-group">
                        <label className="contact-form-label" htmlFor="cf-message">
                          Сообщение <span className="required">*</span>
                        </label>
                        <textarea
                          id="cf-message"
                          className="contact-form-input contact-form-textarea"
                          value={form.message}
                          onChange={handleChange('message')}
                          placeholder="Опишите ваш вопрос или задачу..."
                          rows={5}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="contact-form-submit"
                        disabled={sending}
                      >
                        {sending ? (
                          <><i className="fa-solid fa-spinner fa-spin" /> Отправка...</>
                        ) : (
                          <><i className="fa-solid fa-paper-plane" /> Отправить сообщение</>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Right — Map + Address */}
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
        </>
      )}
    </div>
  );
}
