const {Schema, model} = require('mongoose');

// create game info schema with no validation

let CellSchema = new Schema({
    player_type: String,
    enemy_type: String,
    move: Number
});

let GameSchema = new Schema({
    player_type: {
        type: String,
        required: true
    },
    enemy_type: {
        type: String,
        required: true
    },
    game_id: {
        type: Number,
        required: true
    },
    move_info: [CellSchema]
});

module.exports = model('GameSchema', GameSchema );