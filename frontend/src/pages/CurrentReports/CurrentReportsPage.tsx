import { useEffect, useState } from 'react';
import { accessApi } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';

interface OccupancySite {
  site: {
    id: number;
    siteCode: string;
    name: string;
    city: string;
    country: string;
    status: string;
  };
  totalEmployees: number;
}

export function CurrentReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancySite[]>([]);

  useEffect(() => {
    const loadOccupancy = async () => {
      try {
        setLoading(true);
        const response = await accessApi.getCurrentOccupancy();
        setOccupancy(response.data as OccupancySite[]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el reporte actual');
      } finally {
        setLoading(false);
      }
    };

    void loadOccupancy();
  }, []);

  return (
    <div className="access-app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button type="button" className="menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
      </button>

      <main className="dashboard-main">
        <div className="dashboard-shell">
          <section className="dashboard-hero">
            <div className="home-card-head">
              <h1 className="home-title">Aforo actual</h1>
              <p className="home-subtitle">Resumen rápido del aforo por sede en este momento.</p>
            </div>
          </section>

          {error ? <div className="dashboard-feedback dashboard-feedback-error">{error}</div> : null}
          {loading ? <div className="dashboard-empty">Cargando aforo...</div> : null}

          {!loading && occupancy.length === 0 ? (
            <div className="dashboard-empty">No hay personas dentro en este momento.</div>
          ) : null}

          <section className="dashboard-grid">
            {occupancy.map((site) => (
              <article className="dashboard-card" key={site.site.id}>
                <div className="dashboard-card-head">
                  <div>
                    <h2>{site.site.name}</h2>
                    <p>
                      {site.site.siteCode} · {site.site.city}
                    </p>
                  </div>
                </div>

                <div className="dashboard-card-metrics">
                  <div>
                    <span>Personas dentro</span>
                    <strong>{site.totalEmployees}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
