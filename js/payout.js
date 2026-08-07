/*
=========================================
TPR PRO AI
Payout Intelligence
=========================================
*/


function analyzePayout(account, rules){


    let status = "";
    let message = "";
    let action = "";


    const missingDays =
        rules.minTradingDays - account.daysTraded;



    if(missingDays > 0){

        status = "WAIT";

        message =
        `Noch ${missingDays} Handelstag(e) bis Payout.`;

        action =
        "Account schützen. Kein unnötiges Risiko.";

    }


    else if(account.buffer < rules.recommendedBuffer){

        status = "RISK";

        message =
        "Buffer vor Payout kritisch.";

        action =
        "Risiko reduzieren.";

    }


    else if(account.nextPayoutAmount >= rules.minPayout){

        status = "READY";

        message =
        "Payout wahrscheinlich möglich.";

        action =
        "Payout prüfen.";

    }


    else{

        status = "BUILD";

        message =
        "Weiter Kapital aufbauen.";

        action =
        "Normales Trading.";

    }


    return {

        status,

        message,

        action

    };


}
