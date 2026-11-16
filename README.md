# FocusGuard

Aplicación para estudiantes universitarios que acompaña las sesiones de estudio: detecta señales de fatiga y sobrecarga, sugiere pausas oportunas y deja siempre la decisión en manos del estudiante, sin vigilancia ni bloqueos agresivos.

> Challenge de desarrollo web — Landing Page (avance de implementación).

## Información del proyecto

- **Nombre:** FocusGuard
- **Tipo:** solución digital (landing page + pantallas de acceso y registro)
- **Tecnologías:** HTML5, CSS3 y JavaScript, sin frameworks CSS. Tipografías Inter y Plus Jakarta Sans desde Google Fonts.
- **Control de versiones:** Git con GitFlow (`main`, `develop`, `feature/*`), alojado en una organización de GitHub.

## Autores

| Nombre | Rol | GitHub |
| --- | --- | --- |
| _Nombre y apellido_ | _Rol en el equipo_ | _@usuario_ |
| _Nombre y apellido_ | _Rol en el equipo_ | _@usuario_ |

## Segmentos objetivo

- **Principal:** estudiantes universitarios de pregrado, en especial en épocas de exámenes, tesis y trabajos largos.
- **Secundario:** estudiantes de posgrado y de preparación para concursos, que estudian en bloques largos.
- **Institucional:** departamentos de bienestar u orientación y facultades que quieran ofrecer una herramienta de estudio respetuosa con la privacidad.

## Principales características

- **Temporizador de inmersión** con bloques de estudio configurables y paisajes sonoros.
- **Detección de sobrecarga** a partir de cambios de tarea, con avisos amables.
- **Pausas restaurativas** guiadas (regla 20-20-20) de 5 minutos.
- **Autonomía y privacidad:** el estudiante decide si acepta la pausa; los datos se procesan en su dispositivo.
- **Métricas de ritmo** semanales, sin puntuaciones que castiguen.
- **Planes** gratuito, Pro e institucional, con conmutador mensual/anual.

## Avance de la Landing Page

- Portada con vista previa de una sesión de estudio y aviso de pausa interactivo
- Cómo funciona, características, comparativa ética, testimonios y planes
- Formulario de descarga con validación y modales accesibles
- Páginas de iniciar sesión y registrarse con validación de formularios
- Diseño responsive (320 px a escritorio) y accesible (teclado, `aria-*`, `prefers-reduced-motion`)

## Estructura

```text
FocusGuard/
├── README.md
├── .gitignore
└── public/
    ├── index.html
    ├── iniciar-sesion.html
    ├── registrarse.html
    ├── favicon.ico
    └── assets/
        ├── styles/styles.css
        ├── images/        (logo, foto del escritorio, fotos de testimonios, sprite de iconos)
        └── scripts/       (main.js, navigation.js, components.js, validation.js, landing.js, ...)
```

## Cómo ejecutarlo

No requiere instalación. Abre `public/index.html` en el navegador, o desde WebStorm usa **Open in Browser**.

## Flujo de trabajo (GitFlow)

- `main`: versión estable entregable.
- `develop`: integración del trabajo en curso.
- `feature/<nombre>`: una rama por funcionalidad, creada desde `develop` (por ejemplo `feature/landing-hero`).
- Las features se integran a `develop` mediante Pull Request.
