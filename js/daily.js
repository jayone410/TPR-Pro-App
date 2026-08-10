/*
=========================================
TPR PRO AI
Daily Trading Plan v2
=========================================
*/


function createDailyPlan(
    account,
    payout
) {

    /*
    =====================================
    BASIS
    =====================================
    */

    const rules =
        typeof getEffectiveRules ===
        "function"

            ? getEffectiveRules(
                account
            )

            : null;


    const stage =
        String(
            account.stage ||
            rules?.stage ||
            ""
        ).toLowerCase();


    let mode =
        "NORMAL";


    /*
    Defaults aus Rules
    */

    let targetValue =
        Number(
            rules?.maxDailyProfitTarget
        );


    let maxLossValue =
        Number(
            rules?.maxDailyLoss
        );


    /*
    Fallbacks
    */

    if(
        !Number.isFinite(
            targetValue
        )
    ) {

        targetValue =
            400;

    }


    if(
        !Number.isFinite(
            maxLossValue
        )
    ) {

        maxLossValue =
            400;

    }


    let advice =
        [];


    /*
    =====================================
    DRAWDOWN
    =====================================
    */

    const drawdown =
        typeof getAccountDrawdownInfo ===
        "function"

            ? getAccountDrawdownInfo(
                account
            )

            : null;


    const remainingDD =
        drawdown &&
        Number.isFinite(
            Number(
                drawdown.remaining
            )
        )

            ? Number(
                drawdown.remaining
            )

            : null;


    /*
    =====================================
    DLL
    =====================================
    */

    const dll =
        typeof getAccountDLLInfo ===
        "function"

            ? getAccountDLLInfo(
                account
            )

            : null;


    const dllRemaining =
        dll &&
        Number.isFinite(
            Number(
                dll.remaining
            )
        )

            ? Number(
                dll.remaining
            )

            : null;


    /*
    =====================================
    CONSISTENCY
    =====================================
    */

    const consistency =
        typeof getAccountConsistencyInfo ===
        "function"

            ? getAccountConsistencyInfo(
                account
            )

            : null;


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(
        stage ===
        "evaluation"
    ) {

        const profitTarget =
            Number(
                rules?.profitTarget
            );


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


        /*
        Fast am Eval Target
        */

        if(
            targetRemaining !== null &&
            targetRemaining <=
            targetValue
        ) {

            mode =
                "PROTECT";


            targetValue =
                Math.max(
                    50,
                    targetRemaining
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    150
                );


            advice.push(
                "Evaluation fast abgeschlossen."
            );


            advice.push(
                "Nur noch Profit Target sauber erreichen."
            );

        }


        /*
        Consistency über Limit
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

            mode =
                "DEFENSIVE";


            targetValue =
                Math.min(
                    targetValue,
                    250
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    200
                );


            advice.push(
                "Consistency verbessern."
            );


            advice.push(
                "Keine übergroßen Green Days erzeugen."
            );

        }

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

        /*
        Payout ready
        */

        if(
            payout &&
            payout.status ===
            "READY"
        ) {

            mode =
                "PROTECT";


            targetValue =
                0;


            maxLossValue =
                Math.min(
                    maxLossValue,
                    100
                );


            advice.push(
                "Payout ready."
            );


            advice.push(
                "Kein unnötiges Risiko vor Auszahlung."
            );

        }


        /*
        Trading / Winning Days fehlen
        */

        else if(
            payout &&
            payout.status ===
            "WAIT"
        ) {

            mode =
                "DEFENSIVE";


            targetValue =
                Math.min(
                    targetValue,
                    300
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    250
                );


            advice.push(
                "Qualifying Day kontrolliert erfüllen."
            );


            advice.push(
                "Keine Recovery Trades."
            );

        }


        /*
        Consistency
        */

        else if(
            payout &&
            payout.status ===
            "CONSISTENCY"
        ) {

            mode =
                "DEFENSIVE";


            targetValue =
                Math.min(
                    targetValue,
                    250
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    200
                );


            advice.push(
                "Consistency gezielt verbessern."
            );


            advice.push(
                "Green Day nicht unnötig groß machen."
            );

        }

    }


    /*
    =====================================
    DRAWDOWN OVERRIDE
    =====================================
    */

    if(
        remainingDD !== null
    ) {

        if(
            remainingDD <=
            250
        ) {

            mode =
                "STOP";


            targetValue =
                0;


            maxLossValue =
                0;


            advice =
                [
                    "Remaining Drawdown kritisch.",
                    "Heute nicht weiter handeln."
                ];

        }

        else if(
            remainingDD <=
            500
        ) {

            mode =
                "PROTECT";


            targetValue =
                Math.min(
                    targetValue,
                    150
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    100
                );


            advice.push(
                "Drawdown sehr niedrig."
            );


            advice.push(
                "Nur A+ Setup."
            );

        }

        else if(
            remainingDD <=
            1000
        ) {

            if(
                mode ===
                "NORMAL"
            ) {

                mode =
                    "DEFENSIVE";

            }


            targetValue =
                Math.min(
                    targetValue,
                    250
                );


            maxLossValue =
                Math.min(
                    maxLossValue,
                    200
                );


            advice.push(
                "Account Buffer schützen."
            );

        }

    }


    /*
    =====================================
    DLL OVERRIDE
    =====================================
    */

    if(
        dllRemaining !== null
    ) {

        if(
            dllRemaining <=
            100
        ) {

            mode =
                "STOP";


            targetValue =
                0;


            maxLossValue =
                0;


            advice =
                [
                    "Daily Loss Limit fast ausgeschöpft.",
                    "Trading für heute beenden."
                ];

        }

        else {

            maxLossValue =
                Math.min(
                    maxLossValue,
                    dllRemaining
                );

        }

    }


    /*
    =====================================
    MINDESTWERTE / CLEANUP
    =====================================
    */

    targetValue =
        Math.max(
            0,
            Math.round(
                targetValue
            )
        );


    maxLossValue =
        Math.max(
            0,
            Math.round(
                maxLossValue
            )
        );


    /*
    Doppelte Hinweise entfernen
    */

    advice =
        [
            ...new Set(
                advice
            )
        ];


    /*
    Falls keine Advice
    */

    if(
        advice.length ===
        0
    ) {

        advice.push(
            "Nur A+ Setups handeln."
        );


        advice.push(
            "Keine Revenge Trades."
        );

    }


    return {

        mode,

        target:
            formatDailyMoney(
                targetValue
            ),

        maxLoss:
            formatDailyMoney(
                maxLossValue
            ),

        targetValue,

        maxLossValue,

        remainingDrawdown:
            remainingDD,

        dllRemaining,

        advice

    };

}


/*
=========================================
FORMAT
=========================================
*/

function formatDailyMoney(
    value
) {

    const number =
        Number(value);


    if(
        !Number.isFinite(
            number
        )
    ) {

        return "$0";

    }


    return number.toLocaleString(
        "en-US",
        {
            style:
                "currency",

            currency:
                "USD",

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                0
        }
    );

}
