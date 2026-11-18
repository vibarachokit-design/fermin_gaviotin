/* El Vuelo del Gaviotín — capítulos de la temporada completa, álbum y resumen.
   Depende de game.js (dibujo, entrada, audio, estado). */
'use strict';

// ------------------------------------------------------------ tarjetas del álbum
const CARDS = {
  winter_camanchaca_arrival: { title: 'Llega en invierno',
    body: 'El Gaviotín Chico llega a Mejillones alrededor de junio o julio, en pleno invierno, cuando la camanchaca cubre la costa. Es un ave migratoria en peligro de extinción.' },
  tern_identification: { title: '¿Cómo reconocerlo?',
    body: 'Tiene un gorro negro con la frente blanca, el pico amarillo con la punta negra, el cuerpo blanco y las alas grises.' },
  mejillones_bay_habitat: { title: 'Su hogar: Mejillones',
    body: 'Los nueve sitios de nidificación conocidos en Chile están cerca de Mejillones. Anida en el desierto, un poco tierra adentro, y pesca en la bahía.' },
  protected_nesting_area: { title: 'Zonas protegidas',
    body: 'Cercar y señalizar las zonas de nidificación ayuda a que nadie pise los nidos por accidente. Respeta siempre los cercos y letreros.' },
  nest_hand_size: { title: 'Un nido pequeñito',
    body: 'El nido es solo una hondonada en el suelo de unos 10 cm, del tamaño de una mano, a uno o varios kilómetros del mar.' },
  courtship_fish_offer: { title: 'El regalo del pez',
    body: 'En muchos gaviotines, uno de la pareja ofrece un pez al otro durante el cortejo. Los científicos aún estudian cómo es exactamente en esta especie.' },
  research_leg_ring: { title: 'Anillas de colores',
    body: 'Los investigadores marcan algunas aves con anillas de colores en las patas. Así pueden reconocerlas a la distancia y estudiar sus viajes.' },
  egg_camouflage: { title: 'Huevos camuflados',
    body: 'Pone 1 o 2 huevos con manchas que se confunden con las piedras del desierto. Por eso es tan fácil pisarlos sin darse cuenta.' },
  turning_eggs: { title: '22 días de cuidado',
    body: 'La incubación dura entre 22 y 23 días. Las aves giran sus huevos con el pico para que se calienten de forma pareja.' },
  lighting_comparison: { title: 'Luz que no molesta',
    body: 'La luz blanca e intensa puede desorientar a las aves de noche. Las luminarias cálidas y apantalladas, que alumbran hacia el suelo, las molestan menos.' },
  dog_on_leash: { title: 'Perros con correa',
    body: 'Los perros sueltos espantan a los adultos y pueden dañar nidos y polluelos. Pasea siempre a tu perro con correa y por los senderos.' },
  chick_anchovy_size: { title: 'Un polluelo de 7 gramos',
    body: 'Al nacer, el polluelo pesa cerca de 7 gramos. Sus padres lo alimentan con peces pequeños, como la anchoveta.' },
  adult_shades_chick: { title: 'Sombra en el desierto',
    body: 'En la pampa el sol es muy fuerte. Los padres protegen a los huevos y polluelos del calor cubriéndolos con su cuerpo.' },
  chick_growth_stages: { title: 'De plumón a plumas',
    body: 'El polluelo nace cubierto de un plumón moteado que lo camufla. Poco a poco le crecen plumas hasta que puede volar.' },
  first_flight_family: { title: 'Temporadas que se cruzan',
    body: 'No todas las parejas anidan al mismo tiempo: en una misma temporada puede haber huevos, polluelos y juveniles volando a la vez.' },
};
const CARD_ORDER = Object.keys(CARDS);

// ------------------------------------------------------------------ capítulos
const CHAPTERS = [
  { title: 'La llegada', months: 'junio–julio', cards: ['winter_camanchaca_arrival', 'tern_identification'],
    body: 'Después de un largo viaje, el gaviotín llega a Mejillones. Esquiva gaviotas y halcones, aprovecha las ráfagas de viento y junta estrellas.\n\nTeclado: flechas o W A S D · Celular: arrastra el dedo.',
    make: () => Phase1() },
  { title: 'Instalarse', months: 'julio–agosto', cards: ['mejillones_bay_habitat', 'protected_nesting_area', 'nest_hand_size'],
    body: 'Sobrevuela la pampa de Mejillones y elige dónde anidar. Inspecciona cada sitio: carreteras, luces, personas y perros ponen en riesgo el nido.\n\nToca un sitio (o teclas 1 a 5) y luego «Anidar aquí» (o Enter).',
    make: () => Settle() },
  { title: 'El cortejo', months: 'agosto–septiembre', cards: ['courtship_fish_offer', 'research_leg_ring'],
    body: 'Pesca 3 peces para ofrecérselos a tu pareja y luego vuela con ella al ritmo del cortejo.\n\nPesca: ← → y mantén Espacio (o el dedo en el agua).\nVuelo: toca o presiona Espacio cuando el corazón llegue al círculo.',
    make: () => Phase2({ goal: 3, title: 'Capítulo 3 · Un regalo para tu pareja', doneMsg: '¡Ya tienes peces para ofrecer!', onDone: courtshipIntro }) },
  { title: 'El nido y los huevos', months: 'septiembre–octubre', cards: ['egg_camouflage'],
    body: 'Arma el nido: lleva 8 piedrecitas y conchas a la hondonada. Después, pon a prueba tu vista: ¿puedes encontrar los huevos camuflados?\n\nToca cada piedrecita o presiona Espacio.',
    make: () => NestBuild() },
  { title: 'La incubación', months: '22 a 23 días', cards: ['turning_eggs', 'lighting_comparison', 'dog_on_leash'],
    body: 'Tú y tu pareja se turnan para incubar. Usa la herramienta correcta antes de que una amenaza llegue al nido.\n1 Letrero → personas · 2 Cerco → perros\n3 Desvío → vehículos · 4 Luz cálida → focos',
    make: () => Phase3() },
  { title: 'Alimentar al polluelo', months: 'noviembre–enero', cards: ['chick_anchovy_size'],
    body: '¡Nació el polluelo! Atrapa 10 peces y llévalos al nido. No atrapes basura y cuidado con pelícanos, lobos marinos y redes.\n\nTeclado: ← → y mantén Espacio. Celular: toca el cielo para moverte y mantén el dedo en el agua para zambullirte.',
    make: () => Phase2({ goal: 10, chick: true, title: 'Capítulo 6 · Alimentar al polluelo' }) },
  { title: 'Crecer y volar', months: 'diciembre–febrero', cards: ['adult_shades_chick', 'chick_growth_stages'],
    body: 'Protege al polluelo de zorros, gatos y gaviotas, y dale sombra cuando el sol queme. Al final, ¡ayúdalo a dar su primer vuelo!\n\nToca a los depredadores (o Espacio) y usa «Dar sombra» (o tecla S).',
    make: () => GrowUp() },
  { title: 'La partida', months: 'febrero–marzo', cards: ['first_flight_family'],
    body: 'La temporada termina y la familia deja Mejillones. Vuela junto a ellos y junta las últimas estrellas.\n\nTeclado: flechas · Celular: arrastra el dedo.',
    make: () => Departure() },
];

