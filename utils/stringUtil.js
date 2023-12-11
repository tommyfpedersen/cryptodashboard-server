function convertToAxisString(value){
    value = parseInt(value);
    const valueLength = value.toString().length;
    let convertString = value;

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
    if(valueLength === 8){
        convertString = value.toString().substring(0,2) + "."+ value.toString().substring(2,3)+ "M";
    }
    if(valueLength === 9){
        convertString = value.toString().substring(0,3) + "M";
    }
    if(valueLength === 10){
        convertString = value.toString().substring(0,1) + "."+ value.toString().substring(1,2)+ "B";
    }
    if(valueLength === 11){
        convertString = value.toString().substring(0,2) + "."+ value.toString().substring(2,3)+ "B";
    }
    if(valueLength === 12){
        convertString = value.toString().substring(0,3) + "B";
    }
   
    return convertString;
}

module.exports = { convertToAxisString };