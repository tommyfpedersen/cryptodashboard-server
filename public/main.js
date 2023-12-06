function init(){

    /* verus */
    let getAddressBalanceElm = document.querySelector("#get-address-balance");
    console.log("encodeURIComponent(getAddressBalanceElm.value)", encodeURIComponent(getAddressBalanceElm.value))
    getAddressBalanceElm.addEventListener('keydown',(evt)=>{
        if (evt.key === 'Enter') {
            window.history.replaceState(null, null, '?address='+encodeURIComponent(getAddressBalanceElm.value) );
            location.reload();
          }
    })

    /** common */
    initGraphBarHints();
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
          hintElm.innerHTML = `${label} ${price}`;
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