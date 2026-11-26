---
'@beastui/css': patch
'@beastui/preact': patch
---

Veil: one region of the page is busy, the rest stays usable. The content goes `inert` behind a card (title, progress, Cancel); a live region says the title only. CSS `.b-veil-region` and its parts, Preact `Veil` (`busy`, `title`, `content`, `actions`, `delay`).
