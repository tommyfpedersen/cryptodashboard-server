// global variables for charts
var dataArray = [];
function createGraphData(blocktime, value) {
    dataArray.push({
        blocktime: blocktime,
        value: value
    })
}
function getGraphData() {
    return dataArray;
}