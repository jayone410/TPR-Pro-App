/*
=========================================
TPR PRO AI
Account Data & Storage
=========================================
*/


let accounts = loadAccounts();

migrateAccountsToRulesV2();

migrateAccountStages();


/*
=========================================
STORAGE
=========================================
*/

function loadAccounts() {

    const saved =
        localStorage.getItem(
            "tpr_accounts"
        );


    if(!saved) {
        return [];
    }


    try {

        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    }
    catch(error) {

        console.error(
            "Accounts konnten nicht geladen werden:",
            error
        );


        return [];

    }

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

    const start =
        Number(startingBalance);


    const safeStart =
        Number.isFinite(start)
            ? start
            : 0;


    const account = {

        id:
            "TPR-" +
            Date.now(),

        provider,

        grogram,

        stage,

        accountType,

        accountName,

        startingBalance:
            safeStart,

        balance:
            safeStart,

        previousBalance:
            null,

        balanceUpdatedAt:
            new Date().toISOString(),

        totalTradingPnL:
            0,

        totalPayouts:
            0,

        daysTraded:
            0,

        trades:
            [],

        createdAt:
            new Date().toISOString()

    };


    accounts.push(
        account
    );


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
            account.id ===
            accountId
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
                item.id ===
                account.id
        );


    if(index === -1) {

        return false;

    }


    accounts[index] =
        account;


    saveAccounts();


    return true;

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
        getAccount(
            accountId
        );


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

        previousBalance:
            null,

        balanceUpdatedAt:
            new Date().toISOString(),

        totalTradingPnL:
            0,

        totalPayouts:
            0,

        daysTraded:
            0,

        trades:
            [],

        createdAt:
            new Date().toISOString()

    };


    accounts.push(
        copy
    );


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


    if(!saved) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    }
    catch(error) {

        console.error(
            "Account Auswahl konnte nicht geladen werden:",
            error
        );


        return [];

    }

}


function saveSelectedAccountIds(ids) {

    localStorage.setItem(
        "tpr_selected_accounts",
        JSON.stringify(ids)
    );

}


function getSelectedAccounts(ids) {

    if(!Array.isArray(ids)) {

        return [];

    }


    return accounts.filter(
        account =>
            ids.includes(
                account.id
            )
    );

}


/*
=========================================
MONEY PARSER
=========================================
*/

function parseMoney(value) {

    if(
        value === null ||
        value === undefined
    ) {

        return 0;

    }


    if(
        typeof value ===
        "number"
    ) {

        return Number.isFinite(value)
            ? value
            : 0;

    }


    let text =
        String(value)
            .trim();


    /*
    Beispiele:

    $120.00
    $(460.00)
    -290.000000
    1,250.50
    */


    const parenthesesNegative =
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


    if(
        !Number.isFinite(
            number
        )
    ) {

        return 0;

    }


    if(parenthesesNegative) {

        number =
            -Math.abs(number);

    }


    return number;

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
    TOPSTEP / TRADOVATE
    */

    if(trade.Id) {

        return (
            "TOPSTEP_" +
            trade.Id
        );

    }


    /*
    LUCID
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
    FALLBACK
    */

    return JSON.stringify(
        trade
    );

}


/*
=========================================
GENERIC TRADE P&L
=========================================
*/

function getTradeGrossPnL(
    trade
) {

    return parseMoney(

        trade.PnL ??

        trade.pnl ??

        trade["Profit/Loss"] ??

        0

    );

}


/*
=========================================
LUCID NET P&L
=========================================
*/

function calculateLucidNetPnL(
    account
) {

    const trades =
        Array.isArray(
            account.trades
        )
            ? account.trades
            : [];


    let grossPnL =
        0;

    let fees =
        0;


    trades.forEach(
        trade => {

            const pnl =
                parseMoney(
                    trade.pnl ?? 0
                );


            grossPnL +=
                pnl;


            /*
            Aktuell anhand deiner
            Lucid CSV bestätigt:

            $1 Kosten pro Contract
            */

            const qty =
                Number(
                    trade.qty ?? 0
                );


            if(
                Number.isFinite(
                    qty
                )
            ) {

                fees +=
                    Math.abs(qty);

            }

        }
    );


    const netPnL =
        grossPnL -
        fees;


    return {

        grossPnL,

        fees,

        netPnL

    };

}


