/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function Vector2D(x,y,w) {
    this.x = x;
    this.y = y;
    this.w = w || 0;

}

Vector2D.prototype.toString = function()
{
    return "X: " + this.x + ", Y: " + this.y;
}