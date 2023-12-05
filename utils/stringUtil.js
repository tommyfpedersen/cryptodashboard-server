function convertToAxisString(value){

    const valueLength = value.toString().length;
    let convertString ="";

    if(valueLength === 4){
        convertString = value.toString().substring(0,1) + "K";
    }
    if(valueLength === 5){
        convertString = value.toString().substring(0,2) + "K";
    }
    if(valueLength === 6){
        convertString = value.toString().substring(0,3) + "K";
    }
    if(valueLength === 7){
        convertString = value.toString().substring(0,1) + "."+ value.toString().substring(1,2)+ "M";
    }
   
    return convertString ;
}

module.exports = { convertToAxisString };