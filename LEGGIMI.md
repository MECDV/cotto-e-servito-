# Cotto & Servito — Guida completa al sito web
> Documento per uso umano e per agenti AI (Claude Code).
> Aggiornato: giugno 2026.

---

## 1. PANORAMICA GENERALE

| Voce | Dettaglio |
|---|---|
| **Nome sito** | Cotto & Servito |
| **Tipo** | Sito vetrina ristorante + sistema ordini online |
| **Hosting** | GitHub Pages (gratis, statico) |
| **Repository GitHub** | `MECDV/cotto-e-servito-` |
| **URL pubblico** | https://mecdv.github.io/cotto-e-servito-/ |
| **Pannello gestione** | https://mecdv.github.io/cotto-e-servito-/gestione.html |
| **Branch** | `main` (unico branch, deploy automatico) |
| **Cartella locale** | `c:\Users\Utente\Desktop\sito chiapposo\` |

**Come funziona in sintesi:**
Il sito è fatto di file statici (HTML, JSON, immagini). Non c'è un server vero: GitHub Pages pubblica i file così come sono. Il "database" del sito sono due file di testo (`prodotti.json`, `galleria.json`). Il pannello di gestione (`gestione.html`) li modifica via API GitHub. Il sito (`index.html`) li legge con `fetch()` ogni volta che un utente apre la pagina.

---

## 2. STRUTTURA DEI FILE

```
sito chiapposo/
│
├── index.html          ← Sito pubblico (TUTTO il sito in un file)
├── gestione.html       ← Pannello admin privato
│
├── prodotti.json       ← Database prodotti (menu)
├── galleria.json       ← Database galleria foto/video
├── emailjs.min.js      ← Libreria email (NON toccare)
│
├── foto/               ← Foto caricate dal pannello
│   ├── 1781733193018.jpg
│   └── 1781735551598_w99g.jpg
│
├── video/              ← Video caricati dal pannello (si crea al primo upload)
│
├── LEGGIMI.md          ← Questo file
├── README.md           ← Note tecniche originali (in inglese)
│
└── .claude/            ← Configurazione Claude Code (non toccare)
    └── settings.json
