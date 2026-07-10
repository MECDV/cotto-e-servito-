# Scroll indicator — integrazione riga CTA

**Obiettivo:** Spostare l'indicatore "Scorri" dentro la riga dei bottoni CTA, come elemento centrale tra "Scopri i Prodotti" e "La Nostra Storia".

## Layout risultante

```
[Scopri i Prodotti]   SCORRI   [La Nostra Storia]
                        │ ← linea animata oro
```

## Modifiche

### HTML — spostare .scroll-indicator dentro .hero-cta
```html
<div class="hero-cta">
  <a href="#menu" class="btn-primary">Scopri i Prodotti</a>
  <div class="scroll-indicator" aria-hidden="true">
    <p>Scorri</p>
    <span></span>
  </div>
  <a href="#storia" class="btn-secondary">La Nostra Storia</a>
</div>
<!-- rimuovere il div.scroll-indicator che era dopo .hero-content -->
```

### CSS — .scroll-indicator
Rimuovere: `position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);`
Mantenere tutto il resto invariato.

### CSS — .hero-cta
- `display: inline-flex` → `display: flex`
- Aggiungere `align-items: center`

## Scope
- Solo `index.html` (HTML + CSS)
- Mobile non cambia: `.scroll-indicator { display: none; }` già presente
