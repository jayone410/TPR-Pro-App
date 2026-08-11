/*
=========================================
TPR PRO AI
Account Control Center
=========================================
*/


/*
=========================================
HELPER
=========================================
*/

function getAccountDetailRules(account) {

    if(
        typeof getEffectiveRules !==
        "function"
    ) {
        return null;
    }


    return getEffectiveRules(
        account
    );

}


function formatAccountDetailMoney(
    value,
    showPlus = false
) {

    const number =
        Number(value);


    if(!Number.isFinite(number)) {

        return "--";

    }


    const formatted =
        Math.abs(number)
            .toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


    if(number < 0) {

        return "-" + formatted;

    }


    if(
        showPlus &&
        number > 0
    ) {

        return "+" + formatted;

    }


    return formatted;

}


function formatAccountPercent(value) {

    const number =
        Number(value);


    if(!Number.isFinite(number)) {

        return "--";

    }


    return (
        number.toFixed(1) +
        " %"
    );

}

function getAccountPayoutHistoryHtml(
    account
) {

    const history =
        Array.isArray(
            account.payoutHistory
        )
            ? account.payoutHistory
            : [];


    if(
        history.length === 0
    ) {

        return `
            <div class="account-payout-history-empty">
                Noch keine Payouts gespeichert.
            </div>
        `;

    }


    return history
        .slice()
        .reverse()
        .map(
            payout => {

                const amount =
                    Number(
                        payout.amount
                    ) || 0;


                return `
                    <div class="account-payout-history-item">

                        <div>
                            <strong>
                                Cycle #${payout.cycleNumber}
                            </strong>

                            <span>
                                ${payout.date || "--"}
                            </span>
                        </div>

                        <div>
                            <strong>
                                $${amount.toFixed(2)}
                            </strong>

                            <span>
                                ${
                                    Number(
                                        payout.cycleProfit
                                    ) || 0
                                } Cycle P&L
                            </span>
                        </div>

                    </div>
                `;

            }
        )
        .join("");

}

/*
=========================================
CURRENT PROFIT
=========================================
*/

function getAccountCurrentProfit(account) {

    /*
    Bevorzugt den bereits von accounts.js
    netto berechneten Trading P&L.
    */

    const tradingPnL =
        Number(
            account.totalTradingPnL
        );


    if(
        Number.isFinite(
            tradingPnL
        )
    ) {

        return tradingPnL;

    }


    /*
    Fallback
    */

    const balance =
        Number(
            account.balance
        );


    const start =
        Number(
            account.startingBalance
        );


    if(
        Number.isFinite(balance) &&
        Number.isFinite(start)
    ) {

        return (
            balance -
            start
        );

    }


    return 0;

}


/*
=========================================
TRADE DATUM NORMALISIEREN
=========================================
*/

function getTradeDateKey(trade) {

    const dateValue =
        trade.TradeDay ||
        trade.tradeDay ||
        trade.date ||
        trade.Date ||
        trade.EnteredAt ||
        trade.boughtTimestamp ||
        trade.soldTimestamp ||
        null;


    if(!dateValue) {

        return null;

    }


    const text =
        String(dateValue)
            .trim();


    /*
    US Format:
    08/07/2026 ...
    */

    const usMatch =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if(usMatch) {

        return (
            usMatch[3] +
            "-" +
            usMatch[1]
                .padStart(
                    2,
                    "0"
                ) +
            "-" +
            usMatch[2]
                .padStart(
                    2,
                    "0"
                )
        );

    }


    /*
    ISO Format
    */

    const isoMatch =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if(isoMatch) {

        return (
            isoMatch[1] +
            "-" +
            isoMatch[2] +
            "-" +
            isoMatch[3]
        );

    }


    return null;

}


/*
=========================================
TRADE NET P&L
=========================================
*/

