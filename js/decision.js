/*
=========================================
TPR PRO AI
Decision Engine v2
=========================================
*/


function analyzeAccount(account) {

    const risk =
        calculateRisk(
            account
        );


    /*
    =====================================
    SCORE
    =====================================
    */

    const score =
        Math.round(

            (
                risk.accountRisk *
                0.40

                +

                risk.marketRisk *
                0.15

                +

                risk.performanceRisk *
                0.30

                +

                risk.disciplineRisk *
                0.15
            )

        );


    /*
    =====================================
    RECOMMENDATION
    =====================================
    */

    let recommendation =
        "";


    if(
        score >= 85
    ) {

        recommendation =
            "🟢 TRADE NORMAL";

    }
    else if(
        score >= 70
    ) {

        recommendation =
            "🟡 REDUCE RISK";

    }
    else if(
        score >= 50
    ) {

        recommendation =
            "🟠 ONLY A+ SETUPS";

    }
    else {

        recommendation =
            "🔴 DON'T TRADE";

    }


    /*
    =====================================
    REASONS
    =====================================
    */

    const reasons =
        [];


    if(
        risk.accountRisk >= 80
    ) {

        reasons.push(
            "Account Risiko kontrolliert."
        );

    }
    else {

        reasons.push(
            "Account Risiko erhöht."
        );

    }


    if(
        risk.performanceRisk >= 80
    ) {

        reasons.push(
            "Performance stabil."
        );

    }
    else {

        reasons.push(
            "Performance Risiko erhöht."
        );

    }


    if(
        Array.isArray(
            risk.reasons
        )
    ) {

        risk.reasons.forEach(
            reason => {

                if(
                    !reasons.includes(
                        reason
                    )
                ) {

                    reasons.push(
                        reason
                    );

                }

            }
        );

    }


    return {

        score,

        recommendation,

        reasons,

        risk

    };

}



/*
=========================================
READINESS DECISION
=========================================
*/

