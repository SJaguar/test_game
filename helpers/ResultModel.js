const {Schema, model} = require('mongoose');

// create game info schema with no validation

let ResultSchema = new Schema({
    game_id: {
        type: String,
        required: true
    },
    who_win: {
        type: String,
        required: true
    }
});

module.exports = model('ResultSchema', ResultSchema );