/* CORE FUNCTION
const bubbleSort = function (arr) {
    let madeSwitch = false

    if (arr.length < 2) 
        return arr
    
    while (!state.madeSwitch) {
        madeSwitch = true
        
        for (let i = 0; i < arr.length - 1; i++) {

            if (arr[i] > arr[i + 1]) {
                const tmp = arr[i]
                arr[i] = arr[i + 1]
                arr[i + 1] = tmp
    
                madeSwitch = false
            }
        }
    }

    return arr
}
*/


const bubbleSort = function(index, arr) {

    if (arr[index] > arr[index + 1]) {
        const tmp = arr[index]
        arr[index] = arr[index + 1]
        arr[index + 1] = tmp
    }

    return arr
}

const bubbleIndex = function(index, length) {
    if (index < length - 2) {
        index += 1
        return index
    } else {
        return 0
    }
}

const checkSolved = function(arr, len) {

    if (len < 2) {
        return true
    }

    for (let i = 0; i < len; i++) {
        if (arr[i] > arr[i + 1]) {
            return false
        }
    }
    return true
}

module.exports = {
    bubbleSort,
    bubbleIndex,
    checkSolved
}