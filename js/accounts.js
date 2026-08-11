/*
=========================================
TPR PRO AI
Account Data & Storage
=========================================
*/


let accounts = loadAccounts();

migrateAccountsToRulesV2();

migrateAccountStages();

migrateAccountsToRulesV3();

migrateAccountPayoutHistory();


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
    program,
    accountType,
    accountName,
    startingBalance
) {

    /*
    Official Rules laden
    */

    const rules =
        typeof getOfficialRules ===
        "function"

            ? getOfficialRules(
                provider,
                program,
                accountType
            )

            : null;


    /*
    Stage automatisch aus Programm
    */

    const stage =
        rules &&
        rules.stage

            ? rules.stage

            : getStageFromProgram(
                provider,
                program,
                accountType
            );


    /*
    Startbalance

    Wenn Rules einen offiziellen
    Startwert haben, bevorzugen wir
    zunächst die Formulareingabe.

    Damit bleiben manuelle Werte möglich.
    */

    const start =
        Number(
            startingBalance
        );


    const safeStart =
        Number.isFinite(start)

            ? start

            : (
                rules &&
                Number.isFinite(
                    Number(
                        rules.startingBalance
                    )
                )

                    ? Number(
                        rules.startingBalance
                    )

                    : 0
            );


    const account = {

        id:
            "TPR-" +
            Date.now(),

        provider,

        program,

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
            new Date()
                .toISOString(),

        totalTradingPnL:
            0,

        totalPayouts:
            0,

        payoutHistory:
            [],
        
        payoutCount:
            0,

        payoutCycleStartDate:
            null,

        ruleOverrides:
            {},

        daysTraded:
            0,

        trades:
            [],

        createdAt:
            new Date()
                .toISOString()

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
PAYOUT HISTORY
=========================================
*/

function ensurePayoutHistory(
    account
) {

    if(
        !Array.isArray(
            account.payoutHistory
        )
    ) {

        account.payoutHistory =
            [];

    }


    if(
        !Number.isFinite(
            Number(
                account.payoutCount
            )
        )
    ) {

        account.payoutCount =
            account.payoutHistory.length;

    }


    return account.payoutHistory;

}


/*
=========================================
PAYOUT HINZUFÜGEN
=========================================
*/

function addAccountPayout(
    accountId,
    amount,
    payoutDate = null
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {

        return {

            success: false,

            message:
                "Account nicht gefunden."

        };

    }


    const payoutAmount =
        Number(
            amount
        );


    if(
        !Number.isFinite(
            payoutAmount
        ) ||
        payoutAmount <= 0
    ) {

        return {

            success: false,

            message:
                "Ungültiger Payout-Betrag."

        };

    }


    const history =
        ensurePayoutHistory(
            account
        );


    const date =
        payoutDate
            ? String(
                payoutDate
            )
            : new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


    /*
    Aktuellen Cycle vor dem Reset sichern
    */

    const cycleProfit =
        typeof getAccountCycleDailyPnL ===
        "function"

            ? Object.values(
                getAccountCycleDailyPnL(
                    account
                )
            ).reduce(
                (
                    sum,
                    value
                ) => {

                    const number =
                        Number(
                            value
                        );


                    return (
                        sum +
                        (
                            Number.isFinite(
                                number
                            )
                                ? number
                                : 0
                        )
                    );

                },
                0
            )

            : 0;


    const cycleDays =
        typeof getAccountCycleDailyPnL ===
        "function"

            ? Object.keys(
                getAccountCycleDailyPnL(
                    account
                )
            ).length

            : 0;


    const payoutEntry = {

        id:
            "PAYOUT-" +
            Date.now(),

        cycleNumber:
            history.length +
            1,

        date,

        amount:
            payoutAmount,

        cycleStartDate:
            account.payoutCycleStartDate ||
            null,

        cycleProfit,

        cycleDays,

        createdAt:
            new Date()
                .toISOString()

    };


    history.push(
        payoutEntry
    );


    /*
    Gesamtpayouts aktualisieren
    */

    account.totalPayouts =
        history.reduce(
            (
                sum,
                payout
            ) => {

                const value =
                    Number(
                        payout.amount
                    );


                return (
                    sum +
                    (
                        Number.isFinite(
                            value
                        )
                            ? value
                            : 0
                    )
                );

            },
            0
        );


    account.payoutCount =
        history.length;


    /*
    Neuer Cycle startet
    am Tag NACH dem Payout.
    */

    const nextCycleDate =
        addDaysToISODate(
            date,
            1
        );


    account.payoutCycleStartDate =
        nextCycleDate;


    /*
    Topstep:
    nach erstem Payout MLL ggf. auf 0.
    */

    const rules =
        typeof getEffectiveRules ===
        "function"

            ? getEffectiveRules(
                account
            )

            : null;


    if(
        account.payoutCount > 0 &&
        rules &&
        rules.mllResetsToZeroAfterFirstPayout ===
            true
    ) {

        account.mllLocked =
            true;

    }


    updateAccount(
        account
    );


    return {

        success: true,

        payout:
            payoutEntry,

        payoutCount:
            account.payoutCount,

        totalPayouts:
            account.totalPayouts,

        nextCycleStart:
            account.payoutCycleStartDate

    };

}


/*
=========================================
PAYOUT LÖSCHEN
=========================================
*/

function removeAccountPayout(
    accountId,
    payoutId
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {

        return false;

    }


    ensurePayoutHistory(
        account
    );


    account.payoutHistory =
        account.payoutHistory
            .filter(
                payout =>
                    payout.id !==
                    payoutId
            );


    /*
    Cycle Nummern neu setzen
    */

    account.payoutHistory
        .forEach(
            (
                payout,
                index
            ) => {

                payout.cycleNumber =
                    index +
                    1;

            }
        );


    account.payoutCount =
        account.payoutHistory
            .length;


    account.totalPayouts =
        account.payoutHistory
            .reduce(
                (
                    sum,
                    payout
                ) => {

                    const value =
                        Number(
                            payout.amount
                        );


                    return (
                        sum +
                        (
                            Number.isFinite(
                                value
                            )
                                ? value
                                : 0
                        )
                    );

                },
                0
            );


    /*
    Letzten bekannten Cycle Start
    wiederherstellen
    */

    const lastPayout =
        account.payoutHistory[
            account.payoutHistory.length -
            1
        ];


    account.payoutCycleStartDate =
        lastPayout
            ? addDaysToISODate(
                lastPayout.date,
                1
            )
            : null;

    updateAccount(
        account
    );


    return true;

}


/*
=========================================
DATUM + TAGE
=========================================
*/

function addDaysToISODate(
    dateString,
    days
) {

    const date =
        new Date(
            dateString +
            "T12:00:00"
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    date.setDate(
        date.getDate() +
        Number(
            days
        )
    );


    return date
        .toISOString()
        .slice(
            0,
            10
        );

}


/*
=========================================
AKTUELLER CYCLE
=========================================
*/

function getAccountPayoutCycleInfo(
    account
) {

    ensurePayoutHistory(
        account
    );


    const daily =
        typeof getAccountCycleDailyPnL ===
        "function"

            ? getAccountCycleDailyPnL(
                account
            )

            : {};


    const days =
        Object.keys(
            daily
        ).sort();


    const profit =
        Object.values(
            daily
        ).reduce(
            (
                sum,
                value
            ) => {

                const number =
                    Number(
                        value
                    );


                return (
                    sum +
                    (
                        Number.isFinite(
                            number
                        )
                            ? number
                            : 0
                    )
                );

            },
            0
        );


    return {

        cycleNumber:
            Number(
                account.payoutCount ||
                0
            ) +
            1,

        startDate:
            account.payoutCycleStartDate ||
            (
                days.length > 0
                    ? days[0]
                    : null
            ),

        tradingDays:
            days.length,

        profit,

        payoutCount:
            Number(
                account.payoutCount ||
                0
            ),

        totalPayouts:
            Number(
                account.totalPayouts ||
                0
            )

    };

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

        payoutHistory:
            [],
        
        payoutCount:
            0,
        
        payoutCycleStartDate:
            null,
        
        mllLocked:
            false,

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
                        account.stageManual !== true &&
                        account.stage !== "evaluation"
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


                /*
                Stage nur automatisch setzen,
                wenn keine manuelle Stage
                gespeichert wurde.
                */
                
                if(
                    rules &&
                    rules.stage &&
                    account.stageManual !== true &&
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

function migrateAccountPayoutHistory() {

    let changed =
        false;


    accounts.forEach(
        account => {

            if(
                !Array.isArray(
                    account.payoutHistory
                )
            ) {

                account.payoutHistory =
                    [];

                changed =
                    true;

            }


            if(
                !Number.isFinite(
                    Number(
                        account.payoutCount
                    )
                )
            ) {

                account.payoutCount =
                    account.payoutHistory
                        .length;

                changed =
                    true;

            }


            if(
                account.payoutCycleStartDate ===
                undefined
            ) {

                account.payoutCycleStartDate =
                    null;

                changed =
                    true;

            }

        }
    );


    if(changed) {

        saveAccounts();

        console.log(
            "✅ Payout History migriert"
        );

    }

}
