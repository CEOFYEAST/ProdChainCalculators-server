/**
 * @module irptu-calculators
 * @description Exposes methods related to calculating and updating the demand for production chains
 * @author ceofyeast
 */

import recipes from "./recipes.module.js"
import { getTimeUnitConversionRatio } from "./helpers.module.js"

function calculateIntermediaryDemand(reqItem_ID, reqItem_IRPTU, demandOutput){
    tryAddRequiredItem(reqItem_ID, demandOutput)

    let reqItem_Info = recipes[reqItem_ID]; // general info about item
    let reqItem_Type = reqItem_Info["Type"]; // type of item i.e. Machinery, Intermediate product

    // base case
    if (reqItem_Type == "Resource" || reqItem_Type == "Liquid") {
        return;
    }

    let reqItem_Recipe = reqItem_Info["recipe"]; // info about how to craft item
    let reqItem_IPPC = reqItem_Recipe["yield"]; // items produced per craft
    let reqItem_CRPTU = reqItem_IRPTU / reqItem_IPPC; // crafts required per time unit 
    let reqItem_Intermediaries = reqItem_Recipe["ingredients"]; // info about intermediary items used to craft the reqItem

    // runs for every intermediary item
    for (let key in reqItem_Intermediaries) {
        let intermediary_Object = reqItem_Intermediaries[key];
        let intermediary_ID = intermediary_Object["id"];
        let intermediary_IRPC = intermediary_Object["amount"]; // intermediary items required per reqItem craft
        let intermediary_IRPTU = 0 // intermediary items required per time unit

        // handles rare case where recipe yield is null; doesn't actually solve the problem, but it ensures that no bugs occur
        if(reqItem_IPPC != null){
            intermediary_IRPTU = intermediary_IRPC * reqItem_CRPTU;
        }

        tryAddRequiredItem(intermediary_ID, demandOutput);

        addIntermediaryDemand(intermediary_ID, intermediary_IRPTU, demandOutput);

        addDependentDemand(reqItem_ID, intermediary_ID, intermediary_IRPTU, demandOutput);

        addIngredientDemand(reqItem_ID, intermediary_ID, intermediary_IRPTU, demandOutput);

        // recursive step
        calculateIntermediaryDemand(intermediary_ID, intermediary_IRPTU, demandOutput);
    }
}

/**
 * Adds the demand from the supplied demand data object to the supplied production chain data object
 * Demand being added can be positive or negative
 */
function updateProdChainIntermediaryDemand(prodChainData, crafterConfig, demandOutput){
    for (let requiredItemID in demandOutput) {
        tryAddItemData(requiredItemID, crafterConfig, prodChainData)

        let requiredItemDemand = demandOutput[requiredItemID]
        let requiredItemData = prodChainData[requiredItemID]
        requiredItemData["intermIRPTU"] += requiredItemDemand["IRPTU"]

        // update dependent items demand
        for(let dependentItemID in requiredItemDemand["dependentItems"]){
            if (!requiredItemData["dependentItems"].hasOwnProperty(dependentItemID)) {
                requiredItemData["dependentItems"][dependentItemID] = 0;
            }

            requiredItemData["dependentItems"][dependentItemID] += 
            requiredItemDemand["dependentItems"][dependentItemID];

            if (requiredItemData["dependentItems"][dependentItemID] == 0) {
                delete requiredItemData["dependentItems"][dependentItemID];
            }
        }

        // update ingredient items demand
        for(let ingredientItemID in requiredItemDemand["ingredientItems"]){
            if (!requiredItemData["ingredientItems"].hasOwnProperty(ingredientItemID)) {
                requiredItemData["ingredientItems"][ingredientItemID] = 0;
            }

            requiredItemData["ingredientItems"][ingredientItemID] += 
            requiredItemDemand["ingredientItems"][ingredientItemID];

            if (requiredItemData["ingredientItems"][ingredientItemID] == 0) {
                delete requiredItemData["ingredientItems"][ingredientItemID];
            }
        }

        prodChainData[requiredItemID] = requiredItemData;
    }

    return prodChainData
}

function updateProdChainUserDemand(itemID, amount, prodChainData, crafterConfig){
    tryAddItemData(itemID, crafterConfig, prodChainData);

    prodChainData[itemID]["userIRPTU"] += amount
}