function drawChapterArt(n) { ctx.drawImage(IMG['ch' + n], 0, 0, W, H); }

function continueSeason() { startChapter(save.next && save.next <= 8 ? save.next : 1); }

function startChapter(n) {
  if (n === 1) { game.score = 0; game.stats = { fish: 0, saved: 0, eggs: 0, flew: false }; }
  game.chapter = n; game.lives = 3; game.chapterStartScore = game.score;
  save.next = n; persist();
  const ch = CHAPTERS[n - 1], sc = ch.make();
  setScene(Card({ compact: true, kicker: `CAPÍTULO ${n} DE 8 · ${ch.months.toUpperCase()}`, title: ch.title, body: ch.body,
    backdrop: () => drawChapterArt(n), next: () => setScene(sc) }));
}

function finishChapter(world) {
  const n = game.chapter, ch = CHAPTERS[n - 1];
  const fresh = ch.cards.filter((id) => !save.cards.includes(id));
  save.cards.push(...fresh);
  save.unlocked = Math.max(save.unlocked, Math.min(8, n + 1));
  save.next = n < 8 ? n + 1 : 1;
  persist(); saveBest();
  music.play('music_phase_clear', false);
  const backdrop = world && world.drawWorld ? () => world.drawWorld() : () => drawChapterArt(n);
  setScene(FactCards(ch.cards, fresh, backdrop, () => (n < 8 ? startChapter(n + 1) : setScene(SeasonSummary())), `¡CAPÍTULO ${n} COMPLETADO!`));
}

// Comprobación común: botones, pausa.
function blocked() {
  if (handleButtons()) return true;
  if (pressed.Escape || pressed.KeyP) { togglePause(); return true; }
  return paused;
}
function endDraw(h) { drawParticles(); hud(h); drawToasts(); if (paused) pauseOverlay(); }
const actionPressed = () => pressed.Space || pressed.Enter || ptr.tap;

// ------------------------------------------------------- tarjetas al terminar
function FactCards(ids, fresh, backdrop, next, kicker) {
  let i = 0, t = 0;
  return {
    enter() { sfx('card_open'); },
    update(dt) {
      t += dt;
      if (t > 5.5 && music.current === 'music_phase_clear') music.play('music_fact_card');
      if (handleButtons()) return;
      if (t > 0.6 && (pressed.Space || pressed.Enter || ptr.tap)) {
        sfx('click');
        if (i < ids.length - 1) { i++; t = 0.3; sfx('card_open'); } else next();
      }
    },
    draw() {
      backdrop();
      ctx.fillStyle = 'rgba(8,24,36,.6)'; ctx.fillRect(0, 0, W, H);
      const id = ids[i], card = CARDS[id];
      const k = Math.min(1, t * 3), pw = 1000, ph = 560, px = (W - pw) / 2, py = (H - ph) / 2 + (1 - k) ** 2 * 200;
      roundRect(px, py + 10, pw, ph, 36, 'rgba(0,0,0,.3)');
      roundRect(px, py, pw, ph, 36, C.ochre);
      roundRect(px + 14, py + 14, pw - 28, ph - 28, 26, C.cream, C.sand, 6);
      ctx.save(); ctx.beginPath(); ctx.roundRect(px + 40, py + 70, 420, 420, 22); ctx.clip();
      ctx.drawImage(IMG['card_' + id], px + 40, py + 70, 420, 420); ctx.restore();
      roundRect(px + 40, py + 70, 420, 420, 22, null, C.sand, 5);
      const tx = px + 500, tw = pw - 540;
      text(kicker || '', px + pw / 2, py + 42, 22, C.ochre, { weight: 800 });
      text(fresh.includes(id) ? '★ NUEVA TARJETA PARA TU ÁLBUM' : 'TARJETA DEL ÁLBUM', tx, py + 100, 18, C.coral, { align: 'left', weight: 800 });
      const tl = wrap(card.title, tw, 40, 800);
      tl.forEach((l, j) => text(l, tx, py + 146 + j * 44, 40, C.deep, { align: 'left', weight: 800 }));
      wrap(card.body, tw, 24, 600).forEach((l, j) => text(l, tx, py + 168 + tl.length * 44 + j * 32, 24, C.ink, { align: 'left', weight: 600 }));
      text(`${i + 1} / ${ids.length}`, tx, py + ph - 110, 20, C.deep, { align: 'left', weight: 700 });
      roundRect(tx, py + ph - 86, tw, 46, 23, C.coral);
      text(i < ids.length - 1 ? 'Siguiente tarjeta' : 'Continuar', tx + tw / 2, py + ph - 62, 22, C.white, { weight: 700 });
    },
  };
}

// -------------------------------------------------------- selector de capítulos
function ChapterSelect() {
  const tw = 270, th = 152, gap = 24, x0 = (W - 4 * tw - 3 * gap) / 2, y0 = 150;
  const box = (i) => ({ x: x0 + (i % 4) * (tw + gap), y: y0 + Math.floor(i / 4) * (th + 92), w: tw, h: th });
  const open = (n) => save.teacher || n <= save.unlocked;
  return {
    enter() { music.play('music_title'); },
    update() {
      if (handleButtons()) return;
      if (pressed.Escape) setScene(Title());
      for (let n = 1; n <= 8; n++) if ((pressed['Digit' + n] || pressed['Numpad' + n]) && open(n)) startChapter(n);
    },
    draw() {
      ctx.drawImage(IMG.cover, 0, 0, W, H);
      ctx.fillStyle = 'rgba(8,30,48,.88)'; ctx.fillRect(0, 0, W, H);
      text('Capítulos de la temporada', W / 2, 62, 46, C.white, { stroke: C.deep, strokeW: 8 });
      text(`Temporada ${save.season} · Mejillones`, W / 2, 106, 22, C.sand, { weight: 700 });
      CHAPTERS.forEach((ch, i) => {
        const b = box(i), n = i + 1, ok = open(n);
        ctx.save(); ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 16); ctx.clip();
        ctx.drawImage(IMG['ch' + n], b.x, b.y, b.w, b.h);
        if (!ok) { ctx.fillStyle = 'rgba(10,20,30,.72)'; ctx.fillRect(b.x, b.y, b.w, b.h); }
        ctx.restore();
        roundRect(b.x, b.y, b.w, b.h, 16, null, ok && hit(b, ptr.x, ptr.y) ? C.coral : 'rgba(255,255,255,.75)', 4);
        if (!ok) text('🔒', b.x + b.w / 2, b.y + b.h / 2, 46, C.white);
        roundRect(b.x + 10, b.y + 10, 40, 40, 20, C.coral);
        text(String(n), b.x + 30, b.y + 32, 24, C.white);
        text(ch.title, b.x + b.w / 2, b.y + b.h + 26, 22, ok ? C.white : 'rgba(255,255,255,.5)', { weight: 800 });
        text(ch.months, b.x + b.w / 2, b.y + b.h + 52, 16, ok ? C.sand : 'rgba(255,255,255,.4)', { weight: 600 });
        if (ok) nextButtons.push({ ...b, cb: () => startChapter(n) });
      });
      smallButton('← Volver', 40, H - 78, 170, 52, () => setScene(Title()));
      smallButton(save.teacher ? '✔ Modo docente: todos abiertos' : 'Modo docente: abrir todos', W - 440, H - 78, 400, 52,
        () => { save.teacher = !save.teacher; persist(); });
    },
  };
}