function getAccountDetailTradeNetPnL(
    account,
    trade
) {

    const provider =
        String(
            account.provider ||
            ""
        ).toLowerCase();


    let pnl =
        typeof parseMoney ===
        "function"

            ? parseMoney(
                trade.PnL ??
                trade.pnl ??
                0
            )

            : Number(
                trade.PnL ??
                trade.pnl ??
                0
            ) || 0;


    /*
    TOPSTEP / TRADOVATE
    */

    if(
        provider ===
        "topstep"
    ) {

        const fees =
            typeof parseMoney ===
            "function"

                ? Math.abs(
                    parseMoney(
                        trade.Fees ??
                        0
                    )
                )

                : Math.abs(
                    Number(
                        trade.Fees ??
                        0
                    ) || 0
                );


        const commissions =
            typeof parseMoney ===
            "function"

                ? Math.abs(
                    parseMoney(
                        trade.Commissions ??
                        0
                    )
                )

                : Math.abs(
                    Number(
                        trade.Commissions ??
                        0
                    ) || 0
                );


        pnl =
            pnl -
            fees -
            commissions;

    }


    /*
    LUCID
    $1 Kosten pro Contract,
    entsprechend unserer aktuellen
    CSV-Balance-Engine.
    */

    if(
        provider ===
        "lucid"
    ) {

        const qty =
            Math.abs(
                Number(
                    trade.qty ??
                    0
                ) || 0
            );


        pnl =
            pnl -
            qty;

    }


    return pnl;

}


/*
=========================================
DAILY NET P&L
=========================================
*/

function getAccountDailyNetPnL(account) {

    const trades =
        Array.isArray(
            account.trades
        )
            ? account.trades
            : [];


    const daily =
        {};


    trades.forEach(
        trade => {

            const day =
                getTradeDateKey(
                    trade
                );


            if(!day) {

                return;

            }


            if(
                daily[day] ===
                undefined
            ) {

                daily[day] =
                    0;

            }


            daily[day] +=
                getAccountDetailTradeNetPnL(
                    account,
                    trade
                );

        }
    );


    return daily;

}


/*
=========================================
TRADING DAYS
=========================================
*/

function getAccountTradingDays(account) {

    return Object.keys(
        getAccountDailyNetPnL(
            account
        )
    ).sort();

}


function getAccountTradingDayCount(
    account
) {

    return getAccountTradingDays(
        account
    ).length;

}


/*
=========================================
LETZTER HANDELSTAG
=========================================
*/

function getAccountLastTradingDayInfo(
    account
) {

    const daily =
        getAccountDailyNetPnL(
            account
        );


    const days =
        Object.keys(
            daily
        ).sort();


    if(
        days.length === 0
    ) {

        return {

            date: null,

            pnl: 0,

            previousBalance:
                null

        };

    }


    const latestDay =
        days[
            days.length - 1
        ];


    const latestPnL =
        Number(
            daily[
                latestDay
            ]
        ) || 0;


    const balance =
        Number(
            account.balance
        );


    const previousBalance =
        Number.isFinite(balance)

            ? balance -
                latestPnL

            : null;


    return {

        date:
            latestDay,

        pnl:
            latestPnL,

        previousBalance

    };

}


/*
=========================================
PAYOUT CYCLE DAILY DATA
=========================================
*/

function getAccountCycleDailyPnL(
    account
) {

    const daily =
        getAccountDailyNetPnL(
            account
        );


    /*
    Später kann payoutCycleStartDate
    automatisch nach jedem Payout gesetzt werden.
    */

    const cycleStart =
        account.payoutCycleStartDate ||
        null;


    if(!cycleStart) {

        return daily;

    }


    const filtered =
        {};


    Object.keys(daily)
        .sort()
        .forEach(
            day => {

                if(
                    day >=
                    cycleStart
                ) {

                    filtered[day] =
                        daily[day];

                }

            }
        );


    return filtered;

}


/*
=========================================
CONSISTENCY
=========================================
*/