function updateProdChainCrafterData(prodChainData, timeUnit) {
    for (let requiredItemID in prodChainData) {
        // update crafter count demand
        /**
         * - Perform multiplication of craft time vs crafter speed to get time per craft in seconds
         * - Convert time per craft to proper time unit
         * - Multiply time per craft by crafts required per time unit to get total time required for all crafts
         * - divide total time required by time per craft to get count of crafters required
         */
        let requiredItemData = prodChainData[requiredItemID]

        const recipe = recipes[requiredItemID]
        const craftTime = recipe["recipe"]["time"]
        const recipeYield = recipe["recipe"]["yield"]
        const crafter = requiredItemData["crafter"]
        const crafterSpeed = recipes[crafter]["crafting-speed"]
        const craftTimePerItem = (craftTime / crafterSpeed) / recipeYield; // seconds per item
        const craftRate = getTimeUnitConversionRatio("second", timeUnit) / craftTimePerItem; // items per timeUnit
        const targetRate = requiredItemData["userIRPTU"] + requiredItemData["intermIRPTU"]; // items per timeUnit
        const craftersRequired = targetRate / craftRate;

        // const totalTimeRequired = timePerCraft * craftsPerTimeUnit
        // const craftersRequired = totalTimeRequired / timePerCraft
        requiredItemData["crafterCount"] = craftersRequired

        prodChainData[requiredItemID] = requiredItemData;
    }

    return prodChainData
}

function clearEmptyData(prodChainData){
    for(let itemID in prodChainData){
        let itemData = prodChainData[itemID]
        if(itemData["userIRPTU"] == 0 && itemData["intermIRPTU"] == 0) {
            delete prodChainData[itemID];
        }
    }
}

function tryAddItemData(itemID, crafterConfig, prodChainData) {
    // adds ingredient representation to output if it doesn't already exist.
    if (!prodChainData.hasOwnProperty(itemID)) {
        const name = recipes[itemID]["name"];
        // replaces all spaces with underscores
        const thumbDir = name.replace(/\s+/g, '_') + '.png';
        const thumbName = `32px-${thumbDir}`;
        let crafterCategory = recipes[itemID]["crafter-category"];
        if(crafterCategory === undefined) crafterCategory = "assembler"
        const crafter = crafterConfig[crafterCategory];
        let itemData = {
            name,
            thumbDir,
            thumbName,
            crafter,
            crafterCount: 0,
            userIRPTU: 0,
            intermIRPTU: 0,
            dependentItems: {},
            ingredientItems: {}
        };
        prodChainData[itemID] = itemData;
    }
}

function tryAddRequiredItem(itemID, demandOutput) 
{
  if(!(demandOutput.hasOwnProperty(itemID))){
    let itemData = {
      IRPTU: 0,
      dependentItems: {},
      ingredientItems: {}
    };
    demandOutput[itemID] = itemData;
  }
}

function addIntermediaryDemand(intermediaryItemID, intermediary_IRPTU, demandOutput)
{
    demandOutput[intermediaryItemID]["IRPTU"] += intermediary_IRPTU;
}

function addDependentDemand(requiredItemID, intermediaryItemID, intermediary_IRPTU, demandOutput) 
{
    if(!(demandOutput[intermediaryItemID]["dependentItems"].hasOwnProperty(requiredItemID))){
        demandOutput[intermediaryItemID]["dependentItems"][requiredItemID] = 0;
    }
    demandOutput[intermediaryItemID]["dependentItems"][requiredItemID] += intermediary_IRPTU;
}

function addIngredientDemand(requiredItemID, intermediaryItemID, ingredient_IRPTU, demandOutput)
{
    if(!(demandOutput[requiredItemID]["ingredientItems"].hasOwnProperty(intermediaryItemID))){
        demandOutput[requiredItemID]["ingredientItems"][intermediaryItemID] = 0;
    }
    demandOutput[requiredItemID]["ingredientItems"][intermediaryItemID] += ingredient_IRPTU;
}

export {
    calculateIntermediaryDemand,
    updateProdChainIntermediaryDemand,
    updateProdChainUserDemand,
    updateProdChainCrafterData,
    clearEmptyData
}