```

---

## 3. FILE INDEX.HTML — Il sito pubblico

### Cos'è
Un singolo file HTML che contiene tutto: CSS, JavaScript e struttura HTML della pagina pubblica. Non è diviso in più file per semplicità di deployment su GitHub Pages.

### Sezioni della pagina (in ordine dall'alto)
1. **Hero** — Immagine di apertura con titolo e bottone
2. **Menu prodotti** — Griglia di prodotti divisi in 4 tab: Primi, Secondi, Fritti, Dolci
3. **I nostri valori** — Sezione descrittiva
4. **Galleria** — Griglia foto/video
5. **Dove siamo** — Mappa e orari
6. **Footer** — Contatti
7. **Carrello** (drawer laterale) — Si apre cliccando l'icona in alto
8. **Modal checkout** — 4 step: riepilogo → dati cliente → consegna/ritiro → conferma

### Come carica i prodotti
```javascript
// Legge prodotti.json ogni volta che la pagina si apre
const res = await fetch('./prodotti.json?t=' + Date.now(), {cache:'no-cache'});
// ?t=Date.now() serve a bypassare la cache del browser/CDN
```
Il campo `?t=Date.now()` è **obbligatorio** — senza di esso GitHub Pages serve la versione vecchia in cache per ore.

### Schema HTML dei prodotti (generato dinamicamente)
Ogni prodotto diventa una card. Se il prodotto ha più media (`media` array), la card mostra un **carousel** con frecce e pallini. Con un solo media è un'immagine statica.

### Carousel prodotti (quando ci sono più foto/video)
- Frecce `‹ ›` compaiono all'hover
- Pallini (dots) per navigazione diretta
- Swipe touch su mobile (soglia 40px)
- Funzioni JS: `prodNav(btn, dir)`, `prodDot(dot, idx)`, `prodSetSlide(car, n)`

### Carrello
- Stato salvato in variabile `cart` (array di oggetti `{name, price, img, weight, qty}`)
- Non persiste al refresh (by design — è un negozio di asporto)
- Subtotale e totale calcolati dinamicamente

### Checkout (4 step)
- **Step 1**: Riepilogo carrello
- **Step 2**: Dati cliente (nome, cognome, telefono obbligatori; email opzionale con consenso)
- **Step 3**: Modalità (consegna a domicilio o ritiro) + fascia oraria
- **Step 4**: Riepilogo finale + conferma
- Navigazione cliccabile tra step già visitati
- Validazione inline (no `alert()`) — errori sotto ogni campo

### Email di conferma
- Usa la libreria `emailjs.min.js` (file locale — non CDN per evitare blocchi di Edge)
- Service ID e template configurati in `index.html` (cercare `emailjs.send`)

### Galleria
- Carica da `galleria.json`
- Supporta immagini, video MP4 e embed YouTube/Vimeo
- Griglia CSS con item normali, alti (`tall`) e larghi (`wide`)

---

## 4. FILE GESTIONE.HTML — Il pannello di gestione

### Cos'è
Una pagina HTML standalone separata dal sito. Accessibile solo a chi ha il token GitHub. Permette di gestire prodotti e galleria senza toccare il codice.

### Autenticazione
- Usa un **GitHub Personal Access Token** (classic, scope `repo`)
- Il token viene salvato in `localStorage` con la chiave `cotto_token`
- Al login viene verificato con `GET /repos/MECDV/cotto-e-servito-`
- Se il token è scaduto o invalido, viene cancellato e si torna al login

### Come legge i dati
```javascript
// Usa l'API GitHub Contents per leggere i file JSON
fetch('https://api.github.com/repos/MECDV/cotto-e-servito-/contents/prodotti.json?t=...')
// IMPORTANTE: nessun header Cache-Control — GitHub API lo blocca con errore CORS
// Cache busting solo con ?t=Date.now() nell'URL
```

### Come salva i dati
```javascript
// PUT all'API GitHub Contents
fetch('https://api.github.com/repos/MECDV/cotto-e-servito-/contents/prodotti.json', {
  method: 'PUT',
  headers: { Authorization: 'token ...', 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '...', content: base64(JSON), sha: sha_attuale, branch: 'main' })
})
// Il campo `sha` è obbligatorio per aggiornare un file esistente
// Viene letto al momento del caricamento e salvato in `prodSha` / `gallerySha`
```

### Upload immagini/video
- Il file viene letto con `FileReader` → convertito in base64
- Viene caricato in `foto/` (immagini) o `video/` (video) tramite PUT GitHub API
- L'URL finale è `https://mecdv.github.io/cotto-e-servito-/foto/nomefile.jpg`
- Il nome file è `Date.now() + '_' + random + '.ext'` per evitare duplicati

### Editor immagini (canvas-based, nessuna libreria esterna)
Quando si carica o modifica una foto prodotto si apre un editor con:
- **Canvas 480×360** (proporzione 4:3)
- **Trascina** per spostare l'immagine nel riquadro
- **Slider zoom** (0.25× → 3×) + rotella del mouse
- **Slider rotazione** (-180° → +180°) con aggiornamento in tempo reale
- **Pulsante +90°** per scatti rapidi
- **Specchia orizzontale / verticale**
- **Reset** per tornare allo stato originale
- **Pinch-to-zoom** su dispositivi touch
- Il risultato viene esportato come JPEG (qualità 0.92) dal canvas

### Gestione multi-media per prodotto
Ogni prodotto può avere più foto e/o video (`media` array). Nell'editor prodotto:
- Griglia di miniature con badge "★ Principale" sul primo elemento
- Pulsante ✏️ su ogni foto apre l'editor immagini
- Pulsante 🗑️ rimuove il media
- "Aggiungi foto" → file picker → editor canvas → aggiunto alla lista
- "Aggiungi video" → file picker MP4/MOV OPPURE URL YouTube/Vimeo

### Gestione galleria
- Ogni elemento ha: tipo (foto/video), sorgente (URL o file caricato), titolo, dimensione (normale/alto/largo)
- I video YouTube/Vimeo vengono convertiti in URL embed automaticamente
- La griglia admin mostra badge tipo e dimensione su ogni elemento

---

## 5. FILE PRODOTTI.JSON — Il database dei prodotti

