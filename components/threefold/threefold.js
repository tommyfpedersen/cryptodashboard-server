async function getThreeFoldNodeArray(nodeString) {

    let nodeIdArray = [];
    let nodeUserNameArray = []
    let nodesToFetchArray = [];
    let resultArray = [];

    nodeElements = nodeString.split(" ");
    nodeElements.map((elm, index) => {
        if (index % 2 === 0) {
            nodeUserNameArray.push(elm);
        } else if (index % 2 === 1) {
            nodeIdArray.push(elm)
        }
    })

    nodeIdArray.forEach((elm) => {
        nodesToFetchArray.push(getNodeDetails(elm))
    });

    let counter = 0;
    for await (const node of nodesToFetchArray) {
        node.username = nodeUserNameArray[counter];
        resultArray.push(node);
        counter++;
    }
    return resultArray;
}

async function getNodeDetails(node) {
    if (isNaN(node)) {
        return {};
    } else {
        const getnodedetailsResponse = await fetch(`https://gridproxy.grid.tf/nodes/${node}`)
        const getnodedetailsResult = await getnodedetailsResponse.json();
        const getnodedetails = getnodedetailsResult;
        return getnodedetails;
    }

}
module.exports = { getThreeFoldNodeArray };

//https://gridproxy.grid.tf/swagger/index.html
//https://gridproxy.grid.tf/nodes/3170/statistics