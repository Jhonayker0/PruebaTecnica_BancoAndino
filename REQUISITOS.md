# REQUISITOS

## Requisitos funcionales

1. Integrar con la API REST de BioStar para sincronizar la información de los empleados.
2. Sincronizar la información con los dispositivos mediante BioStar.
3. Importar empleados desde archivos Excel.4. Registrar información de empleados.
5. Consultar información de empleados.
6. Actualizar información de empleados.
7. Eliminar información de empleados.
8. Validar al importar la integridad y consistencia de la información.
9. Presentar al finalizar la importación un resumen indicando: 
   - Registros exitosos.
   - Registros rechazados.
   - Motivo de cada rechazo.
10. Controlar el ingreso y salida de empleados por sede.
11. Calcular el aforo actual de cada sede.
12. Mostrar un tablero visual con la ocupación en tiempo real de cada sede.
13. Generar reportes de ingresos filtrando por sede y rango de fechas.
14. Exportar los reportes a formato Excel.
15. Descargar los tableros generados.
16. Almacenar la información de empleados, sedes y permisos de acceso en PostgreSQL.
17. Registrar el estado de la sincronización con BioStar (posible fuera del MVP).
18. Registrar cada evento de ingreso y salida de los empleados.
19. Conservar el historial de eventos de acceso para permitir la generación de reportes.

## Requisitos no funcionales

1. Ejecutarse mediante Docker Compose.
2. Usar PostgreSQL como base de datos.
3. Desarrollar el frontend en React.
4. Exponer una API REST en el backend.
5. Facilitar futuras ampliaciones (posible fuera del MVP).
6. Contar con un flujo básico de CI/CD (posible fuera del MVP).

## Problemas identificados

1. **Empleados con acceso a múltiples sedes:** actualmente existen empleados que requieren autorización para ingresar a más de una sede, por lo que el modelo debe contemplar un catálogo de sedes y una relación usuario<->sede.
2. **Registros duplicados de empleados:** se presentan registros duplicados debido a traslados entre países, cambios de documento u otras inconsistencias.
3. **Cálculo inexacto del aforo:** el aforo pierde precisión cuando una persona abandona una sede por una salida de emergencia.
4. **Identificación inconsistente de los empleados:** un mismo número puede repetirse al no contar con el mismo tipo de documento o país, por lo que no es suficiente utilizar el número de documento como identificador único.
5. **Calidad deficiente de los datos:** los archivos contienen campos sin diligenciar, fechas en diferentes formatos, valores escritos de forma inconsistente, información incompleta o con errores de digitación.
6. **Necesidad de depurar la información:** antes de sincronizar la información con BioStar los datos deben ser validados y normalizados.
7. **Definir criterios de validación:** los campos obligatorios y opcionales de la importación se definirán durante el modelado y la construcción del ERD.
8. **Manejo de documentos múltiples:** existen casos de empleados con documentos vigentes distintos según el país, por lo que el modelo debe prever esa posibilidad.
9. **Alcance futuro de contratistas:** aunque el MVP se concentra en empleados, el sistema probablemente deba ampliarse luego para contratistas.

## Contradicciones

1. **Cantidad de sedes:** finalmente se acordó trabajar con 6 sedes.
2. **Empleados con múltiples sedes:** existieron posiciones contradictorias; se aceptó que es un caso relevante.
3. **Definición del "cuarto técnico":** no se alcanzó una conclusión; se priorizó el aforo por sede y se deja preparado el modelo para extenderlo a áreas o pisos más adelante.
4. **Identificación de usuarios:** un número de documento no garantiza unicidad.
5. **Datos adicionales:** quedó a criterio del equipo desarrollador conservar únicamente la información necesaria.
6. **Alcance:** inicialmente solo empleados, aunque probablemente se requiera soportar contratistas en el futuro.
7. **Reglas de importación:** no existe una definición clara de los campos obligatorios y opcionales para la importación de empleados. Será necesario establecer dichos criterios durante el diseño del modelo de datos.

## Supuestos

1. Se definirán los campos obligatorios para enviar información a la API de BioStar.
2. Se definirán los campos mínimos para aceptar un registro en la base de datos.
3. El catálogo de sedes y la relación usuario<->sede serán parte del modelo de datos base.
4. La identificación del usuario deberá considerar más de un atributo cuando sea necesario, no solo el número de documento.
5. Se menciono que había un espacio en el que se debía validar que no hubiesen más de 8 personas al tiempo. Pero por recomendación del cliente se reportará solo la cantidad de trabajadores por sede en la versión inicial.

## Preguntas para el cliente

1. ¿Un usuario con estado diferente de **Activo** (Inactivo o Retirado) puede ingresar a una sede?
2. En el archivo de Talento Humano existen usuarios activos con fecha de retiro e inactivos o retirados sin fecha de retiro.
   - ¿Cuál de estos casos corresponde a un error en los datos?
   - ¿Cuál debería ser el comportamiento esperado del sistema?
   - ¿Debe prevalecer el estado del empleado o la fecha de retiro al momento de registrar la información?
3. ¿Qué campos se consideran obligatorios para aceptar un empleado en la base de datos y cuáles podrán quedar opcionales inicialmente?
4. ¿Se espera soportar contratistas en el modelo inicial o solo en una futura ampliación?
