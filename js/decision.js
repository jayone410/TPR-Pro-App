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
