# Sistema de Análisis Personalizado de Riesgo de Salud

## 📋 Resumen de Implementación

He implementado un sistema avanzado de análisis de riesgo de salud que personaliza la frecuencia de análisis médicos basándose en el perfil completo del usuario recopilado durante el registro.

## 🔍 Información Recopilada durante el Registro

### 1. **Información Básica** (Paso 2)
- **Nombre** - Para personalización
- **Fecha de nacimiento** - Cálculo de edad (factor de riesgo clave)
- **Sexo biológico** - Consideraciones específicas por género
- **Altura y peso** - Cálculo de IMC y categorización de riesgo

### 2. **Historial Médico** (Paso 3)
- **Condiciones crónicas** - Evaluación de riesgo por patologías existentes:
  - Alto riesgo: Diabetes, Enfermedad Cardíaca, Enfermedad Renal, Hipertensión
  - Riesgo moderado: Asma, Artritis
- **Alergias conocidas** - Factores de complicaciones
- **Cirugías e historiales médicos** - Antecedentes de complejidad médica

### 3. **Medicamentos y Suplementos** (Paso 4)
- **Medicaciones actuales** - Indicadores de condiciones controladas:
  - Metformina (diabetes)
  - Medicamentos para presión arterial
  - Medicamentos de control crónico

### 4. **Estilo de Vida** (Paso 5)
- **Tabaquismo** - Factor de alto riesgo cardiovascular
- **Consumo de alcohol** - Evaluación de riesgo por nivel de consumo
- **Frecuencia de ejercicio** - Factor protector o de riesgo
- **Consumo de drogas recreativas** - Factores de riesgo adicionales

## 🧮 Algoritmo de Evaluación de Riesgo

### Sistema de Puntuación (0-100 puntos)

#### **Factores Demográficos**
- **Edad:** 
  - ≥65 años: +15 puntos (alto riesgo)
  - 50-64 años: +8 puntos (riesgo moderado)
  - 40-49 años: +3 puntos (riesgo leve)

- **IMC:**
  - ≥35: +12 puntos (obesidad severa)
  - 30-34.9: +8 puntos (obesidad)
  - 25-29.9: +4 puntos (sobrepeso)
  - <18.5: +6 puntos (bajo peso)

#### **Historial Médico**
- **Condiciones crónicas de alto riesgo:** +15 puntos c/u
- **Condiciones crónicas de riesgo moderado:** +8 puntos c/u
- **Otras condiciones crónicas:** +5 puntos c/u
- **Cirugías complejas:** +5 puntos c/u
- **Otros procedimientos quirúrgicos:** +2 puntos c/u
- **Medicamentos de control:** +8 puntos c/u

#### **Estilo de Vida**
- **Tabaquismo activo:** +20 puntos (factor de muy alto riesgo)
- **Ex-fumador:** +8 puntos (riesgo residual)
- **Consumo excesivo de alcohol:** +12 puntos
- **Consumo moderado de alcohol:** +4 puntos
- **Sedentarismo completo:** +15 puntos
- **Actividad física muy limitada:** +10 puntos
- **Ejercicio frecuente:** -5 puntos (factor protector)
- **Uso regular de drogas:** +15 puntos
- **Uso ocasional de drogas:** +5 puntos

### Niveles de Riesgo

| Puntuación | Nivel | Descripción |
|------------|-------|-------------|
| 0-19 | **Bajo** | Perfil de riesgo mínimo |
| 20-34 | **Moderado** | Algunos factores de riesgo presentes |
| 35-49 | **Alto** | Múltiples factores de riesgo importantes |
| 50+ | **Crítico** | Perfil de muy alto riesgo |

## ⏰ Frecuencias de Análisis Personalizadas

### Frecuencias Base por Nivel de Riesgo
- **Riesgo Bajo:** Cada 14 días (quincenal)
- **Riesgo Moderado:** Cada 7 días (semanal)
- **Riesgo Alto:** Cada 3 días
- **Riesgo Crítico:** Cada 1 día (diario)

### Ajustes por Edad
- **≥65 años:** Frecuencia × 0.7 (más frecuente)
- **50-64 años:** Frecuencia × 0.85 (ligeramente más frecuente)
- **<50 años:** Sin ajuste

## 🎨 Mejoras en la Interfaz de Usuario

