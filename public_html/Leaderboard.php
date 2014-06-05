<html>
    <head>
        <style> 
            /*           */
            * { margin:0; padding:0;   overflow: hidden; } /* to remove the top and left whitespace */ 
            html, body { width:100%; height:100%; } /* just to be sure these are full screen*/ 
            canvas { display:block; } /* To remove the scrollbars */ 
            #eklipzConsole { margin-left: 200px; z-index: 9999; }
			#leader_board { display:block;
							border: 5px blue solid;
							min-width:425px;
							display: block;
							position:absolute;
							z-index:15;
							top:50%;
							left:50%;
							margin:-250px 0 0 -200px;
							overflow: hidden;
							padding-right: 10px;
							padding-left: 10px;
							padding-top: 40px;
							padding-bottom: 10px;
							border-radius: 5px;
							background: -webkit-linear-gradient(#3498db, #8ac6ed,#8ac6ed,#3498db,blue); /* For Safari 5.1 to 6.0 */
							background: -o-linear-gradient(#3498db, #8ac6ed,#8ac6ed,#3498db,blue); /* For Opera 11.1 to 12.0 */
							background: -moz-linear-gradient(#3498db, #8ac6ed,#8ac6ed,#3498db,blue); /* For Firefox 3.6 to 15 */
							background: linear-gradient(#3498db, #8ac6ed, #8ac6ed,#3498db,blue); /* Standard syntax */}
        </style>


        <link rel="stylesheet" type="text/css" href="css/login.css">
        <link rel="stylesheet" type="text/css" href="css/leaderboard.css">
        <link rel="stylesheet" type="text/css" href="css/about.css">
        <link rel="stylesheet" type="text/css" href="css/signup.css">
        <link rel="stylesheet" type="text/css" href="css/login_signup.css">
        <link rel="stylesheet" type="text/css" href="css/exit_button.css">
        <link rel="stylesheet" type="text/css" href="css/sign_up_button.css">
        <link href='http://fonts.googleapis.com/css?family=Audiowide' rel='stylesheet' type='text/css'>
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
        <script type="text/javascript" src="./CONSTANTS.js"></script>
        <script type="text/javascript" src="./mousecollision.js"></script>
        <script type="text/javascript" src="./menu.js"></script>
        <script type="text/javascript" src="./gamepad.js"></script>
        <script type="text/javascript" src="./unit.js"></script>
        <script type="text/javascript" src="./player.js"></script>
        <script type="text/javascript" src="./save.js"></script>
        <script type="text/javascript" src="./load.js"></script>
        <script type="text/javascript" src="./remapping.js"></script>
        <script type="text/javascript" src="./controlDisplay.js"></script>
        <script type="text/javascript" src="./leaderBoard.js"></script>
        <script type="text/javascript" src="./signUpBoard.js"></script>
		<script type="text/javascript" src="./choiceBoard.js"></script>
		<script type="text/javascript" src="./gameOver.js"></script>
    </head>
    <body>
        <pre id="eklipzConsole"></pre>
<!--<canvas id="gameWorld" style="position:absolute; display : block; border: 0px solid brown; z-index: 1; background: white"></canvas>
<canvas id="time" style="position:absolute; z-index: 2;  left:1150px; top:25px; background: white" height="50px" width="100px"></canvas>
<canvas id="score" style="position:absolute; z-index: 2;  left:25px; top:25px; background: white" height="50px" width="100px"></canvas>
<canvas id="pause" style="position:absolute; z-index: 2; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
<canvas id="remap" style="position:absolute; z-index: 3; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
<!--<canvas id="time" style="z-index: 2; background: red"></canvas> -->





        <!--div for leader board-->
        <div id="leader_board">
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
        </div>
        <!--end of div for leader board-->
        
     
    </body>
</html>
