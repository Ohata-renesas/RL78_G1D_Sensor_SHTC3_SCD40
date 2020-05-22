(function() {
    'use strict';

    class DrawCanvas {
        constructor() {}
    
        getWidth(canvas) {
            if (canvas) {
                // slice(0, -2)で単位のpxを削除
                return parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }
    
        getHeight(canvas) {
            if (canvas) {
                // slice(0, -2)で単位のpxを削除
                return parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }

        drawText(context, text, x, y, fontSize) {
            if (context) {
                context.font = fontSize + "px" + " " + "sans-serif";
                context.fillText(text, x, y);
            }
            else {
                console.log("Context is not set.");
            }
        }
    
        drawCircle(context, x, y, r) {
            if (context) {         
                context.beginPath();       
                context.arc(x, y, r, 0, Math.PI * 2);
                context.stroke();
            }
            else {
                console.log("Context is not set.");
            }
        }
          
        drawArc(context, x, y, r, startAngle, endAngle) {
            if (context) {
                context.beginPath();
                context.arc(x, y, r, startAngle, endAngle);
                context.stroke();
            }
            else {
                console.log("Context is not set.");
            }

        }
          
        drawLine(x0, y0, x1, y1) {
            
        
        }
        
        drawLineWithDot(x0, y0, x1, y1) {
        
        }
        
        clearEachFigure(x, y, width, height) {
            if (context) {
                context.clearRect(x, y, width, height);
            }
            else {
                console.log("Context is not set.");
            }            
        }
        
        clearAllFigure(context, width, height) {
            if (context) {
                context.clearRect(0, 0, width, height);
            }
            else {
                console.log("Context is not set.");
            }            
        }
    }
    
    window.drawCanvas = new DrawCanvas();

})();


