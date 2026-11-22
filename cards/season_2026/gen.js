// Renders the shareable PNGs for the end of the 2026 season (1080x1350, Messenger friendly):
//   ../kyushu_2026/kyushu_2026_<manager>.png   one per Kyushu team (9)
//   season_2026_<manager>.png                  one per manager who played this year (11)
//   season_2026_fact_<n>.png                   three general season cards
//   season_2026_table.png                      the final league table
// Run: node cards/season_2026/gen.js
const fs = require('fs'), path = require('path'), os = require('os');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const K = require('../kyushu_2026/kyushu_fantasy.json');
const OUT_S = __dirname, OUT_K = path.join(__dirname, '..', 'kyushu_2026');

const BASHOS = ['Hatsu', 'Haru', 'Natsu', 'Nagoya', 'Aki', 'Kyūshū'];
// name, card name, file, colour, scores per basho (null = did not play)
const P = {
  mark:   { owner: 'Márk Vrabély',      first: 'Márk',     color: '#f8961e', s: [82, 67, 80, 86, 70, 55] },
  ricsi:  { owner: 'Richard Fejes',     first: 'Ricsi',    color: '#f9c74f', s: [83, 69, 83, 71, 57, 55] },
  sandor: { owner: 'Sándor Szilágyi',   first: 'Sándor',   color: '#6f9bbd', s: [86, 57, 70, 84, 62, 59] },
  dj:     { owner: 'DJ_Pongo_Pongo',    first: 'DJ_Pongo', color: '#43aa8b', s: [70, 69, 70, 69, 64, 73] },
  matyas: { owner: 'Mátyás Fazakas',    first: 'Mátyás',   color: '#4ecdc4', s: [78, 73, 58, 72, 62, 63] },
  dorka:  { owner: 'Dorka FJ',          first: 'Dorka',    color: '#9b5de5', s: [70, 72, 64, 73, 64, 62] },
  csilla: { owner: 'Csilla Virág',      first: 'Csilla',   color: '#ff6b6b', s: [87, 69, 54, 56, 59, 65] },
  terez:  { owner: 'Tarján Teréz',      first: 'Teréz',    color: '#f15bb5', s: [86, 55, null, 57, null, null] },
  radish: { owner: 'Radish Master 888', first: 'Radish',   color: '#90be6d', s: [58, null, null, null, 59, 62] },
  marton: { owner: 'Márton Váradi',     first: 'Márton',   color: '#e94560', s: [87, null, null, null, null, null] },
  riki:   { owner: 'Riki San',          first: 'Riki San', color: '#e07a5f', s: [null, null, null, null, null, 59] }
};
Object.values(P).forEach(p => { p.total = p.s.reduce((a, v) => a + (v || 0), 0); p.played = p.s.filter(v => v !== null).length; });
const bashoRank = (key, i) => 1 + Object.values(P).filter(o => o.s[i] !== null && o.s[i] > P[key].s[i]).length;
const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

