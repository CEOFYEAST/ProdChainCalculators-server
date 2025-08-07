//import * as Validators from "./validators.module.js"

export function getProdChainAsGraph(prodChainObject) {
    return graphifyProdChain(prodChainObject)
}

export function getProdChainAsGraphJSON(prodChainObject) {
    return JSON.stringify( 
        graphifyProdChain(prodChainObject),
        null,
        2
    );
}

function graphifyProdChain(prodChainObject) {
    //Validators.validateProdChainObject(prodChainObject)

    const pcDemand = prodChainObject.prodChain
    const timeUnit = prodChainObject.timeUnit

    const nodeData = constructNodeData(pcDemand, timeUnit)
    const edgeData = constructEdgeData(pcDemand)
    const comboData = constructComboData(pcDemand)

    return {
        nodes: nodeData,
        edges: edgeData,
        combos: comboData
    }
}

function constructNodeData(pcDemand, timeUnit) {
    return Object
        .keys(pcDemand)
        .map((demandID) => {
            const demandObj = pcDemand[demandID]

            return {
                id: demandID,
                type: 'circle',
                data: {
                    userDemand: demandObj.userIRPTU,
                    intermDemand: demandObj.intermIRPTU,
                    timeUnit: timeUnit
                },
                style: {
                    labelText: demandID
                }
            }
        })
}

function constructEdgeData(pcDemand) {
    return Object   
        .keys(pcDemand)
        .reduce((edges, demandID) => {
            const demandObj = pcDemand[demandID]
            const ingredDemand = demandObj.ingredientItems

            return edges.concat( 
                constructBatchOfEdges(ingredDemand, demandID)
            );
        }, [])
}

function constructBatchOfEdges(ingredDemand, recipeID) {
    return Object
        .keys(ingredDemand)
        .map((ingredID) => {
            const demand = ingredDemand[ingredID]

            return {
                source: ingredID,
                target: recipeID,
                data: {
                    demand: demand
                },
                style: {
                    labelText: String(demand)
                }
            }
        })
}

function constructComboData(pcDemand) {
    return []
}