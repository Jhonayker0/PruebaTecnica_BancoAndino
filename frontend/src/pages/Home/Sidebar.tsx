import { useState } from 'react';
import './Sidebar.css';

interface MenuItem {
  label: string;
  route: string;
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'home',
    label: 'Acceso',
    items: [
      { label: 'Ingreso o Salida', route: '/home' },
    ],
  },
  {
    id: 'importar',
    label: 'Importar',
    items: [
      { label: 'Importar empleados, sedes y asignaciones', route: '/imports' },
    ],
  },
  {
    id: 'empleados',
    label: 'Empleados',
    items: [
      { label: 'Gestionar empleados', route: '/employees' },
      { label: 'Asignar / remover sedes', route: '/assignments' },
    ],
  },
  {
    id: 'sedes',
    label: 'Sedes',
    items: [
      { label: 'Gestionar sedes', route: '/sites' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    items: [
      { label: 'Reporte de auditoría', route: '/reports/history' },
      { label: 'Reporte en tiempo real', route: '/reports/current' },
      { label: 'Dashboards', route: '/dashboards' },
    ],
  },
  {
    id: 'biostar',
    label: 'BioStar',
    items: [
      { label: 'Sincronizar', route: '/sync' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Menú principal">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-mark" aria-hidden="true" />
            <span className="sidebar-brand-text">Control de Acceso</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
            <span className="sidebar-close-bar" />
            <span className="sidebar-close-bar" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {MENU_SECTIONS.map((section) => {
            const isExpanded = expandedId === section.id;
            return (
              <div className="sidebar-section" key={section.id}>
                <button
                  type="button"
                  className={`sidebar-section-toggle ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isExpanded}
                >
                  <span>{section.label}</span>
                  <span className="chevron" aria-hidden="true" />
                </button>

                <div className={`sidebar-submenu ${isExpanded ? 'is-expanded' : ''}`}>
                  <div className="sidebar-submenu-inner">
                    {section.items.map((item) => (
                      <a href={item.route} className="sidebar-subitem" key={item.label}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-label">Sesión activa</span>
          <span className="sidebar-footer-value">Administrador</span>
        </div>
      </aside>
    </>
  );
}
