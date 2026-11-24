# PIPES — 3D Web Replica

A browser-based 3D survival horror prototype inspired by the Roblox game **PIPES**.
The Fandom wiki (`../pipes-wiki/`) was used only as the setting reference: controls,
monster rules, items, jobs, nights and difficulty were transcribed from it.

## Run locally

No build step and no external CDN dependency — Three.js is vendored in `lib/`.

```bash
cd pipes-game
python3 -m http.server 8791 --bind 127.0.0.1
# open http://127.0.0.1:8791/
```

Any static file server works; ES modules require `http://`, not `file://`.

## Controls

| Key | Action |
|---|---|
| W / Up | Crawl to the junction ahead |
| A / D | Turn to a different pipe |
| S / Down | Back up (slower) |
| F | Toggle heat lamp |
| M | Hold up the paper map |
| E | Interact / work job / buy / hug / hide |
| 1–4 | Use pocket item |
| Drag (mouse / touch) | Free-look around the current junction |
| Space | Stop needle / turn wheel / clamp leak in a job |

On touch devices an on-screen d-pad and E / F / M buttons appear automatically;
pocket slots are tappable.

## The shift loop

1. Clock in from the safe room (**E**).
2. Crawl the pipe network, finish every job.
3. When all jobs are done, get back to the safe room and clock out.
4. The next night starts; monsters stack from previous nights.

## Implemented systems

- Pipe-junction graph with crawl animation, turning and backing up. Cross-section
  follows the chapter: Ch1 octagonal metal pipe (N4/N8 vent nights go square),
  Ch2 square steel duct with cold ceiling strips, Ch3 round growth tube with
  glowing spores and round junction rooms.
- Chapter landmarks: Ch2 night 8 wires charged **zap gates** across ducts
  (crossing one jolts warmth and battery); Ch3 pairs two far dead ends as
  **purple portals** — crawl into one to emerge from its twin on the map.
  Hiding nooks are themed per chapter: Ch1 red-lit hole, Ch2 louvred service
  cubby, Ch3 vine-curtained grown pocket.
- Heat lamp: battery drains while on; warmth drains while off; freezing at zero.
- Safe room (center of the map, nothing gets in): fast battery/warmth recharge,
  vending machine (PIPE-MART / VENT-O-MAT / SAP STOP by chapter), desk radio and
  How-to guide, map pile, posters, pet bed; Ch3 cauldron + wash barrel; Ch1
  Night 10 flare box. Clock in/out from here.
- Bottle caps scattered in the pipes; 4-slot pockets; timed effects bar.
- All six Chapter 1 job mini-games: pressure gauge (4 hits), valve wheel
  (horizontal, 3), leaks (clamp 3 spurting slots), bleed valve (close the screw
  on the water window, 2), weld seam (4 segments in order), junction box wires
  (match 3 coloured pairs); the green band shrinks on every hit.
- Paper map overlay, drawn the way the wiki describes it: ink on paper, chapter
  and night in the margin, safe room in the middle, you as a red arrow, jobs as
  lettered badges, hiding nooks as diamonds. Monsters that are "on your map"
  appear too: Randal / Randal Overgrown / Rampage as a red scribbled face with
  red dots down the pipe they watch, the Janitor as a bucket with its 3-crawl
  hearing ring, the Sweeper's route in orange crayon, the Gardener and Choir
  rings, a blood-red dashed charge line for the Flesh, the Leeches' puddles and
  Dead Air's NO SIGNAL scribble. The Wrong Nook is never drawn.
- Chapter 3 cure loop: finish a cure task, carry its ingredient back to the safe
  room cauldron; you cannot clock out while still carrying one.
- Four difficulties (Easy / Normal / Hard / Insane) affecting battery, warmth
  drain, monster rate and speed.
- All three chapter night rosters and solo job counts; pick the chapter from the
  lobby. Clearing a finale carries you straight into the next chapter.
- Night 10 boss: collect 3 cage keys from far junctions, bring them to Randal's
  cage and unlock the bars; the Foreman hunts all night. Smoke bomb hides from him;
  safe room and nooks are off-limits to him.
