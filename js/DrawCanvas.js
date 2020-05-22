(function() {
    'use strict';

    class DrawCanvas {
        constructor() {
            this.canvas         = null;
            this.context        = null;
            this.canvasWidth    = 0;
            this.canvasHeight   = 0;
        }

        setCanvas(canvas) {
            this.canvas = canvas;
        }

        setContext(context) {
            this.context = context;
            this.context.textAlign = "center";
        }
    
        getWidth() {
            if (this.canvas) {
                // slice(0, -2)で単位のpxを削除
                this.canvasWidth = parseInt(getComputedStyle(this.canvas).width.slice(0, -2)) * devicePixelRatio;
                return this.canvasWidth;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }
    
        getHeight() {
            if (this.canvas) {
                // slice(0, -2)で単位のpxを削除
                this.canvasHeight = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
                return this.canvasHeight;
            } 
            else {
                console.log("Canvas is not set.");
            }
        }

        drawText(text, x, y, fontSize) {
            if (this.context) {
                this.context.font = fontSize + "px" + " " + "sans-serif";
                this.context.fillText(text, x, y);
            }
            else {
                console.log("Context is not set.");
            }
        }
    
        drawCircle(x, y, r) {
            if (this.context) {
                this.context.arc(x, y, r, 0, Math.PI * 2);
                this.context.stroke();
            }
            else {
                console.log("Context is not set.");
            }
        }
          
        drawArc(x, y, r, startAngle, endAngle) {
            if (this.context) {
                this.context.arc(x, y, r, startAngle, endAngle);
                this.context.stroke();
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
            if (this.context) {
                this.context.clearRect(x, y, width, height);
            }
            else {
                console.log("Context is not set.");
            }            
        }
        
        clearAllFigure() {
            if (this.context) {
                this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            }
            else {
                console.log("Context is not set.");
            }            
        }
    }
    
    window.drawCanvas = new DrawCanvas();

})();


