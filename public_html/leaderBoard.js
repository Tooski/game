


function leaderBoardButtonAction() {

    displayWorldMap();
    
}
function getJsonReplayString(){
    //call diplayReplayGame(str)
}



function leaderBoardUpdate(){
    var title = document.getElementById('title_container');
    var left = document.getElementById('left-sub-title');
    var right = document.getElementById('right-sub-title');
    
    title.innerHTML = "World " + my_g_stage_id + ", Top Times and Scores!!!";
    
    left.innerHTML = "Level "+ my_g_position_id+": Points";
    right.innerHTML = "Level "+ my_g_position_id+": Times";
    
    document.getElementById('left-box').innerHTML = null;
    document.getElementById('right-box').innerHTML = null;
    
    game.settings.get({"command": "topTenHighScore",
        "data": {"levelID": "14"}},//my_g_level_id
    function(callback) {

        var mySplitResult = callback.split("-");

         var div = document.getElementById('left-box');
        for(var i =0; i< mySplitResult.length;i+=2){
             div.innerHTML = div.innerHTML + "<a onClick= 'displayReplayGame("+mySplitResult[i+1]+")'><span>"+mySplitResult[i]+"</span></a>";
        }      
     
    });




    game.settings.get({"command": "topTenTime",
        "data": {"levelID": "14"}},//my_g_level_id
    function(callback) {
        var mySplitResult = callback.split("-");

         var div1 = document.getElementById('right-box');
        for(var i =0; i< mySplitResult.length;i+=2){
             div1.innerHTML = div1.innerHTML + "<a onClick= 'displayReplayGame("+mySplitResult[i+1]+")'><span>"+mySplitResult[i]+"</span></a>";
        }      
    });
}



