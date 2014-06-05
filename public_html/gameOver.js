

function gameOver(the_score, the_time, the_jason, the_collect, the_num_death) {
    var game_result = [the_score, the_time, the_collect, the_num_death];
    game.settings.post({"command": "insertScore",
        "data": {"userID": my_user_id, "levelID": my_g_level_id,
            "score": the_score, "completetime": the_time, "replay": the_jason}},
    function(callback) {
        if (callback === "1") {
            leaderBoardUpdate(game_result);
            displayLeaderBoard();
        } else {
            console.log("score not inserted");

        }

    });
    //display..it.

    displayLeaderBoard();



}