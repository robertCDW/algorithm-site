const express = require('express')
const passport = require('passport')
const customErrors = require('../../lib/custom_errors')

const {bubbleSort, bubbleIndex, checkSolved} = require('../algorithms/sorting/bubble_sort')
const Bubble = require('../models/bubble-sort/bubble')
const BubbleSort = require('../models/bubble-sort/bubble_sort')

// function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404

// function to send 401 when a user tries to modify a resource that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

const router = require('express').Router()
// need to store the starting array, each step, and the final array
// index will get the first and last of each array, but the show command will get all intermittent steps

// POST to create new arr
// needs to generate new numbers
router.post('/bubble-sort', requireToken, (req, res, next) => {
    
    // // console.log(req.user._id)
    // const newArr = []

    // // TODO: get from body
    // const num = 5

    // for (let i = 0; i < num; i++) {
    //     newArr.push(Math.floor(Math.random() * 100))
    // }

    Bubble.create({
        arr: req.body.arr,
        next: null
    })
    .then(bubble => {
        // console.log(bubble.arr)
        BubbleSort.create({
            index: 0,
            solved: false,
            length: req.body.arr.length,
            first: bubble,
            last: bubble,
            owner: req.user._id,
        })
        .then(bubbles => {

            // console.log(bubbles)
            res.status(200).json({ bubbles })
        })
    })
})

// INDEX to find all past arrays
// will show the start and end arrays
// will need to populate multiple arrays

router.get('/bubble-sort', requireToken, (req, res, next) => {
    // console.log(req.user._id)

    BubbleSort.find({ 'owner': req.user._id })
        .populate('first')
        .populate('last')
        .then(bubbleSorts => {
            res.status(200).json({ bubbleSorts })            
        })
})

// housekeeping find/delete methods
// ensures no unaccessible sorts/bubbles build up over time
router.get('/bubble-sort/get-bubbles', (req, res, next) => {
    
    Bubble.find()
    .then(bubbles => {
        res.send({bubbles})
    })
})

router.get('/bubble-sort/get-sorts', (req, res, next) => {
    
    BubbleSort.find()
    .then(bubbles => {
        res.send({bubbles})
    })
})

router.delete('/bubble-sort/delete-bubbles', (req, res, next) => {
    
    Bubble.deleteMany()
    .then(() => {
        res.sendStatus(204)
    })
})

router.delete('/bubble-sort/delete-sorts', (req, res, next) => {
    
    BubbleSort.deleteMany()
    .then(bubbles => {
        res.sendStatus(204)
    })
})
// end housekeeping


// SHOW will show one arr
// will show one array plus the steps between...?

router.get('/bubble-sort/:id', requireToken, (req, res, next) => {
    const bubbleSortId = req.params.id
    // let bubble
    const bubbles = []

    BubbleSort.findById(bubbleSortId)
        .populate('first')
        .populate('last')
        .then(bubbleSort => {

            // could get by owner-sort in a single move and then iterate through those to organize...? 
            // let max = 0
            // bubble = bubbleSort.first
            // bubbles.push(bubble)

            /*
            while(bubble.next && max < 10) {
                console.log("tries")
                max++

                Bubble.findById(bubble.next)
                    .then(bubbleData => {
                        console.log(bubbleData)
                        bubble.next = bubbleData.next.toString()
                        
                        console.log(bubble.next)
                        bubbles.push(bubbleData)
                    })

            res.status(200).json({ bubbles })
            */

            res.status(200).json({bubbleSort})
        })
})

// move to above normal SHOW or it won't work lol
// router.get('/bubble-sort/test/:id', (req, res, next) => {

//     const bubbleSortId = req.params.id
//     // let bubble
    

//     BubbleSort.findById(bubbleSortId)
//     .populate('first')
//     .populate('last')
//     .then(bubbleSort => {

//         const sort = getSort(bubbleSort.first)
//         .then(sort => {
//         console.log(sort)
//         res.send(sort)
//     })
//     })
// })

// const getSort = async(bubble) => {
//     let sort = bubble
//     let sortArr = []
//     let count = 0

//     console.log(sort)

//     while(count < 1){
//         count++
//         console.log("hello")
//         sort = await BubbleSort.findById(sort.next)
//         sortArr.push(sort)
//         if (sort) {
//             sort = sort.next
//         }
//     }
    
//     // console.log(sort)
//     // res.send({sort})
//     return sortArr
// }

// const getList = async () => {
//     // console.log(sort.first.next)
//     try {
//         const values = await Bubble.findById("61aeea250c39b71f67815bf8").exec()
//         console.log("hello")
//         return values
//     } catch (err) {
//         return err
//     }
// }

// const returnVal = () => {
//     let val = await getList()
//     return val
// }

// patch
// moves bubble sort algorithm one step forward
router.patch('/bubble-sort/:id', requireToken, (req, res, next) => {
    const bubbleSortId = req.params.id

    let sortState
    let oldBubble
    let newBubble

    BubbleSort.findById(bubbleSortId)
        .populate('first')
        .then(event => requireOwnership(req, event))
        .then(sortStateData => {
            sortState = sortStateData

            if (sortState.solved) {
                throw new Error("Array is fully sorted")
            }

            Bubble.findById(sortState.last.toString())
                .then(lastBubble => {
                    let newArr = []
                    oldBubble = lastBubble

                    for (let i = 0; i < 5; i++) {
                        newArr.push(oldBubble.arr[i])
                    }

                    newArr = bubbleSort(sortState.index, newArr)
                    sortState.index = bubbleIndex(sortState.index, sortState.length)
                    sortState.solved = checkSolved(newArr, sortState.length)

                    Bubble.create({
                        arr: newArr,
                        next: null
                    })
                    .then(newData => {
                        newBubble = newData
                        oldBubble.next = newBubble.id.toString()
                        // console.log(oldBubble.next)
                        
                        return oldBubble.save()
                    })
                    .then(() => {
                        sortState.last = newBubble

                        return sortState.save()
                    })
                    .then(() => {
                        res.status(201).json({sortState, oldBubble})                
                    })
                })
        })
        .catch(next)
})


// currently deletes the overall sort
// currently leaves the steps between...? will need to loop through the list and delete those later
// store array of IDs, then delete many by ID
// could insert an owner and delete by owner...?
router.delete('/bubble-sort/:id', requireToken, (req, res, next) => {
    BubbleSort.findById(req.params.id)
        .then(event => requireOwnership(req, event))
        .then(bubbleSort => {
            bubbleSort.deleteOne()

            res.sendStatus(204)
        })
        .catch(next)
})

module.exports = router