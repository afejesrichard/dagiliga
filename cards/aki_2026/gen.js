// Renders one shareable PNG per manager for Aki 2026 (1080x1350, Messenger friendly).
const fs = require('fs'), path = require('path');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const A = require('./aki_fantasy.json');
const OUT = __dirname;
fs.mkdirSync(OUT, { recursive: true });

const managers = [
  { owner: 'Márk Vrabély', first: 'Márk', file: 'mark', team: 'сумо', color: '#f8961e', place: '1st', tag: 'Aki champion · back-to-back',
    season: 'Season: 385 pts, leads by 22 with one basho left',
    facts: [
      { icon: '🏆', name: 'Repeat Offender', text: 'Back-to-back champion. The first manager ever to defend a Dagi Liga title.' },
      { icon: '🛋️', name: 'Rent-Free at the Top', text: 'Led or shared the lead after 14 of 15 days. Never dropped below 2nd.' },
      { icon: '🔕', name: 'Do Not Disturb', text: '30 straight days without a single swap across Nagoya and Aki. Two titles.' },
      { icon: '🎯', name: 'Friendly Fire Champion', text: 'His picks beat rivals’ picks 28 times and lost 9, the best record in the league’s civil war.' }
    ] },
  { owner: 'Dorka FJ', first: 'Dorka', file: 'dorka', team: 'Tokások', color: '#9b5de5', place: 'T-2', tag: 'Joint runner-up',
    season: 'Season: 343 pts, tied 4th',
    facts: [
      { icon: '🏠', name: 'Top-Four Tenant', text: 'Never outside the top four on any of the fifteen nights. Only Márk can say the same.' },
      { icon: '🎤', name: 'One Night Only', text: 'The only manager to take the lead off Márk: a perfect 8 on Day 6. Day 7 answered with 0-for-4.' },
      { icon: '🍷', name: 'Kimarite Connoisseur', text: 'Ura’s ten wins came by six different kimarite, including the only sotogake of the basho.' },
      { icon: '🔄', name: 'The Swap That Changed Nothing', text: 'Kotoeiho went 2-9 for her and 3-1 after she cut him. Takayasu, his replacement, also went 3-1.' }
    ] },
  { owner: 'DJ_Pongo_Pongo', first: 'DJ_Pongo', file: 'dj_pongo', team: 'Kövér utcai Uszoda', color: '#43aa8b', place: 'T-2', tag: 'Joint runner-up',
    season: 'Season: 342 pts, 6th, one point off 4th',
    facts: [
      { icon: '🌙', name: 'Last Bout Standing', text: 'The only owner of the yokozuna. Onosato: 24 points, and the last bout of the day, every day.' },
      { icon: '🦵', name: 'Three-Man Team', text: 'Carried the kyūjō Wakanosho for six days (six zeros) and still finished joint 2nd.' },
      { icon: '🚀', name: 'Comeback Kid', text: 'Joint last after Day 4. One three-man swap on Day 7, then the best second half in the league.' },
      { icon: '📸', name: 'Photo Finish', text: 'The final bout of the basho, Onosato over Aonishiki, lifted him from a share of 4th to a share of 2nd.' }
    ] },
  { owner: 'Sándor Szilágyi', first: 'Sándor', file: 'sandor', team: 'DigiDagi', color: '#577590', place: 'T-4', tag: 'Shared 2nd until the last day',
    season: 'Season: 359 pts, 3rd, four behind Richard',
    facts: [
      { icon: '🏋️', name: 'The Barbell', text: 'Ōzeki, Sekiwake, Maegashira 16 and 17. Zero points from anything in between.' },
      { icon: '🤏', name: 'So Close', text: 'Level with Márk at the top after Day 10. Still sharing 2nd going into senshūraku.' },
      { icon: '4️⃣', name: 'Four, Four, Four, Four, Four', text: 'Scored exactly 4 on ten of the fifteen days, five of them in a row.' },
      { icon: '🧨', name: 'Senshūraku Sandbagged', text: 'Day 15: four losses, to DJ’s Onosato, Ricsi’s Fujinokawa, Hiradoumi and a Jūryō call-up. One win would have kept 2nd.' }
    ] },
  { owner: 'Mátyás Fazakas', first: 'Mátyás', file: 'matyas', team: 'Tokyo Töpörtyűk', color: '#4ecdc4', place: 'T-4', tag: 'The steadiest team on the board',
    season: 'Season: 343 pts, tied 4th',
    facts: [
      { icon: '😐', name: 'Aggressively Average', text: 'Four picks who finished a combined 32-28, every one of them within a single win of .500.' },
      { icon: '📏', name: 'No Highs, No Lows', text: 'No perfect day and no zero: nothing above 6, nothing below 2. The steadiest team in the league.' },
      { icon: '🗡️', name: 'Giant Slayer', text: '15 wins over higher-ranked opponents, the most of anyone.' },
      { icon: '🎁', name: 'Free Points Inside', text: 'Two points from a bout nobody fought (Fujiryoga’s fusen, Day 12). Climbed from 6th to T-4 over the last three days.' }
    ] },
  { owner: 'Radish Master 888', first: 'Radish Master 888', file: 'radish', team: 'Abszolút Túlsúly 💪', color: '#90be6d', place: 'T-6', tag: 'Back after three bashos away',
    season: 'Season: 117 pts from two bashos',
    facts: [
      { icon: '🚪', name: 'The Prodigal Manager', text: 'Back after eight months off: 59, one point more than his Hatsu.' },
      { icon: '🎢', name: 'Peaks and Potholes', text: 'Won or shared the daily high score six times, more than anyone. Also two zeros in a row on Days 9 and 10.' },
      { icon: '🛡️', name: 'Human Shield', text: 'His picks lost 64 points to rival-owned rikishi, the most friendly fire any team absorbed.' },
      { icon: '😈', name: 'Agent of Chaos', text: 'Kotozakura beat Onosato on Day 14 and turned senshūraku into a straight final for the Emperor’s Cup.' }
    ] },
  { owner: 'Csilla Virág', first: 'Csilla', file: 'csilla', team: 'best sumo team ever (?)', color: '#ff6b6b', place: 'T-6', tag: 'Best single day of the basho',
    season: 'Season: 325 pts, 7th',
    facts: [
      { icon: '🐱', name: 'Nine Lives', text: 'The best single day of Aki: 9 points on Day 4, four wins plus the only kinbōshi of the tournament.' },
      { icon: '👀', name: 'Breathing Down His Neck', text: '2nd in the league after Day 7 and again after Day 9, one point behind Márk at one stage.' },
      { icon: '⚔️', name: 'Civil War Veteran', text: 'Day 9: all four of her picks were drawn against each other. Her score was fixed at 4 before a bout was fought.' },
      { icon: '✨', name: 'Biggest Glow-Up', text: 'The only manager to score more than in Nagoya. As played, 36 to 59: the biggest rise in league history.' }
    ] },
  { owner: 'Richard Fejes', first: 'Ricsi', file: 'ricsi', team: 'Tokazachi Kövér Sportegyesület (TKSE)', color: '#f9c74f', place: '8th', tag: 'Still 2nd in the season race',
    season: 'Season: 363 pts, 2nd, 22 behind Márk',
    facts: [
      { icon: '🔧', name: 'Tinkerer-in-Chief', text: '11 rikishi used and 7 pick changes, more than the other seven managers combined.' },
      { icon: '🎸', name: 'Two-Man Band', text: 'Fujinokawa (23 points, Kantō-shō) and Takerufuji gave him 41 of his 57. He owned Fujinokawa alone all basho, for the second tournament running.' },
      { icon: '🪜', name: 'Ceiling Reached', text: 'Day 1 ceiling was 4: two of his picks were drawn against each other and Wakanosho was kyūjō. He scored 4.' },
      { icon: '🔪', name: 'Revenge of the Benched', text: 'Dropped Wakamotoharu before Day 14. Wakamotoharu then beat Takerufuji, Ricsi’s own pick.' }
    ] }
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function rosterLine(t) {
  const r = {};
  t.lineups.forEach(l => l.forEach(x => { r[x.rikishi] = r[x.rikishi] || { pts: 0, days: 0 }; r[x.rikishi].pts += x.pts; r[x.rikishi].days++; }));
  const list = Object.entries(r).sort((a, b) => b[1].pts - a[1].pts || b[1].days - a[1].days);
  const shown = list.slice(0, 5);
  const more = list.length - shown.length;
  return shown.map(([n, v]) => `<span class="chip"><b>${n}</b> ${v.pts}${v.days < 15 ? `<i> · ${v.days}d</i>` : ''}</span>`).join('')
    + (more > 0 ? `<span class="chip muted">+${more} more</span>` : '');
}

function html(m, t) {
  const max = 9;
  const tiles = t.daily.map((v, i) => {
    const a = v === 0 ? 0 : 0.18 + 0.82 * (v / max);
    return `<div class="tile" style="background:${v === 0 ? 'transparent' : m.color};opacity:${v === 0 ? 1 : a.toFixed(2)};${v === 0 ? 'border:2px solid #3a3a5a' : ''}">
      <span class="tv" style="${v === 0 ? 'color:#7a7a9a' : ''}">${v}</span><span class="td">D${i + 1}</span></div>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Sans+JP:wght@700;900&display=swap" rel="stylesheet">
<style>
  :root{--bg:#080810;--card:#111122;--text:#eaeaea;--muted:#7a7a9a;--border:#252550;--gold:#ffd700;--c:${m.color}}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;background:var(--bg);color:var(--text);font-family:'Inter','Liberation Sans','Noto Sans JP','Noto Color Emoji',sans-serif;overflow:hidden;position:relative}
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle, var(--c) 0%, transparent 60%);opacity:.16;top:-380px;right:-300px}
  .wrap{position:relative;padding:64px 72px 56px;height:100%;display:flex;flex-direction:column}
  .top{display:flex;justify-content:space-between;align-items:center;font-size:22px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:600}
  .top .jp{font-family:'Noto Sans JP','IPAPGothic',sans-serif;letter-spacing:6px;color:var(--gold)}
  .place{display:inline-block;align-self:flex-start;margin-top:44px;padding:10px 22px;border-radius:999px;background:var(--c);color:#0b0b14;font-weight:900;font-size:26px;letter-spacing:2px}
  h1{font-size:88px;font-weight:900;line-height:1.02;margin-top:18px;letter-spacing:-2px}
  .team{font-size:34px;color:var(--muted);margin-top:10px;font-weight:600}
  .hero{display:flex;align-items:flex-end;gap:26px;margin-top:38px}
  .hero .num{font-size:180px;font-weight:900;line-height:.9;letter-spacing:-8px;color:var(--c)}
  .hero .lbl{padding-bottom:22px}
  .hero .lbl .pts{font-size:34px;font-weight:800}
  .hero .lbl .tag{font-size:26px;color:var(--muted);margin-top:6px}
  .strip{display:grid;grid-template-columns:repeat(15,1fr);gap:8px;margin-top:40px}
  .tile{height:86px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .tv{font-size:30px;font-weight:900;color:#0b0b14}
  .td{font-size:15px;font-weight:700;color:#0b0b14;opacity:.75;margin-top:2px}
  .tile[style*="transparent"] .td{color:#7a7a9a}
  .caption{font-size:20px;color:var(--muted);margin-top:12px;letter-spacing:1px}
  .chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
  .chip{padding:10px 16px;border-radius:12px;background:var(--card);border:1px solid var(--border);font-size:24px}
  .chip b{font-weight:800}.chip i{font-style:normal;color:var(--muted);font-size:20px}.chip.muted{color:var(--muted)}
  .facts{margin-top:26px;margin-bottom:22px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly;gap:14px}
  .fact{display:flex;gap:18px;align-items:flex-start}
  .fact .badge{flex:0 0 64px;height:64px;border-radius:16px;background:var(--card);border:2px solid var(--c);display:flex;align-items:center;justify-content:center;font-size:32px;font-family:'Noto Color Emoji',sans-serif}
  .ftxt{display:flex;flex-direction:column;gap:4px}
  .fname{font-size:27px;font-weight:900;letter-spacing:.3px;color:var(--c)}
  .fdesc{font-size:23px;line-height:1.32;color:var(--text)}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid var(--border);padding-top:22px;font-size:22px;color:var(--muted)}
  .foot b{color:var(--text);font-weight:700}
  .foot .brand{font-weight:900;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
</style></head><body>
<div class="glow"></div>
<div class="wrap">
  <div class="top"><span>Dagi Liga · Aki 2026</span><span class="jp">秋場所</span><span>Tokyo · Sept 13–27</span></div>
  <span class="place">${m.place} of 8</span>
  <h1>${esc(m.first)}</h1>
  <div class="team">${esc(m.team)}</div>
  <div class="hero"><div class="num">${t.total}</div><div class="lbl"><div class="pts">points</div><div class="tag">${esc(m.tag)}</div></div></div>
  <div class="strip">${tiles}</div>
  <div class="caption">Day by day · 4 picks · 2 points per win · achievements unlocked below</div>
  <div class="chips">${rosterLine(t)}</div>
  <div class="facts">${m.facts.map(f => `<div class="fact"><span class="badge">${f.icon}</span><span class="ftxt"><span class="fname">${f.name}</span><span class="fdesc">${f.text}</span></span></div>`).join('')}</div>
  <div class="foot"><span><b>${esc(m.season)}</b></span><span class="brand">Road to Sake</span></div>
</div></body></html>`;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const m of managers) {
    const t = A.teams.find(x => x.owner === m.owner);
    const f = path.join(require('os').tmpdir(), 'dagi_card_' + m.file + '.html');
    fs.writeFileSync(f, html(m, t));
    await p.goto('file://' + f, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const over = await p.evaluate(() => ({ h: document.querySelector('.wrap').scrollHeight, facts: document.querySelector('.facts').getBoundingClientRect().bottom, foot: document.querySelector('.foot').getBoundingClientRect().top }));
    await p.screenshot({ path: path.join(OUT, `aki_2026_${m.file}.png`), type: 'png' });
    console.log(m.file, over);
  }
  await b.close();
})();
