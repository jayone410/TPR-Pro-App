/*
=========================================
TPR PRO AI
Payout / Evaluation Engine v3
=========================================

- Evaluation / Funded getrennt
- Rules v3 kompatibel
- getEffectiveRules()
- Topstep Trading Combine
- Topstep XFA Standard
- Topstep XFA Consistency
- Lucid Pro
- Lucid Flex
- Rule Overrides kompatibel
=========================================
*/


/*
=========================================
HAUPTEINSTIEG
=========================================
*/

function analyzePayout(
    account,
    rules
) {

    if(!account) {

        return buildPayoutResult(
            "CHECK",
            "Kein Account verfügbar.",
            "Accountdaten prüfen.",
            "unknown"
        );

    }


    /*
    Falls keine Rules übergeben wurden,
    zentrale Rules Engine verwenden.
    */

    if(
        !rules &&
        typeof getEffectiveRules ===
            "function"
    ) {

        rules =
            getEffectiveRules(
                account
            );

    }


    if(!rules) {

        return buildPayoutResult(
            "--",
            "Keine Account-Regeln verfügbar.",
            "Rules prüfen.",
            "unknown"
        );

    }


    const stage =
        String(
            account.stage ||
            rules.stage ||
            ""
        ).toLowerCase();


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(
        stage ===
        "evaluation"
    ) {

        return analyzeEvaluationProgress(
            account,
            rules
        );

    }


    /*
    =====================================
    FUNDED
    =====================================
    */

    if(
        stage ===
        "funded"
    ) {

        return analyzeFundedPayout(
            account,
            rules
        );

    }


    /*
    =====================================
    UNKNOWN
    =====================================
    */

    return buildPayoutResult(
        "CHECK",
        "Account Stage unbekannt.",
        "Stage im Rules Editor prüfen.",
        "unknown"
    );

}



/*
=========================================
EVALUATION PROGRESS
=========================================
*/

function analyzeEvaluationProgress(
    account,
    rules
) {

    const currentProfit =
        getPayoutCurrentProfit(
            account
        );


    const profitTarget =
        toFiniteNumber(
            rules.profitTarget
        );


    const drawdown =
        getPayoutDrawdown(
            account
        );


    const dll =
        getPayoutDLL(
            account
        );


    const consistency =
        getPayoutConsistency(
            account
        );


    /*
    =====================================
    KEIN PROFIT TARGET
    =====================================
    */

    if(
        profitTarget === null ||
        profitTarget <= 0
    ) {

        return buildPayoutResult(
            "EVAL",
            "Evaluation aktiv.",
            "Account-Regeln beachten.",
            "evaluation",
            {

                currentProfit,

                profitTarget:
                    null,

                targetRemaining:
                    null,

                progressPercent:
                    null,

                drawdown,

                dll,

                consistency

            }
        );

    }


    /*
    =====================================
    TARGET / PROGRESS
    =====================================
    */

    const targetRemaining =
        Math.max(
            0,
            profitTarget -
            currentProfit
        );


    const progressPercent =
        clampPercent(
            (
                currentProfit /
                profitTarget
            ) *
            100
        );


    /*
    =====================================
    DRAWDOWN KRITISCH

    Risiko hat Vorrang vor TARGET.
    =====================================
    */

    if(
        isCriticalDrawdown(
            drawdown
        )
    ) {

        return buildPayoutResult(
            "RISK",
            "Evaluation Drawdown kritisch.",
            "Kapital schützen. Nur A+ Setups oder pausieren.",
            "evaluation",
            {

                currentProfit,

                profitTarget,

                targetRemaining,

                progressPercent,

                drawdown,

                dll,

                consistency

            }
        );

    }


    /*
    =====================================
    CONSISTENCY

    Muss erfüllt sein, bevor die
    Evaluation als abgeschlossen gilt.
    =====================================
    */

    if(
        isConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            toFiniteNumber(
                consistency
                    .minimumProfitNeeded
            );


        return buildPayoutResult(
            "CONSISTENCY",

            `Consistency ${
                formatPayoutPercent(
                    consistency.current
                )
            } / ${
                formatPayoutPercent(
                    consistency.limit
                )
            }.`,

            (
                needed !== null &&
                needed > 0
            )
                ? `${
                    formatPayoutMoney(
                        needed
                    )
                } zusätzlicher Net Profit erforderlich.`

                : "Weitere kontrollierte Green Days aufbauen.",

            "evaluation",

            {

                currentProfit,

                profitTarget,

                targetRemaining,

                progressPercent,

                drawdown,

                dll,

                consistency

            }
        );

    }


    /*
    =====================================
    TARGET ERREICHT
    =====================================
    */

    if(
        targetRemaining <=
        0
    ) {

        return buildPayoutResult(
            "TARGET",
            "Profit Target erreicht.",
            "Keine unnötigen Trades mehr. Evaluation-Abschluss prüfen.",
            "evaluation",
            {

                currentProfit,

                profitTarget,

                targetRemaining:
                    0,

                progressPercent:
                    100,

                drawdown,

                dll,

                consistency

            }
        );

    }


    /*
    =====================================
    FAST FERTIG
    =====================================
    */

    if(
        progressPercent >=
        80
    ) {

        return buildPayoutResult(
            "PROTECT",

            `${
                formatPayoutMoney(
                    targetRemaining
                )
            } bis zum Profit Target.`,

            "Evaluation schützen. Kein aggressives Trading mehr.",

            "evaluation",

            {

                currentProfit,

                profitTarget,

                targetRemaining,

                progressPercent,

                drawdown,

                dll,

                consistency

            }
        );

    }


    /*
    =====================================
    NORMAL BUILD
    =====================================
    */

    return buildPayoutResult(
        "BUILD",

        `${
            formatPayoutMoney(
                targetRemaining
            )
        } bis zum Profit Target.`,

        "Kontrolliert weiter aufbauen.",

        "evaluation",

        {

            currentProfit,

            profitTarget,

            targetRemaining,

            progressPercent,

            drawdown,

            dll,

            consistency

        }
    );

}



