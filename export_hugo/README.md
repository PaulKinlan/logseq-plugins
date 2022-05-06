Export the journal into a Hugo format.
===

Why?
---

The schrodinger plugin looks great, but it doesn't work for my needs. I would like to have the journal exported like a blog, and then the pages created as subpages... To some extent I need a JavaScript-less version of logseq.

```
(await logseq.Editor.getAllPages()).filter(page=>page['journal?']==true)
```

We want to output:

* A markdown file in the root for every journal entry.
* A markdown file in '/page/' for every "Page".

Output it all as a zip file

