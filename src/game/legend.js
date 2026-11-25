// @ts-nocheck
/* Dino Legend — client-side canvas expedition built on the Chrome runner sprites. */

const W = 640;
const H = 360;
const GROUND = 308;
const PX = 36;
const GRAV = 2700;
const JUMP_V = -900;
const MAX_FALL = 1200;
const SAVE_KEY = "dino-legend-v1";

const BIOMES = {
  day: {
    bg: "#f7f7f7", bg2: "#e8dcc0", night: false, sun: "#fff6c0", sunGlow: "#ffd27a",
    mesa: "#c98a3a", mesa2: "#d9a441", sunX: 520, sunY: 64, dc: "#3b2a14", ground: "#d9a441",
  },
  dusk: {
    bg: "#3a1c4a", bg2: "#ff6a2a", night: false, sun: "#ffb04a", sunGlow: "#ff6a2a",
    mesa: "#4a1d2a", mesa2: "#8a3d1a", sunX: 200, sunY: 140, sand: true, dc: "#1c0d12", ground: "#8a3d1a",
  },
  ash: {
    bg: "#140808", bg2: "#8a2610", night: true, sun: "#ff4a10", sunGlow: "#ff6a1a",
    mesa: "#3a1410", mesa2: "#2a1a18", sunX: 86, sunY: 58, ember: true, dc: "#e8d8c8", ground: "#2a1a18",
  },
  ice: {
    bg: "#7fb0e8", bg2: "#e4f2ff", night: false, sun: "#ffffff", sunGlow: "#c8e0ff",
    mesa: "#a8c8e8", mesa2: "#eaf4ff", sunX: 530, sunY: 56, snow: true, dc: "#2c3e58", ground: "#eaf4ff",
  },
  jungle: {
    bg: "#0e2a1c", bg2: "#3a7a44", night: false, sun: "#c8e8b0", sunGlow: "#5a9a4a",
    mesa: "#0a1c12", mesa2: "#1a3a22", sunX: 500, sunY: 62, jungle: true, dc: "#e8e0cc", ground: "#1a3a22",
  },
  night: {
    bg: "#05050c", bg2: "#1c1234", night: true, sun: "#000000", sunGlow: "#2ad0ff",
    mesa: "#120c1e", mesa2: "#0c0a14", sunX: 500, sunY: 48, stars: true, storm: true, eclipse: true,
    dc: "#c8c8e0", ground: "#0c0a14",
  },
};

const BOSS_META = {
  cinder: {
    name: "Cinder Colossus",
    blurb: "A living furnace. Jump the quakes, duck the arm, shoot the orbs — then survive the enrage.",
  },
  tyrant: {
    name: "Chrome Tyrant",
    blurb: "Your own reflection gone wrong. Duck the laser, leap the jaw, crack the chrome until it shatters.",
  },
};

const LEVELS = [
  {
    id: 1,
    name: "Dust Mile",
    biome: "day",
    tag: "Day",
    blurb: "The original road. Learn the rhythm, taste the fire, and leave the desert behind.",
    length: 14500,
    speed: [380, 530],
    par: 1000,
    shower: 0,
    boss: null,
    foes: [
      ["Cactus", "Jump it, or burn it for points."],
      ["Pterodactyl", "High flyers pass overhead. Low ones make you duck."],
      ["Meteor", "Rare out here. Shoot it, or jump the crater."],
    ],
    spawns: [
      { t: "cactus", w: 0.62 },
      { t: "ptero", w: 0.3 },
      { t: "meteor", w: 0.08, from: 0.45 },
    ],
  },
  {
    id: 2,
    name: "Scorpion Flats",
    biome: "dusk",
    tag: "Dusk",
    blurb: "The sand bites back. Scorpions, snakes, and a sky that won't stay still.",
    length: 17500,
    speed: [430, 590],
    par: 1450,
    shower: 0,
    boss: null,
    foes: [
      ["Scorpion", "Fast and low. Jump, do not duck."],
      ["Bone snake", "Hugs the ground. A short hop is enough."],
      ["Pterodactyl", "Same sky rules as the first mile."],
      ["Meteor", "Craters scroll into you. Burn them early."],
    ],
    spawns: [
      { t: "cactus", w: 0.26 },
      { t: "scorp", w: 0.28 },
      { t: "ptero", w: 0.2 },
      { t: "snake", w: 0.14 },
      { t: "meteor", w: 0.12 },
    ],
  },
  {
    id: 3,
    name: "Cinder Basin",
    biome: "ash",
    tag: "Ash",
    blurb: "The horizon is on fire. Golems, bats, and the Cinder Colossus at the end of the road.",
    length: 15500,
    speed: [450, 610],
    par: 2200,
    shower: 16,
    boss: "cinder",
    foes: [
      ["Ember bat", "Weaves through the smoke. One breath drops it."],
      ["Golem", "Thick hide. Hold fire until it cracks."],
      ["Meteor shower", "Two impacts, spaced so a jump still lands clean."],
      ["Cinder Colossus", BOSS_META.cinder.blurb],
    ],
    spawns: [
      { t: "bat", w: 0.28 },
      { t: "golem", w: 0.16 },
      { t: "cactus", w: 0.18 },
      { t: "meteor", w: 0.24 },
      { t: "ptero", w: 0.14 },
    ],
  },
  {
    id: 4,
    name: "White Expanse",
    biome: "ice",
    tag: "Ice",
    blurb: "Honest ground, dishonest boulders. Keep your footing or freeze.",
    length: 18500,
    speed: [410, 570],
    par: 1650,
    shower: 18,
    boss: null,
    foes: [
      ["Ice boulder", "Rolling mass. Jump, or spend heat to smash it."],
      ["Bone snake", "Still low. Still a jump."],
      ["Pterodactyl", "Wings do not freeze."],
      ["Meteor", "Cold iron, hot crater."],
    ],
    spawns: [
      { t: "boulder", w: 0.32 },
      { t: "ptero", w: 0.22 },
      { t: "snake", w: 0.16 },
      { t: "meteor", w: 0.18 },
      { t: "cactus", w: 0.12 },
    ],
  },
  {
    id: 5,
    name: "Bone Canopy",
    biome: "jungle",
    tag: "Canopy",
    blurb: "Vines from above, raptors from the dark. Timing is everything under the canopy.",
    length: 19500,
    speed: [470, 650],
    par: 1900,
    shower: 0,
    boss: null,
    foes: [
      ["Vine", "Hangs into the run. Duck under the tip."],
      ["Raptor", "Telegraphs, then bursts. Jump early."],
      ["Ember bat", "Low bats want a duck. High ones are target practice."],
      ["Bone snake", "The floor is not safe."],
    ],
    spawns: [
      { t: "vine", w: 0.24 },
      { t: "raptor", w: 0.24 },
      { t: "snake", w: 0.16 },
      { t: "bat", w: 0.16 },
      { t: "cactus", w: 0.12 },
      { t: "meteor", w: 0.08, from: 0.3 },
    ],
  },
  {
    id: 6,
    name: "Eclipse",
    biome: "night",
    tag: "Night",
    blurb: "The sky inverts. The Chrome Tyrant waits — a reflection that wants you gone.",
    length: 13500,
    speed: [490, 680],
    par: 2600,
    shower: 12,
    boss: "tyrant",
    foes: [
      ["Mixed hunt", "Birds, raptors, golems, and a hard rain."],
      ["Chrome Tyrant", BOSS_META.tyrant.blurb],
    ],
    spawns: [
      { t: "ptero", w: 0.22 },
      { t: "meteor", w: 0.26 },
      { t: "raptor", w: 0.16 },
      { t: "cactus", w: 0.14 },
      { t: "golem", w: 0.12 },
      { t: "bat", w: 0.1 },
    ],
  },
];

const PTS = {
  cactus: 20,
  ptero: 30,
  scorp: 35,
  bat: 30,
  golem: 90,
  raptor: 45,
  snake: 25,
  vine: 25,
  boulder: 40,
  meteor: 55,
  crater: 15,
  proj: 25,
};

const SCRIPTS = {
  cinder: [
    ["wait", 0.7],
    ["tell", "slam", 0.48],
    ["slam"],
    ["wait", 1.05],
    ["tell", "orbs", 0.34],
    ["orbs"],
    ["wait", 1.25],
    ["tell", "meteors", 0.32],
    ["meteors"],
    ["wait", 1.05],
    ["tell", "swipe", 0.4],
    ["swipe"],
    ["wait", 0.95],
  ],
  cinder_enrage: [
    ["wait", 0.35],
    ["tell", "slam", 0.32],
    ["slam"],
    ["wait", 0.55],
    ["tell", "orbs", 0.22],
    ["orbs"],
    ["wait", 0.7],
    ["tell", "meteors", 0.22],
    ["meteors"],
    ["wait", 0.55],
    ["tell", "swipe", 0.28],
    ["swipe"],
    ["wait", 0.45],
    ["tell", "slam", 0.28],
    ["slam"],
    ["wait", 0.5],
  ],
  tyrant: [
    ["wait", 0.55],
    ["tell", "laser", 0.62],
    ["laser"],
    ["wait", 0.95],
    ["tell", "jaw", 0.38],
    ["jaw"],
    ["wait", 1.05],
    ["tell", "meteors", 0.3],
    ["meteors"],
    ["wait", 1.05],
    ["summon"],
    ["wait", 1.15],
    ["tell", "laser", 0.48],
    ["laser"],
    ["wait", 0.85],
    ["tell", "slam", 0.34],
    ["slam"],
    ["wait", 0.9],
  ],
  tyrant_enrage: [
    ["wait", 0.28],
    ["tell", "laser", 0.42],
    ["laser"],
    ["wait", 0.55],
    ["tell", "jaw", 0.26],
    ["jaw"],
    ["wait", 0.6],
    ["tell", "meteors", 0.22],
    ["meteors"],
    ["wait", 0.55],
    ["summon"],
    ["wait", 0.7],
    ["tell", "laser", 0.36],
    ["laser"],
    ["wait", 0.45],
    ["tell", "slam", 0.24],
    ["slam"],
    ["wait", 0.5],
  ],
};

const GLYPH = {
  A: ["010", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["111", "100", "100", "100", "111"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["111", "100", "101", "101", "111"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  J: ["001", "001", "001", "101", "111"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "101", "101", "101"],
  N: ["110", "101", "101", "101", "101"],
  O: ["111", "101", "101", "101", "111"],
  P: ["111", "101", "111", "100", "100"],
  Q: ["111", "101", "101", "110", "111"],
  R: ["110", "101", "110", "101", "101"],
  S: ["111", "100", "111", "001", "111"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["101", "101", "101", "111", "101"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
  Z: ["111", "001", "010", "100", "111"],
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "111", "001", "111"],
  6: ["111", "100", "111", "101", "111"],
  7: ["111", "001", "010", "010", "010"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "111"],
  " ": ["000", "000", "000", "000", "000"],
  "-": ["000", "000", "111", "000", "000"],
  "+": ["000", "010", "111", "010", "000"],
  "!": ["010", "010", "010", "000", "010"],
  ".": ["000", "000", "000", "000", "010"],
  x: ["101", "101", "010", "101", "101"],
};

const DUCK = [
  [
    "................................######..",
    "...............................##....##.",
    "..............................##..o...##",
    ".........################################",
    "......###################################",
    "....#####################################",
    "..#######################################",
    ".#############################...........",
    "#########################................",
    "######...................................",
    "##.............###..###..................",
    "##.............###..###..................",
    "..............###..###...................",
  ],
  [
    "................................######..",
    "...............................##....##.",
    "..............................##..o...##",
    ".........################################",
    "......###################################",
    "....#####################################",
    "..#######################################",
    ".#############################...........",
    "#########################................",
    "######...................................",
    "................###..........###.........",
    "##..............###..........###........",
    "##.............###..........###.........",
  ],
];

const PTERO = [
  [
    "..........######......",
    "........##......##....",
    "......##...####...##..",
    "#####.#...#..o#....##.",
    ".....#...#....#.......",
    ".....#....####........",
    "......##..............",
    ".......###............",
  ],
  [
    ".......###............",
    "......#...#...........",
    ".....#.....#..........",
    "#####..####..##.......",
    ".....#.#..o#...##.....",
    ".....#..####.....##...",
    "..##...............##.",
    "##...................#",
  ],
];

const SCORP = [
  [
    "##..................##",
    ".##................##.",
    "..##################..",
    "...##..o......o.##....",
    "....##..........##....",
    ".....###......###.....",
    ".......########.......",
    ".......##....##.......",
    ".......##....##.......",
  ],
  [
    ".##................##.",
    "..##..............##..",
    "...################...",
    "...##..o......o.##....",
    "....##..........##....",
    ".....###......###.....",
    ".......########.......",
    ".........##..##.......",
    ".........##..##.......",
  ],
];

const SNAKE = [
  [
    "................####",
    "######........##.o##",
    ".....###....###.####",
    ".......#####........",
  ],
  [
    "####................",
    "..##.o##......######",
    ".####.###....###....",
    "........#####.......",
  ],
];

const RAPTOR = [
  [
    "...............####.",
    "..............##.o##",
    "..............######",
    "..........##########",
    ".........###########",
    "........#####..####.",
    ".......####.....##..",
    "......####......##..",
    ".....###........##..",
    "....###.........##..",
    "...###..........##..",
  ],
  [
    "...............####.",
    "..............##.o##",
    "..............######",
    "..........##########",
    ".........###########",
    "........#####..####.",
    ".......####.........",
    "......####...##.....",
    ".....###.....##.....",
    "....###......##.....",
    "...###.......##.....",
  ],
];

const BAT = [
  [
    "..##........##..",
    ".#..#......#..#.",
    "#....######....#",
    ".##.#.o..o#.##..",
    "...##########...",
    "....##....##....",
  ],
  [
    "....##....##....",
    "...#.#....#.#...",
    "..#..######..#..",
    ".##.#.o..o#.##..",
    "#..##########..#",
    "....##....##....",
  ],
];

const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 97) % 640,
  y: 12 + ((i * 53) % 150),
  s: i % 4 === 0 ? 3 : 2,
}));