/*
=========================================
FUNDED PAYOUT
=========================================
*/

function analyzeFundedPayout(
    account,
    rules
) {

    const payout =
        getPayoutAvailability(
            account
        );


    const consistency =
        getPayoutConsistency(
            account
        );


    const drawdown =
        getPayoutDrawdown(
            account
        );


    const dll =
        getPayoutDLL(
            account
        );


    const tradingDays =
        getPayoutTradingDays(
            account
        );


    const winningDays =
        getPayoutWinningDays(
            account
        );


    const cycleProfit =
        getPayoutCycleProfit(
            account
        );


    /*
    =====================================
    FALLBACK
    =====================================
    */

    if(!payout) {

        return buildPayoutResult(
            "CHECK",
            "Payout konnte nicht berechnet werden.",
            "Rules und Accountdaten prüfen.",
            "funded",
            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    1. DRAWDOWN KRITISCH
    =====================================
    */

    if(
        isCriticalDrawdown(
            drawdown
        )
    ) {

        return buildPayoutResult(
            "RISK",
            "Remaining Drawdown kritisch.",
            "Account schützen. Kein Payout-Push.",
            "funded",
            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    2. TRADING DAYS FEHLEN
    =====================================
    */

    if(
        tradingDays &&
        Number(
            tradingDays.remaining
        ) > 0
    ) {

        return buildPayoutResult(
            "WAIT",

            `Noch ${
                tradingDays.remaining
            } Handelstag(e) erforderlich.`,

            "Qualifying Days kontrolliert erfüllen.",

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    3. WINNING DAYS FEHLEN
    =====================================
    */

    if(
        winningDays &&
        Number(
            winningDays.remaining
        ) > 0
    ) {

        return buildPayoutResult(
            "WAIT",

            `Noch ${
                winningDays.remaining
            } Winning Day(s) erforderlich.`,

            `Pro Tag mindestens ${
                formatPayoutMoney(
                    winningDays
                        .minimumDayProfit
                )
            } erreichen.`,

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }

    /*
    =====================================
    4. CONSISTENCY
    =====================================
    */

    if(
        isConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            toFiniteNumber(
                consistency
                    .minimumProfitNeeded
            );


        return buildPayoutResult(
            "CONSISTENCY",

            `Consistency ${
                formatPayoutPercent(
                    consistency.current
                )
            } / ${
                formatPayoutPercent(
                    consistency.limit
                )
            }.`,

            (
                needed !== null &&
                needed > 0
            )
                ? `${
                    formatPayoutMoney(
                        needed
                    )
                } zusätzlicher Net Profit erforderlich.`

                : "Weitere kontrollierte Green Days aufbauen.",

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    5. CYCLE PROFIT GOAL

    z. B. LucidPro
    =====================================
    */

    const payoutProfitGoal =
        toFiniteNumber(
            rules.payoutProfitGoal
        );


    if(
        payoutProfitGoal !== null &&
        payoutProfitGoal > 0 &&
        cycleProfit <
            payoutProfitGoal
    ) {

        const needed =
            payoutProfitGoal -
            cycleProfit;


        return buildPayoutResult(
            "BUILD",

            `${
                formatPayoutMoney(
                    needed
                )
            } bis zum Cycle Profit Goal.`,

            "Payout-Zyklus kontrolliert weiter aufbauen.",

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit,

                payoutProfitGoal,

                cycleProfitRemaining:
                    needed

            }
        );

    }


    /*
    =====================================
    POSITIVER CYCLE P&L

    z. B. LucidFlex / andere Programme
    =====================================
    */

    if(
        rules.requirePositiveCyclePnL ===
            true &&
        cycleProfit <= 0
    ) {

        return buildPayoutResult(
            "BUILD",
            "Payout Cycle ist noch nicht positiv.",
            "Cycle Net P&L über $0 aufbauen.",
            "funded",
            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    6. MINIMUM PAYOUT
    =====================================
    */

    const potentialAvailable =
        toFiniteNumber(
            payout.potentialAvailable
        ) ?? 0;


    const minPayout =
        toFiniteNumber(
            payout.minPayout
        ) ?? 0;


    if(
        potentialAvailable <
        minPayout
    ) {

        const stillNeeded =
            toFiniteNumber(
                payout.stillNeeded
            );


        return buildPayoutResult(
            "BUILD",
            "Minimum Payout noch nicht erreicht.",

            (
                stillNeeded !== null &&
                stillNeeded > 0
            )
                ? `${
                    formatPayoutMoney(
                        stillNeeded
                    )
                } bis zum Mindestpayout.`

                : "Account weiter kontrolliert aufbauen.",

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    7. PAYOUT READY
    =====================================
    */

    if(
        payout.eligible ===
        true
    ) {

        return buildPayoutResult(
            "READY",

            `${
                formatPayoutMoney(
                    payout.available
                )
            } aktuell payout-ready.`,

            "Payout prüfen und unnötiges Risiko vermeiden.",

            "funded",

            {

                payout,

                consistency,

                drawdown,

                dll,

                tradingDays,

                winningDays,

                cycleProfit

            }
        );

    }


    /*
    =====================================
    8. SONSTIGE RULE-BEDINGUNG
    =====================================
    */

    return buildPayoutResult(
        "WAIT",

        payout.reason ||
        "Payout-Bedingungen noch nicht vollständig erfüllt.",

        "Account weiter kontrolliert aufbauen.",

        "funded",

        {

            payout,

            consistency,

            drawdown,

            dll,

            tradingDays,

            winningDays,

            cycleProfit

        }
    );

}



/*
=========================================
CURRENT PROFIT
=========================================
*/

function getPayoutCurrentProfit(
    account
) {

    if(
        typeof getAccountCurrentProfit ===
        "function"
    ) {

        const value =
            Number(
                getAccountCurrentProfit(
                    account
                )
            );


        if(
            Number.isFinite(
                value
            )
        ) {

            return value;

        }

    }


    const balance =
        Number(
            account.balance
        );


    const startingBalance =
        Number(
            account.startingBalance
        );


    if(
        Number.isFinite(
            balance
        ) &&
        Number.isFinite(
            startingBalance
        )
    ) {

        return (
            balance -
            startingBalance
        );

    }


    return 0;

}



/*
=========================================
PAYOUT AVAILABILITY
=========================================
*/

function getPayoutAvailability(
    account
) {

    if(
        typeof getAccountPayoutAvailability !==
        "function"
    ) {

        return null;

    }


    return getAccountPayoutAvailability(
        account
    );

}



/*
=========================================
CONSISTENCY
=========================================
*/

function getPayoutConsistency(
    account
) {

    if(
        typeof getAccountConsistencyInfo !==
        "function"
    ) {

        return null;

    }


    return getAccountConsistencyInfo(
        account
    );

}



/*
=========================================
DRAWDOWN
=========================================
*/

function getPayoutDrawdown(
    account
) {

    if(
        typeof getAccountDrawdownInfo !==
        "function"
    ) {

        return null;

    }


    return getAccountDrawdownInfo(
        account
    );

}



/*
=========================================
DLL
=========================================
*/

function getPayoutDLL(
    account
) {

    if(
        typeof getAccountDLLInfo !==
        "function"
    ) {

        return null;

    }


    return getAccountDLLInfo(
        account
    );

}



/*
=========================================
TRADING DAYS
=========================================
*/

function getPayoutTradingDays(
    account
) {

    if(
        typeof getAccountTradingDayRequirement !==
        "function"
    ) {

        return null;

    }


    return getAccountTradingDayRequirement(
        account
    );

}



/*
=========================================
WINNING DAYS
=========================================
*/

function getPayoutWinningDays(
    account
) {

    if(
        typeof getAccountWinningDaysInfo !==
        "function"
    ) {

        return null;

    }


    return getAccountWinningDaysInfo(
        account
    );

}



/*
=========================================
PAYOUT CYCLE PROFIT
=========================================
*/

function getPayoutCycleProfit(
    account
) {

    if(
        typeof getAccountCycleDailyPnL ===
        "function"
    ) {

        const daily =
            getAccountCycleDailyPnL(
                account
            );


        if(
            daily &&
            typeof daily ===
                "object"
        ) {

            return Object.values(
                daily
            ).reduce(
                (
                    sum,
                    value
                ) => {

                    const number =
                        Number(
                            value
                        );


                    return (
                        sum +
                        (
                            Number.isFinite(
                                number
                            )
                                ? number
                                : 0
                        )
                    );

                },
                0
            );

        }

    }


    /*
    Solange noch kein Cycle Start
    gesetzt wurde, ist Current Profit
    unser Fallback.
    */

    return getPayoutCurrentProfit(
        account
    );

}

/*
=========================================
LOGIC HELPERS
=========================================
*/

function isCriticalDrawdown(
    drawdown
) {

    if(!drawdown) {

        return false;

    }


    const remaining =
        toFiniteNumber(
            drawdown.remaining
        );


    if(
        remaining ===
        null
    ) {

        return false;

    }


    return (
        remaining <=
        250
    );

}


function isConsistencyFailed(
    consistency
) {

    if(!consistency) {

        return false;

    }


    const current =
        toFiniteNumber(
            consistency.current
        );


    const limit =
        toFiniteNumber(
            consistency.limit
        );


    if(
        current === null ||
        limit === null
    ) {

        return false;

    }


    return (
        current >
        limit
    );

}


function toFiniteNumber(
    value
) {

    if(
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : null;

}


function clampPercent(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            number
        )
    );

}



/*
=========================================
RESULT BUILDER
=========================================
*/

function buildPayoutResult(
    status,
    message,
    action,
    mode,
    extra = {}
) {

    return {

        status,

        message,

        action,

        mode,

        ...extra

    };

}



/*
=========================================
FORMAT MONEY
=========================================
*/

function formatPayoutMoney(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        )
    ) {

        return "$0.00";

    }


    return number.toLocaleString(
        "en-US",
        {

            style:
                "currency",

            currency:
                "USD",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }
    );

}



/*
=========================================
FORMAT PERCENT
=========================================
*/

function formatPayoutPercent(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        )
    ) {

        return "--";

    }


    return (
        number.toFixed(
            1
        ) +
        "%"
    );

}
