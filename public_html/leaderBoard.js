


function leaderBoardButtonAction() {

    displayWorldMap();

}


var my_jar_list= null;
function leaderBoardUpdate() {
	my_jar_list = [];
    var title = document.getElementById('title_container');
    var left = document.getElementById('left-sub-title');
    var right = document.getElementById('right-sub-title');

    title.innerHTML = "World " + my_g_stage_id + ", Top Times and Scores!!!";

    left.innerHTML = "Level " + my_g_position_id + ": Points";
    right.innerHTML = "Level " + my_g_position_id + ": Times";

    document.getElementById('left-box').innerHTML = null;
    document.getElementById('right-box').innerHTML = null;

    game.settings.get({"command": "topTenHighScore",
        "data": {"levelID": "14"}}, //my_g_level_id
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
        "data": {"levelID": "14"}}, //my_g_level_id
    function(callback) {
        var mySplitResult = callback.split("-");

        var div = document.getElementById('right-box');
        for (var i = 0; i < mySplitResult.length; i += 2) {
			my_jar_list.push( mySplitResult[i + 1]);
            div.innerHTML = div.innerHTML + "<span><a onClick= 'displayReplayGame(\"" 
			+ (my_jar_list.length -1) + "\")'>" + mySplitResult[i] + "</a></span>";
        }
    });
}



