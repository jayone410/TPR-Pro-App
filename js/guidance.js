/*
=========================================
TPR PRO AI
Account Guidance Engine v2
=========================================

MISSION:

Pro Account zwei getrennte Ebenen:

1. ACCOUNT GOAL
   Langfristiges Ziel des Accounts

   Beispiele:
   - BUILD EVALUATION
   - BUILD CONSISTENCY
   - BUILD PAYOUT
   - BUILD WINNING DAYS
   - PAYOUT READY
   - EVALUATION COMPLETE
   - PROTECT ACCOUNT

2. TODAY'S ACTION
   Was heute tatsächlich getan werden soll

   Beispiele:
   - TRADE NORMAL
   - TRADE DEFENSIVE
   - BUILD GREEN DAY
   - PROTECT PROFIT
   - STOP TODAY
   - NO TRADING REQUIRED

Account Drawdown und Daily Loss Limit
werden strikt getrennt behandelt.

=========================================
*/


/*
=========================================
MAIN
=========================================
*/

function buildAccountGuidance(
    account
) {

    if(!account) {

        return buildGuidanceResult({

            accountGoal:
                "CHECK ACCOUNT",

            accountGoalPriority:
                "critical",

            headline:
                "Accountdaten fehlen.",

            todayAction:
                "STOP TODAY",

            todayPriority:
                "critical",

            todayReason:
                "Keine gültigen Accountdaten.",

            nextAction:
                "Accountdaten prüfen.",

            riskMode:
                "PAUSE",

            targetToday:
                0,

            maxLossToday:
                0

        });

    }


    /*
    =====================================
    RULES
    =====================================
    */

    const rules =
        typeof getEffectiveRules ===
        "function"

            ? getEffectiveRules(
                account
            )

            : null;


    if(!rules) {

        return buildGuidanceResult({

            account,

            accountGoal:
                "CHECK RULES",

            accountGoalPriority:
                "critical",

            headline:
                "Keine gültigen Account-Regeln.",

            todayAction:
                "STOP TODAY",

            todayPriority:
                "critical",

            todayReason:
                "Rules konnten nicht geladen werden.",

            nextAction:
                "Programm und Rules prüfen.",

            riskMode:
                "PAUSE",

            targetToday:
                0,

            maxLossToday:
                0

        });

    }


    /*
    =====================================
    STAGE
    =====================================
    */

    const stage =
        String(
            account.stage ||
            rules.stage ||
            ""
        ).toLowerCase();


    /*
    =====================================
    ACCOUNT DATA
    =====================================
    */

    const currentProfit =
        getGuidanceCurrentProfit(
            account
        );


    const drawdown =
        getGuidanceDrawdown(
            account
        );


    const dll =
        getGuidanceDLL(
            account
        );


    const consistency =
        getGuidanceConsistency(
            account
        );


    const tradingDays =
        getGuidanceTradingDays(
            account
        );


    const winningDays =
        getGuidanceWinningDays(
            account
        );


    const payout =
        typeof analyzePayout ===
        "function"

            ? analyzePayout(
                account,
                rules
            )

            : null;


    /*
    =====================================
    BASE DATA
    =====================================
    */

    const base = {

        account,

        rules,

        stage,

        currentProfit,

        drawdown,

        dll,

        consistency,

        tradingDays,

        winningDays,

        payout

    };


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(
        stage ===
        "evaluation"
    ) {

        return buildEvaluationGuidance(
            base
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

        return buildFundedGuidance(
            base
        );

    }


    /*
    =====================================
    UNKNOWN STAGE
    =====================================
    */

    return buildGuidanceResult({

        ...base,

        accountGoal:
            "CHECK STAGE",

        accountGoalPriority:
            "critical",

        headline:
            "Account Stage unbekannt.",

        todayAction:
            "STOP TODAY",

        todayPriority:
            "critical",

        todayReason:
            "Evaluation/Funded konnte nicht bestimmt werden.",

        nextAction:
            "Stage im Rules Editor prüfen.",

        riskMode:
            "PAUSE",

        targetToday:
            0,

        maxLossToday:
            0

    });

}



/*
=========================================
EVALUATION GUIDANCE
=========================================
*/

function buildEvaluationGuidance(
    data
) {

    const {

        account,

        rules,

        currentProfit,

        drawdown,

        dll,

        consistency

    } = data;


    const warnings =
        [];


    /*
    =====================================
    ACCOUNT GOAL ERMITTELN
    =====================================

    Wichtig:

    Das langfristige Account-Ziel wird
    unabhängig davon berechnet, ob das
    DLL für HEUTE bereits ausgeschöpft ist.

    Dadurch kann z.B. gleichzeitig gelten:

    ACCOUNT GOAL:
    BUILD EVALUATION

    TODAY:
    STOP TODAY
    =====================================
    */


    let accountGoal =
        "BUILD EVALUATION";


    let accountGoalPriority =
        "normal";


    let headline =
        "Evaluation weiter aufbauen.";


    let nextAction =
        "Kontrolliert auf das Evaluation-Ziel hinarbeiten.";


    let targetRemaining =
        null;


    /*
    =====================================
    ACCOUNT DRAWDOWN KRITISCH
    =====================================
    */

    if(
        isGuidanceDrawdownCritical(
            drawdown
        )
    ) {

        accountGoal =
            "PROTECT ACCOUNT";


        accountGoalPriority =
            "critical";


        headline =
            formatGuidanceRemainingDrawdown(
                drawdown
            ) +
            " Remaining Drawdown.";


        nextAction =
            "Account-Buffer zuerst wieder aufbauen.";


        warnings.push(
            "Account Drawdown kritisch."
        );

    }


    /*
    =====================================
    CONSISTENCY
    =====================================

    Nur prüfen, wenn der Account nicht
    bereits im kritischen DD-Modus ist.
    =====================================
    */

    else if(
        isGuidanceConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            getGuidanceConsistencyNeeded(
                consistency
            );


        /*
        BUILD CONSISTENCY nur anzeigen,
        wenn tatsächlich zusätzlicher
        Profit erforderlich ist.

        Damit vermeiden wir:
        "$0.00 zusätzlicher Profit".
        */

        if(
            needed !== null &&
            needed > 0.01
        ) {

            accountGoal =
                "BUILD CONSISTENCY";


            accountGoalPriority =
                "high";


            headline =
                `${formatGuidanceMoney(
                    needed
                )} zusätzlicher Net Profit erforderlich.`;


            nextAction =
                "Kleine kontrollierte Green Days aufbauen. Best Day nicht unnötig vergrößern.";


            warnings.push(
                "Consistency über dem erlaubten Limit."
            );

        }

    }


    /*
    =====================================
    PROFIT TARGET

    Nur wenn Consistency / DD nicht
    bereits ein höheres Ziel erzeugt hat.
    =====================================
    */

    if(
        accountGoal ===
        "BUILD EVALUATION"
    ) {

        const profitTarget =
            guidanceFiniteNumber(
                rules.profitTarget
            );


        if(
            profitTarget !== null &&
            profitTarget > 0
        ) {

            targetRemaining =
                Math.max(
                    0,
                    profitTarget -
                    currentProfit
                );


            /*
            TARGET ERREICHT
            */

            if(
                targetRemaining <=
                0.01
            ) {

                accountGoal =
                    "EVALUATION COMPLETE";


                accountGoalPriority =
                    "complete";


                headline =
                    "Profit Target erreicht.";


                nextAction =
                    "Keine unnötigen Trades mehr. Evaluation-Abschluss prüfen.";

            }


            /*
            > 80 % DES TARGETS
            */

            else {

                const progress =
                    (
                        currentProfit /
                        profitTarget
                    ) *
                    100;


                if(
                    Number.isFinite(
                        progress
                    ) &&
                    progress >= 80
                ) {

                    accountGoal =
                        "PROTECT TARGET";


                    accountGoalPriority =
                        "high";


                    headline =
                        `${formatGuidanceMoney(
                            targetRemaining
                        )} bis zum Profit Target.`;


                    nextAction =
                        "Nur A+ Setups. Evaluation nicht durch aggressiven Target-Push gefährden.";

                }


                /*
                NORMALER BUILD
                */

                else {

                    headline =
                        `${formatGuidanceMoney(
                            targetRemaining
                        )} bis zum Profit Target.`;


                    nextAction =
                        "Evaluation kontrolliert weiter aufbauen.";

                }

            }

        }

    }


    /*
    =====================================
    TODAY'S ACTION
    =====================================
    */

    const today =
        buildTodayGuidance({

            account,

            rules,

            stage:
                "evaluation",

            accountGoal,

            accountGoalPriority,

            drawdown,

            dll,

            consistency,

            winningDays:
                null,

            targetRemaining

        });


    /*
    =====================================
    RESULT
    =====================================
    */

    return buildGuidanceResult({

        ...data,

        accountGoal,

        accountGoalPriority,

        headline,

        nextAction,

        targetRemaining,

        warnings:
            [
                ...warnings,
                ...today.warnings
            ],

        ...today

    });

}

/*
=========================================
FUNDED GUIDANCE
=========================================
*/

function buildFundedGuidance(
    data
) {

    const {

        account,

        rules,

        drawdown,

        dll,

        consistency,

        tradingDays,

        winningDays,

        payout

    } = data;


    const warnings =
        [];


    /*
    =====================================
    ACCOUNT GOAL
    =====================================
    */


    let accountGoal =
        "BUILD PAYOUT";


    let accountGoalPriority =
        "normal";


    let headline =
        "Funded Account weiter aufbauen.";


    let nextAction =
        "Payout-Ziel kontrolliert weiter aufbauen.";


    let payoutRemaining =
        null;


    let payoutAvailable =
        0;


    let daysRemaining =
        null;


    /*
    =====================================
    ACCOUNT DRAWDOWN KRITISCH
    =====================================
    */

    if(
        isGuidanceDrawdownCritical(
            drawdown
        )
    ) {

        accountGoal =
            "PROTECT ACCOUNT";


        accountGoalPriority =
            "critical";


        headline =
            formatGuidanceRemainingDrawdown(
                drawdown
            ) +
            " Remaining Drawdown.";


        nextAction =
            "Kein Payout-Push. Account-Buffer zuerst stabilisieren.";


        warnings.push(
            "Account Drawdown kritisch."
        );

    }


    /*
    =====================================
    TRADING DAYS
    =====================================
    */

    else if(
        tradingDays &&
        Number(
            tradingDays.remaining
        ) > 0
    ) {

        daysRemaining =
            Number(
                tradingDays.remaining
            );


        accountGoal =
            "BUILD DAYS";


        accountGoalPriority =
            "high";


        headline =
            `Noch ${
                daysRemaining
            } Handelstag(e) bis zur nächsten Payout-Stufe.`;


        nextAction =
            "Qualifying Days erfüllen. Tagesprofit nicht unnötig maximieren.";

    }


    /*
    =====================================
    WINNING DAYS
    =====================================
    */

    else if(
        winningDays &&
        Number(
            winningDays.remaining
        ) > 0
    ) {

        daysRemaining =
            Number(
                winningDays.remaining
            );


        const minimumDayProfit =
            guidanceFiniteNumber(
                winningDays
                    .minimumDayProfit
            );


        accountGoal =
            "BUILD WINNING DAYS";


        accountGoalPriority =
            "high";


        headline =
            `Noch ${
                daysRemaining
            } Winning Day(s) erforderlich.`;


        nextAction =
            minimumDayProfit !== null

                ? `Mindestens ${
                    formatGuidanceMoney(
                        minimumDayProfit
                    )
                } Tagesprofit erreichen und danach Account schützen.`

                : "Winning Day kontrolliert erreichen.";

    }


    /*
    =====================================
    CONSISTENCY
    =====================================
    */

    else if(
        isGuidanceConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            getGuidanceConsistencyNeeded(
                consistency
            );


        if(
            needed !== null &&
            needed > 0.01
        ) {

            accountGoal =
                "BUILD CONSISTENCY";


            accountGoalPriority =
                "high";


            headline =
                `${formatGuidanceMoney(
                    needed
                )} zusätzlicher Net Profit erforderlich.`;


            nextAction =
                "Kleine kontrollierte Green Days aufbauen. Best Day nicht weiter vergrößern.";


            warnings.push(
                "Consistency über dem erlaubten Limit."
            );

        }

    }


    /*
    =====================================
    PAYOUT READY
    =====================================
    */

    if(
        accountGoal ===
        "BUILD PAYOUT" &&
        payout &&
        payout.status ===
        "READY"
    ) {

        const available =
            guidanceFiniteNumber(
                payout
                    ?.payout
                    ?.available
            );


        payoutAvailable =
            available !== null
                ? available
                : 0;


        accountGoal =
            "PAYOUT READY";


        accountGoalPriority =
            "complete";


        headline =
            payoutAvailable > 0

                ? `${formatGuidanceMoney(
                    payoutAvailable
                )} payout-ready.`

                : "Payout verfügbar.";


        nextAction =
            "Payout prüfen. Unnötiges Trading vor Auszahlung vermeiden.";

    }


    /*
    =====================================
    PAYOUT NOCH NICHT READY
    =====================================
    */

    if(
        accountGoal ===
        "BUILD PAYOUT"
    ) {

        const stillNeeded =
            guidanceFiniteNumber(
                payout
                    ?.payout
                    ?.stillNeeded
            );


        if(
            stillNeeded !== null &&
            stillNeeded > 0.01
        ) {

            payoutRemaining =
                stillNeeded;


            headline =
                `${formatGuidanceMoney(
                    stillNeeded
                )} bis zum nächsten Payout.`;


            nextAction =
                "Payout-Balance kontrolliert aufbauen. Buffer nicht gefährden.";

        }


        else if(
            payout &&
            payout.message
        ) {

            headline =
                payout.message;


            nextAction =
                payout.action ||
                "Funded Account kontrolliert weiterführen.";

        }

    }


    /*
    =====================================
    TODAY'S ACTION
    =====================================
    */

    const today =
        buildTodayGuidance({

            account,

            rules,

            stage:
                "funded",

            accountGoal,

            accountGoalPriority,

            drawdown,

            dll,

            consistency,

            winningDays,

            payoutRemaining,

            payoutAvailable

        });


    /*
    =====================================
    RESULT
    =====================================
    */

    return buildGuidanceResult({

        ...data,

        accountGoal,

        accountGoalPriority,

        headline,

        nextAction,

        payoutRemaining,

        payoutAvailable,

        daysRemaining,

        warnings:
            [
                ...warnings,
                ...today.warnings
            ],

        ...today

    });

}



/*
=========================================
TODAY GUIDANCE
=========================================

Diese Funktion entscheidet ausschließlich:

Was soll HEUTE mit dem Account passieren?

Sie verändert NICHT das langfristige
Account Goal.

=========================================
*/

function buildTodayGuidance(
    data
) {

    const {

        account,

        rules,

        accountGoal,

        drawdown,

        dll,

        winningDays,

        targetRemaining,

        payoutRemaining

    } = data;


    const warnings =
        [];


    /*
    =====================================
    DEFAULT
    =====================================
    */

    let todayAction =
        "TRADE NORMAL";


    let todayPriority =
        "normal";


    let todayReason =
        "Account kann nach Plan gehandelt werden.";


    let riskMode =
        "NORMAL";


    let targetToday =
        getSuggestedTarget(
            account,
            rules,
            "normal"
        );


    let maxLossToday =
        getSuggestedMaxLoss(
            account,
            rules,
            drawdown,
            dll,
            "normal"
        );


    /*
    =====================================
    PAYOUT READY / EVAL COMPLETE
    =====================================
    */

    if(
        accountGoal ===
        "PAYOUT READY" ||
        accountGoal ===
        "EVALUATION COMPLETE"
    ) {

        return {

            todayAction:
                "NO TRADING REQUIRED",

            todayPriority:
                "complete",

            todayReason:
                accountGoal ===
                "PAYOUT READY"

                    ? "Payout-Ziel erreicht."

                    : "Evaluation-Ziel erreicht.",

            riskMode:
                "STOP",

            targetToday:
                0,

            maxLossToday:
                0,

            warnings

        };

    }


    /*
    =====================================
    DLL KRITISCH
    =====================================

    Daily Loss Limit ist ein HEUTIGES
    Limit und hat Vorrang vor allem
    anderen Tageszielen.

    Beispiel:
    Remaining DD = $500
    Remaining DLL = $9.80

    Account Goal:
    BUILD EVALUATION

    Today:
    STOP TODAY
    =====================================
    */

    if(
        isGuidanceDLLCritical(
            dll
        )
    ) {

        const remainingDLL =
            guidanceFiniteNumber(
                dll.remaining
            );


        warnings.push(
            "Daily Loss Limit nahezu ausgeschöpft."
        );


        return {

            todayAction:
                "STOP TODAY",

            todayPriority:
                "critical",

            todayReason:
                remainingDLL !== null

                    ? `${formatGuidanceMoney(
                        remainingDLL
                    )} DLL verbleibend.`

                    : "Daily Loss Limit kritisch.",

            riskMode:
                "PAUSE",

            targetToday:
                0,

            maxLossToday:
                0,

            warnings

        };

    }


    /*
    =====================================
    ACCOUNT DRAWDOWN KRITISCH
    =====================================
    */

    if(
        accountGoal ===
        "PROTECT ACCOUNT"
    ) {

        warnings.push(
            "Account-Drawdown kritisch."
        );


        return {

            todayAction:
                "PROTECT ACCOUNT",

            todayPriority:
                "critical",

            todayReason:
                formatGuidanceRemainingDrawdown(
                    drawdown
                ) +
                " Remaining Drawdown.",

            riskMode:
                "DEFENSIVE",

            targetToday:
                getSuggestedTarget(
                    account,
                    rules,
                    "defensive"
                ),

            maxLossToday:
                getConservativeStop(
                    drawdown,
                    dll
                ),

            warnings

        };

    }


    /*
    =====================================
    BUILD CONSISTENCY
    =====================================
    */

    if(
        accountGoal ===
        "BUILD CONSISTENCY"
    ) {

        todayAction =
            "TRADE DEFENSIVE";


        todayPriority =
            "high";


        todayReason =
            "Consistency verbessern, keinen neuen übergroßen Best Day erzeugen.";


        riskMode =
            "DEFENSIVE";


        targetToday =
            getSuggestedTarget(
                account,
                rules,
                "defensive"
            );


        maxLossToday =
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "defensive"
            );

    }


    /*
    =====================================
    BUILD DAYS
    =====================================
    */

    else if(
        accountGoal ===
        "BUILD DAYS"
    ) {

        todayAction =
            "COMPLETE TRADING DAY";


        todayPriority =
            "high";


        todayReason =
            "Heute zählt vor allem ein sauberer Qualifying Day.";


        riskMode =
            "DEFENSIVE";


        targetToday =
            getSuggestedTarget(
                account,
                rules,
                "defensive"
            );


        maxLossToday =
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "defensive"
            );

    }


    /*
    =====================================
    BUILD WINNING DAYS
    =====================================
    */

    else if(
        accountGoal ===
        "BUILD WINNING DAYS"
    ) {

        const minimumDayProfit =
            guidanceFiniteNumber(
                winningDays
                    ?.minimumDayProfit
            );


        todayAction =
            "BUILD GREEN DAY";


        todayPriority =
            "high";


        todayReason =
            minimumDayProfit !== null

                ? `${formatGuidanceMoney(
                    minimumDayProfit
                )} Mindestprofit für einen Winning Day.`

                : "Positiven Winning Day kontrolliert erreichen.";


        riskMode =
            "DEFENSIVE";


        targetToday =
            minimumDayProfit !== null

                ? minimumDayProfit

                : getSuggestedTarget(
                    account,
                    rules,
                    "defensive"
                );


        maxLossToday =
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "defensive"
            );

    }


    /*
    =====================================
    PROTECT TARGET
    =====================================
    */

    else if(
        accountGoal ===
        "PROTECT TARGET"
    ) {

        todayAction =
            "TRADE DEFENSIVE";


        todayPriority =
            "high";


        todayReason =
            "Evaluation ist nahe am Ziel. Kein aggressiver Target-Push.";


        riskMode =
            "DEFENSIVE";


        targetToday =
            getSuggestedTarget(
                account,
                rules,
                "defensive"
            );


        if(
            guidanceFiniteNumber(
                targetRemaining
            ) !==
            null
        ) {

            targetToday =
                Math.min(
                    targetToday,
                    Number(
                        targetRemaining
                    )
                );

        }


        maxLossToday =
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "defensive"
            );

    }


    /*
    =====================================
    BUILD PAYOUT
    =====================================
    */

    else if(
        accountGoal ===
        "BUILD PAYOUT"
    ) {

        todayAction =
            "BUILD PAYOUT";


        todayPriority =
            "normal";


        todayReason =
            "Payout-Ziel kontrolliert aufbauen, ohne Buffer zu gefährden.";


        riskMode =
            "NORMAL";


        targetToday =
            getSuggestedTarget(
                account,
                rules,
                "normal"
            );


        if(
            guidanceFiniteNumber(
                payoutRemaining
            ) !==
            null
        ) {

            targetToday =
                Math.min(
                    targetToday,
                    Number(
                        payoutRemaining
                    )
                );

        }


        maxLossToday =
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "normal"
            );

    }


    return {

        todayAction,

        todayPriority,

        todayReason,

        riskMode,

        targetToday:
            Math.max(
                0,
                Math.round(
                    Number(
                        targetToday
                    ) || 0
                )
            ),

        maxLossToday:
            Math.max(
                0,
                Math.round(
                    Number(
                        maxLossToday
                    ) || 0
                )
            ),

        warnings

    };

}

