const SYMBOLS = [
    { name: 'wild', img: 'images/sym_wild.png', isHigh: true },
    { name: 'scatter', img: 'images/sym_scatter.png', isHigh: true },
    { name: 'pistol', img: 'images/sym_pistol.png', isHigh: true },
    { name: 'whiskey', img: 'images/sym_whiskey.png', isHigh: true },
    { name: 'hat', img: 'images/sym_hat.png', isHigh: true },
    { name: 'A', img: 'images/sym_a.png', isHigh: false },
    { name: 'K', img: 'images/sym_k.png', isHigh: false },
    { name: 'Q', img: 'images/sym_q.png', isHigh: false },
    { name: 'J', img: 'images/sym_j.png', isHigh: false }
];

const REEL_CONFIG =;
const MULTIPLIER_STEPS =;

let balance = 1000.00;
let bet = 2.00;
let currentMultiplierIndex = 0;
let isSpinning = false;
let isFreeSpinsMode = false;
let freeSpinsLeft = 0;

const reels = document.querySelectorAll('.reel');
const spinBtn = document.getElementById('spin-btn');
const balanceDisplay = document.getElementById('balance');
const betDisplay = document.getElementById('bet');
const slotGrid = document.getElementById('slot-grid');
const featureBuyBtn = document.getElementById('feature-buy-btn');
const featurePriceDisplay = document.getElementById('feature-price');

function initGame() {
    reels.forEach((reel, index) => {
        const rows = REEL_CONFIG[index];
        reel.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            reel.appendChild(createSymbolElement(getRandomSymbol()));
        }
    });
    spinBtn.innerText = '↻'; // শুরুর আইকন
    updateFeatureBuyPrice();
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function createSymbolElement(symbolData) {
    const div = document.createElement('div');
    div.className = 'symbol';
    div.dataset.name = symbolData.name;
    
    const img = document.createElement('img');
    img.src = symbolData.img;
    img.alt = symbolData.name;
    
    div.appendChild(img);
    return div;
}

function updateFeatureBuyPrice() {
    featureBuyBtn.innerHTML = `FEATURE BUY <br><span style="font-size:0.75rem; color:#ffd700;">Tk ${(bet * 75).toFixed(2)}</span>`;
}

async function spin() {
    if (isSpinning) return;
    
    if (!isFreeSpinsMode) {
        if (balance < bet) {
            alert("ব্যালেন্স নেই!");
            return;
        }
        balance -= bet;
        balanceDisplay.innerText = `Tk ${balance.toFixed(2)}`;
    }

    isSpinning = true;
    spinBtn.classList.add('spinning'); // বাটন ঘোরানো শুরু
    spinBtn.innerText = '↻';
    
    currentMultiplierIndex = 0;
    updateMultiplierUI();

    let spinPromises = Array.from(reels).map((reel, index) => {
        return new Promise((resolve) => {
            let cycles = 0;
            let interval = setInterval(() => {
                reel.innerHTML = '';
                for (let i = 0; i < REEL_CONFIG[index]; i++) {
                    reel.appendChild(createSymbolElement(getRandomSymbol()));
                }
                cycles++;
                if (cycles > 10 + index * 2) {
                    clearInterval(interval);
                    resolve();
                }
            }, 60);
        });
    });

    await Promise.all(spinPromises);
    checkWinAndCascade();
}

featureBuyBtn.addEventListener('click', () => {
    if (isSpinning || isFreeSpinsMode) return;
    let cost = bet * 75;
    if (balance < cost) {
        alert("ব্যালেন্স নেই!");
        return;
    }
    balance -= cost;
    balanceDisplay.innerText = `Tk ${balance.toFixed(2)}`;
    
    isFreeSpinsMode = true;
    freeSpinsLeft = 10;
    slotGrid.classList.add('free-spins-active');
    setTimeout(spin, 1000);
});

async function checkWinAndCascade() {
    let hasWin = false;
    
    reels.forEach((reel) => {
        const symbols = reel.querySelectorAll('.symbol');
        let counts = {};
        symbols.forEach(s => counts[s.dataset.name] = (counts[s.dataset.name] || 0) + 1);
        
        symbols.forEach(s => {
            const name = s.dataset.name;
            if (counts[name] >= 2 && name !== 'A' && name !== 'J') {
                s.classList.add('pop');
                hasWin = true;
            }
        });
    });

    if (hasWin) {
        let activeMultiplier = MULTIPLIER_STEPS[currentMultiplierIndex];
        balance += bet * activeMultiplier * 1.8;
        balanceDisplay.innerText = `Tk ${balance.toFixed(2)}`;
        
        if (currentMultiplierIndex < MULTIPLIER_STEPS.length - 1) {
            currentMultiplierIndex++;
        }
        
        await new Promise(r => setTimeout(r, 400));
        
        reels.forEach((reel, index) => {
            reel.querySelectorAll('.symbol.pop').forEach(p => p.remove());
            const needed = REEL_CONFIG[index] - reel.querySelectorAll('.symbol').length;
            for (let i = 0; i < needed; i++) {
                reel.insertBefore(createSymbolElement(getRandomSymbol()), reel.firstChild);
            }
        });
        
        updateMultiplierUI();
        setTimeout(checkWinAndCascade, 400);
    } else {
        if (isFreeSpinsMode) {
            freeSpinsLeft--;
            if (freeSpinsLeft > 0) {
                setTimeout(spin, 800);
            } else {
                isFreeSpinsMode = false;
                slotGrid.classList.remove('free-spins-active');
                spinBtn.classList.remove('spinning'); // বাটন ঘোরানো বন্ধ
                spinBtn.innerText = '↻';
                isSpinning = false;
                alert("ফ্রি স্পিন শেষ!");
            }
        } else {
            isSpinning = false;
            spinBtn.classList.remove('spinning'); // বাটন ঘোরানো বন্ধ
            spinBtn.innerText = '↻';
        }
    }
}

function updateMultiplierUI() {
    document.querySelectorAll('.multiplier-bar span').forEach(el => el.classList.remove('active'));
    const activeM = document.getElementById(`m${MULTIPLIER_STEPS[currentMultiplierIndex]}`);
    if (activeM) activeM.classList.add('active');
}

document.getElementById('plus-btn').addEventListener('click', () => {
    if (!isSpinning && !isFreeSpinsMode) {
        bet += 2;
        betDisplay.innerText = `Tk ${bet.toFixed(2)}`;
        updateFeatureBuyPrice();
    }
});

document.getElementById('minus-btn').addEventListener('click', () => {
    if (!isSpinning && !isFreeSpinsMode && bet > 2) {
        bet -= 2;
        betDisplay.innerText = `Tk ${bet.toFixed(2)}`;
        updateFeatureBuyPrice();
    }
});

spinBtn.addEventListener('click', () => {
    if (!isFreeSpinsMode) spin();
});

initGame();
