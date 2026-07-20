import { useEffect, useState } from 'react';
import {
  catalogsApi,
  employeesApi,
  type DocumentTypeOption,
  type EmployeePayload,
  type EmployeeStatus,
  type LevelAccess,
  type StatusOption,
  type TypeDoc,
  type UpdateEmployeePayload,
} from '../../api';
import Sidebar from '../Home/Sidebar';
import './EmployeesPage.css';

const LEVEL_ACCESS_OPTIONS: Array<{ value: LevelAccess; label: string }> = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'TOTAL', label: 'Total' },
  { value: 'INTERNAL_VISITOR', label: 'Internal visitor' },
  { value: 'SUPERUSER', label: 'Superuser' },
];

interface EmpleadoFormData {
  employeeCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  typeDoc: TypeDoc;
  documentNumber: string;
  status: EmployeeStatus | '';
  email: string;
  phone: string;
  biostarId: string;
  levelAccess: string;
}

interface BuscarFormData {
  typeDoc: TypeDoc;
  documentNumber: string;
}

interface EstadoFormData {
  typeDoc: TypeDoc;
  documentNumber: string;
  nuevoEstado: EmployeeStatus;
}

interface EmployeeRecord {
  id: number;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  typeDoc: TypeDoc;
  documentNumber: string;
  status: EmployeeStatus;
  email?: string | null;
  phone?: string | null;
  biostarId: string;
  levelAccess: LevelAccess;
}

const INITIAL_EMPLEADO: EmpleadoFormData = {
  employeeCode: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  typeDoc: 'CC',
  documentNumber: '',
  status: '',
  email: '',
  phone: '',
  biostarId: '',
  levelAccess: '',
};

const INITIAL_BUSCAR: BuscarFormData = { typeDoc: 'CC', documentNumber: '' };
const INITIAL_ESTADO: EstadoFormData = { typeDoc: 'CC', documentNumber: '', nuevoEstado: 'ACTIVE' };

type AccionActiva = 'anadir' | 'buscar' | 'actualizar' | 'estado' | null;

interface EmpleadoFieldsProps {
  form: EmpleadoFormData;
  onChange: (field: keyof EmpleadoFormData, value: string) => void;
  required: boolean;
  documentTypes: DocumentTypeOption[];
  statusOptions: StatusOption[];
}

