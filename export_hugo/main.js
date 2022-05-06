import "@logseq/libs";
import JSZip, { file } from "jszip";
import { saveAs } from "file-saver";

async function partionPages() {
  const allPages = await logseq.Editor.getAllPages();
  const journal = [];
  const pages = [];

  for (const entry of allPages) {
    if (entry["journal?"] === true) {
      journal.push(entry);
    } else {
      pages.push(entry);
    }
  }

  return { journal, pages };
}

function collateContentFromBlock(blocks, depth = 0) {
  let content = "";
  for (let block of blocks) {
    content += `${" ".repeat(depth * 2)}* ${block.content}\n`;
    // Fetch the children
    content += collateContentFromBlock(block.children, depth + 1);
  }
  return content;
}

function slugify(text) {
  return text.toLowerCase().replaceAll(/[ ,.]/g, "-");
}

async function exportJournal(journalEntries) {
  const journalFiles = [];

  for (let journal of journalEntries) {
    const { name, createdAt, originalName } = journal;
    const pageBlocks = await logseq.Editor.getPageBlocksTree(originalName);

    let content = collateContentFromBlock(pageBlocks);
    content = content.replaceAll(/\[\[([^\]]*)\]\]/gi, (match, p1) => {
      console.log(match, p1);
      return `[${p1}](page/${slugify(p1)})`;
    });
    const output = `
---
title: ${name} 
date: ${new Date(createdAt).toISOString()}
slug: ${slugify(name)}
---
${content}
`;

    journalFiles.push({
      fileName: `${slugify(name)}.md`,
      content: output,
      originalName,
      name,
    });
  }

  return journalFiles;
}

async function exportPages(pageEntries) {
  const pageFiles = [];

  for (let page of pageEntries) {
    const { name, createdAt, originalName } = page;
    const pageBlocks = await logseq.Editor.getPageBlocksTree(originalName);
    let content = collateContentFromBlock(pageBlocks);
    content = content.replaceAll(/\[\[([^\]]*)\]\]/gi, (match, p1) => {
      console.log(match, p1);
      return `[${p1}](page/${slugify(p1)})`;
    });
    // path < load the file.
    const output = `
---
title: ${name} 
date: ${new Date(createdAt).toISOString()}
slug: post/${slugify(name)}
---
${content}
`;

    pageFiles.push({
      fileName: `post/${slugify(name)}.md`,
      originalName,
      name,
      content: output,
    });
  }

  return pageFiles;
}

async function exportToHugo() {
  console.log("exportToHugo");

  const { journal, pages } = await partionPages();
  const journalMarkdown = await exportJournal(journal);
  const pagesMarkdown = await exportPages(pages);

  const zip = new JSZip();

  journalMarkdown.forEach((file) => zip.file(file.fileName, file.content));
  pagesMarkdown.forEach((file) => zip.file(file.fileName, file.content));

  zip.generateAsync({ type: "blob" }).then(function (content) {
    console.log(content)
    saveAs(content, "publicExport.zip")
  });

  //Once we have the pages, we need to go through them and fix cross referening

  console.log(journalMarkdown);
  console.log(pagesMarkdown);
  // convert all the entries to actual files.
}

function main() {
  logseq.provideModel({
    exportToHugo,
  });

  logseq.App.registerUIItem("toolbar", {
    key: "hugo-export-all",
    template: `
      <a class="button" data-on-click="exportToHugo" data-rect>
        <i class="ti ti-file-zip"></i>
      </a>
    `,
  });
}

// bootstrap
logseq.ready(main).catch(console.error);
