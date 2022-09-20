import "@logseq/libs";

function main() {
  logseq.App.showMsg(`Hello`);

  logseq.Editor.registerSlashCommand('Fart', ()=>console.log('test'))

  logseq.Editor.registerBlockContextMenuItem('🦜 Send A Tweet',
    ({ blockId }) => {
      logseq.App.showMsg(
        '🦜 Tweet from block content #' + blockId,
      )
    });
}

// bootstrap
logseq.ready(main).catch(console.error);