function getAccountConsistencyInfo(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return null;

    }


    const limit =
        Number(
            rules.consistencyLimit
        );


    if(
        !Number.isFinite(limit)
    ) {

        return null;

    }


    const daily =
        getAccountCycleDailyPnL(
            account
        );


    const values =
        Object.values(
            daily
        );


    if(
        values.length === 0
    ) {

        return {

            current: 0,

            limit,

            bestDay: 0,

            totalNetProfit: 0,

            minimumProfitNeeded: 0

        };

    }


    const bestDay =
        Math.max(
            0,
            ...values
        );


    const totalNetProfit =
        values.reduce(
            (sum, value) =>
                sum +
                value,
            0
        );


    let current =
        0;


    if(
        totalNetProfit >
        0
    ) {

        current =
            (
                bestDay /
                totalNetProfit
            ) *
            100;

    }


    /*
    Gesamtprofit, der mindestens
    nötig wäre, damit der beste Tag
    dem Consistency-Limit entspricht.
    */

    const requiredTotalProfit =
        limit > 0

            ? (
                bestDay /
                (
                    limit /
                    100
                )
            )

            : 0;


    const minimumProfitNeeded =
        Math.max(
            0,
            requiredTotalProfit -
            totalNetProfit
        );


    return {

        current,

        limit,

        bestDay,

        totalNetProfit,

        minimumProfitNeeded

    };

}


/*
=========================================
WINNING DAYS
=========================================
*/

function getAccountWinningDaysInfo(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return null;

    }


    const required =
        Number(
            rules.minWinningDays
        );


    const minProfit =
        Number(
            rules.winningDayMinProfit
        );


    if(
        !Number.isFinite(required) ||
        !Number.isFinite(minProfit)
    ) {

        return null;

    }


    const daily =
        getAccountCycleDailyPnL(
            account
        );


    const qualifying =
        Object.values(
            daily
        )
            .filter(
                pnl =>
                    pnl >=
                    minProfit
            )
            .length;


    return {

        current:
            qualifying,

        required,

        remaining:
            Math.max(
                0,
                required -
                qualifying
            ),

        minimumDayProfit:
            minProfit

    };

}


/*
=========================================
TRADING DAY REQUIREMENT
=========================================
*/

function getAccountTradingDayRequirement(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return null;

    }


    const required =
        Number(
            rules.minTradingDays
        );


    if(
        !Number.isFinite(required)
    ) {

        return null;

    }


    const current =
        Object.keys(
            getAccountCycleDailyPnL(
                account
            )
        ).length;


    return {

        current,

        required,

        remaining:
            Math.max(
                0,
                required -
                current
            )

    };

}


/*
=========================================
PAYOUT AVAILABLE
=========================================
*/

function getAccountPayoutAvailability(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return null;

    }


    if(
        rules.stage !==
        "funded"
    ) {

        return {

            eligible: false,

            available: 0,

            stillNeeded: 0,

            reason:
                "Evaluation"

        };

    }


    const currentProfit =
        getAccountCurrentProfit(
            account
        );


    const minPayout =
        Number(
            rules.minPayout
        ) || 0;


    const payoutPercent =
        Number.isFinite(
            Number(
                rules.payoutPercent
            )
        )

            ? Number(
                rules.payoutPercent
            )

            : 100;


    /*
    Profit, der überhaupt
    auszahlbar ist.
    */

    let withdrawableProfit =
        Math.max(
            0,
            currentProfit
        );


    /*
    Buffer-Regel
    z.B. LucidPro.
    */

    const bufferBalance =
        Number(
            rules.bufferBalance
        );


    const rulesStartBalance =
        Number(
            rules.startingBalance
        );


    if(
        Number.isFinite(
            bufferBalance
        ) &&
        Number.isFinite(
            rulesStartBalance
        )
    ) {

        const requiredBuffer =
            bufferBalance -
            rulesStartBalance;


        withdrawableProfit =
            Math.max(
                0,
                currentProfit -
                requiredBuffer
            );

    }


    /*
    Payout Percentage
    */

    let available =
        withdrawableProfit *
        (
            payoutPercent /
            100
        );


    /*
    Caps
    */

    let maxPayout =
        Number(
            rules.maxPayout
        );


    if(
        !Number.isFinite(
            maxPayout
        )
    ) {

        const payoutNumber =
            Number(
                account.payoutCount
            ) || 0;


        if(
            payoutNumber === 0 &&
            Number.isFinite(
                Number(
                    rules.maxPayoutFirst
                )
            )
        ) {

            maxPayout =
                Number(
                    rules.maxPayoutFirst
                );

        }
        else if(
            payoutNumber > 0 &&
            Number.isFinite(
                Number(
                    rules.maxPayoutLater
                )
            )
        ) {

            maxPayout =
                Number(
                    rules.maxPayoutLater
                );

        }

    }


    if(
        Number.isFinite(
            maxPayout
        )
    ) {

        available =
            Math.min(
                available,
                maxPayout
            );

    }


    /*
    Day Requirements
    */

    const tradingDays =
        getAccountTradingDayRequirement(
            account
        );


    const winningDays =
        getAccountWinningDaysInfo(
            account
        );


    const consistency =
        getAccountConsistencyInfo(
            account
        );


    let eligible =
        true;


    let reason =
        "Ready";


    if(
        tradingDays &&
        tradingDays.remaining >
        0
    ) {

        eligible =
            false;

        reason =
            tradingDays.remaining +
            " Trading Day(s) fehlen";

    }


    if(
        winningDays &&
        winningDays.remaining >
        0
    ) {

        eligible =
            false;

        reason =
            winningDays.remaining +
            " Winning Day(s) fehlen";

    }


    if(
        consistency &&
        consistency.current >
        consistency.limit
    ) {

        eligible =
            false;

        reason =
            "Consistency zu hoch";

    }


    if(
        available <
        minPayout
    ) {

        eligible =
            false;


        if(
            reason ===
            "Ready"
        ) {

            reason =
                "Minimum Payout noch nicht erreicht";

        }

    }


    const stillNeeded =
        Math.max(
            0,
            minPayout -
            available
        );


    return {

        eligible,

        available:
            eligible
                ? available
                : 0,

        potentialAvailable:
            available,

        minPayout,

        stillNeeded,

        reason

    };

}


