document.getElementById('run-script').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    });
    chrome.tabs.sendMessage(tab.id, { action: 'start' });
});

document.getElementById('stop-script').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'stop' });
    updateStatus('Inactif');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        updateStatus(request.status);
    }
});

function updateStatus(status) {
    document.getElementById('status-value').textContent = status;
}
