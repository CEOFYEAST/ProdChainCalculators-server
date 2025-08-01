/**
 * @module helpers
 * @description exposes some reusable functions
 * @author ceofyeast
 */

export const validTimeUnits = ["second", "minute", "hour"];

export const timeUnitsInSeconds = {
    "second": 1,
    "minute": 60,
    "hour": 3600
};

export function deepCopy(toCopy){
    return  JSON.parse(JSON.stringify(toCopy));
}

export function getTimeUnitConversionRatio(oldTimeUnit, newTimeUnit){
    let ratio = 1
    ratio = timeUnitsInSeconds[newTimeUnit] / timeUnitsInSeconds[oldTimeUnit];
    return ratio
}