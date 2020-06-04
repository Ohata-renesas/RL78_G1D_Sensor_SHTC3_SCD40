(function() {
    'use strict';

    /** Class that draw canvas */
    class DrawCanvas {
        constructor() {
            // nothing
        }
    
        /** Calcuate canvas width */
        calculateWidth(canvas) {
            if (canvas) {
                // slice(0, -2) => remove unit[px]
                return parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }
    
        /** Calculate canvas height */
        calculateHeight(canvas) {
            if (canvas) {
                // slice(0, -2) => remove unit[px]
                return parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }

        /** Draw a text */
        drawText(context, text, x, y, fontSize) {
            if (context) {
                context.font = fontSize + "px" + " " + "sans-serif";
                context.fillText(text, x, y);
            }
            else {
                console.log("Context is not set.");
            }
        }
    
        /** Draw a circle */
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
          
        /** Draw a arc */
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
          
        /** Draw a line */
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
        
        /** Draw a point */
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
        
        /** Clear canvas */
        clearCanvas(context, width, height) {
            if (context) {
                context.clearRect(0, 0, width, height);
            }
            else {
                console.log("Context is not set.");
            }            
        }
    }
    
    // Set class as window property
    window.drawCanvas = new DrawCanvas();

})();


