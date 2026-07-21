# PruebaTecnica_BancoAndino

## Levantar el proyecto

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