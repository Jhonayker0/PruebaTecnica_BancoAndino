import { useEffect, useState } from 'react';
import { sitesApi, type SitePayload, type SiteStatus, type UpdateSitePayload } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './SitesPage.css';

const SITE_STATUS_OPTIONS: Array<{ value: SiteStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'INACTIVE', label: 'Inactiva' },
];

interface SiteFormData {
  siteCode: string;
  name: string;
  city: string;
  country: string;
  address: string;
  status: SiteStatus | '';
}

interface SiteRecord {
  id: number;
  siteCode: string;
  name: string;
  city: string;
  country: string;
  address: string;
  status: SiteStatus;
  employeeSites?: Array<{ id: number }>;
}

const INITIAL_SITE_FORM: SiteFormData = {
  siteCode: '',
  name: '',
  city: '',
  country: '',
  address: '',
  status: '',
};

type ActiveAction = 'crear' | 'buscar' | 'actualizar' | 'estado' | null;

function siteToForm(site: SiteRecord): SiteFormData {
  return {
    siteCode: site.siteCode ?? '',
    name: site.name ?? '',
    city: site.city ?? '',
    country: site.country ?? '',
    address: site.address ?? '',
    status: site.status,
  };
}

function buildCreatePayload(form: SiteFormData): SitePayload {
  return {
    siteCode: form.siteCode.trim(),
    name: form.name.trim(),
    city: form.city.trim(),
    country: form.country.trim(),
    address: form.address.trim(),
    status: form.status || undefined,
  };
}

function buildUpdatePayload(form: SiteFormData): UpdateSitePayload {
  const payload: UpdateSitePayload = {};

  if (form.siteCode.trim()) payload.siteCode = form.siteCode.trim();
  if (form.name.trim()) payload.name = form.name.trim();
  if (form.city.trim()) payload.city = form.city.trim();
  if (form.country.trim()) payload.country = form.country.trim();
  if (form.address.trim()) payload.address = form.address.trim();
  if (form.status) payload.status = form.status;

  return payload;
}

