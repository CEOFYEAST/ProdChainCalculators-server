/**
 * @module prod-chain-utility
 * @description Contains methods used to perform non-irptu-submission-related tasks
 * @author ceofyeast
 */

import { getTimeUnitConversionRatio } from "./helpers.module.js"
import * as validators from "./validators.module.js"
import recipes from './recipes.module.js'

/**
 * Used to parse and return the user demand of a prod chain data object
 * @param {*} prodChainData 
 * @returns An object containing the IDs of the items required for user demand as keys, and their actual demand IRPTU as values
 */
function getUserDemand(prodChainData) {
    validators.validateProdChainData(prodChainData)
    
    let userDemandData = {}
    for(let itemID in prodChainData){
        let itemUserDemand = prodChainData[itemID]["userIRPTU"]
        if(itemUserDemand > 0) userDemandData[itemID] = itemUserDemand
    }
    return userDemandData
}

/**
 * Used to the IDs of the items in recipes
 * @returns a list of string IDs
 */
function getItemIDs(){
    return Object.keys(recipes)
}

/**
 * Used to fetch an object with item name keys, and item ID values; associates item names with their respective IDs, which allows items to be selected by their name
 * @returns 
 */
function getItemNamesAndIDs(){
    let IDs = getItemIDs()
    let namesAndIDs = {}
    for(let i = 0; i < IDs.length; i++){
        let ID = IDs[i]
        let name = recipes[ID]["name"]
        namesAndIDs[name] = ID
    }
    return namesAndIDs
}

/**
 * Swtiches the time unit of the supplied prod chain object, and re-calculates the IRPTU of every item in the object's prod chain data 
 * @param {*} prodChainObject 
 * @param {*} newTimeUnit 
 * @returns The recalculated prod chain object
 */
function recalculateTimeUnit(prodChainObject, newTimeUnit) {
    validators.validateProdChainObject(prodChainObject)
    validators.validateTimeUnit(newTimeUnit)

    let oldTimeUnit = prodChainObject["timeUnit"]
    let ratio = getTimeUnitConversionRatio(oldTimeUnit, newTimeUnit)

    let prodChainData = prodChainObject["prodChain"]
    for(let itemID in prodChainData){
        prodChainData[itemID]["userIRPTU"] *= ratio
        prodChainData[itemID]["intermIRPTU"] *= ratio

        for(let dependentItemID in prodChainData[itemID]["dependentItems"]){
            prodChainData[itemID]["dependentItems"][dependentItemID] *= ratio
        }

        for(let ingredientItem in prodChainData[itemID]["ingredientItems"]){
            prodChainData[itemID]["ingredientItems"][ingredientItem] *= ratio
        }
    }

    prodChainObject["prodChain"] = prodChainData
    prodChainObject["timeUnit"] = newTimeUnit
    return prodChainObject
}

/**
 * Used to create a valid, empty production chain object
 * @param (optional) Time unit input; allows the time unit of the prod chain object to be specified
 * @returns An empty object representation of a production chain
 */
function createProductionChainObject(){
    if (arguments.length === 1 && typeof arguments[0] === 'string') {
        validators.validateTimeUnit(arguments[0])
        
        return {
            timeUnit: arguments[0],
            prodChain: {}
        }
    }  

    return {
        timeUnit: "minute",
        prodChain: {}
    }
}

export {
    getUserDemand, getItemIDs, getItemNamesAndIDs, recalculateTimeUnit, createProductionChainObject
}