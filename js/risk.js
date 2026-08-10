/*
=========================================
TPR PRO AI
Risk Engine v2
=========================================
*/


function calculateRisk(account) {

    /*
    =====================================
    BASIS
    =====================================
    */

    let accountRisk =
        100;

    let performanceRisk =
        100;

    let disciplineRisk =
        100;

    let marketRisk =
        100;


    const reasons =
        [];


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


    const stage =
        String(
            account.stage ||
            rules?.stage ||
            ""
        ).toLowerCase();


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


    if(
        drawdown &&
        Number.isFinite(
            Number(
                drawdown.remaining
            )
        )
    ) {

        const remaining =
            Number(
                drawdown.remaining
            );


        if(
            remaining <=
            250
        ) {

            accountRisk -=
                60;


            reasons.push(
                "Remaining Drawdown kritisch."
            );

        }
        else if(
            remaining <=
            500
        ) {

            accountRisk -=
                40;


            reasons.push(
                "Remaining Drawdown sehr niedrig."
            );

        }
        else if(
            remaining <=
            1000
        ) {

            accountRisk -=
                20;


            reasons.push(
                "Remaining Drawdown reduziert."
            );

        }

    }


    /*
    =====================================
    DLL / DAILY LOSS
    =====================================
    */

    const dll =
        typeof getAccountDLLInfo ===
        "function"

            ? getAccountDLLInfo(
                account
            )

            : null;


    if(
        dll &&
        Number.isFinite(
            Number(
                dll.remaining
            )
        ) &&
        Number.isFinite(
            Number(
                dll.limit
            )
        ) &&
        Number(
            dll.limit
        ) > 0
    ) {

        const dllPercent =
            (
                Number(
                    dll.remaining
                )
                /
                Number(
                    dll.limit
                )
            )
            *
            100;


        if(
            dllPercent <=
            20
        ) {

            accountRisk -=
                50;


            reasons.push(
                "Daily Loss Limit fast ausgeschöpft."
            );

        }
        else if(
            dllPercent <=
            40
        ) {

            accountRisk -=
                30;


            reasons.push(
                "Nur noch wenig Daily Risk verfügbar."
            );

        }
        else if(
            dllPercent <=
            60
        ) {

            accountRisk -=
                15;


            reasons.push(
                "Daily Risk bereits teilweise verbraucht."
            );

        }

    }


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
        )
    ) {

        const current =
            Number(
                consistency.current
            );


        const limit =
            Number(
                consistency.limit
            );


        /*
        Bereits über Limit
        */

        if(
            current >
            limit
        ) {

            accountRisk -=
                30;


            performanceRisk -=
                35;


            reasons.push(
                "Consistency aktuell über dem Limit."
            );

        }

        /*
        Sehr nah am Limit
        */

        else if(
            current >=
            limit -
            3
        ) {

            accountRisk -=
                15;


            performanceRisk -=
                20;


            reasons.push(
                "Consistency nahe am Limit."
            );

        }

    }


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

                : Number(
                    account.balance
                ) -
                Number(
                    account.startingBalance
                );


        if(
            Number.isFinite(
                profitTarget
            ) &&
            profitTarget >
            0 &&
            Number.isFinite(
                currentProfit
            )
        ) {

            const remaining =
                Math.max(
                    0,
                    profitTarget -
                    currentProfit
                );


            const progress =
                (
                    currentProfit /
                    profitTarget
                )
                *
                100;


            /*
            Fast geschafft:
            Nicht mehr unnötig aggressiv werden.
            */

            if(
                progress >=
                90
            ) {

                accountRisk -=
                    15;


                reasons.push(
                    "Evaluation fast abgeschlossen – Kapital schützen."
                );

            }


            if(
                remaining ===
                0
            ) {

                accountRisk =
                    Math.min(
                        accountRisk,
                        40
                    );


                reasons.push(
                    "Profit Target erreicht."
                );

            }

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

        const payout =
            typeof getAccountPayoutAvailability ===
            "function"

                ? getAccountPayoutAvailability(
                    account
                )

                : null;


        /*
        Payout ready:
        Risiko reduzieren.
        */

        if(
            payout &&
            payout.eligible ===
            true
        ) {

            accountRisk -=
                25;


            reasons.push(
                "Payout ready – Gewinn schützen."
            );

        }

        /*
        Payout fast ready:
        Consistency / Tage schützen.
        */

        else if(
            payout &&
            Number(
                payout.potentialAvailable
            ) >=
            Number(
                payout.minPayout
            )
        ) {

            accountRisk -=
                10;


            reasons.push(
                "Payout-Bedingungen fast erfüllt."
            );

        }

    }


    /*
    =====================================
    PERFORMANCE
    =====================================
    */

    const trades =
        Array.isArray(
            account.trades
        )
            ? account.trades
            : [];


    if(
        trades.length >=
        5
    ) {

        const recentTrades =
            trades.slice(
                -5
            );


        const recentPnL =
            recentTrades.reduce(
                (
                    sum,
                    trade
                ) => {

                    if(
                        typeof getAccountDetailTradeNetPnL ===
                        "function"
                    ) {

                        return (
                            sum +
                            getAccountDetailTradeNetPnL(
                                account,
                                trade
                            )
                        );

                    }


                    return sum;

                },
                0
            );


        if(
            recentPnL <
            0
        ) {

            performanceRisk -=
                20;


            reasons.push(
                "Letzte Trades netto negativ."
            );

        }

    }


    /*
    =====================================
    CLAMP 0 - 100
    =====================================
    */

    accountRisk =
        Math.max(
            0,
            Math.min(
                100,
                accountRisk
            )
        );


    marketRisk =
        Math.max(
            0,
            Math.min(
                100,
                marketRisk
            )
        );


    performanceRisk =
        Math.max(
            0,
            Math.min(
                100,
                performanceRisk
            )
        );


    disciplineRisk =
        Math.max(
            0,
            Math.min(
                100,
                disciplineRisk
            )
        );


    return {

        accountRisk,

        marketRisk,

        performanceRisk,

        disciplineRisk,

        reasons

    };

}