export function SitesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [siteForm, setSiteForm] = useState<SiteFormData>(INITIAL_SITE_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [siteMessage, setSiteMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoadingSites(true);
        setSiteError(null);

        const response = await sitesApi.findAll();
        setSites(response.data as SiteRecord[]);
      } catch (error) {
        setSiteError(error instanceof Error ? error.message : 'No se pudieron cargar las sedes');
      } finally {
        setLoadingSites(false);
      }
    };

    void loadSites();
  }, []);

  const refreshSites = async (search?: string) => {
    try {
      setLoadingSites(true);
      setSiteError(null);

      const response = await sitesApi.findAll(search?.trim() || undefined);
      setSites(response.data as SiteRecord[]);
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : 'No se pudieron cargar las sedes');
    } finally {
      setLoadingSites(false);
    }
  };

  const handleActionToggle = (action: ActiveAction) => {
    setSiteMessage(null);
    setSiteError(null);
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSiteMessage(null);
      setSiteError(null);

      const response = await sitesApi.create(buildCreatePayload(siteForm));
      const createdSite = response.data as SiteRecord;

      setSites((currentSites) => [createdSite, ...currentSites.filter((currentSite) => currentSite.id !== createdSite.id)]);
      setSiteForm(INITIAL_SITE_FORM);
      setSiteMessage(`Sede creada: ${createdSite.name}`);
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : 'No se pudo crear la sede');
    }
  };

  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSiteMessage(null);
      setSiteError(null);

      if (!selectedSiteId) {
        throw new Error('Selecciona una sede desde la lista para actualizarla');
      }

      const payload = buildUpdatePayload(siteForm);

      if (Object.keys(payload).length === 0) {
        throw new Error('Completa al menos un campo para actualizar');
      }

      const response = await sitesApi.update(selectedSiteId, payload);
      const updatedSite = response.data as SiteRecord;

      setSites((currentSites) =>
        currentSites.map((currentSite) => (currentSite.id === updatedSite.id ? updatedSite : currentSite)),
      );
      setSiteForm(siteToForm(updatedSite));
      setSiteMessage(`Sede actualizada: ${updatedSite.name}`);
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : 'No se pudo actualizar la sede');
    }
  };

  const handleStatusSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSiteMessage(null);
      setSiteError(null);

      if (!selectedSiteId) {
        throw new Error('Selecciona una sede desde la lista para cambiar su estado');
      }

      if (!siteForm.status) {
        throw new Error('Selecciona un estado');
      }

      const response = await sitesApi.changeStatus(selectedSiteId, { status: siteForm.status });
      const updatedSite = response.data as SiteRecord;

      setSites((currentSites) =>
        currentSites.map((currentSite) => (currentSite.id === updatedSite.id ? updatedSite : currentSite)),
      );
      setSiteForm(siteToForm(updatedSite));
      setSiteMessage(`Estado actualizado para ${updatedSite.name}`);
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : 'No se pudo cambiar el estado de la sede');
    }
  };

  const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await refreshSites(searchTerm);
    setActiveAction('buscar');
    setSiteMessage(searchTerm.trim() ? `Resultados filtrados por "${searchTerm.trim()}"` : 'Mostrando todas las sedes');
  };

  const handleLoadAll = async () => {
    setSearchTerm('');
    await refreshSites();
    setSiteMessage('Mostrando todas las sedes');
  };

  const handleLoadSite = (site: SiteRecord, nextAction: Exclude<ActiveAction, null>) => {
    setSelectedSiteId(site.id);
    setSiteForm(siteToForm(site));
    setActiveAction(nextAction);
  };

  const statusLabel = (status: SiteStatus) => SITE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  const isStatusDisabled = SITE_STATUS_OPTIONS.length === 0;

  return (
    <div className="access-app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        type="button"
        className="menu-trigger"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
        <span className="menu-trigger-bar" />
      </button>

      <main className="sites-main">
        <div className="sites-card">
          <div className="home-card-head">
            <h1 className="home-title">Sedes</h1>
            <p className="home-subtitle">Gestiona el catálogo de sedes y su estado operativo</p>
          </div>

          {siteError ? <div className="site-feedback site-feedback-error">{siteError}</div> : null}
          {siteMessage ? <div className="site-feedback site-feedback-success">{siteMessage}</div> : null}

          <div className="action-row-quad">
            <button
              type="button"
              className={`action-button ${activeAction === 'crear' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('crear')}
              aria-expanded={activeAction === 'crear'}
            >
              <span className="action-icon action-icon-add" aria-hidden="true" />
              Crear
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'buscar' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('buscar')}
              aria-expanded={activeAction === 'buscar'}
            >
              <span className="action-icon action-icon-search" aria-hidden="true" />
              Buscar
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'actualizar' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('actualizar')}
              aria-expanded={activeAction === 'actualizar'}
            >
              <span className="action-icon action-icon-refresh" aria-hidden="true" />
              Actualizar
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'estado' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('estado')}
              aria-expanded={activeAction === 'estado'}
            >
              <span className="action-icon action-icon-toggle" aria-hidden="true" />
              Cambiar estado
            </button>
          </div>

          <div className={`form-panel ${activeAction === 'crear' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleCreateSubmit}>
                <div className="field-pair">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Código de sede"
                    value={siteForm.siteCode}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, siteCode: e.target.value }))}
                    required
                  />
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Nombre"
                    value={siteForm.name}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="field-pair">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Ciudad"
                    value={siteForm.city}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, city: e.target.value }))}
                    required
                  />
                  <input
                    className="field-input"
                    type="text"
                    placeholder="País"
                    value={siteForm.country}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, country: e.target.value }))}
                    required
                  />
                </div>

                <input
                  className="field-input"
                  type="text"
                  placeholder="Dirección"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, address: e.target.value }))}
                  required
                />

                <select
                  className="field-select field-select-full"
                  value={siteForm.status}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, status: e.target.value as SiteStatus }))}
                    disabled={isStatusDisabled}
                >
                  <option value="">Estado opcional</option>
                    {SITE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button type="submit" className="field-submit field-submit-full">
                  Crear sede
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'buscar' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleSearchSubmit}>
                <div className="field-button-row site-search-row">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Buscar por código, nombre, ciudad, país o dirección"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="field-submit">
                    Buscar
                  </button>
                </div>

                <div className="field-button-row">
                  <button type="button" className="field-submit field-submit-secondary" onClick={handleLoadAll}>
                    Traer todas
                  </button>
                  <button type="button" className="field-submit field-submit-secondary" onClick={() => setSites([])}>
                    Limpiar resultados
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'actualizar' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleUpdateSubmit}>
                <div className="field-pair">
                  <input className="field-input" type="text" value={siteForm.siteCode} readOnly placeholder="Código de sede" />
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Nombre"
                    value={siteForm.name}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, name: e.target.value }))}
                  />
                </div>

                <div className="field-pair">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Ciudad"
                    value={siteForm.city}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, city: e.target.value }))}
                  />
                  <input
                    className="field-input"
                    type="text"
                    placeholder="País"
                    value={siteForm.country}
                    onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, country: e.target.value }))}
                  />
                </div>

                <input
                  className="field-input"
                  type="text"
                  placeholder="Dirección"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, address: e.target.value }))}
                />

                <select
                  className="field-select field-select-full"
                  value={siteForm.status}
                  onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, status: e.target.value as SiteStatus }))}
                  disabled={isStatusDisabled}
                >
                  <option value="">Estado opcional</option>
                  {SITE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button type="submit" className="field-submit field-submit-full">
                  Actualizar sede
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'estado' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleStatusSubmit}>
                <input className="field-input" type="text" value={siteForm.siteCode} readOnly placeholder="Código de sede" />

                <select
                  className="field-select field-select-full"
                  value={siteForm.status}
                  onChange={(e) => setSiteForm((currentForm) => ({ ...currentForm, status: e.target.value as SiteStatus }))}
                  disabled={isStatusDisabled}
                  required
                >
                  <option value="">Selecciona un estado</option>
                  {SITE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button type="submit" className="field-submit field-submit-full field-submit-danger">
                  Cambiar estado
                </button>
              </form>
            </div>
          </div>

          <section className="site-results">
            <div className="site-results-head">
              <h2 className="site-results-title">Sedes cargadas</h2>
              <span className="site-results-count">{loadingSites ? 'Cargando...' : `${sites.length} registro(s)`}</span>
            </div>

            <div className="site-results-grid">
              {sites.map((site) => (
                <article key={site.id} className="site-result-card">
                  <div className="site-result-top">
                    <div>
                      <h3 className="site-result-name">{site.name}</h3>
                      <p className="site-result-meta">
                        {site.siteCode} · {site.city}, {site.country}
                      </p>
                    </div>
                    <span className="site-chip">{statusLabel(site.status)}</span>
                  </div>

                  <p className="site-result-meta">{site.address}</p>
                  <p className="site-result-meta">Asignaciones: {site.employeeSites?.length ?? 0}</p>

                  <div className="site-result-actions">
                    <button type="button" className="field-submit field-submit-secondary" onClick={() => handleLoadSite(site, 'actualizar')}>
                      Editar
                    </button>
                    <button type="button" className="field-submit field-submit-secondary" onClick={() => handleLoadSite(site, 'estado')}>
                      Estado
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
