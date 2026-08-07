/*
=========================================
TPR PRO AI
Risk Engine
=========================================
*/


function calculateRisk(account){


    let accountRisk = 100;


    /*
    Buffer Analyse
    */

    if(account.buffer < 1000){

        accountRisk -= 40;

    }
    else if(account.buffer < 1500){

        accountRisk -= 20;

    }


    /*
    Payout Situation
    */

    if(account.nextPayoutAmount >= 500){

        accountRisk -= 10;

    }


    /*
    Trading Days
    */

    if(account.daysTraded < 3){

        accountRisk -= 5;

    }



    return {

        accountRisk,

        marketRisk:100,

        performanceRisk:100,

        disciplineRisk:100

    };

}
