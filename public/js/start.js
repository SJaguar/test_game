$( document ).ready(() => {
    // start new game
    $("#new_game").click(() => location.reload());
    // first choice
    $("#choice").find("button").click(function() {
        let player_type = $(this).attr("id");
        $(".modal_who").fadeOut("fast");
        $(".modal_enemy").delay(500).fadeIn("fast");
        // second choice
        $(".modal_enemy").find("button").click(() => {
            let enemy_type = $(this).attr("id");
            $.post( "./start/"+player_type+"/"+enemy_type, (data) => {
                // if not choosen smh
                if (!data)
                    return;
                let game_id = data.game_id;
                // initial score
                let enemy_count = 0;
                let player_count = 0;
                $(".modal_enemy").fadeOut("fast");
                $(".modal_game").delay(500).fadeIn("slow");
                $(".main_div_cells").find("div").click(function() {
                    // if already clicked before
                    if ($(this).hasClass("null_clicked") || $(this).hasClass("cross_clicked"))
                        return;
                    let cell_id = $(this).attr("data-id");
                    let enemy_class = "null_clicked";
                    let player_class = "cross_clicked";

                    $.post( "./game/"+player_type+"/"+enemy_type+"/"+game_id+"/"+cell_id, (game) => {

                        // if not choosen smh
                        if (!game) {
                            alert("ERROR dont picked anything or something :)");
                            return;
                        }
                        // if player_type null
                        if (player_type == "null") {
                            enemy_class = "cross_clicked";
                            player_class = "null_clicked";
                        }
                        // checked player pick and enemy pick
                        $(this).addClass(player_class);
                        $(".main_div_cells").find("div[data-id="+game.pc_move+"]").addClass(enemy_class);

                        // if smb win
                        if (game.game_new) {

                            game_id = game.game_id;
                            // count score, player, enemy
                            if (game.who_win == "enemy") {
                                enemy_count = enemy_count + 1;
                                $(".score").html("Счет " + player_count + " : " + enemy_count);
                            }
                            else if (game.who_win == "player") {
                                player_count = player_count + 1;
                                $(".score").html("Счет " + player_count + " : " + enemy_count);
                            }
                            $(".main_div_cells").find("div[data-id]").removeClass(player_class);
                            $(".main_div_cells").find("div[data-id]").removeClass(enemy_class);
                        }
                    });
                });
            });
        });
    });

});