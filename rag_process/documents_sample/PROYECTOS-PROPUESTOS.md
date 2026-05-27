# Proyectos propuestos

## Opción 1: Asistente Legal de Consulta Jurisprudencial con Agente de Investigación
**Dominio:** Derecho / Consultoría legal

| Componente | Implementación |
|------------|----------------|
| **RAG** | Base de datos vectorial con leyes, sentencias y doctrina argentina [ChromaDB + embeddings] |
| **Agente** | LangGraph orquesta búsqueda en múltiples fuentes, verificación de vigencia legal y generación de citas |
| **API** | FastAPI expone endpoints: `/consultar`, `/investigar_caso`, `/generar_memorando` |
| **Valor agregado** | Grounding con legislación local, trazabilidad de fuentes, alerta de leyes derogadas |
| **Observabilidad** | LangSmith para monitoreo de costos y precisión de recuperaciones  |

**Por qué funciona:** Requiere recuperación avanzada (RAG), razonamiento lógico (agente), y es crítico mostrar fuentes exactas (gobernanza).

***

## Opción 2: Diagnóstico Médico Preliminar con Agente Multiherramienta
**Dominio:** Salud / Telemedicina

| Componente | Implementación |
|------------|----------------|
| **RAG** | Base de datos con guías clínicas, protocolos de बताया y literatura médica actualizada [FAISS] |
| **Agente** | Orquestación que decide cuándo buscar en RAG, cuándo calcular escalas (E.g. IMC, Glasgow) y cuándo recomendar derivación |
| **API** | FastAPI con endpoints: `/diagnostico_preliminar`, `/calcular_escalas`, `/generar_informe` |
| **Valor agregado** | Seguridad (no sustituye médico), explicabilidad de decisiones, registro de interacciones para AIOps |
| **Ética/Gobernanza** | Mención obligatoria de limitaciones, consentimiento informado en el flujo |

**Por qué funciona:** Combina RAG médico complejomente con un agente que aplica reglas clínicas y responde a restricciones éticas del curso.

***

## Opción 3: Analista Financiero Automático con Búsqueda en Tiempo Real
**Dominio:** Finanzas / Inversiones

| Componente | Implementación |
|------------|----------------|
| **RAG** | Documentación de empresas, estados financieros, informes de analistas almacenados en ChromaDB |
| **Agente** | LangGraph que: (1) busca datos históricos en RAG, (2) consulta APIs de mercado en tiempo real, (3) genera análisis comparativo |
| **API** | FastAPI con endpoints: `/analisis_empresa`, `/comparar_sector`, `/generar_informe_inversion` |
| **Valor agregado** | Observabilidad de costos por consulta, detección de sesgos en recomendaciones, dashboard de métricas |
| **Seguridad** | Validación de inputs, limitación de recomendaciones explícitas de compra/venta |

**Por qué funciona:** Integra RAG con datos dinámicos (APIs externas), requiere orquestación compleja y tiene métricas claras de éxito.

***

## Opción 4: Tutores Académicos Inteligentes por Materia con Adaptación Pedagógica
**Dominio:** Educación / EdTech

| Componente | Implementación |
|------------|----------------|
| **RAG** | Libros de texto, guías de estudio y bancos de ejercicios por materia [FAISS + embeddings] |
| **Agente** | Agente que diagnostica nivel del estudiante, selecciona ejercicios adecuados, explica errores y ajusta dificultad |
| **API** | FastAPI con endpoints: `/diagnosticar_nivel`, `/generar_ejercicio`, `/explicar_error`, `/progreso_estudiante` |
| **Valor agregado** | Personalización pedagógica, seguimiento de progreso, explicaciones multi-nivel (básico/intermedio/avanzado) |
| **Observabilidad** | MLflow para tracking de sesiones, tiempos de respuesta y efectividad pedagógica |

**Por qué funciona:** Requiere razonamiento adaptativo (agente), recuperación precisa de contenido educativo (RAG), y métricas de aprendizaje.

***

## Opción 5: Sistema deSoporte Técnico con Base de Conocimiento Empresarial
**Dominio:** IT / Service Desk

| Componente | Implementación |
|------------|----------------|
| **RAG** | Manuales técnicos, FAQs, historial de tickets Resueltos [ChromaDB] |
| **Agente** | LangGraph que clasifica incidente, busca solución en RAG, ejecuta scripts de diagnóstico (simulados), escaló si es necesario |
| **API** | FastAPI con endpoints: `/clasificar_ticket`, `/buscar_solucion`, `/ejecutar_diagnostico`, `/cerrar_ticket` |
| **Valor agregado** | Reducción de tiempo de resolución, trazabilidad completa, integración con sistemas de monitoreo (AIOps) |
| **Gobernanza** | Auditoría de respuestas, control de accesos por rol, registro de decisiones del agente |

**Por qué funciona:** Es un caso de uso empresarial real que demuestra ROI claro, con métricas de observabilidad y gobernanza bien definidas.

***

## Comparativa para elegir

| Criterio | Opción 1 (Legal) | Opción 2 (Salud) | Opción 3 (Finanzas) | Opción 4 (Educación) | Opción 5 (Soporte) |
|----------|-----------------|------------------|---------------------|----------------------|-------------------|
| **Complejidad RAG** | Alta (fuentes críticas) | Media-Alta | Media | Media | Media |
| **Complejidad Agente** | Media | Alta (reglas clínicas) | Alta (datos dinámicos) | Alta (adaptación) | Media |
| **Datos disponibles** | Públicas (leyes) | Públicas (guías) | Mixto (APIs + docs) | Públicas (libros) | Simuladas |
| **Impacto ético** | Alto | Muy Alto | Medio | Medio | Bajo |
| **Facilidad de demo** | Alta | Media (requiere disclaimer) | Alta | Alta | Alta |
| **Observabilidad clara** | Sí (costos/fuentes) | Sí (sesgos) | Sí (costos/tiempo) | Sí (progreso) | Sí (tiempo resolución) |

***