/*
=========================================
REMAINING DRAWDOWN
=========================================
*/

function getAccountDrawdownInfo(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {
        return null;
    }


    const maxLoss =
        Number(
            rules.maxLossLimit
        );


    if(
        !Number.isFinite(
            maxLoss
        )
    ) {
        return null;
    }


    /*
    =====================================
    MANUELLER FLOOR OVERRIDE
    =====================================

    Wenn wir im Rules Editor / Account
    einen aktuellen Floor hinterlegen,
    hat dieser immer Vorrang.
    */

    const manualFloor =
        Number(
            account.currentDrawdownFloor
        );


    if(
        Number.isFinite(
            manualFloor
        )
    ) {

        const currentValue =
            rules.balanceMode ===
            "profitBalance"

                ? getAccountCurrentProfit(
                    account
                )

                : Number(
                    account.balance
                );


        return {

            floor:
                manualFloor,

            remaining:
                Number.isFinite(
                    currentValue
                )
                    ? Math.max(
                        0,
                        currentValue -
                        manualFloor
                    )
                    : null,

            source:
                "Manual Floor"

        };

    }



    /*
    =====================================
    TOPSTEP 25K STATIC XFA
    =====================================
    */

    if(
        rules.mllType ===
        "static"
    ) {

        const currentProfit =
            getAccountCurrentProfit(
                account
            );


        /*
        Vor dem ersten Payout:
        Floor = -MaxLoss

        Beim 25K also:
        -$1,000
        */

        let floor =
            -Math.abs(
                maxLoss
            );


        /*
        Nach dem ersten Payout:
        Topstep setzt den MLL auf $0.
        */

        const payoutCount =
            Number(
                account.payoutCount
            ) || 0;


        if(
            payoutCount > 0 &&
            rules.mllResetsToZeroAfterFirstPayout
        ) {

            floor = 0;

        }


        /*
        Alternativ kann der Account
        explizit als MLL locked markiert sein.
        */

        if(
            account.mllLocked ===
            true
        ) {

            const lockedMLL =
                Number(
                    rules.lockedMLL
                );


            floor =
                Number.isFinite(
                    lockedMLL
                )
                    ? lockedMLL
                    : 0;

        }


        return {

            floor,

            highestEOD:
                null,

            remaining:
                Math.max(
                    0,
                    currentProfit -
                    floor
                ),

            source:
                "Static MLL"

        };

    }



    /*
    =====================================
    TOPSTEP EOD TRAILING XFA
    =====================================
    */

    if(
        rules.balanceMode ===
        "profitBalance"
    ) {

        const daily =
            getAccountCycleDailyPnL(
                account
            );


        const values =
            Object.values(
                daily
            );


        let cumulative =
            0;


        let highestEOD =
            0;


        values.forEach(
            pnl => {

                cumulative +=
                    pnl;


                highestEOD =
                    Math.max(
                        highestEOD,
                        cumulative
                    );

            }
        );


        let floor =
            highestEOD -
            maxLoss;


        /*
        Standard Topstep XFA:

        Der MLL darf bis maximal $0
        trailen und lockt dort.
        */

        const lockedMLL =
            Number(
                rules.lockedMLL
            );


        if(
            Number.isFinite(
                lockedMLL
            )
        ) {

            floor =
                Math.min(
                    floor,
                    lockedMLL
                );

        }


        /*
        Nach erstem Payout
        zwingend MLL = $0.
        */

        const payoutCount =
            Number(
                account.payoutCount
            ) || 0;


        if(
            payoutCount > 0 &&
            rules.mllResetsToZeroAfterFirstPayout
        ) {

            floor =
                Number.isFinite(
                    lockedMLL
                )
                    ? lockedMLL
                    : 0;

        }


        const currentProfit =
            getAccountCurrentProfit(
                account
            );


        return {

            floor,

            highestEOD,

            remaining:
                Math.max(
                    0,
                    currentProfit -
                    floor
                ),

            source:
                "EOD Trailing MLL"

        };

    }



    /*
    =====================================
    LUCID / KLASSISCHE ACCOUNT BALANCE
    =====================================
    */

    const daily =
        getAccountCycleDailyPnL(
            account
        );


    const values =
        Object.values(
            daily
        );


    let cumulative =
        Number(
            rules.startingBalance
        ) || 0;


    let highestEOD =
        cumulative;


    values.forEach(
        pnl => {

            cumulative +=
                pnl;


            highestEOD =
                Math.max(
                    highestEOD,
                    cumulative
                );

        }
    );


    let floor =
        highestEOD -
        maxLoss;


    const lockedBalance =
        Number(
            rules.lockedMLLBalance
        );


    if(
        Number.isFinite(
            lockedBalance
        )
    ) {

        floor =
            Math.min(
                floor,
                lockedBalance
            );

    }


    const currentBalance =
        Number(
            account.balance
        );


    return {

        floor,

        highestEOD,

        remaining:
            Number.isFinite(
                currentBalance
            )
                ? Math.max(
                    0,
                    currentBalance -
                    floor
                )
                : null,

        source:
            "EOD Trailing"

    };

}


