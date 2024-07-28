document.getElementById('run-script').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'start' });
});

document.getElementById('stop-script').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        document.getElementById('status-value').textContent = request.status;
    }
});

chrome.storage.local.get('status', data => {
    if (data.status) {
        document.getElementById('status-value').textContent = data.status;
    } else {
        document.getElementById('status-value').textContent = 'Inactif';
    }
});
