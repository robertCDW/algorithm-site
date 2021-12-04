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
router.post('/bubble-sort', (req, res, next) => {
    const newArr = []

    // TODO: get from body
    const num = 5

    for (let i = 0; i < num; i++) {
        newArr.push(Math.floor(Math.random() * 100))
    }

    Bubble.create({
        arr: newArr,
        next: null
    })
    .then(bubble => {
        console.log(bubble.arr)
        BubbleSort.create({
            index: 0,
            solved: false,
            length: num,
            first: bubble,
            last: bubble
        })
        .then(bubbles => {
            console.log(bubbles)
            res.status(200).json({ bubbles })
        })
    })
})

// INDEX to find all past arrays
// will show the start and end arrays
// will need to populate multiple arrays

router.get('/bubble-sort', (req, res, next) => {
    BubbleSort.find()
        .populate('first')
        .populate('last')
        .then(bubbleSorts => {
            res.status(200).json({ bubbleSorts })            
        })
})


// SHOW will show one arr
// will show one array plus the steps between...?

router.get('/bubble-sort/:id', (req, res, next) => {
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
                
                    setTimeout(() => {}, 1000)
            }

            res.status(200).json({ bubbles })
            */

            res.status(200).json({bubbleSort})
        })
})


// patch
// moves bubble sort algorithm one step forward
router.patch('/bubble-sort/:id', (req, res, next) => {
    const bubbleSortId = req.params.id

    let sortState
    let oldBubble
    let newBubble

    BubbleSort.findById(bubbleSortId)
        .populate('first')
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
                        console.log(oldBubble.next)
                        
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
router.delete('/bubble-sort/:id', (req, res, next) => {
    BubbleSort.findById(req.params.id)
        .then(bubbleSort => {
            bubbleSort.deleteOne()

            res.sendStatus(204)
        })
        .catch(next)
})

module.exports = router