function EmpleadoFields({ form, onChange, required, documentTypes, statusOptions }: EmpleadoFieldsProps) {
  return (
    <>
      <input
        className="field-input"
        type="text"
        placeholder="Código de empleado"
        value={form.employeeCode}
        onChange={(e) => onChange('employeeCode', e.target.value)}
        required={required}
      />

      <div className="field-pair">
        <input
          className="field-input"
          type="text"
          placeholder="Primer nombre"
          value={form.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          required={required}
        />
        <input
          className="field-input"
          type="text"
          placeholder="Segundo nombre (opcional)"
          value={form.middleName}
          onChange={(e) => onChange('middleName', e.target.value)}
        />
      </div>

      <div className="field-pair">
        <input
          className="field-input"
          type="text"
          placeholder="Primer apellido"
          value={form.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          required={required}
        />
        <input
          className="field-input"
          type="text"
          placeholder="Segundo apellido (opcional)"
          value={form.secondLastName}
          onChange={(e) => onChange('secondLastName', e.target.value)}
        />
      </div>

      <div className="field-pair">
        <select
          className="field-select field-select-full"
          value={form.typeDoc}
          onChange={(e) => onChange('typeDoc', e.target.value)}
          aria-label="Tipo de documento"
          required={required}
        >
          {documentTypes.map((doc) => (
            <option key={doc.value} value={doc.value}>
              {doc.label}
            </option>
          ))}
        </select>

        <div className="field-scan">
          <input
            className="field-input"
            type="text"
            inputMode="numeric"
            placeholder="Número de documento"
            value={form.documentNumber}
            onChange={(e) => onChange('documentNumber', e.target.value)}
            required={required}
          />
        </div>
      </div>

      <div className="field-pair">
        <input
          className="field-input"
          type="email"
          placeholder="Correo electrónico (opcional)"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
        <input
          className="field-input"
          type="tel"
          placeholder="Teléfono (opcional)"
          value={form.phone}
          onChange={(e) => onChange('phone', e.target.value)}
        />
      </div>

      <select
        className="field-select field-select-full"
        value={form.status}
        onChange={(e) => onChange('status', e.target.value)}
        aria-label="Estado"
      >
        <option value="">Sin definir (opcional)</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="field-pair">
        <input
          className="field-input"
          type="text"
          placeholder="ID BioStar"
          value={form.biostarId}
          onChange={(e) => onChange('biostarId', e.target.value)}
          required={required}
        />
        <select
          className="field-select"
          value={form.levelAccess}
          onChange={(e) => onChange('levelAccess', e.target.value)}
          aria-label="Nivel de acceso"
          required={required}
        >
          <option value="">Selecciona un nivel de acceso</option>
          {LEVEL_ACCESS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function employeeToForm(employee: EmployeeRecord): EmpleadoFormData {
  return {
    employeeCode: employee.employeeCode ?? '',
    firstName: employee.firstName ?? '',
    middleName: employee.middleName ?? '',
    lastName: employee.lastName ?? '',
    secondLastName: employee.secondLastName ?? '',
    typeDoc: employee.typeDoc,
    documentNumber: employee.documentNumber ?? '',
    status: employee.status,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    biostarId: employee.biostarId ?? '',
    levelAccess: employee.levelAccess ?? '',
  };
}

function buildCreatePayload(form: EmpleadoFormData): EmployeePayload {
  return {
    employeeCode: form.employeeCode.trim(),
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim() || undefined,
    lastName: form.lastName.trim(),
    secondLastName: form.secondLastName.trim() || undefined,
    typeDoc: form.typeDoc,
    documentNumber: form.documentNumber.trim(),
    status: form.status || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    biostarId: form.biostarId.trim(),
    levelAccess: form.levelAccess.trim() as EmployeePayload['levelAccess'],
  };
}

function buildUpdatePayload(form: EmpleadoFormData): UpdateEmployeePayload {
  const payload: UpdateEmployeePayload = {};

  if (form.employeeCode.trim()) payload.employeeCode = form.employeeCode.trim();
  if (form.firstName.trim()) payload.firstName = form.firstName.trim();
  if (form.middleName.trim()) payload.middleName = form.middleName.trim();
  if (form.lastName.trim()) payload.lastName = form.lastName.trim();
  if (form.secondLastName.trim()) payload.secondLastName = form.secondLastName.trim();
  if (form.documentNumber.trim()) payload.documentNumber = form.documentNumber.trim();
  if (form.status) payload.status = form.status;
  if (form.email.trim()) payload.email = form.email.trim();
  if (form.phone.trim()) payload.phone = form.phone.trim();
  if (form.biostarId.trim()) payload.biostarId = form.biostarId.trim();
  if (form.levelAccess.trim()) payload.levelAccess = form.levelAccess.trim() as EmployeePayload['levelAccess'];

  return payload;
}

export function EmployeesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<AccionActiva>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [employeeResults, setEmployeeResults] = useState<EmployeeRecord[]>([]);

  const [anadirForm, setAnadirForm] = useState<EmpleadoFormData>(INITIAL_EMPLEADO);
  const [actualizarForm, setActualizarForm] = useState<EmpleadoFormData>(INITIAL_EMPLEADO);
  const [buscarForm, setBuscarForm] = useState<BuscarFormData>(INITIAL_BUSCAR);
  const [estadoForm, setEstadoForm] = useState<EstadoFormData>(INITIAL_ESTADO);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        setCatalogError(null);

        const [documentTypesResponse, statusTypesResponse] = await Promise.all([
          catalogsApi.findDocumentTypes(),
          catalogsApi.findStatusTypes(),
        ]);

        setDocumentTypes(documentTypesResponse.data);
        setStatusOptions(statusTypesResponse.data);
      } catch (error) {
        setCatalogError(error instanceof Error ? error.message : 'No se pudieron cargar los catálogos');
      } finally {
        setLoadingCatalogs(false);
      }
    };

    void loadCatalogs();
  }, []);

  const handleActionToggle = (action: AccionActiva) => {
    setFeedbackMessage(null);
    setFeedbackError(null);
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const loadEmployeeByDocument = async (typeDoc: TypeDoc, documentNumber: string) => {
    const normalizedDocumentNumber = documentNumber.trim();

    if (!normalizedDocumentNumber) {
      throw new Error('Ingresa el número de documento');
    }

    const response = await employeesApi.findAll(normalizedDocumentNumber);
    const employees = response.data as EmployeeRecord[];

    const employee = employees.find(
      (currentEmployee) =>
        currentEmployee.typeDoc === typeDoc && currentEmployee.documentNumber === normalizedDocumentNumber,
    );

    if (!employee) {
      throw new Error('No se encontró un empleado con ese documento');
    }

    return employee;
  };

  const syncEmployeeInResults = (employee: EmployeeRecord) => {
    setEmployeeResults((currentResults) => {
      const remainingResults = currentResults.filter((currentEmployee) => currentEmployee.id !== employee.id);
      return [employee, ...remainingResults];
    });
  };

  const handleLoadEmployee = (employee: EmployeeRecord) => {
    setActualizarForm(employeeToForm(employee));
    setEstadoForm({
      typeDoc: employee.typeDoc,
      documentNumber: employee.documentNumber,
      nuevoEstado: employee.status,
    });
    setActiveAction('actualizar');
  };

  const handleAnadirSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const payload = buildCreatePayload(anadirForm);
      const response = await employeesApi.create(payload);
      const createdEmployee = response.data as EmployeeRecord;

      setFeedbackMessage(`Empleado creado: ${createdEmployee.firstName} ${createdEmployee.lastName}`);
      setAnadirForm(INITIAL_EMPLEADO);
      syncEmployeeInResults(createdEmployee);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo crear el empleado');
    }
  };

  const handleActualizarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const employee = await loadEmployeeByDocument(actualizarForm.typeDoc, actualizarForm.documentNumber);
      const payload = buildUpdatePayload(actualizarForm);

      if (Object.keys(payload).length === 0) {
        throw new Error('Completa al menos un campo para actualizar');
      }

      const response = await employeesApi.update(employee.id, payload);
      const updatedEmployee = response.data as EmployeeRecord;

      setFeedbackMessage(`Empleado actualizado: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`);
      setActualizarForm(employeeToForm(updatedEmployee));
      setEstadoForm({
        typeDoc: updatedEmployee.typeDoc,
        documentNumber: updatedEmployee.documentNumber,
        nuevoEstado: updatedEmployee.status,
      });
      syncEmployeeInResults(updatedEmployee);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo actualizar el empleado');
    }
  };

  const handleBuscarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const searchTerm = buscarForm.documentNumber.trim();
      const response = await employeesApi.findAll(searchTerm || undefined);
      const employees = response.data as EmployeeRecord[];

      const filteredEmployees = employees.filter((employee) => {
        const matchesTypeDoc = employee.typeDoc === buscarForm.typeDoc;
        const matchesDocumentNumber = searchTerm ? employee.documentNumber === searchTerm : true;

        return matchesTypeDoc && matchesDocumentNumber;
      });

      setEmployeeResults(filteredEmployees);

      if (filteredEmployees.length === 0) {
        throw new Error('No se encontraron empleados con esos criterios');
      }

      if (filteredEmployees.length === 1) {
        const employee = filteredEmployees[0];
        setActualizarForm(employeeToForm(employee));
        setEstadoForm({
          typeDoc: employee.typeDoc,
          documentNumber: employee.documentNumber,
          nuevoEstado: employee.status,
        });
      }

      setFeedbackMessage(`Se encontraron ${filteredEmployees.length} empleado(s)`);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo buscar el empleado');
    }
  };

  const handleTraerTodos = async () => {
    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const response = await employeesApi.findAll();
      const employees = response.data as EmployeeRecord[];

      setEmployeeResults(employees);
      setFeedbackMessage(`Se cargaron ${employees.length} empleado(s)`);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo cargar el listado de empleados');
    }
  };

  const handleEstadoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setFeedbackMessage(null);
      setFeedbackError(null);

      const employee = await loadEmployeeByDocument(estadoForm.typeDoc, estadoForm.documentNumber);
      const response = await employeesApi.changeStatus(employee.id, { status: estadoForm.nuevoEstado });
      const updatedEmployee = response.data as EmployeeRecord;

      setFeedbackMessage(
        `Estado actualizado para ${updatedEmployee.firstName} ${updatedEmployee.lastName} a ${updatedEmployee.status}`,
      );
      setEstadoForm({
        typeDoc: updatedEmployee.typeDoc,
        documentNumber: updatedEmployee.documentNumber,
        nuevoEstado: updatedEmployee.status,
      });
      syncEmployeeInResults(updatedEmployee);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'No se pudo cambiar el estado del empleado');
    }
  };

  const isDocumentCatalogDisabled = loadingCatalogs || documentTypes.length === 0;
  const isStatusCatalogDisabled = loadingCatalogs || statusOptions.length === 0;

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

      <main className="empleados-main">
        <div className="empleados-card">
          <div className="home-card-head">
            <h1 className="home-title">Empleados</h1>
            <p className="home-subtitle">Gestiona el registro de empleados de la sede</p>
          </div>

          {catalogError ? <div className="employee-feedback employee-feedback-error">{catalogError}</div> : null}
          {feedbackError ? <div className="employee-feedback employee-feedback-error">{feedbackError}</div> : null}
          {feedbackMessage ? <div className="employee-feedback employee-feedback-success">{feedbackMessage}</div> : null}

          <div className="action-row-quad">
            <button
              type="button"
              className={`action-button ${activeAction === 'anadir' ? 'is-active' : ''}`}
              onClick={() => handleActionToggle('anadir')}
              aria-expanded={activeAction === 'anadir'}
            >
              <span className="action-icon action-icon-add" aria-hidden="true" />
              Añadir
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

          <div className={`form-panel ${activeAction === 'anadir' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleAnadirSubmit}>
                <EmpleadoFields
                  form={anadirForm}
                  onChange={(field, value) => setAnadirForm((currentForm) => ({ ...currentForm, [field]: value }))}
                  required
                  documentTypes={documentTypes}
                  statusOptions={statusOptions}
                />
                <button type="submit" className="field-submit field-submit-full">
                  Añadir empleado
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'buscar' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleBuscarSubmit}>
                <div className="field-pair">
                  <select
                    className="field-select field-select-full"
                    value={buscarForm.typeDoc}
                    onChange={(e) => setBuscarForm((currentForm) => ({ ...currentForm, typeDoc: e.target.value as TypeDoc }))}
                    aria-label="Tipo de documento"
                    required
                    disabled={isDocumentCatalogDisabled}
                  >
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>

                  <div className="field-scan">
                    <input
                      className="field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="Número de documento (opcional)"
                      value={buscarForm.documentNumber}
                      onChange={(e) => setBuscarForm((currentForm) => ({ ...currentForm, documentNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field-button-row">
                  <button type="submit" className="field-submit" disabled={isDocumentCatalogDisabled}>
                    Buscar
                  </button>
                  <button type="button" className="field-submit field-submit-secondary" onClick={handleTraerTodos}>
                    Traer todos
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'actualizar' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleActualizarSubmit}>
                <EmpleadoFields
                  form={actualizarForm}
                  onChange={(field, value) => setActualizarForm((currentForm) => ({ ...currentForm, [field]: value }))}
                  required={false}
                  documentTypes={documentTypes}
                  statusOptions={statusOptions}
                />
                <button type="submit" className="field-submit field-submit-full">
                  Actualizar empleado
                </button>
              </form>
            </div>
          </div>

          <div className={`form-panel ${activeAction === 'estado' ? 'is-open' : ''}`}>
            <div className="form-panel-inner">
              <form className="access-form" onSubmit={handleEstadoSubmit}>
                <div className="field-pair">
                  <select
                    className="field-select field-select-full"
                    value={estadoForm.typeDoc}
                    onChange={(e) => setEstadoForm((currentForm) => ({ ...currentForm, typeDoc: e.target.value as TypeDoc }))}
                    aria-label="Tipo de documento"
                    required
                    disabled={isDocumentCatalogDisabled}
                  >
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>

                  <div className="field-scan">
                    <input
                      className="field-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="Número de documento"
                      value={estadoForm.documentNumber}
                      onChange={(e) => setEstadoForm((currentForm) => ({ ...currentForm, documentNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <select
                  className="field-select field-select-full"
                  value={estadoForm.nuevoEstado}
                  onChange={(e) => setEstadoForm((currentForm) => ({ ...currentForm, nuevoEstado: e.target.value as EmployeeStatus }))}
                  aria-label="Nuevo estado"
                  required
                  disabled={isStatusCatalogDisabled}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button type="submit" className="field-submit field-submit-full field-submit-danger">
                  Cambiar estado
                </button>
              </form>
            </div>
          </div>

          {employeeResults.length > 0 ? (
            <section className="employee-results">
              <div className="employee-results-head">
                <h2 className="employee-results-title">Resultados</h2>
                <button type="button" className="field-submit field-submit-secondary" onClick={() => setEmployeeResults([])}>
                  Limpiar
                </button>
              </div>

              <div className="employee-results-grid">
                {employeeResults.map((employee) => (
                  <article key={employee.id} className="employee-result-card">
                    <div className="employee-result-top">
                      <div>
                        <h3 className="employee-result-name">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="employee-result-meta">
                          {employee.employeeCode} · {employee.typeDoc} {employee.documentNumber}
                        </p>
                      </div>
                      <span className="employee-chip">{employee.status}</span>
                    </div>

                    <p className="employee-result-meta">
                      {employee.biostarId} · {employee.levelAccess}
                    </p>

                    <div className="employee-result-actions">
                      <button type="button" className="field-submit field-submit-secondary" onClick={() => handleLoadEmployee(employee)}>
                        Cargar en formulario
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
