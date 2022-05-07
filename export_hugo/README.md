Export the journal into a Hugo format.
===

Why?
---

The [schrodinger](https://github.com/sawhney17/logseq-schrodinger) plugin looks great, but it doesn't work for my needs. I would like to have the journal exported like a blog, and then the pages created as subpages or entries. To some extent I need a JavaScript-less version of logseq.

This project has taken a good bunch of code from https://github.com/sawhney17/logseq-schrodinger so please go and check that out.

Development Thoughts
---

We want to output:

* A markdown file in the root for every journal entry.
* A markdown file in '/page/' for every "Page".

Output it all as a zip file so that it can be dropped into the Hugo CMS.

Sample
---

* [My blog](https://paul.kinlan.me/journal/)
