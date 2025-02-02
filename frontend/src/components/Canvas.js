import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Replace with your backend URL

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxRef.current = canvas.getContext("2d");
        ctxRef.current.lineCap = "round";
    
        // Handle window resizing to keep the canvas updated
        const resizeCanvas = () => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCanvas.getContext("2d").drawImage(canvas, 0, 0);
    
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    
            ctxRef.current = canvas.getContext("2d");
            ctxRef.current.lineCap = "round";
            ctxRef.current.drawImage(tempCanvas, 0, 0);
        };
    
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);
    

    const startDrawing = (e) => {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.clientX, e.clientY);
        setDrawing(true);
    };

    const draw = (e) => {
        if (!drawing) return;
    
        // Update the drawing context dynamically with the new brush size
        ctxRef.current.strokeStyle = color;
        ctxRef.current.lineWidth = brushSize;
    
        ctxRef.current.lineTo(e.clientX, e.clientY);
        ctxRef.current.stroke();
    
        // Emit draw event with the updated brush size
        socket.emit("draw", { x: e.clientX, y: e.clientY, color, brushSize });
    };
    
    
    const stopDrawing = () => {
        setDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

        socket.emit("clear");
    };

    const setEraser = () => {
        setColor("#FFFFFF"); // Set eraser color to canvas background
    };

    return (
        <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 0, // Ensure canvas is below the controls
                }}
            />
            <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    style={{ marginRight: "10px" }}
                />
                <button onClick={clearCanvas} style={{ marginRight: "10px" }}>Clear Board</button>
                <button onClick={setEraser}>Eraser</button>
            </div>
        </div>
    );
    
    
};

export default Canvas;
