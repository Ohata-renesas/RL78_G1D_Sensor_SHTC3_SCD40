(function() {
    'use strict';

    class DrawCanvas {
        constructor() {}
    
        calculateWidth(canvas) {
            if (canvas) {
                // slice(0, -2) => remove unit[px]
                return parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }
    
        calculateHeight(canvas) {
            if (canvas) {
                // slice(0, -2) => remove unit[px]
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
    
        drawCircle(context, x, y, radius) {
            if (context) {         
                context.beginPath();       
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.stroke();
            }
            else {
                console.log("Context is not set.");
            }
        }
          
        drawArc(context, x, y, radius, startAngle, endAngle) {
            if (context) {
                context.beginPath();
                context.arc(x, y, radius, startAngle, endAngle);
                context.stroke();
            }
            else {
                console.log("Context is not set.");
            }

        }
          
        drawLine(context, startX, startY, endX, endY) {
            if (context) {
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.stroke();
            }
            else {
                console.log("Context is not sest.");
            }
        }
        
        drawPoint(context, x, y, radius) {
            if (context) {
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI* 2);
                context.fill();
            }
            else {
                console.log("Context is not set.");
            }
        }
        
        clearCanvas(context, width, height) {
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


