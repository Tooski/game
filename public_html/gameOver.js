

function gameOver(the_score, the_time, the_jason, the_collect, the_num_death) {
    var game_result = [the_score, the_time, the_collect, the_num_death];
    var call_result = null;
    game.settings.post({"command": "insertScore",
        "data": {"userID": my_user_id, "levelID": my_g_level_id,
            "score": the_score, "completetime": the_time, "replay": the_jason}},
    function(callback) {
        console.log("callback is" + callback)
        if (callback === "1") {
            call_result = callback;
            console.log("score inserted");
        } else {
            console.log("score not inserted");

        }

    });
    //display..it.

    displayLeaderBoard(game_result);



}