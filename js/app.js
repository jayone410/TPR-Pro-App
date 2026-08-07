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

        const riskBox =
        document.getElementById("riskFactors");


            riskBox.innerHTML = `
            
            <p>
            Account Risk:
            ${result.risk.accountRisk}/100
            </p>
            
            <p>
            Market Risk:
            ${result.risk.marketRisk}/100
            </p>
            
            <p>
            Performance Risk:
            ${result.risk.performanceRisk}/100
            </p>
            
            <p>
            Discipline Risk:
            ${result.risk.disciplineRisk}/100
            </p>
            
            `;

    });


});
