// Utility: genera la stringa ripetuta fino a lunghezza target
function repeatToLength(base, minLen) {
  let s = base;
  while (s.length < minLen) s += base;
  return s;
}

// Classe di scramble ispirata al pattern Cruip
class Scrambler {
  constructor(el, letters) {
    this.el = el;
    this.letters = letters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    this.queue = [];
    this.frame = 0;
    this.raf = null;
    this.update = this.update.bind(this);
  }
  setTextStableLen(text, duration = 900) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, text.length);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ' ';
      const to = text[i] || ' ';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor((duration / 16) * 0.6) + Math.floor(Math.random() * 10);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.raf);
    this.frame = 0;
    return new Promise(res => {
      this._resolve = res;
      this.raf = requestAnimationFrame(this.update);
    });
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      const q = this.queue[i];
      if (this.frame >= q.end) { complete++; output += q.to; }
      else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.28) {
          q.char = this.letters[Math.floor(Math.random() * this.letters.length)];
        }
        output += q.char;
      } else {
        output += q.from;
      }
    }
    this.el.textContent = output;
    this.frame++;
    if (complete === this.queue.length) {
      const r = this._resolve; this._resolve = null;
      if (r) r();
    } else {
      this.raf = requestAnimationFrame(this.update);
    }
  }
}

function setupBands() {
  const bands = Array.from(document.querySelectorAll('.band'));
  bands.forEach(band => {
    const phrase = band.getAttribute('data-phrase') || '';
    // Crea una lunghezza sufficiente (molto oltre la larghezza/altezza visibile)
    const minLen = 300; // puoi aumentare se i caratteri sono grandi
    const long = repeatToLength(phrase, minLen);
    band.textContent = long;
  });
}

async function startScrambleLoop() {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // onora preferenze utente

  const bands = Array.from(document.querySelectorAll('.band'));
  const scramblers = bands.map(b => new Scrambler(b));

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  while (true) {
    // Ogni ciclo fa uno shuffle e poi riconverge alla frase base
    const promises = scramblers.map(async (s, idx) => {
      const el = s.el;
      const phrase = el.getAttribute('data-phrase') || '';
      const base = repeatToLength(phrase, el.textContent.length);
      // Target 1: random puro stessa lunghezza
      const rand = base.split('').map(ch => letters[Math.floor(Math.random()*letters.length)]).join('');
      await s.setTextStableLen(rand, 800 + (idx % 4) * 120);
      // Target 2: ritorna alla base per leggibilità
      await s.setTextStableLen(base, 600 + (idx % 4) * 80);
    });
    await Promise.all(promises);
    // breve pausa tra cicli
    await new Promise(r => setTimeout(r, 300));
  }
}

// Inizializza quando DOM è pronto (defer garantisce il parsing completato)
setupBands();
startScrambleLoop();

function Yes(){
  window.location.href= "game.html";
}

function No(){
  window.location.href="pregame.html";
}

function getNumberFromHash(param = 'key') {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const raw = params.get(param);
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}


// main.js (script classico, non modulo)
(function setupPersistentArray(){
  var KEY = 'APP_CORRECT_ARRAY';   // cambia prefisso se hai più progetti

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      // valida: deve essere array di numeri finiti
      if (!Array.isArray(parsed)) return [];
      var ok = [];
      for (var i = 0; i < parsed.length; i++) {
        var x = Number(parsed[i]);
        if (Number.isFinite(x)) ok.push(x);
      }
      return ok;
    } catch (_) {
      return [];
    }
  }

  function write(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(_) {}
  }

  // Stato persistente (array di interi)
  var store = read();
  var listeners = [];

  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](store.slice()); } catch(_) {} // passa una copia
    }
  }

  var api = {
    // Ritorna una copia per evitare mutazioni esterne
    get value() { return store.slice(); },

    // Aggiunge un intero all'array
    push: function(n) {
      var x = Number(n);
      if (!Number.isFinite(x)) return;            // ignora non-numerici
      store.push(x);
      write(store);
      notify();
    },

    // Rimuove l'ultimo elemento e lo ritorna (o undefined)
    pop: function() {
      if (store.length === 0) return undefined;
      var out = store.pop();
      write(store);
      notify();
      return out;
    },

    // Imposta l'intero array (sovrascrive)
    set: function(arr) {
      if (!Array.isArray(arr)) return;
      var next = [];
      for (var i = 0; i < arr.length; i++) {
        var x = Number(arr[i]);
        if (Number.isFinite(x)) next.push(x);
      }
      store = next;
      write(store);
      notify();
    },

    // Svuota l'array
    reset: function() {
      store = [];
      write(store);
      notify();
    },

    // Ritorna la lunghezza corrente
    size: function() {
      return store.length;
    },

    // Sottoscrive ai cambiamenti; callback riceve una copia dell'array
    subscribe: function(fn) {
      if (typeof fn === 'function') {
        listeners.push(fn);
        fn(store.slice()); // sync immediata
      }
      return function unsubscribe() {
        var idx = listeners.indexOf(fn);
        if (idx > -1) listeners.splice(idx, 1);
      };
    }
  };

  // Espone l’API in sola lettura
  Object.defineProperty(window, 'CorrectArray', {
    value: api, writable: false, configurable: false, enumerable: true
  });

  // Allinea eventuale UI al load
  document.addEventListener('DOMContentLoaded', notify);
})();

// ——— Uso dell’array in pagina ———

// Funzione richiamabile dal tuo event listener: push di un intero
function pushCorrectValue(v) {
  // Esempio: registra 1 per risposta corretta, 0 per errata
  CorrectArray.push(v);
}

// Binding UI globale: aggiorna gli elementi [data-counter]
// Ad esempio, mostra la lunghezza dell’array come “conteggio risposte corrette”
CorrectArray.subscribe(function(arr){
  var n = arr.length; // o elabora arr come preferisci
  var nodes = document.querySelectorAll('[data-counter]');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].textContent = n;
  }
});

// Esempi disponibili:
// CorrectArray.value       -> copia dell'array, es. [1,1,0,1]
// CorrectArray.push(1)     -> aggiunge un intero e salva
// CorrectArray.pop()       -> rimuove l’ultimo, notifica e ritorna il valore
// CorrectArray.size()      -> lunghezza corrente
// CorrectArray.reset()     -> svuota l’array e notifica
// CorrectArray.set([1,2])  -> imposta l’array validando i numeri


function back(){
  window.location.href = "game.html";
}