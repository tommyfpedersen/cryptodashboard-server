function init() {

    /* load settings */
    let settings = JSON.parse(localStorage.getItem("settings"));
    let settingsObject = {
        cards: []
    }
    if (!settings) {
        localStorage.setItem("settings", JSON.stringify(settingsObject));
        settings = JSON.parse(localStorage.getItem("settings"));
    }
    console.log("settings parse", JSON.parse(localStorage.getItem("settings")))

    // add settings - hide cards
    if (settings) {
        settings.cards.forEach((card) => {
            if (card.visible === false) {
                let cardElm = document.querySelector("#" + card.cardId);
                cardElm.classList.add("hide");
            }
        })
    }

    /* verus */
    let getAddressBalanceElm = document.querySelector("#get-address-balance");
    getAddressBalanceElm.addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
            window.history.replaceState(null, null, '?address=' + encodeURIComponent(getAddressBalanceElm.value));
            location.reload();
        }
    })

    /** common */
    initCardHideButtons();
    initGraphBarHints();
    initGraphButtons();
    initResetLocalStorage();
}

function initCardHideButtons() {
    let getAllCardHideButtonElements = document.querySelectorAll(".hide-button");
    getAllCardHideButtonElements.forEach((buttonElm) => {

        buttonElm.addEventListener('click', (evt) => {

            //if exist
           // if()

            //else

            let card = {
                cardId: evt.target.parentElement.id,
                visible: false
            }

            let settings = JSON.parse(localStorage.getItem("settings"));


            settings.cards.push(card)
            localStorage.setItem("settings", JSON.stringify(settings));


            evt.target.parentElement.classList.add("hide");

        });

    })
}

function initGraphBarHints() {
    let getAllGraphBarElements = document.querySelectorAll(".graph-bar");
    let hintElm = document.querySelector("#hint");

    getAllGraphBarElements.forEach((elm) => {
        elm.addEventListener('mouseover', (evt) => {
            let xPos = evt.clientX;
            let yPos = evt.clientY - 50;
            let label = evt.target.getAttribute("data-label");
            let price = evt.target.getAttribute("data-price");
            hintElm.innerHTML = `$ ${price}</br> ${label} `;
            hintElm.style.left = xPos + "px";
            hintElm.style.top = yPos + "px";
            hintElm.classList.replace("hide", "show");
        });
        elm.addEventListener('mouseout', (evt) => {
            hintElm.classList.replace("show", "hide");
            hintElm.innerHTML = "";
        });
    })
}

function initGraphButtons() {
    let getAllGraphContainerElements = document.querySelectorAll(".graph-container");
    getAllGraphContainerElements.forEach((graphContainerElm) => {
        let getAllGraphGroupElements = graphContainerElm.querySelectorAll(".graph-group");
        let getAllGraphButtonsElements = graphContainerElm.querySelectorAll(".graph-button");
        getAllGraphButtonsElements.forEach((buttonElm, buttonIndex) => {
            buttonElm.addEventListener('click', (evt) => {

                getAllGraphButtonsElements.forEach((element) => {
                    element.classList.remove("button-selected");
                    element.classList.add("button-deselected");
                })
                getAllGraphGroupElements.forEach((element, groupIndex) => {
                    if (groupIndex === buttonIndex) {
                        element.classList.add("show");
                        element.classList.remove("hide");
                    } else {
                        element.classList.remove("show");
                        element.classList.add("hide");
                    }
                })
                evt.target.classList.replace("button-deselected", "button-selected");
            })
        })
    })
}

function initResetLocalStorage() {
    let getResetCardsElement = document.querySelector("#reset-cards");
    getResetCardsElement.addEventListener('click', (evt) => {
        console.log("clear")
        localStorage.clear();
        location.reload();
    })
}
