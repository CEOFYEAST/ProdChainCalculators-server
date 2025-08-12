/**
 * @module prod-chain-irptu
 * @description Acts as a wrapper class to expose the IRPTU-submission-related functionality in the calculators module
 * @author ceofyeast
 */

import * as Validators from "./validators.module.js"
import * as Calculators from "./irptu-calculators.module.js"
import { getTimeUnitConversionRatio } from "./helpers.module.js"

/**
 * Adds a given amount of demand per time unit of a given item to a given production chain object
 * @param {*The ID of the item being added to the production chain} itemID 
 * @param {*The amount of the item required per time unit} amount 
 * @param {*The production chain data being added to} prodChainObject 
 * @param {*(Optional) The time unit of the request; used to convert the required amount to the time unit of the production chain} timeUnit 
 * @returns THe updated production chain
 */
function addIRPTU(itemID, amount, prodChainObject, timeUnit) {
    Validators.validateID(itemID)
    Validators.validateNumber(amount)
    Validators.validateProdChainObject(prodChainObject)
    if (arguments.length === 4) {
        Validators.validateTimeUnit(timeUnit)
        amount = amount * getTimeUnitConversionRatio(timeUnit, prodChainObject["timeUnit"])
    }
    Validators.validateIRPTUAddition(amount)
    let prodChainData = prodChainObject["prodChain"]
    Validators.validateProdChainData(prodChainData)

    let demandInfoOutput = {}
    const crafterConfig = prodChainObject["crafterConfig"]
    const currTimeUnit = prodChainObject["timeUnit"]
    Calculators.calculateIntermediaryDemand(itemID, amount, demandInfoOutput)
    Calculators.updateProdChainIntermediaryDemand(prodChainData, crafterConfig, demandInfoOutput)
    Calculators.updateProdChainUserDemand(itemID, amount, prodChainData, crafterConfig)
    Calculators.updateProdChainCrafterData(prodChainData, timeUnit)
    Calculators.clearEmptyData(prodChainData)

    prodChainObject["prodChain"] = prodChainData
    return prodChainObject;
}

/**
 * Subtracts a given amount of demand per time unit of a given item from a given production chain object
 * @param {*The ID of the item being removed from the production chain} itemID 
 * @param {*The amount of the item being removed per time unit} amount 
 * @param {*The production chain data being subtracted from} prodChainObject 
 * @param {*(Optional) The time unit of the request; used to convert the required amount to the time unit of the production chain} timeUnit 
 * @returns The updated production chain
 */
function subtractIRPTU(itemID, amount, prodChainObject, timeUnit) {
    Validators.validateID(itemID)
    Validators.validateNumber(amount)
    Validators.validateProdChainObject(prodChainObject)
    let prodChainData = prodChainObject["prodChain"]
    Validators.validateProdChainData(prodChainData)
    if (arguments.length === 4) {
        Validators.validateTimeUnit(timeUnit)
        amount = amount * getTimeUnitConversionRatio(timeUnit, prodChainObject["timeUnit"])
    }
    Validators.validateIRPTUSubtraction(itemID, amount, prodChainData)

    amount = amount * -1;
    let demandInfoOutput = {}
    const crafterConfig = prodChainObject["crafterConfig"]
    const currTimeUnit = prodChainObject["timeUnit"]
    Calculators.calculateIntermediaryDemand(itemID, amount, demandInfoOutput)
    Calculators.updateProdChainIntermediaryDemand(prodChainData, crafterConfig, currTimeUnit, demandInfoOutput)
    Calculators.updateProdChainUserDemand(itemID, amount, prodChainData, crafterConfig)
    Calculators.updateProdChainCrafterData(prodChainData, timeUnit)
    Calculators.clearEmptyData(prodChainData)

    prodChainObject["prodChain"] = prodChainData
    return prodChainObject;
}

export {
    addIRPTU, subtractIRPTU
}