function buildReadinessDecision(
    account,
    result,
    payout,
    dailyPlan,
    providerRules
) {

    /*
    =====================================
    BASIS
    =====================================
    */

    const stage =
        String(
            account.stage ||
            providerRules?.stage ||
            ""
        ).toLowerCase();


    const drawdown =
        typeof getAccountDrawdownInfo ===
        "function"

            ? getAccountDrawdownInfo(
                account
            )

            : null;


    const dll =
        typeof getAccountDLLInfo ===
        "function"

            ? getAccountDLLInfo(
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


    /*
    =====================================
    STATUS
    =====================================
    */

    let status =
        "READY TO TRADE";

    let level =
        "green";


    /*
    Daily Plan hat höchste Priorität
    */

    if(
        dailyPlan?.mode ===
        "STOP"
    ) {

        status =
            "STOP";

        level =
            "red";

    }

    else if(
        dailyPlan?.mode ===
        "PROTECT"
    ) {

        status =
            "PROTECT";

        level =
            "yellow";

    }

    else if(
        dailyPlan?.mode ===
        "DEFENSIVE"
    ) {

        status =
            "CAUTION";

        level =
            "yellow";

    }

    else if(
        result.score < 50
    ) {

        status =
            "STOP";

        level =
            "red";

    }

    else if(
        result.score < 85
    ) {

        status =
            "CAUTION";

        level =
            "yellow";

    }


    /*
    =====================================
    ACCOUNT / BUFFER METRIC
    =====================================
    */

    let buffer =
        currentProfit;


    let recommendedBuffer =
        0;


    let bufferStatus =
        "Normal";


    let bufferDetail =
        "";


    /*
    Evaluation:
    statt Buffer lieber Profit Target
    */

    if(
        stage ===
        "evaluation"
    ) {

        const profitTarget =
            Number(
                providerRules?.profitTarget
            );


        const targetRemaining =
            Number.isFinite(
                profitTarget
            )

                ? Math.max(
                    0,
                    profitTarget -
                    currentProfit
                )

                : null;


        bufferStatus =
            targetRemaining === 0
                ? "TARGET"
                : "EVAL";


        bufferDetail =
            targetRemaining !== null

                ? (
                    formatDecisionMoney(
                        targetRemaining
                    ) +
                    " bis Target"
                )

                : "Evaluation aktiv";

    }


    /*
    Funded:
    Remaining DD ist wichtiger
    */

    if(
        stage ===
        "funded"
    ) {

        if(
            drawdown &&
            Number.isFinite(
                Number(
                    drawdown.remaining
                )
            )
        ) {

            buffer =
                Number(
                    drawdown.remaining
                );


            bufferStatus =
                drawdown.remaining <= 500
                    ? "LOW"
                    : "OK";


            bufferDetail =
                "Remaining DD: " +
                formatDecisionMoney(
                    drawdown.remaining
                );

        }

    }


    /*
    =====================================
    PAYOUT / EVAL TEXT
    =====================================
    */

    let payoutText =
        payout?.status ??
        "--";


    let payoutDetail =
        payout?.message ??
        "Keine Daten.";


    if(
        stage ===
        "evaluation"
    ) {

        payoutText =
            payout?.status ??
            "EVAL";


        payoutDetail =
            payout?.message ??
            "Evaluation aktiv.";

    }


    /*
    =====================================
    AI HINWEISE
    =====================================
    */

    const ai =
        [];


    /*
    Evaluation
    */

    if(
        stage ===
        "evaluation"
    ) {

        if(
            payout?.status ===
            "TARGET"
        ) {

            ai.push(
                "Profit Target erreicht – Evaluation-Abschluss prüfen."
            );

        }


        if(
            payout?.status ===
            "PROTECT"
        ) {

            ai.push(
                "Evaluation fast geschafft – Risiko reduzieren."
            );

        }


        if(
            consistency &&
            Number(
                consistency.current
            ) >
            Number(
                consistency.limit
            )
        ) {

            ai.push(
                "Consistency verbessern, bevor du weiter aggressiv tradest."
            );

        }

    }


    /*
    Funded
    */

    if(
        stage ===
        "funded"
    ) {

        if(
            payout?.status ===
            "READY"
        ) {

            ai.push(
                "Payout prüfen und Gewinne schützen."
            );

        }


        if(
            payout?.status ===
            "WAIT"
        ) {

            ai.push(
                "Payout-Bedingungen kontrolliert erfüllen."
            );

        }


        if(
            payout?.status ===
            "CONSISTENCY"
        ) {

            ai.push(
                "Consistency gezielt verbessern."
            );

        }

    }


    /*
    Drawdown
    */

    if(
        drawdown &&
        Number.isFinite(
            Number(
                drawdown.remaining
            )
        )
    ) {

        if(
            Number(
                drawdown.remaining
            ) <= 250
        ) {

            ai.push(
                "Remaining Drawdown kritisch – heute nicht weiter handeln."
            );

        }

        else if(
            Number(
                drawdown.remaining
            ) <= 500
        ) {

            ai.push(
                "Drawdown sehr niedrig – nur A+ Setup."
            );

        }

    }


    /*
    DLL
    */

    if(
        dll &&
        Number.isFinite(
            Number(
                dll.remaining
            )
        )
    ) {

        if(
            Number(
                dll.remaining
            ) <= 100
        ) {

            ai.push(
                "Daily Loss Limit fast ausgeschöpft."
            );

        }

    }


    /*
    Daily Plan Advice übernehmen
    */

    if(
        Array.isArray(
            dailyPlan?.advice
        )
    ) {

        dailyPlan.advice
            .forEach(
                item => {

                    if(
                        !ai.includes(
                            item
                        )
                    ) {

                        ai.push(
                            item
                        );

                    }

                }
            );

    }


    /*
    Risk Reasons übernehmen
    */

    if(
        Array.isArray(
            result?.risk?.reasons
        )
    ) {

        result.risk.reasons
            .forEach(
                item => {

                    if(
                        !ai.includes(
                            item
                        )
                    ) {

                        ai.push(
                            item
                        );

                    }

                }
            );

    }


    /*
    Fallback
    */

    if(
        ai.length === 0
    ) {

        ai.push(
            "Account befindet sich im normalen Arbeitsbereich."
        );

    }


    /*
    =====================================
    RETURN
    =====================================
    */

    return {

        status,

        level,

        score:
            result.score,

        buffer,

        recommendedBuffer,

        bufferStatus,

        bufferDetail,

        payoutText,

        payoutDetail,

        goal:
            dailyPlan?.target ??
            "--",

        stop:
            dailyPlan?.maxLoss ??
            "--",

        ai,

        stage,

        drawdown,

        dll,

        consistency,

        currentProfit

    };

}



/*
=========================================
FORMAT
=========================================
*/

function formatDecisionMoney(
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
