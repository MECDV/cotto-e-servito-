# Design — Nuove funzionalità Cotto & Servito

**Data:** 2026-07-10
**Stato:** Approvato dall'utente

---

## Contesto

Sito statico GitHub Pages (HTML/CSS/JS puro, nessun build step). Dati dinamici in `prodotti.json`, `galleria.json`, `config.json`. Modifiche admin via GitHub API REST. Nessun backend server.

---

## 1. Slot orario di ritiro

**Scopo:** Nel checkout, quando il cliente sceglie "Ritiro in negozio", può selezionare un orario di ritiro tra quelli disponibili.

**Comportamento:**
- Appare solo se modalità di consegna = ritiro (non per la consegna a domicilio)
- Gli slot vengono generati in JS ogni 30 minuti tra `orari[giornoOggi].dalle` e `orari[giornoOggi].alle` letti da `config.json` (già caricato)
- Se il negozio è chiuso oggi (`aperto: false`) o è attiva `chiusura_straordinaria`, nessuno slot viene mostrato e appare un messaggio
- Il cliente seleziona uno slot con click — UI a bottoni (stile `.time-slot` già esistente)
- Lo slot scelto viene incluso nell'email d'ordine e nel riepilogo finale

**File modificati:** `index.html` (JS + HTML checkout step 1)
**File nuovi:** nessuno

---

## 2. Countdown offerta

**Scopo:** Banner visibile sotto la nav con un'offerta a tempo. Quando attiva, abbassa automaticamente il prezzo del prodotto in offerta nel carrello.

**Struttura dati — aggiunta a `config.json`:**
```json
"offerta": {
  "attiva": false,
  "testo": "Lasagna -20% solo oggi!",
  "prodotto_id": "lasagna-al-forno",
  "sconto_pct": 20,
  "scadenza": "2026-07-10T19:00:00"
}
```

**Frontend (`index.html`):**
- Banner fisso sotto la nav (posizione: dopo `<nav>`, `position: sticky`, non `fixed`)
- Visibile solo se `offerta.attiva = true` AND `new Date() < new Date(offerta.scadenza)`
- Timer `HH:MM:SS` aggiornato ogni secondo con `setInterval`
- Alla scadenza: banner si nasconde automaticamente, sconto rimosso dal carrello
- Se il prodotto in offerta è nel carrello, il prezzo viene ridotto dello `sconto_pct` nel totale (riga separata "Offerta applicata: -X%")

**Admin (`gestione.html`):**
- Nuova tab "🎯 Offerta" nella toolbar
- Campi: toggle attiva/disattiva, campo testo, select prodotto (popolata da prodotti.json), input sconto %, input data+ora scadenza
- Salvataggio via GitHub API (aggiorna `config.json` con il campo `offerta`)

**File modificati:** `index.html`, `gestione.html`, `config.json`
**File nuovi:** nessuno

---

## 3. Storico ordini cliente

**Scopo:** Il cliente può rivedere gli ordini passati salvati nel browser e ri-ordinare con un click.

**Storage:** `localStorage`, chiave `cs_ordini`, array max 10 elementi (FIFO — il più vecchio viene rimosso al limite)

**Schema singolo ordine salvato:**
```json
{
  "id": "1720612345678",
  "data": "2026-07-10T14:32:00",
  "items": [{ "id": "lasagna", "name": "Lasagna al Forno", "price": 5.30, "qty": 2, "img": "..." }],
  "totale": 10.60,
  "modalita": "ritiro"
}
```

**Quando salvare:** dopo la conferma ordine (step 4 checkout), prima di svuotare il carrello.

**UI:**
- Nuovo pulsante "📋" nella nav (accanto all'icona account)
- Apre un drawer laterale (stile `.cart-drawer` esistente) "I miei ordini"
- Lista ordini con data, prodotti, totale
- Pulsante **Ri-ordina** per ogni ordine: svuota il carrello e ricarica tutti i prodotti dell'ordine

**File modificati:** `index.html`
**File nuovi:** nessuno

---

## 4. Coupon / Codice sconto

**Scopo:** Il cliente può inserire un codice sconto al checkout. Lo sconto può essere una percentuale o un importo fisso.

**Storage:** Nuovo file `coupons.json`:
```json
[
  { "codice": "COTTO10", "tipo": "pct", "valore": 10, "attivo": true },
  { "codice": "PROMO2", "tipo": "eur", "valore": 2, "attivo": true }
]
```

**Frontend (`index.html`):**
- Campo coupon nel checkout step 2 (dati cliente), sopra il pulsante "Continua"
- Input testo + bottone "Applica" → fetch `coupons.json?t=Date.now()`
- Validazione: codice non trovato → errore rosso; disattivato → errore; trovato → conferma verde con sconto mostrato
- Lo sconto viene sottratto dal totale nel riepilogo (step 3) con riga dedicata
- Un solo coupon per ordine; bottone "Rimuovi" per annullare
- Codice case-insensitive (confronto con `.toUpperCase()`)
- **Stacking con offerta:** se è attiva un'offerta sul prodotto, il prezzo del prodotto si abbassa prima; il coupon si applica poi sul subtotale già ridotto (si cumulano)

**Admin (`gestione.html`):**
- Nuova tab "🏷️ Coupon"
- Lista coupon esistenti con toggle attivo/disattivo e bottone elimina
- Form aggiungi nuovo coupon: codice, tipo (% / €), valore
- Salvataggio via GitHub API (sovrascrive `coupons.json`)

**File modificati:** `index.html`, `gestione.html`
**File nuovi:** `coupons.json`

---

## 5. PWA — App installabile

**Scopo:** Il sito diventa installabile come app sul telefono (icona sulla schermata home) e funziona offline. È lo stesso identico sito — il service worker si aggiorna automaticamente a ogni deploy.

**`manifest.json`:**
```json
{
  "name": "Cotto & Servito",
  "short_name": "Cotto & Servito",
  "description": "Gastronomia artigianale di Ceprano",
  "start_url": "/cotto-e-servito-/",
  "display": "standalone",
  "background_color": "#1C0F06",
  "theme_color": "#B8965A",
  "icons": [{ "src": "icon.svg", "sizes": "any", "type": "image/svg+xml" }]
}
```

**`sw.js` (service worker):**
- Strategia **cache-first** per asset statici: `index.html`, `gestione.html`, `emailjs.min.js`, font Google
- Strategia **network-first** per dati: `prodotti.json`, `galleria.json`, `config.json`, `coupons.json`
- All'aggiornamento del sito (nuovo deploy): il SW scarica silenziosamente la nuova versione in background; al prossimo avvio l'utente vede la versione aggiornata

**`icon.svg`:** Logo testuale "C&S" con i colori brand (sfondo espresso, testo oro)

**Registrazione in `index.html`:**
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cotto-e-servito-/sw.js');
}
```

**File modificati:** `index.html`
**File nuovi:** `manifest.json`, `sw.js`, `icon.svg`

---

## Ordine di implementazione

1. Slot orario (solo `index.html`, zero dipendenze)
2. Countdown offerta (aggiunge campo a `config.json` + tab admin)
3. Storico ordini (solo `index.html`)
4. Coupon (nuovo file + admin + checkout)
5. PWA (file nuovi indipendenti)
