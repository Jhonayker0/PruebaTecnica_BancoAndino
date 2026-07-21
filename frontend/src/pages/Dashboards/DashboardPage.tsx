import { useEffect, useMemo, useState } from 'react';
import { accessApi } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './DashboardPage.css';

interface OccupancyEmployee {
  employeeId: number;
  employeeSiteId: number;
  employee: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    status: string;
    levelAccess: string;
  };
  enteredAt: string;
}

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
  employees: OccupancyEmployee[];
}

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancySite[]>([]);

  useEffect(() => {
    const loadOccupancy = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await accessApi.getCurrentOccupancy();
        setOccupancy(response.data as OccupancySite[]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el aforo');
      } finally {
        setLoading(false);
      }
    };

    void loadOccupancy();
  }, []);

  const totalActive = useMemo(
    () => occupancy.reduce((sum, site) => sum + site.totalEmployees, 0),
    [occupancy],
  );

  const highestSiteOccupancy = useMemo(
    () => occupancy.reduce((max, site) => Math.max(max, site.totalEmployees), 0),
    [occupancy],
  );

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
              <h1 className="home-title">Dashboard de ocupación</h1>
              <p className="home-subtitle">Visualiza en tiempo real cuántas personas están dentro por cada sede.</p>
            </div>
            <div className="dashboard-summary-grid">
              <article className="dashboard-summary-card">
                <span>Sedes con aforo</span>
                <strong>{occupancy.length}</strong>
              </article>
              <article className="dashboard-summary-card">
                <span>Personas dentro</span>
                <strong>{totalActive}</strong>
              </article>
              <article className="dashboard-summary-card">
                <span>Máxima ocupación actual</span>
                <strong>{highestSiteOccupancy}</strong>
              </article>
            </div>
          </section>

          {error ? <div className="dashboard-feedback dashboard-feedback-error">{error}</div> : null}

          <section className="dashboard-grid">
            {loading ? <div className="dashboard-empty">Cargando aforo...</div> : null}

            {!loading && occupancy.length === 0 ? (
              <div className="dashboard-empty">No hay personas dentro en este momento.</div>
            ) : null}

            {occupancy.map((site) => {
              const ratio = highestSiteOccupancy > 0 ? (site.totalEmployees / highestSiteOccupancy) * 100 : 0;

              return (
                <article className="dashboard-card" key={site.site.id}>
                  <div className="dashboard-card-head">
                    <div>
                      <h2>{site.site.name}</h2>
                      <p>
                        {site.site.siteCode} · {site.site.city} · {site.site.country}
                      </p>
                    </div>
                    <span className={`dashboard-pill ${site.site.status === 'ACTIVE' ? 'is-active' : 'is-inactive'}`}>
                      {site.site.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="dashboard-bar">
                    <div className="dashboard-bar-fill" style={{ width: `${ratio}%` }} />
                  </div>

                  <div className="dashboard-card-metrics">
                    <div>
                      <span>Ingresos activos</span>
                      <strong>{site.totalEmployees}</strong>
                    </div>
                  </div>

                  <div className="dashboard-people-list">
                    {site.employees.map((employeeMovement) => (
                      <div className="dashboard-person" key={employeeMovement.employeeSiteId}>
                        <span>
                          {employeeMovement.employee.firstName} {employeeMovement.employee.lastName}
                        </span>
                        <small>{employeeMovement.employee.documentNumber}</small>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
