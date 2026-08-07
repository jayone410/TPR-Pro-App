document.addEventListener("DOMContentLoaded", () => {


    const account = accounts[0];


    const result = analyzeAccount(account);


    const payout = analyzePayout(
        account,
        PROP_RULES.topstep.accounts["50k"]
    );


    const dailyPlan = createDailyPlan(
        account,
        payout
    );


    console.log("ENGINE RESULT:", result);
    console.log("PAYOUT:", payout);
    console.log("DAILY PLAN:", dailyPlan);



    // Trading Readiness

    document.getElementById("score").textContent =
        result.score + " / 100";


    document.getElementById("recommendation").textContent =
        result.recommendation;



    // Reasons

    const reasons =
        document.getElementById("reasons");


    reasons.innerHTML = "";


    result.reasons.forEach(reason => {

        const item = document.createElement("p");

        item.textContent = "• " + reason;

        reasons.appendChild(item);

    });



    // Risk Breakdown

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



    // Payout Intelligence

    const payoutBox =
        document.getElementById("payout");


    payoutBox.innerHTML = `

    <p>
    Payout Status:
    <strong>${payout.status}</strong>
    </p>

    <p>
    ${payout.message}
    </p>

    <p>
    AI Empfehlung:
    <br>
    ${payout.action}
    </p>

    `;



    // Daily Trading Plan

    const dailyBox =
        document.getElementById("dailyPlan");


    dailyBox.innerHTML = `

    <p>
    Risk Mode:
    <strong>${dailyPlan.mode}</strong>
    </p>


    <p>
    Tagesziel:
    ${dailyPlan.target}
    </p>


    <p>
    Max Loss:
    ${dailyPlan.maxLoss}
    </p>


    <p>
    AI Hinweise:
    </p>


    ${dailyPlan.advice
        .map(item => "✓ " + item)
        .join("<br>")}

    `;


});
