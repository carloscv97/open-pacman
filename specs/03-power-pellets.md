# SPEC 03 - Power pellets y fantasmas vulnerables

> **Estado:** Approved
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-15
> **Objetivo:** Anadir cuatro power pellets en las esquinas interiores para volver vulnerables y comibles a los fantasmas durante seis segundos.

## Alcance

**Incluye:**

- Anadir una celda de power pellet en `(1,1)`, `(26,1)`, `(1,29)` y `(26,29)` en `src/js/maze.js`.
- Contabilizar dots y power pellets como coleccionables requeridos para ganar en `src/js/game.js`.
- Otorgar 50 puntos por power pellet y 200 puntos por cada fantasma asustado comido.
- Activar un modo asustado de seis segundos al comer un pellet y reiniciarlo a seis segundos al comer otro.
- Volver azul a cada fantasma vulnerable y alternar azul y blanco durante el ultimo segundo en `src/js/render.js`.
- Reaparecer un fantasma comido en su posicion inicial, mantenerlo 1.5 segundos en la jaula y liberarlo normal aunque el modo asustado aun siga activo.

**Fuera de alcance (para especificaciones futuras):**

- Sonidos para pellets, fantasmas comidos o fin del poder.
- Multiplicadores por cadena de fantasmas, vidas extra, niveles adicionales o modos globales de persecucion.
- Animacion de ojos de un fantasma retornando al corral.
- Persistencia de puntuaciones, adaptacion movil o cambios al tamano del tablero.

## Modelo de datos

`src/js/maze.js` agregara el valor `4` para una celda de power pellet. La descripcion de tipos de celda sera `0` vacio, `1` muro, `2` dot, `3` puerta y `4` power pellet.

`createGame()` incorporara al estado de partida:

```js
{
  collectiblesRemaining: 0,
  frightenedUntil: null,
}
```

`collectiblesRemaining` cuenta las celdas `2` y `4` restantes. `frightenedUntil` es una marca del reloj de simulacion y vale `null` fuera del modo asustado.

Cada objeto de `game.ghosts` incorporara:

```js
{
  releaseAt: null,
  frightenedBlocked: false,
}
```

Al comerlo, `releaseAt` se fija a 1500 ms despues del reloj de simulacion actual y `frightenedBlocked` evita que salga asustado por el pellet que seguia activo. Un nuevo power pellet restablece `frightenedBlocked` para los fantasmas liberados.

## Plan de implementacion

1. Extender `MAZE_STR` y el parser de `src/js/maze.js` para representar cuatro celdas `4` en las posiciones acordadas. Verificacion manual: al iniciar se ven cuatro pellets, uno en cada esquina interior.
2. Actualizar `createGame()` y el consumo de celdas en `movePacman()` de `src/js/game.js` para contar `2` y `4` en `collectiblesRemaining`, sumar 50 por `4` y mantener la victoria cuando no queden coleccionables. Verificacion manual: comer un pellet lo elimina, suma 50 y la victoria requiere los cuatro.
3. Incorporar `frightenedUntil` y usar el reloj de simulacion recibido por `update()` para aplicar seis segundos de vulnerabilidad, reiniciados al comer otro pellet. Verificacion manual: un segundo pellet prolonga el modo a seis segundos desde su consumo.
4. Cambiar las colisiones y el estado de cada fantasma para que un fantasma vulnerable sume 200 puntos, reaparezca en su posicion inicial y espere 1.5 segundos antes de salir normal. Verificacion manual: Pac-Man no pierde una vida al tocar un fantasma azul y ese fantasma no sale azul tras reaparecer.
5. Extender `drawGhost()` en `src/js/render.js` para representar fantasmas vulnerables en azul y alternar azul y blanco durante el ultimo segundo. Verificacion manual: el color cambia al tomar un pellet y parpadea antes de que termine el poder.

## Criterios de aceptacion

- [ ] Al iniciar una partida hay exactamente cuatro power pellets en `(1,1)`, `(26,1)`, `(1,29)` y `(26,29)`.
- [ ] Un power pellet vale exactamente 50 puntos y desaparece al ser comido.
- [ ] Comer un power pellet hace vulnerables a los fantasmas liberados durante seis segundos de reloj de simulacion.
- [ ] Comer otro pellet durante el modo asustado reinicia su duracion a seis segundos.
- [ ] Un fantasma vulnerable se dibuja azul y alterna azul y blanco durante el ultimo segundo del modo.
- [ ] Colisionar con un fantasma vulnerable suma exactamente 200 puntos y no reduce una vida.
- [ ] Un fantasma comido reaparece en su celda inicial, permanece en la jaula 1.5 segundos y sale normal aunque siga activo el poder anterior.
- [ ] Un fantasma no vulnerable conserva la colision que reduce una vida.
- [ ] La victoria solo ocurre al no quedar dots ni power pellets.
- [ ] El juego sigue permitiendo iniciar, reiniciar, mover a Pac-Man, cruzar el tunel y perder una partida sin errores en la consola.

## Decisiones

- **Si:** usar cuatro pellets en las esquinas interiores `(1,1)`, `(26,1)`, `(1,29)` y `(26,29)`. Son celdas transitables, simetricas y cercanas a cada esquina.
- **No:** colocarlos sobre las esquinas del borde. Esas celdas son muros.
- **Si:** cada pellet da 50 puntos y cada fantasma vulnerable da siempre 200. Mantiene reglas simples sin estado de cadenas.
- **No:** puntuar 200, 400, 800 y 1600 por cadena. Requiere una regla de combo fuera del alcance acordado.
- **Si:** seis segundos de vulnerabilidad y reinicio completo al comer otro pellet. El efecto es claro y predecible.
- **Si:** azul con parpadeo azul y blanco en el ultimo segundo. Comunica visualmente que el poder esta por terminar.
- **Si:** el fantasma comido reaparece en la jaula y espera 1.5 segundos. Reutiliza la cadencia de liberacion de SPEC 01.
- **No:** animar ojos que regresan al corral. Es una animacion adicional no solicitada.
- **Si:** el fantasma reaparecido sale normal aun cuando quede poder. Evita puntos repetibles con un unico pellet.
- **No:** incluir sonidos, niveles, persistencia o interfaz movil. Son cambios independientes.

## Riesgos

| Riesgo                                                                 | Mitigacion                                                                        |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Un pellet se consume sin contar para la victoria.                      | Contar los tipos `2` y `4` en el unico contador de coleccionables.                |
| Un fantasma comido colisiona durante su reaparicion.                   | Mantenerlo no liberado y excluirlo de colisiones hasta su nueva salida.           |
| El temporizador depende de los FPS o expira al volver de otra pestana. | Usar el reloj de simulacion fijo definido en SPEC 02.                             |
| El color vulnerable no se distingue del color propio de un fantasma.   | Usar azul comun y alternancia a blanco en el ultimo segundo para todos los tipos. |

## Lo que **no** incluye esta especificacion

- Sonidos o animaciones de ojos retornando al corral.
- Multiplicadores por cadena, vidas extra o niveles adicionales.
- Guardado de puntuaciones o adaptacion movil.

Cada una de estas funcionalidades se tratara en su propia especificacion.
