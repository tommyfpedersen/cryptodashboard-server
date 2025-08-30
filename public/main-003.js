const SVGpower = ` <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
<path
    d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
</svg>`;

function init() {

    console.log("init")

    /* load settings */
    let settings = JSON.parse(localStorage.getItem("settings"));
    let settingsObject = {
        darkmode: false,
        disclaimer: true
    }
    if (!settings) {
        localStorage.setItem("settings", JSON.stringify(settingsObject));
        settings = JSON.parse(localStorage.getItem("settings"));
    }

    // add settings 
    if (settings) {

        //  disclaimer
        let disclaimerElm = document.querySelector("#disclaimer");
        if (settings.disclaimer === true) {
            disclaimerElm.style.display = "flex";
        }
        else {
            disclaimerElm.style.display = "none";
        }

        // darkmode
        if (settings.darkmode === true) {
            enterDarkmode();
        }

    }

    /* verus */
    let getAddressBalanceElm = document.querySelector("#get-address-balance");
    if (getAddressBalanceElm) {
        getAddressBalanceElm.addEventListener('keydown', (evt) => {
            console.log("value", getAddressBalanceElm.value)
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(getAddressBalanceElm.value)
                var href = new URL(location.href);
                href.searchParams.set('address', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let vrscStakingElm = document.querySelector("#vrsc-staking-amount");
    if (vrscStakingElm) {
        vrscStakingElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(vrscStakingElm.value)
                var href = new URL(location.href);
                href.searchParams.set('vrscstakingamount', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let vrscMiningElm = document.querySelector("#vrsc-mining-hash");
    if (vrscMiningElm) {
        vrscMiningElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(vrscMiningElm.value)
                var href = new URL(location.href);
                href.searchParams.set('vrscmininghash', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    /* verus chips */
    let getChipsAddressBalanceElm = document.querySelector("#get-chips-address-balance");
    if (getChipsAddressBalanceElm) {
        getChipsAddressBalanceElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(getChipsAddressBalanceElm.value)
                var href = new URL(location.href);
                href.searchParams.set('chipsaddress', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let chipsStakingElm = document.querySelector("#chips-staking-amount");
    if (chipsStakingElm) {
        chipsStakingElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(chipsStakingElm.value)
                var href = new URL(location.href);
                href.searchParams.set('chipsstakingamount', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let chipsMiningElm = document.querySelector("#chips-mining-hash");
    if (chipsMiningElm) {
        chipsMiningElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(chipsMiningElm.value)
                var href = new URL(location.href);
                href.searchParams.set('chipsmininghash', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    /* verus varrr */
    let getVarrrAddressBalanceElm = document.querySelector("#get-varrr-address-balance");
    if (getVarrrAddressBalanceElm) {
        getVarrrAddressBalanceElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(getVarrrAddressBalanceElm.value)
                var href = new URL(location.href);
                href.searchParams.set('varrraddress', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let varrrStakingElm = document.querySelector("#varrr-staking-amount");
    if (varrrStakingElm) {
        varrrStakingElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(varrrStakingElm.value)
                var href = new URL(location.href);
                href.searchParams.set('varrrstakingamount', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let varrrMiningElm = document.querySelector("#varrr-mining-hash");
    if (varrrMiningElm) {
        varrrMiningElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(varrrMiningElm.value)
                var href = new URL(location.href);
                href.searchParams.set('varrrmininghash', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    /* verus vdex */
    let getVdexAddressBalanceElm = document.querySelector("#get-vdex-address-balance");
    if (getVdexAddressBalanceElm) {
        getVdexAddressBalanceElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(getVdexAddressBalanceElm.value)
                var href = new URL(location.href);
                href.searchParams.set('vdexaddress', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let vdexStakingElm = document.querySelector("#vdex-staking-amount");
    if (vdexStakingElm) {
        vdexStakingElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(vdexStakingElm.value)
                var href = new URL(location.href);
                href.searchParams.set('vdexstakingamount', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    let vdexMiningElm = document.querySelector("#vdex-mining-hash");
    if (vdexMiningElm) {
        vdexMiningElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(vdexMiningElm.value)
                var href = new URL(location.href);
                href.searchParams.set('vdexmininghash', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    /* threefold */
    let getThreeFoldNodesElm = document.querySelector("#get-threefold-nodes");
    if (getThreeFoldNodesElm) {
        getThreeFoldNodesElm.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
                let string = encodeURIComponent(getThreeFoldNodesElm.value)
                var href = new URL(location.href);
                href.searchParams.set('tfnodes', string);
                window.history.replaceState(null, null, href.toString());
                location.reload();
            }
        })
    }

    /** common */
    initDisclaimerButton()
    // initCardHideButtons();
    // initGraphButtons();
    initResetLocalStorage();
    //  initSideMenu();
    // initGraphBarHints();

    initDarkmodeButton();
}


function initDisclaimerButton() {
    let disclaimerButtonElement = document.querySelector("#disclaimer-button");

    disclaimerButtonElement.addEventListener('click', (evt) => {

        let settings = JSON.parse(localStorage.getItem("settings"));
        settings.disclaimer = false;

        let disclaimerElm = document.querySelector("#disclaimer");
        disclaimerElm.style.display = "none";
        localStorage.setItem("settings", JSON.stringify(settings));
    })
}
function initDarkmodeButton() {
    let darkmodeButtonElement = document.querySelector("#dark-mode");
    darkmodeButtonElement.addEventListener('click', (evt) => {
        let settings = JSON.parse(localStorage.getItem("settings"));

        if (settings.darkmode === true) {
            enterLightmode();
        } else {
            enterDarkmode();
        }

        settings.darkmode = !settings.darkmode;
        localStorage.setItem("settings", JSON.stringify(settings));
    })
}
function enterDarkmode() {
    let backgroundColor = "#444";
    let darkerBaggrundColor = "#111";
    let color = "rgb(246, 246, 246)";

    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = color;

    document.querySelector("#cache-updated").style.color = backgroundColor;

    // disclaimer
    console.log("her",document.querySelector("#disclaimer"))
    //document.querySelector("#disclaimer").style.color = backgroundColor;
    document.querySelector("#disclaimer").style.backgroundColor = darkerBaggrundColor;


    let cards = document.querySelectorAll(".card, .currency-card");
    cards.forEach((card) => {
        card.style.backgroundColor = darkerBaggrundColor;
    })

    // let graphButtons = document.querySelectorAll('.button-deselected');
    // graphButtons.forEach((label) => {
    //     label.style.color = color;
    // })

    let aElements = document.querySelectorAll('a');
    aElements.forEach((a) => {
        a.style.color = color;
    })

    document.querySelector(".light-mode-icon").classList.replace("light-mode-icon", "dark-mode-icon")

}
function enterLightmode() {
    console.log("lightmode");

    let backgroundColor = "rgb(246, 246, 246)";
    let darkerBaggrundColor = "#fff";
    let color = "#444";

    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = color;
    // document.querySelector(".side-menu").style.backgroundColor = darkerBaggrundColor;
    // document.querySelector(".side-menu").style.color = color;

    document.querySelector("#cache-updated").style.color = color;

    let cards = document.querySelectorAll(".card, .currency-card");
    cards.forEach((card) => {
        card.style.backgroundColor = darkerBaggrundColor;
    })

    // let graphButtons = document.querySelectorAll('.button-deselected');
    // graphButtons.forEach((label) => {
    //     label.style.color = color;
    // })

    let aElements = document.querySelectorAll('a');
    aElements.forEach((a) => {
        a.style.color = color;
    })

    document.querySelector(".dark-mode-icon").classList.replace("dark-mode-icon", "light-mode-icon")

}

function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
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
            let volume = evt.target.getAttribute("data-volume");
            hintElm.innerHTML = `${volume}</br> ${label} `;
            hintElm.style.left = xPos + "px";
            hintElm.style.top = yPos + "px";
            // hintElm.style.zindex = 20000; 
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

// function initSideMenu() {

//     // build from project labels and cards
//     let sectionElement = document.querySelectorAll(".section");
//     let sideMenuElement = document.querySelector(".side-menu");

//     // burger menu
//     let sideMenuIcon = document.querySelector(".side-menu-icon");
//     sideMenuIcon.addEventListener("click", (evt) => {

//         if (sideMenuElement.classList.contains("side-menu")) {
//             sideMenuElement.classList.replace("side-menu", "side-menu-open");
//         } else {
//             sideMenuElement.classList.replace("side-menu-open", "side-menu");
//         }
//     })

//     sectionElement.forEach((section) => {
//         let children = [...section.children];

//         let sideMenuGroupELm = document.createElement("div");
//         let sideMenuTitleElm = document.createElement("div");
//         let sideMenuItemArray = [];
//         let counter = 0;

//         children.forEach((elm, index) => {//&& sideMenuGroupFilling === false
//             if (elm.classList.contains("project")) {

//                 // attach
//                 if (counter > 0) {
//                     sideMenuGroupELm.append(sideMenuTitleElm);
//                     sideMenuElement.append(sideMenuGroupELm);

//                     sideMenuItemArray.forEach((menuItem) => {
//                         sideMenuGroupELm.append(menuItem)
//                     })

//                     // reset
//                     sideMenuItemArray.length = [];
//                     counter = 0;
//                 }

//                 // create
//                 sideMenuGroupELm = document.createElement("div");
//                 sideMenuGroupELm.classList.add("side-menu-group");
//                 sideMenuTitleElm = document.createElement("div");
//                 sideMenuTitleElm.classList.add("side-menu-title");

//                 // img, text or svg
//                 if (elm.getAttribute("data-image") !== null) {
//                     let imageElm = document.createElement("img");
//                     imageElm.src = elm.getAttribute("data-image");
//                     imageElm.width = "16";
//                     sideMenuTitleElm.append(imageElm);
//                 } else if (elm.getAttribute("data-text") !== null) {
//                     let textElm = document.createElement("span");
//                     textElm.innerHTML = elm.getAttribute("data-text");
//                     sideMenuTitleElm.append(textElm);
//                 } else {
//                     let svgElm = elm.querySelector("svg");
//                     sideMenuTitleElm.append(svgElm);
//                 }

//                 counter = counter + 1;
//             }

//             if (elm.classList.contains("card")) {
//                 // get data from card
//                 let title = elm.querySelector(".card-title").innerHTML;
//                 let id = elm.id;

//                 let sideMenuItem = document.createElement("div");
//                 sideMenuItem.id = "menu-" + id;
//                 sideMenuItem.classList.add("side-menu-item");

//                 let sideMenuItemIcon = document.createElement("div");
//                 sideMenuItemIcon.classList.add("side-menu-item-icon");
//                 sideMenuItemIcon.innerHTML = SVGpower;

//                 sideMenuItem.addEventListener("click", (evt) => {

//                     // card
//                     let cardId = sideMenuItem.id.replace("menu-", "");
//                     let cardElm = document.querySelector("#" + cardId);
//                     let settings = JSON.parse(localStorage.getItem("settings"));
//                     let cardsArray = settings.cards;
//                     let currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);

//                     // create and add card in card settings array if not exist
//                     if (currentCardIndex === -1) {
//                         let newCard = {
//                             cardId: cardId,
//                             visible: false
//                         }
//                         cardsArray.push(newCard);
//                         currentCardIndex = cardsArray.findIndex(item => item.cardId === cardId);
//                     }

//                     // on off
//                     if (sideMenuItemIcon.classList.contains("side-menu-item-selected")) {
//                         // remove
//                         sideMenuItemIcon.classList.remove("side-menu-item-selected");
//                         cardElm.classList.add("hide");
//                         cardsArray[currentCardIndex].visible = false;

//                     } else {
//                         // add
//                         sideMenuItemIcon.classList.add("side-menu-item-selected");
//                         cardElm.classList.remove("hide");
//                         cardsArray[currentCardIndex].visible = true;
//                     }
//                     // update local storage
//                     localStorage.setItem("settings", JSON.stringify(settings));

//                 })
//                 // sync with local storage
//                 if (!elm.classList.contains("hide")) {
//                     sideMenuItemIcon.classList.add("side-menu-item-selected");
//                 }
//                 let sideMenuItemTitle = document.createElement("div");
//                 sideMenuItemTitle.classList.add("side-menu-item-title");
//                 sideMenuItemTitle.innerHTML = title;


//                 sideMenuItem.append(sideMenuItemTitle);
//                 sideMenuItem.append(sideMenuItemIcon);
//                 sideMenuItemArray.push(sideMenuItem);
//             }

//             if (children.length - 1 === index) {
//                 sideMenuGroupELm.append(sideMenuTitleElm);
//                 sideMenuElement.append(sideMenuGroupELm);

//                 sideMenuItemArray.forEach((menuItem) => {
//                     sideMenuGroupELm.append(menuItem)
//                 })

//                 // reset
//                 sideMenuItemArray.length = [];
//                 counter = 0;
//             }
//         })
//     })
// }