### CountdownCard Inteligente
- **Visualización dinámica** del próximo análisis basado en el perfil del usuario
- **Indicadores visuales de riesgo** con colores específicos:
  - Verde: Riesgo bajo
  - Amarillo: Riesgo moderado  
  - Naranja: Riesgo alto
  - Rojo: Riesgo crítico (con animación pulsante)
- **Información contextual** sobre factores de riesgo identificados
- **Botón de detalles** para ver análisis completo del perfil

### Dashboard Adaptativo
- **Mensaje personalizado** en el saludo basado en la evaluación
- **Alertas críticas** para usuarios de muy alto riesgo
- **Panel de chequeo adaptativo** con colores y mensajes según el nivel de riesgo
- **Recomendaciones urgentes** cuando es hora del análisis

### Modal de Detalles de Riesgo
- **Visualización completa** del análisis de riesgo
- **Lista detallada** de todos los factores identificados
- **Explicación personalizada** de la frecuencia recomendada
- **Información educativa** sobre el nivel de riesgo

## 📊 Ejemplos de Casos de Uso

### Caso 1: Usuario de Bajo Riesgo
- **Perfil:** Joven de 25 años, peso normal, sin condiciones crónicas, ejercicio regular
- **Puntuación:** 8 puntos (ejercicio frecuente como factor protector)
- **Frecuencia:** Cada 14 días
- **Interfaz:** Colores verdes, mensaje tranquilizador

### Caso 2: Usuario de Riesgo Moderado  
- **Perfil:** Adulto de 45 años, sobrepeso, hipertensión controlada, ex-fumador
- **Puntuación:** 23 puntos (edad + IMC + condición crónica + tabaquismo previo)
- **Frecuencia:** Cada 7 días
- **Interfaz:** Colores amarillos, recomendaciones de seguimiento regular

### Caso 3: Usuario de Alto Riesgo
- **Perfil:** Adulto de 60 años, diabetes, enfermedad cardíaca, sedentario
- **Puntuación:** 46 puntos (edad + múltiples condiciones + estilo de vida)
- **Frecuencia:** Cada 3 días
- **Interfaz:** Colores naranjas, mensajes de monitoreo estrecho

### Caso 4: Usuario de Riesgo Crítico
- **Perfil:** Adulto de 70 años, diabetes, enfermedad cardíaca, tabaquismo activo, obesidad
- **Puntuación:** 68 puntos (múltiples factores de alto riesgo)
- **Frecuencia:** Diario (ajustado por edad a 1 día)
- **Interfaz:** Colores rojos con animación, alertas urgentes

## 🔧 Implementación Técnica

### Nuevos Archivos Creados
1. **`services/healthRiskService.ts`** - Servicio principal con toda la lógica de evaluación
2. **`features/dashboard/components/HealthRiskDetailsModal.tsx`** - Modal de detalles de riesgo

### Archivos Modificados
1. **`features/dashboard/Dashboard.tsx`** - Integración del sistema de riesgo
2. **Actualización del CountdownCard** - Lógica personalizada de recomendaciones

### Funciones Principales
- **`assessHealthRisk(userProfile)`** - Evaluación completa del perfil
- **`calculateNextAnalysisDate(userProfile, lastDate)`** - Cálculo de próximo análisis
- **`shouldRecommendAnalysis(userProfile, lastDate)`** - Verificación de recomendación

## 🚀 Beneficios del Sistema

### Para Usuarios de Bajo Riesgo
- **Monitoreo preventivo** sin sobrecarga
- **Confianza** en su estado de salud actual
- **Motivación** para mantener hábitos saludables

### Para Usuarios de Alto Riesgo
- **Detección temprana** de cambios en el estado de salud
- **Seguimiento apropiado** para su perfil de riesgo
- **Intervención oportuna** antes de complicaciones

### Para el Sistema de Salud
- **Recursos optimizados** según necesidades reales
- **Prevención efectiva** basada en evidencia
- **Mejores resultados** de salud poblacional

## 📈 Métricas y Seguimiento

El sistema permite tracking de:
- **Adherencia** a las recomendaciones de frecuencia
- **Evolución del riesgo** a lo largo del tiempo
- **Efectividad** de las intervenciones preventivas
- **Satisfacción del usuario** con las recomendaciones personalizadas

## 🔮 Futuras Mejoras

1. **Machine Learning** para refinamiento del algoritmo
2. **Integración con dispositivos** wearables para datos en tiempo real
3. **Alertas inteligentes** basadas en patrones de comportamiento
4. **Recomendaciones específicas** de intervenciones por factor de riesgo
5. **Colaboración médica** para validación clínica del algoritmo