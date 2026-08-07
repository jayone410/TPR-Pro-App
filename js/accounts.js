/*
=========================================
TPR PRO AI
Account Data & Storage
=========================================
*/


let accounts = loadAccounts();



/*
=========================================
ACCOUNTS LADEN / SPEICHERN
=========================================
*/

function loadAccounts() {

    const saved =
        localStorage.getItem(
            "tpr_accounts"
        );


    if(saved) {

        try {

            return JSON.parse(saved);

        }
        catch(error) {

            console.error(
                "Accounts konnten nicht geladen werden:",
                error
            );

        }

    }


    return [];
}



function saveAccounts() {

    localStorage.setItem(
        "tpr_accounts",
        JSON.stringify(accounts)
    );

}



/*
=========================================
ACCOUNT ERSTELLEN
=========================================
*/

function createAccount(
    provider,
    accountType,
    accountName,
    startingBalance
) {

    const account = {

        id:
            "TPR-" +
            Date.now(),

        provider,

        accountType,

        accountName,

        startingBalance:
            Number(startingBalance),

        balance:
            Number(startingBalance),

        totalTradingPnL: 0,

        totalPayouts: 0,

        daysTraded: 0,

        trades: [],

        createdAt:
            new Date().toISOString()

    };


    accounts.push(account);

    saveAccounts();


    return account;

}



/*
=========================================
ACCOUNT SUCHEN
=========================================
*/

function getAccount(accountId) {

    return accounts.find(
        account =>
            account.id === accountId
    );

}



/*
=========================================
ACCOUNT AKTUALISIEREN
=========================================
*/

function updateAccount(account) {

    const index =
        accounts.findIndex(
            item =>
                item.id === account.id
        );


    if(index === -1) {
        return;
    }


    accounts[index] =
        account;


    saveAccounts();

}



/*
=========================================
ACCOUNT LÖSCHEN
=========================================
*/

function removeAccount(accountId) {

    accounts =
        accounts.filter(
            account =>
                account.id !==
                accountId
        );


    saveAccounts();

}



/*
=========================================
ACCOUNT DUPLIZIEREN
=========================================
*/

function duplicateAccount(accountId) {

    const source =
        getAccount(accountId);


    if(!source) {

        return null;

    }


    const copy = {

        ...source,


        id:
            "TPR-" +
            Date.now(),


        accountName:
            source.accountName +
            " Copy",


        balance:
            Number(
                source.startingBalance
            ),


        totalTradingPnL: 0,

        totalPayouts: 0,

        daysTraded: 0,

        trades: [],


        createdAt:
            new Date().toISOString()

    };


    accounts.push(copy);

    saveAccounts();


    return copy;

}



/*
=========================================
ACCOUNT AUSWAHL
=========================================
*/

function loadSelectedAccountIds() {

    const saved =
        localStorage.getItem(
            "tpr_selected_accounts"
        );


    if(saved) {

        try {

            return JSON.parse(saved);

        }
        catch(error) {

            console.error(
                "Account Auswahl konnte nicht geladen werden:",
                error
            );

        }

    }


    return [];

}



function saveSelectedAccountIds(ids) {

    localStorage.setItem(
        "tpr_selected_accounts",
        JSON.stringify(ids)
    );

}



function getSelectedAccounts(ids) {

    return accounts.filter(
        account =>
            ids.includes(
                account.id
            )
    );

}



/*
=========================================
TRADE FINGERPRINT
=========================================
*/

function createTradeFingerprint(
    trade
) {

    /*
    Topstep:
    eindeutige Trade ID
    */

    if(trade.Id) {

        return (
            "TOPSTEP_" +
            trade.Id
        );

    }


    /*
    Lucid:
    Buy + Sell Fill IDs
    */

    if(
        trade.buyFillId ||
        trade.sellFillId
    ) {

        return (

            "LUCID_" +

            (
                trade.buyFillId ||
                ""
            ) +

            "_" +

            (
                trade.sellFillId ||
                ""
            )

        );

    }


    /*
    Fallback
    */

    return JSON.stringify(
        trade
    );

}



/*
=========================================
TRADE P&L LESEN
=========================================
*/

function parseMoney(value) {

    if(value === null || value === undefined) {
        return 0;
    }

    if(typeof value === "number") {
        return value;
    }

    let text =
        String(value).trim();

    /*
    Beispiele:
    $590.00
    $(460.00)
    -290.000000
    */
    const isParenthesesNegative =
        text.includes("(") &&
        text.includes(")");

    text =
        text
            .replace(/\$/g, "")
            .replace(/,/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "")
            .trim();

    let number =
        Number(text);

    if(!Number.isFinite(number)) {
        return 0;
    }

    if(isParenthesesNegative) {
        number =
            -Math.abs(number);
    }

    return number;
}


function getTradePnLForBalance(trade) {

    const pnl =
        parseMoney(
            trade.PnL ??
            trade.pnl ??
            trade["Profit/Loss"] ??
            0
        );

    /*
    Tradovate / Topstep:
    PnL ist Gross P/L.
    Gebühren separat abziehen.
    */
    if(trade.PnL !== undefined) {

        const fees =
            parseMoney(
                trade.Fees ?? 0
            );

        const commissions =
            parseMoney(
                trade.Commissions ?? 0
            );

        return (
            pnl
            - Math.abs(fees)
            - Math.abs(commissions)
        );
    }

    /*
    Lucid:
    pnl ist bereits der Ergebniswert
    */
    return pnl;
}



/*
=========================================
ACCOUNT BALANCE NEU BERECHNEN
=========================================
*/

function recalculateAccountBalance(
    account
) {

    const trades =
        Array.isArray(
            account.trades
        )
            ? account.trades
            : [];


    const tradingPnL =
        trades.reduce(

            (sum, trade) =>

                sum +
                getTradePnLForBalance(
                    trade
                ),

            0
        );


    const totalPayouts =
        Number(
            account.totalPayouts ??
            0
        );


    account.totalTradingPnL =
        tradingPnL;


    account.balance =

        Number(
            account.startingBalance
        )

        +

        tradingPnL

        -

        totalPayouts;


    return account;

}



/*
=========================================
TRADES IN ACCOUNT IMPORTIEREN
=========================================
*/

function importTradesToAccount(
    accountId,
    rawTrades
) {

    const account =
        getAccount(accountId);


    if(!account) {

        throw new Error(
            "Account wurde nicht gefunden."
        );

    }


    if(
        !Array.isArray(
            account.trades
        )
    ) {

        account.trades = [];

    }



    /*
    Bereits bekannte Trades
    */

    const existingFingerprints =
        new Set(

            account.trades.map(

                trade =>

                    trade._fingerprint ||

                    createTradeFingerprint(
                        trade
                    )

            )

        );


    let added = 0;

    let duplicates = 0;



    /*
    Neue Trades prüfen
    */

    rawTrades.forEach(
        trade => {

            const fingerprint =
                createTradeFingerprint(
                    trade
                );


            if(
                existingFingerprints
                    .has(
                        fingerprint
                    )
            ) {

                duplicates++;

                return;

            }


            account.trades.push({

                ...trade,

                _fingerprint:
                    fingerprint

            });


            existingFingerprints.add(
                fingerprint
            );


            added++;

        }
    );



    /*
    Balance neu berechnen
    */

    recalculateAccountBalance(
        account
    );


    /*
    Account speichern
    */

    updateAccount(
        account
    );


    return {

        added,

        duplicates,

        total:
            account.trades.length,

        tradingPnL:
            account.totalTradingPnL,

        balance:
            account.balance

    };

}
