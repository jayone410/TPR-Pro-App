/*
=========================================
TPR PRO AI
Official Prop Rules v2
=========================================

Struktur:

PROP_RULES
    provider
        program
            accountSize

Später können pro Account Overrides
darübergelegt werden.

=========================================
*/


const PROP_RULES = {


    /*
    =====================================
    TOPSTEP
    =====================================
    */

    topstep: {

        name: "Topstep",

        /*
        =================================
        TRADING COMBINE / EVALUATION
        =================================
        */
        
        tradingCombine: {
        
            label:
                "Trading Combine",
        
            stage:
                "evaluation",
        
            balanceMode:
                "accountBalance",
        
            sizes: {
        
        
                /*
                =============================
                25K TOPSTEP LABS
                =============================
                */
        
                "25k": {
        
                    accountSize:
                        25000,
        
                    startingBalance:
                        25000,
        
                    buyingPower:
                        25000,
        
                    profitTarget:
                        2000,
        
                    consistencyLimit:
                        50,
        
                    maxLossLimit:
                        1000,
        
                    initialMLL:
                        24000,
        
                    mllType:
                        "static",
        
                    dllOptional:
                        false,
        
                    dll:
                        500,
        
                    maxMinis:
                        2,
        
                    maxMicros:
                        20,
        
                    scalingPlan:
                        false,
        
                    payoutMode:
                        null,
        
                    minPayout:
                        null,
        
                    currency:
                        "USD"
        
                },
        
        
                /*
                =============================
                50K STANDARD COMBINE
                =============================
                */
        
                "50k": {
        
                    accountSize:
                        50000,
        
                    startingBalance:
                        50000,
        
                    buyingPower:
                        50000,
        
                    profitTarget:
                        3000,
        
                    consistencyLimit:
                        50,
        
                    maxLossLimit:
                        2000,
        
                    initialMLL:
                        48000,
        
                    lockedMLL:
                        50000,
        
                    mllType:
                        "eodTrailing",
        
                    dllOptional:
                        true,
        
                    dll:
                        null,
        
                    maxMinis:
                        5,
        
                    maxMicros:
                        50,
        
                    payoutMode:
                        null,
        
                    minPayout:
                        null,
        
                    currency:
                        "USD"
        
                },
        
        
                /*
                =============================
                100K STANDARD COMBINE
                =============================
                */
        
                "100k": {
        
                    accountSize:
                        100000,
        
                    startingBalance:
                        100000,
        
                    buyingPower:
                        100000,
        
                    profitTarget:
                        6000,
        
                    consistencyLimit:
                        50,
        
                    maxLossLimit:
                        3000,
        
                    initialMLL:
                        97000,
        
                    lockedMLL:
                        100000,
        
                    mllType:
                        "eodTrailing",
        
                    dllOptional:
                        true,
        
                    dll:
                        null,
        
                    maxMinis:
                        10,
        
                    maxMicros:
                        100,
        
                    payoutMode:
                        null,
        
                    minPayout:
                        null,
        
                    currency:
                        "USD"
        
                },
        
        
                /*
                =============================
                150K STANDARD COMBINE
                =============================
                */
        
                "150k": {
        
                    accountSize:
                        150000,
        
                    startingBalance:
                        150000,
        
                    buyingPower:
                        150000,
        
                    profitTarget:
                        9000,
        
                    consistencyLimit:
                        50,
        
                    maxLossLimit:
                        4500,
        
                    initialMLL:
                        145500,
        
                    lockedMLL:
                        150000,
        
                    mllType:
                        "eodTrailing",
        
                    dllOptional:
                        true,
        
                    dll:
                        null,
        
                    maxMinis:
                        15,
        
                    maxMicros:
                        150,
        
                    payoutMode:
                        null,
        
                    minPayout:
                        null,
        
                    currency:
                        "USD"
        
                }
        
            }
        
        },    

        /*
        =================================
        XFA STANDARD
        =================================
        */

        xfaStandard: {

            label:
                "XFA Standard",

            stage:
                "funded",

            balanceMode:
                "profitBalance",

            payoutCycleResets:
                true,

            sizes: {

                
            "25k": {

                    accountSize:
                        25000,
                
                    /*
                    Topstep Labs 25K XFA
                    XFA Performance Balance startet bei $0.
                    */
                
                    startingBalance:
                        0,
                
                    buyingPower:
                        25000,
                
                
                    /*
                    Maximum Loss Limit
                
                    Besonderheit:
                    25K Labs = STATIC, nicht EOD Trailing.
                    */
                
                    maxLossLimit:
                        1000,
                
                    initialMLL:
                        -1000,
                
                    lockedMLL:
                        0,
                
                    mllType:
                        "static",
                
                    mllLocksAt:
                        0,
                
                    mllLocksAfterProfit:
                        null,
                
                    mllResetsToZeroAfterFirstPayout:
                        true,
                
                
                    /*
                    DLL ist beim 25K verpflichtend.
                    */
                
                    dllOptional:
                        false,
                
                    dll:
                        500,
                
                
                    /*
                    Position Size
                    */
                
                    maxMinis:
                        2,
                
                    maxMicros:
                        20,
                
                    scalingPlan:
                        false,
                
                
                    /*
                    Payout
                    */
                
                    payoutMode:
                        "winningDays",
                
                    minWinningDays:
                        5,
                
                    winningDayMinProfit:
                        150,
                
                    consistencyLimit:
                        null,
                
                    minPayout:
                        125,
                
                    payoutPercent:
                        50,
                
                    /*
                    Topstep Labs 25K:
                    XFA Payout Cap $4,000
                    */
                
                    maxPayout:
                        4000,
                
                    profitSplitTrader:
                        90,
                
                    profitTarget:
                        null,
                
                    currency:
                        "USD"
                
                },

                "50k": {

                    accountSize:
                        50000,

                    /*
                    XFA Balance startet bei 0.
                    50K = Buying Power.
                    */

                    startingBalance:
                        0,

                    buyingPower:
                        50000,


                    /*
                    Maximum Loss Limit
                    */

                    maxLossLimit:
                        2000,

                    initialMLL:
                        -2000,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        2000,

                    mllResetsToZeroAfterFirstPayout:
                        true,


                    /*
                    Optional DLL
                    */

                    dllOptional:
                        true,

                    dll:
                        1000,


                    /*
                    Payout
                    */

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        150,

                    consistencyLimit:
                        null,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        2000,

                    maxPayoutWithDLL:
                        4000,

                    profitSplitTrader:
                        90,


                    /*
                    Kein fixer Profit Target
                    im XFA.
                    */

                    profitTarget:
                        null,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        0,

                    buyingPower:
                        100000,

                    maxLossLimit:
                        3000,

                    initialMLL:
                        -3000,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        3000,

                    mllResetsToZeroAfterFirstPayout:
                        true,

                    dllOptional:
                        true,

                    dll:
                        2000,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        150,

                    consistencyLimit:
                        null,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        3000,

                    maxPayoutWithDLL:
                        6000,

                    profitSplitTrader:
                        90,

                    profitTarget:
                        null,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        0,

                    buyingPower:
                        150000,

                    maxLossLimit:
                        4500,

                    initialMLL:
                        -4500,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        4500,

                    mllResetsToZeroAfterFirstPayout:
                        true,

                    dllOptional:
                        true,

                    dll:
                        3000,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        150,

                    consistencyLimit:
                        null,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        5000,

                    maxPayoutWithDLL:
                        10000,

                    profitSplitTrader:
                        90,

                    profitTarget:
                        null,

                    currency:
                        "USD"

                }

            }

        },


        /*
        =================================
        XFA CONSISTENCY
        =================================
        */

        xfaConsistency: {

            label:
                "XFA Consistency",

            stage:
                "funded",

            balanceMode:
                "profitBalance",

            payoutCycleResets:
                true,

            sizes: {

                "25k": {

                    accountSize:
                        25000,
                
                    startingBalance:
                        0,
                
                    buyingPower:
                        25000,
                
                
                    /*
                    STATIC Maximum Loss Limit
                    */
                
                    maxLossLimit:
                        1000,
                
                    initialMLL:
                        -1000,
                
                    lockedMLL:
                        0,
                
                    mllType:
                        "static",
                
                    mllLocksAt:
                        0,
                
                    mllLocksAfterProfit:
                        null,
                
                    mllResetsToZeroAfterFirstPayout:
                        true,
                
                
                    /*
                    Mandatory DLL
                    */
                
                    dllOptional:
                        false,
                
                    dll:
                        500,
                
                
                    /*
                    Position Size
                    */
                
                    maxMinis:
                        2,
                
                    maxMicros:
                        20,
                
                    scalingPlan:
                        false,
                
                
                    /*
                    Payout / Consistency
                    */
                
                    payoutMode:
                        "consistency",
                
                    minTradingDays:
                        3,
                
                    consistencyLimit:
                        40,
                
                    minPayout:
                        125,
                
                    payoutPercent:
                        50,
                
                    maxPayout:
                        4000,
                
                    profitSplitTrader:
                        90,
                
                    profitTarget:
                        null,
                
                    currency:
                        "USD"
                
                },

                "50k": {

                    accountSize:
                        50000,

                    startingBalance:
                        0,

                    buyingPower:
                        50000,

                    maxLossLimit:
                        2000,

                    initialMLL:
                        -2000,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        2000,

                    mllResetsToZeroAfterFirstPayout:
                        true,

                    dllOptional:
                        true,

                    dll:
                        1000,


                    /*
                    Payout
                    */

                    payoutMode:
                        "consistency",

                    minTradingDays:
                        3,

                    consistencyLimit:
                        40,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        3000,

                    maxPayoutWithDLL:
                        6000,

                    profitSplitTrader:
                        90,

                    profitTarget:
                        null,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        0,

                    buyingPower:
                        100000,

                    maxLossLimit:
                        3000,

                    initialMLL:
                        -3000,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        3000,

                    mllResetsToZeroAfterFirstPayout:
                        true,

                    dllOptional:
                        true,

                    dll:
                        2000,

                    payoutMode:
                        "consistency",

                    minTradingDays:
                        3,

                    consistencyLimit:
                        40,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        4000,

                    maxPayoutWithDLL:
                        8000,

                    profitSplitTrader:
                        90,

                    profitTarget:
                        null,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        0,

                    buyingPower:
                        150000,

                    maxLossLimit:
                        4500,

                    initialMLL:
                        -4500,

                    lockedMLL:
                        0,

                    mllType:
                        "eodTrailing",

                    mllLocksAt:
                        0,

                    mllLocksAfterProfit:
                        4500,

                    mllResetsToZeroAfterFirstPayout:
                        true,

                    dllOptional:
                        true,

                    dll:
                        3000,

                    payoutMode:
                        "consistency",

                    minTradingDays:
                        3,

                    consistencyLimit:
                        40,

                    minPayout:
                        125,

                    payoutPercent:
                        50,

                    maxPayout:
                        6000,

                    maxPayoutWithDLL:
                        12000,

                    profitSplitTrader:
                        90,

                    profitTarget:
                        null,

                    currency:
                        "USD"

                }

            }

        }

    },


    /*
    =====================================
    LUCID
    =====================================
    */

    lucid: {

        name:
            "Lucid Trading",


        /*
        =================================
        LUCID PRO EVALUATION
        =================================
        */

        proEvaluation: {

            label:
                "LucidPro Evaluation",

            stage:
                "evaluation",

            sizes: {


                "25k": {

                    accountSize:
                        25000,

                    startingBalance:
                        25000,

                    profitTarget:
                        1250,

                    maxLossLimit:
                        1000,

                    drawdownType:
                        "eodTrailing",

                    dll:
                        null,

                    consistencyLimit:
                        null,

                    maxMinis:
                        2,

                    maxMicros:
                        20,

                    currency:
                        "USD"

                },


                "50k": {

                    accountSize:
                        50000,

                    startingBalance:
                        50000,

                    profitTarget:
                        3000,

                    maxLossLimit:
                        2000,

                    drawdownType:
                        "eodTrailing",

                    dll:
                        1200,

                    consistencyLimit:
                        null,

                    maxMinis:
                        4,

                    maxMicros:
                        40,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        100000,

                    profitTarget:
                        6000,

                    maxLossLimit:
                        3000,

                    drawdownType:
                        "eodTrailing",

                    dll:
                        1800,

                    consistencyLimit:
                        null,

                    maxMinis:
                        6,

                    maxMicros:
                        60,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        150000,

                    profitTarget:
                        9000,

                    maxLossLimit:
                        4500,

                    drawdownType:
                        "eodTrailing",

                    dll:
                        2700,

                    consistencyLimit:
                        null,

                    maxMinis:
                        10,

                    maxMicros:
                        100,

                    currency:
                        "USD"

                }

            }

        },


        /*
        =================================
        LUCID PRO FUNDED
        =================================
        */

        proFunded: {

            label:
                "LucidPro Funded",

            stage:
                "funded",

            payoutCycleResets:
                true,

            sizes: {


                "25k": {

                    accountSize:
                        25000,

                    startingBalance:
                        25000,

                    maxLossLimit:
                        1000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        26100,

                    lockedMLLBalance:
                        25100,

                    fixedDLL:
                        null,

                    scalingDLLPercent:
                        null,

                    payoutProfitGoal:
                        500,

                    consistencyLimit:
                        40,

                    legacyConsistencyLimit:
                        35,

                    bufferBalance:
                        26100,

                    minPayout:
                        500,

                    maxPayoutFirst:
                        1000,

                    maxPayoutLater:
                        1500,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "50k": {

                    accountSize:
                        50000,

                    startingBalance:
                        50000,

                    maxLossLimit:
                        2000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        52100,

                    lockedMLLBalance:
                        50100,

                    fixedDLL:
                        1200,

                    scalingDLLPercent:
                        60,

                    payoutProfitGoal:
                        500,

                    consistencyLimit:
                        40,

                    legacyConsistencyLimit:
                        35,

                    bufferBalance:
                        52100,

                    minPayout:
                        500,

                    maxPayoutFirst:
                        2000,

                    maxPayoutLater:
                        2500,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        100000,

                    maxLossLimit:
                        3000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        103100,

                    lockedMLLBalance:
                        100100,

                    fixedDLL:
                        1800,

                    scalingDLLPercent:
                        60,

                    payoutProfitGoal:
                        750,

                    consistencyLimit:
                        40,

                    legacyConsistencyLimit:
                        35,

                    bufferBalance:
                        103100,

                    minPayout:
                        500,

                    maxPayoutFirst:
                        2500,

                    maxPayoutLater:
                        3000,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        150000,

                    maxLossLimit:
                        4500,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        154600,

                    lockedMLLBalance:
                        150100,

                    fixedDLL:
                        2700,

                    scalingDLLPercent:
                        60,

                    payoutProfitGoal:
                        1000,

                    consistencyLimit:
                        40,

                    legacyConsistencyLimit:
                        35,

                    bufferBalance:
                        154600,

                    minPayout:
                        500,

                    maxPayoutFirst:
                        3000,

                    maxPayoutLater:
                        3500,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                }

            }

        },


        /*
        =================================
        LUCID FLEX EVALUATION
        =================================
        */

        flexEvaluation: {

            label:
                "LucidFlex Evaluation",

            stage:
                "evaluation",

            sizes: {


                "25k": {

                    accountSize:
                        25000,

                    startingBalance:
                        25000,

                    profitTarget:
                        1250,

                    maxLossLimit:
                        1000,

                    drawdownType:
                        "eodTrailing",

                    consistencyLimit:
                        50,

                    dll:
                        null,

                    currency:
                        "USD"

                },


                "50k": {

                    accountSize:
                        50000,

                    startingBalance:
                        50000,

                    profitTarget:
                        3000,

                    maxLossLimit:
                        2000,

                    drawdownType:
                        "eodTrailing",

                    consistencyLimit:
                        50,

                    dll:
                        null,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        100000,

                    profitTarget:
                        6000,

                    maxLossLimit:
                        3000,

                    drawdownType:
                        "eodTrailing",

                    consistencyLimit:
                        50,

                    dll:
                        null,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        150000,

                    profitTarget:
                        9000,

                    maxLossLimit:
                        4500,

                    drawdownType:
                        "eodTrailing",

                    consistencyLimit:
                        50,

                    dll:
                        null,

                    currency:
                        "USD"

                }

            }

        },


        /*
        =================================
        LUCID FLEX FUNDED
        =================================
        */

        flexFunded: {

            label:
                "LucidFlex Funded",

            stage:
                "funded",

            payoutCycleResets:
                true,

            sizes: {


                "25k": {

                    accountSize:
                        25000,

                    startingBalance:
                        25000,

                    maxLossLimit:
                        1000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        26100,

                    lockedMLLBalance:
                        25100,

                    dll:
                        null,

                    consistencyLimit:
                        null,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        100,

                    requirePositiveCyclePnL:
                        true,

                    bufferBalance:
                        null,

                    minPayout:
                        500,

                    payoutPercent:
                        50,

                    maxPayout:
                        1000,

                    maxPayoutCount:
                        5,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "50k": {

                    accountSize:
                        50000,

                    startingBalance:
                        50000,

                    maxLossLimit:
                        2000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        52100,

                    lockedMLLBalance:
                        50100,

                    dll:
                        null,

                    consistencyLimit:
                        null,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        150,

                    requirePositiveCyclePnL:
                        true,

                    bufferBalance:
                        null,

                    minPayout:
                        500,

                    payoutPercent:
                        50,

                    maxPayout:
                        2000,

                    maxPayoutCount:
                        5,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "100k": {

                    accountSize:
                        100000,

                    startingBalance:
                        100000,

                    maxLossLimit:
                        3000,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        103100,

                    lockedMLLBalance:
                        100100,

                    dll:
                        null,

                    consistencyLimit:
                        null,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        200,

                    requirePositiveCyclePnL:
                        true,

                    bufferBalance:
                        null,

                    minPayout:
                        500,

                    payoutPercent:
                        50,

                    maxPayout:
                        2500,

                    maxPayoutCount:
                        5,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                },


                "150k": {

                    accountSize:
                        150000,

                    startingBalance:
                        150000,

                    maxLossLimit:
                        4500,

                    drawdownType:
                        "eodTrailing",

                    initialTrailBalance:
                        154600,

                    lockedMLLBalance:
                        150100,

                    dll:
                        null,

                    consistencyLimit:
                        null,

                    payoutMode:
                        "winningDays",

                    minWinningDays:
                        5,

                    winningDayMinProfit:
                        250,

                    requirePositiveCyclePnL:
                        true,

                    bufferBalance:
                        null,

                    minPayout:
                        500,

                    payoutPercent:
                        50,

                    maxPayout:
                        3000,

                    maxPayoutCount:
                        5,

                    profitSplitTrader:
                        90,

                    currency:
                        "USD"

                }

            }

        }

    }

};


/*
=========================================
RULE LOOKUP
=========================================
*/


function getOfficialRules(
    provider,
    program,
    accountType
) {

    if(
        !PROP_RULES[provider] ||
        !PROP_RULES[provider][program] ||
        !PROP_RULES[provider][program].sizes ||
        !PROP_RULES[provider][program]
            .sizes[accountType]
    ) {

        return null;

    }


    return {

        provider,

        program,

        programLabel:
            PROP_RULES[
                provider
            ][program].label,

        stage:
            PROP_RULES[
                provider
            ][program].stage,

        ...PROP_RULES[
            provider
        ][program]
            .sizes[
                accountType
            ]

    };

}


/*
=========================================
EFFECTIVE RULES
=========================================

Official Defaults
+
Account Overrides

=========================================
*/


function getEffectiveRules(account) {

    if(!account) {

        return null;

    }


    const officialRules =
        getOfficialRules(
            account.provider,
            account.program,
            account.accountType
        );


    if(!officialRules) {

        return null;

    }


    const overrides =
        account.ruleOverrides &&
        typeof account.ruleOverrides ===
            "object"

            ? account.ruleOverrides

            : {};


    return {

        ...officialRules,

        ...overrides

    };

}
