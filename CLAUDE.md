# Cotto & Servito — Istruzioni per l'agente

Leggi `LEGGIMI.md` per la documentazione tecnica completa.

## Comportamento obbligatorio

- **Dopo ogni modifica al codice**: `git add <file> && git commit -m "..." && git push origin main`. Sempre. Senza chiedere conferma.
- Se il push viene rifiutato: `git pull --rebase origin main && git push origin main`
- Commit in italiano, diretto, niente branch separati, push su `main`

## Progetto

| | |
|---|---|
| **Sito** | Ristorante Cotto & Servito su GitHub Pages |
| **Repo** | `MECDV/cotto-e-servito-` |
| **URL** | https://mecdv.github.io/cotto-e-servito-/ |
| **Admin** | https://mecdv.github.io/cotto-e-servito-/gestione.html |
| **Token GitHub** | In `localStorage` → chiave `cotto_token` (token PAT classic, scope `repo`) |

## File e cartelle

| File | Ruolo |
|---|---|
| `index.html` | Sito pubblico completo (NON rinominare mai) |
| `gestione.html` | Pannello admin privato |
| `prodotti.json` | Database prodotti (menu) |
| `galleria.json` | Database galleria |
| `emailjs.min.js` | Libreria email locale (NON toccare) |
| `foto/` | Immagini caricate dal pannello |
| `video/` | Video caricati (si crea al primo upload) |

## Vincoli critici — memorizzare prima di toccare l'API GitHub

1. **CORS**: MAI aggiungere header `Cache-Control` nelle fetch all'API GitHub — viene bloccato dal preflight. Usare `?t=Date.now()` nell'URL.
2. **SHA obbligatorio**: Per aggiornare un file su GitHub serve il `sha` attuale (letto al caricamento, salvato in `prodSha`/`gallerySha`).
3. **Base64 UTF-8**: `btoa(unescape(encodeURIComponent(str)))` — non usare `btoa()` diretto su testo con caratteri italiani.
4. **`index.html` intoccabile**: GitHub Pages richiede esattamente questo nome per la homepage.
5. **Cache busting**: Tutte le `fetch()` su file del sito usano `?t=Date.now()`.

## Schema JSON

### prodotti.json
```json
{
  "categories": [{"id":"primi","label":"Primi Piatti"}, ...],
  "products": {
    "primi": [{
      "id": "slug-prodotto",
      "name": "Nome Prodotto",
      "description": "...",
      "weight": "400g · monoporzione",
      "price": 5.30,
      "img": "https://mecdv.github.io/cotto-e-servito-/foto/file.jpg",
      "media": [
        {"type": "image", "src": "https://..."},
        {"type": "video", "src": "https://www.youtube.com/embed/..."}
      ]
    }]
  }
}
```

### galleria.json
```json
{
  "items": [{
    "id": "g1",
    "type": "image",
    "src": "https://...",
    "title": "...",
    "size": "" | "tall" | "wide"
  }]
}
```

## Permessi

| Operazione | Consentita? |
|---|---|
| Modificare `index.html`, `gestione.html` | ✅ |
| Modificare `prodotti.json`, `galleria.json` | ✅ |
| Modificare `LEGGIMI.md`, `README.md`, `CLAUDE.md` | ✅ |
| Creare nuovi file o cartelle | ✅ |
| `git add / commit / push origin main` | ✅ sempre |
| `git pull --rebase` se push rifiutato | ✅ |
| Modificare `emailjs.min.js` | ❌ |
| Rinominare `index.html` | ❌ |
| `git push --force` | ❌ |
| Creare branch separati | ❌ non necessario |

## Utente

- Non esperto di coding — usare linguaggio semplice nelle spiegazioni
- Vuole il sito sempre aggiornato → push immediato dopo ogni modifica
- Lingua preferita: italiano
