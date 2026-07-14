import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyHttp } from '../../http/company';

interface BreadcrumbProps {
  title: string;
  items: { label: string; href?: string }[];
  bgImage?: string | null;
}

export function Breadcrumb({ title, items, bgImage }: BreadcrumbProps) {
  const [bg, setBg] = useState('');

  useEffect(() => {
    if (!bgImage) {
      companyHttp.getInfo().then(r => {
        if (r.data.headerPhoto) setBg(r.data.headerPhoto);
      });
    }
  }, [bgImage]);

  const backgroundImage = bgImage || bg ? `url(/uploads/${bgImage || bg})` : undefined;

  return (
    <div className="breadcumb-wrapper" style={backgroundImage ? { backgroundImage } : undefined}>
      <div className="container">
        <div className="breadcumb-content">
          <h1 className="breadcumb-title">{title}</h1>
          <ul className="breadcumb-menu">
            {items.map((item, i) => (
              <li key={i}>
                {i > 0 && <i className="fa-regular fa-chevron-right" />}
                {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