// ---------- Kyushu cards ----------
const kyushu = [
  { key: 'dj', team: 'Kövér utcai Uszoda', place: '1st', tag: 'Kyūshū champion · first title', season: 'Season: 415 pts, 4th, three points off 2nd', facts: [
    { icon: '🔁', name: 'Trade of the Basho', text: 'Swapped three of his four before Day 4. The newcomers scored 51; the men he cut would have scored 26. He won by 8.' },
    { icon: '🧗', name: 'Joint Last to Untouchable', text: 'Bottom of the table after Day 3. Alone in the lead from Day 7 to Day 15: nine straight days on top.' },
    { icon: '🔥', name: 'Nine on the Last Day', text: 'The only 9-point day of the basho, on senshūraku: four wins plus Wakamotoharu’s sanshō.' },
    { icon: '⭐', name: 'Sold Two Days Early', text: 'Cut Fujiseiun after Day 3. On Day 5 Fujiseiun beat Yokozuna Hoshoryu for a kinboshi.' } ] },
  { key: 'csilla', team: 'best sumo team ever', place: '2nd', tag: 'Best finish since winning Hatsu', season: 'Season: 390 pts, 7th', facts: [
    { icon: '🎼', name: 'The Metronome', text: 'For fourteen days her daily score was only ever 2, 4 or 6. Never a zero, never a swap.' },
    { icon: '🚀', name: 'Last to Second', text: 'Bottom of the table after Day 5 on 16 points. Then the joint-best second half in the league: 39.' },
    { icon: '🪨', name: 'Two Rocks', text: 'Kinbozan (23) and Kitanowaka (18) made 41 of her 65. Nobody else picked Kitanowaka.' },
    { icon: '🏁', name: 'Timed It Right', text: '6th after Day 12, 2nd after Day 14, and she held it on the final day.' } ] },
  { key: 'matyas', team: 'Tokyo Töpörtyűk', place: '3rd', tag: 'Onto the podium on the final day', season: 'Season: 406 pts, 5th, one point ahead of Dorka', facts: [
    { icon: '🔧', name: 'The Day 5 Fix', text: 'Out went Takayasu and Asakoryu, in came Fujiryoga and Takanosho. The swap was worth 22 points.' },
    { icon: '⚔️', name: 'Civil War Winner', text: 'His picks beat rival managers’ picks 29 times and lost 17, the best record in the league.' },
    { icon: '🪞', name: 'Fighting Himself', text: 'Three days with two of his own rikishi drawn against each other, the most of any team.' },
    { icon: '🏃', name: 'Late Charge', text: '8th after Day 11, 6th after Day 14, then a 7-point senshūraku lifted him to 3rd.' } ] },
  { key: 'radish', team: 'Mass moves Mass', place: 'T-4th', tag: 'A personal best', season: 'Season: 179 pts from 3 bashos', facts: [
    { icon: '📈', name: '58, 59, 62', text: 'Radish’s three bashos this year, each a little better than the last. 62 is a personal best.' },
    { icon: '🥇', name: 'Early Leader', text: 'Top of the table after Days 3, 5 and 6, and still 2nd after Day 13.' },
    { icon: '⭐', name: 'Kinboshi Cashed', text: 'Day 3: Fujiryoga beat Yokozuna Hoshoryu. A 7-point day, and Fujiryoga stayed in the lineup to the end.' },
    { icon: '🧱', name: 'Loyal to a Fault', text: 'Held Daiseizan, the last man on the banzuke, for all fifteen days. Daiseizan went 3-12.' } ] },
  { key: 'dorka', team: 'Tokások', place: 'T-4th', tag: 'House derby winner, again', season: 'Season: 405 pts, 6th', facts: [
    { icon: '🟣', name: 'Derby Queen', text: 'Beat Ricsi 62 to 55 and led him after every day from Day 4. Won their six head-to-head bouts 4-2.' },
    { icon: '🥇', name: 'Front-Runner', text: 'Led the basho after Days 2 and 4, and never dropped below 3rd until the final day.' },
    { icon: '🎢', name: 'The Arashifuji Rollercoaster', text: 'Held the hometown rookie all fifteen days: 12 points in week one, 2 in week two.' },
    { icon: '🌀', name: 'Ura Being Ura', text: 'A kinboshi over Hoshoryu on Day 4, a win by tottari, and one where his opponent simply stepped out.' } ] },
  { key: 'riki', team: 'Famichiki Chikos Club', place: 'T-6th', tag: 'League debut', season: 'Season: 59 pts from a first basho', facts: [
    { icon: '🧳', name: 'The Tourist', text: '12 different rikishi and 14 changes in 15 days. Nobody else used more than 9.' },
    { icon: '⭐', name: 'Sold Two Days Early', text: 'Cut Ura after Day 2. On Day 4 Ura beat Yokozuna Hoshoryu for a kinboshi.' },
    { icon: '🎯', name: 'Eight, Eight', text: 'Back-to-back perfect days on Days 9 and 10, and 2nd place in the league after Day 12.' },
    { icon: '🫠', name: 'One Point from an 0-for-4', text: 'Senshūraku: all four picks lost. The only point of the day was Atamifuji’s consolation sanshō.' } ] },
  { key: 'sandor', team: 'DigiDagi', place: 'T-6th', tag: 'Shares 2nd in the season', season: 'Season: 418 pts, T-2nd', facts: [
    { icon: '🎚️', name: 'All or Nothing', text: 'Zero on Day 7, perfect 8s on Days 9 and 10, zero again on Day 12. No swaps at any point.' },
    { icon: '🎯', name: 'Closest to the Crown', text: 'After Day 10 he was 19 points behind Márk in the season race. Nobody got nearer all basho.' },
    { icon: '🤝', name: 'Caught Ricsi at the Line', text: 'Started 4 behind Ricsi in the season, outscored him by 4, and finished dead level on 418.' },
    { icon: '🎁', name: 'Generous Neighbour', text: 'His picks lost to rival managers’ picks 27 times, the most in the league.' } ] },
  { key: 'ricsi', team: 'Tokazachi KSE', place: 'T-8th', tag: 'Shares 2nd in the season', season: 'Season: 418 pts, T-2nd', facts: [
    { icon: '🕳️', name: 'Double Blank', text: 'Zero on Day 7 and zero on Day 8: eight straight losing bouts, then last place alone until Day 14.' },
    { icon: '🏃', name: 'The Late Kick', text: 'Outscored the season champion 17 to 9 over the last three days to catch him on 55.' },
    { icon: '🚪', name: 'The Ones That Got Away', text: 'Swapped out Fujiryoga before Day 1 (19 points and a kinboshi). Cut Kotoeiho after Day 1 (7-1 from then on).' },
    { icon: '🛠️', name: 'Tinkering Paid', text: '9 rikishi, 5 changes. His Day 1 lineup left alone would have scored 42. He scored 55.' } ] },
  { key: 'mark', team: 'はは、相撲ですらないよ', place: 'T-8th', tag: 'Joint last · season champion', season: 'Season: 440 pts, CHAMPION 🍶', facts: [
    { icon: '🍶', name: 'Lost the Basho, Won the Sake', text: 'Joint last on 55. His season lead was 22 before Day 1 and 22 after Day 15.' },
    { icon: '🪦', name: 'Asakoryu, All Fifteen Days', text: 'One win on Day 1, then ten straight losses and a withdrawal. Márk never took him out.' },
    { icon: '😐', name: 'Flat Line', text: 'Never scored a zero, never scored more than 6. The steadiest daily line in the league.' },
    { icon: '🎯', name: 'Lost to a Dartboard', text: 'Four random rikishi would expect 60.1 points. The season champion scored 55. His team name: “haha, this isn’t even sumo”.' } ] }
];

