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
  return text.toLowerCase().replaceAll(/[ ,.]/g, "-").replaceAll("--", "-");
}

async function exportJournal(journalEntries) {
  const journalFiles = [];

  for (let journal of journalEntries) {
    const { name, createdAt, originalName } = journal;
    const pageBlocks = await logseq.Editor.getPageBlocksTree(originalName);

    let content = collateContentFromBlock(pageBlocks);

    if (content.trim() == "*") {
      continue;
    }
    // don't output if journal is empty

    content = content.replaceAll(/\[\[([^\]]*)\]\]/gi, (match, p1) => {
      return `[${p1}](../entry/${slugify(p1)})`;
    });
    const output = `
---
title: ${originalName} 
date: ${new Date(createdAt).toISOString()}
slug: ${slugify(name)}
type: journal
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
      return `[${p1}](../../entry/${slugify(p1)})`;
    });
    // path < load the file.
    const output = `
---
title: ${originalName} 
date: ${new Date(createdAt).toISOString()}
type: entry
slug: ${slugify(name)}
---
${content}
`;

    pageFiles.push({
      fileName: `entry/${slugify(name)}.md`,
      originalName,
      name,
      content: output,
    });
  }

  return pageFiles;
}

async function writeFile(baseDirectory, file) {
  // NOTE: Path
  return await top.apis.doAction([
    "writeFile",
    "",
    `${baseDirectory}/${file.fileName}`,
    file.content,
  ]);
}

async function mkdir(baseDirectory, directory) {
  // NOTE: Path
  return await top.apis.doAction(["mkdir", `${baseDirectory}/${directory}`]);
}

async function exportToHugo() {
  console.log("exportToHugo");

  const outputDirectorys = await top.apis.doAction(["openDir", ""]);
  const { path } = outputDirectorys[0];

  try {
    await mkdir(path, "entry");
  } catch (er) {
    console.log(er);
  }

  const { journal, pages } = await partionPages();
  const journalMarkdown = await exportJournal(journal);
  const pagesMarkdown = await exportPages(pages);

  for (const file of journalMarkdown) {
    await writeFile(path, file);
  }

  for (const file of pagesMarkdown) {
    await writeFile(path, file);
  }

  logseq.UI.showMsg("Export complete")
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
