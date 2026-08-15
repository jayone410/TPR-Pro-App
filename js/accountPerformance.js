/*
=========================================
TPR PRO AI
ACCOUNT PERFORMANCE CENTER v1
=========================================
*/


const accountPerformanceState = {

    accountId:
        "all",

    period:
        "thisWeek",

    customStart:
        null,

    customEnd:
        null

};


/*
=========================================
INIT
=========================================
*/

function initAccountPerformance() {

    renderAccountPerformanceTabs();

    bindAccountPerformancePeriodButtons();

    renderAccountPerformance();

}


/*
=========================================
MAIN RENDER
=========================================
*/

function renderAccountPerformance() {

    const trades =
        getAccountPerformanceTrades();


    const stats =
        calculateAccountPerformanceStats(
            trades
        );


    setPerformanceValue(
        "performanceNetPnl",
        formatPerformanceMoney(
            stats.netPnl
        ),
        stats.netPnl
    );


    setPerformanceValue(
        "performanceTodayPnl",
        formatPerformanceMoney(
            stats.todayPnl
        ),
        stats.todayPnl
    );


    setPerformanceValue(
        "performanceYesterdayPnl",
        formatPerformanceMoney(
            stats.yesterdayPnl
        ),
        stats.yesterdayPnl
    );


    setPerformanceValue(
        "performanceChange",
        formatPerformanceMoney(
            stats.change
        ),
        stats.change
    );


    setPerformanceText(
        "performanceTradeCount",
        `${stats.tradeCount} Trades`
    );


    setPerformanceText(
        "performanceTodayTrades",
        `${stats.todayTrades} Trades`
    );


    setPerformanceText(
        "performanceYesterdayTrades",
        `${stats.yesterdayTrades} Trades`
    );


    setPerformanceText(
        "performanceChangePercent",
        formatPerformancePercent(
            stats.changePercent
        )
    );


    setPerformanceText(
        "performanceWinRate",
        `${stats.winRate.toFixed(1)}%`
    );


    setPerformanceText(
        "performanceWinRateDetail",
        `${stats.wins}W · ${stats.losses}L`
    );


    setPerformanceText(
        "performanceConsistency",
        stats.consistency === null
            ? "N/A"
            : `${stats.consistency.toFixed(1)}%`
    );


    setPerformanceText(
        "performanceConsistencyDetail",
        stats.consistency === null
            ? "Account not net profitable"
            : "Best Day / Net P&L"
    );


    setPerformanceText(
        "performanceAvgWinLoss",
        `${formatPerformanceMoney(
            stats.avgWin
        )} / ${formatPerformanceMoney(
            stats.avgLoss
        )}`
    );


    setPerformanceText(
        "performanceAvgWinLossDetail",
        stats.avgLoss !== 0
            ? `${
                Math.abs(
                    stats.avgWin /
                    stats.avgLoss
                ).toFixed(2)
            }:1 ratio`
            : "--"
    );


    setPerformanceText(
        "performanceProfitFactor",
        Number.isFinite(
            stats.profitFactor
        )
            ? stats.profitFactor.toFixed(
                2
            )
            : "∞"
    );


    setPerformanceText(
        "performanceProfitFactorDetail",
        "Gross W / Gross L"
    );

    /*
    =====================================
    PERFORMANCE INSIGHTS
    =====================================
    */
    
    
    /*
    BEST / WORST DAY
    */
    
    if(
        insights.bestDay
    ) {
    
        setPerformanceText(
            "performanceBestDay",
            `Best · ${insights.bestDay.name}`
        );
    
    
        setPerformanceValue(
            "performanceBestDay",
            `Best · ${insights.bestDay.name}`,
            insights.bestDay.pnl
        );
    
    
        setPerformanceText(
            "performanceWorstDay",
            `Worst · ${insights.worstDay.name} · ${formatPerformanceMoney(
                insights.worstDay.pnl
            )}`
        );
    
    }
    else {
    
        setPerformanceText(
            "performanceBestDay",
            "--"
        );
    
    
        setPerformanceText(
            "performanceWorstDay",
            "--"
        );
    
    }
    
    
    /*
    BEST SESSION
    */
    
    if(
        insights.bestSession
    ) {
    
        setPerformanceText(
            "performanceBestSession",
            insights.bestSession.name
        );
    
    
        setPerformanceText(
            "performanceBestSessionMeta",
            `${formatPerformanceMoney(
                insights.bestSession.pnl
            )} · ${insights.bestSession.trades} Trades`
        );
    
    }
    else {
    
        setPerformanceText(
            "performanceBestSession",
            "--"
        );
    
    
        setPerformanceText(
            "performanceBestSessionMeta",
            "--"
        );
    
    }
    
    
    /*
    WORST SESSION
    */
    
    if(
        insights.worstSession
    ) {
    
        setPerformanceText(
            "performanceWorstSession",
            insights.worstSession.name
        );
    
    
        setPerformanceText(
            "performanceWorstSessionMeta",
            `${formatPerformanceMoney(
                insights.worstSession.pnl
            )} · ${insights.worstSession.trades} Trades`
        );
    
    }
    else {
    
        setPerformanceText(
            "performanceWorstSession",
            "--"
        );
    
    
        setPerformanceText(
            "performanceWorstSessionMeta",
            "--"
        );
    
    }
    
    
    /*
    BEST HOUR
    */
    
    if(
        insights.bestHour
    ) {
    
        setPerformanceText(
            "performanceBestHour",
            insights.bestHour.name
        );
    
    
        setPerformanceText(
            "performanceBestHourMeta",
            `${formatPerformanceMoney(
                insights.bestHour.pnl
            )} · ${insights.bestHour.trades} Trades`
        );
    
    }
    else {
    
        setPerformanceText(
            "performanceBestHour",
            "--"
        );
    
    
        setPerformanceText(
            "performanceBestHourMeta",
            "--"
        );
    
    }
    
    
    /*
    AVG HOLD
    */
    
    setPerformanceText(
        "performanceAvgHold",
        formatPerformanceDuration(
            insights.avgHoldSeconds
        )
    );
    
    
    setPerformanceText(
        "performanceAvgHoldMeta",
        insights.holdTradeCount > 0
            ? `across ${insights.holdTradeCount} Trades`
            : "--"
    );
    
    
    /*
    P&L BY FIRM
    */
    
    if(
        insights.bestFirm
    ) {
    
        setPerformanceText(
            "performanceBestFirm",
            `Best · ${insights.bestFirm.name}`
        );
    
    
        if(
            insights.worstFirm
        ) {
    
            setPerformanceText(
                "performanceWorstFirm",
                `Worst · ${insights.worstFirm.name} · ${formatPerformanceMoney(
                    insights.worstFirm.pnl
                )}`
            );
    
        }
    
    }
    else {
    
        setPerformanceText(
            "performanceBestFirm",
            "--"
        );
    
    
        setPerformanceText(
            "performanceWorstFirm",
            "--"
        );
    
    }
    
    
    updateAccountPerformancePeriodLabel();

}


