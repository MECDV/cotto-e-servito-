# Guida per un agente AI che lavora su questo progetto

> Leggi questo file PRIMA di toccare qualsiasi cosa. Scritto il 9 luglio 2026
> dopo una sessione in cui il recupero di una modifica "persa" ha richiesto
> ore per un bug dell'ambiente, non del progetto. Le sezioni 1-2 spiegano
> quel bug: leggile per non ripetere lo stesso lavoro.

---

## 1. ATTENZIONE — bug dell'ambiente sandbox (non del sito)

La cartella locale `sito chiapposo` viene letta dal tool shell (bash) tramite
un **mount FUSE** che ha due difetti seri. Se un agente li ignora, ogni
operazione git va in loop di errori.

### 1a. `unlink()` non funziona — solo `rename()` (mv)

Il mount blocca la cancellazione diretta dei file (`rm`, `unlink()`) con
`Operation not permitted`, ma **`mv` funziona sempre**, anche tra cartelle
diverse dello stesso mount. Git usa internamente `unlink()` per rimuovere i
propri file di lock (`.git/index.lock`, `.git/HEAD.lock`, ecc.) dopo ogni
comando: su questo mount quell'unlink fallisce silenziosamente e il lock
resta lì, bloccando il comando successivo con:

```
fatal: Unable to create '.../.git/index.lock': File exists.
```

**Soluzione pratica:** prima di OGNI comando `git` che scrive (add, commit,
status, reset, merge, rebase, pull, push...), sposta via il lock invece di
cancellarlo:

```bash
mv -f .git/index.lock "/tmp/discard_$RANDOM" 2>/dev/null
git <comando>
```

Se il comando fallisce di nuovo per lo stesso motivo su un lock diverso
(`HEAD.lock`, `REBASE_HEAD.lock`, `refs/heads/main.lock`, `packed-refs.lock`),
applica lo stesso trattamento a quel file specifico.

**Non rinominare mai un lock lasciandolo dentro `.git/refs/heads/`** — git
tratta qualsiasi file in quella cartella come un ref e va in errore
("bad object..."). Spostalo fuori da `.git/` interamente (es. `/tmp` o la
radice del progetto).

### 1b. Operazioni che richiedono di sovrascrivere file tracciati (`git reset --hard`, `checkout`, `merge` con conflitti) falliscono sempre

Perché internamente fanno unlink+create sui file di lavoro, non solo sui
lock. Se serve allineare la cartella locale a `origin/main`:

1. Clona il repo pulito in un'altra zona del filesystem che NON sia questo
   mount (es. `/tmp/clone-cotto`) — lì git funziona normalmente.
2. Confronta/copia i file necessari da lì alla cartella locale con `cp`
   (sovrascrivere un file esistente con `cp` funziona, è diverso da
   `unlink+create`).
3. Se anche i metadati `.git` locali sono da allineare: `mv` l'intera
   cartella `.git` locale altrove (funziona, è un rename), poi `cp -r` la
   `.git` pulita dal clone temporaneo al suo posto.

### 1c. Il tool Write/Edit (bridge Windows) e il mount bash (FUSE) NON sono sempre coerenti in tempo reale

Un file scritto con lo strumento nativo (Read/Write/Edit, quello che vede il
percorso Windows `C:\...`) può risultare **stale o troncato** se letto subito
dopo via bash (`cat`, `git diff`) sullo stesso file. La causa è una cache non
invalidata tra i due bridge.

**Soluzione pratica:** se un file scritto via Write/Edit deve poi essere
processato da un comando `git` in bash, non fidarti della prima lettura bash
successiva. Verifica il contenuto reale col tool `Read` (fonte di verità), e
se serve farlo combaciare in bash, riscrivilo direttamente da bash (`cp` /
heredoc) invece di aspettare che la cache si allinei da sola.

### 1d. Permessi file "fantasma"

Il mount presenta quasi tutti i file come modificati in `git status` per un
cambio di permesso 644→755, senza alcun cambio di contenuto reale. Per
evitare rumore continuo, in questo repo è impostato:

```bash
git config core.fileMode false
```

Se in un futuro clone `git status` mostra decine di file "modified" senza
diff di contenuto reale, è questo — verifica con `git diff --stat` (mostra
`0` righe cambiate) prima di preoccuparti.

### 1e. Alcuni file/cartelle non potranno mai essere eliminati da questo ambiente

Se un'operazione crea file di scarto che non si riescono a cancellare (per
il bug 1a), spostali in una sottocartella dedicata (es.
`_da_eliminare_manualmente/`) e segnala all'utente di cancellarla lui stesso
da Windows (lì non c'è alcun limite: è solo il bridge dell'agente ad avere
questa restrizione).

---

## 2. Credenziali GitHub

Il progetto usa **due canali diversi** per scrivere su GitHub, non
confonderli:

