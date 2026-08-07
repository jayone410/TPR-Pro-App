/*
=========================================
TPR PRO AI
Advanced Trade Analytics
=========================================
*/


function calculateAdvancedAnalytics(
    rawTrades
) {

    const trades =
        normalizeTradeArray(
            rawTrades
        );


    /*
    =====================================
    EQUITY + MAX DRAWDOWN
    =====================================
    */

    const sorted =
        [...trades].sort(
            (a, b) =>
                (a.entryTimestamp ?? 0) -
                (b.entryTimestamp ?? 0)
        );


    let equity = 0;

    let equityHigh = 0;

    let maxDrawdown = 0;


    const equityCurve =
        sorted.map(trade => {

            equity += trade.pnl;

            equityHigh =
                Math.max(
                    equityHigh,
                    equity
                );


            const drawdown =
                equityHigh -
                equity;


            maxDrawdown =
                Math.max(
                    maxDrawdown,
                    drawdown
                );


            return {

                timestamp:
                    trade.entryTimestamp,

                pnl:
                    trade.pnl,

                equity,

                drawdown

            };

        });



    /*
    =====================================
    PERFORMANCE PRO STUNDE
    =====================================
    */

    const hourly = {};


    trades.forEach(trade => {

        if(trade.entryHour === null) {
            return;
        }


        const hour =
            trade.entryHour;


        if(!hourly[hour]) {

            hourly[hour] = {

                trades: 0,
                wins: 0,
                losses: 0,
                pnl: 0

            };

        }


        hourly[hour].trades++;

        hourly[hour].pnl +=
            trade.pnl;


        if(trade.pnl > 0) {

            hourly[hour].wins++;

        }
        else if(trade.pnl < 0) {

            hourly[hour].losses++;

        }

    });



    Object.keys(hourly)
        .forEach(hour => {

            const data =
                hourly[hour];


            data.winRate =
                data.trades > 0
                    ? (
                        data.wins /
                        data.trades
                      ) * 100
                    : 0;

        });



    /*
    =====================================
    LONG / SHORT
    =====================================
    */

    function calculateSide(side) {

        const sideTrades =
            trades.filter(
                trade =>
                    trade.side === side
            );


        const pnl =
            sideTrades.reduce(
                (sum, trade) =>
                    sum + trade.pnl,
                0
            );


        const winners =
            sideTrades.filter(
                trade =>
                    trade.pnl > 0
            ).length;


        return {

            trades:
                sideTrades.length,

            pnl,

            winRate:
                sideTrades.length > 0
                    ? (
                        winners /
                        sideTrades.length
                      ) * 100
                    : 0

        };

    }


    const longStats =
        calculateSide("LONG");


    const shortStats =
        calculateSide("SHORT");



    /*
    =====================================
    BESTE / SCHLECHTESTE STUNDE
    =====================================
    */

    const hours =
        Object.entries(hourly);


    let bestHour = null;

    let worstHour = null;


    if(hours.length > 0) {

        bestHour =
            [...hours]
                .sort(
                    (a, b) =>
                        b[1].pnl -
                        a[1].pnl
                )[0];


        worstHour =
            [...hours]
                .sort(
                    (a, b) =>
                        a[1].pnl -
                        b[1].pnl
                )[0];

    }



    return {

        trades,

        equityCurve,

        maxDrawdown,

        hourly,

        longStats,

        shortStats,

        bestHour,

        worstHour

    };

}