// ---------- Season cards ----------
const season = [
  { key: 'mark', place: '🍶 Champion', tag: 'Dagi Liga 2026 champion', foot: 'Won by 22 · led from July to November', facts: [
    { icon: '🧗', name: '6 · 6 · 2 · 1 · 1 · 8', text: 'His six basho placings. Outside the top five in half of them, and champion by 22.' },
    { icon: '🪑', name: '45 Days, Zero Swaps', text: 'Never changed a pick in Nagoya, Aki or Kyūshū. Aonishiki was in his lineup on every one of those days.' },
    { icon: '✍️', name: 'Six Names, Six Scripts', text: 'Sumo, 相撲, Σούμο, ᠪᠥᠬᠡ, сумо, and finally a full sentence: “haha, this isn’t even sumo”.' },
    { icon: '🏆', name: 'The Only Repeat Winner', text: 'Nagoya 86 and Aki 70, back to back. Nobody else won more than one basho.' } ] },
  { key: 'ricsi', place: 'T-2nd', tag: 'Joint runner-up', foot: '22 behind Márk · level with Sándor', facts: [
    { icon: '🌗', name: 'A Season of Two Halves', text: 'Led the league after three bashos with 235. Scored 183 over the last three, 6th of 7.' },
    { icon: '🥊', name: 'Beat the Champion', text: 'Outscored Márk in three bashos, lost two, tied one. His wins were by 1, 2 and 3. Márk’s were by 15 and 13.' },
    { icon: '🏆', name: 'Natsu Champion', text: '83 points in May, his second 83 of the year, and the season lead along with it.' },
    { icon: '🪂', name: 'Soft Landing', text: 'Last in Aki, joint last in Kyūshū, and still a share of 2nd for the year.' } ] },
  { key: 'sandor', place: 'T-2nd', tag: 'Joint runner-up', foot: '22 behind Márk · level with Ricsi', facts: [
    { icon: '📸', name: 'Dead Heat', text: '418 points, exactly level with Ricsi after six bashos. He outscored him in four of them.' },
    { icon: '⚖️', name: 'Two Points from a Title', text: 'Nagoya: 84 to Márk’s 86. They shared three picks all basho. The fourth one decided it.' },
    { icon: '🪑', name: '45 Days, Zero Swaps', text: 'Like the champion, he never changed a pick in Nagoya, Aki or Kyūshū.' },
    { icon: '🎢', name: 'Highs and Lows', text: 'Two scores in the 80s, two in the 50s. The best season total of anyone without a basho title.' } ] },
  { key: 'dj', place: '4th', tag: 'Kyūshū champion', foot: '3 points off 2nd · up from 6th in the finale', facts: [
    { icon: '📏', name: 'The Flattest Line', text: '70, 69, 70, 69, 64, and then 73. Five bashos inside six points before the finale.' },
    { icon: '🏆', name: 'Saved the Best for Last', text: 'First title in the last basho, by 8 points, the biggest winning margin of the year.' },
    { icon: '🥉', name: 'Most Podiums', text: 'Top three in four of the six bashos. More than anyone, the champion included.' },
    { icon: '🔢', name: 'King of the Even Bashos', text: 'Count only Haru, Nagoya and Kyūshū and he wins the season. Leave out Hatsu and he is 2nd.' } ] },
  { key: 'matyas', place: '5th', tag: 'Haru champion', foot: 'One point ahead of Dorka', facts: [
    { icon: '🏆', name: 'Haru Champion', text: '73 points in March, one ahead of Dorka: the smallest outright winning margin of the year.' },
    { icon: '🤏', name: 'By a Single Point', text: 'Level with Dorka on 343 before Kyūshū. Beat her 63 to 62 there to take 5th.' },
    { icon: '🏎️', name: 'F1 Podium', text: 'Score the season like Formula 1, by placings, and he finishes 3rd.' },
    { icon: '🙃', name: 'Up and Down', text: 'Placings of 7th, 1st, 6th, 4th, 4th and 3rd. He ended the year on his first podium since March.' } ] },
  { key: 'dorka', place: '6th', tag: 'The best never to win a basho', foot: 'One point behind Mátyás', facts: [
    { icon: '🥈', name: 'Always Close', text: 'Runner-up twice, 3rd once, never a title. She missed Haru by a single point.' },
    { icon: '🧘', name: 'No Bad Bashos', text: 'Never below 62 all year. Only DJ_Pongo had a higher floor.' },
    { icon: '🟣', name: 'Derby Record', text: 'Outscored Ricsi in four of the six bashos, including each of the last three.' },
    { icon: '🏎️', name: 'F1 Runner-Up', text: 'Score the season like Formula 1, by placings, and she finishes 2nd instead of 6th.' } ] },
  { key: 'csilla', place: '7th', tag: 'Hatsu co-champion', foot: 'First title of the year · 2nd in the last basho', facts: [
    { icon: '📚', name: 'Bookends', text: 'Shared the first title of the year and finished 2nd in the last basho. Count only those two and she wins the season.' },
    { icon: '🎢', name: 'Highest and Lowest', text: 'Posted the best score of the whole year (87) and the lowest (54), four months apart.' },
    { icon: '🫥', name: 'The 20-Point Ghost', text: 'Missed five days of Nagoya, and 20 points were estimated for her. It never changed a placing.' },
    { icon: '🪑', name: 'Sat Still, Finished Strong', text: 'No swaps in Aki or Kyūshū, and 2nd place in the finale.' } ] },
  { key: 'terez', place: '8th', tag: 'Three bashos played', foot: 'Hatsu · Haru · Nagoya', facts: [
    { icon: '🤏', name: 'One Point from Glory', text: '86 in Hatsu, a first basho, one point behind the two co-champions.' },
    { icon: '🍣', name: 'Szusizabálók', text: '“The sushi devourers” for Hatsu and Haru. For Nagoya the team was simply called Boby.' },
    { icon: '📊', name: 'Better Average than It Looks', text: '66.0 points per basho played, ahead of Csilla’s full-season 65.0.' },
    { icon: '🪑', name: 'Set and Forget', text: 'One of four managers who never changed a pick in Nagoya.' } ] },
  { key: 'radish', place: '9th', tag: 'Three bashos played', foot: 'Hatsu · Aki · Kyūshū', facts: [
    { icon: '📈', name: '58 → 59 → 62', text: 'Three bashos, each better than the last, and the tightest spread of any manager in the league.' },
    { icon: '🍽️', name: 'A Story in Three Team Names', text: 'Kalória defecit Defeaters, then Abszolút Túlsúly 💪 (“absolute overweight”), then Mass moves Mass.' },
    { icon: '🕰️', name: 'Eight Months Off', text: 'Played Hatsu in January, skipped three bashos, came back for Aki and stayed.' },
    { icon: '🥇', name: 'Led the Finale', text: 'Top of the Kyūshū table after Days 3, 5 and 6.' } ] },
  { key: 'marton', place: '10th', tag: 'One basho, one title', foot: 'Hatsu co-champion · Szentendre Szumo', facts: [
    { icon: '👻', name: 'Undefeated', text: 'Played one basho, shared the title, never came back. Career record: one for one.' },
    { icon: '🏆', name: '87 Beats Everything', text: 'That single score would have won every one of the other five bashos outright.' },
    { icon: '📊', name: 'Best Average in the League', text: '87 points per basho. The season champion averaged 73.3.' },
    { icon: '🤝', name: 'Shared with Csilla', text: 'Hatsu finished 87-87, the only tied title of the year.' } ] },
  { key: 'riki', place: '11th', tag: 'Joined for the finale', foot: 'Kyūshū only · Famichiki Chikos Club', facts: [
    { icon: '🍶', name: 'Beat the Champion', text: 'One basho played, and it outscored the season champion: 59 to 55.' },
    { icon: '🤝', name: 'Level with a Runner-Up', text: 'Tied Sándor on 59 and beat Ricsi by 4. Those two shared 2nd for the year.' },
    { icon: '🧳', name: 'Twelve Rikishi in Fifteen Days', text: 'More different picks in one basho than the champion used across his last three.' },
    { icon: '🎯', name: 'Two Perfect Days', text: 'Back-to-back 8s on Days 9 and 10 of a debut basho.' } ] }
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CSS = c => `
  :root{--k:1;--bg:#080810;--card:#111122;--text:#eaeaea;--muted:#7a7a9a;--border:#252550;--gold:#ffd700;--c:${c}}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;background:var(--bg);color:var(--text);font-family:'Inter','Liberation Sans','Noto Sans JP','Noto Sans Mongolian','Noto Color Emoji',sans-serif;overflow:hidden;position:relative}
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle, var(--c) 0%, transparent 60%);opacity:.16;top:-380px;right:-300px}
  .wrap{position:relative;padding:64px 72px 56px;height:100%;display:flex;flex-direction:column}
  .top{display:flex;justify-content:space-between;align-items:center;font-size:22px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:600}
  .top .jp{font-family:'Noto Sans JP','IPAPGothic',sans-serif;letter-spacing:6px;color:var(--gold)}
  .place{display:inline-block;align-self:flex-start;margin-top:calc(44px * var(--k) * var(--k));padding:10px 22px;border-radius:999px;background:var(--c);color:#0b0b14;font-weight:900;font-size:26px;letter-spacing:2px}
  h1{font-size:calc(88px * var(--k));font-weight:900;line-height:1.02;margin-top:18px;letter-spacing:-2px}
  .team{font-size:34px;color:var(--muted);margin-top:10px;font-weight:600}
  .hero{display:flex;align-items:flex-end;gap:26px;margin-top:calc(38px * var(--k) * var(--k))}
  .hero .num{font-size:calc(180px * var(--k) * var(--k));font-weight:900;line-height:.9;letter-spacing:-8px;color:var(--c)}
  .hero .lbl{padding-bottom:22px}
  .hero .lbl .pts{font-size:34px;font-weight:800}
  .hero .lbl .tag{font-size:26px;color:var(--muted);margin-top:6px}
  .strip{display:grid;grid-template-columns:repeat(15,1fr);gap:8px;margin-top:calc(40px * var(--k) * var(--k))}
  .tile{height:86px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .tv{font-size:30px;font-weight:900;color:#0b0b14}
  .td{font-size:15px;font-weight:700;color:#0b0b14;opacity:.75;margin-top:2px}
  .tile.off{background:transparent;border:2px solid #3a3a5a}.tile.off .tv,.tile.off .td{color:#7a7a9a}
  .strip6{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-top:calc(40px * var(--k) * var(--k))}
  .bt{height:132px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
  .bt .bn{font-size:17px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#0b0b14;opacity:.8}
  .bt .bv{font-size:46px;font-weight:900;color:#0b0b14;line-height:1}
  .bt .br{font-size:19px;font-weight:800;color:#0b0b14;opacity:.85}
  .bt.off{background:transparent;border:2px solid #3a3a5a}.bt.off .bn,.bt.off .bv,.bt.off .br{color:#7a7a9a}
  .caption{font-size:20px;color:var(--muted);margin-top:12px;letter-spacing:1px}
  .chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
  .chip{padding:10px 16px;border-radius:12px;background:var(--card);border:1px solid var(--border);font-size:24px}
  .chip b{font-weight:800}.chip i{font-style:normal;color:var(--muted);font-size:20px}.chip.muted{color:var(--muted)}
  .facts{margin-top:26px;margin-bottom:22px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly;gap:14px}
  .fact{display:flex;gap:18px;align-items:flex-start}
  .fact .badge{flex:0 0 64px;height:64px;border-radius:16px;background:var(--card);border:2px solid var(--c);display:flex;align-items:center;justify-content:center;font-size:32px;font-family:'Noto Color Emoji',sans-serif}
  .ftxt{display:flex;flex-direction:column;gap:4px}
  .fname{font-size:calc(27px * var(--k));font-weight:900;letter-spacing:.3px;color:var(--c)}
  .fdesc{font-size:calc(23px * var(--k));line-height:1.3;color:var(--text)}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid var(--border);padding-top:22px;font-size:22px;color:var(--muted)}
  .foot b{color:var(--text);font-weight:700}
  .foot .brand{font-weight:900;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
  /* general fact cards */
  .kick{margin-top:44px;font-size:26px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--c)}
  h2{font-size:74px;font-weight:900;line-height:1.04;letter-spacing:-2px;margin-top:12px}
  .lede{font-size:28px;line-height:1.35;color:var(--muted);margin-top:16px}
  .rows{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;margin:24px 0 20px}
  .row{display:flex;align-items:center;gap:20px;padding:15px 20px;border-radius:16px;background:var(--card);border:1px solid var(--border)}
  .row .k{flex:0 0 250px;font-size:24px;font-weight:800;color:var(--muted);line-height:1.2}
  .row .who{flex:0 0 auto;padding:6px 16px;border-radius:999px;font-size:26px;font-weight:900;color:#0b0b14}
  .row .n{flex:1;font-size:22px;line-height:1.28;color:var(--text)}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}
  .stat{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px 16px}
  .stat .sv{font-size:58px;font-weight:900;color:var(--c);line-height:1}
  .stat .sl{font-size:20px;color:var(--muted);margin-top:8px;line-height:1.25}
  .bars{display:flex;align-items:flex-end;gap:16px;height:210px;margin-top:30px;padding:0 6px}
  .bar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}
  .bar .bv2{font-size:26px;font-weight:900;margin-bottom:6px}
  .bar .bb{width:100%;border-radius:10px 10px 0 0;background:var(--c)}
  /* final table */
  .tbl{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;margin:22px 0 18px}
  .tr{display:grid;grid-template-columns:78px 1fr repeat(6,70px) 100px;align-items:center;gap:6px;padding:0 14px;height:66px;border-radius:14px;background:var(--card);border:1px solid var(--border)}
  .tr.head{background:none;border:none;height:34px;font-size:16px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}
  .tr.champ{border:2px solid var(--gold);background:rgba(255,215,0,.10);height:78px}
  .tr .pl{font-size:26px;font-weight:900;color:var(--muted)}
  .tr.champ .pl{font-size:34px}
  .tr .nm{font-size:25px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tr .sc{font-size:23px;font-weight:700;text-align:center;border-radius:8px;padding:4px 0}
  .tr .sc.win{background:var(--gold);color:#0b0b14;font-weight:900}
  .tr .sc.no{color:#4a4a6a}
  .tr.head .sc{font-size:15px;padding:0}
  .tr .tt{font-size:32px;font-weight:900;text-align:right}
  .tr.head .tt{font-size:16px}
  .bar .bl{font-size:19px;font-weight:700;color:var(--muted);margin-top:8px;letter-spacing:1px;text-transform:uppercase}
`;
const page = (color, body) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Sans+JP:wght@700;900&display=swap" rel="stylesheet">
<style>${CSS(color)}</style></head><body><div class="glow"></div><div class="wrap">${body}</div></body></html>`;
const factsHtml = facts => `<div class="facts">${facts.map(f => `<div class="fact"><span class="badge">${f.icon}</span><span class="ftxt"><span class="fname">${f.name}</span><span class="fdesc">${f.text}</span></span></div>`).join('')}</div>`;

function kyushuCard(m) {
  const p = P[m.key], t = K.teams.find(x => x.owner === p.owner);
  const tiles = t.daily.map((v, i) => `<div class="tile${v === 0 ? ' off' : ''}" style="${v === 0 ? '' : `background:${p.color};opacity:${(0.18 + 0.82 * v / 9).toFixed(2)}`}"><span class="tv">${v}</span><span class="td">D${i + 1}</span></div>`).join('');
  const r = {};
  t.lineups.forEach(l => l.forEach(x => { r[x.rikishi] = r[x.rikishi] || { pts: 0, days: 0 }; r[x.rikishi].pts += x.pts; r[x.rikishi].days++; }));
  const list = Object.entries(r).sort((a, b) => b[1].pts - a[1].pts || b[1].days - a[1].days);
  const chips = list.slice(0, 5).map(([n, v]) => `<span class="chip"><b>${n}</b> ${v.pts}${v.days < 15 ? `<i> · ${v.days}d</i>` : ''}</span>`).join('')
    + (list.length > 5 ? `<span class="chip muted">+${list.length - 5} more</span>` : '');
  return page(p.color, `
  <div class="top"><span>Dagi Liga · Kyūshū 2026</span><span class="jp">九州場所</span><span>Fukuoka · Nov 8–22</span></div>
  <span class="place">${m.place} of 9</span>
  <h1>${esc(p.first)}</h1>
  <div class="team">${esc(m.team)}</div>
  <div class="hero"><div class="num">${t.total}</div><div class="lbl"><div class="pts">points</div><div class="tag">${esc(m.tag)}</div></div></div>
  <div class="strip">${tiles}</div>
  <div class="caption">Day by day · 4 picks · 2 points per win · achievements unlocked below</div>
  <div class="chips">${chips}</div>
  ${factsHtml(m.facts)}
  <div class="foot"><span><b>${esc(m.season)}</b></span><span class="brand">Road to Sake</span></div>`);
}

function seasonCard(m) {
  const p = P[m.key];
  const max = 87;
  const tiles = p.s.map((v, i) => v === null
    ? `<div class="bt off"><span class="bn">${BASHOS[i]}</span><span class="bv">·</span><span class="br">did not play</span></div>`
    : `<div class="bt" style="background:${p.color};opacity:${(0.35 + 0.65 * (v - 50) / (max - 50)).toFixed(2)}"><span class="bn">${BASHOS[i]}</span><span class="bv">${v}</span><span class="br">${bashoRank(m.key, i) === 1 ? '🥇 1st' : ord(bashoRank(m.key, i))}</span></div>`).join('');
  const vals = p.s.filter(v => v !== null);
  const chips = [`<span class="chip"><b>${(p.total / p.played).toFixed(1)}</b> <i>per basho</i></span>`,
    `<span class="chip"><b>${Math.max(...vals)}</b> <i>best</i></span>`, `<span class="chip"><b>${Math.min(...vals)}</b> <i>worst</i></span>`,
    `<span class="chip"><b>${p.played}/6</b> <i>bashos played</i></span>`].join('');
  return page(p.color, `
  <div class="top"><span>Dagi Liga · Season 2026</span><span class="jp">大相撲</span><span>Six bashos · Jan–Nov</span></div>
  <span class="place">${m.place}${m.place.includes('Champion') ? '' : ' of 11'}</span>
  <h1>${esc(p.first)}</h1>
  <div class="team">${esc(p.owner === p.first ? m.tag : p.owner)}</div>
  <div class="hero"><div class="num">${p.total}</div><div class="lbl"><div class="pts">season points</div><div class="tag">${esc(m.tag)}</div></div></div>
  <div class="strip6">${tiles}</div>
  <div class="caption">Score and placing in each basho · level scores share a place</div>
  <div class="chips">${chips}</div>
  ${factsHtml(m.facts)}
  <div class="foot"><span><b>${esc(m.foot)}</b></span><span class="brand">Road to Sake</span></div>`);
}

// ---------- General cards ----------
const who = key => `<span class="who" style="background:${P[key].color}">${P[key].first}</span>`;
const top = `<div class="top"><span>Dagi Liga · Season 2026</span><span class="jp">大相撲</span><span>Six bashos · Jan–Nov</span></div>`;
const foot = t => `<div class="foot"><span><b>${t}</b></span><span class="brand">Road to Sake</span></div>`;
const general = [
  { file: 'fact_1', color: '#ffd700', body: `${top}
    <div class="kick">Fun fact No. 1</div>
    <h2>Seven ways to count the season. Five different champions.</h2>
    <div class="rows">
      <div class="row"><span class="k">Total points<br>(the real one)</span>${who('mark')}<span class="n">440, by 22. The Sake is his.</span></div>
      <div class="row"><span class="k">First three bashos only</span>${who('ricsi')}<span class="n">235 to Márk’s 229. Ricsi led the league until July.</span></div>
      <div class="row"><span class="k">Even bashos only</span>${who('dj')}<span class="n">Haru, Nagoya, Kyūshū: 211, three ahead of Mátyás and Márk.</span></div>
      <div class="row"><span class="k">First and last basho only</span>${who('csilla')}<span class="n">Hatsu plus Kyūshū: 152, seven clear of Sándor.</span></div>
      <div class="row"><span class="k">Points per basho played</span>${who('marton')}<span class="n">87.0 from one appearance. Nobody else is above 73.3.</span></div>
      <div class="row"><span class="k">Average placing</span>${who('dj')}<span class="n">Best of the full-season seven. Ricsi, joint 2nd on points, is last.</span></div>
      <div class="row"><span class="k">Formula 1 points</span>${who('mark')}<span class="n">Still Márk, but Dorka jumps from 6th to 2nd and Ricsi drops to 7th.</span></div>
    </div>${foot('Same six bashos, same scores')}` },
  { file: 'fact_2', color: '#4ecdc4', body: `${top}
    <div class="kick">Fun fact No. 2</div>
    <h2>Six bashos. Six different names on the trophy.</h2>
    <div class="lede">Only one manager won twice, and he won the season.</div>
    <div class="rows">
      <div class="row"><span class="k">Hatsu · January</span>${who('csilla')}${who('marton')}<span class="n">87 each. The only tie, and the top score of the year.</span></div>
      <div class="row"><span class="k">Haru · March</span>${who('matyas')}<span class="n">73, one point ahead of Dorka.</span></div>
      <div class="row"><span class="k">Natsu · May</span>${who('ricsi')}<span class="n">83, three ahead of Márk.</span></div>
      <div class="row"><span class="k">Nagoya · July</span>${who('mark')}<span class="n">86, two ahead of Sándor. They shared three of four picks.</span></div>
      <div class="row"><span class="k">Aki · September</span>${who('mark')}<span class="n">70, six clear. The first title defence in the league.</span></div>
      <div class="row"><span class="k">Kyūshū · November</span>${who('dj')}<span class="n">73, eight clear: the biggest margin of the year.</span></div>
    </div>${foot('Never won one: Sándor (T-2nd) and Dorka (6th)')}` },
  { file: 'fact_3', color: '#ff6b6b', body: `${top}
    <div class="kick">Fun fact No. 3</div>
    <h2>The league in numbers</h2>
    <div class="grid">
      <div class="stat"><div class="sv">3,415</div><div class="sl">fantasy points scored all year</div></div>
      <div class="stat"><div class="sv">11</div><div class="sl">managers, 7 of them in all six bashos</div></div>
      <div class="stat"><div class="sv">68.3</div><div class="sl">average score per basho entry</div></div>
      <div class="stat"><div class="sv">87</div><div class="sl">highest score: Csilla and Márton, Hatsu</div></div>
      <div class="stat"><div class="sv">54</div><div class="sl">lowest score: Csilla, Natsu</div></div>
      <div class="stat"><div class="sv">0</div><div class="sl">lineup slots for Onosato in Kyūshū. He won it.</div></div>
    </div>
    <div class="bars">${[['Hatsu', 78.7], ['Haru', 66.4], ['Natsu', 68.4], ['Nagoya', 71.0], ['Aki', 62.1], ['Kyūshū', 61.4]].map(([n, v]) => `<div class="bar"><div class="bv2">${v.toFixed(1)}</div><div class="bb" style="height:${Math.round((v - 50) / 30 * 150)}px;opacity:${(0.45 + 0.55 * (v - 60) / 19).toFixed(2)}"></div><div class="bl">${n}</div></div>`).join('')}</div>
    <div class="caption">League average score by basho. It fell 17 points from January to November.</div>
    ${factsHtml([
      { icon: '📸', name: 'Three Points Covered 2nd to 4th', text: 'Ricsi 418, Sándor 418, DJ_Pongo 415 after ninety days of sumo.' },
      { icon: '🎯', name: 'The Champion Lost to a Dartboard', text: 'In Kyūshū four random rikishi would expect 60.1 points. Márk scored 55 and won the season anyway.' }
    ])}${foot('Dagi Liga 2026 · final')}` }
];

// Final league table, built from the same scores as the cards above.
const tableRows = Object.entries(P).sort((a, b) => b[1].total - a[1].total).map(([key, p]) => {
  const pl = 1 + Object.values(P).filter(o => o.total > p.total).length;
  const tied = Object.values(P).filter(o => o.total === p.total).length > 1;
  return `<div class="tr${pl === 1 ? ' champ' : ''}"><span class="pl">${pl === 1 ? '🍶' : (tied ? 'T-' : '') + pl}</span><span class="nm" style="color:${p.color}">${esc(p.owner === 'DJ_Pongo_Pongo' ? 'DJ_Pongo' : p.owner)}</span>`
    + p.s.map((v, i) => v === null ? '<span class="sc no">·</span>' : `<span class="sc${bashoRank(key, i) === 1 ? ' win' : ''}">${v}</span>`).join('')
    + `<span class="tt"${pl === 1 ? ' style="color:var(--gold)"' : ''}>${p.total}</span></div>`;
}).join('');
general.push({ file: 'table', color: '#ffd700', body: `${top}
    <div class="kick">Final standings</div>
    <h2>Dagi Liga 2026</h2>
    <div class="lede">Márk Vrabély wins the Sake by 22 points. Gold cells mark each basho’s winner.</div>
    <div class="tbl">
      <div class="tr head"><span>#</span><span>Manager</span>${['Hatsu', 'Haru', 'Natsu', 'Nagoya', 'Aki', 'Kyūshū'].map(b => `<span class="sc">${b}</span>`).join('')}<span class="tt">Total</span></div>
      ${tableRows}
    </div>${foot('Six bashos · 11 managers · level totals share a place')}` });

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const jobs = [
    ...kyushu.map(m => [path.join(OUT_K, `kyushu_2026_${m.key}.png`), kyushuCard(m)]),
    ...season.map(m => [path.join(OUT_S, `season_2026_${m.key}.png`), seasonCard(m)]),
    ...general.map(g => [path.join(OUT_S, `season_2026_${g.file}.png`), page(g.color, g.body)])
  ];
  for (const [file, html] of jobs) {
    const f = path.join(os.tmpdir(), 'dagi_card.html');
    fs.writeFileSync(f, html);
    await pg.goto('file://' + f, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    // Fit check: the footer must end inside the card's bottom padding. If the facts run long,
    // scale the type and spacing down a step at a time until it does.
    const fit = await pg.evaluate(() => {
      const bottom = () => Math.round(document.querySelector('.foot').getBoundingClientRect().bottom);
      let k = 1;
      while (bottom() > 1294 && k > 0.8) { k = +(k - 0.02).toFixed(2); document.documentElement.style.setProperty('--k', k); }
      const foot = document.querySelector('.foot').getBoundingClientRect();
      const prev = document.querySelector('.foot').previousElementSibling.getBoundingClientRect();
      return { footBottom: bottom(), gap: Math.round(foot.top - prev.bottom), k };
    });
    await pg.screenshot({ path: file, type: 'png' });
    console.log(path.basename(file), fit.footBottom <= 1294 && fit.gap >= 0 ? 'ok' : 'CHECK', JSON.stringify(fit));
  }
  await b.close();
})();
