// static/matrix_rain.js - The Matrix Rain Effect

const canvas = document.createElement('canvas');
const body = document.body;
body.appendChild(canvas);

// Canvas ko full screen set karna
const ctx = canvas.getContext('2d');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1'; // Main content ke pichhe rakhna

let W, H, maxColumns, fontSize = 20, drops;
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()'; // Code characters
const textColor = '#00ff41'; // Green color (Matrix color)

function initialize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    
    // Kitne columns honge (size/font size)
    maxColumns = Math.floor(W / fontSize);
    
    // Har column ki position track karne ke liye array
    drops = [];
    for (let i = 0; i < maxColumns; i++) {
        drops[i] = 1; // Start position
    }
}

// Har frame mein animation draw karna
function draw() {
    // Pichli frame ko thoda translucent black se dhakna (Rain effect)
    ctx.fillStyle = 'rgba(20, 30, 48, 0.05)'; // Background color se match karna
    ctx.fillRect(0, 0, W, H);
    
    ctx.fillStyle = textColor; // Text color green
    ctx.font = `${fontSize}px monospace`;
    
    // Har drop ko render karna
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(text, x, y);
        
        // Drop ko reset karna jab woh screen se neeche chala jaaye
        // Aur 1% chance hai ki woh reset ho
        if (y > H && Math.random() > 0.975) {
            drops[i] = 0;
        }
        
        // Drop ko neeche move karna
        drops[i]++;
    }
}

// Window resize hone par canvas ko adjust karna
window.addEventListener('resize', initialize);

initialize();
// Har 33ms mein draw function call karna (Approx 30 FPS)
setInterval(draw, 33);