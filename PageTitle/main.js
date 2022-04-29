import "@logseq/libs";
import getUrls from 'get-urls';

function main() {
  logseq.Editor.registerSlashCommand("Title", async () => {
    const text = await logseq.Editor.getEditingBlockContent();
    const currentBlock = await logseq.Editor.getCurrentBlock();
    const urls = getUrls(text);

    if(urls.size >= 1) {
      // Just get the first URL
      const url = urls.keys().next().value;
      const response = await fetch(url);
      const responseText = await response.text();
      const matches = responseText.match(/<title>([^<]*)<\/title>/);
      if (matches.length > 1) {
        const title = matches[1];
        const newBlockText = text.replace(url, `[${title}](${url})`);
        logseq.Editor.updateBlock(currentBlock.uuid, newBlockText);
      }

    }
  });
}

// bootstrap
logseq.ready(main).catch(console.error);
