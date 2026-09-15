# SPEC 02 - Actualizacion fija del juego

> **Estado:** Implemented
> **Depende de:** Ninguna
> **Fecha:** 2026-09-15
> **Objetivo:** Ejecutar la simulacion y la animacion del juego a 60 actualizaciones por segundo sin que la frecuencia de pantalla altere su velocidad.

## Alcance

**Incluye:**

- Reemplazar la llamada a `update()` en cada `requestAnimationFrame` por una simulacion fija de 60 pasos por segundo en `src/js/main.js`.
- Usar un acumulador de tiempo y una marca de tiempo de simulacion para llamar a `update(game, now)`.
- Avanzar `frame` solo cuando se ejecuta un paso de simulacion para mantener la animacion de Pac-Man a 60 Hz.
- Descartar el tiempo pendiente tras volver de una pestana en segundo plano para no simular movimientos, liberaciones o temporizadores atrasados.
- Seguir dibujando mediante `requestAnimationFrame` para que el canvas se repinte con la frecuencia disponible.

**Fuera de alcance (para especificaciones futuras):**

- Cambiar `PACMAN_SPEED`, `GHOST_SPEED` o la dificultad base del laberinto.
- Pausa manual, menu de opciones o selector de velocidad.
- Cambios en los sonidos, los controles, las reglas de colision o el renderizado del tablero.

## Modelo de datos

`src/js/main.js` incorporara estado de reloj local al bucle:

```js
const STEP_MS = 1000 / 60;
let lastNow = null;
let accumulator = 0;
let simulationNow = 0;
let frame = 0;
```

`simulationNow` es el valor pasado a `update(game, simulationNow)`. Solo aumenta `STEP_MS` por cada paso realmente simulado. No se guarda entre partidas ni recargas.

## Plan de implementacion

1. Definir `STEP_MS`, `lastNow`, `accumulator` y `simulationNow` en `src/js/main.js`. Verificacion manual: el juego sigue mostrando la pantalla inicial y permite iniciar una partida.
2. Acumular el tiempo transcurrido entre llamadas a `loop(now)` y ejecutar `update(game, simulationNow)` una vez por cada intervalo completo de `STEP_MS`. Verificacion manual: Pac-Man y los fantasmas se mueven con el mismo ritmo en pantallas de 60 y de alta frecuencia.
3. Incrementar `frame` dentro de cada paso de simulacion y conservar `draw(ctx, game, frame)` una vez por cuadro renderizado. Verificacion manual: la boca de Pac-Man conserva una animacion estable en una pantalla de alta frecuencia.
4. Detectar un salto de tiempo propio de una pestana reanudada y reinicializar el acumulador y `lastNow` sin avanzar `simulationNow`. Verificacion manual: tras dejar la pestana en segundo plano, el juego se reanuda sin desplazamientos instantaneos ni liberaciones atrasadas.

## Criterios de aceptacion

- [ ] Con una pantalla de 60 Hz, Pac-Man avanza al mismo ritmo visual que la implementacion previa a 60 cuadros por segundo.
- [ ] Con una pantalla de 120 Hz o superior, Pac-Man y los fantasmas no se desplazan mas rapido que a 60 Hz.
- [ ] La boca de Pac-Man no anima mas rapido en una pantalla de 120 Hz o superior.
- [ ] El juego sigue respondiendo a las flechas, permite usar el tunel y alcanza los estados de victoria y derrota.
- [ ] Al volver a una pestana que estuvo en segundo plano, no se ejecutan de golpe pasos pendientes de movimiento.
- [ ] Al volver a una pestana que estuvo en segundo plano, los temporizadores que reciben `simulationNow` no consumen el tiempo transcurrido fuera de la simulacion.
- [ ] No aparecen errores en la consola al iniciar o reiniciar una partida.

## Decisiones

- **Si:** 60 actualizaciones por segundo. Mantiene la velocidad actual esperada y evita que una pantalla de alta frecuencia multiplique el movimiento.
- **No:** reducir la simulacion a 30 actualizaciones por segundo. Reduciria innecesariamente la respuesta de los controles.
- **Si:** usar un acumulador y un reloj de simulacion. Da pasos estables sin depender de `requestAnimationFrame`.
- **No:** usar directamente el numero de cuadros renderizados. Esa es la causa de la velocidad variable entre pantallas.
- **Si:** descartar el retraso de una pestana en segundo plano. Al volver, la partida debe reanudarse normalmente y no recuperar tiempo perdido.
- **No:** recuperar todos los pasos omitidos. Podria producir colisiones, movimientos y vencimientos de temporizadores instantaneos.

## Riesgos

| Riesgo                                                            | Mitigacion                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Una pestana reanudada aporta una diferencia de tiempo muy grande. | Reiniciar el acumulador y la referencia temporal sin aumentar el reloj de simulacion.                |
| Un error de acumulacion altera el ritmo de movimiento.            | Usar el intervalo constante `1000 / 60` y verificar manualmente en pantallas de distinta frecuencia. |
| El renderizado sigue ocurriendo mas de 60 veces por segundo.      | Mantenerlo separado de la simulacion; solo la logica y la animacion cambian con cada paso fijo.      |

## Lo que **no** incluye esta especificacion

- Cambios de velocidad base o dificultad.
- Power pellets, fantasmas vulnerables o puntuaciones nuevas.
- Pausa manual, opciones de velocidad o guardado.

Cada una de estas funcionalidades se tratara en su propia especificacion.
