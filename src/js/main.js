// main.js
// Bucle, teclado y pantallas. Usa createGame/update/draw (globals).

const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );
const overlay = document.getElementById( 'overlay' );
const actionBtn = document.getElementById( 'action-btn' );

let game = createGame();
let frame = 0;
const STEP_MS = 1000 / 60;
let lastNow = null;
let accumulator = 0;
let simulationNow = 0;

const KEY_DIR = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

document.addEventListener( 'keydown', ( e ) => {
  const dir = KEY_DIR[ e.key ];
  if ( !dir ) return;
  e.preventDefault();
  if ( game.state === 'playing' ) game.pacman.nextDir = dir;
} );

function showOverlay( title, cls, btnLabel ) {
  overlay.innerHTML =
    '<h1' + ( cls ? ' class="' + cls + '"' : '' ) + '>' + title + '</h1>' +
    '<button id="action-btn">' + btnLabel + '</button>';
  overlay.classList.add( 'show' );
  document.getElementById( 'action-btn' ).addEventListener( 'click', startGame );
}

function startGame() {
  game = createGame();
  game.state = 'playing';
  overlay.classList.remove( 'show' );
}

if ( actionBtn ) actionBtn.addEventListener( 'click', startGame );

function loop( now ) {
  if ( game.state === 'playing' ) {
    if ( lastNow !== null ) accumulator += now - lastNow;
    while ( accumulator >= STEP_MS && game.state === 'playing' ) {
      simulationNow += STEP_MS;
      update( game, simulationNow );
      frame++;
      accumulator -= STEP_MS;
    }
    if ( game.state === 'won' ) showOverlay( 'GANASTE', 'win', 'Reiniciar' );
    else if ( game.state === 'lost' ) showOverlay( 'PERDISTE', 'lose', 'Reiniciar' );
  } else accumulator = 0;
  lastNow = now;
  draw( ctx, game, frame );
  requestAnimationFrame( loop );
}

loop();