/*
=========================================
GET TRADES
=========================================
*/

function getAccountPerformanceTrades() {

    const accountList =
        Array.isArray(
            accounts
        )
            ? accounts
            : [];


    let selectedAccounts =
        accountList;


    if(
        accountPerformanceState.accountId !==
        "all"
    ) {

        selectedAccounts =
            accountList.filter(
                account =>
                    account.id ===
                    accountPerformanceState.accountId
            );

    }


    const trades =
        [];


    selectedAccounts.forEach(
        account => {

            if(
                !Array.isArray(
                    account.trades
                )
            ) {

                return;

            }


            account.trades.forEach(
                trade => {

                    const normalized =
                        normalizePerformanceTrade(
                            trade,
                            account
                        );


                    if(!normalized) {

                        return;

                    }


                    if(
                        !isTradeInsidePerformancePeriod(
                            normalized.date
                        )
                    ) {

                        return;

                    }


                    trades.push(
                        normalized
                    );

                }
            );

        }
    );


    return trades.sort(
        (a,b) =>
            a.date -
            b.date
    );

}


/*
=========================================
NORMALIZE TRADE
=========================================
*/

function normalizePerformanceTrade(
    trade,
    account
) {

    const pnl =
        parsePerformancePnL(
            trade.pnl ??
            trade.netPnl ??
            trade.profit ??
            trade.realizedPnl
        );


    const date =
        getPerformanceTradeDate(
            trade
        );


    if(
        !date ||
        !Number.isFinite(
            pnl
        )
    ) {

        return null;

    }


    return {
    
        accountId:
            account.id,
    
        accountName:
            account.accountName,
    
        provider:
            account.provider,
    
        pnl,
    
        date,
    
        durationSeconds:
            getPerformanceTradeDurationSeconds(
                trade
            ),
    
        raw:
            trade
    
    };

}


