const {Schema, model} = require('mongoose')
const Bubble = require('./bubble')

const bubbleSortSchema = new Schema({
    index: Number,
    solved: Boolean,
    length: Number,
    first: {
        type: Schema.Types.ObjectId,
        ref: 'Bubble',
    },
    last: {
        type: Schema.Types.ObjectId,
        ref: 'Bubble',
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

module.exports = model('BubbleSort', bubbleSortSchema)