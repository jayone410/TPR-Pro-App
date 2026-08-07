/*
=========================================
TPR PRO AI
Universal Trade Adapter
=========================================
*/


function parsePnL(value) {

    if(typeof value === "number") {
        return value;
    }

    const cleaned =
        String(value ?? "")
            .replace(/\$/g, "")
            .replace(/,/g, "")
            .trim();

    const result = Number(cleaned);

    return Number.isFinite(result)
        ? result
        : 0;
}



/*
MM/DD/YYYY HH:MM:SS
oder
MM/DD/YYYY HH:MM:SS +02:00
*/

function parseTradeDate(value) {

    if(!value) {
        return null;
    }

    const match =
        String(value).match(
            /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
        );


    if(!match) {
        return null;
    }


    const [
        ,
        month,
        day,
        year,
        hour,
        minute,
        second
    ] = match;


    return {

        year: Number(year),

        month: Number(month),

        day: Number(day),

        hour: Number(hour),

        minute: Number(minute),

        second: Number(second),

        date:
            `${year}-${month}-${day}`,

        time:
            `${hour}:${minute}:${second}`,

        timestamp:
            Date.UTC(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute),
                Number(second)
            )

    };
}



function normalizeTrade(trade) {

    /*
    =====================================
    TOPSTEP
    =====================================
    */

    if(trade.EnteredAt !== undefined) {

        const entry =
            parseTradeDate(
                trade.EnteredAt
            );

        const exit =
            parseTradeDate(
                trade.ExitedAt
            );


        return {

            provider: "topstep",

            tradeId:
                String(trade.Id ?? ""),

            symbol:
                trade.ContractName ?? "",

            side:
                String(
                    trade.Type ?? ""
                ).toUpperCase(),

            qty:
                Number(
                    trade.Size ?? 0
                ),

            pnl:
                parsePnL(
                    trade.PnL
                ),

            entryDate:
                entry?.date ?? "",

            entryTime:
                entry?.time ?? "",

            exitTime:
                exit?.time ?? "",

            entryHour:
                entry?.hour ?? null,

            entryMinute:
                entry?.minute ?? null,

            entryTimestamp:
                entry?.timestamp ?? null,

            exitTimestamp:
                exit?.timestamp ?? null,

            duration:
                trade.TradeDuration ?? "",

            raw:
                trade

        };

    }



    /*
    =====================================
    LUCID
    =====================================
    */

    if(
        trade.boughtTimestamp !== undefined ||
        trade.soldTimestamp !== undefined
    ) {

        const buy =
            parseTradeDate(
                trade.boughtTimestamp
            );

        const sell =
            parseTradeDate(
                trade.soldTimestamp
            );


        let side = "UNKNOWN";

        let entry = buy;

        let exit = sell;


        if(
            buy &&
            sell
        ) {

            if(
                buy.timestamp <=
                sell.timestamp
            ) {

                side = "LONG";

                entry = buy;

                exit = sell;

            }
            else {

                side = "SHORT";

                entry = sell;

                exit = buy;

            }

        }


        return {

            provider: "lucid",

            tradeId:
                `${trade.buyFillId ?? ""}_${trade.sellFillId ?? ""}`,

            symbol:
                trade.symbol ?? "",

            side,

            qty:
                Number(
                    trade.qty ?? 0
                ),

            pnl:
                parsePnL(
                    trade.pnl
                ),

            entryDate:
                entry?.date ?? "",

            entryTime:
                entry?.time ?? "",

            exitTime:
                exit?.time ?? "",

            entryHour:
                entry?.hour ?? null,

            entryMinute:
                entry?.minute ?? null,

            entryTimestamp:
                entry?.timestamp ?? null,

            exitTimestamp:
                exit?.timestamp ?? null,

            duration:
                trade.duration ?? "",

            raw:
                trade

        };

    }


    return null;

}



function normalizeTradeArray(trades) {

    return trades
        .map(normalizeTrade)
        .filter(
            trade => trade !== null
        );

}
