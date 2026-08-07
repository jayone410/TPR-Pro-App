document.addEventListener("DOMContentLoaded", () => {

    const result = analyzeAccount(accounts[0]);

    console.log("ENGINE RESULT:", result);


    document.getElementById("score").textContent =
        result.score + " / 100";


    document.getElementById("recommendation").textContent =
        result.recommendation;


    const reasons =
        document.getElementById("reasons");


    reasons.innerHTML = "";


    result.reasons.forEach(reason => {

        const item = document.createElement("p");

        item.textContent = "• " + reason;

        reasons.appendChild(item);

    });


});
