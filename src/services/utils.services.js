
function checkObjectEquality (current, comparer) {
    const invalidObject = typeof comparer !== "object"
        && typeof current !== "object"
        && current === null && comparer === null
    if (invalidObject) {
        console.log("Invalid objects")
        return false
    }

    const currentEntries = Object.entries(current)
    const comparerEntries = Object.entries(comparer)

    const validPropNames = comparerEntries.filter(comp => currentEntries.some(cur => cur[0] === comp[0]))
    if (validPropNames.length !== comparerEntries.length) {
        console.log("Invalid objects - case #2 properties")
        return false
    }
    const validPropValues = comparerEntries.filter(comp => currentEntries.some(cur => cur[1] === comp[1]))
    if (validPropValues.length !== comparerEntries.length) {
        console.log("Invalid objects - case #2 properties")
        return false
    }
    return true
}

export default {
    checkObjectEquality
}