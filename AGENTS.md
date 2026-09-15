# Repository Guide

## Run and verify

- There is no package manifest, build step, automated test suite, formatter, or CI configuration. Open `src/index.html` directly in a browser; after gameplay changes, manually verify start/restart, arrow-key movement, tunnel wrapping, collisions, and win/loss states.

## Architecture and invariants

- `src/index.html` is the entrypoint. It loads classic scripts in this required dependency order: `maze.js` -> `game.js` -> `render.js` -> `main.js`. Modules share `window` globals, so do not reorder or independently convert one script to modules.
- `src/js/maze.js` owns the pristine 28x31 map: `0` empty, `1` wall, `2` dot, `3` ghost-pen door. `createGame()` must copy `MAZE`, rather than consume it, so restarts restore dots.
- Board geometry is coupled: `TILE = 20` in `render.js` and the 28x31 map require the `560x620` canvas in `index.html`. Change them together.
- `game.js` owns movement, collisions, score, and state; `render.js` only renders `game.grid`. Pac-Man cannot cross tile `3`, ghosts can, and edge wrapping is valid only on `TUNNEL_ROW`.

## Spec workflow

- For large features, use the local `/spec` skill before implementation; it writes drafts to `specs/`. `/spec-impl` requires an approved spec and creates `spec-NN-slug` branches by default; its behavior is configured in `specs/.spec-config.yml`.
