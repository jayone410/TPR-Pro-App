/*
=========================================
TPR PRO AI
Statistics Engine v1
=========================================
*/


function parsePnLValue(value) {

    if(value === null || value === undefined) {
        return 0;
    }

    if(typeof value === "number") {
        return value;
    }

    const cleaned =
        String(value)
            .replace(/\$/g, "")
            .replace(/,/g, "")
            .trim();

    const number =
        Number(cleaned);

    return Number.isFinite(number)
        ? number
        : 0;
}



function getTradePnL(trade) {

    return parsePnLValue(

        trade.pnl ??
        trade.PnL ??
        trade["Profit/Loss"] ??
        0

    );
}



function calculateStatistics(trades) {

    if(!Array.isArray(trades)) {
        trades = [];
    }


    const totalTrades =
        trades.length;


    const pnlValues =
        trades.map(
            trade =>
                getTradePnL(trade)
        );


    const winners =
        pnlValues.filter(
            pnl => pnl > 0
        );


    const losers =
        pnlValues.filter(
            pnl => pnl < 0
        );


    const breakEven =
        pnlValues.filter(
            pnl => pnl === 0
        );


    const grossProfit =
        winners.reduce(
            (sum, pnl) =>
                sum + pnl,
            0
        );


    const grossLoss =
        Math.abs(
            losers.reduce(
                (sum, pnl) =>
                    sum + pnl,
                0
            )
        );


    const totalPnL =
        pnlValues.reduce(
            (sum, pnl) =>
                sum + pnl,
            0
        );


    const winRate =
        totalTrades > 0
            ? (
                winners.length /
                totalTrades
              ) * 100
            : 0;


    const profitFactor =
        grossLoss > 0
            ? grossProfit / grossLoss
            : grossProfit > 0
                ? Infinity
                : 0;


    const averageWinner =
        winners.length > 0
            ? grossProfit /
              winners.length
            : 0;


    const averageLoser =
        losers.length > 0
            ? grossLoss /
              losers.length
            : 0;


    const expectancy =
        totalTrades > 0
            ? totalPnL /
              totalTrades
            : 0;


    return {

        totalTrades,

        winners:
            winners.length,

        losers:
            losers.length,

        breakEven:
            breakEven.length,

        winRate,

        grossProfit,

        grossLoss,

        totalPnL,

        profitFactor,

        averageWinner,

        averageLoser,

        expectancy

    };

}