// --------------------------------------------------------------------- álbum
function Album() {
  let open = -1;
  const cw = 186, gap = 18, cols = 5, x0 = (W - cols * cw - (cols - 1) * gap) / 2, y0 = 108;
  const box = (i) => ({ x: x0 + (i % cols) * (cw + gap), y: y0 + Math.floor(i / cols) * (cw + 8), w: cw, h: cw - 14 });
  return {
    enter() { music.play('music_fact_card'); },
    update() {
      if (handleButtons()) return;
      if (open >= 0 && (pressed.Escape || pressed.Space || pressed.Enter || ptr.tap)) { open = -1; ptr.tap = false; return; }
      if (pressed.Escape) setScene(Title());
    },
    draw() {
      ctx.drawImage(IMG.cover, 0, 0, W, H);
      ctx.fillStyle = 'rgba(8,30,48,.88)'; ctx.fillRect(0, 0, W, H);
      drawSprite('icons2', ICON2.album, 330, 62, 0.42);
      text(`Álbum de la temporada · ${save.cards.length} de 15`, W / 2 + 30, 62, 40, C.white, { stroke: C.deep, strokeW: 8 });
      CARD_ORDER.forEach((id, i) => {
        const b = box(i), has = save.cards.includes(id);
        ctx.save(); ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 14); ctx.clip();
        ctx.drawImage(IMG['card_' + id], b.x, b.y - 6, b.w, b.w);
        if (!has) { ctx.fillStyle = 'rgba(14,30,44,.88)'; ctx.fillRect(b.x, b.y, b.w, b.h); }
        ctx.restore();
        roundRect(b.x, b.y, b.w, b.h, 14, null, has ? C.sand : 'rgba(255,255,255,.35)', 3);
        if (has) {
          roundRect(b.x, b.y + b.h - 40, b.w, 40, 0, 'rgba(14,76,110,.85)');
          text(CARDS[id].title, b.x + b.w / 2, b.y + b.h - 19, 15, C.white, { weight: 700 });
          if (open < 0) nextButtons.push({ ...b, cb: () => { open = i; sfx('card_open'); } });
        } else text('?', b.x + b.w / 2, b.y + b.h / 2, 64, 'rgba(255,255,255,.4)');
      });
      smallButton('← Volver', 24, 18, 150, 50, () => setScene(Title()));
      if (open >= 0) {
        nextButtons = [];
        const id = CARD_ORDER[open];
        ctx.fillStyle = 'rgba(8,24,36,.7)'; ctx.fillRect(0, 0, W, H);
        const pw = 1000, ph = 520, px = (W - pw) / 2, py = (H - ph) / 2;
        roundRect(px, py, pw, ph, 32, C.cream, C.sand, 6);
        ctx.save(); ctx.beginPath(); ctx.roundRect(px + 40, py + 50, 420, 420, 22); ctx.clip();
        ctx.drawImage(IMG['card_' + id], px + 40, py + 50, 420, 420); ctx.restore();
        const tx = px + 500, tw = pw - 540;
        const tl = wrap(CARDS[id].title, tw, 40, 800);
        tl.forEach((l, j) => text(l, tx, py + 110 + j * 44, 40, C.deep, { align: 'left', weight: 800 }));
        wrap(CARDS[id].body, tw, 24, 600).forEach((l, j) => text(l, tx, py + 132 + tl.length * 44 + j * 32, 24, C.ink, { align: 'left', weight: 600 }));
        text('Toca para cerrar', tx + tw / 2, py + ph - 46, 20, C.deep, { weight: 700 });
      }
    },
  };
}

// ------------------------------------------------------ resumen de la temporada
function SeasonSummary() {
  let t = 0, record = false;
  return {
    enter() { record = saveBest(); music.play('music_victory', false); sfx('feed_chicks', 0.6); },
    update(dt) {
      t += dt;
      if (Math.random() < dt * 2) burst(rand(80, 760), rand(60, 300), 10, pick(['#ffd34d', C.coral, '#7fe0ff', '#ffffff']), 160, 1.2, 5, 100);
      updateParticles(dt);
      if (handleButtons()) return;
      if (t > 1 && pressed.Enter) newSeason();
    },
    draw() {
      ctx.drawImage(IMG.summary, 0, 0, W, H);
      drawParticles();
      text('¡Temporada completa!', 430, 80, 64, C.white, { stroke: C.deep, strokeW: 12 });
      text('La familia del Gaviotín Chico vuela al norte', 430, 140, 26, C.cream, { stroke: 'rgba(14,76,110,.9)', strokeW: 6 });
      const px = 860, py = 36, pw = 384, ph = 540;
      roundRect(px, py, pw, ph, 28, 'rgba(255,246,230,.96)', C.sand, 5);
      text(`Temporada ${save.season}`, px + pw / 2, py + 44, 30, C.deep);
      const rows = [
        [ICON2.fishDelivered, 'Peces llevados', String(game.stats.fish)],
        [ICON2.shield, 'Amenazas evitadas', String(game.stats.saved)],
        [ICON2.map, 'Sitio del nido', save.site || '—'],
        [ICON2.egg, 'Huevos encontrados', `${game.stats.eggs} de 2`],
        [ICON2.heart, 'Primer vuelo', game.stats.flew ? '¡Lo logró!' : '—'],
        [ICON2.album, 'Álbum', `${save.cards.length} de 15`],
      ];
      rows.forEach(([ic, label, val], i) => {
        const y = py + 100 + i * 52;
        drawSprite('icons2', ic, px + 40, y, 0.28);
        text(label, px + 70, y - 8, 17, C.ink, { align: 'left', weight: 600 });
        text(val, px + 70, y + 14, 21, C.deep, { align: 'left', weight: 800 });
      });
      text(`Puntaje: ${game.score}`, px + pw / 2, py + 432, 30, C.ochre, { weight: 800 });
      if (record) text('¡Nuevo récord!', px + pw / 2, py + 464, 20, C.coral, { weight: 800 });
      smallButton('Nueva temporada', px + 18, py + 478, 220, 48, newSeason, { color: C.coral, size: 19 });
      smallButton('Menú', px + 250, py + 478, 116, 48, () => setScene(Title()), { size: 19 });
      text('Conoce más en gaviotinchico.cl', 430, 560, 22, C.white, { weight: 700, stroke: 'rgba(0,0,0,.6)', strokeW: 6 });
      drawCredits();
    },
  };
  function newSeason() { save.season++; save.next = 1; persist(); startChapter(1); }
}

