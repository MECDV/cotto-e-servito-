# Hero — Spaziatura verticale

**Problema:** La spaziatura tra gli elementi del hero era inconsistente — il blocco tagline/titolo troppo stretto, le sezioni successive tutte uguali e larghe senza gerarchia visiva.

**Soluzione:** Gerarchia a 3 livelli (piccolo / medio / grande) per creare gruppi visivi chiari.

## Valori da modificare (solo CSS desktop)

| Proprietà CSS | Valore attuale | Valore nuovo |
|---|---|---|
| `.hero-tagline` → `margin-bottom` | 2rem | 1rem |
| `.hero-title-reveal` → `margin` | 0 auto 1.5rem | 0 auto 2rem |
| `.hero-subtitle` → `margin-bottom` | 3.5rem | 3rem |
| `.hero-line` → `margin-bottom` | 3rem | 2rem |
| `.hero-desc` → `margin` | 0 auto 3.5rem | 0 auto 3rem |

## Ritmo risultante

```
tagline     ── 1rem ──   (piccolo: stesso blocco heading)
titolo      ── 2rem ──   (medio: respiro tra heading e body)
sottotitolo ── 3rem ──   (grande: pausa prima del separatore)
linea — · — ── 2rem ──   (medio: connessione separatore-testo)
descrizione ── 3rem ──   (grande: enfasi prima dell'azione)
bottoni CTA
```

## Scope

- Solo `index.html`, solo CSS
- Nessuna modifica a HTML, JS, animazioni, colori, mobile CSS