/*
=========================================
TRADE DATE
=========================================
*/

function getPerformanceTradeDate(
    trade
) {

    const candidates = [

        trade.soldTimestamp,
        trade.exitTimestamp,
        trade.exitTime,
        trade.closedAt,
        trade.timestamp,
        trade.date,
        trade.tradeDate,
        trade.boughtTimestamp

    ];


    for(
        const value of candidates
    ) {

        if(!value) {

            continue;

        }


        const text =
            String(
                value
            ).trim();


        /*
        MM/DD/YYYY HH:mm:ss
        */

        const usMatch =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
            );


        if(usMatch) {

            const date =
                new Date(

                    Number(
                        usMatch[3]
                    ),

                    Number(
                        usMatch[1]
                    ) - 1,

                    Number(
                        usMatch[2]
                    ),

                    Number(
                        usMatch[4] || 0
                    ),

                    Number(
                        usMatch[5] || 0
                    ),

                    Number(
                        usMatch[6] || 0
                    )

                );


            if(
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return date;

            }

        }


        const parsed =
            new Date(
                text
            );


        if(
            !Number.isNaN(
                parsed.getTime()
            )
        ) {

            return parsed;

        }

    }


    return null;

}

/*
=========================================
TRADE DURATION
=========================================
*/

function getPerformanceTradeDurationSeconds(
    trade
) {

    if(!trade) {

        return null;

    }


    /*
    =====================================
    DIREKTE DURATION
    Beispiele:
    11min 20sec
    32sec
    1min 41sec
    =====================================
    */

    if(
        trade.duration !==
        undefined &&
        trade.duration !==
        null
    ) {

        const text =
            String(
                trade.duration
            ).toLowerCase();


        let seconds =
            0;


        const hourMatch =
            text.match(
                /(\d+)\s*h/
            );


        const minuteMatch =
            text.match(
                /(\d+)\s*min/
            );


        const secondMatch =
            text.match(
                /(\d+)\s*sec/
            );


        if(hourMatch) {

            seconds +=
                Number(
                    hourMatch[1]
                ) * 3600;

        }


        if(minuteMatch) {

            seconds +=
                Number(
                    minuteMatch[1]
                ) * 60;

        }


        if(secondMatch) {

            seconds +=
                Number(
                    secondMatch[1]
                );

        }


        if(seconds > 0) {

            return seconds;

        }

    }


    /*
    =====================================
    FALLBACK:
    ENTRY / EXIT ZEIT
    =====================================
    */

    const entry =
        getPerformanceTimestamp(
            trade.boughtTimestamp ??
            trade.entryTimestamp ??
            trade.entryTime ??
            trade.openedAt
        );


    const exit =
        getPerformanceTimestamp(
            trade.soldTimestamp ??
            trade.exitTimestamp ??
            trade.exitTime ??
            trade.closedAt
        );


    if(
        entry &&
        exit
    ) {

        return Math.abs(
            Math.round(
                (
                    exit.getTime() -
                    entry.getTime()
                ) / 1000
            )
        );

    }


    return null;

}



