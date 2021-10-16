const NUM_CATEGORIES = 6;
const DOLLAR_AMTS = [200, 400, 600, 800, 1000];

let currentCategories = [];
let currentClue = null;
let currentScore = 0;

document.getElementById("answerSubmit").addEventListener("click", function(event) {
    event.preventDefault();
    const value = document.getElementById("answerInput").value;
    checkAnswer(value);
});

async function getCategories() {
    activateAll(false);
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        document.getElementById("cat-"+i).innerHTML = "";
    }

    currentCategories = []
    while (currentCategories.length < NUM_CATEGORIES) {
        let randOffset = Math.floor(Math.random() * 18403);
        console.log(randOffset);
        const url = "https://jservice.io/api/categories?&offset=" + randOffset;
        const response = await fetch(url);
        const json = await response.json();
        const category = json[0];

        if (!currentCategories.includes(category)) {
            let validCategory = true;
            for (let amount of DOLLAR_AMTS) {
                const url = "https://jservice.io/api/clues?"
                    + "category=" + category.id
                    + "&value=" + amount;
                const response = await fetch(url);
                const json = await response.json();
                if (isEmpty(json)) {
                    validCategory = false;
                    break;
                }
            }

            if (validCategory) {
                document.getElementById("cat-" + currentCategories.length).innerHTML = category.title;
                currentCategories.push(category.id);
            }
        }
    }
    activateAll();
    document.getElementById("score").innerHTML = "0";
}

async function getClue(catIndex, dollarAmt) {
    activateClueBox(catIndex, dollarAmt, false);
    const url = "https://jservice.io/api/clues?"
        + "category=" + currentCategories[catIndex]
        + "&value=" + dollarAmt;
    const response = await fetch(url);
    const json = await response.json();

    currentClue = json[0];
    document.getElementById("question").innerHTML = currentClue.question;
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").disabled = false;
    document.getElementById("answerSubmit").disabled = false;
    document.getElementById("result").innerHTML = "";
}

function activateAll(activate = true) {
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        for (const amount of DOLLAR_AMTS) {
            activateClueBox(i, amount, activate);
        }
    }
}

function activateClueBox(index, value, activate=true) {
    const box = document.getElementById("clue-" + index + "-" + value);
    box.disabled = !activate;
}

function checkAnswer(answer) {
    const resultBox = document.getElementById("result");
    if (currentClue === null) {
        return;
    }
    if (answersMatch(answer)) {
        resultBox.innerHTML = "Correct!"
        updateScore(currentScore + currentClue.value);
    } else {
        resultBox.innerHTML = "Incorrect. The correct answer was " + currentClue.answer;
    }
    document.getElementById("answerInput").disabled = true;
    document.getElementById("answerSubmit").disabled = true;
}

function answersMatch(userAnswer) {
    userAnswer = userAnswer.toLowerCase();
    const correctAnswer = currentClue.answer.toLowerCase();
    if (userAnswer === correctAnswer) {
        return true;
    }

    let userWords = userAnswer.split(" ");
    let correctWords = correctAnswer.split(" ");

    for (let userWord of userWords) {
        if (!correctWords.includes(userWord)) {
            return false;
        }
        correctWords = correctWords.filter(x => x !== userWord);
    }

    for (let word of correctWords) {
        if (word[0] !== "("
            && word[0] !== "<"
            && word !== "a"
            && word !== "the"
            && word !== "&") {
            return false;
        }
    }
    return true;
}

function updateScore(newScore) {
    currentScore = newScore;
    document.getElementById("score").innerHTML = newScore;
}

function isEmpty(object) {
    for (const i in object) {
        return false;
    }
    return true;
}