### Schema completo
```json
{
  "categories": [
    { "id": "primi",   "label": "Primi Piatti" },
    { "id": "secondi", "label": "Secondi Piatti" },
    { "id": "fritti",  "label": "Fritti" },
    { "id": "dolci",   "label": "Dolci" }
  ],
  "products": {
    "primi": [
      {
        "id":          "lasagna-ragu",
        "name":        "Lasagna al Ragù",
        "description": "Sfoglia all'uovo fatta a mano...",
        "weight":      "400g · monoporzione",
        "price":       5.30,
        "img":         "https://...url-prima-foto...",
        "media": [
          { "type": "image", "src": "https://...foto1..." },
          { "type": "image", "src": "https://...foto2..." },
          { "type": "video", "src": "https://www.youtube.com/embed/..." }
        ]
      }
    ],
    "secondi": [ ... ],
    "fritti":  [ ... ],
    "dolci":   [ ... ]
  }
}
```

**Note importanti sul campo `media`:**
- Se presente e non vuoto, il sito usa `media` per il carousel
- Se assente, il sito usa `img` (retrocompatibilità)
- `img` viene sempre impostato uguale alla prima immagine di `media` (per il carrello)
- I video YouTube/Vimeo sono già in formato embed quando salvati

---

## 6. FILE GALLERIA.JSON — Il database della galleria

### Schema completo
```json
{
  "items": [
    {
      "id":    "g1",
      "type":  "image",
      "src":   "https://...url...",
      "title": "Lasagna",
      "size":  "tall"
    },
    {
      "id":    "g2",
      "type":  "video",
      "src":   "https://www.youtube.com/embed/...",
      "title": "Il locale",
      "size":  ""
    }
  ]
}
```

**Valori possibili per `size`:**
- `""` — quadrato normale (1×1 nella griglia)
- `"tall"` — verticale, occupa 2 righe
- `"wide"` — orizzontale, occupa 2 colonne

---

## 7. VINCOLI TECNICI CRITICI

### ⚠️ CORS — L'errore più comune
GitHub API **blocca** l'header `Cache-Control` nelle richieste browser.
```javascript
// ❌ SBAGLIATO — causa errore CORS
fetch(url, { headers: { 'Cache-Control': 'no-cache' } })

// ✅ CORRETTO — cache busting tramite query string
fetch(url + '?t=' + Date.now())
```

### ⚠️ SHA obbligatorio per aggiornare file
Per modificare un file già esistente su GitHub serve il `sha` attuale del file.
- Viene letto al caricamento: `const d = await res.json(); sha = d.sha`
- Viene aggiornato dopo ogni commit: `sha = d.content.sha`
- Se il `sha` non corrisponde: errore 409 Conflict

### ⚠️ Encoding base64 sicuro per UTF-8
```javascript
// ✅ Corretto per testo con caratteri italiani (àèìòù)
btoa(unescape(encodeURIComponent(str)))

// Per decodificare
decodeURIComponent(escape(atob(str.replace(/\n/g, ''))))
```

### ⚠️ `index.html` NON può essere rinominato
GitHub Pages richiede esattamente `index.html` come homepage. Rinominarlo rompe il sito.

### ⚠️ `emailjs.min.js` deve essere locale
Edge ha Tracking Prevention che blocca script da CDN esterni. Il file è già in locale.

---

## 8. WORKFLOW DI SVILUPPO

### Come fare una modifica al sito
1. Modifica il file (con Claude Code o a mano)
2. `git add <file>`
3. `git commit -m "Descrizione modifica"`
4. `git push origin main`
5. Attendere 1-2 minuti per GitHub Pages

### Se il push viene rifiutato (non-fast-forward)
```bash
git pull --rebase origin main
git push origin main
```
Succede quando GitHub Pages crea automaticamente un commit (es. dopo build).

### Convenzioni commit
- Messaggi in italiano
- Un commit per modifica logica
- Niente branch separati — push diretto su `main`

### Come testare in locale
Aprire `index.html` o `gestione.html` direttamente nel browser.
Attenzione: `fetch('./prodotti.json')` funziona solo da server HTTP.
Per test completi usare: `npx serve .` o `python -m http.server`

