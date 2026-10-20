// 后台：转发快捷键、告诉页面当前快捷键、打开设置页。
chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'toggle-palette' || !tab || tab.id == null) return;
  // 不是 claude.ai 的页面没有内容脚本，发送会失败，忽略即可
  chrome.tabs.sendMessage(tab.id, { type: 'toggle-palette' }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return;
  if (message.type === 'get-shortcut') {
    chrome.commands.getAll().then((commands) => {
      const command = commands.find((c) => c.name === 'toggle-palette');
      sendResponse({ shortcut: command ? command.shortcut : '' });
    });
    return true;
  }
  if (message.type === 'open-options') chrome.runtime.openOptionsPage();
});
