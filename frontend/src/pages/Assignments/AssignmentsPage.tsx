import { useEffect, useState } from 'react';
import { assignmentsApi, catalogsApi, employeesApi, sitesApi, type DocumentTypeOption, type TypeDoc } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './AssignmentsPage.css';

interface EmployeeRecord {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  typeDoc: TypeDoc;
  documentNumber: string;
  status: string;
}

interface SiteRecord {
  id: number;
  siteCode: string;
  name: string;
  city: string;
  country: string;
  status: string;
}

interface AssignmentRecord {
  id: number;
  employeeId: number;
  siteId: number;
  employee: EmployeeRecord;
  site: SiteRecord;
}

interface AssignFormData {
  employeeId: string;
  siteId: string;
}

interface EmployeeLookupFormData {
  typeDoc: TypeDoc;
  documentNumber: string;
}

interface SiteLookupFormData {
  siteId: string;
}

const INITIAL_ASSIGN_FORM: AssignFormData = {
  employeeId: '',
  siteId: '',
};

const INITIAL_EMPLOYEE_LOOKUP: EmployeeLookupFormData = {
  typeDoc: 'CC',
  documentNumber: '',
};

const INITIAL_SITE_LOOKUP: SiteLookupFormData = {
  siteId: '',
};

type ActiveAction = 'asignar' | 'empleado' | 'sede' | null;

function employeeLabel(employee: EmployeeRecord) {
  return `${employee.firstName} ${employee.lastName} · ${employee.typeDoc} ${employee.documentNumber}`;
}

function siteLabel(site: SiteRecord) {
  return `${site.name} · ${site.siteCode}`;
}

