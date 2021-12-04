const {Schema, model} = require('mongoose')
const BubbleSort = require('./bubble_sort')

const bubbleSchema = new Schema({
    arr: [{
        type: Number
    }],
    // parent: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'BubbleSort'
    // },
    next: String
})

module.exports = model('Bubble', bubbleSchema)
