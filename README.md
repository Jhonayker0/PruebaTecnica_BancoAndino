# PruebaTecnica_BancoAndino

Sistema para la gestión de accesos de empleados en múltiples sedes, desarrollado como prueba técnica. Administra empleados, sedes y asignaciones. Registra accesos, importa datos desde Excel, simula la sincronización de eventos, visualiza indicadores en un dashboard y genera reportes exportables. Desarrollado con React, NestJS, Prisma y PostgreSQL. Desplegado utilizando Vercel, Render y Neon.

Para el ingreso de usuarios asume que la contraseña es la misma que el documento.

## Levantar el proyecto local

Este proyecto queda listo para ejecutarse con Docker Compose. No necesitas instalar dependencias locales ni correr el backend o el frontend por separado.

### Requisitos

- Git
- Docker Desktop o Docker Engine con Docker Compose disponible

### Pasos exactos

1. Clona el repositorio:

```bash
git clone https://github.com/Jhonayker0/PruebaTecnica_BancoAndino.git
```

2. Entra a la carpeta del proyecto:

```bash
cd PruebaTecnica_BancoAndino
```

3. Levanta todos los servicios:

```bash
docker compose up --build
```

### Servicios disponibles

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Base de datos

- Host: postgres
- Puerto: 5432
- Base de datos: biostar_mvp
- Usuario: postgres
- Contraseña: postgres

### Detener el entorno

```bash
docker compose down
```

## Proyecto desplegado

- Frontend: https://prueba-tecnica-banco-andino.vercel.app/home (Vercel)
- Backend: https://pruebatecnica-bancoandino.onrender.com/ (Render)


## Tecnologías usadas
### Frontend
- React
- Vite
- TypeScript
- React Router
- Axios

### Backend
- NestJS
- Prisma ORM
- PostgreSQL

### Herramientas
- Docker
- Docker Compose

## Capturas de pantalla 
### Función de Acceso
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\access.png" alt="Función de Acceso" width="800" />

### Sidebar
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\sidebar.png" alt="Sidebar" width="800" />

### Gestión de Empleados
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\empleados.png" alt="Gestión de Empleados" width="800" />

### Función de Importar
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\import.png" alt="Función de importar" width="800" />

### Gestión de Sedes
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\sedes.png" alt="Gestión de sedes" width="800" />

### Reporte Historico
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\history.png" alt="Reporte Historico" width="800" />

### Dashboard
<img src="\docs\archivos_adicionales\Capturas_pantalla_funcionalidades\dashboard.png" alt="Dashboard" width="800" />

## Documentos Adicionales
Los entregables solicitados junto cos los chats con IA se encuentran dentro de la carpeta /docs/
Además, adjunto todo el material de apoyo utilizado y creado durante el desarrollo de este proyecto.



---

Ha sido un gusto desarrollar esta prueba técnica y espero les sea de su agrado, gracias por la oportunidad.

Jhonayker Echeverria Barragan.
