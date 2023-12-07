function init(){

    /* verus */
    let getAddressBalanceElm = document.querySelector("#get-address-balance");
    getAddressBalanceElm.addEventListener('keydown',(evt)=>{
        if (evt.key === 'Enter') {
            window.history.replaceState(null, null, '?address='+encodeURIComponent(getAddressBalanceElm.value) );
            location.reload();
          }
    })

    /** common */
    initGraphBarHints();
    initGraphButtons();
}

function initGraphBarHints(){
  let getAllGraphBarElements = document.querySelectorAll(".graph-bar");
  let hintElm = document.querySelector("#hint");

  getAllGraphBarElements.forEach((elm)=>{
      elm.addEventListener('mouseover',(evt)=>{
          let xPos = evt.clientX;
          let yPos = evt.clientY - 50;
          let label = evt.target.getAttribute("data-label");
          let price = evt.target.getAttribute("data-price");
          hintElm.innerHTML = `${label} </br> ${price}`;
          hintElm.style.left = xPos+"px";
          hintElm.style.top = yPos+"px";
          hintElm.classList.replace("hide","show");
      });
      elm.addEventListener('mouseout',(evt)=>{
          hintElm.classList.replace("show","hide");
          hintElm.innerHTML = "";
      });
  })

}

function initGraphButtons(){
    let getAllGraphContainerElements = document.querySelectorAll(".graph-container");
    getAllGraphContainerElements.forEach((graphContainerElm)=>{
        let getAllGraphGroupElements = graphContainerElm.querySelectorAll(".graph-group");
        let getAllGraphButtonsElements = graphContainerElm.querySelectorAll(".graph-button");
        getAllGraphButtonsElements.forEach((buttonElm, buttonIndex)=>{
            buttonElm.addEventListener('click', (evt)=>{

                getAllGraphButtonsElements.forEach((element)=>{
                    element.classList.remove("button-selected");
                    element.classList.add("button-deselected");
                })
                getAllGraphGroupElements.forEach((element,groupIndex)=>{
                    if(groupIndex === buttonIndex){
                        element.classList.add("show");
                        element.classList.remove("hide");
                    }else{
                        element.classList.remove("show");
                        element.classList.add("hide");
                    }
                })
                evt.target.classList.replace("button-deselected","button-selected");
            })
        })
    })
}
