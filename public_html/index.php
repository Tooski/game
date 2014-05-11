
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
    <script type="text/javascript" src="./jquery-1.11.0.min.js"></script>
    <script type="text/javascript" src="./settings.js"></script>
    <script type="text/javascript" src="./entity.js"></script>
    <script type="text/javascript" src="./timer.js"></script>
    <script type="text/javascript" src="./animation.js"></script>
    <script type="text/javascript" src="./vec2.js"></script>
    <script type="text/javascript" src="./mousecollision.js"></script>
    <script type="text/javascript" src="./menu.js"></script>
    <script type="text/javascript" src="./event.js"></script>
    <script type="text/javascript" src="./collision.js"></script>
    <script type="text/javascript" src="./physicsOLD.js"></script>
    <script type="text/javascript" src="./gamepad.js"></script>
    <script type="text/javascript" src="./terrain.js"></script>
    <script type="text/javascript" src="./unit.js"></script>
    <script type="text/javascript" src="./player.js"></script>
    <script type="text/javascript" src="./save.js"></script>
    <script type="text/javascript" src="./load.js"></script>
    <script type="text/javascript" src="./terrainmanager.js"></script>
    <script type="text/javascript" src="./mapeditor.js"></script>
    <script type="text/javascript" scr="./remapping.js"></script>
    <script type="text/javascript" src="./game.js"></script>

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

        <canvas id="gameWorld" style="position:absolute; border: 0px solid brown; z-index: 1; background: white"></canvas>
		<canvas id="time" style="position:absolute; z-index: 2;  left:1150px; top:25px; background: white" height="50px" width="100px"></canvas>
		<canvas id="score" style="position:absolute; z-index: 2;  left:25px; top:25px; background: white" height="50px" width="100px">
		<!--<canvas id="time" style="z-index: 2; background: red"></canvas>-->
</body>
</html>
