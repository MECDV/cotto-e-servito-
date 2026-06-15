# Cotto & Servito — L'Oasi della Buona Tavola

Sito vetrina single-page (HTML/CSS/JS, nessuna dipendenza di build) per la
gastronomia artigianale **Cotto & Servito** di Ceprano (FR): presentazione,
catalogo prodotti, carrello e flusso d'ordine in 4 step (consegna → dati →
pagamento → conferma) con notifica via e-mail.

## Avvio

È un unico file statico: apri `index.html` nel browser, oppure servilo con un
qualsiasi web server (es. GitHub Pages, Netlify, o `python3 -m http.server`).

## Configurazione (da completare a cura del titolare)

Tutti i valori segnaposto sono raccolti nel tag `<script>` in fondo a
`index.html`:

1. **EmailJS** (notifica ordini via e-mail) — crea un account gratuito su
   <https://www.emailjs.com> e sostituisci:
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `to_email` (in `sendOrderEmail`) con l'indirizzo che riceve gli ordini.

   Finché le chiavi non sono inserite, l'ordine viene comunque confermato a
   schermo e compare un avviso "configura EmailJS" — nessun errore bloccante.

2. **IBAN per il bonifico** — sostituisci il placeholder nel box
   `#bonifico-box` (step 3 del checkout).

3. **Immagini** — le foto sono segnaposto da Unsplash; sostituiscile con le
   fotografie reali dei piatti (`<img src="…">` nelle sezioni Menu e Galleria).

## Note tecniche

Lo script è collocato in fondo al `<body>` così da agganciare correttamente
tutti gli elementi (carrello, drawer, checkout, toast). Il cursore
personalizzato e gli effetti hover usano la delega degli eventi; su mobile
sono attivi il menu hamburger e le gesture di swipe per chiudere
carrello/checkout.
