/*
=========================================
TPR PRO AI
Decision Engine
=========================================
*/

function analyzeAccount(account){

    let score = 100;

    const reasons = [];

    if(account.buffer < 1500){

        score -= 25;

        reasons.push("Buffer unter Empfehlung.");

    } else{

        reasons.push("Buffer ausreichend.");

    }

    if(account.daysTraded < 3){

        score -= 15;

        reasons.push("Payout noch nicht möglich.");

    } else{

        reasons.push("Payout grundsätzlich möglich.");

    }

    if(account.nextPayoutAmount < 500){

        score -= 10;

        reasons.push("Payoutbetrag noch zu gering.");

    }

    let recommendation = "GO";

    if(score < 80){

        recommendation = "LOW RISK";

    }

    if(score < 60){

        recommendation = "DON'T TRADE";

    }

    return{

        score,

        recommendation,

        reasons

    };

}