// Panel del polluelo durante la pesca del capítulo 6.
function drawChickPanel(progress, fedT) {
  roundRect(20, 516, 220, 150, 22, 'rgba(255,246,230,.88)', C.sand, 4);
  const sheet = progress < 0.5 ? 'chick1' : 'chick2';
  const f = fedT > 0 ? 2 : (Math.floor(performance.now() / 400) % 2);
  drawSprite(sheet, f, 130, 640, 0.42, { anchor: 'bottom' });
  text('Tu polluelo', 130, 536, 17, C.deep, { weight: 800 });
  bar(40, 650, 180, 10, progress, C.good);
}

// -------------------------------------------------- capítulo 2: instalarse
function Settle() {
  const SITES = [
    { name: 'Junto a la carretera', x: 167, y: 367, q: 0.2,
      info: [[false, 'Pasan autos y camiones cerca'], [false, 'Luces encendidas toda la noche'], [true, 'Fácil de llegar desde el mar']] },
    { name: 'Junto al pueblo', x: 633, y: 196, q: 0.25,
      info: [[false, 'Personas y perros caminan por aquí'], [false, 'Las luces del pueblo molestan'], [true, 'Muy cerca de la bahía']] },
    { name: 'Área protegida con cerco', x: 1025, y: 333, q: 1,
      info: [[true, 'Cerco y letreros protegen los nidos'], [true, 'Otros gaviotines ya anidan aquí'], [true, 'Lejos de la carretera']] },
    { name: 'Cruce de huellas', x: 750, y: 470, q: 0.35,
      info: [[false, 'Vehículos pasan fuera del camino'], [true, 'Suelo plano y despejado'], [false, 'Sin ninguna protección']] },
    { name: 'Pampa abierta', x: 1042, y: 592, q: 0.75,
      info: [[true, 'Lejos de caminos y luces'], [true, 'Piedrecitas para camuflar los huevos'], [false, 'Sin cerco ni letreros']] },
  ];
  let t = 0, sel = -1, chosen = null, doneT = 0;
  const tern = { x: 120, y: 120 };
  const seen = new Set();
  function inspect(i) { sel = i; seen.add(i); sfx('wing_flap'); }
  function choose(i) {
    chosen = SITES[i]; save.site = chosen.name; save.quality = chosen.q; persist();
    const good = chosen.q >= 0.7;
    game.score += good ? 300 : 80;
    sfx(good ? 'good' : 'bad');
    toast(good ? '¡Buen lugar! Lejos de los peligros, el nido estará más tranquilo.'
      : 'Aquí hay riesgos: durante la incubación llegarán más amenazas.', good ? C.good : '#b5452f', 3.4, true);
  }
  return {
    enter() { music.play('music_title'); toast('Toca un sitio para inspeccionarlo. Luego elige dónde anidar.', C.teal, 4); },
    update(dt) {
      if (blocked()) return;
      t += dt;
      loops.set('desert', 0.3);
      if (sel >= 0) { tern.x = lerp(tern.x, SITES[sel].x, dt * 2.5); tern.y = lerp(tern.y, SITES[sel].y - 70, dt * 2.5); }
      if (chosen) { doneT += dt; if (doneT > 3.4 && !this.finished) { this.finished = true; finishChapter(this); } return; }
      SITES.forEach((s, i) => { if (pressed['Digit' + (i + 1)] || pressed['Numpad' + (i + 1)]) inspect(i); });
      if ((pressed.Enter || pressed.Space) && sel >= 0) choose(sel);
      if (ptr.tap) {
        const i = SITES.findIndex((s) => Math.hypot(ptr.x - s.x, ptr.y - s.y) < 52);
        if (i >= 0) inspect(i);
      }
    },
    drawWorld() { ctx.drawImage(IMG.pampaMap, 0, 0, W, H); },
    draw() {
      this.drawWorld();
      SITES.forEach((s, i) => {
        const on = sel === i, pulse = 1 + 0.08 * Math.sin(t * 4 + i);
        ctx.beginPath(); ctx.arc(s.x, s.y, 34 * pulse, 0, 7);
        ctx.fillStyle = on ? 'rgba(242,140,107,.45)' : 'rgba(255,255,255,.28)'; ctx.fill();
        ctx.lineWidth = on ? 5 : 3; ctx.strokeStyle = chosen === s ? C.good : (on ? C.coral : C.white); ctx.stroke();
        text(String(i + 1), s.x, s.y + 2, 26, C.white, { stroke: C.deep, strokeW: 6 });
        if (seen.has(i) && sel !== i) text(s.q >= 0.7 ? '✓' : '!', s.x + 30, s.y - 28, 22, s.q >= 0.7 ? C.good : C.bad, { stroke: C.white, strokeW: 5 });
      });
      ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(tern.x + 20, tern.y + 90, 34, 10, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      drawSprite('flight', Math.floor(t * 10) % 6, tern.x, tern.y, 0.32);
      if (sel >= 0 && !chosen) {
        const s = SITES[sel], pw = 390, ph = 232;
        const px = clamp(s.x > W / 2 ? s.x - pw - 60 : s.x + 60, 16, W - pw - 16), py = clamp(s.y - ph / 2, 100, H - ph - 70);
        roundRect(px, py, pw, ph, 22, 'rgba(255,246,230,.97)', C.sand, 4);
        text(`${sel + 1} · ${s.name}`, px + 22, py + 34, 24, C.deep, { align: 'left', weight: 800 });
        s.info.forEach(([ok, line], j) => {
          text(ok ? '✓' : '✗', px + 34, py + 78 + j * 36, 24, ok ? C.good : C.bad, { weight: 800 });
          text(line, px + 56, py + 78 + j * 36, 19, C.ink, { align: 'left', weight: 600 });
        });
        smallButton('Anidar aquí', px + 22, py + ph - 64, 190, 48, () => choose(sel), { color: C.coral });
        text('o elige otro sitio', px + 300, py + ph - 40, 16, C.deep, { weight: 600 });
      }
      if (chosen) {
        roundRect(W / 2 - 300, H - 140, 600, 70, 24, 'rgba(14,76,110,.9)', C.white, 3);
        text(`Elegiste: ${chosen.name}`, W / 2, H - 104, 26, C.white, { weight: 800 });
      }
      endDraw({ title: 'Capítulo 2 · Instalarse', bar: seen.size / SITES.length, barColor: C.teal, barIcon: ICON.info });
    },
  };
}

// ------------------------------------------------ capítulo 3: vuelo de cortejo
function courtshipIntro() {
  setScene(Card({ kicker: 'CAPÍTULO 3 · SEGUNDA PARTE', title: 'El vuelo de cortejo',
    body: 'Vuela junto a tu pareja sobre la bahía de Mejillones. Toca la pantalla o presiona Espacio justo cuando cada corazón llegue al círculo.\n\nNecesitas 8 corazones de 12.',
    art: (x, y, t) => drawSprite('pair_flight', Math.floor(t * 8) % 6, x, y, 0.5),
    backdrop: () => { drawPan(IMG.courSky, 0); drawPan(IMG.courWater, 0, H - IMG.courWater.height + 40); },
    next: () => setScene(Courtship()) }));
}
function Courtship() {
  const N = 12, NEED = 8, TX = 400, LANE = 600, SPEED = 340;
  let t = 0, notes = [], nextT = 1.2, spawned = 0, hits = 0, pairY = 330, done = false, doneT = 0, rounds = 1, lockT = 0;
  function reset() { notes = []; nextT = 1.2; spawned = 0; hits = 0; pairY = 330; }
  return {
    enter() { music.play('music_title'); },
    update(dt) {
      if (blocked()) return;
      t += dt;
      loops.set('bay', 0.3);
      if (done) { doneT += dt; if (doneT > 4.2 && !this.finished) { this.finished = true; finishChapter(this); } return; }
      nextT -= dt;
      if (nextT <= 0 && spawned < N) { notes.push({ x: W + 40, done: false }); spawned++; nextT = rand(1.0, 1.5) / Math.min(1.3, difficulty()); }
      for (const n of notes) {
        n.x -= SPEED * dt;
        if (!n.done && n.x < TX - 50) { n.done = true; n.miss = true; }
      }
      lockT = Math.max(0, lockT - dt);
      if (actionPressed() && lockT <= 0) {
        const live = notes.filter((n) => !n.done).sort((a, b) => Math.abs(a.x - TX) - Math.abs(b.x - TX))[0];
        if (live && Math.abs(live.x - TX) < 46) {
          live.done = true; live.hit = true; hits++;
          const perfect = Math.abs(live.x - TX) < 18;
          game.score += perfect ? 60 : 30;
          sfx('tern_call', 0.5); burst(TX, LANE, perfect ? 16 : 9, '#ff8fa3', 180, 0.7, 6, -40);
          pairY = Math.max(200, pairY - 10);
        } else { sfx('bad', 0.4); lockT = 0.45; }   // tocar a destiempo bloquea un instante: hay que seguir el ritmo
      }
      notes = notes.filter((n) => n.x > -60);
      if (spawned === N && !notes.some((n) => !n.done)) {
        if (hits >= NEED) { done = true; game.score += 200; sfx('good'); toast('¡Se formó la pareja!', C.good, 3, true); }
        else { rounds++; toast(`${hits} de ${NEED}: la pareja quiere intentarlo otra vez.`, C.teal, 2.6); reset(); }
      }
    },
    drawWorld() {
      drawPan(IMG.courSky, t / 60);
      drawPan(IMG.courWater, t / 40, H - IMG.courWater.height + 40);
    },
    draw() {
      if (done && doneT > 1) {
        drawChapterArt(3);
        const a = Math.min(1, (doneT - 1) * 2);
        ctx.globalAlpha = a;
        roundRect(W / 2 - 330, 40, 660, 84, 28, 'rgba(14,76,110,.9)', C.white, 3);
        text('¡Se formó la pareja!', W / 2, 84, 40, C.white, { weight: 800 });
        ctx.globalAlpha = 1;
        endDraw({ title: 'Capítulo 3 · El cortejo' });
        return;
      }
      this.drawWorld();
      drawSprite('pair_flight', Math.floor(t * 10) % 6, TX, pairY + Math.sin(t * 2) * 8, 0.7);
      roundRect(60, LANE - 6, W - 120, 12, 6, 'rgba(255,255,255,.35)');
      const ring = 1 + 0.1 * Math.sin(t * 8);
      ctx.beginPath(); ctx.arc(TX, LANE, 40 * ring, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = C.white; ctx.stroke();
      for (const n of notes) {
        if (n.hit) continue;
        drawSprite('icons', ICON.heart, n.x, LANE, 0.42, { alpha: n.miss ? 0.3 : 1 });
      }
      endDraw({ title: `Capítulo 3 · El cortejo   ❤ ${hits}/${NEED}`, bar: spawned / N, barColor: '#ff8fa3', barIcon: ICON.heart });
    },
  };
}

// -------------------------------------------------- capítulo 4: nido y huevos
function makeStone(x, y, egg) {
  // Colores tomados del suelo de la pampa: los huevos se confunden con las piedras.
  const cols = ['#8a6f4e', '#a2825c', '#6f5a43', '#b39470', '#c29c6c', '#7d6a58', '#9b8b7a'];
  return { x, y, egg, rot: rand(-0.6, 0.6), rx: egg ? 15 : rand(9, 19), ry: egg ? 11 : rand(7, 13), col: egg ? '#b9976a' : pick(cols),
    sp: Array.from({ length: egg ? 9 : (Math.random() < 0.5 ? 4 : 0) }, () => [rand(-0.7, 0.7), rand(-0.6, 0.6), rand(1, 2.4)]) };
}
function drawStone(o, s = 1) {
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(2, 4, o.rx, o.ry * 0.8, 0, 0, 7); ctx.fill();
  ctx.fillStyle = o.col; ctx.beginPath(); ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-o.rx * 0.3, -o.ry * 0.35, o.rx * 0.45, o.ry * 0.3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5b4632';
  for (const [a, b, r] of o.sp) { ctx.beginPath(); ctx.arc(a * o.rx, b * o.ry, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawShell(x, y, rot, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#f3dcc8'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.arc(0, 10, 16, Math.PI * 1.08, Math.PI * 1.92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9a487'; ctx.lineWidth = 1.5;
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(Math.sin(k * 0.22) * 15, 10 - Math.cos(k * 0.22) * 15); ctx.stroke(); }
  ctx.restore();
}
function NestBuild() {
  const NEST = { x: 640, y: 478 }, GOAL = 8;
  let t = 0, part = 'build', placed = 0, partT = 0, found = 0, hints = 2, hintT = 0, hintEgg = null, timeLeft = 30;
  // Siempre 12 piezas, repartidas lejos del nido y sin encimarse.
  const items = [];
  while (items.length < 12) {
    const x = rand(100, W - 100), y = rand(400, 670);
    if (Math.hypot(x - NEST.x, y - NEST.y) < 160 || items.some((o) => Math.hypot(o.x - x, o.y - y) < 80)) continue;
    const st = makeStone(0, 0, false); st.col = pick(['#e9dcc4', '#d8c7a6', '#f0e6d2']);
    items.push({ kind: items.length % 3 === 0 ? 'shell' : 'stone', st, x, y, rot: rand(-1, 1), fly: null, done: false });
  }
  const nestBits = [];
  let field = [];
  function setupFind() {
    field = [];
    const eggs = [];
    for (let k = 0; k < 2; k++) eggs.push(makeStone(rand(200, W - 200), rand(450, 650), true));
    for (let k = 0; k < 70; k++) {
      const x = rand(60, W - 60), y = rand(400, 690);
      if (eggs.some((e) => Math.hypot(e.x - x, e.y - y) < 40)) continue;
      field.push(makeStone(x, y, false));
    }
    field.push(...eggs);
    field.sort((a, b) => a.y - b.y);
  }
  function collect(it) {
    if (!it || it.fly || it.done) return;
    it.fly = { t: 0, x0: it.x, y0: it.y, x1: NEST.x + rand(-54, 54), y1: NEST.y + rand(-12, 14) };
    sfx('click', 0.6);
  }
  return {
    enter() { music.play('music_phase3_day'); toast('Toca las piedrecitas y conchas para llevarlas al nido.', C.teal, 3.5); },
    update(dt) {
      if (blocked()) return;
      t += dt; partT += dt;
      loops.set('desert', 0.3);
      if (part === 'build') {
        if (ptr.tap) {
          const it = items.filter((i) => !i.fly && !i.done).find((i) => Math.hypot(ptr.x - i.x, ptr.y - i.y) < 40);
          collect(it);
        }
        if (pressed.Space || pressed.Enter) {
          const it = items.filter((i) => !i.fly && !i.done).sort((a, b) => Math.hypot(a.x - NEST.x, a.y - NEST.y) - Math.hypot(b.x - NEST.x, b.y - NEST.y))[0];
          collect(it);
        }
        for (const it of items) {
          if (!it.fly || it.done) continue;
          it.fly.t += dt * 1.8;
          const k = Math.min(1, it.fly.t);
          it.x = lerp(it.fly.x0, it.fly.x1, k); it.y = lerp(it.fly.y0, it.fly.y1, k) - Math.sin(k * Math.PI) * 120;
          if (k >= 1) { it.done = true; placed++; nestBits.push(it); game.score += 25; burst(it.x, it.y, 6, '#e8d2a8', 90, 0.4, 3, 200); }
        }
        if (placed >= GOAL) { part = 'eggs'; partT = 0; sfx('good'); toast('¡Nido listo! Ahora la hembra pone 2 huevos con manchas.', C.good, 3); }
      } else if (part === 'eggs') {
        if (partT > 3.2) { part = 'find'; partT = 0; setupFind(); toast('¿Dónde están los huevos? Tócalos. Usa los binoculares (Espacio) si necesitas ayuda.', C.teal, 4.5, true); }
      } else if (part === 'find') {
        timeLeft -= dt; hintT = Math.max(0, hintT - dt);
        if ((pressed.Space || pressed.Enter) && hints > 0 && hintT <= 0) {
          hints--; hintT = 1.6; hintEgg = field.find((s) => s.egg && !s.found); sfx('click');
        }
        if (ptr.tap) {
          const e = field.find((s) => s.egg && !s.found && Math.hypot(ptr.x - s.x, ptr.y - s.y) < 26);
          if (e) { e.found = true; found++; game.score += 150; sfx('good'); burst(e.x, e.y, 12, '#ffd34d', 140, 0.6, 5, 0); }
          else { sfx('bad', 0.4); }
        }
        if (found >= 2 || timeLeft <= 0) {
          part = 'end'; partT = 0; game.stats.eggs = found;
          for (const s of field) if (s.egg) s.found = true;
          toast(found >= 2 ? '¡Los encontraste! Así de bien se camuflan.' : 'Aquí estaban: el camuflaje los hace casi invisibles.', found >= 2 ? C.good : C.teal, 3.2, true);
        }
      } else if (part === 'end' && partT > 3.4 && !this.finished) { this.finished = true; finishChapter(this); }
    },
    drawWorld() { ctx.drawImage(part === 'find' || part === 'end' ? IMG.nestAfternoon : IMG.nestMidday, 0, 0, W, H); },
    draw() {
      this.drawWorld();
      if (part === 'build' || part === 'eggs') {
        ctx.fillStyle = 'rgba(70,50,30,.35)'; ctx.beginPath(); ctx.ellipse(NEST.x, NEST.y, 78, 26, 0, 0, 7); ctx.fill();
        ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke(); ctx.setLineDash([]);
        for (const it of items) {
          if (!it.done && !it.fly) {
            const r = 36 + Math.sin(t * 5 + it.x) * 4;
            ctx.beginPath(); ctx.arc(it.x, it.y, r, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
            ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
          }
          if (it.kind === 'shell') drawShell(it.x, it.y, it.rot, it.done ? 0.9 : 1.6);
          else { it.st.x = it.x; it.st.y = it.y; drawStone(it.st, it.done ? 0.9 : 1.6); }
        }
        if (part === 'eggs') drawItem('nest_eggs', NEST.x, NEST.y + 18, 0.32 * Math.min(1, partT * 2), { anchor: 'bottom' });
        drawSprite('flight', Math.floor(t * 12) % 6, NEST.x + 150, 360 + Math.sin(t * 2) * 12, 0.42, { flip: true });
      } else {
        for (const s of field) {
          drawStone(s);
          if (s.egg && s.found) { ctx.beginPath(); ctx.arc(s.x, s.y, 30, 0, 7); ctx.lineWidth = 4; ctx.strokeStyle = C.good; ctx.stroke(); }
        }
        if (hintT > 0 && hintEgg) {
          ctx.beginPath(); ctx.arc(hintEgg.x + rand(-30, 30), hintEgg.y + rand(-20, 20), 80, 0, 7);
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,224,138,.9)'; ctx.stroke();
        }
        if (part === 'find') {
          drawSprite('icons2', ICON2.binoculars, 70, H - 80, 0.4, { alpha: hints > 0 ? 1 : 0.35 });
          text(`× ${hints}`, 110, H - 80, 24, C.white, { align: 'left', stroke: C.deep, strokeW: 5 });
          text(`Huevos: ${found} de 2   ·   ${Math.max(0, Math.ceil(timeLeft))} s`, W / 2, H - 40, 26, C.white, { stroke: C.deep, strokeW: 6 });
        }
      }
      const title = part === 'build' ? `Capítulo 4 · Arma el nido   ${placed}/${GOAL}` : 'Capítulo 4 · Encuentra los huevos';
      endDraw({ title, bar: part === 'build' ? placed / GOAL : found / 2, barColor: C.sand, barIcon: ICON.egg });
    },
  };
}

// -------------------------------------------------- capítulo 7: crecer y volar
function GrowUp() {
  const DUR = 46, CHICK = { x: 620, y: 540 }, ADULT = { x: 800, y: 556 };
  const TYPES = {
    fox: { f: 0, s: 0.8, v: 70, label: 'Un zorro' },
    cat: { f: 8, s: 0.66, v: 62, label: 'Un gato' },
    gull: { f: 12, s: 0.62, v: 150, label: 'Una gaviota' },
  };
  let t = 0, ents = [], spawnT = 3, heat = null, heatT = 8, shadeT = 0, swoop = null, stage = 2, done = false, doneT = 0, saved = 0;
  function spawn() {
    const pool = ['fox', 'cat', 'gull'], type = pick(pool), d = TYPES[type];
    if (type === 'gull') ents.push({ type, d, x: rand(200, W - 200), y: -60, state: 'come' });
    else { const left = Math.random() < 0.5; ents.push({ type, d, x: left ? -120 : W + 120, y: CHICK.y + rand(10, 60), dir: left ? 1 : -1, state: 'come' }); }
  }
  function scare(e) {
    if (!e || e.state !== 'come') return;
    e.state = 'leave'; saved++; game.stats.saved++; game.score += 100;
    swoop = { t: 0, x0: ADULT.x, y0: ADULT.y - 60, x1: e.x, y1: e.y - 60 };
    sfx('tern_call'); sfx('good', 0.4);
  }
  function shade() {
    if (shadeT > 0) return;
    shadeT = 6; sfx('click');
    if (heat) { heat = null; game.score += 80; toast('¡Bien! La sombra protege al polluelo del calor.', C.good, 2); }
  }
  return {
    enter() { music.play('music_phase3_day'); },
    update(dt) {
      if (blocked()) return;
      t += dt; shadeT = Math.max(0, shadeT - dt);
      loops.set('desert', 0.35);
      if (done) { doneT += dt; if (doneT > 2.4 && !this.finished) { this.finished = true; firstFlightIntro(); } return; }
      if (t > DUR * 0.5 && stage === 2) { stage = 3; toast('¡Ya le están saliendo plumas! Pronto podrá volar.', C.teal, 2.6); }
      spawnT -= dt;
      if (spawnT <= 0 && t < DUR - 4) { spawn(); spawnT = rand(4, 6) / difficulty(); }
      heatT -= dt;
      if (!heat && heatT <= 0 && t < DUR - 6) { heat = { v: 0 }; heatT = rand(10, 13); sfx('tired', 0.5); toast('¡El sol quema! Dale sombra al polluelo.', '#c9662f', 2.4); }
      if (heat) {
        heat.v += dt / 6;
        if (heat.v >= 1) { heat = null; loseLife('El polluelo pasó mucho calor: dale sombra a tiempo.', 'nest_alarm'); }
      }
      if (pressed.KeyS || pressed.Digit2 || pressed.Numpad2) shade();
      const live = ents.filter((e) => e.state === 'come');
      if (pressed.Space || pressed.Enter || pressed.Digit1) scare(live.sort((a, b) => Math.hypot(a.x - CHICK.x, a.y - CHICK.y) - Math.hypot(b.x - CHICK.x, b.y - CHICK.y))[0]);
      if (ptr.tap) {
        const e = live.find((e2) => Math.hypot(ptr.x - e2.x, ptr.y - (e2.y - 50)) < 90);
        if (e) scare(e);
      }
      for (const e of ents) {
        if (e.type === 'gull') {
          if (e.state === 'come') { const a = Math.atan2(CHICK.y - 40 - e.y, CHICK.x - e.x); e.x += Math.cos(a) * e.d.v * dt; e.y += Math.sin(a) * e.d.v * dt; }
          else { e.y -= 260 * dt; e.x += 120 * dt; if (e.y < -120) e.dead = true; }
        } else if (e.state === 'come') e.x += e.dir * e.d.v * dt * difficulty();
        else { e.x -= e.dir * e.d.v * 2.4 * dt; if (e.x < -200 || e.x > W + 200) e.dead = true; }
        if (e.state === 'come' && Math.hypot(e.x - CHICK.x, (e.y - (e.type === 'gull' ? 40 : 0)) - CHICK.y) < 80) {
          e.state = 'leave'; loseLife(`¡${e.d.label} se acercó demasiado al polluelo!`, 'nest_alarm');
        }
      }
      ents = ents.filter((e) => !e.dead);
      if (swoop) { swoop.t += dt * 2.5; if (swoop.t >= 2) swoop = null; }
      if (t >= DUR && !ents.some((e) => e.state === 'come')) { done = true; sfx('good'); toast('¡El polluelo ya es un juvenil!', C.good, 2.4); }
    },
    drawWorld() {
      const k = clamp((t - DUR * 0.5) / 4, 0, 1);
      ctx.drawImage(IMG.nestMidday, 0, 0, W, H);
      if (k > 0) { ctx.globalAlpha = k; ctx.drawImage(IMG.nestAfternoon, 0, 0, W, H); ctx.globalAlpha = 1; }
    },
    draw() {
      this.drawWorld();
      if (heat) {
        const g = ctx.createRadialGradient(W - 140, 120, 20, W - 140, 120, 520);
        g.addColorStop(0, `rgba(255,170,60,${0.35 * heat.v})`); g.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        drawSprite('heat', HEAT.sun, W - 140, 150, 0.8 + 0.05 * Math.sin(t * 6));
        drawSprite('heat', HEAT.thermo, W - 60, 230, 0.5);
        bar(W - 220, 260, 140, 14, heat.v, C.bad);
      }
      const near = ents.some((e) => e.state === 'come' && Math.hypot(e.x - CHICK.x, e.y - CHICK.y) < 280);
      const sheet = stage === 2 ? 'chick2' : 'chick3';
      const cf = near ? 3 : heat ? 1 : (Math.floor(t * 1.5) % 6 === 5 ? 1 : 0);
      drawSprite(sheet, cf, CHICK.x, CHICK.y, 0.8, { anchor: 'bottom' });
      if (shadeT > 0) drawSprite('heat', HEAT.shade, CHICK.x, CHICK.y - 110, 1.4, { alpha: Math.min(1, shadeT) });
      if (!swoop) drawSprite('offer_fish', 6 + Math.floor(t * 2) % 2, ADULT.x, ADULT.y, 0.78, { anchor: 'bottom', flip: true });
      else {
        const k = swoop.t <= 1 ? swoop.t : 2 - swoop.t;
        drawSprite('flight', Math.floor(t * 14) % 6, lerp(swoop.x0, swoop.x1, k), lerp(swoop.y0, swoop.y1, k) - Math.sin(k * Math.PI) * 80, 0.48, { flip: swoop.x1 < swoop.x0 });
      }
      for (const e of [...ents].sort((a, b) => a.y - b.y)) {
        const f = e.d.f + Math.floor(t * 8) % 4;
        if (e.type === 'gull') drawSprite('predators', f, e.x, e.y, e.d.s, { flip: e.x < CHICK.x });
        else drawSprite('predators', e.state === 'come' && e.type === 'fox' && Math.abs(e.x - CHICK.x) < 360 ? 4 + Math.floor(t * 6) % 4 : f,
          e.x, e.y, e.d.s, { anchor: 'bottom', flip: e.state === 'come' ? e.dir > 0 : e.dir < 0 });
        if (e.state === 'come') text('▼', e.x, e.y - (e.type === 'gull' ? 90 : 170), 28, C.coral, { stroke: C.white, strokeW: 5 });
      }
      const bx = W / 2 - 110, by = 24 + 64;
      roundRect(bx, H - 104, 220, 80, 24, heat ? (Math.floor(t * 4) % 2 ? C.coral : '#d9663d') : 'rgba(14,76,110,.85)', C.white, 3);
      drawSprite('heat', HEAT.shade, bx + 46, H - 64, 0.45);
      text('Dar sombra', bx + 140, H - 64, 22, C.white, { weight: 800 });
      nextButtons.push({ x: bx, y: H - 104, w: 220, h: 80, cb: shade });
      void by;
      endDraw({ title: `Capítulo 7 · Crecer y volar   ✔ ${saved}`, bar: Math.min(1, t / DUR), barColor: C.good, barIcon: ICON.heart });
    },
  };
}
function firstFlightIntro() {
  setScene(Card({ kicker: 'CAPÍTULO 7 · SEGUNDA PARTE', title: 'El primer vuelo',
    body: 'El juvenil está listo para volar. Toca la pantalla o presiona Espacio muchas veces y rápido para que aletee con fuerza y despegue.',
    art: (x, y, t) => drawSprite('juvenile', 4 + Math.floor(t * 8) % 4, x, y, 0.5),
    backdrop: () => ctx.drawImage(IMG.nestAfternoon, 0, 0, W, H), next: () => setScene(FirstFlight()) }));
}
function FirstFlight() {
  let t = 0, power = 0, flying = false, flyT = 0, x = 560, y = 560;
  return {
    enter() { music.play('music_title'); },
    update(dt) {
      if (blocked()) return;
      t += dt;
      loops.set('desert', 0.3);
      if (flying) {
        flyT += dt; x += 260 * dt; y -= 170 * dt;
        if (flyT > 3.4 && !this.finished) { this.finished = true; finishChapter(this); }
        return;
      }
      power = Math.max(0, power - dt * 0.32);
      if (actionPressed()) { power = Math.min(1, power + 0.085); sfx('wing_flap', 0.4); }
      if (power >= 1) { flying = true; game.stats.flew = true; game.score += 300; sfx('good'); sfx('tern_call'); toast('¡Despegó! Su primer vuelo sobre la pampa.', C.good, 3, true); }
    },
    drawWorld() { ctx.drawImage(IMG.nestAfternoon, 0, 0, W, H); },
    draw() {
      this.drawWorld();
      const f = flying ? 6 + Math.floor(t * 10) % 2 : power < 0.25 ? Math.floor(t * 6) % 2 : power < 0.5 ? 2 + Math.floor(t * 8) % 2 : power < 0.8 ? 4 + Math.floor(t * 10) % 2 : 6 + Math.floor(t * 12) % 2;
      const lift = flying ? 0 : power * 70;
      drawSprite('juvenile', f, x, y - lift, 0.85, { anchor: 'bottom' });
      if (flying) {
        drawSprite('flight', Math.floor(t * 12) % 6, x - 160, y - 160, 0.45);
        drawSprite('flight', (Math.floor(t * 12) + 3) % 6, x + 120, y - 220, 0.45);
      } else {
        roundRect(x + 110, 360, 30, 240, 15, 'rgba(0,0,0,.35)', C.white, 3);
        roundRect(x + 113, 363 + 234 * (1 - power), 24, Math.max(10, 234 * power), 12, power > 0.8 ? C.good : C.coral);
        text('¡Aletea!', x + 125, 330, 26, C.white, { stroke: C.deep, strokeW: 6 });
        text('Toca rápido o presiona Espacio', W / 2, H - 46, 26, C.white, { stroke: C.deep, strokeW: 6, alpha: 0.7 + 0.3 * Math.sin(t * 5) });
      }
      endDraw({ title: 'Capítulo 7 · El primer vuelo', bar: power, barColor: C.coral, barIcon: ICON.heart });
    },
  };
}

// ---------------------------------------------------- capítulo 8: la partida
function Departure() {
  const DUR = 32, pl = { x: 360, y: 300 };
  let t = 0, dist = 0, stars = [], starT = 1.5, done = false, doneT = 0;
  return {
    enter() { music.play('music_title'); sfx('tern_call'); },
    update(dt) {
      if (blocked()) return;
      t += dt; dist += 200 * dt;
      loops.set('bay', 0.3);
      let dy = (keys.ArrowDown || keys.KeyS ? 1 : 0) - (keys.ArrowUp || keys.KeyW ? 1 : 0);
      if (ptr.down) dy = clamp((ptr.y - pl.y) / 50, -1, 1);
      pl.y = clamp(pl.y + dy * 300 * dt, 110, 470);
      if (done) {
        doneT += dt; pl.x += 300 * dt;
        if (doneT > 3 && !this.finished) { this.finished = true; finishChapter(this); }
        return;
      }
      starT -= dt;
      if (starT <= 0 && t < DUR - 3) { const y = rand(130, 450); for (let i = 0; i < 3; i++) stars.push({ x: W + 60 + i * 70, y: y + Math.sin(i) * 26 }); starT = rand(2.2, 3.4); }
      for (const s of stars) {
        s.x -= 240 * dt;
        if (!s.got && Math.abs(s.x - pl.x) < 90 && Math.abs(s.y - pl.y) < 60) { s.got = true; game.score += 50; sfx('star'); burst(s.x, s.y, 10, '#ffd34d', 140, 0.5, 5, 0); }
      }
      stars = stars.filter((s) => s.x > -60 && !s.got);
      if (t >= DUR) { done = true; toast('¡Hasta la próxima temporada, Mejillones!', C.coral, 3, true); }
    },
    drawWorld() {
      drawPan(IMG.depSky, t / (DUR + 3) * 0.4);
      drawPan(IMG.depWater, t / (DUR + 3), H - IMG.depWater.height + 20);
    },
    draw() {
      this.drawWorld();
      for (const s of stars) drawSprite('icons', ICON.star, s.x, s.y + Math.sin(t * 4 + s.x * 0.01) * 6, 0.34);
      const fw = IMG.family.width * 0.4, fh = IMG.family.height * 0.4;
      ctx.save(); ctx.translate(pl.x, pl.y + Math.sin(t * 3) * 6); ctx.scale(-1, 1);
      ctx.drawImage(IMG.family, -fw / 2, -fh / 2, fw, fh); ctx.restore();
      endDraw({ title: 'Capítulo 8 · La partida', bar: Math.min(1, t / DUR), barColor: C.coral, barIcon: ICON.star });
    },
  };
}
