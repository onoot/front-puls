import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyHttp } from '../../http/company';
import { ProgressiveImage } from './ProgressiveImage';

export function Footer() {
  const [company, setCompany] = useState<Record<string, string>>({});

  useEffect(() => {
    companyHttp.getInfo().then(r => setCompany(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="footer-custom">
      <div className="footer-main">
        <div className="container">
          <div className="row gy-40">
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                {company.logo ? (
                  <Link to="/" className="footer-logo">
                    <ProgressiveImage src={`/uploads/${company.logo}`} alt="Пульсар" loading="lazy" sizes="200px" />
                  </Link>
                ) : (
                  <Link to="/" className="footer-logo-text">Пульсар</Link>
                )}
                {company.about && (
                  <p className="footer-desc">{company.about.length > 150 ? company.about.substring(0, 150) + '...' : company.about}</p>
                )}
                {!company.about && (
                  <p className="footer-desc">Оптовые поставки сантехнического и отопительного оборудования для застройщиков и строителей.</p>
                )}
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h4 className="footer-title">Навигация</h4>
              <ul className="footer-links">
                <li><Link to="/">Главная</Link></li>
                <li><Link to="/catalog">Каталог</Link></li>
                <li><Link to="/about">О компании</Link></li>
                <li><Link to="/projects">Наши проекты</Link></li>
                <li><Link to="/delivery">Доставка и оплата</Link></li>
                <li><Link to="/contact">Контакты</Link></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h4 className="footer-title">Контакты</h4>
              <ul className="footer-contacts">
                {company.phone && (
                  <li>
                    <i className="fa-regular fa-phone" />
                    <a href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>
                  </li>
                )}
                {company.email && (
                  <li>
                    <i className="fa-regular fa-envelope" />
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </li>
                )}
                {company.address && (
                  <li>
                    <i className="fa-regular fa-location-dot" />
                    <span>{company.address}</span>
                  </li>
                )}
                {company.schedule && (
                  <li>
                    <i className="fa-regular fa-clock" />
                    <span>{company.schedule}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h4 className="footer-title">О компании</h4>
              <div className="footer-about-block">
                {company.name && <p className="footer-company-name">{company.name}</p>}
                <p className="footer-about-text">
                  Мы — надёжный поставщик сантехнического, отопительного и водопроводного оборудования ведущих российских и зарубежных производителей.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center justify-content-between gy-2">
            <div className="col-auto">
              <p className="footer-copyright">&copy; {new Date().getFullYear()} {company.name || 'Пульсар'}. Все права защищены.</p>
            </div>
            <div className="col-auto">
              <p className="footer-credit">Сантехника и отопление оптом</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
