/*
=========================================
TPR PRO AI
Payout / Evaluation Engine v2
=========================================
*/


function analyzePayout(
    account,
    rules
) {

    /*
    =====================================
    FALLBACK RULES
    =====================================
    */

    if(!rules) {

        return {

            status:
                "--",

            message:
                "Keine Account-Regeln verfügbar.",

            action:
                "Rules prüfen.",

            mode:
                "unknown"

        };

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

    return {

        status:
            "CHECK",

        message:
            "Account Stage unbekannt.",

        action:
            "Stage im Rules Editor prüfen.",

        mode:
            "unknown"

    };

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
        typeof getAccountCurrentProfit ===
        "function"

            ? Number(
                getAccountCurrentProfit(
                    account
                )
            )

            : (
                Number(
                    account.balance
                ) -
                Number(
                    account.startingBalance
                )
            );


    const profitTarget =
        Number(
            rules.profitTarget
        );


    const drawdown =
        typeof getAccountDrawdownInfo ===
        "function"

            ? getAccountDrawdownInfo(
                account
            )

            : null;


    const consistency =
        typeof getAccountConsistencyInfo ===
        "function"

            ? getAccountConsistencyInfo(
                account
            )

            : null;


    /*
    Kein Profit Target vorhanden
    */

    if(
        !Number.isFinite(
            profitTarget
        ) ||
        profitTarget <= 0
    ) {

        return {

            status:
                "EVAL",

            message:
                "Evaluation aktiv.",

            action:
                "Account-Regeln beachten.",

            mode:
                "evaluation",

            currentProfit,

            profitTarget:
                null,

            targetRemaining:
                null,

            progressPercent:
                null,

            drawdown,

            consistency

        };

    }


    const targetRemaining =
        Math.max(
            0,
            profitTarget -
            currentProfit
        );


    const progressPercent =
        Math.max(
            0,
            Math.min(
                100,
                (
                    currentProfit /
                    profitTarget
                ) *
                100
            )
        );


    /*
    =====================================
    TARGET ERREICHT
    =====================================
    */

    if(
        targetRemaining <=
        0
    ) {

        return {

            status:
                "TARGET",

            message:
                "Profit Target erreicht.",

            action:
                "Keine unnötigen Trades mehr. Evaluation-Abschluss prüfen.",

            mode:
                "evaluation",

            currentProfit,

            profitTarget,

            targetRemaining:
                0,

            progressPercent:
                100,

            drawdown,

            consistency

        };

    }


    /*
    =====================================
    DRAWDOWN KRITISCH
    =====================================
    */

    if(
        drawdown &&
        Number.isFinite(
            Number(
                drawdown.remaining
            )
        ) &&
        Number(
            drawdown.remaining
        ) <= 250
    ) {

        return {

            status:
                "RISK",

            message:
                "Evaluation Drawdown kritisch.",

            action:
                "Kapital schützen. Nur A+ Setups oder pausieren.",

            mode:
                "evaluation",

            currentProfit,

            profitTarget,

            targetRemaining,

            progressPercent,

            drawdown,

            consistency

        };

    }


    /*
    =====================================
    CONSISTENCY ZU HOCH
    =====================================
    */

    if(
        consistency &&
        Number.isFinite(
            Number(
                consistency.current
            )
        ) &&
        Number.isFinite(
            Number(
                consistency.limit
            )
        ) &&
        Number(
            consistency.current
        ) >
        Number(
            consistency.limit
        )
    ) {

        return {

            status:
                "CONSISTENCY",

            message:
                "Consistency aktuell über dem Limit.",

            action:
                "Weitere kontrollierte Green Days aufbauen.",

            mode:
                "evaluation",

            currentProfit,

            profitTarget,

            targetRemaining,

            progressPercent,

            drawdown,

            consistency

        };

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

        return {

            status:
                "PROTECT",

            message:
                `${formatPayoutMoney(
                    targetRemaining
                )} bis zum Profit Target.`,

            action:
                "Evaluation schützen. Kein aggressives Trading mehr.",

            mode:
                "evaluation",

            currentProfit,

            profitTarget,

            targetRemaining,

            progressPercent,

            drawdown,

            consistency

        };

    }


    /*
    =====================================
    NORMAL BUILD
    =====================================
    */

    return {

        status:
            "BUILD",

        message:
            `${formatPayoutMoney(
                targetRemaining
            )} bis zum Profit Target.`,

        action:
            "Kontrolliert weiter aufbauen.",

        mode:
            "evaluation",

        currentProfit,

        profitTarget,

        targetRemaining,

        progressPercent,

        drawdown,

        consistency

    };

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

    /*
    Wir verwenden bewusst dieselbe
    zentrale Berechnung wie im
    Account Control Center.
    */

    const payout =
        typeof getAccountPayoutAvailability ===
        "function"

            ? getAccountPayoutAvailability(
                account
            )

            : null;


    const consistency =
        typeof getAccountConsistencyInfo ===
        "function"

            ? getAccountConsistencyInfo(
                account
            )

            : null;


    const drawdown =
        typeof getAccountDrawdownInfo ===
        "function"

            ? getAccountDrawdownInfo(
                account
            )

            : null;


    const tradingDays =
        typeof getAccountTradingDayRequirement ===
        "function"

            ? getAccountTradingDayRequirement(
                account
            )

            : null;


    const winningDays =
        typeof getAccountWinningDaysInfo ===
        "function"

            ? getAccountWinningDaysInfo(
                account
            )

            : null;


    /*
    =====================================
    FALLBACK
    =====================================
    */

    if(!payout) {

        return {

            status:
                "CHECK",

            message:
                "Payout konnte nicht berechnet werden.",

            action:
                "Rules und Accountdaten prüfen.",

            mode:
                "funded"

        };

    }


    /*
    =====================================
    PAYOUT READY
    =====================================
    */

    if(
        payout.eligible ===
        true
    ) {

        return {

            status:
                "READY",

            message:
                `${formatPayoutMoney(
                    payout.available
                )} aktuell payout-ready.`,

            action:
                "Payout prüfen und unnötiges Risiko vermeiden.",

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    DRAWDOWN KRITISCH
    =====================================
    */

    if(
        drawdown &&
        Number.isFinite(
            Number(
                drawdown.remaining
            )
        ) &&
        Number(
            drawdown.remaining
        ) <= 250
    ) {

        return {

            status:
                "RISK",

            message:
                "Remaining Drawdown kritisch.",

            action:
                "Account schützen. Kein Payout-Push.",

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    TRADING DAYS FEHLEN
    =====================================
    */

    if(
        tradingDays &&
        Number(
            tradingDays.remaining
        ) > 0
    ) {

        return {

            status:
                "WAIT",

            message:
                `Noch ${
                    tradingDays.remaining
                } Handelstag(e) erforderlich.`,

            action:
                "Qualifying Days kontrolliert erfüllen.",

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    WINNING DAYS FEHLEN
    =====================================
    */

    if(
        winningDays &&
        Number(
            winningDays.remaining
        ) > 0
    ) {

        return {

            status:
                "WAIT",

            message:
                `Noch ${
                    winningDays.remaining
                } Winning Day(s) erforderlich.`,

            action:
                `Pro Tag mindestens ${
                    formatPayoutMoney(
                        winningDays.minimumDayProfit
                    )
                } erreichen.`,

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    CONSISTENCY
    =====================================
    */

    if(
        consistency &&
        Number(
            consistency.current
        ) >
        Number(
            consistency.limit
        )
    ) {

        return {

            status:
                "CONSISTENCY",

            message:
                `Consistency ${
                    Number(
                        consistency.current
                    ).toFixed(1)
                }% / ${
                    Number(
                        consistency.limit
                    ).toFixed(1)
                }%.`,

            action:
                `${
                    formatPayoutMoney(
                        consistency.minimumProfitNeeded
                    )
                } zusätzlicher Net Profit erforderlich.`,

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    MIN PAYOUT NOCH NICHT ERREICHT
    =====================================
    */

    if(
        Number(
            payout.potentialAvailable
        ) <
        Number(
            payout.minPayout
        )
    ) {

        return {

            status:
                "BUILD",

            message:
                "Minimum Payout noch nicht erreicht.",

            action:
                `${
                    formatPayoutMoney(
                        payout.stillNeeded
                    )
                } bis zum Mindestpayout.`,

            mode:
                "funded",

            payout,

            consistency,

            drawdown,

            tradingDays,

            winningDays

        };

    }


    /*
    =====================================
    SONSTIGE RULE-BEDINGUNG
    =====================================
    */

    return {

        status:
            "WAIT",

        message:
            payout.reason ||
            "Payout-Bedingungen noch nicht vollständig erfüllt.",

        action:
            "Account weiter kontrolliert aufbauen.",

        mode:
            "funded",

        payout,

        consistency,

        drawdown,

        tradingDays,

        winningDays

    };

}



/*
=========================================
FORMAT
=========================================
*/

function formatPayoutMoney(value) {

    const number =
        Number(value);


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
