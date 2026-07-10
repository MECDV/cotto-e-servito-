# Hero — Scala blocco contenuto

**Obiettivo:** Ridurre proporzionalmente l'intero blocco hero-content per un aspetto più raccolto ed elegante, mantenendo struttura, animazioni e colori invariati.

## Valori da modificare (solo CSS desktop)

| Elemento | Proprietà | Prima | Dopo |
|---|---|---|---|
| `.hero-title` e `.hero-title-2` | `font-size` | `clamp(4rem, 11vw, 8.5rem)` | `clamp(3rem, 8vw, 6.5rem)` |
| `.hero-content` | `max-width` | `860px` | `700px` |
| `.hero-content` | `padding` | `2rem` | `1.5rem` |
| `.hero-subtitle` | `font-size` | `clamp(1.1rem, 2.5vw, 1.8rem)` | `clamp(1rem, 2vw, 1.5rem)` |
| `.hero-tagline` | `margin-bottom` | `1rem` | `0.8rem` |
| `.hero-title-reveal` | `margin` | `0 auto 2rem` | `0 auto 1.5rem` |
| `.hero-subtitle` | `margin-bottom` | `3rem` | `2.5rem` |
| `.hero-line` | `margin-bottom` | `2rem` | `1.5rem` |
| `.hero-desc` | `margin` | `0 auto 3rem` | `0 auto 2.5rem` |

## Scope

- Solo `index.html`, solo CSS
- Nessuna modifica a HTML, JS, animazioni, colori, mobile CSS, bottoni
