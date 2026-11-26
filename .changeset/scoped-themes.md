---
'@beastui/tokens': patch
'@beastui/css': patch
---

`data-theme` works on any element, not only `<html>`: one part of the page can use another theme. Each themed element declares the tokens again, so the aliases (`--b-radius-control`, `--b-color-hover`, `--b-case`…) follow its own theme. The colour mode (`data-mode`) stays on `<html>`.
