# ALCANCE

## Funcionalidades incluidas en el MVP

1. **Gestión de empleados:** se prioriza porque es la base del resto de funcionalidades; sin una gestión confiable de empleados no es posible controlar acceso, reportar ni sincronizar con BioStar.
2. **Importación de empleados desde Excel:** se incluye para resolver la carga inicial de datos y reducir el trabajo manual del equipo del cliente.
3. **Validación de la información importada:** se incluye para asegurar calidad de datos antes de guardarlos y evitar propagar inconsistencias al sistema.
4. **Persistencia en PostgreSQL:** se incluye porque es la base de datos estándar solicitada por el cliente y permite dejar un almacenamiento estructurado y mantenible.
5. **Sincronización simulada con BioStar:** se incluye para validar la arquitectura y el flujo de integración sin depender de un ambiente real de pruebas.
6. **Reporte de aforo por sede:** se incluye porque cubre una necesidad operativa y de auditoría mencionada por el cliente.
7. **Dashboard de aforo:** se incluye para ofrecer una visualización rápida del estado de ocupación y apoyar la toma de decisiones.
8. **Registro de eventos de ingreso y salida:** se incluye porque es la base para calcular aforo, auditar accesos y construir reportes.


## Funcionalidades NO incluidas en el MVP
1. **GitHub Actions:** esta es una herramienta con la que no he trabajo anteriormente, desconozco el tiempo que me puede tomar entenderla e implementarla, por esa razón no la he incluido.
2. **Despliegue:** el cliente indicó que el desarrollo puede ejecutarse localmente, por lo que el despliegue se considera una actividad de menor prioridad frente a la implementación del MVP funcional.
3. **Limite de aforo para el cuarto técnico:** aunque fue mencionado durante la reunión, el cliente sugirió inicialmente centrarse en un aforo por sedes y no por pisos.
4. **Manejo avanzado de errores:** no se profundizó en esta versión para no desviar tiempo del flujo principal. Más adelante incorporaría validaciones adicionales, trazabilidad más detallada y mejores mensajes de error.
5. **Gestión de contratistas y visitantes:** por indicación del cliente no forma parte del desarrollo inicial.
6. **Integración real con BioStar:** no se incluyó porque no existe un ambiente disponible para pruebas. La cobertura se deja mediante una integración simulada y la lógica quedará preparada para reemplazar el mock
7. **Limite de aforo por Sede:** por limitaciones de tiempo he decidido dejarlo fuera del MVP, sin embargo, están todas las bases para su implementación.


## Prioridades con más tiempo
Si contase con más tiempo, los puntos que priorizaría serían:

- Prepararme e implementar un flujo de Integración Continua (CI) mediante GitHub Actions. Al ser una tecnología con la que no tengo experiencia previa, decidí centrarme en el desarrollo de las funcionalidades principales del sistema durante la prueba técnica. Con más tiempo, sería una de las primeras mejoras a incorporar.

- Implementar el despliegue de la aplicación en un entorno en la nube, permitiendo su acceso para pruebas y demostraciones.

- Reemplazar el servicio mock por una integración real con la API REST de BioStar, realizando las validaciones y pruebas correspondientes.

- Ampliar el sistema para gestionar contratistas y visitantes, reutilizando la arquitectura implementada para la gestión de empleados.

- Gestión de niveles de acceso y permisos del usuario (preguntarle al cliente)

- Hacerle preguntas al cliente para extender el control de aforo y soportar niveles como pisos o áreas, manteniendo la lógica desarrollada para el control por sedes.

- Documentar más a detalle el código, sus servicios, módulos, etc.

- Limitar el aforo en cada sede de acuerdo al campo aforo_maximo.

- Pulir detalles como hacer responsive el frontend, indicadores de carga de ser necesarios, placeholder, advertencias, etc.
