let stopScript = false;
let connectionsMade = 0;
const CHECK_LIMIT_INTERVAL = 1000; // Intervalle en millisecondes pour vérifier la limite (5 secondes ici)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        stopScript = false;
        connectionsMade = 0;
        updateStatus(`En cours - Connexions : ${connectionsMade}`);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: runScript
            });
        });
    } else if (request.action === 'stop') {
        stopScript = true;
        updateStatus('Inactif');
    }
    sendResponse({ status: "received" });
});

function updateStatus(status) {
    chrome.storage.local.set({ status: status }, () => {
        chrome.runtime.sendMessage({ action: 'updateStatus', status: status });
    });
}

async function runScript() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    function clickIfExists(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
        }
    }

    async function handleLimitAlert() {
        const limitAlertSelector = '.artdeco-modal.ip-fuse-limit-alert';
        const limitReachedSelector = '.artdeco-modal__header h2';

        const limitAlert = document.querySelector(limitAlertSelector);
        if (limitAlert) {
            const headerText = limitAlert.querySelector(limitReachedSelector).innerText;
            if (headerText.includes("Vous avez atteint la limite d’invitations hebdomadaire")) {
                console.log('Limite atteinte, fin du script');
                updateStatus('Limite atteinte');
                return true;
            }
        }
        return false;
    }

    async function handleModal() {
        const modalSelector = '.artdeco-modal.ip-fuse-limit-alert';
        const okButtonSelector = '.artdeco-modal__actionbar .artdeco-button--primary';
        const seeAllButtonSelector = '.artdeco-button--tertiary.ph2';

        const modal = document.querySelector(modalSelector);
        if (modal) {
            clickIfExists(okButtonSelector);
            await delay(1000);
            clickIfExists(seeAllButtonSelector);
        }
    }

    const scrollAndWait = async () => {
        const previousHeight = document.body.scrollHeight;
        window.scrollTo(0, previousHeight);
        let newHeight;
        do {
            await delay(2000);
            newHeight = document.body.scrollHeight;
        } while (newHeight === previousHeight);
        await delay(3000);
    };

    const processConnectButtons = async () => {
        const container = document.querySelector('.discover-fluid-entity-list');
        if (!container) {
            console.error('Container not found.');
            return false;
        }

        const connectButtons = container.querySelectorAll('button span.artdeco-button__text');
        const connectButtonsArray = Array.from(connectButtons).filter(button => button.innerText === 'Se connecter');

        if (connectButtonsArray.length === 0) {
            console.log('No more "Se connecter" buttons found.');
            return false;
        }

        for (const button of connectButtonsArray) {
            if (stopScript) {
                console.log('Script arrêté par l\'utilisateur');
                updateStatus('Inactif');
                return false;
            }

            const parentButton = button.closest('button');
            if (parentButton) {
                parentButton.click();
                connectionsMade++;
                console.log(`Connexion effectuée. Total des connexions : ${connectionsMade}`);
                updateStatus(`En cours - Connexions : ${connectionsMade}`);
                await delay(2000);
            }
        }

        return true;
    };

    while (true) {
        if (stopScript) {
            console.log('Script arrêté par l\'utilisateur');
            updateStatus('Inactif');
            break;
        }

        try {
            const limitReached = await handleLimitAlert();
            if (limitReached) {
                break;
            }

            await handleModal();

            let buttonsProcessed = await processConnectButtons();

            if (!buttonsProcessed) {
                await scrollAndWait();
            }
        } catch (e) {
            console.error('An error occurred:', e);
            break;
        }
    }
}
