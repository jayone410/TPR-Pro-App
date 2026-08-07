/*
=========================================
TPR PRO AI
Decision Engine
=========================================
*/


function analyzeAccount(account){


    const risk = calculateRisk(account);


    let score = Math.round(

        (
            risk.accountRisk * 0.30
            +
            risk.marketRisk * 0.30
            +
            risk.performanceRisk * 0.25
            +
            risk.disciplineRisk * 0.15
        )

    );


let recommendation = "";


if(score >= 85){

    recommendation = "🟢 TRADE NORMAL";

}
else if(score >= 70){

    recommendation = "🟡 REDUCE RISK";

}
else if(score >= 50){

    recommendation = "🟠 ONLY A+ SETUPS";

}
else{

    recommendation = "🔴 DON'T TRADE";

}

    const reasons = [];


    if(risk.accountRisk >= 80){

        reasons.push("Account Risiko kontrolliert.");

    }
    else{

        reasons.push("Account Risiko erhöht.");

    }



    if(risk.marketRisk >= 80){

        reasons.push("Marktumfeld günstig.");

    }
    else{

        reasons.push("Marktrisiko erhöht.");

    }



    return {


        score,

        recommendation,

        reasons,

        risk

    };


}

function buildReadinessDecision(
    account,
    result,
    payout,
    dailyPlan,
    providerRules
) {

    const buffer =
        Number(account.balance) -
        Number(account.startingBalance);


    const recommendedBuffer =
        Number(
            providerRules?.recommendedBuffer ??
            0
        );


    const bufferDifference =
        buffer -
        recommendedBuffer;



    /*
    =====================================
    STATUS
    =====================================
    */

    let status =
        "READY TO TRADE";

    let level =
        "green";


    if(result.score < 85) {

        status =
            "CAUTION";

        level =
            "yellow";

    }


    if(result.score < 60) {

        status =
            "STOP";

        level =
            "red";

    }



    /*
    =====================================
    BUFFER
    =====================================
    */

    let bufferStatus =
        "Optimal";

    let bufferDetail =
        "Buffer liegt über Empfehlung.";


    if(bufferDifference < 0) {

        bufferStatus =
            "Unter Ziel";


        bufferDetail =
            `$${Math.abs(
                bufferDifference
            ).toLocaleString()} bis Zielbuffer`;

    }



    /*
    =====================================
    PAYOUT
    =====================================
    */

    let payoutText =
        payout?.status ?? "--";


    let payoutDetail =
        payout?.message ??
        "Keine Payout-Daten.";



    /*
    =====================================
    AI HINWEISE
    =====================================
    */

    const ai = [];


    if(bufferDifference < 0) {

        ai.push(
            "Buffer zuerst weiter aufbauen."
        );

    }
    else {

        ai.push(
            "Buffer ist ausreichend."
        );

    }


    if(payout?.status === "READY") {

        ai.push(
            "Payout prüfen und Gewinne schützen."
        );

    }


    if(payout?.status === "WAIT") {

        ai.push(
            "Kein unnötiges Risiko vor dem nächsten Payout."
        );

    }


    if(
        dailyPlan?.mode ===
        "DEFENSIVE"
    ) {

        ai.push(
            "Heute defensiv handeln."
        );

    }


    if(
        Array.isArray(
            dailyPlan?.advice
        )
    ) {

        dailyPlan.advice
            .forEach(
                item => {

                    if(!ai.includes(item)) {

                        ai.push(item);

                    }

                }
            );

    }



    return {

        status,

        level,

        score:
            result.score,

        buffer,

        recommendedBuffer,

        bufferStatus,

        bufferDetail,

        payoutText,

        payoutDetail,

        goal:
            dailyPlan?.target ??
            "--",

        stop:
            dailyPlan?.maxLoss ??
            "--",

        ai

    };

}
