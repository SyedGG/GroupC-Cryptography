const char_A = 'A'.charCodeAt(0);
const char_a = 'a'.charCodeAt(0);

// Helper to get substitution map
function getSubstitutions(key) {
    const cleanKey = key.replace(/[^A-Z]/g, '');
    return (cleanKey + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        .split('')
        .filter((c, i, arr) => arr.indexOf(c) === i);
}

// Core crypto functions
function encrypt(text, key) {
    const substitutions = getSubstitutions(key);
    return text
        .replace(/[A-Z]/g, letter => substitutions[letter.charCodeAt(0) - char_A])
        .replace(/[a-z]/g, letter => substitutions[letter.charCodeAt(0) - char_a].toLowerCase());
}

function decrypt(text, key) {
    const substitutions = getSubstitutions(key);
    return text
        .replace(/[A-Z]/g, letter => {
            const index = substitutions.indexOf(letter);
            return index !== -1 ? String.fromCharCode(char_A + index) : letter;
        })
        .replace(/[a-z]/g, letter => {
            const index = substitutions.indexOf(letter.toUpperCase());
            return index !== -1 ? String.fromCharCode(char_a + index) : letter;
        });
}

// UI Triggers
function triggerEncrypt() {
    const plainText = document.getElementById('plain-text').value;
    const key = document.getElementById('key-input').value.toUpperCase();
    const result = encrypt(plainText, key);
    
    runMatrixEffect('cipher-canvas', 'cipher-text', result);
}

function triggerDecrypt() {
    const cipherText = document.getElementById('cipher-text').value;
    const key = document.getElementById('key-input').value.toUpperCase();
    const result = decrypt(cipherText, key);
    
    runMatrixEffect('plain-canvas', 'plain-text', result);
}

// Key input handler (just cleans input)
function updateFromKey() {
    const keyInput = document.getElementById('key-input');
    keyInput.value = keyInput.value.replace(/[^a-z]/gi, '').toUpperCase();
}

// Animation Logic
function runMatrixEffect(canvasId, textareaId, finalText) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const textarea = document.getElementById(textareaId);
    
    // Setup canvas
    // We need to set the internal resolution to match the display size
    const rect = textarea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Matrix Rain Config
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    for(let i = 0; i < columns; i++) drops[i] = 1;
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    
    let frameCount = 0;
    const maxFrames = 120; // Run for about 2 seconds
    
    // Clear textarea initially so we don't see text behind the semi-transparent rain
    textarea.value = "";
    
    function draw() {
        // Semi-transparent black to create trail effect
        // We use a dark brown/black to match the theme slightly better or just pure black for Matrix feel
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#0F0"; // Green text
        ctx.font = fontSize + "px monospace";
        
        for(let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975)
                drops[i] = 0;
            
            drops[i]++;
        }
        
        frameCount++;
        if (frameCount < maxFrames) {
            requestAnimationFrame(draw);
        } else {
            // Clear canvas and start text reveal
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            animateTextReveal(textarea, finalText);
        }
    }
    
    draw();
}

function animateTextReveal(element, finalText) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let iterations = 0;
    
    // If text is very long, speed up
    const speed = finalText.length > 100 ? 2 : 1/2;
    
    const interval = setInterval(() => {
        element.value = finalText
            .split("")
            .map((letter, index) => {
                if(index < iterations) {
                    return finalText[index];
                }
                // Preserve newlines/spaces to avoid jumping
                if (letter === ' ' || letter === '\n') return letter;
                
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        if(iterations >= finalText.length) {
            clearInterval(interval);
            element.value = finalText; // Ensure final result is exact
        }
        
        iterations += speed; 
    }, 30);
}
