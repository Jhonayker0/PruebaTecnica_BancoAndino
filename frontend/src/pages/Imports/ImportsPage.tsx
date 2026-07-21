import { useMemo, useState } from 'react';
import { importsApi, type ImportResult, type ImportSummary } from '../../api';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './ImportsPage.css';

function summaryCount(summary: ImportSummary) {
  return summary.created.length + summary.updated.length + summary.skipped.length + summary.rejected.length;
}

function SummaryCard({ title, summary }: { title: string; summary: ImportSummary }) {
  const total = summaryCount(summary);

  return (
    <article className="import-summary-card">
      <div className="import-summary-head">
        <h3 className="import-summary-title">{title}</h3>
        <span className="import-summary-count">{total} fila(s)</span>
      </div>

      <div className="import-summary-grid">
        <div>
          <span className="import-summary-label">Creados</span>
          <strong>{summary.created.length}</strong>
        </div>
        <div>
          <span className="import-summary-label">Actualizados</span>
          <strong>{summary.updated.length}</strong>
        </div>
        <div>
          <span className="import-summary-label">Omitidos</span>
          <strong>{summary.skipped.length}</strong>
        </div>
        <div>
          <span className="import-summary-label">Rechazados</span>
          <strong>{summary.rejected.length}</strong>
        </div>
      </div>
    </article>
  );
}

export function ImportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const rejectedRows = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      ...result.sites.rejected.map((item) => ({ ...item, entity: 'Sedes' })),
      ...result.employees.rejected.map((item) => ({ ...item, entity: 'Empleados' })),
      ...result.assignments.rejected.map((item) => ({ ...item, entity: 'Permisos' })),
    ];
  }, [result]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setUploadError('Selecciona un archivo .xlsx');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setResult(null);

      const response = await importsApi.uploadExcel(selectedFile);
      setResult(response.data);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo importar el archivo');
    } finally {
      setIsUploading(false);
    }
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

      <main className="imports-main">
        <div className="imports-card">
          <div className="home-card-head">
            <h1 className="home-title">Importar Excel</h1>
            <p className="home-subtitle">Carga un archivo .xlsx con las hojas Sede y Empleados para sincronizar datos e importaciones.</p>
          </div>

          {uploadError ? <div className="import-feedback import-feedback-error">{uploadError}</div> : null}

          <form className="import-form" onSubmit={handleSubmit}>
            <label className="import-file-field">
              <span className="import-file-label">Archivo Excel</span>
              <input
                className="import-file-input"
                type="file"
                accept=".xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <button type="submit" className="field-submit field-submit-full" disabled={isUploading}>
              {isUploading ? 'Importando...' : 'Importar archivo'}
            </button>
          </form>

          {result ? (
            <section className="import-results">
              <div className="import-results-grid">
                <SummaryCard title="Sedes" summary={result.sites} />
                <SummaryCard title="Empleados" summary={result.employees} />
                <SummaryCard title="Permisos" summary={result.assignments} />
              </div>

              <div className="import-rejected">
                <div className="import-results-head">
                  <h2 className="import-results-title">Filas rechazadas</h2>
                  <span className="import-summary-count">{rejectedRows.length} caso(s)</span>
                </div>

                {rejectedRows.length > 0 ? (
                  <div className="import-rejected-list">
                    {rejectedRows.map((item, index) => (
                      <article key={`${item.entity}-${item.row}-${index}`} className="import-rejected-item">
                        <div className="import-rejected-top">
                          <strong>{item.entity}</strong>
                          <span>Fila {item.row}</span>
                        </div>
                        <p className="import-rejected-identifier">{item.identifier}</p>
                        <p className="import-rejected-reason">{item.reason}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="import-empty-state">No hubo filas rechazadas.</p>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
