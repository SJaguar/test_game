'use strict';

let fs          = require('fs'),
    mongoose    = require('mongoose'),
    GameModel   = require('../helpers/GameModel'),
    ResultModel = require('../helpers/ResultModel'),
    pc_move     = 0;

const WIN_COMBINATIONS = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7]
    ],
    player = "player",
    enemy = "enemy";

module.exports = function( app ) {

    function checkWinner(player_type_moves, enemy_type_moves = new Array()) {

        let winner = "";

        WIN_COMBINATIONS.forEach((element, i) => {
            let move_player_count = 0;
            let enemy_player_count = 0;

            player_type_moves.forEach((move, id) => {
                if (WIN_COMBINATIONS[i].includes(move))
                    move_player_count = move_player_count + 1;
                if (move_player_count > 2) {
                    winner = player;
                }
            });

            if (!winner) {
                enemy_type_moves.forEach((move, id) => {
                    if (WIN_COMBINATIONS[i].includes(move))
                        enemy_player_count = enemy_player_count + 1;
                    if (enemy_player_count > 2) {
                        winner = enemy;
                    }
                });
            }
        });

        return winner;
    }

    function PcMove(new_array_move, PLAYER_TYPE) {
        let player_type_moves = [];
        let enemy_type_moves = [];
        let pc_move = 0;
        let new_moves = [];
        // moves from 1 to 9 exclude player move
        let moves = [1,2,3,4,5,6,7,8,9];

        // first pc move make random
        if (new_array_move.length == 1) {
            new_moves = moves.filter( move => move != new_array_move[0].move);
            return new_moves[Math.floor(Math.random() * new_moves.length)];
        }

        // fill up arrays to get player and enemy moves
        new_array_move.forEach((element,i) => {
            // exclude picked moves
            moves = moves.filter( move => move != element.move);
            if (element.player_type == PLAYER_TYPE) {
                player_type_moves.push(element.move);
            }
            else {
                enemy_type_moves.push(element.move);
            }
        });

        // first if player dont have two matches try to win
        for (let i in WIN_COMBINATIONS) {

            let move_enemy_count = 0;

            for (const [id, move] of enemy_type_moves.sort().entries()) {
                if (WIN_COMBINATIONS[i].includes(move))
                    move_enemy_count = move_enemy_count + 1;
                if (move_enemy_count > 1) {

                    // last move to win and exclude picked moves already
                    let almost_combination = WIN_COMBINATIONS[i].filter(win_move => enemy_type_moves.includes(win_move));
                    pc_move = WIN_COMBINATIONS[i].filter(win_move => !almost_combination.includes(win_move) && moves.includes(win_move));
                    // if found decision break loop
                    if (pc_move.length)
                        return pc_move;
                }
            }
        }

        // second if player have two combination already
        // check win_combinations so that we could dont win player
        for (let i in WIN_COMBINATIONS) {
            let move_player_count = 0;

            for (const [id, move] of player_type_moves.sort().entries()) {
                if (WIN_COMBINATIONS[i].includes(move))
                    move_player_count = move_player_count + 1;
                if (move_player_count > 1) {

                    // last move to win and exclude picked moves already
                    pc_move = WIN_COMBINATIONS[i].filter(win_move => !player_type_moves.includes(win_move) && moves.includes(win_move));
                    // if found decision break loop
                    if (pc_move.length)
                        return pc_move;
                }
            }
        }

        // third if player and enemy dont have two combinations, start to reach win combination
        // we could use just (let id in array), but i use like this for fun :)
        for (let i of WIN_COMBINATIONS.keys()) {
            let move_enemy_count = 0;
            for (const [id, move] of enemy_type_moves.sort().entries()) {
                if (WIN_COMBINATIONS[i].includes(move))
                    move_enemy_count = move_enemy_count + 1;
                if (move_enemy_count > 0) {
                    // last move to win and exclude picked moves already
                    pc_move = WIN_COMBINATIONS[i].filter( win_move => enemy_type_moves.includes(win_move) && moves.includes(win_move));
                    // if player dont have two matches try to win (random:)
                    if (!pc_move.length && moves.length)
                        return moves[Math.floor(Math.random() * moves.length)];
                }
            }
        }

        return pc_move;
    }

    // sure index page
    app.get('/', function( req, res ){

        res.render('index', { currentPage: 'index'} );
    });

    // start game with picked type
    app.post('/start/:player_type/:enemy_type', function( req, res ){
        // need to validate params
        // return game_id for new_game
        let random_game_id = Math.random()*Math.random();
        return res.json({"game_id" : random_game_id});
    });

    // game
    app.post('/game/:player_type/:enemy_type/:game_id/:cell_id', async function( req, res ){

        let random_game_id = Math.random()*Math.random();
        let winner = "";
        let player_type_moves = [];
        let enemy_type_moves = [];

        const GAME_ID = req.params.game_id;
        const CELL_ID = req.params.cell_id;
        const PLAYER_TYPE = req.params.player_type;
        const ENEMY_TYPE = req.params.enemy_type;

        // if game already going on
        let game = GameModel.find({"game_id": GAME_ID}, async (err, data) => {

            let new_array_move = [];

            // if exist this game already
            if (data && data.length) {
                new_array_move = data[0].move_info;
            }

            // move of player
            new_array_move.push({player_type : PLAYER_TYPE, move : CELL_ID});

            // pc turn
            pc_move = PcMove(new_array_move, PLAYER_TYPE);

            new_array_move.push({enemy_type : ENEMY_TYPE, move: pc_move.toString()});

            // if new Game or exist game
            if (!data || !data.length) {
                const Game = new GameModel({
                    player_type: PLAYER_TYPE,
                    enemy_type: ENEMY_TYPE,
                    game_id: GAME_ID,
                    move_info: new_array_move
                });

                await Game.save(function (err) {
                    if (err) return err;
                });
            }
            else {
                await game.updateOne({game_id : GAME_ID }, {move_info: new_array_move},function (err) {
                    if (err) return err;
                });
            }

            // fill up arrays for checking winner
            new_array_move.forEach((element,i) => {
                if (element.player_type == PLAYER_TYPE) {
                    player_type_moves.push(element.move);
                }
                else {
                    enemy_type_moves.push(element.move);
                }
            });

            // check winner
            winner = checkWinner(player_type_moves, enemy_type_moves);

            // if somebody win, write that in db
            if (winner) {
                const Result = new ResultModel({
                    game_id: GAME_ID,
                    who_win: winner
                });

                await Result.save(function (err) {
                    if (err) return err;
                });

                // return new game
                return res.json({
                    game_new: 1,
                    game_id: random_game_id,
                    who_win: winner
                });
            }

            // hardcode :) if last move start new game
            if (player_type_moves.length == 5) {
                return res.json({
                    game_new: 1,
                    game_id: random_game_id,
                    who_win: winner
                });
            }
            // just send pc move
            return res.json({
                game_id: GAME_ID,
                pc_move: pc_move
            });
        });
    });
};
