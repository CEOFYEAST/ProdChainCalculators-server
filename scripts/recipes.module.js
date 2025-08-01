/**
 * @module recipes
 * @description Exposes the "recipes" (data on how to create each item) in recipes.json, and provides method/s for filtering said data
 * @author ceofyeast
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './config.module.js'
import { addConfigChangedListener } from './config.module.js'

if(config.debugMode) console.log("Recipes Module Running")
addConfigChangedListener(loadRecipes)
var recipes = null
loadRecipes();

function loadRecipes() {
    const src = path.dirname(
        fileURLToPath(path.dirname(import.meta.url))
    )
    const recipesPath = path.join(src, "/data/recipes.json")
    recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
}

// makes recipes a live binding
export {recipes as default}


