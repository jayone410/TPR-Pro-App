const result = analyzeAccount(accounts[0]);

console.log("ENGINE RESULT:");
console.log(result);

document.getElementById("score").textContent =
    result.score;

document.getElementById("recommendation").textContent =
    result.recommendation;
