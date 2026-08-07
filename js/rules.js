/*
====================================================

TPR PRO AI
Prop Firm Rule Engine
Version 1.0

====================================================
*/

const PROP_RULES = {

    topstep: {

        name: "Topstep",

        accounts: {

            "50k": {

                startingBalance: 50000,

                recommendedBuffer: 1500,

                minPayout: 500,

                minTradingDays: 3,

                maxDailyProfitTarget: 400,

                maxDailyLoss: 400,

                currency: "USD"

            }

        }

    },

    lucid: {

        name: "Lucid",

        accounts: {

            "50k": {

                startingBalance: 50000,

                recommendedBuffer: 2100,

                minPayout: 500,

                payoutFrequency: "daily",

                maxDailyProfitTarget: 400,

                maxDailyLoss: 400,

                currency: "USD"

            }

        }

    }

};
