/*
=========================================
TPR PRO AI
Account Manager
=========================================
*/


let accounts = loadAccounts();


function loadAccounts(){

    const saved =
        localStorage.getItem("tpr_accounts");

    if(saved){

        return JSON.parse(saved);

    }

    return [];

}



function saveAccounts(){

    localStorage.setItem(
        "tpr_accounts",
        JSON.stringify(accounts)
    );

}



function createAccount(
    provider,
    accountType,
    accountName,
    startingBalance
){

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

        daysTraded: 0,

        trades: [],

        createdAt:
            new Date().toISOString()

    };


    accounts.push(account);

    saveAccounts();

    return account;

}



function deleteAccount(accountId){

    accounts =
        accounts.filter(
            account =>
            account.id !== accountId
        );

    saveAccounts();

}



function getAccount(accountId){

    return accounts.find(
        account =>
        account.id === accountId
    );

}



function updateAccount(account){

    const index =
        accounts.findIndex(
            item =>
            item.id === account.id
        );


    if(index === -1){

        return;

    }


    accounts[index] = account;

    saveAccounts();

}

function loadSelectedAccountIds() {

    const saved =
        localStorage.getItem("tpr_selected_accounts");

    if(saved) {
        return JSON.parse(saved);
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
        account => ids.includes(account.id)
    );

}

function createTradeFingerprint(trade) {

    /*
    Eindeutige IDs bevorzugen:
    Topstep: Id
    Lucid: buyFillId + sellFillId
    */

    if(trade.Id) {
        return "TOPSTEP_" + trade.Id;
    }

    if(trade.buyFillId || trade.sellFillId) {

        return (
            "LUCID_" +
            (trade.buyFillId || "") +
            "_" +
            (trade.sellFillId || "")
        );

    }


    /*
    Fallback, falls eine CSV keine Trade-ID enthält
    */

    return JSON.stringify(trade);
}

function getTradePnLForBalance(trade) {

    const value =
        trade.PnL ??
        trade.pnl ??
        trade["Profit/Loss"] ??
        0;


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



function recalculateAccountBalance(account) {

    const trades =
        Array.isArray(account.trades)
            ? account.trades
            : [];


    const tradingPnL =
        trades.reduce(
            (sum, trade) =>
                sum +
                getTradePnLForBalance(trade),
            0
        );


    /*
    Payouts bauen wir später
    als eigene Historie ein.
    */

    const totalPayouts =
        Number(
            account.totalPayouts ?? 0
        );


    account.totalTradingPnL =
        tradingPnL;


    account.balance =
        Number(account.startingBalance)
        +
        tradingPnL
        -
        totalPayouts;


    return account;

}

function importTradesToAccount(accountId, rawTrades) {

    const account =
        getAccount(accountId);


    if(!account) {

        throw new Error(
            "Account wurde nicht gefunden."
        );

    }


    if(!Array.isArray(account.trades)) {

        account.trades = [];

    }


    const existingFingerprints =
        new Set(
            account.trades.map(
                trade =>
                    trade._fingerprint ||
                    createTradeFingerprint(trade)
            )
        );


    let added = 0;
    let duplicates = 0;


    rawTrades.forEach(trade => {

        const fingerprint =
            createTradeFingerprint(trade);


        if(existingFingerprints.has(fingerprint)) {

            duplicates++;

            return;

        }


        account.trades.push({

            ...trade,

            _fingerprint: fingerprint

        });


        existingFingerprints.add(
            fingerprint
        );


        added++;

    });


recalculateAccountBalance(
    account
);


updateAccount(
    account
);


return {

    added,

    duplicates,

    total: account.trades.length,

    tradingPnL:
        account.totalTradingPnL,

    balance:
        account.balance

};

}
