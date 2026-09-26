let balance = 1000;
let bet = 10;

const symbols = [
    "🤠",
    "💰",
    "🐎",
    "⭐",
    "🔫",
    "💎",
    "🌵"
];

const reels =
    document.getElementById("reels");

const balanceEl =
    document.getElementById("balance");

const betEl =
    document.getElementById("bet");

const msg =
    document.getElementById("msg");

const spinBtn =
    document.getElementById("spin");


function draw() {

    reels.innerHTML = "";

    for (let i = 0; i < 15; i++) {

        let reel =
            document.createElement("div");

        reel.className = "reel";

        reel.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        reels.appendChild(reel);
    }
}


function updateUI() {

    balanceEl.textContent =
        balance;

    betEl.textContent =
        bet;
}


function betChange(amount) {

    bet += amount;

    if (bet < 10) {
        bet = 10;
    }

    if (bet > 100) {
        bet = 100;
    }

    updateUI();
}


function spin() {

    if (balance < bet) {

        msg.textContent =
            "NOT ENOUGH VIRTUAL CREDITS";

        return;
    }

    balance -= bet;

    updateUI();

    spinBtn.disabled = true;

    msg.textContent =
        "SPINNING…";


    let animation =
        setInterval(
            draw,
            70
        );


    setTimeout(() => {

        clearInterval(animation);

        draw();


        let results = [];

        document
            .querySelectorAll(".reel")
            .forEach(reel => {

                results.push(
                    reel.textContent
                );

            });


        let counts = {};

        results.forEach(symbol => {

            counts[symbol] =
                (counts[symbol] || 0) + 1;

        });


        let highest =
            Math.max(
                ...Object.values(counts)
            );


        let multiplier = 0;


        if (highest >= 5) {

            multiplier = 10;

        } else if (highest >= 4) {

            multiplier = 5;

        } else if (highest >= 3) {

            multiplier = 2;

        }


        let win =
            bet * multiplier;


        if (win > 0) {

            balance += win;

            msg.textContent =
                "WIN +৳ " +
                win +
                " VIRTUAL";

        } else {

            msg.textContent =
                "NO WIN";

        }


        updateUI();

        spinBtn.disabled = false;

    }, 900);
}


draw();

updateUI();