/*
=========================================
LUCID BALANCE AKTUALISIEREN
=========================================
*/

function updateLucidBalanceFromTrades(
    account
) {

    const performance =
        calculateLucidNetPnL(
            account
        );


    const oldBalance =
        Number(
            account.balance
        ) || 0;


    const newBalance =
        Number(
            account.startingBalance
        )
        +
        performance.netPnL;


    if(
        newBalance !==
        oldBalance
    ) {

        account.previousBalance =
            oldBalance;

    }


    account.totalTradingPnL =
        performance.netPnL;


    account.grossTradingPnL =
        performance.grossPnL;


    account.totalTradingFees =
        performance.fees;


    account.balance =
        newBalance;


    account.balanceUpdatedAt =
        new Date()
            .toISOString();


    return account;

}


/*
=========================================
TOPSTEP / TRADOVATE ANALYTICS P&L
=========================================
*/

function calculateTopstepNetPnL(account) {

    const trades =
        Array.isArray(account.trades)
            ? account.trades
            : [];


    let grossPnL = 0;
    let fees = 0;
    let commissions = 0;


    trades.forEach(trade => {

        grossPnL +=
            parseMoney(
                trade.PnL ?? 0
            );


        fees +=
            Math.abs(
                parseMoney(
                    trade.Fees ?? 0
                )
            );


        commissions +=
            Math.abs(
                parseMoney(
                    trade.Commissions ?? 0
                )
            );

    });


    const netPnL =
        grossPnL -
        fees -
        commissions;


    return {

        grossPnL,

        fees,

        commissions,

        netPnL

    };

}


/*
=========================================
TRADES IMPORTIEREN
=========================================
*/