const CSS = `
.dino-root { height: 100%; color: #535353; background: #f7f7f7; }
.dino-root, .dino-root * { box-sizing: border-box; }
.dino-root button { font-family: "Press Start 2P", ui-monospace, monospace; cursor: pointer; }
#app { height: 100%; display: flex; flex-direction: column; background: #f7f7f7; user-select: none; -webkit-user-select: none; }
#stage { flex: 1; min-height: 0; position: relative; display: flex; align-items: center; justify-content: center; touch-action: none; overflow: hidden; }
#c { image-rendering: pixelated; image-rendering: crisp-edges; background: #f7f7f7; touch-action: none; }
#overlay { position: absolute; inset: 0; overflow: auto; -webkit-overflow-scrolling: touch; }
#overlay.play { pointer-events: none; }
#overlay.menu { pointer-events: auto; touch-action: pan-y; }
#pad { display: none; gap: 8px; padding: 8px; background: #f7f7f7; border-top: 3px solid #535353; touch-action: none; }
#app[data-mode="play"] #pad, #app[data-mode="pause"] #pad { display: flex; }
#pad button {
  flex: 1; min-height: 56px; min-width: 0;
  background: #f7f7f7; color: #535353;
  border: 3px solid #535353; box-shadow: 4px 4px 0 #535353;
  font-size: 10px; line-height: 1.4; text-transform: uppercase;
}
#pad button.slim { flex: 0 0 64px; font-size: 12px; }
#pad button.fire { background: #e85d04; color: #f7f7f7; }
#pad button.on { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #535353; }
#pad button.dry { background: #9a9a9a; color: #f7f7f7; }
#pad button:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #535353; }
.dino-root button:focus-visible { outline: 3px solid #e85d04; outline-offset: 2px; }
.dash {
  max-width: 1040px; margin: 12px auto 20px; background: #f7f7f7; color: #535353;
  border: 3px solid #535353; padding: 14px;
}
.top { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; }
.brand { display: flex; gap: 12px; align-items: center; min-width: 0; }
.brand h1 { margin: 0; font-size: 18px; line-height: 1.5; font-weight: 400; }
.sub { margin: 6px 0 0; font-size: 8px; line-height: 1.7; max-width: 46ch; }
.statline { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.pill, .card, .btn, .modal {
  font-family: "Press Start 2P", ui-monospace, monospace;
}
.pill, .btn {
  background: #f7f7f7; color: #535353; border: 3px solid #535353;
  min-height: 44px; padding: 10px 12px; font-size: 8px; line-height: 1.5; text-transform: uppercase;
}
.btn.primary { background: #e85d04; color: #f7f7f7; box-shadow: 4px 4px 0 #535353; }
.btn:disabled { opacity: 0.45; box-shadow: none; }
.btn:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #535353; }
.layout { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.cards { display: grid; grid-template-columns: 1fr; gap: 8px; }
.card {
  display: block; width: 100%; text-align: left; background: #f7f7f7; color: #535353;
  border: 3px solid #535353; padding: 10px; font-size: 8px; line-height: 1.55;
}
.card.sel { border-color: #e85d04; box-shadow: 4px 4px 0 #535353; }
.card.lock { background: #fbfbfb; }
.card-top, .card-bot, .row { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.card-name { display: block; margin: 8px 0 6px; font-size: 11px; line-height: 1.45; }
.card-foes { display: block; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.4; letter-spacing: 0; }
.strip { display: block; height: 36px; border: 2px solid #535353; margin-bottom: 8px; position: relative; overflow: hidden; background: #f7f7f7; }
.strip::before { content: ""; position: absolute; left: 10px; top: 8px; width: 10px; height: 10px; background: #535353; }
.strip::after { content: ""; position: absolute; left: 0; right: 0; bottom: 7px; height: 2px; background: #535353; }
.strip[data-biome="dusk"] { background: #f6efe2; }
.strip[data-biome="dusk"]::before { background: #e85d04; }
.strip[data-biome="ash"] { background: #2a2a2a; }
.strip[data-biome="ash"]::before, .strip[data-biome="ash"]::after { background: #f7f7f7; }
.strip[data-biome="ice"] { background: #f3f7f8; }
.strip[data-biome="jungle"] { background: #e7f0e4; }
.strip[data-biome="jungle"]::before { background: #8eae8a; }
.strip[data-biome="night"] { background: #535353; }
.strip[data-biome="night"]::before, .strip[data-biome="night"]::after { background: #f7f7f7; }
.stars { display: inline-flex; gap: 3px; align-items: center; }
.stars svg { display: block; }
.detail { border: 3px solid #535353; padding: 12px; }
.detail h2 { margin: 0 0 8px; font-size: 13px; font-weight: 400; line-height: 1.5; }
.detail p, .detail li { font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.45; letter-spacing: 0; }
.detail p { margin: 0 0 10px; }
.detail ul { margin: 0 0 12px; padding: 0; list-style: none; }
.detail li { margin: 0 0 8px; }
.detail li strong { font-family: "Press Start 2P", ui-monospace, monospace; font-size: 8px; font-weight: 400; display: block; margin-bottom: 3px; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.actions .btn { flex: 1; }
.foot { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: center; }
.help { margin-top: 10px; font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.45; }
.modal-wrap { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { width: min(440px, 100%); background: #f7f7f7; color: #535353; border: 3px solid #535353; box-shadow: 6px 6px 0 #535353; padding: 16px; }
.modal h2 { margin: 8px 0; font-size: 14px; font-weight: 400; line-height: 1.5; }
.modal p { font-family: ui-monospace, monospace; font-size: 14px; line-height: 1.45; margin: 8px 0; }
.modal .actions { margin-top: 12px; }
.bigstars { display: flex; gap: 6px; margin: 8px 0; }
.restart-ico { width: 36px; height: 32px; image-rendering: pixelated; vertical-align: middle; }
@media (min-width: 720px) {
  .cards { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 980px) {
  .layout { flex-direction: row; align-items: flex-start; }
  .cards { flex: 1.45; }
  .detail { flex: 0.9; position: sticky; top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .btn, #pad button { transition: none; }
}
`;

function defaultSave() {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { version: 1, unlocked: 1, selected: 1, sound: true, shake: !reduce, taught: false, levels: {} };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return defaultSave();
    return Object.assign(defaultSave(), parsed, { levels: parsed.levels || {} });
  } catch {
    return defaultSave();
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("sprite " + url));
    img.src = url;
  });
}

function recolorNight(img) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 20) continue;
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    if (lum > 168) {
      d[i] = 83; d[i + 1] = 83; d[i + 2] = 83;
    } else {
      d[i] = 247; d[i + 1] = 247; d[i + 2] = 247;
    }
    d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}

function bake(rows, night, scale = 2) {
  const body = night ? "#f7f7f7" : "#535353";
  const eye = night ? "#535353" : "#f7f7f7";
  const h = rows.length;
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const c = document.createElement("canvas");
  c.width = Math.max(1, w * scale);
  c.height = Math.max(1, h * scale);
  const g = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      g.fillStyle = ch === "o" ? eye : ch === "f" ? "#e85d04" : body;
      g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

function pair(frames, scale = 2) {
  return { day: frames.map((r) => bake(r, false, scale)), night: frames.map((r) => bake(r, true, scale)) };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function measure(str, scale) {
  let w = 0;
  const s = String(str).toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = GLYPH[s[i]] || GLYPH[" "];
    w += (g[0].length + 1) * scale;
  }
  return w;
}

function drawText(ctx, str, x, y, scale, color) {
  ctx.fillStyle = color;
  let cx = x;
  const s = String(str).toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = GLYPH[s[i]] || GLYPH[" "];
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] === "1") ctx.fillRect(cx + c * scale, y + r * scale, scale, scale);
      }
    }
    cx += (g[0].length + 1) * scale;
  }
}

function blob(ctx, cx, cy, r, col) {
  ctx.fillStyle = col;
  const s = 4;
  for (let y = -r; y <= r; y += s) {
    const dx = Math.sqrt(Math.max(0, r * r - y * y));
    ctx.fillRect(cx - dx, cy + y, dx * 2, s);
  }
}

function starSVG(on) {
  const fill = on ? "#e85d04" : "none";
  const stroke = on ? "#e85d04" : "#535353";
  return `<svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><path d="M6 1.1 7.45 4.35h3.45L8.15 6.45l.95 3.35L6 8.05 2.9 9.8l.95-3.35L1.1 4.35h3.45Z" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/></svg>`;
}

function starsHTML(n) {
  return `<span class="stars" aria-label="${n} of 3 stars">${starSVG(n >= 1)}${starSVG(n >= 2)}${starSVG(n >= 3)}</span>`;
}