/*
=========================================
DLL / DAILY RISK
=========================================
*/

function getAccountDLLInfo(account) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return null;

    }


    let limit =
        Number(
            rules.fixedDLL
        );


    if(
        !Number.isFinite(limit)
    ) {

        limit =
            Number(
                rules.dll
            );

    }


    if(
        !Number.isFinite(limit)
    ) {

        return null;

    }


    const lastDay =
        getAccountLastTradingDayInfo(
            account
        );


    const lossUsed =
        lastDay.pnl < 0

            ? Math.abs(
                lastDay.pnl
            )

            : 0;


    return {

        limit,

        used:
            lossUsed,

        remaining:
            Math.max(
                0,
                limit -
                lossUsed
            )

    };

}


/*
=========================================
NEXT ACTION
=========================================
*/

function getAccountNextAction(
    account
) {

    const payout =
        getAccountPayoutAvailability(
            account
        );


    const drawdown =
        getAccountDrawdownInfo(
            account
        );


    const consistency =
        getAccountConsistencyInfo(
            account
        );


    if(
        drawdown &&
        drawdown.remaining <=
        250
    ) {

        return {

            level:
                "red",

            icon:
                "🔴",

            title:
                "PROTECT ACCOUNT",

            text:
                "Remaining Drawdown ist sehr niedrig."

        };

    }


    if(
        payout &&
        payout.eligible
    ) {

        return {

            level:
                "green",

            icon:
                "💰",

            title:
                "PAYOUT READY",

            text:
                formatAccountDetailMoney(
                    payout.available
                ) +
                " aktuell auszahlbar."

        };

    }


    if(
        consistency &&
        consistency.current >
        consistency.limit
    ) {

        return {

            level:
                "yellow",

            icon:
                "🟡",

            title:
                "BUILD CONSISTENCY",

            text:
                formatAccountDetailMoney(
                    consistency.minimumProfitNeeded
                ) +
                " zusätzlicher Net Profit erforderlich."

        };

    }


    if(
        payout &&
        payout.reason
    ) {

        return {

            level:
                "yellow",

            icon:
                "🟡",

            title:
                "BUILD ACCOUNT",

            text:
                payout.reason

        };

    }


    return {

        level:
            "green",

        icon:
            "🟢",

        title:
            "TRADE NORMAL",

        text:
            "Account befindet sich im normalen Arbeitsbereich."

    };

}


