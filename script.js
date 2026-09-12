const dice = [
    document.getElementById("dice1"),
    document.getElementById("dice2"),
    document.getElementById("dice3")
];

const totalElement = document.getElementById("total");
const sizeElement = document.getElementById("size");
const parityElement = document.getElementById("parity");
const timerElement = document.getElementById("timer");
const roundElement = document.getElementById("round");
const modeElement = document.getElementById("mode");

const rollButton = document.getElementById("rollButton");
const resetButton = document.getElementById("resetButton");
const autoButton = document.getElementById("autoButton");
const clearButton = document.getElementById("clearButton");

const historyTable = document.getElementById("historyTable");
const statusElement = document.getElementById("status");

let diceValues = [1, 1, 1];
let round = 1;
let timer = 30;
let autoRoll = false;


/* -------------------------
   CREATE DICE FACE
------------------------- */

function createFace(number) {

    const positions = {

        1: [4],

        2: [0, 8],

        3: [0, 4, 8],

        4: [0, 2, 6, 8],

        5: [0, 2, 4, 6, 8],

        6: [0, 2, 3, 5, 6, 8]

    };

    let html = "";

    for (let i = 0; i < 9; i++) {

        if (positions[number].includes(i)) {

            html += '<span class="dot"></span>';

        } else {

            html += '<span></span>';

        }

    }

    return html;
}


/* -------------------------
   UPDATE VISIBLE DICE
------------------------- */

function updateVisibleDice() {

    dice.forEach((die, index) => {

        const number = diceValues[index];

        const front =
            die.querySelector(".front");

        /*
            IMPORTANT:
            Visible front face now shows
            the actual random number.
        */

        front.innerHTML =
            createFace(number);

    });

}


/* -------------------------
   RANDOM NUMBER
------------------------- */

function randomDice() {

    return Math.floor(Math.random() * 6) + 1;

}


/* -------------------------
   UPDATE RESULT
------------------------- */

function updateGame() {

    const total =
        diceValues[0] +
        diceValues[1] +
        diceValues[2];


    totalElement.textContent = total;


    /* SMALL / BIG */

    if (total <= 10) {

        sizeElement.textContent = "SMALL";
        sizeElement.style.color = "#1688e8";

    } else {

        sizeElement.textContent = "BIG";
        sizeElement.style.color = "#ed8919";

    }


    /* EVEN / ODD */

    if (total % 2 === 0) {

        parityElement.textContent = "EVEN";
        parityElement.style.color = "#0ca36d";

    } else {

        parityElement.textContent = "ODD";
        parityElement.style.color = "#df4665";

    }


    roundElement.textContent =
        "#" + round;

    modeElement.textContent =
        autoRoll ? "AUTO" : "MANUAL";


    return total;
}


/* -------------------------
   ROLL ANIMATION
------------------------- */

function animateDice() {

    dice.forEach((die) => {

        die.classList.remove("rolling");

        void die.offsetWidth;

        die.classList.add("rolling");

    });

}


/* -------------------------
   ADD HISTORY
------------------------- */

function addHistory(total) {

    const size =
        total <= 10
            ? "SMALL"
            : "BIG";

    const parity =
        total % 2 === 0
            ? "EVEN"
            : "ODD";


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>#${round}</td>

        <td>${diceValues[0]}</td>

        <td>${diceValues[1]}</td>

        <td>${diceValues[2]}</td>

        <td>
            <strong>${total}</strong>
        </td>

        <td>
            <span class="badge">
                ${size}
            </span>
        </td>

        <td>
            <span class="badge">
                ${parity}
            </span>
        </td>

    `;


    historyTable.prepend(row);


    /* Keep last 15 */

    while (
        historyTable.children.length > 15
    ) {

        historyTable.lastElementChild.remove();

    }

}


/* -------------------------
   MAIN ROLL
------------------------- */

function rollDice() {

    /*
        Generate numbers FIRST
    */

    diceValues = [

        randomDice(),
        randomDice(),
        randomDice()

    ];


    /*
        Start animation
    */

    animateDice();


    /*
        After animation,
        show exactly those numbers.
    */

    setTimeout(() => {

        updateVisibleDice();

        const total =
            updateGame();


        addHistory(total);


        statusElement.textContent =
            "Round " +
            round +
            " • Dice: " +
            diceValues.join(" - ") +
            " • Total: " +
            total;


        round++;

        timer = 30;

        timerElement.textContent = "30";

    }, 650);

}


/* -------------------------
   MANUAL ROLL
------------------------- */

rollButton.addEventListener(
    "click",
    () => {

        rollDice();

    }
);


/* -------------------------
   AUTO ROLL
------------------------- */

autoButton.addEventListener(
    "click",
    () => {

        autoRoll = !autoRoll;


        if (autoRoll) {

            autoButton.textContent = "ON";

            autoButton.classList.add("active");

            modeElement.textContent = "AUTO";

            statusElement.textContent =
                "Auto Roll ON • Next roll in 30 seconds";

        } else {

            autoButton.textContent = "OFF";

            autoButton.classList.remove("active");

            modeElement.textContent = "MANUAL";

            statusElement.textContent =
                "Auto Roll OFF";

        }

    }
);


/* -------------------------
   30 SECOND TIMER
------------------------- */

setInterval(() => {

    if (!autoRoll) {
        return;
    }


    timer--;

    timerElement.textContent = timer;


    if (timer <= 0) {

        rollDice();

        timer = 30;

    }

}, 1000);


/* -------------------------
   RESET
------------------------- */

resetButton.addEventListener(
    "click",
    () => {

        diceValues = [1, 1, 1];

        round = 1;

        timer = 30;

        autoRoll = false;


        timerElement.textContent = "30";

        roundElement.textContent = "#1";

        modeElement.textContent = "MANUAL";


        autoButton.textContent = "OFF";

        autoButton.classList.remove("active");


        updateVisibleDice();

        updateGame();


        historyTable.innerHTML = "";


        statusElement.textContent =
            "Game reset • Ready to play";

    }
);


/* -------------------------
   CLEAR HISTORY
------------------------- */

clearButton.addEventListener(
    "click",
    () => {

        historyTable.innerHTML = "";

        statusElement.textContent =
            "History cleared";

    }
);


/* -------------------------
   INITIAL
------------------------- */

updateVisibleDice();

updateGame();