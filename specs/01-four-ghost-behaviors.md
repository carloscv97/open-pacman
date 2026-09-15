# SPEC 01 - Cuatro comportamientos de fantasmas

> **Estado:** Implemented
> **Depende de:** Ninguna
> **Fecha:** 2026-09-15
> **Objetivo:** Incorporar cuatro fantasmas con comportamientos de movimiento distintos y liberarlos escalonadamente desde la jaula.

## Alcance

**Incluye:**

- Ampliar las posiciones iniciales de la jaula a cuatro fantasmas en `src/js/maze.js`.
- Mantener los colores actuales y asociarlos por orden: rojo perseguidor, cian emboscador, rosa erratico y naranja evasivo.
- Liberar el primer fantasma al iniciar una partida y los otros tres a los 1.5, 3 y 4.5 segundos.
- Reiniciar la misma secuencia de liberacion al perder una vida.
- Mantener los fantasmas no liberados visibles e inmoviles dentro de la jaula.
- Excluir los fantasmas no liberados de las colisiones con Pac-Man.
- Aplicar una IA distinta a cada fantasma al llegar a una interseccion.

**Fuera de alcance (para especificaciones futuras):**

- Bolitas de poder y fantasmas vulnerables o comibles.
- Modos temporizados de persecucion y huida globales.
- Sonidos, animaciones adicionales o cambios a la paleta de colores.
- Persistencia entre partidas o recargas de pagina.

## Modelo de datos

`src/js/maze.js` definira cuatro posiciones iniciales, en este orden y con estos tipos:

```js
const GHOST_STARTS = [
  { x: 12, y: 14, kind: 'hunter' },
  { x: 13, y: 14, kind: 'ambusher' },
  { x: 14, y: 14, kind: 'random' },
  { x: 15, y: 14, kind: 'evasive' },
];
```

Cada objeto de `game.ghosts` incorporara `released`, inicialmente `false`, para determinar si puede moverse y colisionar con Pac-Man.

El estado de partida incorporara `releaseStartedAt`, con la marca de tiempo de inicio de la secuencia. La cantidad de fantasmas liberados se calcula con el tiempo transcurrido: uno inmediatamente y uno adicional por cada intervalo completo de 1500 ms, hasta cuatro.

Los fantasmas liberados desde las columnas 12 y 15 se desplazan dentro de la jaula hacia las columnas 13 y 14, respectivamente, antes de cruzar una puerta. Los de las columnas 13 y 14 salen directamente por su puerta correspondiente.

## Plan de implementacion

1. Actualizar `GHOST_STARTS` en `src/js/maze.js` con las cuatro posiciones y tipos definidos. Verificacion manual: la partida crea cuatro fantasmas visibles con los cuatro colores existentes.
2. Extender el estado creado por `createGame()` y reiniciado por `resetPositions()` en `src/js/game.js` con `released` y `releaseStartedAt`. Verificacion manual: al comenzar o perder una vida, solo el primer fantasma puede moverse o causar una colision.
3. Pasar la marca de tiempo de `requestAnimationFrame` desde `src/js/main.js` a `update(game, now)` y liberar los fantasmas en los intervalos de 1500 ms. Verificacion manual: rojo, cian, rosa y naranja salen en ese orden a los 0, 1.5, 3 y 4.5 segundos.
4. Implementar la ruta de salida de la jaula para los fantasmas liberados y conservar inmoviles a los no liberados. Verificacion manual: cada fantasma alcanza una puerta sin atravesar muros y Pac-Man no pierde vidas al tocar uno que siga sin liberar.
5. Extender la seleccion de direccion en `decideGhost()` para los cuatro tipos. El perseguidor minimiza la distancia Manhattan a Pac-Man. El emboscador minimiza la distancia a la celda cuatro posiciones delante de Pac-Man. El erratico elige al azar una direccion valida sin invertir el sentido salvo en un callejon. El evasivo maximiza la distancia Manhattan si esta a seis o menos celdas de Pac-Man y, fuera de ese rango, la minimiza. Verificacion manual: observar cada patron en varias intersecciones.

