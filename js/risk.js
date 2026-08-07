/*
=========================================
TPR PRO AI
Risk Engine
=========================================
*/


function calculateRisk(account){


    let accountRisk = 100;


    if(account.buffer < 1500){

        accountRisk -= 30;

    }


    let performanceRisk = 100;


    let disciplineRisk = 100;


    let marketRisk = 100;


    return {

        accountRisk,

        performanceRisk,

        disciplineRisk,

        marketRisk

    };

}
