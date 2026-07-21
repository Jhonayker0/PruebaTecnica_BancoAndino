import { useEffect, useMemo, useState } from 'react';
import { accessApi, biostarApi, catalogsApi, employeesApi, sitesApi, type DocumentTypeOption } from '../../api';
import Sidebar from './Sidebar';
import './HomePage.css';

interface IngresoForm {
  tipoDocumento: string;
  numeroDocumento: string;
  contrasena: string;
  siteId: string;
}

interface SalidaForm {
  tipoDocumento: string;
  numeroDocumento: string;
  siteId: string;
}

interface SiteOption {
  id: number;
  siteCode: string;
  name: string;
}

const INITIAL_INGRESO: IngresoForm = { tipoDocumento: 'CC', numeroDocumento: '', contrasena: '', siteId: '' };
const INITIAL_SALIDA: SalidaForm = { tipoDocumento: 'CC', numeroDocumento: '', siteId: '' };

type ActiveAction = 'ingreso' | 'salida' | null;

export function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [documentTypeError, setDocumentTypeError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [ingresoForm, setIngresoForm] = useState<IngresoForm>(INITIAL_INGRESO);
  const [salidaForm, setSalidaForm] = useState<SalidaForm>(INITIAL_SALIDA);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoadingSites(true);
        setSiteError(null);

        const response = await sitesApi.findAll();
        setSites(
          response.data.map((site: { id: number; siteCode: string; name: string }) => ({
            id: site.id,
            siteCode: site.siteCode,
            name: site.name,
          })),
        );
      } catch (error) {
        setSiteError(error instanceof Error ? error.message : 'No se pudieron cargar las sedes');
      } finally {
        setLoadingSites(false);
      }
    };

    void loadSites();
  }, []);

  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        setDocumentTypeError(null);

        const response = await catalogsApi.findDocumentTypes();
        setDocumentTypes(response.data);
      } catch (error) {
        setDocumentTypeError(error instanceof Error ? error.message : 'No se pudieron cargar los tipos de documento');
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    void loadDocumentTypes();
  }, []);

  const selectedSiteName = useMemo(() => {
    const siteId = Number(ingresoForm.siteId || salidaForm.siteId);
    const site = sites.find((currentSite) => currentSite.id === siteId);

    return site?.name ?? '';
  }, [ingresoForm.siteId, salidaForm.siteId, sites]);

  const handleActionToggle = (action: ActiveAction) => {
    setActionMessage(null);
    setActionError(null);
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const findEmployeeByDocument = async (tipoDocumento: string, numeroDocumento: string) => {
    const response = await employeesApi.findAll(numeroDocumento);
    const employees = response.data as Array<{
      id: number;
      employeeCode: string;
      firstName: string;
      lastName: string;
      documentNumber: string;
      typeDoc: string;
      status: string;
    }>;

    const employee = employees.find(
      (currentEmployee) =>
        currentEmployee.documentNumber === numeroDocumento && currentEmployee.typeDoc === tipoDocumento,
    );

    if (!employee) {
      throw new Error('No se encontró un empleado con ese documento');
    }

    return employee;
  };

  const handleIngresoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setActionMessage(null);
      setActionError(null);

      if (!ingresoForm.siteId) {
        throw new Error('Selecciona una sede para registrar el ingreso');
      }

      if (!ingresoForm.contrasena.trim()) {
        throw new Error('Ingresa la contraseña para validar el acceso');
      }

      const employee = await findEmployeeByDocument(ingresoForm.tipoDocumento, ingresoForm.numeroDocumento);

      await biostarApi.login({
        documentNumber: ingresoForm.numeroDocumento,
        password: ingresoForm.contrasena,
      });

      await accessApi.registerEntry({
        employeeId: employee.id,
        siteId: Number(ingresoForm.siteId),
      });

      setActionMessage(
        `Ingreso registrado para ${employee.firstName} ${employee.lastName}${selectedSiteName ? ` en ${selectedSiteName}` : ''}`,
      );
      setIngresoForm(INITIAL_INGRESO);
      setActiveAction(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo registrar el ingreso');
    }
  };

  const handleSalidaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setActionMessage(null);
      setActionError(null);

      if (!salidaForm.siteId) {
        throw new Error('Selecciona una sede para registrar la salida');
      }

      const employee = await findEmployeeByDocument(salidaForm.tipoDocumento, salidaForm.numeroDocumento);

      await accessApi.registerExit({
        employeeId: employee.id,
        siteId: Number(salidaForm.siteId),
      });

      setActionMessage(
        `Salida registrada para ${employee.firstName} ${employee.lastName}${selectedSiteName ? ` en ${selectedSiteName}` : ''}`,
      );
      setSalidaForm(INITIAL_SALIDA);
      setActiveAction(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo registrar la salida');
    }
  };

  const isSiteListEmpty = !loadingSites && sites.length === 0;
  const isDocumentTypeListEmpty = !loadingDocumentTypes && documentTypes.length === 0;

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

      <main className="home-main">
        <div className="home-card">

          <div className="home-card-head">
            <h1 className="home-title">Bienvenido</h1>
            <p className="home-subtitle">Registra tu ingreso o salida de la sede</p>
          </div>

          {siteError ? <div className="form-status form-status-error">{siteError}</div> : null}
          {documentTypeError ? <div className="form-status form-status-error">{documentTypeError}</div> : null}
          {actionError ? <div className="form-status form-status-error">{actionError}</div> : null}
          {actionMessage ? <div className="form-status form-status-success">{actionMessage}</div> : null}

          <div className="action-row">
            <button
              type="button"
              className={`action-button ${activeAction === 'ingreso' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('ingreso')}
              aria-expanded={activeAction === 'ingreso'}
            >
              <span className="action-icon action-icon-in" aria-hidden="true" />
              Ingreso
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'salida' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('salida')}
              aria-expanded={activeAction === 'salida'}
            >
              <span className="action-icon action-icon-out" aria-hidden="true" />
              Salida
            </button>
          </div>

          <div className={`form-panel ${activeAction === 'ingreso' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleIngresoSubmit}>
                <div className="field-row">
                  <select
                    className="field-select"
                    value={ingresoForm.tipoDocumento}
                    onChange={(e) => setIngresoForm((f) => ({ ...f, tipoDocumento: e.target.value }))}
                    aria-label="Tipo de documento"
                    required
                    disabled={loadingDocumentTypes || isDocumentTypeListEmpty}
                  >
                    <option value="">{loadingDocumentTypes ? 'Cargando tipos...' : 'Selecciona un tipo'}</option>
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="field-select"
                    value={ingresoForm.siteId}
                    onChange={(e) => setIngresoForm((f) => ({ ...f, siteId: e.target.value }))}
                    aria-label="Sede"
                    required
                    disabled={loadingSites || isSiteListEmpty}
                  >
                    <option value="">{loadingSites ? 'Cargando sedes...' : 'Sede'}</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-scan">
                  <input
                    className="field-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Número de documento"
                    value={ingresoForm.numeroDocumento}
                    onChange={(e) => setIngresoForm((f) => ({ ...f, numeroDocumento: e.target.value }))}
                    required
                  />
                </div>

                <input
                  className="field-input field-input-password"
                  type="password"
                  placeholder="Contraseña"
                  value={ingresoForm.contrasena}
                  onChange={(e) => setIngresoForm((f) => ({ ...f, contrasena: e.target.value }))}
                  required
                />

                <button type="submit" className="field-submit">Ingresar</button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'salida' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleSalidaSubmit}>
                <div className="field-row">
                  <select
                    className="field-select"
                    value={salidaForm.tipoDocumento}
                    onChange={(e) => setSalidaForm((f) => ({ ...f, tipoDocumento: e.target.value }))}
                    aria-label="Tipo de documento"
                    required
                    disabled={loadingDocumentTypes || isDocumentTypeListEmpty}
                  >
                    <option value="">{loadingDocumentTypes ? 'Cargando tipos...' : 'Selecciona un tipo'}</option>
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="field-select"
                    value={salidaForm.siteId}
                    onChange={(e) => setSalidaForm((f) => ({ ...f, siteId: e.target.value }))}
                    aria-label="Sede"
                    required
                    disabled={loadingSites || isSiteListEmpty}
                  >
                    <option value="">{loadingSites ? 'Cargando sedes...' : 'Sede'}</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-scan">
                  <input
                    className="field-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Número de documento"
                    value={salidaForm.numeroDocumento}
                    onChange={(e) => setSalidaForm((f) => ({ ...f, numeroDocumento: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="field-submit field-submit-out">Registrar salida</button>

              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