/*
=========================================
HTML HELPERS
=========================================
*/

function buildDetailMetric(
    label,
    value,
    subtext = ""
) {

    return `

        <div class="account-detail-item">

            <span>
                ${label}
            </span>

            <strong>
                ${value}
            </strong>

            ${
                subtext
                    ? `
                        <small>
                            ${subtext}
                        </small>
                    `
                    : ""
            }

        </div>

    `;

}


/*
=========================================
DETAIL HTML
=========================================
*/

function buildAccountDetailsHTML(
    account
) {

    const rules =
        getAccountDetailRules(
            account
        );


    if(!rules) {

        return `

            <div class="account-detail-content">

                <p>
                    ⚠️ Keine Rules für diesen Account gefunden.
                </p>

            </div>

        `;

    }


    const currentProfit =
        getAccountCurrentProfit(
            account
        );


    const lastDay =
        getAccountLastTradingDayInfo(
            account
        );


    const tradingDays =
        getAccountTradingDayRequirement(
            account
        );


    const winningDays =
        getAccountWinningDaysInfo(
            account
        );


    const consistency =
        getAccountConsistencyInfo(
            account
        );


    const payout =
        getAccountPayoutAvailability(
            account
        );


    const drawdown =
        getAccountDrawdownInfo(
            account
        );


    const dll =
        getAccountDLLInfo(
            account
        );


    const nextAction =
        getAccountNextAction(
            account
        );


    /*
    ACCOUNT
    */

    let accountHTML = `

        <div class="account-detail-section">

            <div class="account-detail-section-title">
                ACCOUNT
            </div>

            <div class="account-detail-grid">

                ${buildDetailMetric(
                    "Current Profit",
                    formatAccountDetailMoney(
                        currentProfit,
                        true
                    )
                )}

                ${buildDetailMetric(
                    "Current Balance",
                    formatAccountDetailMoney(
                        account.balance
                    )
                )}

                ${buildDetailMetric(
                    "Previous Balance",
                    lastDay.previousBalance !==
                        null

                        ? formatAccountDetailMoney(
                            lastDay.previousBalance
                        )

                        : "--"
                )}

                ${buildDetailMetric(
                    "Last Trading Day",
                    formatAccountDetailMoney(
                        lastDay.pnl,
                        true
                    ),
                    lastDay.date ||
                    ""
                )}

            </div>

        </div>

    `;


    /*
    PAYOUT
    */

    let payoutMetrics =
        "";


    if(tradingDays) {

        payoutMetrics +=
            buildDetailMetric(
                "Trading Days",
                tradingDays.current +
                " / " +
                tradingDays.required,
                tradingDays.remaining +
                " remaining"
            );

    }


    if(winningDays) {

        payoutMetrics +=
            buildDetailMetric(
                "Winning Days",
                winningDays.current +
                " / " +
                winningDays.required,
                "Min " +
                formatAccountDetailMoney(
                    winningDays.minimumDayProfit
                ) +
                " / day"
            );

    }


    if(payout) {

        payoutMetrics +=
            buildDetailMetric(
                "Payout Available",
                formatAccountDetailMoney(
                    payout.available
                ),
                payout.reason
            );


        payoutMetrics +=
            buildDetailMetric(
                "Potential Payout",
                formatAccountDetailMoney(
                    payout.potentialAvailable
                ),
                "Min " +
                formatAccountDetailMoney(
                    payout.minPayout
                )
            );

    }


    const payoutHTML = `

        <div class="account-detail-section">

            <div class="account-detail-section-title">
                PAYOUT
            </div>

            <div class="account-detail-grid">

                ${payoutMetrics}

            </div>

        </div>

    `;


    /*
    CONSISTENCY
    */

    let consistencyHTML =
        "";


    if(consistency) {

        consistencyHTML = `

            <div class="account-detail-section">

                <div class="account-detail-section-title">
                    CONSISTENCY
                </div>

                <div class="account-detail-grid">

                    ${buildDetailMetric(
                        "Current",
                        formatAccountPercent(
                            consistency.current
                        )
                    )}

                    ${buildDetailMetric(
                        "Limit",
                        formatAccountPercent(
                            consistency.limit
                        )
                    )}

                    ${buildDetailMetric(
                        "Best Day",
                        formatAccountDetailMoney(
                            consistency.bestDay,
                            true
                        )
                    )}

                    ${buildDetailMetric(
                        "Profit Needed",
                        formatAccountDetailMoney(
                            consistency.minimumProfitNeeded
                        ),
                        consistency.current >
                            consistency.limit

                            ? "to satisfy consistency"

                            : "Consistency OK"
                    )}

                </div>

            </div>

        `;

    }


    /*
    RISK
    */

    let riskMetrics =
        "";


    if(drawdown) {

        riskMetrics +=
            buildDetailMetric(
                "Remaining Drawdown",
                formatAccountDetailMoney(
                    drawdown.remaining
                ),
                drawdown.source
            );


        riskMetrics +=
            buildDetailMetric(
                "Current Floor",
                formatAccountDetailMoney(
                    drawdown.floor
                )
            );

    }


    if(dll) {

        riskMetrics +=
            buildDetailMetric(
                "DLL Remaining",
                formatAccountDetailMoney(
                    dll.remaining
                ),
                "Limit " +
                formatAccountDetailMoney(
                    dll.limit
                )
            );

    }


    const riskHTML = `

        <div class="account-detail-section">

            <div class="account-detail-section-title">
                RISK
            </div>

            <div class="account-detail-grid">

                ${
                    riskMetrics ||
                    buildDetailMetric(
                        "Risk Limits",
                        "--"
                    )
                }

            </div>

        </div>

    `;


    /*
    NEXT ACTION
    */

    const actionHTML = `

        <div
            class="
                account-next-action
                account-next-action-${nextAction.level}
            "
        >

            <div class="account-next-action-icon">
                ${nextAction.icon}
            </div>

            <div>

                <strong>
                    ${nextAction.title}
                </strong>

                <p>
                    ${nextAction.text}
                </p>

            </div>

        </div>

    `;


    return `

        <div class="account-detail-content">

            <div class="account-detail-program">

                ${rules.programLabel}

                ·

                ${String(
                    rules.stage
                ).toUpperCase()}

                ·

                ${account.accountType}

            </div>


            ${accountHTML}

            ${payoutHTML}

            ${consistencyHTML}

            ${riskHTML}

            ${actionHTML}

        </div>

    `;

}


/*
=========================================
DETAIL TOGGLE
=========================================
*/

function toggleAccountDetails(
    accountId
) {

    const row =
        document.getElementById(
            "accountDetails-" +
            accountId
        );


    if(!row) {

        return;

    }


    const isHidden =
        row.style.display ===
        "none" ||
        row.style.display ===
        "";


    if(isHidden) {

        const account =
            getAccount(
                accountId
            );


        if(!account) {

            return;

        }


        const container =
            row.querySelector(
                ".account-details-container"
            );


        if(container) {

            container.innerHTML =
                buildAccountDetailsHTML(
                    account
                );

        }


        row.style.display =
            "table-row";

    }
    else {

        row.style.display =
            "none";

    }

}
