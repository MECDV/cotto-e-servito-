# Cotto & Servito — Guida alla cartella del sito

Questa è la cartella del tuo sito web. Qui dentro ci sono tutti i pezzi che fanno funzionare il sito.
Non devi toccare nulla a mano: tutto si aggiorna dal pannello di gestione.

---

## 📁 Cosa c'è dentro questa cartella

### 📄 index.html — **La pagina del sito web**
È la pagina che vede il cliente quando visita il sito.
Contiene il menu, la galleria, il carrello e il checkout.
**Non rinominare mai questo file** — il sito smetterebbe di funzionare.

### 📄 gestione.html — **Il pannello di gestione (solo tuo)**
È la pagina privata che usi tu per gestire il sito.
Da qui puoi aggiungere/modificare prodotti e foto della galleria.
Si apre all'indirizzo: `https://mecdv.github.io/cotto-e-servito-/gestione.html`
Per accedere serve il tuo token GitHub.

### 📄 prodotti.json — **La lista dei prodotti**
È un file di testo che contiene tutti i prodotti del menu con prezzi, descrizioni e foto.
Viene aggiornato automaticamente quando salvi dal pannello di gestione.
Non aprirlo a mano — si aggiorna da solo.

### 📄 galleria.json — **La lista delle foto/video della galleria**
Come il file dei prodotti, ma per la sezione galleria del sito.
Viene aggiornato automaticamente dal pannello di gestione.

### 📄 emailjs.min.js — **Il programma per le email**
È un file tecnico che permette al sito di inviare le email di conferma ordine.
Non toccarlo mai — non serve aprirlo.

### 📄 README.md — **Note tecniche (in inglese)**
Un file di appunti tecnici in inglese. Non serve per il normale utilizzo.

### 📄 LEGGIMI.md — **Questa guida**
Il file che stai leggendo adesso.

---

## 📁 foto/ — **Le foto caricate dal pannello di gestione**
Qui dentro finiscono tutte le foto che carichi tramite il pannello di gestione.
Quando carichi una foto di un prodotto o della galleria, viene salvata automaticamente in questa cartella.
Non aggiungere o rimuovere file a mano.

## 📁 video/ — **I video caricati dal pannello di gestione**
Come la cartella foto, ma per i video. Si riempie quando carichi un video dal pannello.

---

## 🌐 Come funziona in breve

```
Tu apri gestione.html
       ↓
Modifichi i prodotti / la galleria
       ↓
Il pannello aggiorna prodotti.json e galleria.json su GitHub
       ↓
Il sito (index.html) legge i file aggiornati e mostra le novità
```

Il sito viene aggiornato entro **1-2 minuti** dal salvataggio.
