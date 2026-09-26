const SYMBOLS = ['🤠', '🪙', '🔫', '🍾', 'A', 'K', 'Q', 'J'];
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
    updateFeatureBuyPrice();
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function createSymbolElement(sym) {
    const div = document.createElement('div');
    div.className = 'symbol';
    div.innerText = sym;
    return div;
}

function updateFeatureBuyPrice() {
    featurePriceDisplay.innerText = `Tk ${(bet * 75).toFixed(2)}`;
}

async function spin() {
    if (isSpinning) return;
    
    if (!isFreeSpinsMode) {
        if (balance < bet) {
            alert("পর্যাপ্ত ব্যালেন্স নেই!");
            return;
        }
        balance -= bet;
        balanceDisplay.innerText = `Tk ${balance.toFixed(2)}`;
    }

    isSpinning = true;
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
        alert("ফিচার কেনার জন্য পর্যাপ্ত ব্যালেন্স নেই!");
        return;
    }
    balance -= cost;
    balanceDisplay.innerText = `Tk ${balance.toFixed(2)}`;
    
    isFreeSpinsMode = true;
    freeSpinsLeft = 10;
    slotGrid.classList.add('free-spins-active');
    spinBtn.innerText = `🎁 ${freeSpinsLeft}`;
    setTimeout(spin, 1000);
});

async function checkWinAndCascade() {
    let hasWin = false;
    
    reels.forEach((reel) => {
        const symbols = reel.querySelectorAll('.symbol');
        let counts = {};
        symbols.forEach(s => counts[s.innerText] = (counts[s.innerText] || 0) + 1);
        
        symbols.forEach(s => {
            if (counts[s.innerText] >= 2 && (s.innerText === '🤠' || s.innerText === '🪙' || s.innerText === '🔫')) {
                s.classList.add('pop');
                hasWin = true;
            }
        });
    });

    if (hasWin) {
        let activeMultiplier = MULTIPLIER_STEPS[currentMultiplierIndex];
        let winAmount = bet * activeMultiplier * 2;
        balance += winAmount;
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
                spinBtn.innerText = `🎁 ${freeSpinsLeft}`;
                setTimeout(spin, 800);
            } else {
                isFreeSpinsMode = false;
                slotGrid.classList.remove('free-spins-active');
                spinBtn.innerText = '🔥';
                isSpinning = false;
                alert("ফ্রি স্পিন শেষ!");
            }
        } else {
            isSpinning = false;
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
