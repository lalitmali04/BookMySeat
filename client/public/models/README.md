# 3D Spider-Man Model Directory

Place your `spiderman.glb` file directly in this directory:
`client/public/models/spiderman.glb`

## How it works:
1. The `SpidermanScene.tsx` component automatically attempts to load `/models/spiderman.glb`.
2. When present, it is rendered with dynamic lighting (key light + crimson rim lights) and synchronized with page scrolling.
3. If no GLB file is present, a procedural cinematic 3D hologram mesh with cyber web rings and glowing particle embers is rendered as an immediate fallback, ensuring zero crashes or blank states.
