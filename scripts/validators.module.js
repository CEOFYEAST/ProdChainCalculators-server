/**
 * @module validators
 * @description This module provides functions for validating various types of values, such as IDs, recipes, prod chain data/objects, booleans, and numbers.
 * @author ceofyeast
 */

import recipes from "./recipes.module.js"
import { getItemIDs } from "./prod-chain-utility.module.js";
import {validTimeUnits} from "./helpers.module.js"
import config from "./config.module.js"
import ValidationError from "./ValidationError.module.js";

let validationFailedListeners = new Array()

function handleValidationFailed(errMssg){
    if(config.debugMode) console.log(errMssg)
    let err = new ValidationError(errMssg)
    for(let i = 0; i < validationFailedListeners.length; i++){
        validationFailedListeners[i](err);
    }
    throw(err)
}

export function addValidationFailedListener(listener){
    validationFailedListeners.push(listener)
}

export function ensureNonNullish(val)
{
    if(val === undefined)
    {
        let errMssg = "Value is undefined\n";
        handleValidationFailed(errMssg)
    }
    else if(val === null)
    {
        let errMssg = "Value is null\n";
        handleValidationFailed(errMssg)
    }
}

export function validateID(id) {
    ensureNonNullish(id);

    if (!(typeof id === 'string')) {
        let errMssg = "ID must be of type string, is of type " + typeof id + "\n";
        handleValidationFailed(errMssg)
    }

    validateRecipes(recipes);

    if (id == "") {
        let errMssg = "id cannot be empty\n";
        handleValidationFailed(errMssg)
    }
    if (!getItemIDs().includes(id)) {
        let errMssg = "Recipe with id '" + id + "' not found in recipesDict\n";
        handleValidationFailed(errMssg)
    }
}

export function validateRecipes(recipes) {
    ensureNonNullish(recipes);
    validateObject(recipes);
}

export function validateProdChainObject(prodChainObject) {
    ensureNonNullish(prodChainObject);
    validateObject(prodChainObject);
    if (!(prodChainObject.hasOwnProperty("prodChain")) || !(prodChainObject.hasOwnProperty("timeUnit"))) {
        let errMssg = "Supplied production chain object is invalid";
        handleValidationFailed(errMssg)
    }

    validateTimeUnit(prodChainObject["timeUnit"])
    validateProdChainData(prodChainObject['prodChain'])
}

export function validateProdChainData(prodChainData) {
    ensureNonNullish(prodChainData);
    validateObject(prodChainData);
    for (let key in prodChainData) {
        if (!getItemIDs().includes(key)) {
            let errMssg = "Invalid key '" + key + "' in production chain data\n";
            handleValidationFailed(errMssg)
        }
    }
}

export function validateObject(val){
    ensureNonNullish(val);

    if(!(typeof val === 'object')){
        let errMssg = typeof val + " is not of type object\n";
        handleValidationFailed(errMssg)
    }
}

export function validateNumber(val) {
    ensureNonNullish(val);

    if(!(typeof val === 'number' && !isNaN(val))) {
        let errMssg = typeof val + " is not a number\n";
        handleValidationFailed(errMssg)
    }
}

export function validateTimeUnit(timeUnit){
    ensureNonNullish(timeUnit);

    if (!(typeof timeUnit === 'string')) {
        let errMssg = "Time unit must be of type string, is of type " + typeof timeUnit + "\n";
        handleValidationFailed(errMssg)
    }

    if (!validTimeUnits.includes(timeUnit)) {
        let errMssg = "Time unit must be one of " + validTimeUnits.join(', ') + "\n";
        handleValidationFailed(errMssg)
    }
}

export function validateIRPTUAddition(amount){
    if(amount <= 0) {
        let errMssg = "Invalid Addition Amount\n";
        handleValidationFailed(errMssg)
    }
}

export function validateIRPTUSubtraction(itemID, amount, prodChainData){
    if (prodChainData.hasOwnProperty(itemID)) {
        let itemData = prodChainData[itemID];
        let existingItemDemand = itemData["userIRPTU"];

        if (amount > existingItemDemand) {
            let errMssg = "Cannot remove more user demand than the item already has, so must be less than or equal to " + existingItemDemand + "\n";
            handleValidationFailed(errMssg)
        }
    }
    else {
        let errMssg = "Cannot remove user demand from item that doesn't exist in the production chain\n";
        handleValidationFailed(errMssg)
    }
}