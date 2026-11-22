// Galeria Lilu v4 – monografia: menu, kolor sal przy przewijaniu, odsłanianie, anioł na dzień, formularz e-mail, powiększenie, mapa
document.documentElement.classList.add('js');
var MAIL = 'galeria.lilu@gmail.com';

(function () {
  var nav = document.getElementById('nav');
  var st = function () { nav.classList.toggle('zjechal', window.scrollY > 80); };
  window.addEventListener('scroll', st, { passive: true }); st();
  var b = document.getElementById('burger'), m = document.getElementById('menu');
  if (b && m) b.addEventListener('click', function () {
    var o = m.classList.toggle('otwarte');
    b.setAttribute('aria-expanded', o ? 'true' : 'false');
    b.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
    nav.classList.toggle('menu-otwarte', o);
    document.body.style.overflow = o ? 'hidden' : '';
  });
})();

// strona główna: tło przechodzi płynnie w kolor sali, w której jesteś
(function () {
  if (!document.body.classList.contains('start') || !('IntersectionObserver' in window)) return;
  var sale = [].slice.call(document.querySelectorAll('[data-kolor]'));
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) {
      if (w.isIntersecting) document.body.style.backgroundColor = w.target.getAttribute('data-kolor');
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sale.forEach(function (s) { io.observe(s); });
})();

// odsłanianie obrazów i nagłówków
(function () {
  if (!('IntersectionObserver' in window)) return;
  var el = [].slice.call(document.querySelectorAll('.dzielo, .sala-glowa, .list-in, .kolaz figure, .pracownia-glowa, .zam-lista li, .cykl-glowa, .of-txt'));
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) { if (w.isIntersecting) { w.target.classList.add('widac'); io.unobserve(w.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  el.forEach(function (e, i) { e.classList.add('odslon'); e.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(e); });
})();

// anioł na wybrany dzień (cykl 366 – także 29 lutego)
(function () {
  var fd = document.getElementById('d-dzien'), fm = document.getElementById('d-mies'), a = document.getElementById('d-pytaj');
  if (!fd || !fm || !a) return;
  var MIES = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  var MIES_M = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
  var DNI = [31,29,31,30,31,30,31,31,30,31,30,31];
  MIES_M.forEach(function (n, i) { fm.add(new Option(n, i)); });
  function dni(sel) {
    var max = DNI[+fm.value], cur = Math.min(sel || +fd.value || 1, max);
    fd.innerHTML = '';
    for (var d = 1; d <= max; d++) fd.add(new Option(d, d));
    fd.value = cur;
  }
  function licz() {
    var data = fd.value + ' ' + MIES[+fm.value];
    a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Anioł Stróż na ' + data) +
      '&body=' + encodeURIComponent('Dzień dobry, pytam o Anioła Stróża na ' + data + ' z cyklu 366 obrazów.');
  }
  var dzis = new Date();
  fm.value = dzis.getMonth(); dni(dzis.getDate()); licz();
  fm.addEventListener('change', function () { dni(); licz(); });
  fd.addEventListener('change', licz);
})();

// formularze: składają gotowego maila do artystki
(function () {
  [].forEach.call(document.querySelectorAll('.form-mail'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var imie = f.imie.value.trim(), kontakt = f.kontakt.value.trim(), w = f.wiad.value.trim();
      var tresc = 'Dzień dobry,\n\n' + (w || 'chcę zapytać o obraz.') + '\n\n' + (imie || '') + (kontakt ? '\nKontakt: ' + kontakt : '');
      location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(f.dataset.temat || 'Pytanie o obraz') + '&body=' + encodeURIComponent(tresc);
    });
  });
})();

// powiększenie obrazów (wszystkie .powieksz na stronie)
(function () {
  var lb = document.getElementById('lb');
  var kadry = [].slice.call(document.querySelectorAll('.powieksz'));
  if (!lb || !kadry.length) return;
  var i = 0, ostatni = null, im = lb.querySelector('img'), pod = lb.querySelector('.lb-podpis'), pyt = lb.querySelector('.lb-pyt');
  function pokaz(n) {
    i = (n + kadry.length) % kadry.length;
    var k = kadry[i];
    im.src = k.getAttribute('href'); im.alt = k.dataset.podpis; pod.textContent = k.dataset.podpis;
    pyt.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Pytanie o obraz: ' + k.dataset.podpis);
  }
  function otworz(n) { ostatni = document.activeElement; pokaz(n); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-x').focus(); }
  function zamknij() { lb.hidden = true; document.body.style.overflow = ''; if (ostatni) ostatni.focus(); }
  kadry.forEach(function (k, n) { k.addEventListener('click', function (e) { e.preventDefault(); otworz(n); }); });
  lb.querySelector('.lb-x').addEventListener('click', zamknij);
  lb.querySelector('.lb-prev').addEventListener('click', function () { pokaz(i - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { pokaz(i + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) zamknij(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') zamknij();
    if (e.key === 'ArrowLeft') pokaz(i - 1);
    if (e.key === 'ArrowRight') pokaz(i + 1);
  });
})();

// mapa (OSM, ciepła szarość)
window.addEventListener('load', function () {
  var el = document.getElementById('mapa');
  if (!el || !window.L) return;
  var p = [51.947212, 15.4846989];
  var map = L.map(el, { scrollWheelZoom: false }).setView(p, 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  L.circleMarker(p, { radius: 9, color: '#fff', weight: 3, fillColor: '#2E2550', fillOpacity: 1 }).addTo(map)
    .bindTooltip('Galeria Lilu, Objazdowa 37f/3', { direction: 'top', offset: [0, -8] });
});

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();

(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