function importTradesToAccount(
    accountId,
    rawTrades
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {

        throw new Error(
            "Account wurde nicht gefunden."
        );

    }


    if(
        !Array.isArray(
            rawTrades
        )
    ) {

        throw new Error(
            "Ungültige Trade-Daten."
        );

    }


    if(
        !Array.isArray(
            account.trades
        )
    ) {

        account.trades =
            [];

    }


    /*
    Bereits vorhandene Trades
    */

    const existingFingerprints =
        new Set(

            account.trades.map(
                trade => {

                    return (
                        trade._fingerprint ||
                        createTradeFingerprint(
                            trade
                        )
                    );

                }
            )

        );


    let added =
        0;

    let duplicates =
        0;


    /*
    Neue Trades importieren
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
    =====================================
    PROVIDER SPEZIFISCHE BALANCE LOGIK
    =====================================
    */


    const provider =
        String(
            account.provider ||
            ""
        ).toLowerCase();


    /*
    LUCID

    CSV beeinflusst Balance automatisch.
    */

    if(
        provider ===
        "lucid"
    ) {

        updateLucidBalanceFromTrades(
            account
        );

    }


    /*
    TOPSTEP / TRADOVATE

    Current Balance bleibt manuell.

    CSV dient hier vorerst nur
    Analytics / Trade Historie.
    */

    if(
    provider ===
    "topstep"
) {

    const performance =
        calculateTopstepNetPnL(
            account
        );


    account.grossTradingPnL =
        performance.grossPnL;


    account.totalTradingFees =
        performance.fees;


    account.totalCommissions =
        performance.commissions;


    account.totalTradingPnL =
        performance.netPnL;


    /*
    Account Balance aus Netto-P&L
    */

    account.balance =
        Number(
            account.startingBalance
        )
        +
        performance.netPnL;


    account.balanceUpdatedAt =
        new Date()
            .toISOString();

}


    /*
    Speichern
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
            account.totalTradingPnL ||
            0,

        balance:
            account.balance,

        grossTradingPnL:
            account.grossTradingPnL ||
            0,

        totalTradingFees:
            account.totalTradingFees ||
            0

    };

}

function setAccountProgram(
    accountId,
    program
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {

        return false;

    }


    account.program =
        program;


    updateAccount(
        account
    );


    return true;

}

/*
=========================================
ACCOUNT PROGRAMM AUTOMATISCH ERKENNEN
=========================================
*/

function detectAccountProgram(account) {

    const provider =
        String(
            account.provider || ""
        ).toLowerCase();


    const name =
        String(
            account.accountName || ""
        ).toLowerCase();


    /*
    =====================================
    TOPSTEP
    =====================================
    */

    if(
        provider ===
        "topstep"
    ) {

        /*
        Evaluation / Trading Combine
        MUSS zuerst geprüft werden.
        */

        if(
            name.includes("comb") ||
            name.includes("combine") ||
            name.includes("eval") ||
            name.includes("evaluation")
        ) {

            return "tradingCombine";

        }


        /*
        Funded Consistency XFA
        */

        if(
            name.includes("cons") ||
            name.includes("consistency")
        ) {

            return "xfaConsistency";

        }


        /*
        Funded Standard XFA
        */

        return "xfaStandard";

    }


    /*
    =====================================
    LUCID
    =====================================
    */

    if(
        provider ===
        "lucid"
    ) {

        const isFlex =
            name.includes(
                "flex"
            );


        const isEvaluation =
            name.includes("eval") ||
            name.includes(
                "evaluation"
            );


        if(isFlex) {

            return isEvaluation
                ? "flexEvaluation"
                : "flexFunded";

        }


        return isEvaluation
            ? "proEvaluation"
            : "proFunded";

    }


    return null;

}


/*
=========================================
ACCOUNT MIGRATION RULES V2
=========================================
*/

function migrateAccountsToRulesV2() {

    let changed = false;


    accounts.forEach(account => {

        /*
        Programm nur setzen,
        wenn noch keines vorhanden ist.
        */

        if(!account.program) {

            const detected =
                detectAccountProgram(
                    account
                );


            if(detected) {

                account.program =
                    detected;

                changed = true;

            }
        }


        /*
        Rule Overrides vorbereiten
        */

        if(
            !account.ruleOverrides ||
            typeof account.ruleOverrides !==
                "object"
        ) {

            account.ruleOverrides =
                {};

            changed = true;

        }

    });


    if(changed) {

        saveAccounts();

        console.log(
            "✅ Accounts auf Rules v2 migriert"
        );

    }

}

function getStageFromProgram(
    provider,
    program,
    accountType
) {

    if(
        typeof getOfficialRules !== "function"
    ) {
        return "evaluation";
    }


    const rules =
        getOfficialRules(
            provider,
            program,
            accountType
        );


    if(
        rules &&
        rules.stage
    ) {
        return rules.stage;
    }


    return "evaluation";
}

function migrateAccountStages() {

    let changed = false;


    accounts.forEach(
        account => {

            if(
                !account.stage &&
                account.provider &&
                account.program
            ) {

                account.stage =
                    getStageFromProgram(
                        account.provider,
                        account.program,
                        account.accountType
                    );

                changed = true;
            }

        }
    );


    if(changed) {

        saveAccounts();

        console.log(
            "✅ Account Stages migriert"
        );
    }
}

/*
=========================================
RULES V3 MIGRATION
Stage + Program korrigieren
=========================================
*/

function migrateAccountsToRulesV3() {

    let changed =
        false;


    accounts.forEach(
        account => {

            const provider =
                String(
                    account.provider || ""
                ).toLowerCase();


            const name =
                String(
                    account.accountName || ""
                ).toLowerCase();


            /*
            =================================
            TOPSTEP COMBINE KORRIGIEREN
            =================================
            */

            if(
                provider ===
                "topstep"
            ) {

                const isCombine =
                    name.includes("comb") ||
                    name.includes("combine") ||
                    name.includes("eval") ||
                    name.includes("evaluation");


                if(isCombine) {

                    if(
                        account.program !==
                        "tradingCombine"
                    ) {

                        account.program =
                            "tradingCombine";

                        changed =
                            true;

                    }


                    if(
                        account.stage !==
                        "evaluation"
                    ) {

                        account.stage =
                            "evaluation";

                        changed =
                            true;

                    }


                    return;

                }

            }


            /*
            =================================
            STAGE AUS OFFICIAL RULES
            =================================
            */

            if(
                account.provider &&
                account.program &&
                account.accountType &&
                typeof getOfficialRules ===
                    "function"
            ) {

                const rules =
                    getOfficialRules(
                        account.provider,
                        account.program,
                        account.accountType
                    );


                if(
                    rules &&
                    rules.stage &&
                    account.stage !==
                        rules.stage
                ) {

                    account.stage =
                        rules.stage;

                    changed =
                        true;

                }

            }

        }
    );


    if(changed) {

        saveAccounts();


        console.log(
            "✅ Accounts auf Rules v3 migriert"
        );

    }

}
