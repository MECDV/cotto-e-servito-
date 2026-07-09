# Cotto & Servito — L'Oasi della Buona Tavola

Sito vetrina single-page (HTML/CSS/JS, nessuna dipendenza di build) per la
gastronomia artigianale **Cotto & Servito** di Ceprano (FR): presentazione,
catalogo prodotti, carrello e flusso d'ordine in 4 step (consegna → dati →
pagamento → conferma) con notifica via e-mail.

**URL pubblico:** https://mecdv.github.io/cotto-e-servito-/
**Admin:** https://mecdv.github.io/cotto-e-servito-/gestione.html

---

## Funzionalità

### Sito pubblico (`index.html`)
- Catalogo prodotti con categorie (Primi, Secondi, Fritti, Dolci)
- Scheda prodotto modale con galleria multi-media (foto + video YouTube)
- Carrello persistente con animazione "fly-to-cart"
- Checkout 4 step: consegna → dati → pagamento → conferma
- Calcolo spese di spedizione con geolocalizzazione
- Filtri allergeni (13 allergeni) per escludere prodotti non adatti
- Badge orario apertura/chiusura in tempo reale (aggiornato da `config.json`)
- Condivisione prodotto via Web Share API
- **Dark mode** con sistema a 4 livelli di superficie e glow oro ambientale
- Animazioni: cursor personalizzato, parallax hero, particelle, card tilt 3D,
  fly-to-cart, scroll reveal, shimmer titoli, bounce carrello
- Iscrizione newsletter (drawer laterale)

### Pannello admin (`gestione.html`)
- Gestione prodotti: aggiunta, modifica, eliminazione con anteprima live
- Gestione galleria: caricamento foto/video, ordinamento
- Gestione orari: apertura/chiusura per giorno della settimana + chiusura straordinaria
- Upload immagini codificate in base64 verso GitHub API
- Tutte le modifiche salvate direttamente su GitHub (nessun backend)

---

## File principali

| File | Ruolo |
|---|---|
| `index.html` | Sito pubblico completo |
| `gestione.html` | Pannello admin |
| `prodotti.json` | Database prodotti (menu) |
| `galleria.json` | Database galleria |
| `config.json` | Orari di apertura + flag chiusura straordinaria |
| `emailjs.min.js` | Libreria EmailJS (non modificare) |
| `foto/` | Immagini caricate dal pannello admin |

---

## Configurazione iniziale

### 1. EmailJS (notifiche ordini via e-mail)
Crea un account su https://www.emailjs.com e inserisci in `index.html`:
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `to_email` nell'oggetto `sendOrderEmail`

Senza chiavi l'ordine viene confermato a schermo con un avviso; nessun errore bloccante.

### 2. IBAN bonifico
Sostituisci il placeholder nel blocco `#bonifico-box` (step 3 del checkout).

### 3. Token GitHub (per il pannello admin)
Crea un Personal Access Token GitHub con scope `repo` e incollalo nel
campo token del pannello admin (`gestione.html`). Viene salvato in
`localStorage` → chiave `cotto_token` e non viene mai scritto nei file.

### 4. Immagini
Le foto placeholder vengono da Unsplash. Sostituiscile caricando le foto
reali direttamente dal pannello admin, oppure modifica gli URL in `prodotti.json`.

---

## Avvio locale

```bash
npx serve . -l 3000
# oppure
python3 -m http.server 3000
```

Poi apri http://localhost:3000

---

## Note tecniche

- **Nessun build step** — file statici puri, funziona su GitHub Pages senza CI
- **API GitHub diretta** — le modifiche admin scrivono su GitHub via API REST;
  serve SHA attuale del file + base64 UTF-8 per i caratteri italiani
- **CORS**: non aggiungere mai `Cache-Control` nelle fetch all'API GitHub;
  usare `?t=Date.now()` per il cache busting
- Lo script è in fondo al `<body>` per agganciarsi correttamente a tutti gli elementi
- Su mobile: menu hamburger, swipe per chiudere drawer, tap target ≥ 44px
- Il tilt 3D delle card e il cursore personalizzato sono disabilitati su touch device
