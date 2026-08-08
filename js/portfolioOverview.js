/*
=========================================
TPR PRO AI
Portfolio Overview
=========================================
*/


function getPortfolioAccountStatus(account) {

    try {

        const engineAccount = {

            ...account,

            buffer:
                Number(account.balance) -
                Number(account.startingBalance),

            nextPayoutAmount:
                account.nextPayoutAmount || 0

        };


        const result =
            analyzeAccount(
                engineAccount
            );


        const recommendation =
            String(
                result.recommendation || ""
            ).toUpperCase();


        if(
            recommendation.includes("STOP") ||
            recommendation.includes("DON'T")
        ) {

            return "stop";

        }


        if(
            recommendation.includes("LOW RISK") ||
            recommendation.includes("CAUTION")
        ) {

            return "low";

        }


        return "ready";

    }
    catch(error) {

        return "unknown";

    }

}



function isAccountPayoutReady(account) {

    try {

        if(
            !PROP_RULES ||
            !PROP_RULES[account.provider] ||
            !PROP_RULES[account.provider].accounts ||
            !PROP_RULES[account.provider].accounts[
                account.accountType
            ]
        ) {

            return false;

        }


        const rules =
            PROP_RULES[
                account.provider
            ].accounts[
                account.accountType
            ];


        const engineAccount = {

            ...account,

            buffer:
                Number(account.balance) -
                Number(account.startingBalance),

            nextPayoutAmount:
                account.nextPayoutAmount || 0

        };


        const payout =
            analyzePayout(
                engineAccount,
                rules
            );


        return (
            String(
                payout.status || ""
            ).toUpperCase() === "READY"
        );

    }
    catch(error) {

        return false;

    }

}



function calculatePortfolioOverview() {

    const totalBalance =
        accounts.reduce(
            (sum, account) =>
                sum +
                Number(
                    account.balance || 0
                ),
            0
        );


    let ready = 0;

    let lowRisk = 0;

    let stop = 0;

    let payoutReady = 0;


    accounts.forEach(account => {

        const status =
            getPortfolioAccountStatus(
                account
            );


        if(status === "ready") {
            ready++;
        }

        if(status === "low") {
            lowRisk++;
        }

        if(status === "stop") {
            stop++;
       
