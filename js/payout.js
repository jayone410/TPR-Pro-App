/*
=========================================
TPR PRO AI
Payout Intelligence
=========================================
*/


function analyzePayout(account, rules){


    let status = "";
    let message = "";


    const buffer =
        account.buffer;


    if(account.daysTraded < rules.minTradingDays){

        status = "WAIT";

        message =
        "Noch nicht genügend Handelstage.";

    }


    else if(buffer < rules.recommendedBuffer){

        status = "RISK";

        message =
        "Buffer vor Payout zu gering.";

    }


    else if(account.nextPayoutAmount >= rules.minPayout){

        status = "READY";

        message =
        "Payout wahrscheinlich möglich.";

    }


    else{

        status = "BUILD";

        message =
        "Weiter Kapital aufbauen.";

    }


    return {

        status,

        message

    };


}
