// Galeria Lilu v3 (wzór victoria-miro.com) – nawigacja, pas prac, formularze SMS, galeria, mapa
(function () {
  var nav = document.getElementById('nav');
  // na stronach z obrazem u góry menu jest białe na obrazie; po zjechaniu – biały pasek
  var st = function () { nav.classList.toggle('zjechal', window.scrollY > 60); };
  window.addEventListener('scroll', st, { passive: true }); st();
  var b = document.getElementById('burger'), m = document.getElementById('menu');
  if (b && m) b.addEventListener('click', function () {
    var o = m.classList.toggle('otwarte');
    b.setAttribute('aria-expanded', o ? 'true' : 'false');
    b.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
    nav.classList.toggle('menu-otwarte', o);
    document.body.style.overflow = o ? 'hidden' : '';
  });
  // łagodne pojawianie się zdjęć po wczytaniu (jak na wzorze)
  [].forEach.call(document.querySelectorAll('img[loading=lazy]'), function (im) {
    if (im.complete && im.naturalWidth) im.classList.add('zaladowany');
    else im.addEventListener('load', function () { im.classList.add('zaladowany'); });
  });
})();

// pas „Wybrane prace”
(function () {
  var pas = document.getElementById('pas');
  if (!pas) return;
  [].forEach.call(document.querySelectorAll('.pas-btn'), function (btn) {
    btn.addEventListener('click', function () {
      var kier = +btn.getAttribute('data-kier');
      var p = pas.querySelector('.praca');
      pas.scrollBy({ left: kier * (p ? p.offsetWidth + 64 : 400), behavior: 'smooth' });
    });
  });
})();

// formularze: klientka nie ma e-maila, więc formularz składa gotowego SMS-a
var NUMER = '+48504202547';
function smsLink(tresc) { return 'sms:' + NUMER + '?&body=' + encodeURIComponent(tresc); }
(function () {
  [].forEach.call(document.querySelectorAll('.form-sms'), function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var imie = f.imie.value.trim(), tel = f.tel.value.trim(), w = f.wiad.value.trim();
      var tresc = w + (imie ? '\n' + imie : '') + (tel ? ', tel. ' + tel : '');
      location.href = smsLink(tresc);
    });
  });
})();

// anioł na wybrany dzień (cykl 366 – też 29 lutego)
(function () {
  var fd = document.getElementById('d-dzien'), fm = document.getElementById('d-mies');
  if (!fd || !fm) return;
  var MIES = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  var MIES_M = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
  var DNI = [31,29,31,30,31,30,31,31,30,31,30,31];
  var wynik = document.getElementById('d-wynik'), sms = document.getElementById('d-sms');
  MIES_M.forEach(function (n, i) { fm.add(new Option(n, i)); });
  function dni(sel) {
    var max = DNI[+fm.value], cur = Math.min(sel || +fd.value || 1, max);
    fd.innerHTML = '';
    for (var d = 1; d <= max; d++) fd.add(new Option(d, d));
    fd.value = cur;
  }
  function licz() {
    var data = fd.value + ' ' + MIES[+fm.value];
    wynik.textContent = 'Zapytasz o anioła na ' + data + '. Wiadomość otworzy się w aplikacji SMS.';
    sms.href = smsLink('Dzień dobry, pytam o Anioła Stróża na ' + data + ' z cyklu 366 obrazów.');
  }
  var dzis = new Date();
  fm.value = dzis.getMonth(); dni(dzis.getDate()); licz();
  fm.addEventListener('change', function () { dni(); licz(); });
  fd.addEventListener('change', licz);
})();

// galeria: powiększenie na białym tle, strzałki, Esc
(function () {
  var siatka = document.getElementById('siatka'), lb = document.getElementById('lb');
  if (!siatka || !lb) return;
  var kadry = [].slice.call(siatka.querySelectorAll('.dzielo')), i = 0, ostatni = null;
  var im = lb.querySelector('img'), pod = lb.querySelector('.lb-podpis');
  function pokaz(n) {
    i = (n + kadry.length) % kadry.length;
    var k = kadry[i];
    im.src = k.getAttribute('href'); im.alt = k.dataset.podpis;
    pod.textContent = 'Lilianna Batory, ' + k.dataset.podpis;
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

// mapa (OSM w szarości)
window.addEventListener('load', function () {
  var el = document.getElementById('mapa');
  if (!el || !window.L) return;
  var p = [51.947212, 15.4846989];
  var map = L.map(el, { scrollWheelZoom: false }).setView(p, 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  L.circleMarker(p, { radius: 9, color: '#fff', weight: 3, fillColor: '#5B4AA3', fillOpacity: 1 }).addTo(map)
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
