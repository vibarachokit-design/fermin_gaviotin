# Vuelo del Gaviotín

Juego educativo sobre la conservación del Gaviotín Chico en Mejillones. HTML5 Canvas y JavaScript puro, sin dependencias ni compilación.

## Cómo jugarlo
El juego debe abrirse desde un servidor web (no con doble clic en `index.html`):

```bash
py -m http.server 8123 --directory juego-gaviotin/juego
```
Luego abrir http://localhost:8123. Para publicarlo basta subir la carpeta completa a cualquier hosting estático (GitHub Pages, Netlify, servidor propio).

## Capítulos (temporada completa)
1. **La llegada** (junio–julio): vuelo esquivando gaviotas y halcones; al final aparece la bahía de Mejillones.
2. **Instalarse** (julio–agosto): elegir un sitio de nido en el mapa de la pampa; el sitio cambia las amenazas de la incubación.
3. **El cortejo** (agosto–septiembre): pescar 3 peces y vuelo en pareja al ritmo de corazones.
4. **El nido y los huevos** (septiembre–octubre): armar el nido y encontrar los huevos camuflados.
5. **La incubación** (22–23 días): turnos de la pareja y herramientas contra amenazas; de noche, focos.
6. **Alimentar al polluelo** (noviembre–enero): pesca de 10 peces; el polluelo crece en pantalla.
7. **Crecer y volar** (diciembre–febrero): ahuyentar zorros, gatos y gaviotas, dar sombra y el primer vuelo.
8. **La partida** (febrero–marzo): la familia deja Mejillones; resumen de la temporada.

Cada capítulo termina con tarjetas "¿Sabías que…?" que se guardan en el **Álbum** (15). Desde la portada: **Capítulos** (con modo docente que abre todos) y **Álbum**. El progreso se guarda en el dispositivo; "Nueva temporada" sube la dificultad.

## Controles
| | Teclado | Celular / mouse |
|---|---|---|
| Fase 1 | Flechas o WASD | Arrastrar el dedo |
| Fase 2 | ← → moverse, mantener Espacio para zambullirse | Tocar el cielo para moverse, mantener el dedo en el agua para zambullirse |
| Fase 3 | 1–4 aplica la herramienta a la amenaza más urgente | Tocar herramienta y luego la amenaza |

## Estructura
- `index.html`, `game.js` (motor, fases de vuelo, pesca e incubación), `chapters.js` (capítulos, álbum, resumen).
- `tools/build_assets_v2.py`: procesa el kit de arte v2. `tools/build_pwa.py`: lista de archivos sin conexión y versión (ejecutar antes de publicar).
- `assets/`: arte optimizado (8 MB), generado con `python tools/build_assets.py` desde `../Gaviotin_Arte_Kit/PNG`.
- `window.__gav.step(segundos)`: gancho de prueba que avanza la simulación sin depender del reloj.

## Audio
- `assets/audio/music_*.mp3`: música entregada (normalizada a −16 LUFS, sin silencios, sin carátula). Cambia por escena con transición suave; de noche la fase 3 pasa al tema nocturno.
- `assets/audio/sfx_*.mp3`: 15 efectos generados con ElevenLabs (gaviotín, chapuzones, peces, polluelos, interfaz) y el resto sintetizados con `python tools/synth_sfx.py assets/audio` (gratis, sin servicios externos).
- `assets/audio/amb_*.mp3` y `*_loop.mp3`: ambientes y loops (viento, bahía, bajo el agua, desierto, motores, pasos, zumbido del foco).
- Si falta un archivo, el juego usa un sonido sintetizado de respaldo.

## Créditos
Arte generado con IA a partir de `gaviotin-prompts-arte.md`. No incluye el logo de la Fundación Gaviotín Chico; para usarlo se necesita el archivo oficial y su autorización.
