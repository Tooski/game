<html>
    <head>
        <style> 

            * { margin:0; padding:0;   overflow: hidden; } /* to remove the top and left whitespace */
            html, body { width:100%; height:100%; } /* just to be sure these are full screen*/
            canvas { display:block; } /* To remove the scrollbars */
        </style>
        <link rel="stylesheet" type="text/css" href="css/login.css">
        <link rel="stylesheet" type="text/css" href="css/leaderboard.css">
        <link rel="stylesheet" type="text/css" href="css/about.css">
        <meta charset="utf-8" />
        <title>Game Project Shell</title>
        <script type="text/javascript" src="./canvasinput.min.js"></script>
        <script type="text/javascript" src="./minheap.js"></script>
        <script type="text/javascript" src="./jquery-1.11.0.min.js"></script>
        <script type="text/javascript" src="./canvasfactory.js"></script>
        <script type="text/javascript" src="./settings.js"></script>
        <script type="text/javascript" src="./entity.js"></script>
        <script type="text/javascript" src="./timer.js"></script>
        <script type="text/javascript" src="./animation.js"></script>
        <script type="text/javascript" src="./vec2.js"></script>
        <script type="text/javascript" src="./mousecollision.js"></script>
        <script type="text/javascript" src="./menu.js"></script>
        <script type="text/javascript" src="./event.js"></script>
        <script type="text/javascript" src="./collision.js"></script>
        <script type="text/javascript" src="./terrain.js"></script>
        <script type="text/javascript" src="./terrainmanager.js"></script>
        <script type="text/javascript" src="./physMath.js"></script>
        <script type="text/javascript" src="./physics.js"></script>
        <script type="text/javascript" src="./gamepad.js"></script>
        <script type="text/javascript" src="./unit.js"></script>
        <script type="text/javascript" src="./player.js"></script>
        <script type="text/javascript" src="./save.js"></script>
        <script type="text/javascript" src="./load.js"></script>
        <script type="text/javascript" src="./mapeditor.js"></script>
        <script type="text/javascript" src="./remapping.js"></script>
        <script type="text/javascript" src="./game.js"></script>
        <script type="text/javascript" src="./stageBoard.js"></script>
        <script type="text/javascript" src="./gameMainManu.js"></script>
        <script type="text/javascript" src="./controlDisplay.js"></script>
        <script type="text/javascript" src="./logInBoard.js"></script>
        <script type="text/javascript" src="./leaderBoard.js"></script>
    </head>
    <body>
        <!--       <div>
                    <form action="result.php" method="post">
                        <label for="username">User name</label>
                        <input type="text" name="username" id="username" value="username"/>
                        <label for="password">Password</label>
                        <input type="text" name="password" id="password" value="password"/>
                        <input type="submit" value="submit"/>
                    </form>
                </div>-->

        <!--<canvas id="gameWorld" style="position:absolute; display : block; border: 0px solid brown; z-index: 1; background: white"></canvas>
                <canvas id="time" style="position:absolute; z-index: 2;  left:1150px; top:25px; background: white" height="50px" width="100px"></canvas>
                <canvas id="score" style="position:absolute; z-index: 2;  left:25px; top:25px; background: white" height="50px" width="100px"></canvas>
                <canvas id="pause" style="position:absolute; z-index: 2; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
                <canvas id="remap" style="position:absolute; z-index: 3; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
                <!--<canvas id="time" style="z-index: 2; background: red"></canvas> -->


        <canvas id="time" style= "display : none; position:absolute; z-index: 2;  left:1150px; top:25px; background: white" height="50px" width="100px"></canvas>
        <canvas id="score" style="display : none; position:absolute; z-index: 2;  left:25px; top:25px; background: white" height="50px" width="100px"></canvas>
        <canvas id="pause" style="display : none; position:absolute; z-index: 2; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
        <canvas id="remap" style="display : none; position:absolute; z-index: 3; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>

      <div>
            <script src="classie.js"></script>
            <canvas id="gameWorld" style="border: 0px solid brown; background: white; display : none"></canvas>

            <canvas id="game_manu_board" style= "display : none; position: absolute; " width="400" height="350"></canvas>
            <canvas id="stage_board" style= "display : none; position: absolute; " width="400" height="350"></canvas>
        </div>

        <!--div for login-->
         <div class="outer-container" id="login_board" style= "display : block">
            <form name="input" action="settings.php" method="post">
                <div class="inner-top">
                    <label for="username">Name</label>
                    <input type="text" name="username" id="username" value="donkey"><br>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" value="ferter"><br>

                </div>
                <div class="inner-bottom">
                    <input type="button" id="login_button" onClick= "logInButtonAction()" >
                </div>
            </form>  
        </div> 		
        <!--end of div for login-->
        
        <!--div for leader board-->
        <div class="outer-leaderboard-container" id="leader_board">
            <div class="title-container" id="title_container">
            </div>
            <div class="sub-title-container" id="sub-title-container">
                <div class ="left-sub-title" id="left-sub-title">
                </div>
                <div class ="right-sub-title" id="right-sub-title">
                </div>
            </div>
            <div class="body-container">
                <div class="left-box" id="left-box">
                </div>
                <div class="right-box" id="right-box">

                </div>

            </div>
            <div class="footer-container">
                <button type="button" id="exit_button" onClick= "leaderBoardButtonAction()" ></button>             
            </div>
        </div>
        <!--end of div for leader board-->
        <!--div for about page-->
        <div class="outer-about-container" id="about_board"  style= "display : none">
            <div class="inner-about-title">
                About Hamster Storm
            </div>
            <div class ="inner-about-container">

            </div>
            <div class="inner-about-footer">
                <button type="button" id="exit_about_button" onClick= "displayMainMenu()"></button>
            </div>
        </div>
        <!--end of div for about page-->
    </body>
</html>
