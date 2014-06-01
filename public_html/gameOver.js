function gameOver(the_score, the_time, the_jason, the_collect, the_num_death){
	
	
	
	
	
	
	// insert to to database.
	game.settings.post({"command": "insertScore",
            "data": {"userID": my_user_name, "levelID": my_g_level_id,
                "score": the_score, "completetime": the_time,"replay":the_jason}}, 
	//display..it.
	displayLeaderBoard();
	
}