## Criterios de aceptacion

- [ ] Al iniciar una partida aparecen cuatro fantasmas con los colores rojo, cian, rosa y naranja, en ese orden.
- [ ] Solo el fantasma rojo se libera de inmediato.
- [ ] Los fantasmas cian, rosa y naranja se liberan aproximadamente a los 1.5, 3 y 4.5 segundos desde el inicio de la secuencia.
- [ ] Tras perder una vida, los cuatro fantasmas regresan a la jaula y la liberacion vuelve a empezar con solo el rojo activo.
- [ ] Un fantasma no liberado permanece visible, no se mueve y no reduce las vidas de Pac-Man al coincidir con el.
- [ ] El fantasma rojo toma en las intersecciones una ruta que reduce su distancia Manhattan a Pac-Man.
- [ ] El fantasma cian toma en las intersecciones una ruta que reduce su distancia a la celda situada cuatro posiciones delante de Pac-Man.
- [ ] El fantasma rosa elige rutas aleatorias validas y solo invierte la direccion en un callejon.
- [ ] El fantasma naranja se aleja de Pac-Man a seis o menos celdas y se aproxima cuando esta a mas de seis celdas.
- [ ] Los cuatro fantasmas respetan muros, pueden cruzar la puerta de la jaula y conservan el comportamiento de envoltura del tunel.
- [ ] El juego sigue permitiendo iniciar, reiniciar, mover a Pac-Man y alcanzar los estados de victoria y derrota sin errores en la consola.

## Decisiones

- **Si:** cuatro conductas locales por fantasma: persecucion, emboscada, aleatoriedad y evasion. Cumplen el objetivo de diferenciarlos sin introducir estados globales.
- **No:** usar una unica IA aleatoria para todos. No proporciona comportamientos distinguibles.
- **Si:** el perseguidor es el fantasma rojo y se libera primero. Hace visible de inmediato la conducta agresiva solicitada.
- **Si:** conservar los colores existentes. Evita cambios de renderizado no solicitados.
- **Si:** liberar un fantasma cada 1500 ms usando la marca de tiempo de animacion. Representa segundos reales sin depender de la tasa de cuadros.
- **No:** liberar todos los fantasmas al comenzar. Se descarto para conservar la progresion solicitada desde la jaula.
- **Si:** desactivar movimiento y colisiones hasta la liberacion. Evita muertes injustas dentro de la jaula.
- **No:** persistir el estado de liberacion o las posiciones. Cada partida debe reiniciarse desde el mismo estado.
- **No:** incluir bolitas de poder, fantasmas comibles o cambios de modos. Se realizaran en otra especificacion.

## Riesgos

| Riesgo                                                                  | Mitigacion                                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Las posiciones laterales de la jaula no estan alineadas con una puerta. | Definir una ruta interna explicita a las columnas 13 y 14 antes de ejecutar la IA normal.                                |
| La tasa de cuadros varia entre equipos.                                 | Calcular la liberacion con el tiempo de `requestAnimationFrame`, no con un contador de cuadros.                          |
| Un objetivo de emboscada queda fuera del laberinto o sobre un muro.     | Usarlo solo para calcular distancia Manhattan entre direcciones transitables; no como destino navegable literal.         |
| Los cambios de colision afectan las vidas o los reinicios.              | Verificar manualmente colisiones antes y despues de cada liberacion, ademas de la secuencia posterior a perder una vida. |

## Lo que **no** incluye esta especificacion

- Bolitas de poder ni fantasmas vulnerables o comibles.
- Modos globales temporizados de persecucion y huida.
- Sonidos, cambios visuales de color o animaciones adicionales.
- Guardado de estado entre partidas o recargas.

Cada una de estas funcionalidades se tratara en su propia especificacion.