export function mountDinoLegend(root) {
  let dead = false;
  const ac = new AbortController();
  let raf = 0;
  let ro = null;
  const audio = { ctx: null, master: null, sfx: null, music: null, noise: null };

  root.classList.add("dino-root");
  if (!document.getElementById("dino-style")) {
    const st = document.createElement("style");
    st.id = "dino-style";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  root.innerHTML = `
    <div id="app" data-mode="dash">
      <div id="stage">
        <canvas id="c" width="640" height="360" aria-label="Dino Legend playfield"></canvas>
        <div id="overlay" class="menu"></div>
      </div>
      <div id="pad">
        <button type="button" id="btn-pause" class="slim" aria-label="Pause">II</button>
        <button type="button" id="btn-jump">Jump</button>
        <button type="button" id="btn-duck">Duck</button>
        <button type="button" id="btn-fire" class="fire">Fire</button>
      </div>
    </div>`;

  const app = root.querySelector("#app");
  const stage = root.querySelector("#stage");
  const canvas = root.querySelector("#c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const overlay = root.querySelector("#overlay");
  const btnFire = root.querySelector("#btn-fire");
  const btnJump = root.querySelector("#btn-jump");
  const btnDuck = root.querySelector("#btn-duck");
  const btnPause = root.querySelector("#btn-pause");

  let save = loadSave();
  let art = null;
  let ready = false;
  let mode = "dash";
  let biome = BIOMES.day;
  let level = null;
  let selected = Math.min(6, Math.max(1, save.selected || save.unlocked || 1));
  let sx = 1;
  let sy = 1;
  let dpr = 1;
  let cssW = 640;
  let cssH = 360;
  let last = 0;
  let acc = 0;
  let t = 0;
  let scroll = 0;
  let speed = 380;
  let dist = 0;
  let score = 0;
  let hearts = 5;
  let heat = 100;
  let fireLock = false;
  let phase = "run";
  let intro = 0;
  let spawnCd = 1;
  let showerT = 10;
  let combo = 0;
  let comboT = 0;
  let trauma = 0;
  let flashA = 0;
  let hitstop = 0;
  let boltCd = 0;
  let fireSfx = 0;
  let dustCd = 0;
  let deadT = 0;
  let banner = "";
  let bannerT = 0;
  let stormT = 5;
  let musicT = 0;
  let musicStep = 0;
  let wantJump = false;
  let jumpBuf = 0;
  let jumpCut = false;
  let coyote = 0;
  let runT = 0;
  let keys = { jump: false, duck: false, fire: false };
  let player = groundPlayer();
  let entities = [];
  let particles = [];
  let floaters = [];
  let clouds = [];
  let boss = null;
  let resetArmed = false;

  const sig = { signal: ac.signal };

  function groundPlayer() {
    return {
      x: PX, y: GROUND - 94, vy: 0, onGround: true, duck: false,
      anim: 0, dead: false, iframe: 0, squash: 0,
    };
  }

  function persist() {
    save.selected = selected;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* ignore */ }
  }

  function unlock() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audio.ctx) {
      audio.ctx = new Ctx();
      audio.master = audio.ctx.createGain();
      audio.sfx = audio.ctx.createGain();
      audio.music = audio.ctx.createGain();
      audio.sfx.connect(audio.master);
      audio.music.connect(audio.master);
      audio.master.connect(audio.ctx.destination);
      audio.sfx.gain.value = 0.85;
      audio.music.gain.value = 0.22;
      const len = Math.floor(audio.ctx.sampleRate * 0.4);
      const buf = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      audio.noise = buf;
    }
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    applySound();
  }

  function applySound() {
    if (!audio.master || !audio.ctx) return;
    const v = save.sound ? 1 : 0;
    audio.master.gain.setTargetAtTime(v, audio.ctx.currentTime, 0.02);
  }

  function tone(freq, dur, type, gain, slide) {
    if (!audio.ctx || !save.sound) return;
    const now = audio.ctx.currentTime;
    const o = audio.ctx.createOscillator();
    const g = audio.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(40, freq), now);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g);
    g.connect(audio.sfx);
    o.start(now);
    o.stop(now + dur + 0.02);
  }

  function noise(dur, gain, rate) {
    if (!audio.ctx || !audio.noise || !save.sound) return;
    const now = audio.ctx.currentTime;
    const src = audio.ctx.createBufferSource();
    src.buffer = audio.noise;
    src.playbackRate.value = rate || 1;
    const g = audio.ctx.createGain();
    const filter = audio.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(audio.sfx);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  const sfx = {
    jump: () => tone(420, 0.09, "square", 0.05, 760),
    land: () => noise(0.06, 0.04, 0.6),
    fire: () => { noise(0.09, 0.05, 1.4); tone(180, 0.08, "sawtooth", 0.03, 90); },
    hit: () => { tone(140, 0.16, "square", 0.07, 60); noise(0.12, 0.06, 0.5); },
    explode: () => noise(0.22, 0.08, 0.7),
    die: () => { tone(200, 0.28, "square", 0.07, 50); noise(0.25, 0.07, 0.4); },
    roar: () => tone(90, 0.4, "sawtooth", 0.06, 40),
    win: () => { tone(523, 0.1, "square", 0.05); tone(659, 0.12, "square", 0.05); tone(784, 0.18, "square", 0.05); },
    click: () => tone(660, 0.04, "square", 0.03),
    tick: () => tone(880, 0.03, "square", 0.025),
    thunder: () => noise(0.35, 0.05, 0.35),
  };

  function burst(x, y, color, n, spd, opts = {}) {
    const g = opts.g != null ? opts.g : 500;
    const lifeBase = opts.life || 0.28;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = spd * (0.3 + Math.random() * 0.9);
      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        life: lifeBase + Math.random() * 0.4,
        max: 0.75,
        s: opts.big ? 4 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 4),
        color,
        g,
        kind: opts.kind || "spark",
      });
    }
    if (opts.ring) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        particles.push({
          x, y,
          vx: Math.cos(a) * (spd * 0.55),
          vy: Math.sin(a) * (spd * 0.55) - 10,
          life: 0.35 + Math.random() * 0.2,
          max: 0.55,
          s: 3,
          color: opts.ringColor || color,
          g: 120,
          kind: "ring",
        });
      }
    }
    if (particles.length > 280) particles.splice(0, particles.length - 280);
  }

  function popText(x, y, str) {
    floaters.push({ x, y, str, life: 0.7, max: 0.7 });
    if (floaters.length > 14) floaters.shift();
  }

  function inkOf() {
    if (biome.dc) return biome.dc;
    return biome.night ? "#f7f7f7" : "#535353";
  }

  function spriteSet(pairObj) {
    return biome.night ? pairObj.night : pairObj.day;
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const scale = Math.min(Math.max(rect.width, 2) / W, Math.max(rect.height, 2) / H);
    cssW = Math.max(2, Math.floor(W * scale));
    cssH = Math.max(2, Math.floor(H * scale));
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.max(2, Math.floor(cssW * dpr));
    canvas.height = Math.max(2, Math.floor(cssH * dpr));
    sx = canvas.width / W;
    sy = canvas.height / H;
    stage.style.background = biome.bg;
  }

  function driftClouds(dt) {
    for (const c of clouds) {
      c.x -= speed * 0.25 * dt;
      if (c.x < -90) c.x = W + 30 + Math.random() * 70;
    }
  }

  function seedClouds() {
    clouds = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({ x: 80 + i * 180, y: 28 + (i % 3) * 26, s: 18 + (i % 3) * 8 });
    }
  }

  function requestJump() {
    wantJump = true;
    jumpBuf = 0.12;
  }

  function playerBox() {
    if (player.duck && player.onGround && art) {
      const spr = art.duck.day[0];
      return { x: player.x + 8, y: GROUND - spr.height + 6, w: spr.width - 16, h: spr.height - 10 };
    }
    return { x: player.x + 16, y: player.y + 14, w: 58, h: 74 };
  }

  function mouthPos() {
    if (player.duck && player.onGround && art) {
      const spr = art.duck.day[0];
      return { x: player.x + spr.width - 8, y: GROUND - spr.height + 16 };
    }
    return { x: player.x + 76, y: player.y + 30 };
  }

  function make(o) {
    o.alive = o.alive !== false;
    o.age = 0;
    entities.push(o);
    return o;
  }

  function furthestX() {
    let m = -9999;
    for (const e of entities) {
      if (!e.alive || e.screen || e.kind === "bolt" || e.kind === "proj") continue;
      if (e.x > m) m = e.x;
    }
    return m;
  }

  function spawnCactus() {
    const large = Math.random() < 0.62;
    const fw = large ? 50 : 34;
    const fh = large ? 100 : 70;
    const count = large ? (speed > 560 && Math.random() < 0.22 ? 3 : Math.random() < 0.4 ? 2 : 1) : Math.random() < 0.45 ? 2 : 1;
    const step = large ? 36 : 24;
    const variant = Math.floor(Math.random() * 6);
    make({
      kind: "cactus", x: W + 8, y: GROUND - fh, w: step * (count - 1) + fw - 6, h: fh,
      hp: 1, hittable: true, hurts: true, large, count, variant, step, fw, fh,
    });
  }

  function spawnPtero() {
    const spr = art.ptero.day[0];
    const low = Math.random() < 0.58;
    const y = low ? GROUND - 86 : GROUND - 168;
    make({
      kind: "ptero", x: W + 12, y, baseY: y, w: spr.width, h: spr.height,
      hp: 1, hittable: true, hurts: true, extra: 36, ph: Math.random() * 6, alt: low ? "low" : "high",
    });
  }

  function spawnScorp() {
    const spr = art.scorp.day[0];
    make({
      kind: "scorp", x: W + 8, y: GROUND - spr.height, w: spr.width, h: spr.height,
      hp: 2, hittable: true, hurts: true, extra: 130,
    });
  }

  function spawnSnake() {
    const spr = art.snake.day[0];
    make({
      kind: "snake", x: W + 8, y: GROUND - spr.height, w: spr.width, h: spr.height,
      hp: 1, hittable: true, hurts: true, extra: 80,
    });
  }

  function spawnBat() {
    const spr = art.bat.day[0];
    const low = Math.random() < 0.5;
    const y = low ? GROUND - 96 : 64 + Math.random() * 36;
    make({
      kind: "bat", x: W + 10, y, baseY: y, w: spr.width, h: spr.height,
      hp: 1, hittable: true, hurts: true, extra: 50, ph: Math.random() * 6,
    });
  }

  function spawnGolem() {
    make({
      kind: "golem", x: W + 16, y: GROUND - 96, w: 72, h: 96,
      hp: 8, hittable: true, hurts: true, extra: -30,
    });
  }

  function spawnRaptor() {
    const spr = art.raptor.day[0];
    make({
      kind: "raptor", x: W + 20, y: GROUND - spr.height, w: spr.width, h: spr.height,
      hp: 2, hittable: true, hurts: true, extra: 20, warned: false, warn: 0, dash: 0,
    });
  }

  function spawnVine() {
    const bottom = GROUND - 52;
    make({
      kind: "vine", x: W + 12, y: 8, w: 18, h: bottom - 8,
      hp: 1, hittable: true, hurts: true,
    });
  }

  function spawnBoulder() {
    make({
      kind: "boulder", x: W + 10, y: GROUND - 52, w: 52, h: 52,
      hp: 3, hittable: true, hurts: true, extra: 46, spin: Math.random() * 6,
    });
  }

  function spawnMeteor(landX) {
    const vy = 250;
    const startY = -30;
    const fall = (GROUND - 16 - startY) / vy;
    const x0 = landX + speed * fall;
    make({
      kind: "meteor", x: x0, y: startY, w: 28, h: 28, vy, hp: 2,
      hittable: true, hurts: true, landX,
    });
  }

  function meteorLandX() {
    const min = PX + Math.max(200, speed * 0.78);
    const max = W - 36;
    if (min >= max) return max;
    return min + Math.random() * (max - min);
  }

  function spawnKind(kind) {
    if (kind === "cactus") spawnCactus();
    else if (kind === "ptero") spawnPtero();
    else if (kind === "scorp") spawnScorp();
    else if (kind === "snake") spawnSnake();
    else if (kind === "bat") spawnBat();
    else if (kind === "golem") spawnGolem();
    else if (kind === "raptor") spawnRaptor();
    else if (kind === "vine") spawnVine();
    else if (kind === "boulder") spawnBoulder();
    else if (kind === "meteor") spawnMeteor(meteorLandX());
  }

  function pickSpawn() {
    const prog = level ? dist / level.length : 0;
    const pool = (level?.spawns || []).filter((s) => (s.from || 0) <= prog);
    let sum = 0;
    for (const s of pool) sum += s.w;
    let r = Math.random() * sum;
    for (const s of pool) {
      r -= s.w;
      if (r <= 0) return s.t;
    }
    return pool[0]?.t || "cactus";
  }

  function spawnShock(visual) {
    const y = visual === "swipe" ? GROUND - 108 : GROUND - 32;
    const h = visual === "swipe" ? 42 : 32;
    make({
      kind: "proj", visual, screen: true, x: (boss?.x || W) - 10, y, w: visual === "swipe" ? 70 : 46, h,
      vx: visual === "swipe" ? -520 : -430, hp: 1, hittable: true, hurts: true, delay: 0,
    });
  }

  function spawnOrbs() {
    const rows = [
      { y: GROUND - 34, h: 26, delay: 0 },
      { y: GROUND - 82, h: 22, delay: 0.4 },
      { y: GROUND - 156, h: 22, delay: 0.8 },
    ];
    for (const row of rows) {
      make({
        kind: "proj", visual: "orb", screen: true, x: (boss?.x || W) - 20, y: row.y, w: 22, h: row.h,
        vx: -360, hp: 1, hittable: true, hurts: true, delay: row.delay,
      });
    }
  }

  function spawnJaw() {
    make({
      kind: "proj", visual: "jaw", screen: true, x: (boss?.x || W) - 8, y: GROUND - 36, w: 64, h: 36,
      vx: -560, hp: 2, hittable: true, hurts: true, delay: 0,
    });
  }

  function doAttack(name) {
    if (!boss || boss.dead) return;
    if (name === "slam") spawnShock("shock");
    else if (name === "swipe") spawnShock("swipe");
    else if (name === "orbs") spawnOrbs();
    else if (name === "jaw") spawnJaw();
    else if (name === "meteors") {
      spawnMeteor(PX + Math.max(210, speed * 0.7));
      const gap = Math.max(220, speed * 0.9);
      const x2 = PX + Math.max(210, speed * 0.7) + gap;
      if (x2 < W + 40) spawnMeteor(x2);
    } else if (name === "laser") {
      boss.beam = 0.16;
    } else if (name === "summon") {
      spawnCactus();
      if (entities.length) {
        const c = entities[entities.length - 1];
        c.x = 280;
      }
      spawnCactus();
      if (entities.length) {
        const c = entities[entities.length - 1];
        c.x = 460;
      }
    }
    sfx.tick();
  }

  function beginBoss() {
    phase = "boss";
    const type = level.boss;
    const tall = type === "tyrant";
    boss = {
      type,
      name: BOSS_META[type].name,
      x: W + 30,
      y: GROUND - (tall ? 178 : 112),
      w: tall ? 168 : 150,
      h: tall ? 178 : 112,
      hp: tall ? 86 : 58,
      max: tall ? 86 : 58,
      entered: false,
      dead: false,
      dieT: 0,
      si: 0,
      wait: 0.55,
      tell: "",
      beam: 0,
      flash: 0,
      hurtCd: 0,
      anim: 0,
      enraged: false,
      aura: 0,
      slamFx: 0,
      charge: 0,
      pulse: 0,
    };
    entities = [];
    banner = boss.name;
    bannerT = 1.8;
    sfx.roar();
    trauma = Math.min(1, trauma + 0.55);
    flashA = Math.max(flashA, 0.35);
    burst(W - 40, GROUND - 80, "#e85d04", 22, 220, { big: true, ring: true });
    for (let i = 0; i < 8; i++) {
      burst(W - 20 - i * 18, GROUND - 30 - Math.random() * 40, type === "cinder" ? "#e85d04" : inkOf(), 4, 90);
    }
  }

  function killBoss() {
    if (!boss || boss.dead) return;
    boss.dead = true;
    boss.dieT = 1.65;
    boss.tell = "";
    boss.beam = 0;
    boss.slamFx = 0;
    score += 1000;
    popText(boss.x + boss.w * 0.3, boss.y - 10, "+1000");
    burst(boss.x + boss.w * 0.4, boss.y + 40, "#e85d04", 36, 320, { big: true, ring: true, life: 0.5 });
    burst(boss.x + boss.w * 0.55, boss.y + 20, "#f7f7f7", 18, 200, { g: 200 });
    sfx.explode();
    trauma = 1;
    hitstop = 0.16;
    flashA = 0.42;
  }

  function hurt() {
    if (player.dead || player.iframe > 0 || intro > 0) return;
    hearts -= 1;
    player.iframe = 1.2;
    trauma = Math.min(1, trauma + 0.62);
    hitstop = 0.08;
    flashA = 0.18;
    sfx.hit();
    combo = 0;
    if (hearts <= 0) {
      player.dead = true;
      player.duck = false;
      deadT = 0.95;
      sfx.die();
      burst(player.x + 40, player.y + 30, inkOf(), 18, 200);
    }
  }

  function damageEnt(e) {
    if (!e.alive || !e.hittable || (e.delay && e.delay > 0)) return;
    e.hp -= 1;
    e.flash = 0.08;
    burst(e.x + e.w / 2, e.y + e.h / 2, "#e85d04", 4, 80);
    if (e.hp > 0) {
      sfx.tick();
      return;
    }
    e.alive = false;
    const base = PTS[e.kind] || 10;
    const pts = Math.round(base * Math.min(3, 1 + combo * 0.25));
    score += pts;
    combo += 1;
    comboT = 1.65;
    popText(e.x, e.y - 6, "+" + pts);
    burst(e.x + e.w / 2, e.y + e.h / 2, e.kind === "meteor" || e.kind === "proj" ? "#e85d04" : inkOf(), 12, 170);
    sfx.explode();
    trauma = Math.min(1, trauma + (e.kind === "golem" ? 0.4 : 0.22));
    hitstop = e.kind === "golem" ? 0.05 : 0.03;
    if (e.kind === "meteor") {
      /* destroyed in the air: no crater */
    }
  }

  function physics(dt) {
    if (!player.dead && wantJump && (player.onGround || coyote > 0)) {
      player.duck = false;
      player.vy = JUMP_V;
      player.onGround = false;
      coyote = 0;
      wantJump = false;
      jumpCut = false;
      sfx.jump();
    } else if (wantJump) {
      jumpBuf -= dt;
      if (jumpBuf <= 0) wantJump = false;
    }
    if (!keys.jump && player.vy < 0 && !jumpCut) {
      const risen = GROUND - 94 - player.y;
      if (risen > 52) {
        player.vy *= 0.5;
        jumpCut = true;
      }
    }
    let g = GRAV;
    if (keys.duck && !player.onGround && !player.dead && player.vy > 40) g *= 2.2;
    if (!player.dead) player.vy = Math.min(MAX_FALL, player.vy + g * dt);
    else player.vy = Math.min(MAX_FALL, player.vy + GRAV * dt);
    const before = player.onGround;
    player.y += player.vy * dt;
    if (player.y >= GROUND - 94) {
      if (!before && player.vy > 240) {
        sfx.land();
        player.squash = 0.12;
        burst(player.x + 20, GROUND - 4, inkOf(), 6, 80);
      }
      player.y = GROUND - 94;
      player.vy = 0;
      player.onGround = true;
      coyote = 0.1;
      jumpCut = false;
    } else {
      player.onGround = false;
      coyote -= dt;
    }
    if (!player.dead && player.onGround && keys.duck) player.duck = true;
    else player.duck = false;
    if (player.iframe > 0) player.iframe -= dt;
    if (player.squash > 0) player.squash -= dt;
  }

  function updateBoss(dt) {
    if (!boss) return;
    boss.anim += dt;
    boss.flash = Math.max(0, boss.flash - dt);
    boss.hurtCd = Math.max(0, boss.hurtCd - dt);
    boss.slamFx = Math.max(0, (boss.slamFx || 0) - dt);
    boss.charge = Math.max(0, (boss.charge || 0) - dt);
    boss.pulse = (boss.pulse || 0) + dt;
    if (boss.beam > 0) boss.beam -= dt;
    if (boss.dead) {
      boss.dieT -= dt;
      if (Math.floor(boss.dieT * 14) % 2 === 0) {
        burst(boss.x + Math.random() * boss.w, boss.y + Math.random() * 60, "#e85d04", 5, 180, { big: true });
        if (Math.random() < 0.4) burst(boss.x + Math.random() * boss.w, boss.y + 20, "#f7f7f7", 3, 120);
      }
      if (boss.dieT <= 0) win();
      return;
    }
    // Enrage at half health
    if (!boss.enraged && boss.hp <= boss.max * 0.5) {
      boss.enraged = true;
      boss.si = 0;
      boss.wait = 0.35;
      boss.tell = "";
      banner = "ENRAGED";
      bannerT = 1.2;
      trauma = Math.min(1, trauma + 0.45);
      flashA = Math.max(flashA, 0.3);
      burst(boss.x + boss.w * 0.4, boss.y + 30, "#e85d04", 24, 260, { ring: true, big: true });
      sfx.roar();
    }
    boss.aura = boss.enraged ? 0.7 + Math.sin(boss.anim * 8) * 0.3 : 0.25 + Math.sin(boss.anim * 3) * 0.1;

    const home = W - boss.w - 18;
    if (!boss.entered) {
      boss.x += (home - boss.x) * (1 - Math.exp(-3.6 * dt));
      if (Math.abs(boss.x - home) < 2) {
        boss.x = home;
        boss.entered = true;
        boss.wait = 0.5;
        trauma = Math.min(1, trauma + 0.25);
      }
      return;
    }
    // Subtle breathing / threat sway
    const sway = Math.sin(boss.anim * (boss.enraged ? 4.2 : 2.4)) * (boss.enraged ? 3.5 : 1.8);
    boss.x += (home + sway - boss.x) * (1 - Math.exp(-7 * dt));
    if (boss.beam > 0) {
      const beam = { x: 0, y: GROUND - 74, w: boss.x + 36, h: 16 };
      if (overlap(playerBox(), beam)) hurt();
    }
    // Ambient boss particles
    if (Math.random() < (boss.enraged ? 0.45 : 0.18)) {
      const col = boss.type === "cinder" ? "#e85d04" : (biome.night ? "#f7f7f7" : "#535353");
      particles.push({
        x: boss.x + 20 + Math.random() * (boss.w - 40),
        y: boss.y + 10 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 40,
        vy: -30 - Math.random() * 50,
        life: 0.4 + Math.random() * 0.35,
        max: 0.7,
        s: 2 + Math.floor(Math.random() * 3),
        color: col,
        g: 80,
        kind: "ember",
      });
    }
    boss.wait -= dt;
    if (boss.wait > 0) {
      if (boss.tell === "laser") boss.charge = Math.max(boss.charge, 0.15);
      return;
    }
    const key = boss.enraged ? boss.type + "_enrage" : boss.type;
    const script = SCRIPTS[key] || SCRIPTS[boss.type];
    const step = script[boss.si % script.length];
    boss.si += 1;
    const fast = boss.enraged ? 0.72 : 1;
    if (step[0] === "wait") {
      boss.tell = "";
      boss.wait = step[1] * fast;
    } else if (step[0] === "tell") {
      boss.tell = step[1];
      boss.wait = step[2] * fast;
      if (step[1] === "laser") boss.charge = step[2] * fast;
      if (step[1] === "slam") boss.slamFx = 0;
    } else {
      boss.tell = "";
      doAttack(step[0]);
      if (step[0] === "slam") {
        boss.slamFx = 0.45;
        trauma = Math.min(1, trauma + (boss.enraged ? 0.35 : 0.22));
        burst(boss.x + 10, GROUND - 8, "#e85d04", 10, 140, { ring: true });
      }
      boss.wait = boss.enraged ? 0.12 : 0.16;
    }
  }

  function update(dt) {
    t += dt;
    trauma = Math.max(0, trauma - dt * 1.35);
    flashA = Math.max(0, flashA - dt * 1.8);
    bannerT = Math.max(0, bannerT - dt);
    if (comboT > 0) {
      comboT -= dt;
      if (comboT <= 0) combo = 0;
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += (p.g || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      floaters[i].y -= 28 * dt;
      floaters[i].life -= dt;
      if (floaters[i].life <= 0) floaters.splice(i, 1);
    }
    updateMusic(dt);

    if (mode === "dash") {
      updateDemo(dt);
      return;
    }
    if (mode !== "play") return;
    if (hitstop > 0) {
      hitstop -= dt;
      return;
    }

    if (player.dead) {
      physics(dt);
      speed = Math.max(0, speed - 1100 * dt);
      scroll += speed * dt;
      driftClouds(dt);
      for (const e of entities) {
        if (!e.screen) e.x -= speed * dt;
      }
      deadT -= dt;
      if (deadT <= 0) gameOver();
      return;
    }

    if (intro > 0) {
      intro -= dt;
      const u = 1 - Math.max(0, intro) / 0.65;
      player.x = -100 + (PX + 100) * Math.min(1, u);
    } else player.x = PX;

    physics(dt);

    if (phase === "boss") speed += (250 - speed) * Math.min(1, dt * 2);
    else if (level) {
      const u = Math.min(1, dist / level.length);
      speed = level.speed[0] + (level.speed[1] - level.speed[0]) * u;
    }
    scroll += speed * dt;
    driftClouds(dt);

    const breathing = keys.fire && !fireLock && heat > 0 && intro <= 0;
    if (breathing) {
      heat -= 48 * dt;
      if (heat <= 0) {
        heat = 0;
        fireLock = true;
      }
      fireSfx -= dt;
      if (fireSfx <= 0) {
        fireSfx = 0.11;
        sfx.fire();
      }
      boltCd -= dt;
      if (boltCd <= 0) {
        boltCd = 0.065;
        const m = mouthPos();
        entities.push({
          kind: "bolt", screen: true, alive: true, x: m.x, y: m.y - 7, w: 24, h: 14,
          vx: 680, life: 0.85, hittable: false, hurts: false, touched: [], bossHit: false,
        });
        burst(m.x, m.y, "#e85d04", 3, 55, { g: 200 });
        if (Math.random() < 0.4) burst(m.x - 6, m.y + 4, "#f7f7f7", 1, 30, { g: 100 });
      }
    } else {
      boltCd = 0;
      heat = Math.min(100, heat + 22 * dt);
    }

    if (player.onGround && !player.duck) {
      dustCd -= dt;
      if (dustCd <= 0) {
        dustCd = 0.07;
        particles.push({
          x: player.x + 8, y: GROUND - 3, vx: -50 - Math.random() * 90, vy: -20 - Math.random() * 40,
          life: 0.28, max: 0.28, s: 3, color: inkOf(), g: 0,
        });
      }
    }

    for (const e of entities) {
      if (!e.alive) continue;
      e.age += dt;
      if (e.flash) e.flash = Math.max(0, e.flash - dt);
      if (e.delay > 0) {
        e.delay -= dt;
        continue;
      }
      if (e.life != null && e.kind !== "meteor") {
        e.life -= dt;
        if (e.life <= 0) e.alive = false;
      }
      if (e.screen) {
        e.x += (e.vx || 0) * dt;
        e.y += (e.vy || 0) * dt;
      } else {
        if (e.kind === "raptor") {
          if (!e.warned && e.x < W - 30) {
            e.warned = true;
            e.warn = 0.28;
            e.extra = 0;
          }
          if (e.warn > 0) {
            e.warn -= dt;
            if (e.warn <= 0) {
              e.extra = 300;
              e.dash = 0.38;
            }
          }
          if (e.dash > 0) {
            e.dash -= dt;
            if (e.dash <= 0) e.extra = 24;
          }
        }
        e.x -= (speed + (e.extra || 0)) * dt;
        if (e.vy && e.kind === "meteor") e.y += e.vy * dt;
        if (e.kind === "ptero" || e.kind === "bat") {
          e.y = e.baseY + Math.sin(t * 3.2 + e.ph) * (e.kind === "bat" ? 12 : 7);
        }
      }
      if (e.kind === "meteor" && e.y + e.h >= GROUND - 2) {
        e.alive = false;
        let cx = e.x;
        if (cx < player.x + 130) cx = player.x + Math.max(170, speed * 0.45);
        make({
          kind: "crater", x: cx, y: GROUND - 24, w: 50, h: 24, hp: 1,
          hittable: true, hurts: true, life: 2.8,
        });
        burst(cx + 16, GROUND - 8, "#e85d04", 14, 160);
        trauma = Math.min(1, trauma + 0.25);
        sfx.explode();
      }
      if (e.x + e.w < -90) e.alive = false;
      if (e.screen && e.kind === "bolt" && e.x > W + 20) e.alive = false;
      if (e.screen && e.kind === "proj" && e.x + e.w < -20) e.alive = false;
    }

    const box = playerBox();
    for (const e of entities) {
      if (!e.alive || !e.hurts || (e.delay && e.delay > 0)) continue;
      if (overlap(box, e)) hurt();
    }

    if (boss && boss.entered && !boss.dead) {
      const body = { x: boss.x + 8, y: boss.y + 16, w: boss.w - 16, h: boss.h - 16 };
      if (overlap(box, body)) hurt();
    }

    for (const b of entities) {
      if (!b.alive || b.kind !== "bolt") continue;
      if (!b.touched) b.touched = [];
      for (const e of entities) {
        if (e === b || !e.alive || !e.hittable || (e.delay && e.delay > 0)) continue;
        if (b.touched.indexOf(e) !== -1) continue;
        if (overlap(b, e)) {
          b.touched.push(e);
          damageEnt(e);
        }
      }
      if (boss && boss.entered && !boss.dead && !b.bossHit && boss.hurtCd <= 0) {
        const body = { x: boss.x + 16, y: boss.y + 18, w: boss.w - 28, h: boss.h - 24 };
        if (overlap(b, body)) {
          b.bossHit = true;
          boss.hp -= 1;
          boss.hurtCd = 0.11;
          boss.flash = 0.07;
          trauma = Math.min(1, trauma + 0.12);
          burst(b.x, b.y, "#e85d04", 3, 70);
          sfx.tick();
          if (boss.hp <= 0) killBoss();
        }
      }
    }

    if (intro <= 0 && !player.dead && phase === "run" && level) {
      runT += dt;
      dist += speed * dt;
      score += speed * dt * 0.05;
      if (dist >= level.length) {
        if (level.boss) beginBoss();
        else win();
      }
      spawnCd -= dt;
      if (spawnCd <= 0) {
        if (furthestX() > W - 170) spawnCd = 0.22;
        else {
          spawnKind(pickSpawn());
          const base = 0.92 + Math.random() * 0.38;
          spawnCd = Math.max(0.7, base * (0.82 + 420 / Math.max(280, speed)));
        }
      }
      if (level.shower) {
        showerT -= dt;
        if (showerT <= 0) {
          showerT = level.shower;
          spawnMeteor(PX + Math.max(210, speed * 0.72));
          const x2 = PX + Math.max(210, speed * 0.72) + Math.max(230, speed * 0.95);
          if (x2 < W + 80) spawnMeteor(x2);
        }
      }
    }

    if (phase === "boss") updateBoss(dt);

    if (biome.storm && mode === "play") {
      stormT -= dt;
      if (stormT <= 0) {
        stormT = 7 + Math.random() * 6;
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) flashA = Math.max(flashA, 0.2);
        sfx.thunder();
      }
    }

    if (level && level.id === 1 && runT > 8 && !save.taught) {
      save.taught = true;
      persist();
    }

    entities = entities.filter((e) => e.alive);
    btnFire.classList.toggle("on", breathing);
    btnFire.classList.toggle("dry", heat <= 0);
    btnJump.classList.toggle("on", keys.jump);
    btnDuck.classList.toggle("on", keys.duck);
  }

  function updateDemo(dt) {
    speed = 280;
    scroll += speed * dt;
    player.x = PX;
    player.y = GROUND - 94;
    player.onGround = true;
    player.dead = false;
    player.duck = false;
    player.anim += dt;
    spawnCd -= dt;
    if (spawnCd <= 0) {
      spawnCd = 1.6 + Math.random();
      if (art) spawnCactus();
    }
    for (const e of entities) e.x -= speed * dt;
    entities = entities.filter((e) => e.x + e.w > -40);
    for (const c of clouds) {
      c.x -= speed * 0.25 * dt;
      if (c.x < -80) c.x = W + 40;
    }
  }

  function updateMusic(dt) {
    if (!audio.ctx || !save.sound || mode === "pause") return;
    musicT -= dt;
    if (musicT > 0) return;
    musicT = phase === "boss" ? 0.2 : 0.3;
    const scales = {
      day: [262, 311, 349, 392, 466],
      dusk: [220, 262, 311, 349, 415],
      ash: [196, 233, 262, 311, 370],
      ice: [294, 349, 392, 466, 523],
      jungle: [247, 294, 330, 392, 440],
      night: [174, 220, 262, 311, 349],
    };
    const key = mode === "dash" || !level ? "day" : level.biome;
    const scale = scales[key] || scales.day;
    const pat = [0, 2, 4, 2, 1, 3, 4, 1];
    const idx = pat[musicStep % pat.length];
    musicStep += 1;
    if (musicStep % 8 === 0) tone(scale[0] / 2, 0.18, "square", 0.018);
    else if (musicStep % 4 !== 3) tone(scale[idx], 0.12, "square", 0.016);
  }

  function calcStars() {
    let s = 1;
    if (score >= level.par) s = 2;
    if (score >= level.par && hearts >= 4) s = 3;
    return s;
  }

  function record(cleared) {
    if (!level) return 0;
    const id = String(level.id);
    const prev = save.levels[id] || { best: 0, stars: 0 };
    const stars = cleared ? calcStars() : 0;
    prev.best = Math.max(prev.best || 0, Math.floor(score));
    if (cleared) prev.stars = Math.max(prev.stars || 0, stars);
    save.levels[id] = prev;
    if (cleared) save.unlocked = Math.max(save.unlocked, Math.min(6, level.id + 1));
    persist();
    return cleared ? stars : prev.stars || 0;
  }

  function win() {
    if (mode !== "play") return;
    mode = "clear";
    const stars = record(true);
    app.dataset.mode = mode;
    sfx.win();
    renderOverlay(stars);
  }

  function gameOver() {
    if (mode !== "play") return;
    mode = "over";
    record(false);
    app.dataset.mode = mode;
    renderOverlay(0);
  }

  function resetSim() {
    entities = [];
    particles = [];
    floaters = [];
    player = groundPlayer();
    player.x = -100;
    hearts = 5;
    heat = 100;
    fireLock = false;
    score = 0;
    dist = 0;
    combo = 0;
    comboT = 0;
    phase = "run";
    intro = 0.65;
    spawnCd = 0.85;
    showerT = 9;
    boss = null;
    banner = level ? level.name : "";
    bannerT = 1.35;
    deadT = 0;
    hitstop = 0;
    coyote = 0.1;
    wantJump = false;
    jumpCut = false;
    runT = 0;
    speed = level ? level.speed[0] : 380;
    seedClouds();
  }

  function startLevel(id) {
    const L = LEVELS[id - 1];
    if (!L || id > save.unlocked) return;
    unlock();
    level = L;
    biome = BIOMES[L.biome];
    selected = id;
    save.selected = id;
    persist();
    resetSim();
    mode = "play";
    app.dataset.mode = "play";
    stage.style.background = biome.bg;
    renderOverlay(0);
    sfx.click();
  }

  function enterDash() {
    mode = "dash";
    biome = BIOMES.day;
    phase = "run";
    boss = null;
    player.dead = false;
    app.dataset.mode = "dash";
    stage.style.background = biome.bg;
    entities = [];
    particles = [];
    seedClouds();
    spawnCd = 0.4;
    renderOverlay(0);
  }

  function togglePause() {
    if (player.dead) return;
    if (mode === "play") mode = "pause";
    else if (mode === "pause") mode = "play";
    else return;
    app.dataset.mode = mode;
    renderOverlay(0);
  }

  function padScore(n) {
    return String(Math.max(0, Math.floor(n))).padStart(5, "0");
  }

  function renderOverlay(earned) {
    if (!overlay) return;
    if (mode === "play") {
      overlay.className = "play";
      overlay.innerHTML = "";
      return;
    }
    overlay.className = "menu";
    if (mode === "dash") overlay.innerHTML = dashHTML();
    else if (mode === "pause") {
      overlay.innerHTML = modalHTML("Paused", level ? level.name : "Dino Legend", `
        <p>The road is holding its breath.</p>
        <div class="actions">
          <button type="button" class="btn primary" data-act="resume">Resume</button>
          <button type="button" class="btn" data-act="map">Dashboard</button>
        </div>`);
    } else if (mode === "over") {
      const best = (save.levels[String(level.id)] || {}).best || 0;
      overlay.innerHTML = modalHTML("Crashed", level.name, `
        <p>Score ${padScore(score)} &nbsp; Best ${padScore(best)}</p>
        <div class="actions">
          <button type="button" class="btn primary" data-act="retry"><img class="restart-ico" alt="" src="/sprites/2x-restart.png"/> Retry</button>
          <button type="button" class="btn" data-act="map">Dashboard</button>
        </div>`);
    } else if (mode === "clear") {
      const stars = earned || (save.levels[String(level.id)] || {}).stars || 1;
      const next = level.id < 6;
      overlay.innerHTML = modalHTML("Mile clear", level.name, `
        <div class="bigstars">${starSVG(stars >= 1)}${starSVG(stars >= 2)}${starSVG(stars >= 3)}</div>
        <p>Score ${padScore(score)}. ${stars >= 3 ? "Clean run." : stars === 2 ? "Par beaten." : "Clear it hotter for more stars."}</p>
        ${level.id === 6 ? "<p>The eclipse breaks. Expedition complete.</p>" : ""}
        <div class="actions">
          ${next ? `<button type="button" class="btn primary" data-act="next">Next mile</button>` : `<button type="button" class="btn primary" data-act="map">Dashboard</button>`}
          <button type="button" class="btn" data-act="retry">Retry</button>
          ${next ? `<button type="button" class="btn" data-act="map">Dashboard</button>` : ""}
        </div>`);
    }
  }

  function modalHTML(kicker, title, body) {
    return `<div class="modal-wrap"><div class="modal" role="dialog" aria-label="${title}">
      <div class="card-top"><span>${kicker}</span></div>
      <h2>${title}</h2>
      ${body}
    </div></div>`;
  }

  function dashHTML() {
    const cleared = LEVELS.filter((L) => (save.levels[String(L.id)] || {}).stars > 0).length;
    let starSum = 0;
    let scoreSum = 0;
    for (const L of LEVELS) {
      const rec = save.levels[String(L.id)] || {};
      starSum += rec.stars || 0;
      scoreSum += rec.best || 0;
    }
    const L = LEVELS[selected - 1];
    const locked = L.id > save.unlocked;
    const rec = save.levels[String(L.id)] || { best: 0, stars: 0 };
    const cards = LEVELS.map((lv) => {
      const r = save.levels[String(lv.id)] || { best: 0, stars: 0 };
      const isLock = lv.id > save.unlocked;
      const foe = lv.foes.map((f) => f[0]).slice(0, 3).join(" · ");
      return `<button type="button" class="card ${lv.id === selected ? "sel" : ""} ${isLock ? "lock" : ""}" data-act="select" data-id="${lv.id}">
        <span class="strip" data-biome="${lv.biome}"></span>
        <span class="card-top"><span>${String(lv.id).padStart(2, "0")}</span><span>${lv.tag}${lv.boss ? " · Boss" : ""}</span></span>
        <span class="card-name">${lv.name}</span>
        <span class="card-foes">${foe}</span>
        <span class="card-bot"><span>${starsHTML(r.stars || 0)}</span><span>${isLock ? "Locked" : "Best " + padScore(r.best || 0)}</span></span>
      </button>`;
    }).join("");
    const foeItems = L.foes.map((f) => `<li><strong>${f[0]}</strong>${f[1]}</li>`).join("");
    return `<div class="dash">
      <div class="top">
        <div class="brand">
          <canvas id="logo" width="88" height="94" aria-hidden="true"></canvas>
          <div>
            <h1>DINO LEGEND</h1>
            <p class="sub">The offline runner, evolved. Same dinosaur. Six miles. Fire in the teeth.</p>
          </div>
        </div>
        <div class="statline">
          <span class="pill">${starSum}/18 stars</span>
          <span class="pill">${cleared}/6 clear</span>
          <span class="pill">Total ${padScore(scoreSum)}</span>
        </div>
      </div>
      <div class="layout">
        <div class="cards">${cards}</div>
        <aside class="detail">
          <div class="card-top"><span>Mile ${String(L.id).padStart(2, "0")}</span><span>${L.tag}</span></div>
          <h2>${L.name}</h2>
          <p>${L.blurb}</p>
          <ul>${foeItems}</ul>
          <p>${starsHTML(rec.stars || 0)} &nbsp; Best ${padScore(rec.best || 0)} &nbsp; Par ${padScore(L.par)}</p>
          <div class="actions">
            <button type="button" class="btn primary" data-act="play" ${locked ? "disabled" : ""}>${locked ? "Locked" : "Run level"}</button>
          </div>
          ${locked ? `<p>Clear the previous mile to unlock this one. The roster above is what is waiting.</p>` : ""}
        </aside>
      </div>
      <p class="help">Keyboard: Space or Up jumps, Down ducks, F or J breathes fire, P pauses. Tap the desert or the buttons. Stars: clear the mile, beat par, and finish with at least four hearts.</p>
      <div class="foot">
        <button type="button" class="pill" id="btn-sound" data-act="sound">${save.sound ? "Sound on" : "Sound off"}</button>
        <button type="button" class="pill" id="btn-shake" data-act="shake">${save.shake ? "Shake on" : "Shake off"}</button>
        <button type="button" class="pill" data-act="reset">${resetArmed ? "Confirm reset" : "Reset records"}</button>
      </div>
    </div>`;
  }

  function paintLogo() {
    const logo = root.querySelector("#logo");
    if (!logo || !art) return;
    const g = logo.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, 88, 94);
    const frame = Math.floor(t * 10) % 2 === 0 ? 2 : 3;
    g.drawImage(art.trex, frame * 88, 0, 88, 94, 0, 0, 88, 94);
  }

  function onOverlayClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn || btn.disabled) return;
    unlock();
    const act = btn.dataset.act;
    if (act === "select") {
      selected = Number(btn.dataset.id);
      save.selected = selected;
      resetArmed = false;
      persist();
      sfx.click();
      renderOverlay(0);
      return;
    }
    if (act === "play") startLevel(selected);
    else if (act === "retry" && level) startLevel(level.id);
    else if (act === "next" && level) startLevel(Math.min(6, level.id + 1));
    else if (act === "map") {
      record(false);
      enterDash();
    } else if (act === "resume") togglePause();
    else if (act === "sound") {
      save.sound = !save.sound;
      persist();
      applySound();
      sfx.click();
      const b = root.querySelector("#btn-sound");
      if (b) b.textContent = save.sound ? "Sound on" : "Sound off";
    } else if (act === "shake") {
      save.shake = !save.shake;
      persist();
      const b = root.querySelector("#btn-shake");
      if (b) b.textContent = save.shake ? "Shake on" : "Shake off";
    } else if (act === "reset") {
      if (!resetArmed) {
        resetArmed = true;
        btn.textContent = "Confirm reset";
        return;
      }
      save = defaultSave();
      selected = 1;
      persist();
      resetArmed = false;
      renderOverlay(0);
    }
  }

  function roleOf(code) {
    if (code === "Space" || code === "ArrowUp" || code === "KeyW") return "jump";
    if (code === "ArrowDown" || code === "KeyS" || code === "ControlLeft" || code === "ControlRight") return "duck";
    if (code === "KeyF" || code === "KeyJ" || code === "KeyK") return "fire";
    if (code === "KeyP" || code === "Escape") return "pause";
    if (code === "Enter") return "confirm";
    return "";
  }

  function onKeyDown(e) {
    const role = roleOf(e.code);
    if (role === "jump" || role === "duck" || e.code === "ArrowLeft" || e.code === "ArrowRight") e.preventDefault();
    if (e.repeat && role === "jump") return;
    unlock();
    if (role === "jump") {
      keys.jump = true;
      if (mode === "play") requestJump();
      else if (mode === "dash") startLevel(selected);
      else if (mode === "pause") togglePause();
      else if (mode === "over" && level) startLevel(level.id);
      else if (mode === "clear" && level) startLevel(Math.min(6, level.id + (level.id < 6 ? 1 : 0)));
    } else if (role === "duck") keys.duck = true;
    else if (role === "fire") keys.fire = true;
    else if (role === "pause") {
      if (mode === "play" || mode === "pause") togglePause();
    } else if (role === "confirm") {
      if (mode === "dash") startLevel(selected);
      else if (mode === "pause") togglePause();
      else if (mode === "over" && level) startLevel(level.id);
    } else if (mode === "dash" && /^Digit[1-6]$/.test(e.code)) {
      selected = Number(e.code.slice(-1));
      save.selected = selected;
      persist();
      renderOverlay(0);
    }
  }

  function onKeyUp(e) {
    const role = roleOf(e.code);
    if (role === "jump") keys.jump = false;
    else if (role === "duck") keys.duck = false;
    else if (role === "fire") {
      keys.fire = false;
      fireLock = false;
    }
  }

  function bindHold(btn, fn) {
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      unlock();
      try { btn.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      fn(true);
    }, sig);
    const up = () => fn(false);
    btn.addEventListener("pointerup", up, sig);
    btn.addEventListener("pointercancel", up, sig);
  }

  bindHold(btnJump, (down) => {
    keys.jump = down;
    if (down && mode === "play") requestJump();
  });
  bindHold(btnDuck, (down) => { keys.duck = down; });
  bindHold(btnFire, (down) => {
    keys.fire = down;
    if (!down) fireLock = false;
  });
  btnPause.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    unlock();
    togglePause();
  }, sig);

  canvas.addEventListener("pointerdown", (e) => {
    if (mode !== "play" || player.dead) return;
    unlock();
    keys.jump = true;
    requestJump();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }, sig);
  canvas.addEventListener("pointerup", () => { keys.jump = false; }, sig);
  canvas.addEventListener("pointercancel", () => { keys.jump = false; }, sig);
  stage.addEventListener("contextmenu", (e) => e.preventDefault(), sig);
  overlay.addEventListener("click", onOverlayClick, sig);
  window.addEventListener("keydown", onKeyDown, { signal: ac.signal, capture: true });
  window.addEventListener("keyup", onKeyUp, sig);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();
  }, sig);

  function drawWorld() {
    // Gradient sky (trailer energy)
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, biome.bg);
    sky.addColorStop(1, biome.bg2 || biome.bg);
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // Stars / eclipse corona
    if (biome.stars) {
      ctx.fillStyle = "#c8c8e0";
      for (const s of STARS) ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    if (biome.eclipse) {
      // Black sun with orange ring
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(biome.sunX, biome.sunY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ff8a3a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(biome.sunX, biome.sunY, 22, 0, Math.PI * 2);
      ctx.stroke();
      // Occasional lightning flash
      if (Math.floor(t * 4) % 17 === 0) {
        ctx.globalAlpha = 0.25 + Math.random() * 0.2;
        ctx.fillStyle = "#cfd8ff";
        ctx.fillRect(-10, -10, W + 20, H + 20);
        ctx.globalAlpha = 1;
      }
    } else {
      // Glowing sun
      if (biome.sunGlow) {
        ctx.globalAlpha = 0.35;
        blob(ctx, biome.sunX, biome.sunY, 28, biome.sunGlow);
        ctx.globalAlpha = 1;
      }
      blob(ctx, biome.sunX, biome.sunY, biome.night ? 12 : 18, biome.sun);
    }

    // Layered mesas / mountains with parallax
    const span = 360;
    const off = (scroll * 0.22) % span;
    ctx.fillStyle = biome.mesa;
    for (let i = -1; i < 4; i++) {
      const x = i * span - off;
      mesa(ctx, x + 10, 42, 140);
      mesa(ctx, x + 180, 64, 170);
    }
    // Nearer ridge
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = biome.mesa2 || biome.mesa;
    const off2 = (scroll * 0.38) % span;
    for (let i = -1; i < 4; i++) {
      const x = i * span - off2;
      mesa(ctx, x + 60, 28, 110);
    }
    ctx.globalAlpha = 1;

    // Ground band
    ctx.fillStyle = biome.ground || biome.mesa;
    ctx.fillRect(-10, GROUND, W + 20, H - GROUND + 20);
    // Ground texture ticks
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 24; i++) {
      const gx = ((i * 70 - scroll) % (W + 40) + W + 40) % (W + 40) - 20;
      ctx.fillRect(gx, GROUND + 10 + (i % 3) * 8, 18, 2);
    }

    if (art) {
      const cloudImg = biome.night ? art.cloudN : art.cloud;
      for (const c of clouds) {
        ctx.globalAlpha = biome.night ? 0.5 : 0.85;
        ctx.drawImage(cloudImg, Math.round(c.x), Math.round(c.y));
      }
      ctx.globalAlpha = 1;
      // Soft horizon strip under mesas
      const hz = biome.night ? art.horizonN : art.horizon;
      if (hz) {
        const hw = hz.width;
        const hx = -(scroll % hw);
        const hy = GROUND - 6;
        ctx.globalAlpha = 0.55;
        ctx.drawImage(hz, Math.round(hx), hy);
        ctx.drawImage(hz, Math.round(hx + hw), hy);
        ctx.globalAlpha = 1;
      }
    }

    // Biome particles
    if (biome.snow) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 36; i++) {
        const x = ((i * 53 + t * 28) % (W + 12));
        const y = ((i * 37 + t * 55) % (GROUND - 20));
        ctx.fillRect(x, y, 2 + (i % 2), 2 + (i % 2));
      }
    }
    if (biome.ember) {
      for (let i = 0; i < 28; i++) {
        const x = ((i * 67 - t * 32 + scroll * 0.15) % (W + 16) + W + 16) % (W + 16);
        const y = GROUND - 16 - ((i * 41 + t * 48) % 160);
        ctx.fillStyle = i % 2 ? "#ff8a20" : "#ffd070";
        ctx.fillRect(x, y, 3, 3);
      }
    }
    if (biome.sand) {
      ctx.fillStyle = "rgba(255,192,138,0.45)";
      for (let i = 0; i < 14; i++) {
        const x = ((i * 90 - scroll * 1.1) % (W + 40) + W + 40) % (W + 40) - 20;
        ctx.fillRect(x, GROUND - 40 + (i % 4) * 12, 50, 2);
      }
    }
    if (biome.jungle) {
      // Distant canopy silhouettes
      ctx.fillStyle = "#06120a";
      for (let i = 0; i < 8; i++) {
        const x = ((i * 110 - scroll * 0.35) % (W + 80) + W + 80) % (W + 80) - 40;
        const h = 70 + (i * 17) % 50;
        ctx.fillRect(x, GROUND - h, 10, h);
        ctx.fillRect(x - 18, GROUND - h - 12, 46, 22);
      }
    }

    const list = entities.filter((e) => e.alive);
    for (const e of list) if (groundish(e.kind)) drawEnt(e);
    if (boss) drawBoss();
    for (const e of list) if (!groundish(e.kind) && e.kind !== "bolt") drawEnt(e);
    drawPlayer();
    for (const e of list) if (e.kind === "bolt") drawEnt(e);
    drawBreath();

    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      const s = p.kind === "ember" ? Math.max(1, p.s * a) : p.s;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
    }
    ctx.globalAlpha = 1;
    if (flashA > 0) {
      ctx.fillStyle = `rgba(255,180,60,${flashA * 0.55})`;
      ctx.fillRect(-10, -10, W + 20, H + 20);
    }
    for (const f of floaters) {
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      drawText(ctx, f.str, f.x, f.y, 2, "#ffb020");
    }
    ctx.globalAlpha = 1;
  }

  function groundish(kind) {
    return kind === "cactus" || kind === "crater" || kind === "boulder" || kind === "snake" || kind === "scorp" || kind === "golem" || kind === "raptor";
  }

  function mesa(ctx2, x, h, w) {
    const s = 6;
    for (let i = 0; i < h; i += s) {
      const tt = i / h;
      const ww = w * (1 - tt * 0.86);
      ctx2.fillRect(Math.round(x + (w - ww) / 2), Math.round(GROUND - 10 - i - s), Math.round(ww), s);
    }
  }

  function drawEnt(e) {
    if (!art) return;
    const x = Math.round(e.x);
    const y = Math.round(e.y);
    if (e.kind === "cactus") {
      const sheet = e.large ? (biome.night ? art.cactLN : art.cactL) : (biome.night ? art.cactSN : art.cactS);
      for (let i = 0; i < e.count; i++) {
        const sx0 = ((e.variant + i) % 6) * e.fw;
        ctx.drawImage(sheet, sx0, 0, e.fw, e.fh, x + i * e.step, y, e.fw, e.fh);
      }
    } else if (e.kind === "ptero" || e.kind === "bat" || e.kind === "scorp" || e.kind === "snake" || e.kind === "raptor") {
      const set = spriteSet(art[e.kind]);
      const fr = Math.floor(t * (e.kind === "raptor" && e.dash > 0 ? 16 : 8) + (e.ph || 0)) % set.length;
      ctx.drawImage(set[fr], x, y);
    } else if (e.kind === "golem") drawGolem(x, y);
    else if (e.kind === "boulder") drawBoulder(e, x, y);
    else if (e.kind === "vine") drawVine(x, y, e.h);
    else if (e.kind === "meteor") drawMeteor(e, x, y);
    else if (e.kind === "crater") drawCrater(x, y, e.w);
    else if (e.kind === "proj") drawProj(e, x, y);
    else if (e.kind === "bolt") {
      ctx.fillStyle = "#ff4a10";
      ctx.fillRect(x, y + 2, e.w, e.h - 2);
      ctx.fillStyle = "#ffb020";
      ctx.fillRect(x + 2, y, e.w - 4, e.h - 4);
      ctx.fillStyle = "#fff4b0";
      ctx.fillRect(x + 6, y + 3, 10, 5);
    }
    if (e.flash > 0 && e.kind !== "bolt") {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(x, y, e.w, Math.min(e.h, 20));
      ctx.globalAlpha = 1;
    }
  }

  function drawGolem(x, y) {
    const body = biome.night ? "#6b6b72" : "#5a5a62";
    const head = biome.night ? "#85858c" : "#707078";
    const leg = biome.night ? "#55555c" : "#4a4a52";
    const bob = Math.sin(t * 3) * 1.5;
    ctx.fillStyle = body;
    ctx.fillRect(x + 8, y + 22 + bob, 56, 52);
    ctx.fillStyle = head;
    ctx.fillRect(x + 16, y + 4 + bob, 40, 28);
    // Glowing visor
    ctx.fillStyle = "#ff6a1a";
    ctx.fillRect(x + 24, y + 14 + bob, 24, 8);
    ctx.fillStyle = "#ffd070";
    ctx.fillRect(x + 28, y + 16 + bob, 16, 4);
    // Arms
    ctx.fillStyle = body;
    ctx.fillRect(x - 2, y + 36 + bob, 14, 28);
    ctx.fillRect(x + 60, y + 32 + bob, 14, 28);
    // Legs
    ctx.fillStyle = leg;
    ctx.fillRect(x + 14, y + 72, 16, 22);
    ctx.fillRect(x + 42, y + 72, 16, 22);
    // Core cracks
    ctx.fillStyle = "#ff6a1a";
    ctx.fillRect(x + 30, y + 40 + bob, 5, 14);
    ctx.fillRect(x + 44, y + 48 + bob, 5, 10);
  }

  function drawBoulder(e, x, y) {
    blob(ctx, x + 26, y + 26, 24, inkOf());
    ctx.fillStyle = biome.night ? "#535353" : "#f7f7f7";
    ctx.fillRect(x + 16, y + 18, 6, 6);
    ctx.fillRect(x + 30, y + 28, 5, 5);
  }

  function drawVine(x, y, h) {
    ctx.fillStyle = inkOf();
    ctx.fillRect(x + 4, y, 8, h);
    for (let i = 0; i < h; i += 14) ctx.fillRect(x + (i % 28 === 0 ? 0 : 10), y + i, 6, 8);
  }

  function drawMeteor(e, x, y) {
    const shadowW = 10 + Math.min(28, (y / GROUND) * 30);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = inkOf();
    ctx.fillRect(x + 14 - shadowW / 2, GROUND - 4, shadowW, 4);
    ctx.globalAlpha = 1;
    // Fire trail
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#e85d04";
    ctx.fillRect(x + 6, y - 18, 6, 16);
    ctx.fillRect(x + 14, y - 14, 5, 12);
    ctx.globalAlpha = 1;
    blob(ctx, x + 14, y + 14, 15, inkOf());
    ctx.fillStyle = "#e85d04";
    ctx.fillRect(x + 9, y + 9, 10, 10);
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(x + 12, y + 12, 4, 4);
    // Sparks
    if (Math.random() < 0.35) {
      particles.push({
        x: x + 8 + Math.random() * 12, y: y - 4,
        vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 40,
        life: 0.25, max: 0.3, s: 2, color: "#e85d04", g: 200, kind: "spark",
      });
    }
  }

  function drawCrater(x, y, w) {
    ctx.fillStyle = inkOf();
    ctx.fillRect(x, y + 8, w, 14);
    ctx.fillStyle = "#e85d04";
    ctx.fillRect(x + 8, y, w - 16, 12);
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(x + 16, y + 3, 8, 5);
  }

  function drawProj(e, x, y) {
    if (e.delay > 0 && Math.floor(t * 12) % 2 === 0) ctx.globalAlpha = 0.4;
    if (e.visual === "orb") {
      const pulse = 1 + Math.sin(t * 14 + (e.age || 0)) * 0.12;
      blob(ctx, x + e.w / 2, y + e.h / 2, (e.h / 2) * pulse, "#e85d04");
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(x + e.w / 2 - 3, y + 4, 6, 6);
      // orbit spark
      if (Math.random() < 0.2) {
        particles.push({
          x: x + e.w / 2, y: y + e.h / 2,
          vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
          life: 0.2, max: 0.25, s: 2, color: "#f7f7f7", g: 0, kind: "spark",
        });
      }
    } else if (e.visual === "jaw") {
      const chomp = Math.sin(t * 22) * 3;
      ctx.fillStyle = inkOf();
      ctx.fillRect(x, y + 10 + chomp, e.w, 10);
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 6 + i * 14, y + chomp * 0.5, 8, 16);
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x + 20, y + 14 + chomp, 24, 4);
    } else if (e.visual === "swipe") {
      ctx.fillStyle = inkOf();
      ctx.fillRect(x, y + 8, e.w, 16);
      ctx.fillRect(x, y, 16, e.h);
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x + 2, y + 4, 8, 8);
    } else {
      // shockwave
      const stretch = 1 + Math.sin(t * 20) * 0.08;
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x, y + 6, e.w * stretch, 12);
      ctx.fillStyle = inkOf();
      ctx.fillRect(x, y + 10, e.w * stretch, 4);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x - 6, y + 4, 8, 16);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;
  }

  function drawBoss() {
    if (boss.type === "tyrant") drawTyrant();
    else drawCinder();
  }

  function drawCinder() {
    const b = boss;
    const ink = inkOf();
    const eye = biome.night ? "#2a2a2a" : "#f7f7f7";
    const bob = Math.sin(b.anim * (b.enraged ? 5.5 : 3.2)) * (b.enraged ? 4 : 2.5);
    const x = Math.round(b.x);
    const y = Math.round(b.y + bob);
    // Glow aura when enraged / charging
    if (b.aura > 0.2) {
      ctx.globalAlpha = 0.12 + b.aura * 0.18;
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x - 6, y - 4, b.w + 12, b.h + 8);
      ctx.globalAlpha = 1;
    }
    // Body
    ctx.fillStyle = ink;
    ctx.fillRect(x + 92, y + 46, 52, 20);
    ctx.fillRect(x + 36, y + 34, 78, 50);
    ctx.fillRect(x + 6, y + 26, 42, 34);
    ctx.fillRect(x, y + 50, 34, 12);
    // Horns / crest
    ctx.fillRect(x + 18, y + 8, 12, 22);
    ctx.fillRect(x + 30, y + 14, 10, 16);
    if (b.enraged) {
      ctx.fillRect(x + 12, y + 4, 8, 14);
      ctx.fillRect(x + 38, y + 6, 8, 12);
    }
    // Legs
    const stomp = b.tell === "slam" || b.slamFx > 0.2 ? 4 : 0;
    ctx.fillRect(x + 48, y + 80 + stomp, 16, 30 - stomp);
    ctx.fillRect(x + 78, y + 80, 16, 30);
    // Arm
    let reach = 0;
    if (b.tell === "swipe") reach = -28 - Math.sin(b.anim * 18) * 6;
    else if (b.tell === "slam") reach = -8;
    ctx.fillRect(x + 10 + reach, y + 56, 36, 12);
    // Fist
    if (b.tell === "swipe" || b.tell === "slam") {
      ctx.fillRect(x + 6 + reach, y + 50, 14, 20);
    }
    // Eye
    ctx.fillStyle = eye;
    ctx.fillRect(x + 14, y + 36, 10, 10);
    if (b.enraged) {
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(x + 16, y + 38, 6, 6);
    }
    // Core / furnace
    const pulse = 0.6 + Math.sin(b.pulse * 6) * 0.4;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#e85d04";
    ctx.fillRect(x + 58, y + 48, 10, 18);
    ctx.fillRect(x + 76, y + 42, 8, 12);
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(x + 60, y + 52, 5, 8);
    ctx.globalAlpha = 1;
    // Slam shock ring
    if (b.slamFx > 0) {
      const r = (1 - b.slamFx / 0.45) * 90;
      ctx.globalAlpha = b.slamFx * 1.4;
      ctx.strokeStyle = "#e85d04";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + 30, GROUND - 4, r, Math.PI, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (b.flash > 0) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(x, y, b.w, b.h);
      ctx.globalAlpha = 1;
    }
    if (b.tell) drawTell(b.tell, x - 10, y + 4);
  }

  function drawTyrant() {
    const b = boss;
    const sheet = biome.night ? art.trexN : art.trex;
    const enraged = b.enraged;
    let frame = 2 + (Math.floor(b.anim * (enraged ? 12 : 8)) % 2);
    if (b.dead) frame = 5;
    else if (b.tell === "laser" || b.beam > 0) frame = 0;
    else if (b.tell === "jaw") frame = 0;
    const bob = Math.sin(b.anim * (enraged ? 5 : 2.8)) * (enraged ? 3 : 1.5);
    ctx.save();
    ctx.translate(Math.round(b.x + b.w), Math.round(b.y + bob));
    ctx.scale(-1, 1);
    // Threat outline
    if (enraged || b.tell) {
      ctx.globalAlpha = 0.15 + (enraged ? 0.12 : 0);
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(-4, -4, b.w + 8, b.h + 8);
      ctx.globalAlpha = 1;
    }
    ctx.drawImage(sheet, frame * 88, 0, 88, 94, 0, 0, b.w, b.h);
    ctx.restore();
    // Chrome cracks / core
    const cx = Math.round(b.x + 26);
    const cy = Math.round(b.y + 34 + bob);
    ctx.fillStyle = "#e85d04";
    ctx.fillRect(cx, cy, 14, 12);
    if (enraged || b.hp < b.max * 0.7) {
      ctx.fillStyle = biome.night ? "#f7f7f7" : "#535353";
      ctx.fillRect(cx + 2, cy - 6, 3, 8);
      ctx.fillRect(cx + 8, cy + 10, 4, 10);
      ctx.fillRect(cx - 4, cy + 4, 6, 3);
    }
    if (b.flash > 0) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(b.x, b.y + bob, b.w, b.h);
      ctx.globalAlpha = 1;
    }
    // Laser charge + beam
    if (b.tell === "laser" || b.beam > 0) {
      const charging = b.tell === "laser" && b.beam <= 0;
      const intensity = b.beam > 0 ? 0.95 : 0.35 + Math.sin(t * 28) * 0.25 + (b.charge || 0) * 0.4;
      ctx.globalAlpha = Math.min(1, intensity);
      ctx.fillStyle = b.beam > 0 ? "#e85d04" : inkOf();
      const h = b.beam > 0 ? 18 : 5 + Math.sin(t * 40) * 2;
      ctx.fillRect(0, GROUND - 76, b.x + 42, h);
      if (b.beam > 0) {
        ctx.fillStyle = "#f7f7f7";
        ctx.fillRect(0, GROUND - 72, b.x + 42, 6);
      }
      // Charge particles at mouth
      if (charging && Math.random() < 0.5) {
        particles.push({
          x: b.x + 8, y: GROUND - 70 + (Math.random() - 0.5) * 10,
          vx: -40 - Math.random() * 60, vy: (Math.random() - 0.5) * 30,
          life: 0.2, max: 0.25, s: 3, color: "#e85d04", g: 0, kind: "spark",
        });
      }
      ctx.globalAlpha = 1;
    }
    if (b.tell && b.tell !== "laser") drawTell(b.tell, b.x - 6, b.y + 16 + bob);
    else if (b.tell === "laser") drawTell("laser", b.x - 6, b.y + 8 + bob);
  }

  function drawTell(name, x, y) {
    const label = name === "slam" ? "JUMP" : name === "jaw" ? "JUMP" : name === "swipe" ? "DUCK" : name === "orbs" ? "DODGE" : name === "meteors" ? "SKY" : name === "laser" ? "DUCK" : "";
    if (!label) return;
    drawText(ctx, label, x, y, 2, "#e85d04");
  }

  function drawPlayer() {
    if (!art) return;
    if (player.iframe > 0.05 && Math.floor(t * 16) % 2 === 0) return;
    const night = biome.night;
    if (player.duck && player.onGround) {
      const set = spriteSet(art.duck);
      const fr = Math.floor(player.anim * 12) % 2;
      const spr = set[fr];
      ctx.drawImage(spr, Math.round(player.x), GROUND - spr.height);
      return;
    }
    const sheet = night ? art.trexN : art.trex;
    let frame = 2 + (Math.floor(player.anim * 12) % 2);
    if (!player.onGround) frame = 0;
    if (player.dead) frame = 5;
    const dw = 88;
    const dh = 94;
    if (player.squash > 0 && player.onGround) {
      const k = player.squash / 0.12;
      ctx.save();
      ctx.translate(Math.round(player.x + 44), GROUND);
      ctx.scale(1 + 0.12 * k, 1 - 0.2 * k);
      ctx.drawImage(sheet, frame * 88, 0, 88, 94, -44, -94, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(sheet, frame * 88, 0, 88, 94, Math.round(player.x), Math.round(player.y), dw, dh);
    }
    player.anim += 0; // animated in update via time; bump here using t
  }

  function drawBreath() {
    const breathing = mode === "play" && !player.dead && keys.fire && !fireLock && heat > 0;
    if (!breathing) return;
    const m = mouthPos();
    const len = 120 + Math.min(80, heat * 0.6);
    // Trailer-style fire stream
    for (let i = 0; i < 28; i++) {
      const a = (i / 28 + t * 2.2) % 1;
      const s = (1 - a) * 14 + 3;
      const wob = Math.sin(i * 5 + t * 28) * a * len * 0.12;
      const px = m.x + a * len - s / 2;
      const py = m.y + wob - s / 2;
      let col = "#5a2a20";
      if (a < 0.22) col = "#fff4b0";
      else if (a < 0.5) col = "#ffb020";
      else if (a < 0.78) col = "#ff4a10";
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(px), Math.round(py), Math.ceil(s), Math.ceil(s));
    }
    // Core jet
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#fff4b0";
    ctx.fillRect(m.x, m.y - 4, 28, 8);
    ctx.fillStyle = "#ff6a1a";
    ctx.fillRect(m.x + 20, m.y - 3, 36, 6);
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    if ((mode !== "play" && mode !== "pause") || !level) return;
    const color = inkOf();
    const hs = cssW < 700 ? 2 : 3;
    let hx = 10;
    for (let i = 0; i < 5; i++) {
      drawHeart(hx, 8, i < hearts, i < hearts ? "#e85d04" : color);
      hx += hs === 2 ? 18 : 22;
    }
    const scoreStr = padScore(score);
    const best = padScore((save.levels[String(level.id)] || {}).best || 0);
    const right = "HI " + best + "  " + scoreStr;
    drawText(ctx, right, cssW - 10 - measure(right, hs), 8, hs, color);
    drawText(ctx, "FIRE", 10, 28, hs, color);
    const segX = 10 + measure("FIRE", hs) + 8;
    const seg = hs === 2 ? 8 : 10;
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = heat > i * 10 ? "#e85d04" : color;
      ctx.globalAlpha = heat > i * 10 ? 1 : 0.35;
      ctx.fillRect(segX + i * (seg + 3), 28, seg, seg);
    }
    ctx.globalAlpha = 1;
    if (combo >= 2) drawText(ctx, "x" + Math.min(8, combo), segX + 10 * (seg + 3) + 8, 28, hs, "#e85d04");

    if (boss && boss.entered) {
      const bw = Math.min(360, cssW * 0.55);
      const bx = (cssW - bw) / 2;
      const by = 52;
      drawText(ctx, boss.name, bx, by, Math.max(2, hs - 1), color);
      ctx.fillStyle = color;
      ctx.fillRect(bx, by + 16, bw, 10);
      ctx.fillStyle = biome.night ? "#535353" : "#f7f7f7";
      ctx.fillRect(bx + 2, by + 18, bw - 4, 6);
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(bx + 2, by + 18, (bw - 4) * Math.max(0, boss.hp / boss.max), 6);
    } else {
      const label = level.name;
      const ly = 52;
      drawText(ctx, label, (cssW - measure(label, hs)) / 2, ly, hs, color);
      const bw = Math.min(220, cssW * 0.4);
      const bx = (cssW - bw) / 2;
      const p = phase === "boss" ? 1 : Math.min(1, dist / level.length);
      ctx.fillStyle = color;
      ctx.fillRect(bx, ly + hs * 6, bw, 6);
      ctx.fillStyle = "#e85d04";
      ctx.fillRect(bx, ly + hs * 6, bw * p, 6);
    }

    if (bannerT > 0 && banner) {
      const sc = cssW < 700 ? 2 : 4;
      const bw = measure(banner, sc);
      ctx.fillStyle = biome.night ? "rgba(83,83,83,0.55)" : "rgba(247,247,247,0.7)";
      ctx.fillRect((cssW - bw) / 2 - 8, cssH * 0.38, bw + 16, sc * 7);
      drawText(ctx, banner, (cssW - bw) / 2, cssH * 0.38 + 4, sc, color);
    }
    if (level.id === 1 && !save.taught && runT < 8 && mode === "play") {
      const hint = "SPACE JUMP   DOWN DUCK   F FIRE";
      const sc = 2;
      drawText(ctx, hint, (cssW - measure(hint, sc)) / 2, cssH - 18, sc, color);
    }
  }

  function drawHeart(x, y, on, color) {
    ctx.fillStyle = color;
    const rows = on
      ? ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"]
      : ["01100110", "10011001", "10000001", "01000010", "00100100", "00011000"];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < 8; c++) if (rows[r][c] === "1") ctx.fillRect(x + c * 2, y + r * 2, 2, 2);
    }
  }

  function render() {
    if (!ready) return;
    const amp = save.shake ? trauma * trauma : 0;
    const shx = (Math.random() * 2 - 1) * 9 * amp;
    const shy = (Math.random() * 2 - 1) * 5 * amp;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = biome.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(sx, 0, 0, sy, shx * sx, shy * sy);
    ctx.imageSmoothingEnabled = false;
    drawWorld();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawHUD();
    if (mode === "dash") paintLogo();
  }

  function loop(ts) {
    if (dead) return;
    if (!last) last = ts;
    let dt = (ts - last) / 1000;
    last = ts;
    if (dt > 0.05) dt = 0.05;
    acc += dt;
    let steps = 0;
    while (acc >= 1 / 60 && steps < 5) {
      update(1 / 60);
      acc -= 1 / 60;
      steps += 1;
    }
    if (steps === 5) acc = 0;
    if (!player.dead) player.anim += dt * (speed / 220);
    render();
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize, sig);
  ro = new ResizeObserver(() => resize());
  ro.observe(stage);

  window.__dino = () => ({
    mode, score: Math.floor(score), hearts, dist: Math.floor(dist), phase,
    heat: Math.floor(heat), level: level && level.id, bossHp: boss ? Math.ceil(boss.hp) : 0,
  });
  window.__dinoStart = (id) => startLevel(id);

  (async function boot() {
    try {
      const imgs = {
        trex: await loadImage("/sprites/2x-trex.png"),
        cactL: await loadImage("/sprites/2x-obstacle-large.png"),
        cactS: await loadImage("/sprites/2x-obstacle-small.png"),
        cloud: await loadImage("/sprites/2x-cloud.png"),
        horizon: await loadImage("/sprites/2x-horizon.png"),
      };
      if (dead) return;
      art = {
        trex: imgs.trex,
        trexN: recolorNight(imgs.trex),
        cactL: imgs.cactL,
        cactLN: recolorNight(imgs.cactL),
        cactS: imgs.cactS,
        cactSN: recolorNight(imgs.cactS),
        cloud: imgs.cloud,
        cloudN: recolorNight(imgs.cloud),
        horizon: imgs.horizon,
        horizonN: recolorNight(imgs.horizon),
        duck: pair(DUCK, 2),
        ptero: pair(PTERO, 3),
        scorp: pair(SCORP, 3),
        snake: pair(SNAKE, 4),
        raptor: pair(RAPTOR, 4),
        bat: pair(BAT, 3),
      };
      ready = true;
      resize();
      enterDash();
      raf = requestAnimationFrame(loop);
    } catch (err) {
      overlay.className = "menu";
      overlay.innerHTML = `<div class="dash"><h1>Dino Legend</h1><p class="help">Sprites failed to load. ${String(err && err.message || err)}</p></div>`;
    }
  })();

  return function destroy() {
    dead = true;
    ac.abort();
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    root.innerHTML = "";
  };
}
