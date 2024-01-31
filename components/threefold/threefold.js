async function getNodeDetailsArray(nodeArray) {

    let nodesToFetchArray = [];
    let resultArray = [];

    nodeArray.forEach((elm,index) => {
        nodesToFetchArray.push( getNodeDetails(nodeArray[index]) )
    });

    for await (const node of nodesToFetchArray){
        resultArray.push(node);
    }

    return resultArray;
}

   // nodeDetailsArray = [];
    // console.log("-nodeArray", nodeArray)
    // console.log("-nodeDetailsArray", nodeDetailsArray)

//     nodeArray.forEach( async (node, index) =>{
//         console.log("-forEach", index)
//         const getnodedetailsResponse = await fetch(`https://gridproxy.grid.tf/nodes/${nodeArray[index]}`)
//         const getnodedetailsResult = await getnodedetailsResponse.json();
//         nodeDetailsArray.push(getnodedetailsResult);
//     })

//     console.log("-return")
//     return nodeDetailsArray;
// }

// async function getThreeFoldNodes(){
//     for await (const node of nodesToFetchArray){
//         console.log("node...",node);
//     }
// }


async function getNodeDetails(node) {
    const getnodedetailsResponse = await fetch(`https://gridproxy.grid.tf/nodes/${node}`)
    const getnodedetailsResult = await getnodedetailsResponse.json();
    const getnodedetails = getnodedetailsResult;
    return getnodedetails;
}
module.exports = { getNodeDetails, getNodeDetailsArray};

//https://gridproxy.grid.tf/swagger/index.html
//https://gridproxy.grid.tf/nodes/3170/statistics