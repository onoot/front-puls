import { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../../types';
import { projectsHttp } from '../../http/projects';
import { Preloader } from '../Common/Preloader';
import { ProgressiveImage } from '../Common/ProgressiveImage';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsHttp.getPublicCategories().then(r => setCategories(r.data));
    projectsHttp.getPublic().then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const filterByCategory = (categoryId?: number) => {
    setActiveCategory(categoryId);
    setLoading(true);
    projectsHttp.getPublic(categoryId).then(r => setProjects(r.data)).finally(() => setLoading(false));
  };

  return (
    <div className="overflow-hidden space" id="projects-page">
      <div className="container">
        {categories.length > 0 && (
          <div className="project-filters">
            <button onClick={() => filterByCategory(undefined)} className={!activeCategory ? 'active' : ''}>
              Все
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => filterByCategory(cat.id)}
                className={activeCategory === cat.id ? 'active' : ''}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="section-loading"><Preloader /></div>}
        {!loading && <div className="row gy-30">
          {projects.map(project => (
            <div key={project.id} className="col-xl-4 col-md-6">
              <div className="project-card">
                <div className="project-img">
                  {project.photo && <ProgressiveImage src={`/uploads/${project.photo}`} alt={project.name} loading="lazy" />}
                </div>
                <div className="project-content-wrap">
                  <div className="project-content">
                    <h3 className="box-title">
                      <a href="#">{project.name}</a>
                    </h3>
                    {project.description && <p style={{ marginTop: 8, fontSize: 14 }}>{project.description}</p>}
                  </div>
                </div>
              </div>
          </div>
        ))}
        </div>}
      </div>
    </div>
  );
}