/*
=========================================
TIMESTAMP PARSER
=========================================
*/

function getPerformanceTimestamp(
    value
) {

    if(!value) {

        return null;

    }


    const text =
        String(
            value
        ).trim();


    const usMatch =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
        );


    if(usMatch) {

        const date =
            new Date(

                Number(
                    usMatch[3]
                ),

                Number(
                    usMatch[1]
                ) - 1,

                Number(
                    usMatch[2]
                ),

                Number(
                    usMatch[4] || 0
                ),

                Number(
                    usMatch[5] || 0
                ),

                Number(
                    usMatch[6] || 0
                )

            );


        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const parsed =
        new Date(
            text
        );


    return Number.isNaN(
        parsed.getTime()
    )
        ? null
        : parsed;

}

/*
=========================================
PNL PARSER
=========================================
*/

function parsePerformancePnL(
    value
) {

    if(
        typeof value ===
        "number"
    ) {

        return value;

    }


    if(
        value === null ||
        value === undefined
    ) {

        return 0;

    }


    let text =
        String(
            value
        )
            .trim()
            .replace(
                /\$/g,
                ""
            )
            .replace(
                /,/g,
                ""
            );


    const negative =
        text.includes("(") &&
        text.includes(")");


    text =
        text.replace(
            /[()]/g,
            ""
        );


    const number =
        Number(
            text
        );


    if(
        !Number.isFinite(
            number
        )
    ) {

        return 0;

    }


    return negative
        ? -Math.abs(
            number
        )
        : number;

}


/*
=========================================
PERIOD FILTER
=========================================
*/

function isTradeInsidePerformancePeriod(
    tradeDate
) {

    const range =
        getAccountPerformanceDateRange();


    if(!range) {

        return true;

    }


    return (
        tradeDate >=
            range.start &&
        tradeDate <=
            range.end
    );

}


/*
=========================================
DATE RANGE
=========================================
*/

function getAccountPerformanceDateRange() {

    const now =
        new Date();


    const startOfToday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0
        );


    const endOfToday =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
        );


    switch(
        accountPerformanceState.period
    ) {

        case "today":

            return {
                start:
                    startOfToday,
                end:
                    endOfToday
            };


        case "thisWeek": {

            const day =
                startOfToday.getDay();


            const offset =
                day === 0
                    ? 6
                    : day - 1;


            const start =
                new Date(
                    startOfToday
                );


            start.setDate(
                start.getDate() -
                offset
            );


            return {
                start,
                end:
                    endOfToday
            };

        }


        case "thisMonth":

            return {

                start:
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        1
                    ),

                end:
                    endOfToday

            };


        case "lastMonth":

            return {

                start:
                    new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                    ),

                end:
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0,
                        23,
                        59,
                        59,
                        999
                    )

            };


        case "thisYear":

            return {

                start:
                    new Date(
                        now.getFullYear(),
                        0,
                        1
                    ),

                end:
                    endOfToday

            };


        case "allTime":

            return null;


        case "custom": {

            if(
                !accountPerformanceState.customStart ||
                !accountPerformanceState.customEnd
            ) {

                return null;

            }


            return {

                start:
                    new Date(
                        `${accountPerformanceState.customStart}T00:00:00`
                    ),

                end:
                    new Date(
                        `${accountPerformanceState.customEnd}T23:59:59`
                    )

            };

        }


        default:

            return null;

    }

}


/*
=========================================
CALCULATE STATS
=========================================
*/

