import { useState } from 'react';
import { biostarApi, type BiostarSyncReport } from '../../api/biostarApi';
import Sidebar from '../Home/Sidebar';
import '../Home/HomePage.css';
import './SyncPage.css';

interface ActionFeedback {
  title: string;
  message: string;
  success: boolean;
}

export function SyncPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const [report, setReport] = useState<BiostarSyncReport | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = async () => {
    try {
      setFeedback(null);
      setIsSyncing(true);
      setReport(null);

      const response = await biostarApi.syncAll();
      setReport(response.data);
      setFeedback({
        title: 'Sincronización',
        message: response.data.message,
        success: true,
      });
    } catch (error) {
      setFeedback({
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo completar la sincronización',
        success: false,
      });
    } finally {
      setIsSyncing(false);
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

      <main className="sync-main">
        <div className="sync-shell">
          <section className="sync-hero">
            <div className="home-card-head">
              <h1 className="home-title">Sincronización con BioStar</h1>
              <p className="home-subtitle">Sincroniza toda la data de Prisma de una sola vez.</p>
            </div>
          </section>

          {feedback ? (
            <div className={feedback.success ? 'sync-success' : 'sync-error'}>
              <strong>{feedback.title}</strong>
              <p className="sync-result-message">{feedback.message}</p>
            </div>
          ) : null}

          <section className="sync-grid">
            <article className="sync-panel">
              <h2 className="sync-panel-title">Sincronización masiva</h2>
              <p className="sync-panel-copy">
                La operación envía todos los usuarios y puertas de Prisma al simulador BioStar al mismo tiempo.
                Internamente se usa create o update según exista o no un registro previo en la simulación.
              </p>

              <div className="sync-actions">
                <button type="button" className="field-submit" onClick={handleSubmit} disabled={isSyncing}>
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar todo'}
                </button>
              </div>
            </article>

            <article className="sync-list-card">
              <h2 className="sync-list-title">Resultado</h2>
              <p className="sync-empty">
                La pantalla ahora solo representa una sincronización masiva al entorno BioStar. Login y Logout siguen disponibles en Home y se usan solo en el flujo de acceso.
              </p>

              {report ? (
                <div className="sync-report">
                  <div className="sync-report-grid">
                    <div className="sync-report-card">
                      <span>Usuarios creados</span>
                      <strong>{report.users.created}</strong>
                    </div>
                    <div className="sync-report-card">
                      <span>Usuarios actualizados</span>
                      <strong>{report.users.updated}</strong>
                    </div>
                    <div className="sync-report-card">
                      <span>Puertas creadas</span>
                      <strong>{report.doors.created}</strong>
                    </div>
                    <div className="sync-report-card">
                      <span>Puertas actualizadas</span>
                      <strong>{report.doors.updated}</strong>
                    </div>
                  </div>

                  <div className="sync-list">
                    <div className="sync-subsection">
                      <h3 className="sync-list-title">Usuarios sincronizados</h3>
                      {report.users.items.map((item) => (
                        <div className="sync-item" key={`user-${item.identifier}-${item.operation}`}>
                          <div className="sync-item-head">
                            <strong>{item.label}</strong>
                            <span>{item.operation === 'create' ? 'Create' : 'Update'}</span>
                          </div>
                          <p className="sync-item-meta">{item.message}</p>
                        </div>
                      ))}
                    </div>

                    <div className="sync-subsection">
                      <h3 className="sync-list-title">Puertas sincronizadas</h3>
                      {report.doors.items.map((item) => (
                        <div className="sync-item" key={`door-${item.identifier}-${item.operation}`}>
                          <div className="sync-item-head">
                            <strong>{item.label}</strong>
                            <span>{item.operation === 'create' ? 'Create' : 'Update'}</span>
                          </div>
                          <p className="sync-item-meta">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="sync-empty">Aún no has ejecutado una sincronización masiva.</p>
              )}
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
