
<!DOCTYPE html>
<html>
<head>
<style> 
    
* { margin:0; padding:0;   overflow: hidden; } /* to remove the top and left whitespace */
html, body { width:100%; height:100%; } /* just to be sure these are full screen*/
canvas { display:block; } /* To remove the scrollbars */
</style>
    <meta charset="utf-8" />
    <title>Game Project Shell</title>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script type="text/javascript" src="./settings.js"></script>
    <script type="text/javascript" src="./entity.js"></script>
    <script type="text/javascript" src="./vec2.js"></script>
    <script type="text/javascript" src="./mousecollision.js"></script>
    <script type="text/javascript" src="./collision.js"></script>
    <script type="text/javascript" src="./physics.js"></script>
    <script type="text/javascript" src="./gamepad.js"></script>
    <script type="text/javascript" src="./terrain.js"></script>
    <script type="text/javascript" src="./unit.js"></script>
    <script type="text/javascript" src="./player.js"></script>
    <script type="text/javascript" src="./mapeditor.js"></script>
    <script type="text/javascript" src="./game.js"></script>

</head>
<body>
    <canvas id="gameWorld" style="border: 0px solid brown; background: white"></canvas>
</body>
</html>
