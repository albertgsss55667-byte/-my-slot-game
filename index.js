const SYMBOLS = ['🤠', '🪙', '🔫', '🍾', '🎩', 'A', 'K', 'Q', 'J'];
const REEL_CONFIG =;
let balance = 1000.00, bet = 2.00, isSpin = false;
const reels = document.querySelectorAll('.reel'), spinBtn = document.getElementById('spin-btn'), balanceDisplay = document.getElementById('balance'), betDisplay = document.getElementById('bet');

function initGame() {
    reels.forEach((reel, idx) => { 
        reel.innerHTML = ''; 
        for (let i = 0; i < REEL_CONFIG[idx]; i++) { 
            const div = document.createElement('div'); 
            div.className = 'symbol'; 
            div.innerText = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; 
            reel.appendChild(div); 
        } 
    });
    isSpin = false;
}

async function spin() {
    if (isSpin) return; 
    if (balance < bet) { alert("ব্যালেন্স নেই!"); return; }
    isSpin = true; 
    balance -= bet; 
    balanceDisplay.innerText = "Tk " + balance.toFixed(2);
    let ticks = 0;
    let interval = setInterval(() => {
        reels.forEach((reel, idx) => { 
            reel.innerHTML = ''; 
            for (let i = 0; i < REEL_CONFIG[idx]; i++) { 
                const div = document.createElement('div'); 
                div.className = 'symbol'; 
                div.innerText = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; 
                reel.appendChild(div); 
            } 
        });
        ticks++; 
        if (ticks > 15) { clearInterval(interval); isSpin = false; }
    }, 60);
}

document.getElementById('plus-btn').addEventListener('click', () => { 
    if (!isSpin) { 
        bet += 2; 
        betDisplay.innerText = "Tk " + bet.toFixed(2); 
        document.getElementById('feature-price').innerText = "Tk " + (bet * 75).toFixed(2); 
    } 
});

document.getElementById('minus-btn').addEventListener('click', () => { 
    if (!isSpin && bet > 2) { 
        bet -= 2; 
        betDisplay.innerText = "Tk " + bet.toFixed(2); 
        document.getElementById('feature-price').innerText = "Tk " + (bet * 75).toFixed(2); 
    } 
});

spinBtn.addEventListener('click', spin);
window.onload = initGame;
initGame();
