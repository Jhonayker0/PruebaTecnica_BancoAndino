import { useState } from 'react';
import Sidebar from './Sidebar';
import './HomePage.css';

interface DocumentType {
  value: string;
  label: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de identidad' },
];

interface IngresoForm {
  tipoDocumento: string;
  numeroDocumento: string;
  contrasena: string;
}

interface SalidaForm {
  tipoDocumento: string;
  numeroDocumento: string;
}

const INITIAL_INGRESO: IngresoForm = { tipoDocumento: 'CC', numeroDocumento: '', contrasena: '' };
const INITIAL_SALIDA: SalidaForm = { tipoDocumento: 'CC', numeroDocumento: '' };

type ActiveAction = 'ingreso' | 'salida' | null;

export function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [ingresoForm, setIngresoForm] = useState<IngresoForm>(INITIAL_INGRESO);
  const [salidaForm, setSalidaForm] = useState<SalidaForm>(INITIAL_SALIDA);

  const handleActionToggle = (action: ActiveAction) => {
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const handleIngresoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: conectar con el endpoint de autenticación / BioStar Access
    console.log('Ingreso registrado', ingresoForm);
  };

  const handleSalidaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: conectar con el endpoint de registro de salida
    console.log('Salida registrada', salidaForm);
  };

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
                  >
                    {DOCUMENT_TYPES.map((doc) => (
                      <option key={doc.value} value={doc.value}>{doc.value}</option>
                    ))}
                  </select>

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

                  <button type="submit" className="field-submit">Ingresar</button>
                </div>

                <input
                  className="field-input field-input-full"
                  type="password"
                  placeholder="Contraseña"
                  value={ingresoForm.contrasena}
                  onChange={(e) => setIngresoForm((f) => ({ ...f, contrasena: e.target.value }))}
                  required
                />
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
                  >
                    {DOCUMENT_TYPES.map((doc) => (
                      <option key={doc.value} value={doc.value}>{doc.value}</option>
                    ))}
                  </select>

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
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
