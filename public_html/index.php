<html>
    <head>
        <style> 

            * { margin:0; padding:0;   overflow: hidden; } /* to remove the top and left whitespace */
            html, body { width:100%; height:100%; } /* just to be sure these are full screen*/
            canvas { display:block; } /* To remove the scrollbars */
        </style>
        <link rel="stylesheet" type="text/css" href="css/login.css">
        <link rel="stylesheet" type="text/css" href="css/leaderboard.css">
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


        <div class="outer-container" id="login_board">

            <form name="input" action="settings.php" method="post">
                <div class="inner-top">
                    <label for="username">Name</label>
                    <input type="text" name="username" id="username" value="donkey"><br>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" value="ferter"><br>

                </div>
                <div class="inner-bottom">
                    <input type="button" value="Enter" onClick= "logInButtonAction()" >
                </div>


            </form>  

        </div>
<div class="outer-leaderboard-container" id="leader_board">
            <div class="title-container">
                Top Times and Scores!!!
            </div>
            <div class="sub-title-container">
                <div class ="left-sub-title">
                    Level 1: Points
                </div>
                <div class ="right-sub-title">
                    Level 1: Times
                </div>
            </div>
            <div class="body-container">
                <div class="left-box" id="left-box">
<!--                    <span>1.  mike 234,000</span>
                    <span>2.  mike 234,000</span>
                    <span>3.  mike 234,000</span>
                    <span>4.  mike 234,000</span>
                    <span>5.  mike 234,000</span>
                    <span>6.  mike 234,000</span>
                    <span>7.  mike 234,000</span>
                    <span>8.  mike 234,000</span>
                    <span>9.  mike 234,000</span>
                    <span>10.  mike 234,000</span>
                    <span>11.  mike 234,000</span>
                    <span>12.  mike 234,000</span>
                    <span>13.  mike 234,000</span>
                    <span>14.  mike 234,000</span>
                    <span>15.  mike 234,000</span>
                    <span>16.  mike 234,000</span>
                    <span>17.  mike 234,000</span>
                    <span>18.  mike 234,000</span>
                    <span>19.  mike 234,000</span>
                    <span>20.  mike 234,000</span>-->
   
                </div>
                <div class="right_box" id="right-box">
<!--                    <span>1.  mike 22.4 seconds</span>
                    <span>2.  mike 22.4 seconds</span>
                    <span>3.  mike 22.4 seconds</span>
                    <span>4.  mike 22.4 seconds</span>
                    <span>5.  mike 22.4 seconds</span>
                    <span>6.  mike 22.4 seconds</span>
                    <span>7.  mike 22.4 seconds</span>
                    <span>8.  mike 22.4 seconds</span>
                    <span>9.  mike 22.4 seconds</span>
                    <span>10.  mike 22.4 seconds</span>
                    <span>11.  mike 22.4 seconds</span>
                    <span>12.  mike 22.4 seconds</span>
                    <span>13.  mike 22.4 seconds</span>
                    <span>14.  mike 22.4 seconds</span>
                    <span>15.  mike 22.4 seconds</span>
                    <span>16.  mike 22.4 seconds</span>
                    <span>17.  mike 22.4 seconds</span>
                    <span>18.  mike 22.4 seconds</span>
                    <span>19.  mike 22.4 seconds</span>
                    <span>20.  mike 22.4 seconds</span>-->
                </div>

            </div>
            <div class="footer-container">
                <button type="button" onClick= "leaderBoardButtonAction()" >Close</button>             
            </div>


        </div>

    </body>
</html>