function calculateAccountPerformanceStats(
    trades
) {

    const values =
        Array.isArray(
            trades
        )
            ? trades
            : [];


    let netPnl =
        0;


    let grossWin =
        0;


    let grossLoss =
        0;


    let wins =
        0;


    let losses =
        0;


    const winners =
        [];


    const losers =
        [];


    const daily =
        {};


    values.forEach(
        trade => {

            const pnl =
                Number(
                    trade.pnl
                ) || 0;


            netPnl +=
                pnl;


            if(
                pnl > 0
            ) {

                wins++;

                grossWin +=
                    pnl;

                winners.push(
                    pnl
                );

            }
            else if(
                pnl < 0
            ) {

                losses++;

                grossLoss +=
                    Math.abs(
                        pnl
                    );

                losers.push(
                    pnl
                );

            }


            const key =
                getPerformanceDateKey(
                    trade.date
                );


            daily[key] =
                (
                    daily[key] ||
                    0
                ) +
                pnl;

        }
    );


    const tradeCount =
        values.length;


    const decidedTrades =
        wins +
        losses;


    const winRate =
        decidedTrades > 0
            ? (
                wins /
                decidedTrades
            ) * 100
            : 0;


    const avgWin =
        winners.length
            ? grossWin /
                winners.length
            : 0;


    const avgLoss =
        losers.length
            ? -(
                grossLoss /
                losers.length
            )
            : 0;


    const profitFactor =
        grossLoss > 0
            ? grossWin /
                grossLoss
            : grossWin > 0
                ? Infinity
                : 0;


    const dailyValues =
        Object.values(
            daily
        );


    const bestDay =
        dailyValues.length
            ? Math.max(
                ...dailyValues
            )
            : 0;


    const consistency =
        netPnl > 0 &&
        bestDay > 0

            ? (
                bestDay /
                netPnl
            ) * 100

            : null;


    const todayKey =
        getPerformanceDateKey(
            new Date()
        );


    const yesterday =
        new Date();


    yesterday.setDate(
        yesterday.getDate() -
        1
    );


    const yesterdayKey =
        getPerformanceDateKey(
            yesterday
        );


    const todayTrades =
        values.filter(
            trade =>
                getPerformanceDateKey(
                    trade.date
                ) ===
                todayKey
        );


    const yesterdayTrades =
        values.filter(
            trade =>
                getPerformanceDateKey(
                    trade.date
                ) ===
                yesterdayKey
        );


    const todayPnl =
        todayTrades.reduce(
            (sum, trade) =>
                sum +
                trade.pnl,
            0
        );


    const yesterdayPnl =
        yesterdayTrades.reduce(
            (sum, trade) =>
                sum +
                trade.pnl,
            0
        );


    const change =
        todayPnl -
        yesterdayPnl;


    const changePercent =
        yesterdayPnl !== 0

            ? (
                change /
                Math.abs(
                    yesterdayPnl
                )
            ) * 100

            : null;


    return {

        netPnl,

        tradeCount,

        wins,

        losses,

        winRate,

        avgWin,

        avgLoss,

        profitFactor,

        consistency,

        todayPnl,

        yesterdayPnl,

        change,

        changePercent,

        todayTrades:
            todayTrades.length,

        yesterdayTrades:
            yesterdayTrades.length

    };

}

/*
=========================================
PERFORMANCE INSIGHTS
=========================================
*/