/*
=========================================
DATA HELPERS
=========================================
*/

function getGuidanceCurrentProfit(
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


function getGuidanceDrawdown(
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


function getGuidanceDLL(
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


function getGuidanceConsistency(
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


function getGuidanceTradingDays(
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


function getGuidanceWinningDays(
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
DRAWDOWN / DLL HELPERS
=========================================
*/

function isGuidanceDrawdownCritical(
    drawdown
) {

    if(!drawdown) {

        return false;

    }


    const remaining =
        guidanceFiniteNumber(
            drawdown.remaining
        );


    if(
        remaining ===
        null
    ) {

        return false;

    }


    /*
    Account-Level Drawdown.

    Das ist bewusst NICHT das DLL.

    Beispiel 25K Topstep Labs Static:

    Floor:
    $24,000

    Balance:
    $24,500.74

    Remaining DD:
    $500.74

    Dieser Wert darf nicht mit dem
    verbleibenden Daily Loss Limit
    verwechselt werden.
    */

    return (
        remaining <=
        250
    );

}


function isGuidanceDLLCritical(
    dll
) {

    if(!dll) {

        return false;

    }


    const remaining =
        guidanceFiniteNumber(
            dll.remaining
        );


    if(
        remaining ===
        null
    ) {

        return false;

    }


    /*
    Daily Loss Limit = Tagesrisiko.

    Unter $50 Rest-DLL betrachten
    wir den Handelstag als beendet.

    Das ändert NICHT das Account Goal.
    */

    return (
        remaining <=
        50
    );

}


function formatGuidanceRemainingDrawdown(
    drawdown
) {

    const remaining =
        guidanceFiniteNumber(
            drawdown?.remaining
        );


    if(
        remaining ===
        null
    ) {

        return "--";

    }


    return formatGuidanceMoney(
        remaining
    );

}



/*
=========================================
CONSISTENCY HELPERS
=========================================
*/

function isGuidanceConsistencyFailed(
    consistency
) {

    if(!consistency) {

        return false;

    }


    const current =
        guidanceFiniteNumber(
            consistency.current
        );


    const limit =
        guidanceFiniteNumber(
            consistency.limit
        );


    if(
        current ===
        null ||
        limit ===
        null
    ) {

        return false;

    }


    return (
        current >
        limit
    );

}


function getGuidanceConsistencyNeeded(
    consistency
) {

    if(!consistency) {

        return null;

    }


    const needed =
        guidanceFiniteNumber(
            consistency
                .minimumProfitNeeded
        );


    if(
        needed ===
        null
    ) {

        return null;

    }


    return Math.max(
        0,
        needed
    );

}



/*
=========================================
TARGET ENGINE
=========================================
*/

function getSuggestedTarget(
    account,
    rules,
    mode
) {

    /*
    Zuerst manuellen / Rules-Wert
    verwenden.
    */

    const configured =
        guidanceFiniteNumber(
            rules
                ?.maxDailyProfitTarget
        );


    let base =
        (
            configured !==
            null &&
            configured > 0
        )

            ? configured

            : 300;


    /*
    Defensive Mode
    */

    if(
        mode ===
        "defensive"
    ) {

        base *=
            0.60;

    }


    /*
    Protect Mode
    */

    if(
        mode ===
        "protect"
    ) {

        base *=
            0.40;

    }


    return Math.max(
        0,
        Math.round(
            base
        )
    );

}



/*
=========================================
MAX LOSS ENGINE
=========================================
*/

function getSuggestedMaxLoss(
    account,
    rules,
    drawdown,
    dll,
    mode
) {

    const configured =
        guidanceFiniteNumber(
            rules
                ?.maxDailyLoss
        );


    let maxLoss =
        (
            configured !==
            null &&
            configured > 0
        )

            ? configured

            : 300;


    /*
    =====================================
    ACCOUNT DRAWDOWN
    =====================================

    Maximal 25 % des verfügbaren
    Account Drawdowns als Tagesrisiko.

    Bei Static Accounts bleibt der
    Drawdown Floor statisch.

    Beispiel:
    Remaining DD $500
    → max $125 aus DD-Sicht.
    */

    const ddRemaining =
        guidanceFiniteNumber(
            drawdown
                ?.remaining
        );


    if(
        ddRemaining !==
        null &&
        ddRemaining > 0
    ) {

        maxLoss =
            Math.min(
                maxLoss,
                ddRemaining *
                0.25
            );

    }


    /*
    =====================================
    DAILY LOSS LIMIT
    =====================================

    DLL ist ein separates Tageslimit.
    */

    const dllRemaining =
        guidanceFiniteNumber(
            dll
                ?.remaining
        );


    if(
        dllRemaining !==
        null &&
        dllRemaining > 0
    ) {

        maxLoss =
            Math.min(
                maxLoss,
                dllRemaining
            );

    }


    /*
    =====================================
    DEFENSIVE
    =====================================
    */

    if(
        mode ===
        "defensive"
    ) {

        maxLoss *=
            0.60;

    }


    /*
    =====================================
    PROTECT
    =====================================
    */

    if(
        mode ===
        "protect"
    ) {

        maxLoss *=
            0.40;

    }


    return Math.max(
        0,
        Math.round(
            maxLoss
        )
    );

}



/*
=========================================
CONSERVATIVE STOP
=========================================
*/

function getConservativeStop(
    drawdown,
    dll
) {

    const limits =
        [];


    const ddRemaining =
        guidanceFiniteNumber(
            drawdown
                ?.remaining
        );


    const dllRemaining =
        guidanceFiniteNumber(
            dll
                ?.remaining
        );


    /*
    Nur 15 % des Account-DD
    riskieren, wenn Account bereits
    im Protect-Modus ist.
    */

    if(
        ddRemaining !==
        null &&
        ddRemaining > 0
    ) {

        limits.push(
            ddRemaining *
                0.15
        );

    }


    /*
    Maximal 25 % des verbleibenden DLL
    im Protect-Modus.
    */

    if(
        dllRemaining !==
        null &&
        dllRemaining > 0
    ) {

        limits.push(
            dllRemaining *
                0.25
        );

    }


    if(
        limits.length ===
        0
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.round(
            Math.min(
                ...limits
            )
        )
    );

}



/*
=========================================
NUMBER HELPER
=========================================
*/

function guidanceFiniteNumber(
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



/*
=========================================
FORMAT MONEY
=========================================
*/

function formatGuidanceMoney(
    value
) {

    const number =
        guidanceFiniteNumber(
            value
        );


    if(
        number ===
        null
    ) {

        return "--";

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
RESULT BUILDER
=========================================
*/

function buildGuidanceResult(
    data
) {

    const warnings =
        Array.isArray(
            data.warnings
        )
            ? data.warnings
            : [];


    const accountGoal =
        data.accountGoal ||
        data.status ||
        "CHECK";


    const todayAction =
        data.todayAction ||
        (
            data.riskMode ===
            "PAUSE"

                ? "STOP TODAY"

                : "TRADE NORMAL"
        );


    return {

        /*
        =====================================
        ACCOUNT META
        =====================================
        */

        accountId:
            data.account?.id ||
            null,

        accountName:
            data.account?.accountName ||
            "",

        provider:
            data.account?.provider ||
            "",

        program:
            data.account?.program ||
            "",

        stage:
            data.stage ||
            data.account?.stage ||
            "",


        /*
        =====================================
        ACCOUNT GOAL
        =====================================
        */

        accountGoal,

        accountGoalPriority:
            data.accountGoalPriority ||
            "normal",

        headline:
            data.headline ||
            "",

        nextAction:
            data.nextAction ||
            "",


        /*
        =====================================
        TODAY
        =====================================
        */

        todayAction,

        todayPriority:
            data.todayPriority ||
            "normal",

        todayReason:
            data.todayReason ||
            "",

        riskMode:
            data.riskMode ||
            "NORMAL",

        targetToday:
            Math.max(
                0,
                Math.round(
                    Number(
                        data.targetToday
                    ) || 0
                )
            ),

        maxLossToday:
            Math.max(
                0,
                Math.round(
                    Number(
                        data.maxLossToday
                    ) || 0
                )
            ),


        /*
        =====================================
        ACCOUNT STATE
        =====================================
        */

        currentProfit:
            Number(
                data.currentProfit
            ) || 0,

        targetRemaining:
            data.targetRemaining ??
            null,

        payoutRemaining:
            data.payoutRemaining ??
            null,

        payoutAvailable:
            data.payoutAvailable ??
            0,

        daysRemaining:
            data.daysRemaining ??
            null,


        /*
        =====================================
        RULE DATA
        =====================================
        */

        drawdown:
            data.drawdown ||
            null,

        dll:
            data.dll ||
            null,

        consistency:
            data.consistency ||
            null,

        tradingDays:
            data.tradingDays ||
            null,

        winningDays:
            data.winningDays ||
            null,

        payout:
            data.payout ||
            null,


        /*
        =====================================
        WARNINGS
        =====================================
        */

        warnings

    };

}



/*
=========================================
GUIDANCE PRIORITY SCORE
=========================================

Hilft später für TODAY'S PRIORITIES.

Höhere Zahl =
weiter oben im Dashboard anzeigen.
=========================================
*/

function getGuidancePriorityScore(
    guidance
) {

    if(!guidance) {

        return 0;

    }


    /*
    =====================================
    TODAY PRIORITY
    =====================================
    */

    const todayPriority =
        String(
            guidance.todayPriority ||
            ""
        ).toLowerCase();


    if(
        todayPriority ===
        "critical"
    ) {

        return 100;

    }


    /*
    =====================================
    ACCOUNT PRIORITY
    =====================================
    */

    const accountPriority =
        String(
            guidance.accountGoalPriority ||
            ""
        ).toLowerCase();


    if(
        accountPriority ===
        "critical"
    ) {

        return 90;

    }


    /*
    =====================================
    PAYOUT READY / COMPLETE
    =====================================
    */

    if(
        accountPriority ===
        "complete"
    ) {

        return 80;

    }


    /*
    =====================================
    HIGH
    =====================================
    */

    if(
        todayPriority ===
        "high" ||
        accountPriority ===
        "high"
    ) {

        return 70;

    }


    /*
    =====================================
    NORMAL
    =====================================
    */

    return 50;

}



/*
=========================================
ALL ACCOUNT GUIDANCE
=========================================

Später für Mission Control / ToDo List.
=========================================
*/

function buildAllAccountGuidance(
    accountList = null
) {

    const source =
        Array.isArray(
            accountList
        )

            ? accountList

            : (
                Array.isArray(
                    accounts
                )
                    ? accounts
                    : []
            );


    return source
        .map(
            account =>
                buildAccountGuidance(
                    account
                )
        )
        .sort(
            (
                a,
                b
            ) => {

                return (
                    getGuidancePriorityScore(
                        b
                    ) -
                    getGuidancePriorityScore(
                        a
                    )
                );

            }
        );

}



/*
=========================================
GUIDANCE SUMMARY
=========================================

Kurze Portfolio-Zusammenfassung für
Mission Control.
=========================================
*/

function getGuidanceSummary(
    accountList = null
) {

    const guidance =
        buildAllAccountGuidance(
            accountList
        );


    let stopToday =
        0;


    let defensive =
        0;


    let normal =
        0;


    let payoutReady =
        0;


    let evaluationsComplete =
        0;


    let needsAction =
        0;


    guidance.forEach(
        item => {

            /*
            STOP
            */

            if(
                item.todayAction ===
                "STOP TODAY"
            ) {

                stopToday++;

            }


            /*
            DEFENSIVE
            */

            if(
                item.riskMode ===
                "DEFENSIVE"
            ) {

                defensive++;

            }


            /*
            NORMAL
            */

            if(
                item.riskMode ===
                "NORMAL"
            ) {

                normal++;

            }


            /*
            PAYOUT READY
            */

            if(
                item.accountGoal ===
                "PAYOUT READY"
            ) {

                payoutReady++;

            }


            /*
            EVAL COMPLETE
            */

            if(
                item.accountGoal ===
                "EVALUATION COMPLETE"
            ) {

                evaluationsComplete++;

            }


            /*
            NEED ACTION
            */

            if(
                item.accountGoal !==
                "PAYOUT READY" &&
                item.accountGoal !==
                "EVALUATION COMPLETE"
            ) {

                needsAction++;

            }

        }
    );


    return {

        accounts:
            guidance.length,

        stopToday,

        defensive,

        normal,

        payoutReady,

        evaluationsComplete,

        needsAction

    };

}



/*
=========================================
DEBUG TABLE
=========================================

Kann direkt in der Browser-Konsole
aufgerufen werden:

debugAccountGuidance();

=========================================
*/

function debugAccountGuidance() {

    const guidance =
        buildAllAccountGuidance();


    console.table(
        guidance.map(
            item => ({

                account:
                    item.accountName,

                stage:
                    item.stage,

                accountGoal:
                    item.accountGoal,

                accountPriority:
                    item.accountGoalPriority,

                headline:
                    item.headline,

                today:
                    item.todayAction,

                todayPriority:
                    item.todayPriority,

                reason:
                    item.todayReason,

                riskMode:
                    item.riskMode,

                target:
                    item.targetToday,

                stop:
                    item.maxLossToday,

                remainingDD:
                    item.drawdown &&
                    Number.isFinite(
                        Number(
                            item.drawdown.remaining
                        )
                    )

                        ? Number(
                            item.drawdown.remaining
                        ).toFixed(2)

                        : "--",

                remainingDLL:
                    item.dll &&
                    Number.isFinite(
                        Number(
                            item.dll.remaining
                        )
                    )

                        ? Number(
                            item.dll.remaining
                        ).toFixed(2)

                        : "--"

            }))
    );


    return guidance;

}


