/*
=========================================
TPR PRO AI
Account Guidance Engine v1
=========================================

Ziel:
Pro Account eine klare Handlungsempfehlung:

- Wo steht der Account?
- Was fehlt bis zum nächsten Ziel?
- Was ist heute die Priorität?
- Wie viel Risiko ist sinnvoll?
- Was soll vermieden werden?

=========================================
*/


/*
=========================================
MAIN
=========================================
*/

function buildAccountGuidance(account) {

    if(!account) {

        return buildGuidanceResult({
            status: "CHECK",
            priority: "high",
            headline: "Accountdaten fehlen.",
            nextAction:
                "Account prüfen.",
            riskMode:
                "PAUSE"
        });

    }


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
            status: "CHECK RULES",
            priority: "high",
            headline:
                "Keine gültigen Account-Regeln.",
            nextAction:
                "Programm und Rules prüfen.",
            riskMode:
                "PAUSE"
        });

    }


    const stage =
        String(
            account.stage ||
            rules.stage ||
            ""
        ).toLowerCase();


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


    const payoutAnalysis =
        typeof analyzePayout ===
        "function"

            ? analyzePayout(
                account,
                rules
            )

            : null;


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

        payout:
            payoutAnalysis

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


    return buildGuidanceResult({
        ...base,

        status:
            "CHECK STAGE",

        priority:
            "high",

        headline:
            "Account Stage unbekannt.",

        nextAction:
            "Stage im Rules Editor prüfen.",

        riskMode:
            "PAUSE"

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
        consistency,
        payout
    } = data;


    const warnings =
        [];


    /*
    =====================================
    DRAWDOWN RISIKO
    =====================================
    */

    if(
        isGuidanceDrawdownCritical(
            drawdown
        )
    ) {

        warnings.push(
            "Drawdown kritisch."
        );


        return buildGuidanceResult({

            ...data,

            status:
                "PROTECT ACCOUNT",

            priority:
                "critical",

            headline:
                "Account steht nahe am Drawdown-Limit.",

            nextAction:
                "Nicht auf das Profit Target pushen. Kapital schützen.",

            riskMode:
                "PAUSE",

            targetToday:
                0,

            maxLossToday:
                getConservativeStop(
                    drawdown,
                    dll
                ),

            warnings

        });

    }


    /*
    =====================================
    CONSISTENCY
    =====================================
    */

    if(
        isGuidanceConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            Number(
                consistency
                    ?.minimumProfitNeeded
            );


        warnings.push(
            "Consistency über dem erlaubten Limit."
        );


        return buildGuidanceResult({

            ...data,

            status:
                "BUILD CONSISTENCY",

            priority:
                "high",

            headline:
                Number.isFinite(
                    needed
                )
                    ? `$${needed.toFixed(
                        2
                    )} zusätzlicher Net Profit erforderlich.`
                    : "Consistency muss verbessert werden.",

            nextAction:
                "Kleine kontrollierte Green Days aufbauen. Kein großer Winning Day.",

            riskMode:
                "DEFENSIVE",

            targetToday:
                getSuggestedTarget(
                    account,
                    rules,
                    "defensive"
                ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "defensive"
                ),

            warnings

        });

    }


    /*
    =====================================
    PROFIT TARGET
    =====================================
    */

    const profitTarget =
        Number(
            rules.profitTarget
        );


    if(
        Number.isFinite(
            profitTarget
        ) &&
        profitTarget > 0
    ) {

        const remaining =
            Math.max(
                0,
                profitTarget -
                currentProfit
            );


        if(
            remaining <= 0
        ) {

            return buildGuidanceResult({

                ...data,

                status:
                    "EVALUATION COMPLETE",

                priority:
                    "complete",

                headline:
                    "Profit Target erreicht.",

                nextAction:
                    "Keine unnötigen Trades mehr. Evaluation-Abschluss prüfen.",

                riskMode:
                    "STOP",

                targetToday:
                    0,

                maxLossToday:
                    0,

                targetRemaining:
                    0,

                warnings

            });

        }


        const progress =
            (
                currentProfit /
                profitTarget
            ) *
            100;


        /*
        > 80 % Target
        */

        if(
            progress >=
            80
        ) {

            warnings.push(
                "Evaluation fast abgeschlossen."
            );


            return buildGuidanceResult({

                ...data,

                status:
                    "PROTECT TARGET",

                priority:
                    "high",

                headline:
                    `$${remaining.toFixed(
                        2
                    )} bis zum Profit Target.`,

                nextAction:
                    "Nur A+ Setups. Kein aggressiver Target-Push.",

                riskMode:
                    "DEFENSIVE",

                targetToday:
                    Math.min(
                        remaining,
                        getSuggestedTarget(
                            account,
                            rules,
                            "defensive"
                        )
                    ),

                maxLossToday:
                    getSuggestedMaxLoss(
                        account,
                        rules,
                        drawdown,
                        dll,
                        "defensive"
                    ),

                targetRemaining:
                    remaining,

                warnings

            });

        }


        /*
        Normaler Eval Build
        */

        return buildGuidanceResult({

            ...data,

            status:
                "BUILD EVALUATION",

            priority:
                "normal",

            headline:
                `$${remaining.toFixed(
                    2
                )} bis zum Profit Target.`,

            nextAction:
                "Kontrolliert auf das Evaluation-Ziel hinarbeiten.",

            riskMode:
                "NORMAL",

            targetToday:
                Math.min(
                    remaining,
                    getSuggestedTarget(
                        account,
                        rules,
                        "normal"
                    )
                ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "normal"
                ),

            targetRemaining:
                remaining,

            warnings

        });

    }


    /*
    Kein Target definiert
    */

    return buildGuidanceResult({

        ...data,

        status:
            payout?.status ||
            "EVALUATION",

        priority:
            "normal",

        headline:
            payout?.message ||
            "Evaluation aktiv.",

        nextAction:
            payout?.action ||
            "Account kontrolliert weiterführen.",

        riskMode:
            "NORMAL",

        targetToday:
            getSuggestedTarget(
                account,
                rules,
                "normal"
            ),

        maxLossToday:
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "normal"
            ),

        warnings

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
    DRAWDOWN
    =====================================
    */

    if(
        isGuidanceDrawdownCritical(
            drawdown
        )
    ) {

        warnings.push(
            "Remaining Drawdown kritisch."
        );


        return buildGuidanceResult({

            ...data,

            status:
                "PROTECT ACCOUNT",

            priority:
                "critical",

            headline:
                "Account steht nahe am maximalen Verlustlimit.",

            nextAction:
                "Kein Payout-Push. Account zuerst stabilisieren.",

            riskMode:
                "PAUSE",

            targetToday:
                0,

            maxLossToday:
                getConservativeStop(
                    drawdown,
                    dll
                ),

            warnings

        });

    }


    /*
    =====================================
    TRADING DAYS
    =====================================
    */

    if(
        tradingDays &&
        Number(
            tradingDays.remaining
        ) > 0
    ) {

        const remaining =
            Number(
                tradingDays.remaining
            );


        return buildGuidanceResult({

            ...data,

            status:
                "BUILD DAYS",

            priority:
                "high",

            headline:
                `Noch ${remaining} Handelstag(e) bis zur nächsten Payout-Stufe.`,

            nextAction:
                "Qualifying Days erfüllen. Nicht auf maximalen Tagesprofit pushen.",

            riskMode:
                "DEFENSIVE",

            targetToday:
                getSuggestedTarget(
                    account,
                    rules,
                    "defensive"
                ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "defensive"
                ),

            daysRemaining:
                remaining,

            warnings

        });

    }


    /*
    =====================================
    WINNING DAYS
    =====================================
    */

    if(
        winningDays &&
        Number(
            winningDays.remaining
        ) > 0
    ) {

        const remaining =
            Number(
                winningDays.remaining
            );


        const minDay =
            Number(
                winningDays
                    .minimumDayProfit
            );


        return buildGuidanceResult({

            ...data,

            status:
                "BUILD WINNING DAYS",

            priority:
                "high",

            headline:
                `Noch ${remaining} Winning Day(s) erforderlich.`,

            nextAction:
                Number.isFinite(
                    minDay
                )
                    ? `Tagesziel mindestens $${minDay.toFixed(
                        2
                    )}, danach Account schützen.`
                    : "Winning Day kontrolliert erreichen.",

            riskMode:
                "DEFENSIVE",

            targetToday:
                Number.isFinite(
                    minDay
                )
                    ? minDay
                    : getSuggestedTarget(
                        account,
                        rules,
                        "defensive"
                    ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "defensive"
                ),

            daysRemaining:
                remaining,

            warnings

        });

    }


    /*
    =====================================
    CONSISTENCY
    =====================================
    */

    if(
        isGuidanceConsistencyFailed(
            consistency
        )
    ) {

        const needed =
            Number(
                consistency
                    ?.minimumProfitNeeded
            );


        warnings.push(
            "Consistency über Limit."
        );


        return buildGuidanceResult({

            ...data,

            status:
                "BUILD CONSISTENCY",

            priority:
                "high",

            headline:
                Number.isFinite(
                    needed
                )
                    ? `$${needed.toFixed(
                        2
                    )} zusätzlicher Net Profit erforderlich.`
                    : "Consistency verbessern.",

            nextAction:
                "Kleine kontrollierte Green Days. Best Day nicht weiter vergrößern.",

            riskMode:
                "DEFENSIVE",

            targetToday:
                getSuggestedTarget(
                    account,
                    rules,
                    "defensive"
                ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "defensive"
                ),

            warnings

        });

    }


    /*
    =====================================
    PAYOUT READY
    =====================================
    */

    if(
        payout &&
        payout.status ===
        "READY"
    ) {

        const available =
            Number(
                payout
                    ?.payout
                    ?.available
            );


        return buildGuidanceResult({

            ...data,

            status:
                "PAYOUT READY",

            priority:
                "complete",

            headline:
                Number.isFinite(
                    available
                )
                    ? `$${available.toFixed(
                        2
                    )} payout-ready.`
                    : "Payout verfügbar.",

            nextAction:
                "Payout prüfen. Unnötiges Trading vor Auszahlung vermeiden.",

            riskMode:
                "PROTECT",

            targetToday:
                0,

            maxLossToday:
                0,

            payoutAvailable:
                Number.isFinite(
                    available
                )
                    ? available
                    : 0,

            warnings

        });

    }


    /*
    =====================================
    PAYOUT BUILD
    =====================================
    */

    const stillNeeded =
        Number(
            payout
                ?.payout
                ?.stillNeeded
        );


    if(
        Number.isFinite(
            stillNeeded
        ) &&
        stillNeeded > 0
    ) {

        return buildGuidanceResult({

            ...data,

            status:
                "BUILD PAYOUT",

            priority:
                "normal",

            headline:
                `$${stillNeeded.toFixed(
                    2
                )} bis zum nächsten Payout.`,

            nextAction:
                "Kontrolliert Payout-Balance aufbauen. Buffer nicht gefährden.",

            riskMode:
                "NORMAL",

            targetToday:
                Math.min(
                    stillNeeded,
                    getSuggestedTarget(
                        account,
                        rules,
                        "normal"
                    )
                ),

            maxLossToday:
                getSuggestedMaxLoss(
                    account,
                    rules,
                    drawdown,
                    dll,
                    "normal"
                ),

            payoutRemaining:
                stillNeeded,

            warnings

        });

    }


    /*
    Sonstiger Funded Zustand
    */

    return buildGuidanceResult({

        ...data,

        status:
            payout?.status ||
            "FUNDED",

        priority:
            "normal",

        headline:
            payout?.message ||
            "Funded Account aktiv.",

        nextAction:
            payout?.action ||
            "Account kontrolliert weiter aufbauen.",

        riskMode:
            "NORMAL",

        targetToday:
            getSuggestedTarget(
                account,
                rules,
                "normal"
            ),

        maxLossToday:
            getSuggestedMaxLoss(
                account,
                rules,
                drawdown,
                dll,
                "normal"
            ),

        warnings

    });

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


    return (
        Number(
            account.balance
        ) -
        Number(
            account.startingBalance
        )
    ) || 0;

}


function getGuidanceDrawdown(
    account
) {

    return (
        typeof getAccountDrawdownInfo ===
        "function"
    )
        ? getAccountDrawdownInfo(
            account
        )
        : null;

}


function getGuidanceDLL(
    account
) {

    return (
        typeof getAccountDLLInfo ===
        "function"
    )
        ? getAccountDLLInfo(
            account
        )
        : null;

}


function getGuidanceConsistency(
    account
) {

    return (
        typeof getAccountConsistencyInfo ===
        "function"
    )
        ? getAccountConsistencyInfo(
            account
        )
        : null;

}


function getGuidanceTradingDays(
    account
) {

    return (
        typeof getAccountTradingDayRequirement ===
        "function"
    )
        ? getAccountTradingDayRequirement(
            account
        )
        : null;

}


function getGuidanceWinningDays(
    account
) {

    return (
        typeof getAccountWinningDaysInfo ===
        "function"
    )
        ? getAccountWinningDaysInfo(
            account
        )
        : null;

}



/*
=========================================
RISK HELPERS
=========================================
*/

function isGuidanceDrawdownCritical(
    drawdown
) {

    if(!drawdown) {

        return false;

    }


    const remaining =
        Number(
            drawdown.remaining
        );


    if(
        !Number.isFinite(
            remaining
        )
    ) {

        return false;

    }


    return (
        remaining <=
        250
    );

}


function isGuidanceConsistencyFailed(
    consistency
) {

    if(!consistency) {

        return false;

    }


    const current =
        Number(
            consistency.current
        );


    const limit =
        Number(
            consistency.limit
        );


    if(
        !Number.isFinite(
            current
        ) ||
        !Number.isFinite(
            limit
        )
    ) {

        return false;

    }


    return (
        current >
        limit
    );

}



/*
=========================================
TARGET / STOP ENGINE v1
=========================================
*/

function getSuggestedTarget(
    account,
    rules,
    mode
) {

    const configured =
        Number(
            rules
                ?.maxDailyProfitTarget
        );


    let base =
        Number.isFinite(
            configured
        ) &&
        configured > 0

            ? configured

            : 300;


    if(
        mode ===
        "defensive"
    ) {

        base *=
            0.60;

    }


    return Math.round(
        base
    );

}


function getSuggestedMaxLoss(
    account,
    rules,
    drawdown,
    dll,
    mode
) {

    let configured =
        Number(
            rules
                ?.maxDailyLoss
        );


    if(
        !Number.isFinite(
            configured
        ) ||
        configured <= 0
    ) {

        configured =
            300;

    }


    const ddRemaining =
        Number(
            drawdown?.remaining
        );


    const dllRemaining =
        Number(
            dll?.remaining
        );


    let maxLoss =
        configured;


    /*
    Nie mehr als 25 % des
    Remaining Drawdowns riskieren.
    */

    if(
        Number.isFinite(
            ddRemaining
        ) &&
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
    DLL beachten
    */

    if(
        Number.isFinite(
            dllRemaining
        ) &&
        dllRemaining > 0
    ) {

        maxLoss =
            Math.min(
                maxLoss,
                dllRemaining
            );

    }


    if(
        mode ===
        "defensive"
    ) {

        maxLoss *=
            0.60;

    }


    return Math.max(
        0,
        Math.round(
            maxLoss
        )
    );

}


function getConservativeStop(
    drawdown,
    dll
) {

    const ddRemaining =
        Number(
            drawdown?.remaining
        );


    const dllRemaining =
        Number(
            dll?.remaining
        );


    const limits =
        [];


    if(
        Number.isFinite(
            ddRemaining
        ) &&
        ddRemaining > 0
    ) {

        limits.push(
            ddRemaining *
            0.15
        );

    }


    if(
        Number.isFinite(
            dllRemaining
        ) &&
        dllRemaining > 0
    ) {

        limits.push(
            dllRemaining *
            0.25
        );

    }


    if(
        limits.length === 0
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
RESULT BUILDER
=========================================
*/

function buildGuidanceResult(
    data
) {

    return {

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

        status:
            data.status ||
            "CHECK",

        priority:
            data.priority ||
            "normal",

        headline:
            data.headline ||
            "",

        nextAction:
            data.nextAction ||
            "",

        riskMode:
            data.riskMode ||
            "NORMAL",

        targetToday:
            Number(
                data.targetToday
            ) || 0,

        maxLossToday:
            Number(
                data.maxLossToday
            ) || 0,

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

        warnings:
            Array.isArray(
                data.warnings
            )
                ? data.warnings
                : []

    };

}
