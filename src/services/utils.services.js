
export const COMPARISON = {
    IS_EQUAL: 'equal',
    IS_MAJOR: 'major',
    IS_MINOR: 'minor'
}

export const PARSE_TEXT = {
    MONEY: 'MONEY',
    QUANTITY: 'QTY'
}

/**
 * Compare object parameters by property names and values
 * @param current
 * @param comparer
 * @returns {boolean}
 */
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

/**
 * Compare first parameter with the second one (values mustn't be objects)
 * returning COMPARISON.IS_MAJOR || COMPARISON.IS_MINOR || COMPARISON.IS_EQUAL
 * @param firstValue
 * @param secondValue
 * @returns {string}
 */
function valueComparison(firstValue, secondValue) {
    if (firstValue > secondValue) return COMPARISON.IS_MAJOR
    if (firstValue < secondValue) return COMPARISON.IS_MINOR
    if (firstValue === secondValue) return COMPARISON.IS_EQUAL
}

function ParseNumber(number, type = PARSE_TEXT.QUANTITY, currency = "C$") {
    switch (type) {
        case PARSE_TEXT.QUANTITY: {
            return `${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
        case PARSE_TEXT.MONEY: {
            return `${currency} ${number}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
    }
}

export default {
    checkObjectEquality,
    valueComparison,
    ParseNumber
}