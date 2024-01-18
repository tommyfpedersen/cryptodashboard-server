const  SVGpower = ` <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
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

    console.log( settings.cards)
}

function initCardHideButtons() {
    let getAllCardHideButtonElements = document.querySelectorAll(".hide-button");
    getAllCardHideButtonElements.forEach((buttonElm) => {

        buttonElm.addEventListener('click', (evt) => {

            //if exist
            // if()

            //else
            let parentElement = evt.target.parentElement;

            console.log("parent", parentElement)

            let card = {
                cardId: parentElement.id,
                visible: false
            }

            let settings = JSON.parse(localStorage.getItem("settings"));


            settings.cards.push(card)
            localStorage.setItem("settings", JSON.stringify(settings));


            parentElement.classList.add("hide");

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

                    sideMenuItemArray.forEach((menuItem)=>{
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
                } else{
                    let svgElm = elm.querySelector("svg");
                    sideMenuTitleElm.append(svgElm);
                }

                counter = counter + 1;
            }

            if (elm.classList.contains("card")) {
                // get data from card
                let title= elm.querySelector(".card-title").innerHTML;
                let id = elm.id;

               

                let sideMenuItem = document.createElement("div");
                sideMenuItem.id="menu-"+id;
                sideMenuItem.classList.add("side-menu-item");

                let sideMenuItemIcon = document.createElement("div");
                sideMenuItemIcon.classList.add("side-menu-item-icon");
                sideMenuItemIcon.innerHTML = SVGpower;
                


                sideMenuItem.addEventListener("click", (evt)=>{
                    // menu
                    if(sideMenuItemIcon.classList.contains("side-menu-item-selected")){
                        sideMenuItemIcon.classList.remove("side-menu-item-selected");
                    }else{
                        sideMenuItemIcon.classList.add("side-menu-item-selected");
                    }
                    // card
                    let cardId = sideMenuItem.id.replace("menu-","");
                    console.log("id", sideMenuItem.id)   
                    console.log("cardId",cardId)   

                    let settings = JSON.parse(localStorage.getItem("settings"));
                    
                    settings.cards[0].visible = true;
                    localStorage.setItem("settings", JSON.stringify(settings));
                    let card = document.querySelector("#"+cardId);
                    card.classList.remove("hide");
                    console.log("card", card);


                })
                // sync with local storage
                if(!elm.classList.contains("hide")){
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

                sideMenuItemArray.forEach((menuItem)=>{
                    sideMenuGroupELm.append(menuItem)
                })

                // reset
                sideMenuItemArray.length = [];
                counter = 0;
            }

        })




    })

    /*
    <div class="side-menu-group">
              <div class="side-menu-title">
                  <svg fill="#3165d4" width="55" height="16" viewBox="0 0 4950 1417" xmlns="http://www.w3.org/2000/svg"
                      fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2">
                      <path
                          d="m2176.14 1090.94 294.314-765.215h-123.612L2112.863 959.97l-235.451-634.245h-125.083l295.785 765.215h128.026zm328.41-379.804c0 224.239 152.762 379.805 374.198 379.805 165.376 0 260.677-89.696 301.321-158.369l-72.878-53.257c-35.037 49.053-103.71 113.521-227.042 113.521-151.361 0-260.677-98.104-262.079-260.677h584.422c1.402-14.015 1.402-29.432 1.402-33.636 0-218.633-131.74-372.797-346.168-372.797-193.406 0-353.176 152.763-353.176 385.41zm119.126-61.665c8.409-137.347 114.923-228.443 234.05-228.443 120.528 0 225.64 77.082 232.647 228.443h-466.697zM3647.73 304.893c-116.507 0-202.043 70.788-228.588 147.476V324.065H3304.11v766.876h116.506V723.725c0-163.699 51.617-302.326 227.114-302.326V304.893zm377.4 806.157c104.848 0 191.975-60.546 227.416-129.952v110.754h116.662V323.954h-118.139V790.6c0 126.998-81.22 214.125-199.358 214.125-103.371 0-181.637-73.836-181.637-196.404V323.954h-116.662V803.89c0 174.254 93.034 307.16 271.718 307.16zm422.77-175.997c32.235 68.673 100.908 155.566 253.67 155.566 141.551 0 248.064-86.893 248.064-215.83 0-253.67-367.19-192.005-367.19-355.979 0-63.067 53.256-100.908 120.528-100.908 93.9 0 131.74 54.659 151.361 93.9l81.287-46.249c-19.621-54.658-89.696-140.149-225.641-140.149-131.74 0-234.049 74.279-234.049 197.61 0 246.663 365.79 189.202 365.79 357.381 0 74.279-61.666 116.324-134.544 116.324-99.505 0-151.361-54.659-182.194-112.12l-77.082 50.454z"
                          fill-rule="nonzero"></path>
                      <path
                          d="M706.112 2.583c389.515 0 705.751 316.236 705.751 705.75 0 389.515-316.236 705.751-705.751 705.751-389.514 0-705.75-316.236-705.75-705.751 0-389.514 316.236-705.75 705.75-705.75zM360.104 257.87c26.652-22.821 64.047-41.568 96.557-28.367 58.458 23.737 215.52 340.387 215.52 340.387S891.874 257.773 970.78 229.312c26.919-9.71 63.823 7.368 91.97 28.411 98.786 73.854 108.992 176.891 100.453 205.476-10.736 35.937-556.441 728.342-556.442 728.342-16.319-6.656-339.656-606.781-357.178-709.466-16.745-98.131 40.226-164.807 110.521-224.205z">
                      </path>
                  </svg>
              </div>
              <div class="side-menu-item" id="menu-prices-card">
                  <div class="side-menu-item-title">Prices</div>
                  <div class="side-menu-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
                          <path
                              d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
                      </svg>
                  </div>
              </div>
              <div class="side-menu-item" id="menu-verus-get-address-balance-card">
                  <div class="side-menu-item-title">Get Verus Address Balance</div>
                  <div class="side-menu-item-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
                          <path
                              d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z" />
                      </svg>
                  </div>
              </div>
          </div>
  */



}