| Canale | Dove | Credenziale |
|---|---|---|
| Pannello admin (`gestione.html`) | Browser dell'utente | Personal Access Token salvato in `localStorage`, chiave `cotto_token` |
| Agente AI da shell (`git commit` + `git push`) | Sandbox dell'agente | Token fornito a voce dall'utente in chat, quando serve |

L'agente **non ha accesso** al token salvato nel browser. Se deve fare
`git push` da shell e non ha credenziali configurate, deve chiederlo
esplicitamente all'utente in chat. Una volta ricevuto:

```bash
git config user.email "marcodevellis9@gmail.com"
git config user.name "MECDV"
git config credential.helper "store --file=.git/credentials-store"
printf 'https://MECDV:IL_TOKEN@github.com\n' > .git/credentials-store
chmod 600 .git/credentials-store
```

Il file `.git/credentials-store` resta locale (dentro `.git/`, mai
committato) e permette push futuri senza richiedere di nuovo il token,
**finché la sessione/sandbox corrente esiste**. In una sandbox nuova (nuova
sessione), il file potrebbe non esserci più: in tal caso richiedi di nuovo il
token all'utente. Non scrivere mai il token in file tracciati da git, in
messaggi di commit, o in `LEGGIMI.md`/`README.md`.

**Prima di chiedere il token, verifica se serve davvero:** se il contenuto
locale coincide già con `origin/main` (vedi sezione 1b per come confrontare
con un clone pulito), non c'è nulla da pushare.

---

## 3. Struttura del sito (sintesi — dettagli completi in `LEGGIMI.md`)

| File | Ruolo |
|---|---|
| `index.html` | Sito pubblico completo (menu, carrello, checkout, email, log ordini) — mai rinominare |
| `gestione.html` | Pannello admin privato, autenticato via token GitHub salvato nel browser |
| `prodotti.json` | Database prodotti (menu), letto da entrambe le pagine |
| `galleria.json` | Database galleria foto/video |
| `emailjs.min.js` | Libreria email locale — non toccare, non sostituire con CDN |
| `ordini-apps-script.gs` | Script Google Apps Script per il log ordini su Google Sheet (backup indipendente dall'email) |
| `foto/`, `video/` | Media caricati dal pannello |
| `404.html`, `robots.txt`, `sitemap.xml` | SEO/UX di base |
| `CLAUDE.md` | Istruzioni operative obbligatorie (commit+push automatico, vincoli) |
| `LEGGIMI.md` | Documentazione tecnica completa (schema JSON, funzioni JS, vincoli CORS/SHA/base64) |

Repo: `MECDV/cotto-e-servito-` · Sito: https://mecdv.github.io/cotto-e-servito-/
Admin: https://mecdv.github.io/cotto-e-servito-/gestione.html

---

## 4. Comportamento operativo obbligatorio (da CLAUDE.md)

1. Dopo ogni modifica al codice: `git add` → `git commit` → `git push origin main`, **sempre, senza chiedere conferma**.
2. Se il push viene rifiutato: `git pull --rebase origin main && git push origin main` — ma su questo mount preferisci il flusso descritto in 1b (clone pulito) se il rebase va in loop di lock.
3. Commit in italiano, diretti, niente branch separati, push diretto su `main`.
4. Prima di un push, **controlla sempre se il contenuto è già presente su `origin/main`** (può essere stato aggiornato dal pannello admin, che scrive direttamente su GitHub via API senza passare da git). Un push "a sorpresa" respinto con `fetch first` è normale in questo progetto, non un errore da temere.

### Vincoli tecnici del sito stesso (non dell'ambiente)
- CORS: mai header `Cache-Control` nelle fetch verso l'API GitHub — usare `?t=Date.now()`.
- Serve sempre lo `sha` corrente per aggiornare un file via API GitHub.
- Base64 per testo italiano: `btoa(unescape(encodeURIComponent(str)))`.
- `index.html` non può essere rinominato (GitHub Pages).

---

## 5. Stato del progetto al 9 luglio 2026 — cosa manca

Funzionalità implementate ma **in attesa di attivazione da parte del
titolare** (non sono bug, sono placeholder intenzionali):

1. **Log ordini su Google Sheet**: codice pronto in `index.html`
   (`logOrderToSheet`, righe con `ORDERS_WEBHOOK_URL`/`ORDERS_WEBHOOK_KEY`) e
   script completo in `ordini-apps-script.gs`. `ORDERS_WEBHOOK_URL` è ancora
   vuoto: finché il titolare non crea il Google Sheet, distribuisce lo script
   e comunica l'URL, la funzione non fa nulla (nessun errore, nessun blocco
   degli ordini).
2. **Analytics GoatCounter**: script presente in `index.html` con
   `data-goatcounter="https://XXXXX.goatcounter.com/count"` — il segnaposto
   `XXXXX` va sostituito con il site code una volta che il titolare crea
   l'account gratuito su goatcounter.com.

Tutto il resto (EmailJS, IBAN, catalogo prodotti, galleria) risulta già
configurato con valori reali, non segnaposto.
