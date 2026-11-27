---
'@beastui/tokens': patch
'@beastui/css': patch
'@beastui/preact': patch
---

Skeleton: the shape of content on its way. CSS `.b-skeleton` wraps sample text (invisible, gives the size) or stands alone as one line; `data-shape="circle"` / `"block"`, `data-delay`; pulse from light to dark grey, still under reduced motion.

Alert: a message that stays in the page. CSS `.b-alert` and its parts, `data-tone="danger"` / `"warning"`. Preact `Alert` (`tone`, `title`, `icon`, `actions`, `onDismiss`, `dismissLabel`).

Token `color.warning-text`: the warning alert's title and icon, a yellow that keeps 4.5:1 on the warning tint.