function calculateAccountPerformanceInsights(
    trades
) {

    const source =
        Array.isArray(
            trades
        )
            ? trades
            : [];


    if(
        source.length ===
        0
    ) {

        return buildEmptyPerformanceInsights();

    }


    const byWeekday =
        {};


    const bySession =
        {};


    const byHour =
        {};


    const byFirm =
        {};


    const durations =
        [];


    source.forEach(
        trade => {

            const pnl =
                Number(
                    trade.pnl
                ) || 0;


            /*
            =================================
            WEEKDAY
            =================================
            */

            const weekday =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone:
                            "Europe/Berlin",

                        weekday:
                            "long"
                    }
                ).format(
                    trade.date
                );


            addPerformanceGroupValue(
                byWeekday,
                weekday,
                pnl
            );


            /*
            =================================
            SESSION
            =================================
            */

            const session =
                getPerformanceSession(
                    trade.date
                );


            addPerformanceGroupValue(
                bySession,
                session,
                pnl
            );


            /*
            =================================
            HOUR
            =================================
            */

            const hour =
                getPerformanceBerlinHour(
                    trade.date
                );


            const hourLabel =
                `${String(hour).padStart(
                    2,
                    "0"
                )}:00–${String(
                    (hour + 1) % 24
                ).padStart(
                    2,
                    "0"
                )}:00`;


            addPerformanceGroupValue(
                byHour,
                hourLabel,
                pnl
            );


            /*
            =================================
            FIRM
            =================================
            */

            const firm =
                String(
                    trade.provider ||
                    "UNKNOWN"
                ).toUpperCase();


            addPerformanceGroupValue(
                byFirm,
                firm,
                pnl
            );


            /*
            =================================
            HOLD TIME
            =================================
            */

            if(
                Number.isFinite(
                    trade.durationSeconds
                ) &&
                trade.durationSeconds >= 0
            ) {

                durations.push(
                    trade.durationSeconds
                );

            }

        }
    );


    const bestDay =
        getBestPerformanceGroup(
            byWeekday
        );


    const worstDay =
        getWorstPerformanceGroup(
            byWeekday
        );


    const bestSession =
        getBestPerformanceGroup(
            bySession
        );


    const worstSession =
        getWorstPerformanceGroup(
            bySession
        );


    const bestHour =
        getBestPerformanceGroup(
            byHour
        );


    const bestFirm =
        getBestPerformanceGroup(
            byFirm
        );


    const worstFirm =
        getWorstPerformanceGroup(
            byFirm
        );


    const avgHoldSeconds =
        durations.length > 0

            ? durations.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            durations.length

            : null;


    return {

        bestDay,

        worstDay,

        bestSession,

        worstSession,

        bestHour,

        avgHoldSeconds,

        holdTradeCount:
            durations.length,

        bestFirm,

        worstFirm,

        byWeekday,

        bySession,

        byHour,

        byFirm

    };

}

/*
=========================================
GROUP VALUE
=========================================
*/

function addPerformanceGroupValue(
    target,
    key,
    pnl
) {

    if(
        !target[key]
    ) {

        target[key] = {

            pnl:
                0,

            trades:
                0

        };

    }


    target[key].pnl +=
        Number(
            pnl
        ) || 0;


    target[key].trades++;

}



/*
=========================================
BEST GROUP
=========================================
*/

function getBestPerformanceGroup(
    groups
) {

    const entries =
        Object.entries(
            groups || {}
        );


    if(
        entries.length ===
        0
    ) {

        return null;

    }


    const [
        name,
        data
    ] =
        entries.sort(
            (a,b) =>
                b[1].pnl -
                a[1].pnl
        )[0];


    return {

        name,

        pnl:
            data.pnl,

        trades:
            data.trades

    };

}



/*
=========================================
WORST GROUP
=========================================
*/

function getWorstPerformanceGroup(
    groups
) {

    const entries =
        Object.entries(
            groups || {}
        );


    if(
        entries.length ===
        0
    ) {

        return null;

    }


    const [
        name,
        data
    ] =
        entries.sort(
            (a,b) =>
                a[1].pnl -
                b[1].pnl
        )[0];


    return {

        name,

        pnl:
            data.pnl,

        trades:
            data.trades

    };

}



/*
=========================================
BERLIN HOUR
=========================================
*/

function getPerformanceBerlinHour(
    date
) {

    const value =
        new Intl.DateTimeFormat(
            "en-GB",
            {

                timeZone:
                    "Europe/Berlin",

                hour:
                    "2-digit",

                hour12:
                    false

            }
        ).format(
            date
        );


    return Number(
        value
    );

}



/*
=========================================
TRADING SESSION
=========================================

Zeiten in Berlin-Zeit.

ASIA
00:00 – 08:00

LONDON
08:00 – 15:30

NY OPEN
15:30 – 16:15

PM SESSION
16:15 – 22:00

LATE
22:00 – 00:00
=========================================
*/

