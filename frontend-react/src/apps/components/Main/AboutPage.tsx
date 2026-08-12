import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { companyHttp } from '../../http/company';
import { lettersHttp } from '../../http/letters';
import { Letter } from '../../types';
import { Preloader } from '../Common/Preloader';
import { ProgressiveImage } from '../Common/ProgressiveImage';

export function AboutPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [company, setCompany] = useState<Record<string, string>>({});
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      pagesHttp.getPage('about').then(r => setContent(r.data)),
      companyHttp.getInfo().then(r => setCompany(r.data)),
      lettersHttp.getPublic().then(r => setLetters(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden space" id="about-page">
      {loading && <div className="section-loading"><Preloader /></div>}
      {!loading && <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-6 mb-40">
            <div className="img-box2">
              {company.logo && (
                <div className="img1"><ProgressiveImage src={`/uploads/${company.logo}`} alt="О компании" /></div>
              )}
            </div>
          </div>
          <div className="col-xl-6">
            <div className="about-card">
              <div className="title-area mb-30">
                <span className="sub-title">О компании</span>
                <h2 className="sec-title">{content.companyCaption || 'О компании'}</h2>
              </div>
              <p className="about-card_text">
                {content.companyDescription?.split('\n').map((p, i) => <span key={i}>{p}<br /></span>)}
              </p>
            </div>
          </div>
        </div>

        {content.leftBlockCaption && (
          <div className="row mt-n2 space-top">
            <div className="col-xl-6 mb-40">
              <h3 style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>{content.leftBlockCaption}</h3>
              <div className="checklist">
                <ul>
                  {content.leftBlockDescription?.split('\n').map((item, i) => (
                      <li key={i}><i className="fa-regular fa-badge-check" /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-xl-6">
              {content.rightBlockCaption && (
                <h3 style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>{content.rightBlockCaption}</h3>
              )}
              {content.rightBlockDescription && (
                <div className="checklist">
                  <ul>
                    {content.rightBlockDescription.split('\n').map((item, i) => (
                    <li key={i}><i className="fa-regular fa-badge-check" /> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {letters.length > 0 && (
          <div className="space-top">
            <div className="title-area text-center">
              <span className="sub-title">Благодарности</span>
              <h2 className="sec-title">Благодарственные письма</h2>
            </div>
            <div className="row gy-40 justify-content-center">
              {letters.map(letter => (
                <div key={letter.id} className="col-lg-3 col-md-4 col-sm-6 text-center">
                  {letter.photo && <ProgressiveImage src={`/uploads/${letter.photo}`} alt={letter.name} style={{ maxHeight: 150 }} loading="lazy" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
