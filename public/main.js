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
}