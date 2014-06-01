/**
 * Creates a canvas.
 * @param {type} canvasItems
 * @returns {CanvasFactory.canvas|Element}
 */
function CanvasFactory(canvasItems) {
  
    if(canvasItems.id) {
        var canvas = document.createElement('canvas');
        canvas.id         = canvasItems.id;
        canvas.width      = canvasItems.width || 0;
        canvas.height    = canvasItems.height || 0;
        canvas.style.left     = canvasItems.x || 0;
        canvas.style.top      = canvasItems.y || 0;
        canvas.style.zIndex   = canvasItems.z || 1;
        canvas.style.position = "absolute";
		//-- Min editted this line
		canvas.style.display = "none";
        //------
        if(canvasItems.isGUI !== false) {
            var selectedItem;
            canvas.addEventListener('mousedown', function(e) {
                selectedItem = collides( e.offsetX, e.offsetY);
                if (selectedItem && selectedItem.onClick) {
                    selectedItem.onClick(e);
                }
            }, false);
            canvas.addEventListener("mousemove", function(e){

                if (selectedItem && selectedItem.onDrag) {
                    selectedItem.onDrag(e);
                }
            }, false);
            canvas.addEventListener("mouseup", function(e){
                if (selectedItem && selectedItem.onRelease) {
                    selectedItem.onRelease(e);
                }
                selectedItem = null;
            }, false);
        }
        
        document.body.appendChild(canvas);
    }
    return canvas;
};
