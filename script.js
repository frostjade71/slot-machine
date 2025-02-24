const symbols = ["♠️", "♥️", "♦️", "♣️", "K", "Q", "J"];

const payoutMultipliers = {
    "♠️": 1.2,
    "♥️": 1.5,
    "♦️": 2,
    "♣️": 3,
    "K": 6,
    "Q": 4,
    "J": 3
};

const winChances = {
    "♠️": {5: 1},  
    "♥️": {5: 1},  
    "♦️": {5: 0.8},  
    "♣️": {5: 0.5},  
    "K": {5: 0.2},  
    "Q": {5: 0.3},  
    "J": {5: 0.4}   
};

const rows = 4;
const cols = 5;
let grid = [];
let balance = 100;

const balanceText = document.getElementById("balance");
const betInput = document.getElementById("betAmount");
const resultText = document.getElementById("result");
const winDetailsText = document.getElementById("winDetails");

const spinButton = document.getElementById("spinButton");

function updateBalance() {
    balanceText.innerText = `Balance: ${balance.toFixed(2)}`;
}

function getRandomSymbol() {
    if (Math.random() < 0.97) {  
        return symbols[Math.floor(Math.random() * symbols.length)];
    } else {
        let totalWeight = 0;
        let weightedSymbols = [];

        for (let symbol in winChances) {
            let weight = winChances[symbol][5] || 0.1;
            totalWeight += weight;
            weightedSymbols.push({ symbol, weight });
        }

        let random = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (let item of weightedSymbols) {
            cumulativeWeight += item.weight;
            if (random < cumulativeWeight) {
                return item.symbol;
            }
        }
    }

    return symbols[Math.floor(Math.random() * symbols.length)];
}

function createGrid() {
    const slotMachine = document.getElementById("slotMachine");
    slotMachine.innerHTML = "";
    grid = [];

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let symbol = getRandomSymbol();
            row.push(symbol);
            let div = document.createElement("div");
            div.classList.add("card");
            div.innerText = symbol;
            div.dataset.row = r;
            div.dataset.col = c;
            slotMachine.appendChild(div);
        }
        grid.push(row);
    }
}

function spin() {
    let bet = parseFloat(betInput.value);

    if (bet > balance) {
        resultText.innerText = "Not enough balance!";
        return;
    }

    balance -= bet;
    updateBalance();

    let audio = new Audio("coinhandle.wav");
    audio.play();

    document.querySelectorAll(".card").forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = "translateY(100px)";
            card.style.opacity = "0";
        }, index * 50);
    });

    setTimeout(refillGrid, 500);
}

function refillGrid() {
    const slotMachine = document.getElementById("slotMachine");
    slotMachine.innerHTML = "";
    grid = [];

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let symbol = getRandomSymbol();
            row.push(symbol);
            let div = document.createElement("div");
            div.classList.add("card");
            div.innerText = symbol;
            div.dataset.row = r;
            div.dataset.col = c;
            div.style.opacity = "0";
            div.style.transform = "translateY(-100px)";
            slotMachine.appendChild(div);
        }
        grid.push(row);
    }

    document.querySelectorAll(".card").forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 50);
    });

    setTimeout(checkWin, 700);
}

function checkWin() {
    let bet = parseFloat(betInput.value);
    let totalMultiplier = 0;
    let winningSymbols = [];
    let soundPlayed = false;

    let symbolCounts = {};
    document.querySelectorAll(".card").forEach((card) => {
        let symbol = card.innerText;
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });

    for (let symbol in payoutMultipliers) {
        let count = symbolCounts[symbol] || 0;
        if (count === 5) {
            let baseMultiplier = payoutMultipliers[symbol];
            totalMultiplier += baseMultiplier;
            winningSymbols.push(`${symbol} x5 (${baseMultiplier}x)`);
            
            document.querySelectorAll(".card").forEach((card) => {
                if (card.innerText === symbol) {
                    card.classList.add("glowing");
                }
            });

            if (!soundPlayed) {
                let winAudio = new Audio("winningcoin.wav");
                winAudio.play();
                soundPlayed = true;
            }
        }
    }

    let totalWin = bet * totalMultiplier;
    if (totalWin > 0) {
        balance += totalWin;
        resultText.innerText = `You won: ${totalWin.toFixed(2)}`;
        winDetailsText.innerText = `Winning symbols: ${winningSymbols.join(", ")}`;
    } else {
        resultText.innerText = "No win, try again!";
        winDetailsText.innerText = "";
    }

    updateBalance();
}

spinButton.addEventListener("click", spin);
updateBalance();
createGrid();
