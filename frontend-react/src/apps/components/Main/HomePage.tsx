import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Slide, Statistic, Brand, Letter, Project } from '../../types';
import { sliderHttp } from '../../http/slider';
import { companyHttp } from '../../http/company';
import { brandsHttp } from '../../http/brands';
import { lettersHttp } from '../../http/letters';
import { projectsHttp } from '../../http/projects';
import { pagesHttp } from '../../http/pages';
import { Preloader } from '../Common/Preloader';

export function HomePage() {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [stats, setStats] = useState<Statistic[] | null>(null);
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [letters, setLetters] = useState<Letter[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [company, setCompany] = useState<Record<string, string>>({});
  const [aboutContent, setAboutContent] = useState<Record<string, string>>({});

  useEffect(() => {
    sliderHttp.getPublic().then(r => setSlides(r.data)).catch(() => setSlides([]));
    companyHttp.getStatistics().then(r => setStats(r.data)).catch(() => setStats([]));
    companyHttp.getInfo().then(r => setCompany(r.data)).catch(() => {});
    brandsHttp.getPublic().then(r => setBrands(r.data)).catch(() => setBrands([]));
    lettersHttp.getPublic().then(r => setLetters(r.data)).catch(() => setLetters([]));
    projectsHttp.getPublic().then(r => setProjects(r.data)).catch(() => setProjects([]));
    pagesHttp.getPage('about').then(r => setAboutContent(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {slides === null && <Preloader fullPage />}
      {slides && slides.length > 0 && (
        <section className="hero-section">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={slides.length > 1}
            className="hero-swiper"
          >
            {slides.map(slide => (
              <SwiperSlide key={slide.id}>
                <div className="hero-slide">
                  {slide.photo ? (
                    <img className="hero-slide-img" src={`/uploads/${slide.photo}`} alt={slide.name} />
                  ) : (
                    <div className="hero-slide-img hero-slide-img--fallback" />
                  )}
                  <div className="hero-slide-overlay" />
                  <div className="hero-slide-content container">
                    {slide.name && <h1 className="hero-slide-title">{slide.name}</h1>}
                    {slide.description && <p className="hero-slide-desc">{slide.description}</p>}
                    {slide.link && (
                      <Link to={slide.link} className="hero-slide-btn">
                        Подробнее <i className="fa-regular fa-arrow-right" />
                      </Link>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {stats === null && <div className="section-loading"><Preloader /></div>}
      {stats && stats.length > 0 && (
        <section className="space bg-smoke">
          <div className="container">
            <div className="row gy-30">
              {stats.map(stat => (
                <div key={stat.id} className="col-xl-3 col-md-6 text-center">
                  <h3 style={{ fontSize: 42, fontWeight: 700, color: 'var(--theme-color)' }}>{stat.value}</h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-color)', margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden space" id="home-about">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-6 mb-40">
              <div className="img-box2">
                {company.logo ? (
                  <div className="img1"><img src={`/uploads/${company.logo}`} alt="О компании" /></div>
                ) : (
                  <div className="block-skeleton" style={{ width: '100%', height: 300 }} />
                )}
              </div>
            </div>
            <div className="col-xl-6">
              <div className="about-card">
                <div className="title-area mb-30">
                  <span className="sub-title">О компании</span>
                  <h2 className="sec-title">{aboutContent.companyCaption || 'О компании «Пульсар»'}</h2>
                </div>
                <p className="about-card_text">
                  {aboutContent.companyDescription
                    ? aboutContent.companyDescription.split('\n').map((p, i) => <span key={i}>{p}<br /></span>)
                    : <>Мы — надёжный поставщик сантехнического оборудования, труб и комплектующих для застройщиков, подрядчиков и оптовых покупателей. Работаем напрямую с производителями, обеспечивая лучшие цены и стабильные поставки.</>
                  }
                </p>
                <Link to="/about" className="themeholy-btn" style={{ marginTop: 20 }}>Подробнее о компании</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {projects === null && <div className="section-loading"><Preloader /></div>}
      {projects && projects.length > 0 && (
        <section className="space bg-smoke" id="home-projects">
          <div className="container">
            <div className="title-area text-center">
              <span className="sub-title">Портфолио</span>
              <h2 className="sec-title">Наши проекты</h2>
            </div>
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              spaceBetween={20}
              slidesPerView={4}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
              }}
              className="projects-swiper"
            >
              {projects.map(project => (
                <SwiperSlide key={project.id}>
                  <div className="themeholy-product">
                    <div className="product-img">
                      {project.photo && <img src={`/uploads/${project.photo}`} alt={project.name} />}
                    </div>
                    <h3 className="product-title">{project.name}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {brands === null && <div className="section-loading"><Preloader /></div>}
      {brands && brands.length > 0 && (
        <section className="brand-sec1">
          <div className="container">
            <div className="title-area text-center">
              <span className="sub-title">Партнёры</span>
              <h2 className="sec-title">Наши партнёры</h2>
            </div>
            <div className="row gy-30 justify-content-center">
              {brands.map(brand => (
                <div key={brand.id} className="col-lg-3 col-md-4 col-sm-6 text-center">
                  {brand.photo && <img src={`/uploads/${brand.photo}`} alt={brand.name} style={{ maxHeight: 80 }} />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {letters === null && <div className="section-loading"><Preloader /></div>}
      {letters && letters.length > 0 && (
        <section className="space bg-smoke">
          <div className="container">
            <div className="title-area text-center">
              <span className="sub-title">Отзывы</span>
              <h2 className="sec-title">Благодарственные письма</h2>
            </div>
            <div className="row gy-30 justify-content-center">
              {letters.map(letter => (
                <div key={letter.id} className="col-lg-3 col-md-4 col-sm-6 text-center">
                  {letter.photo && <img src={`/uploads/${letter.photo}`} alt={letter.name} className="letters-item" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
