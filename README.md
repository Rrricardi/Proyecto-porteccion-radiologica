# Blindaje — Cálculo de barreras radiológicas

Calculadora web del espesor de barrera (en concreto equivalente) para salas de rayos X, basada en la ecuación de Archer (metodología NCRP-147).

## Uso

Abrí `index.html` en cualquier navegador. Es un archivo autocontenido (HTML + CSS + JS en uno solo), no requiere servidor ni instalación.

1. Elegí el tipo de barrera (primaria o secundaria).
2. Si es secundaria, indicá si el origen es directo o indirecto.
3. Seleccioná el procedimiento (camilla o bucky de pared).
4. Elegí el área protegida (define el factor de ocupación T).
5. Ingresá la distancia fuente–persona (m) y la cantidad de personas.
6. Presioná **Calcular espesor**.

El resultado muestra el espesor requerido en mm de concreto equivalente, junto con el desglose de T, Kp y Bp, y un diagrama esquemático del corte de la barrera.

## Estructura del repo

```
index.html     # versión autocontenida (recomendada) — CSS y JS embebidos
styles.css     # hoja de estilos (si se usa la versión de 3 archivos)
script.js      # lógica de cálculo (si se usa la versión de 3 archivos)
```

> Si vas a editar el proyecto, es más cómodo trabajar con `styles.css` y `script.js` separados y luego enlazarlos desde `index.html` con `<link>` y `<script src>`. Para distribuir o compartir el archivo, usá la versión autocontenida: evita problemas de rutas rotas cuando los archivos se descargan o mueven por separado.

## Fórmula

```
X = (1 / (α·γ)) · ln( ((1/Bp)^γ + β/α) / (1 + β/α) )
```

Donde:

- **α, β, γ** — coeficientes de atenuación según el procedimiento (camilla o bucky de pared) y el tipo de barrera (primaria/secundaria).
- **Bp = P / (T · Kp)** — factor de transmisión requerido.
- **P = 0.02 mSv/semana** — límite de dosis para área no controlada.
- **T** — factor de ocupación del área protegida (1, 0.2, 0.125 o 0.025 según el uso del área).
- **Kp = (K · U · N) / dp²** — factor de carga de trabajo por punto, con U = 1 (factor de uso), N = personas en el área, dp = distancia fuente–persona.

## Notas

- Los valores de α, β, γ y K están tomados de tablas de referencia NCRP-147 para camilla y bucky de pared.
- El diagrama de la barrera es ilustrativo (no está a escala).
- Pensado como herramienta de apoyo para un curso de protección radiológica — no reemplaza el cálculo y la validación de un físico médico calificado para instalaciones reales.

## Licencia

Uso libre para fines educativos.
