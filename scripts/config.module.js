let configChangedListeners = new Array()

let config = {
    debugMode: true
}

if(config.debugMode) console.log("Config Module Running")

function handleConfigChanged(){
   // calls all config changed listeners
    if(config.debugMode) console.log("Calling all configChanged event listeners...")
    for(let i = 0; i < configChangedListeners.length; i++){
        configChangedListeners[i]();
    }
}

/**
 * Exporting a proxy of the config object ensures the listeners of the config changed event can be called
 */
export default new Proxy(config, {

    // ensures no new properties can be added, and calls all config changed listeners
    set(obj, prop, value) {
        if (obj.hasOwnProperty(prop)){
            obj[prop] = value
            handleConfigChanged()
            return true
        }

        return false
    },

    get(obj, prop, receiver){
        return obj[prop]
    }
})

export function addConfigChangedListener(listener){
    configChangedListeners.push(listener)
}