function getPerformanceSession(
    date
) {

    const formatter =
        new Intl.DateTimeFormat(
            "en-GB",
            {

                timeZone:
                    "Europe/Berlin",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    false

            }
        );


    const parts =
        formatter
            .formatToParts(
                date
            );


    let hour =
        0;


    let minute =
        0;


    parts.forEach(
        part => {

            if(
                part.type ===
                "hour"
            ) {

                hour =
                    Number(
                        part.value
                    );

            }


            if(
                part.type ===
                "minute"
            ) {

                minute =
                    Number(
                        part.value
                    );

            }

        }
    );


    const minutes =
        (
            hour *
            60
        ) +
        minute;


    if(
        minutes <
        8 * 60
    ) {

        return "ASIA";

    }


    if(
        minutes <
        (
            15 * 60 +
            30
        )
    ) {

        return "LONDON";

    }


    if(
        minutes <
        (
            16 * 60 +
            15
        )
    ) {

        return "NY OPEN";

    }


    if(
        minutes <
        22 * 60
    ) {

        return "PM SESSION";

    }


    return "LATE";

}



/*
=========================================
FORMAT HOLD TIME
=========================================
*/

function formatPerformanceDuration(
    seconds
) {

    if(
        seconds === null ||
        !Number.isFinite(
            seconds
        )
    ) {

        return "--";

    }


    const total =
        Math.max(
            0,
            Math.round(
                seconds
            )
        );


    const hours =
        Math.floor(
            total /
            3600
        );


    const minutes =
        Math.floor(
            (
                total %
                3600
            ) /
            60
        );


    const secs =
        total %
        60;


    if(
        hours > 0
    ) {

        return `${hours}h ${minutes}m`;

    }


    if(
        minutes > 0
    ) {

        return `${minutes}m ${secs}s`;

    }


    return `${secs}s`;

}



/*
=========================================
EMPTY INSIGHTS
=========================================
*/

function buildEmptyPerformanceInsights() {

    return {

        bestDay:
            null,

        worstDay:
            null,

        bestSession:
            null,

        worstSession:
            null,

        bestHour:
            null,

        avgHoldSeconds:
            null,

        holdTradeCount:
            0,

        bestFirm:
            null,

        worstFirm:
            null,

        byWeekday:
            {},

        bySession:
            {},

        byHour:
            {},

        byFirm:
            {}

    };

}

/*
=========================================
DATE KEY
=========================================
*/

function getPerformanceDateKey(
    date
) {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                "Europe/Berlin",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit"
        }
    ).format(
        date
    );

}


/*
=========================================
ACCOUNT TABS
=========================================
*/

function renderAccountPerformanceTabs() {

    const container =
        document.getElementById(
            "performanceAccountTabs"
        );


    if(!container) {

        return;

    }


    const source =
        Array.isArray(
            accounts
        )
            ? accounts
            : [];


    let html = `

        <button
            class="performance-account-tab ${
                accountPerformanceState.accountId ===
                "all"
                    ? "active"
                    : ""
            }"
            data-performance-account="all"
        >

            <strong>
                ALL ACCOUNTS
            </strong>

            <span>
                Aggregated View
            </span>

        </button>

    `;


    source.forEach(
        account => {

            const provider =
                String(
                    account.provider ||
                    ""
                ).toUpperCase();


            html += `

                <button
                    class="performance-account-tab ${
                        accountPerformanceState.accountId ===
                        account.id
                            ? "active"
                            : ""
                    }"
                    data-performance-account="${account.id}"
                >

                    <strong>
                        ${escapePerformanceHtml(
                            account.accountName
                        )}
                    </strong>

                    <span>
                        ${escapePerformanceHtml(
                            provider
                        )}
                    </span>

                </button>

            `;

        }
    );


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            ".performance-account-tab"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        accountPerformanceState.accountId =
                            button.dataset
                                .performanceAccount;


                        renderAccountPerformanceTabs();

                        renderAccountPerformance();

                    };

            }
        );

}


/*
=========================================
PERIOD BUTTONS
=========================================
*/

