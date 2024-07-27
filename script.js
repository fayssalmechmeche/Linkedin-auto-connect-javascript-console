(async () => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Fonction pour vérifier la présence d'un élément et cliquer dessus
    // Function to check for the presence of an element and click on it
    function clickIfExists(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
        }
    }

    // Fonction pour gérer la modal d'avertissement sur la limite d'invitations
    // Function to handle the warning modal about the invitation limit
    async function handleLimitAlert() {
        // Sélecteur pour la modal de limite d'invitations
        // Selector for the invitation limit modal
        const limitAlertSelector = '.artdeco-modal.ip-fuse-limit-alert';
        // Sélecteur pour le titre de la modal
        // Selector for the modal title
        const limitReachedSelector = '.artdeco-modal__header h2';

        const limitAlert = document.querySelector(limitAlertSelector);
        if (limitAlert) {
            const headerText = limitAlert.querySelector(limitReachedSelector).innerText;

            // Vérifiez si le texte du titre indique que la limite a été atteinte
            // Check if the header text indicates that the limit has been reached
            if (headerText.includes("Vous avez atteint la limite d’invitations hebdomadaire")) {
                console.log('Limite atteinte, fin du script');
                // Indique que la limite a été atteinte
                // Indicates that the limit has been reached
                return true;
            }
        }
        // La limite n'a pas été atteinte
        // The limit has not been reached
        return false;
    }

    // Fonction pour gérer la modal générale (autre modal que limite d'invitations)
    // Function to handle the general modal (other than the invitation limit modal
    async function handleModal() {
        // Sélecteur pour la modal
        // Selector for the modal
        const modalSelector = '.artdeco-modal.ip-fuse-limit-alert';
        // Sélecteur pour le bouton OK
        // Selector for the OK button
        const okButtonSelector = '.artdeco-modal__actionbar .artdeco-button--primary';
        // Sélecteur pour le bouton "Tout voir"
        // Selector for the "See all" button
        const seeAllButtonSelector = '.artdeco-button--tertiary.ph2';

        // Vérifiez la présence de la modal et cliquez sur le bouton OK
        // Check for the presence of the modal and click on the OK button
        const modal = document.querySelector(modalSelector);
        if (modal) {
            clickIfExists(okButtonSelector);

            // Attendre que la modal se ferme
            // Wait for the modal to close

            // Ajustez le délai si nécessaire
            // Adjust the delay as needed
            await delay(1000);

            // Cliquer sur le bouton "Tout voir"
            // Click on the "See all" button
            clickIfExists(seeAllButtonSelector);
        }
    }

    const scrollAndWait = async () => {
        const previousHeight = document.body.scrollHeight;
        window.scrollTo(0, previousHeight);

        // Attendre que le nouveau contenu se charge
        // Wait for the new content to load
        let newHeight;
        do {
            // Attendre un moment pour laisser le contenu se charger
            // Wait for a moment to let the content load
            await delay(2000);
            newHeight = document.body.scrollHeight;
        } while (newHeight === previousHeight);

        // Temps d'attente supplémentaire pour s'assurer que tous les nouveaux éléments sont visibles
        // Additional wait time to ensure all new elements are
        await delay(3000);
    };

    // Compteur pour le nombre de connexions effectuées
    // Counter for the number of connections made
    let connectionsMade = 0;

    const processConnectButtons = async () => {
        // Sélectionnez le conteneur qui contient les éléments de la liste
        // Select the container that contains the list items
        const container = document.querySelector('.discover-fluid-entity-list');

        if (!container) {
            console.error('Container not found.');
            // Conteneur non trouvé
            // Container not found
            return false;
        }

        // Trouvez et cliquez sur tous les boutons "Se connecter" dans le conteneur
        // Find and click on all "Connect" buttons in the container 
        const connectButtons = container.querySelectorAll('button span.artdeco-button__text');
        const connectButtonsArray = Array.from(connectButtons).filter(button => button.innerText === 'Se connecter');

        if (connectButtonsArray.length === 0) {
            console.log('No more "Se connecter" buttons found.');
            // Aucun bouton à traiter
            // No buttons to process
            return false;
        }

        for (const button of connectButtonsArray) {
            const parentButton = button.closest('button');
            if (parentButton) {
                parentButton.click();
                connectionsMade++;
                // Incrémenter le compteur de connexions
                // Increment the connection counter
                console.log(`Connexion effectuée. Total des connexions : ${connectionsMade}`);
                // Attendre un peu entre les connexions
                // Wait a bit between connections
                await delay(2000);
            }
        }

        // Boutons traités avec succès
        // Buttons processed successfully
        return true;
    };

    while (true) {
        try {
            // Vérifiez si la modal indiquant que la limite est atteinte est affichée
            // Check if the modal indicating the limit is reached is displayed
            const limitReached = await handleLimitAlert();
            if (limitReached) {
                // Arrêter le script si la limite est atteinte
                // Stop the script if the limit is reached
                break;
            }

            // Gérer la modal générale avant de traiter les boutons
            // Handle the general modal before processing the buttons
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
})();
