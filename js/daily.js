/*
=========================================
TPR PRO AI
Daily Action Engine
=========================================
*/


function createDailyPlan(account, payout){


    let mode = "NORMAL";

    let target = "$500";
    let maxLoss = "$500";

    let advice = [];


    if(payout.status === "WAIT"){

        mode = "DEFENSIVE";

        target = "$300";

        maxLoss = "$300";


        advice.push(
            "Nur A+ Setups handeln."
        );


        advice.push(
            "Keine Recovery Trades."
        );

    }


    if(account.buffer < 1500){

        mode = "HIGH RISK";

        target = "$200";

        maxLoss = "$200";


        advice.push(
            "Account Buffer schützen."
        );

    }


    return {

        mode,

        target,

        maxLoss,

        advice

    };


}
