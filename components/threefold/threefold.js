let nodeDetailsArray = [];

async function getNodeDetailsArray(nodeArray) {

    nodeArray.forEach( async (node, index) =>{
        const getnodedetailsResponse = await fetch(`https://gridproxy.grid.tf/nodes/${nodeArray[index]}`)
        const getnodedetailsResult = await getnodedetailsResponse.json();
        nodeDetailsArray.push(getnodedetailsResult);
    })
    return nodeDetailsArray;
}

async function getNodeDetails(node) {
    const getnodedetailsResponse = await fetch(`https://gridproxy.grid.tf/nodes/${node}`)
    const getnodedetailsResult = await getnodedetailsResponse.json();
    const getnodedetails = getnodedetailsResult;
    return getnodedetails;
}
module.exports = { getNodeDetails, getNodeDetailsArray};

//https://gridproxy.grid.tf/swagger/index.html
//https://gridproxy.grid.tf/nodes/3170/statistics