export function AssignmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [sites, setSites] = useState<SiteRecord[]>([]);
  const [assignmentResults, setAssignmentResults] = useState<AssignmentRecord[]>([]);
  const [assignForm, setAssignForm] = useState<AssignFormData>(INITIAL_ASSIGN_FORM);
  const [employeeLookupForm, setEmployeeLookupForm] = useState<EmployeeLookupFormData>(INITIAL_EMPLOYEE_LOOKUP);
  const [siteLookupForm, setSiteLookupForm] = useState<SiteLookupFormData>(INITIAL_SITE_LOOKUP);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [resultsTitle, setResultsTitle] = useState('Resultados de asignaciones');

  useEffect(() => {
    const loadLookups = async () => {
      try {
        setLoadingLookups(true);
        setLookupError(null);

        const [documentTypesResponse, employeesResponse, sitesResponse] = await Promise.all([
          catalogsApi.findDocumentTypes(),
          employeesApi.findAll(),
          sitesApi.findAll(),
        ]);

        setDocumentTypes(documentTypesResponse.data);
        setEmployees(employeesResponse.data as EmployeeRecord[]);
        setSites(sitesResponse.data as SiteRecord[]);
      } catch (error) {
        setLookupError(error instanceof Error ? error.message : 'No se pudieron cargar los catálogos iniciales');
      } finally {
        setLoadingLookups(false);
      }
    };

    void loadLookups();
  }, []);

  const handleActionToggle = (action: ActiveAction) => {
    setFeedbackMessage(null);
    setFeedbackError(null);
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const findEmployeeFromLookup = () => {
    const normalizedDocumentNumber = employeeLookupForm.documentNumber.trim();

    if (!normalizedDocumentNumber) {
      throw new Error('Ingresa el número de documento');
    }

    const employee = employees.find(
      (currentEmployee) =>
        currentEmployee.typeDoc === employeeLookupForm.typeDoc &&
        currentEmployee.documentNumber === normalizedDocumentNumber,
    );

    if (!employee) {
      throw new Error('No se encontró un empleado con ese documento');
    }

    return employee;
  };

  const handleAssignSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      if (!assignForm.employeeId || !assignForm.siteId) {
        throw new Error('Selecciona un empleado y una sede');
      }

      const response = await assignmentsApi.assignEmployeeToSite({
        employeeId: Number(assignForm.employeeId),
        siteId: Number(assignForm.siteId),
      });

      const createdAssignment = response.data as AssignmentRecord;
      setAssignmentResults((currentResults) => [createdAssignment, ...currentResults.filter((item) => item.id !== createdAssignment.id)]);
      setResultsTitle('Asignaciones creadas recientemente');
      setFeedbackMessage(`Asignación creada para ${employeeLabel(createdAssignment.employee)} en ${siteLabel(createdAssignment.site)}`);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo crear la asignación');
    }
  };

  const handleSearchByEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const employee = findEmployeeFromLookup();
      const response = await assignmentsApi.findSitesByEmployee(employee.id);
      const assignments = response.data as AssignmentRecord[];

      setAssignmentResults(assignments);
      setResultsTitle(`Sedes asignadas a ${employeeLabel(employee)}`);
      setFeedbackMessage(`Se encontraron ${assignments.length} asignación(es)`);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudieron consultar las sedes del empleado');
    }
  };

  const handleSearchBySite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      if (!siteLookupForm.siteId) {
        throw new Error('Selecciona una sede');
      }

      const siteId = Number(siteLookupForm.siteId);
      const site = sites.find((currentSite) => currentSite.id === siteId);

      const response = await assignmentsApi.findEmployeesBySite(siteId);
      const assignments = response.data as AssignmentRecord[];

      setAssignmentResults(assignments);
      setResultsTitle(site ? `Empleados asignados a ${siteLabel(site)}` : 'Empleados asignados a la sede seleccionada');
      setFeedbackMessage(`Se encontraron ${assignments.length} asignación(es)`);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudieron consultar los empleados de la sede');
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      await assignmentsApi.removeAssignment(assignmentId);
      setAssignmentResults((currentResults) => currentResults.filter((assignment) => assignment.id !== assignmentId));
      setFeedbackMessage('Asignación eliminada');
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo eliminar la asignación');
    }
  };

  const isCatalogDisabled = loadingLookups || documentTypes.length === 0;

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

      <main className="assignments-main">
        <div className="assignments-card">
          <div className="home-card-head">
            <h1 className="home-title">Asignaciones</h1>
            <p className="home-subtitle">Asigna empleados a sedes y consulta sus relaciones</p>
          </div>

          {lookupError ? <div className="assignment-feedback assignment-feedback-error">{lookupError}</div> : null}
          {feedbackError ? <div className="assignment-feedback assignment-feedback-error">{feedbackError}</div> : null}
          {feedbackMessage ? <div className="assignment-feedback assignment-feedback-success">{feedbackMessage}</div> : null}

          <div className="action-row-quad">
            <button
              type="button"
              className={`action-button ${activeAction === 'asignar' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('asignar')}
              aria-expanded={activeAction === 'asignar'}
            >
              <span className="action-icon action-icon-add" aria-hidden="true" />
              Asignar
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'empleado' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('empleado')}
              aria-expanded={activeAction === 'empleado'}
            >
              <span className="action-icon action-icon-search" aria-hidden="true" />
              Por empleado
            </button>
            <button
              type="button"
              className={`action-button ${activeAction === 'sede' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('sede')}
              aria-expanded={activeAction === 'sede'}
            >
              <span className="action-icon action-icon-refresh" aria-hidden="true" />
              Por sede
            </button>
            <button
              type="button"
              className="action-button"
              onClick={() => setAssignmentResults([])}
            >
              <span className="action-icon action-icon-toggle" aria-hidden="true" />
              Limpiar
            </button>
          </div>

          <div className={`form-panel ${activeAction === 'asignar' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleAssignSubmit}>
                <div className="field-pair">
                  <select
                    className="field-select field-select-full"
                    value={assignForm.employeeId}
                    onChange={(e) => setAssignForm((currentForm) => ({ ...currentForm, employeeId: e.target.value }))}
                    required
                    disabled={loadingLookups || employees.length === 0}
                  >
                    <option value="">Selecciona un empleado</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employeeLabel(employee)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="field-select field-select-full"
                    value={assignForm.siteId}
                    onChange={(e) => setAssignForm((currentForm) => ({ ...currentForm, siteId: e.target.value }))}
                    required
                    disabled={loadingLookups || sites.length === 0}
                  >
                    <option value="">Selecciona una sede</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {siteLabel(site)}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="field-submit field-submit-full" disabled={loadingLookups}>
                  Asignar empleado
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'empleado' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleSearchByEmployee}>
                <div className="field-pair">
                  <select
                    className="field-select field-select-full"
                    value={employeeLookupForm.typeDoc}
                    onChange={(e) => setEmployeeLookupForm((currentForm) => ({ ...currentForm, typeDoc: e.target.value as TypeDoc }))}
                    required
                    disabled={isCatalogDisabled}
                  >
                    {documentTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="field-scan">
                    <input
                      className="field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="Número de documento"
                      value={employeeLookupForm.documentNumber}
                      onChange={(e) => setEmployeeLookupForm((currentForm) => ({ ...currentForm, documentNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="field-submit field-submit-full" disabled={isCatalogDisabled}>
                  Consultar sedes
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'sede' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleSearchBySite}>
                <select
                  className="field-select field-select-full"
                  value={siteLookupForm.siteId}
                  onChange={(e) => setSiteLookupForm((currentForm) => ({ ...currentForm, siteId: e.target.value }))}
                  required
                  disabled={loadingLookups || sites.length === 0}
                >
                  <option value="">Selecciona una sede</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {siteLabel(site)}
                    </option>
                  ))}
                </select>

                <button type="submit" className="field-submit field-submit-full" disabled={loadingLookups}>
                  Consultar empleados
                </button>
              </form>
            </div>
          </div>

          <section className="assignment-results">
            <div className="assignment-results-head">
              <h2 className="assignment-results-title">{resultsTitle}</h2>
              <span className="assignment-results-count">{assignmentResults.length} registro(s)</span>
            </div>

            <div className="assignment-results-grid">
              {assignmentResults.map((assignment) => (
                <article key={assignment.id} className="assignment-result-card">
                  <div className="assignment-result-top">
                    <div>
                      <h3 className="assignment-result-name">{employeeLabel(assignment.employee)}</h3>
                      <p className="assignment-result-meta">{siteLabel(assignment.site)}</p>
                    </div>
                    <span className="assignment-chip">ID {assignment.id}</span>
                  </div>

                  <div className="assignment-result-actions">
                    <button type="button" className="field-submit field-submit-danger" onClick={() => handleRemoveAssignment(assignment.id)}>
                      Remover
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
