const result = analyzeAccount(accounts[0]);

document.getElementById("score").textContent =
    result.score;

document.getElementById("recommendation").textContent =
    result.recommendation;
