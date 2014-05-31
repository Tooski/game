

function leaderBoardButtonAction() {
    document.getElementById('left-box').innerHTML = null;
    
    game.settings.get({"command": "topTenHighScore",
        "data": {"levelID": "14"}},
    function(callback) {

        var mySplitResult = callback.split("-");

         var div = document.getElementById('left-box');
        for(var i =0; i< mySplitResult.length;i++){
             div.innerHTML = div.innerHTML + "<span>"+mySplitResult[i]+"</span>";
        }      
        //div.appendChild(spanTag); 
    });




    game.settings.get({"command": "topTenTime",
        "data": {"levelID": "14"}},
    function(callback) {
        var mySplitResult = callback.split("-");

         var div1 = document.getElementById('right-box');
        for(var i =0; i< mySplitResult.length;i++){
             div1.innerHTML = div1.innerHTML + "<span>"+mySplitResult[i]+"</span>";
        }      
    });
    //displayWorldMap();


}
;


