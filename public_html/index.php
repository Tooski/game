
<html>
<head>
<style> 
    
* { margin:0; padding:0;   overflow: hidden; } /* to remove the top and left whitespace */
html, body { width:100%; height:100%; } /* just to be sure these are full screen*/
canvas { display:block; } /* To remove the scrollbars */
</style>

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
		
		
	<canvas id="time" style= "display : block; position:absolute; z-index: 2;  left:1150px; top:25px; background: white" height="50px" width="100px"></canvas>
		<canvas id="score" style="display : none; position:absolute; z-index: 2;  left:25px; top:25px; background: white" height="50px" width="100px"></canvas>
		<canvas id="pause" style="display : none; position:absolute; z-index: 2; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>
		<canvas id="remap" style="display : none; position:absolute; z-index: 3; left:475px; top:125px; background: white; display: none" height="525" width="350"></canvas>

	<div>
				<script src="classie.js"></script>
		        <canvas id="gameWorld" style="border: 0px solid brown; background: white; display : none"></canvas>

		<canvas id="game_manu_board" style= "display : block" width="400" height="350"></canvas>
		<canvas id="stage_board" style= "display : none" width="400" height="350"></canvas>
	</div>
</body>
</html>
