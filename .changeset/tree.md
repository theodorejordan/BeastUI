---
'@beastui/css': patch
'@beastui/preact': patch
---

The tree: nested items that fold (disclosure navigation). `.b-tree` rows with a toggle, a name and a count in the CSS; a data-driven `Tree` in Preact that keeps the open branches, or lets the app keep them. A parent is an item (chosen on click) or a group (`group: true`: the whole row folds it). The parents of the chosen item keep the hover tint (`data-trail`).
