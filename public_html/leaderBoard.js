


function leaderBoardButtonAction() {
    displayWorldMap();

}

var my_jar_list = null;

function leaderBoardUpdate(the_result) {
    my_jar_list = [];
    var title = document.getElementById('title_container');
    var left = document.getElementById('left-sub-title');
    var right = document.getElementById('right-sub-title');

   document.getElementById('level-completed').innerHTML = "Level completed: "+my_g_stage_id;
   document.getElementById('level-score').innerHTML = "Level score: "+the_result[0];
   document.getElementById('level-time').innerHTML = "Level time: "+the_result[1];
   document.getElementById('level-collectables').innerHTML = "Level collectables: "+the_result[2];
   document.getElementById('level-deaths').innerHTML = "Level deaths: "+the_result[3];

    title.innerHTML = "World " + my_g_stage_id + ", Top Times and Scores!!!";

    left.innerHTML = "Level " + my_g_position_id + ": Points";
    right.innerHTML = "Level " + my_g_position_id + ": Times";

    document.getElementById('left-box').innerHTML = null;
    document.getElementById('right-box').innerHTML = null;

    game.settings.get({"command": "topTenHighScore",
      "data": { "levelID": my_g_level_id || "14"}
    }, //my_g_level_id
    function(callback) {

        var mySplitResult = callback.split("-");

        var div = document.getElementById('left-box');
        for (var i = 0; i < mySplitResult.length - 1; i += 2) {
            my_jar_list.push( mySplitResult[i + 1]);
            div.innerHTML = div.innerHTML + "<span><a onClick= 'displayReplayGame(\"" 
			+(my_jar_list.length -1) + "\")'>" + mySplitResult[i] + "</a></span>";
        }

    });


//physEng.loadReplay(str) will need to be implemented in the controlDisplay when real json is passed

    game.settings.get({"command": "topTenTime",
      "data": {"levelID": my_g_level_id || "14"}}, //my_g_level_id
    function(callback) {
        var mySplitResult = callback.split("-");

        var div = document.getElementById('right-box');
        for (var i = 0; i < mySplitResult.length; i += 2) {
			my_jar_list.push( mySplitResult[i + 1]);
            div.innerHTML = div.innerHTML + "<span><a onClick= 'displayReplayGame(\"" 
			+ (my_jar_list.length -1) + "\")'>" + mySplitResult[i] + "</a></span>";
        }
    });

	
	my_stage_board.setPoint(my_g_stage_id, my_g_position_id, the_result[0]);
}



