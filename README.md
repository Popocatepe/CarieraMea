# CarieraMea — Găsește Cariera Potrivită

Aplicație web progresivă (PWA) pentru explorare și orientare în carieră.

## Fișiere principale

- `index.html` — jocul CarieraMea v2
- `manifest.json` — configurare PWA
- `sw.js` — service worker pentru cache
- `netlify.toml` — configurare Netlify
- `netlify/functions/chat.js` — funcție serverless pentru analiza răspunsurilor
- `icons/icon.svg` — iconiță aplicație

## Publicare pe Netlify

1. Conectează acest repository la Netlify.
2. Lasă setările din `netlify.toml`.
3. Adaugă variabila de mediu:

```text
ANTHROPIC_API_KEY
```

4. Fă redeploy.

## Notă

Cheia API nu trebuie pusă direct în cod.
