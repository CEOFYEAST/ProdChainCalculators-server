import * as UTILITY from "./prod-chain-utility.module.js"

export function buildLongestPathTraversal(prodChainData) {
    const traversalQueue = []
    const userDemandIDs = Object.keys(UTILITY.getUserDemand(prodChainData))
    // for(let userInputID of userDemandIDs) {
    //     traversalQueue.push(userInputID);
    // }
    for(let userInputID of userDemandIDs) {
        performSingleRootTraversal(userInputID, prodChainData, traversalQueue)
    }
    for(let userInputID of userDemandIDs) {
        traversalQueue.unshift(userInputID)
    }
    return traversalQueue
}

function performSingleRootTraversal(rootID, prodChainData, traversalQueue) {
    if (traversalQueue.includes(rootID)) {
        return;
    }
    
    const nodeData = prodChainData[rootID];

    if(nodeData['userIRPTU'] === 0) traversalQueue.push(rootID);
    
    if (nodeData && nodeData.ingredientItems) {
        for (const childID in nodeData.ingredientItems) {
            performSingleRootTraversal(childID, prodChainData, traversalQueue);
        }
    }
}