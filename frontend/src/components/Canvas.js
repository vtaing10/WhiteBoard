import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Backend server address

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

        // Listen for real-time draw events from the server
        socket.on("draw", ({ x, y, color, brushSize }) => {
            ctxRef.current.strokeStyle = color;
            ctxRef.current.lineWidth = brushSize;
            ctxRef.current.lineTo(x, y);
            ctxRef.current.stroke();
        });

        // Listen for clear board events
        socket.on("clear", () => {
            ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        });
    }, []);

    const startDrawing = (e) => {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.clientX, e.clientY);
        setDrawing(true);
    };

    const draw = (e) => {
        if (!drawing) return;
        ctxRef.current.lineTo(e.clientX, e.clientY);
        ctxRef.current.stroke();

        // Emit draw event to the server
        socket.emit("draw", {
            x: e.clientX,
            y: e.clientY,
            color,
            brushSize,
        });
    };

    const stopDrawing = () => {
        setDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

        // Emit clear event to the server
        socket.emit("clear");
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                style={{ border: "1px solid black" }}
            />
            <div>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} />
                <button onClick={clearCanvas}>Clear Board</button>
            </div>
        </div>
    );
};