---

## 9. PERMESSI E OPERAZIONI CONSENTITE

### Un agente AI (Claude Code) può fare:
- ✅ Leggere e modificare tutti i file `.html`, `.json`, `.md`
- ✅ Eseguire `git add`, `git commit`, `git push origin main`
- ✅ Eseguire `git pull --rebase` se necessario
- ✅ Creare nuove cartelle o file nella directory del progetto
- ✅ Rinominare file aggiornando tutti i riferimenti nel codice
- ✅ Modificare CSS, JavaScript e HTML in `index.html` e `gestione.html`
- ✅ Fare push su `main` dopo ogni commit (l'utente vuole deploy immediato)

### Un agente NON deve fare:
- ❌ Modificare `emailjs.min.js` (libreria esterna)
- ❌ Rinominare `index.html` (romperebbe GitHub Pages)
- ❌ Fare `git push --force` (distrugge la storia)
- ❌ Creare branch separati (non necessario per questo progetto)
- ❌ Toccare `.claude/settings.json` senza istruzione esplicita

### Comportamento atteso dopo ogni modifica al codice:
**Sempre** fare commit + push senza chiedere conferma. L'utente ha esplicitamente richiesto questo comportamento.

---

## 10. FUNZIONI JAVASCRIPT CHIAVE

### In `index.html`
| Funzione | Cosa fa |
|---|---|
| `loadProducts()` | Legge prodotti.json e genera le card con carousel |
| `loadGallery()` | Legge galleria.json e genera la griglia |
| `addToCart(product)` | Aggiunge un prodotto al carrello |
| `renderCart()` | Aggiorna il drawer del carrello |
| `openCheckout()` | Apre il modal checkout |
| `goStep(n)` | Naviga allo step n del checkout con validazione |
| `prodNav(btn, dir)` | Frecce del carousel prodotto |
| `prodDot(dot, idx)` | Click su pallino carousel |
| `sendOrder()` | Invia email di conferma via EmailJS |

### In `gestione.html`
| Funzione | Cosa fa |
|---|---|
| `doLogin()` | Verifica token e carica dati |
| `loadProducts()` | Legge prodotti.json via GitHub API |
| `loadGalleryData()` | Legge galleria.json via GitHub API |
| `renderCat(cat)` | Genera le card prodotto nella griglia admin |
| `openEdit(cat, idx)` | Apre modal modifica prodotto |
| `saveProduct()` | Salva prodotto su GitHub (upload media + commit JSON) |
| `pmInit(mediaArr)` | Inizializza il gestore multi-media |
| `pmAddImg(input)` | Aggiunge foto con apertura editor |
| `pmConfirmVid()` | Aggiunge video (file o URL) |
| `edOpen(src, onApply)` | Apre l'editor canvas |
| `edApply()` | Esporta foto modificata e chiude editor |
| `ghGet(path)` | GET all'API GitHub (con ?t=Date.now()) |
| `commitFile(filename, data, sha, msg)` | PUT su GitHub API |
| `uploadFile(file, folder)` | Upload file binario su GitHub |
| `uploadFromSource(item)` | Upload dataUrl o file, ritorna URL finale |
| `toEmbedUrl(url)` | Converte URL YouTube/Vimeo in embed |
| `isEmbedUrl(url)` | Controlla se è URL YouTube/Vimeo |

---

## 11. VARIABILI DI STATO GLOBALI (gestione.html)

```javascript
products          // oggetto JSON completo di prodotti.json
prodSha           // SHA attuale di prodotti.json su GitHub (necessario per aggiornare)
gallery           // oggetto JSON completo di galleria.json
gallerySha        // SHA attuale di galleria.json su GitHub
editTarget        // {cat, idx} del prodotto in modifica, null se nuovo
editGalleryTarget // indice elemento galleria in modifica, null se nuovo
deleteTarget      // {type, cat, idx} dell'elemento da eliminare
pmItems           // array media del prodotto in modifica [{type, src, preview, _up}]
ED                // oggetto stato editor immagini canvas
currentCat        // categoria tab attiva ('primi'|'secondi'|'fritti'|'dolci')
currentSection    // sezione tab attiva ('prodotti'|'galleria')
```