function bindAccountPerformancePeriodButtons() {

    document
        .querySelectorAll(
            "[data-performance-period]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        accountPerformanceState.period =
                            button.dataset
                                .performancePeriod;


                        document
                            .querySelectorAll(
                                "[data-performance-period]"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "active"
                                        )
                            );


                        button.classList.add(
                            "active"
                        );


                        renderAccountPerformance();

                    };

            }
        );

}


/*
=========================================
PERIOD LABEL
=========================================
*/

function updateAccountPerformancePeriodLabel() {

    const element =
        document.getElementById(
            "performancePeriodLabel"
        );


    if(!element) {

        return;

    }


    const labels = {

        today:
            "Today",

        thisWeek:
            "This Week",

        thisMonth:
            "This Month",

        lastMonth:
            "Last Month",

        thisYear:
            "This Year",

        allTime:
            "All Time",

        custom:
            "Custom"

    };


    element.textContent =
        labels[
            accountPerformanceState.period
        ] ||
        "This Week";

}


/*
=========================================
UI HELPERS
=========================================
*/

function setPerformanceText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if(element) {

        element.textContent =
            value;

    }

}


function setPerformanceValue(
    id,
    value,
    numericValue
) {

    const element =
        document.getElementById(
            id
        );


    if(!element) {

        return;

    }


    element.textContent =
        value;


    element.classList.remove(
        "performance-positive",
        "performance-negative"
    );


    if(
        numericValue > 0
    ) {

        element.classList.add(
            "performance-positive"
        );

    }
    else if(
        numericValue < 0
    ) {

        element.classList.add(
            "performance-negative"
        );

    }

}


function formatPerformanceMoney(
    value
) {

    const number =
        Number(
            value
        ) || 0;


    const sign =
        number > 0
            ? "+"
            : number < 0
                ? "-"
                : "";


    return (
        sign +
        "$" +
        Math.abs(
            number
        ).toLocaleString(
            "en-US",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );

}


function formatPerformancePercent(
    value
) {

    if(
        value === null ||
        !Number.isFinite(
            value
        )
    ) {

        return "--";

    }


    const sign =
        value > 0
            ? "+"
            : "";


    return (
        sign +
        value.toFixed(
            1
        ) +
        "%"
    );

}


function escapePerformanceHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/*
=========================================
DEBUG
=========================================
*/

function debugAccountPerformance() {

    const trades =
        getAccountPerformanceTrades();


    const stats =
        calculateAccountPerformanceStats(
            trades
        );

    const insights =
    calculateAccountPerformanceInsights(
        trades
    );

   const insights =
    calculateAccountPerformanceInsights(
        trades
    );


    console.log(
        "TPR ACCOUNT PERFORMANCE",
        {
    
            state:
                accountPerformanceState,
    
            trades,
    
            stats,
    
            insights
    
        }
    );


    console.table(
        [
            {

                account:
                    accountPerformanceState.accountId,

                period:
                    accountPerformanceState.period,

                trades:
                    stats.tradeCount,

                netPnl:
                    stats.netPnl,

                today:
                    stats.todayPnl,

                yesterday:
                    stats.yesterdayPnl,

                change:
                    stats.change,

                winRate:
                    stats.winRate,

                consistency:
                    stats.consistency,

                avgWin:
                    stats.avgWin,

                avgLoss:
                    stats.avgLoss,

                bestDay:
                    insights.bestDay
                        ?.name ||
                    "--",
                
                bestSession:
                    insights.bestSession
                        ?.name ||
                    "--",
                
                worstSession:
                    insights.worstSession
                        ?.name ||
                    "--",
                
                bestHour:
                    insights.bestHour
                        ?.name ||
                    "--",
                
                avgHold:
                    formatPerformanceDuration(
                        insights.avgHoldSeconds
                    ),
                
                bestFirm:
                    insights.bestFirm
                        ?.name ||
                    "--",

                profitFactor:
                    stats.profitFactor

            }
        ]
    );


    return stats;

}
