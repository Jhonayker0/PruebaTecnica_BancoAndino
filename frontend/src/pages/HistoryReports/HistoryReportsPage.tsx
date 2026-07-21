import { useEffect, useMemo, useState } from 'react';
import { accessApi, sitesApi } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './HistoryReportsPage.css';

interface SiteOption {
  id: number;
  siteCode: string;
  name: string;
}

interface HistoryRow {
  id: number;
  movementType: 'ENTRY' | 'EXIT';
  occurredAt: string;
  employee: {
    firstName: string;
    lastName: string;
    documentNumber: string;
  };
  site: {
    id: number;
    siteCode: string;
    name: string;
    city: string;
  };
}

const INITIAL_FILTERS = {
  siteId: '',
  from: '',
  to: '',
};

export function HistoryReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoadingSites(true);
        const response = await sitesApi.findAll();
        setSites(response.data as SiteOption[]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las sedes');
      } finally {
        setLoadingSites(false);
      }
    };

    void loadSites();
  }, []);

  const selectedSiteName = useMemo(() => {
    const siteId = Number(filters.siteId);
    return sites.find((site) => site.id === siteId)?.name ?? '';
  }, [filters.siteId, sites]);

  const buildParams = () => {
    const from = filters.from.trim();
    const to = filters.to.trim();

    if (from && to && from > to) {
      throw new Error('La fecha inicial no puede ser mayor a la fecha final');
    }

    return {
      ...(filters.siteId ? { siteId: Number(filters.siteId) } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setFeedback(null);

      const params = buildParams();
      const response = await accessApi.findHistory(params);
      setRows(response.data as HistoryRow[]);

      setFeedback(
        response.data.length > 0
          ? `Se encontraron ${response.data.length} movimientos${selectedSiteName ? ` para ${selectedSiteName}` : ''}`
          : 'No se encontraron movimientos en el rango seleccionado',
      );
    } catch (searchError) {
      setRows([]);
      setError(searchError instanceof Error ? searchError.message : 'No se pudo consultar el histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const params = buildParams();
      const response = await accessApi.exportHistory(params);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-historico-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setFeedback('Exportación generada correctamente en Excel');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'No se pudo exportar el reporte');
    }
  };

  return (
    <div className="access-app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button type="button" className="menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
      </button>

      <main className="history-main">
        <div className="history-shell">
          <section className="history-hero">
            <div className="home-card-head">
              <h1 className="home-title">Reporte histórico</h1>
              <p className="home-subtitle">Filtra los movimientos por sede y rango de fechas, y exporta el resultado a Excel.</p>
            </div>
          </section>

          {error ? <div className="history-feedback history-feedback-error">{error}</div> : null}
          {feedback ? <div className="history-feedback history-feedback-success">{feedback}</div> : null}

          <section className="history-panel">
            <div className="history-filters">
              <div className="history-field">
                <label htmlFor="history-site">Sede</label>
                <select
                  id="history-site"
                  value={filters.siteId}
                  onChange={(e) => setFilters((current) => ({ ...current, siteId: e.target.value }))}
                  disabled={loadingSites}
                >
                  <option value="">{loadingSites ? 'Cargando sedes...' : 'Todas las sedes'}</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} - {site.siteCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="history-field">
                <label htmlFor="history-from">Desde</label>
                <input
                  id="history-from"
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((current) => ({ ...current, from: e.target.value }))}
                />
              </div>

              <div className="history-field">
                <label htmlFor="history-to">Hasta</label>
                <input
                  id="history-to"
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((current) => ({ ...current, to: e.target.value }))}
                />
              </div>
            </div>

            <div className="history-actions">
              <button type="button" className="field-submit" onClick={handleSearch} disabled={loading}>
                {loading ? 'Consultando...' : 'Consultar'}
              </button>
              <button type="button" className="field-submit field-submit-secondary" onClick={handleExport}>
                Exportar a Excel
              </button>
            </div>
          </section>

          <section className="history-table-card">
            <div className="history-table-head">
              <h2 className="history-list-title">Resultados</h2>
              <span className="history-count">{rows.length} movimiento(s)</span>
            </div>

            {rows.length === 0 ? (
              <div className="history-empty">No hay datos para el filtro seleccionado.</div>
            ) : (
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Movimiento</th>
                      <th>Empleado</th>
                      <th>Documento</th>
                      <th>Sede</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>{new Date(row.occurredAt).toLocaleString('es-CO')}</td>
                        <td>{row.movementType === 'ENTRY' ? 'Ingreso' : 'Salida'}</td>
                        <td>
                          {row.employee.firstName} {row.employee.lastName}
                        </td>
                        <td>{row.employee.documentNumber}</td>
                        <td>{row.site.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
