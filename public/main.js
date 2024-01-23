const SVGpower = ` <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
<path
    d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
</svg>`;

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
    if (getAddressBalanceElm) {
        getAddressBalanceElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                window.history.replaceState(null, null, '?address=' + encodeURIComponent(getAddressBalanceElm.value));
                location.reload();
            }
        })
    }


    /** common */
    initCardHideButtons();
    initGraphBarHints();
    initGraphButtons();
    initResetLocalStorage();
    initSideMenu();
}

function initCardHideButtons() {
    let getAllCardHideButtonElements = document.querySelectorAll(".hide-button");
    getAllCardHideButtonElements.forEach((buttonElm) => {

        buttonElm.addEventListener('click', (evt) => {

            let parentElement = evt.target.parentElement;
            let cardId = parentElement.id;

            let settingsObj = JSON.parse(localStorage.getItem("settings"));
            let cardsArray = settingsObj.cards;
            let currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);

            // create and add card in card settings array if not exist
            if (currentCardIndex === -1) {
                let newCard = {
                    cardId: cardId,
                    visible: false
                }
                cardsArray.push(newCard);
                currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);
            }

            // turn off card and menu item
            cardsArray[currentCardIndex].visible = false;
            parentElement.classList.add("hide");
            let menuItemElm = document.querySelector("#menu-" + cardId);
            let menuItemIconElm = menuItemElm.querySelector(".side-menu-item-icon");
            console.log("menuItemElm", menuItemIconElm)
            menuItemIconElm.classList.remove("side-menu-item-selected");

            // update local storage
            localStorage.setItem("settings", JSON.stringify(settingsObj));
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

function initSideMenu() {

    // build from project labels and cards
    let sectionElement = document.querySelectorAll(".section");
    let sideMenuElement = document.querySelector(".side-menu");

     // burger menu
     let sideMenuIcon = document.querySelector(".side-menu-icon");
     sideMenuIcon.addEventListener("click", (evt)=>{
        
        if(sideMenuElement.classList.contains("side-menu")){
            sideMenuElement.classList.replace("side-menu","side-menu-open");
        }else{
            sideMenuElement.classList.replace("side-menu-open","side-menu");
        }
     })

    sectionElement.forEach((section) => {
        let children = [...section.children];

        let sideMenuGroupELm = document.createElement("div");
        let sideMenuTitleElm = document.createElement("div");
        let sideMenuItemArray = [];
        let counter = 0;

        children.forEach((elm, index) => {//&& sideMenuGroupFilling === false
            if (elm.classList.contains("project")) {

                // attach
                if (counter > 0) {
                    sideMenuGroupELm.append(sideMenuTitleElm);
                    sideMenuElement.append(sideMenuGroupELm);

                    sideMenuItemArray.forEach((menuItem) => {
                        sideMenuGroupELm.append(menuItem)
                    })

                    // reset
                    sideMenuItemArray.length = [];
                    counter = 0;
                }

                // create
                sideMenuGroupELm = document.createElement("div");
                sideMenuGroupELm.classList.add("side-menu-group");
                sideMenuTitleElm = document.createElement("div");
                sideMenuTitleElm.classList.add("side-menu-title");

                // img or svg
                if (elm.getAttribute("data-image") !== null) {
                    let imageElm = document.createElement("img");
                    imageElm.src = elm.getAttribute("data-image");
                    imageElm.width = "16";
                    sideMenuTitleElm.append(imageElm);
                } else {
                    let svgElm = elm.querySelector("svg");
                    sideMenuTitleElm.append(svgElm);
                }

                counter = counter + 1;
            }

            if (elm.classList.contains("card")) {
                // get data from card
                let title = elm.querySelector(".card-title").innerHTML;
                let id = elm.id;

                let sideMenuItem = document.createElement("div");
                sideMenuItem.id = "menu-" + id;
                sideMenuItem.classList.add("side-menu-item");

                let sideMenuItemIcon = document.createElement("div");
                sideMenuItemIcon.classList.add("side-menu-item-icon");
                sideMenuItemIcon.innerHTML = SVGpower;

                sideMenuItem.addEventListener("click", (evt) => {

                    // card
                    let cardId = sideMenuItem.id.replace("menu-", "");
                    let cardElm = document.querySelector("#" + cardId);
                    let settings = JSON.parse(localStorage.getItem("settings"));
                    let cardsArray = settings.cards;
                    let currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);

                    // create and add card in card settings array if not exist
                    if (currentCardIndex === -1) {
                        let newCard = {
                            cardId: cardId,
                            visible: false
                        }
                        cardsArray.push(newCard);
                        currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);
                    }

                    // on off
                    if (sideMenuItemIcon.classList.contains("side-menu-item-selected")) {
                        // remove
                        sideMenuItemIcon.classList.remove("side-menu-item-selected");
                        cardElm.classList.add("hide");
                        cardsArray[currentCardIndex].visible = false;

                    } else {
                        // add
                        sideMenuItemIcon.classList.add("side-menu-item-selected");
                        cardElm.classList.remove("hide");
                        cardsArray[currentCardIndex].visible = true;
                    }
                    // update local storage
                    localStorage.setItem("settings", JSON.stringify(settings));

                })
                // sync with local storage
                if (!elm.classList.contains("hide")) {
                    sideMenuItemIcon.classList.add("side-menu-item-selected");
                }
                let sideMenuItemTitle = document.createElement("div");
                sideMenuItemTitle.classList.add("side-menu-item-title");
                sideMenuItemTitle.innerHTML = title;


                sideMenuItem.append(sideMenuItemTitle);
                sideMenuItem.append(sideMenuItemIcon);
                sideMenuItemArray.push(sideMenuItem);
            }

            if (children.length - 1 === index) {
                sideMenuGroupELm.append(sideMenuTitleElm);
                sideMenuElement.append(sideMenuGroupELm);

                sideMenuItemArray.forEach((menuItem) => {
                    sideMenuGroupELm.append(menuItem)
                })

                // reset
                sideMenuItemArray.length = [];
                counter = 0;
            }
        })
    })
}