- Death screen with a journal hint per monster; retry restarts the night.
- Synthesized WebAudio cues: low ambient hum, lamp click, job-complete chime,
  death sting, boss-win arpeggio (no audio assets).

## Monster rules implemented (Chapter 1)

- **The Maw** — appears ahead while the lamp is on; keep it off ~2 s to make it
  sink back; leave it on and it lunges.
- **Randal** — roams the pipes; sees you down his pipe (farther with lamp on);
  break line of sight before he reaches you.
- **The Drooler** — pins you at a corner; hold the map (M) up ~3 s to dismiss it.
- **The Moths** — swarm passes; lamp on when it reaches you pins you; turn it off.
- **Rampage** — warning shake, then charges; safe inside a hiding nook / safe room.
- **The Janitor** — blind, hears movement within 3 junctions; stay still while it listens.
- **Nana** — press E to hug; never crawl away or ignore her.
- **The Burrower** — cracks the floor under a stationary/working player; move off.
- **The Lantern Man** — keep the lamp on near him; off in his light and he takes you.
- **The Tollman** — sits at a junction; pay 3 caps or go round.
- **The Foreman** — Night 10 boss; hunts nonstop, faster than you. He won't take
  you in the safe room or a nook; smoke breaks his chase. Win by freeing Randal.

## Monster rules implemented (Chapter 2: The Vents)

- **The Grinner** — hunts like Randal but faster and off the map; break line of sight.
- **The Sweeper** — drives one fixed ring loop all night; learn the route and step aside.
- **The Exterminator** — fogs a junction with yellow gas; don't dwell in the fogged node.
- **The Process Server** — serves a paper with a deadline; reach the marked junction in time.
- **The Flesh** — waits at the end of a duct, then charges down the line; get off it.
- **The Faceling** — haunts one hiding nook; never hide in that hole.
- **The Temp** — undoes finished jobs; keep your lamp on it to shoo it away.
- **The Drip** — hangs overhead; drops on anyone who stops under it. Keep crawling.
- **The Mother** — asleep until the work is done, then hunts your heat; stay lamp-off and get home.
- **Her Young** — wanders in swarms; latching on slows your crawl. Step round them.

## Monster rules implemented (Chapter 3: The Growth)

- **Dale** — only sees you when your night vision is glowing; go dark and hold still.
- **Marco** — blind; yells, then charges to where you answered. Move after answering.
- **The Gardener** — patrols the Growth and closes in on anyone nearby; go round.
- **The Wrong Nook** — a fake hiding hole that is a mouth; never hide in its nook.
- **The Leeches** — wait in goo puddles and drink your battery; back away or burn them off with a flare.
- **Dead Air** — drifts toward the brightest player; go dark to lose it.
- **The Shift Change** — the old crews stampede one ring route; get off the loop.
- **The Choir** — rooted in a wall; nearby it slows you and drains battery; a flare jams it.
- **Randal, Overgrown** — Randal's chase, now with random portal hops.
- **The Two of Them** — finale boss; sleeps until the work is done, then hunts heat.

## Items implemented

Pipe Cola (battery), Flare (keeps things away), Hand Warmer (warmth),
Energy Drink (faster crawl), Smoke Bomb (hidden 8 s).

## Roadmap

- Full vent-map (square duct) layout. The five vent jobs (filter, fan, tape,
  grille, panel) and the three cure tasks (sap pod, bound bloom, spore pod) are
  themed onto the shared mini-game mechanics; bespoke UIs still pending.
- More sound: per-monster proximity cues, footsteps, crawling creak.
- Monster portrait / journal pages in the safe room guide book.
- Chapter 3 cure-jar finale (let it grab you, hit the green, splash three
  times); Custom Night and Endless Mode.
- Mobile / controller input.

## Project layout

```
pipes-game/
├── index.html        # HUD, overlays, lobby, modal, death screen
├── style.css         # dark horror theme, HUD bars, modal, map
├── main.js           # scene, graph, player, monsters, jobs, night loop
└── lib/three.module.js
```
