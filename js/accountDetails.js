/*
=========================================
TPR PRO AI
Account Details
=========================================
*/


function getAccountNetGrowth(account) {

    const balance =
        Number(account.balance) || 0;

    const start =
        Number(account.startingBalance) || 0;

    return balance - start;
}


function getAccountPreviousBalance(account) {

    const value =
        Number(account.previousBalance);

    if(Number.isFinite(value)) {
        return value;
    }

    return null;
}


function getAccountDailyPnL(account) {

    const previous =
        getAccountPreviousBalance(account);

    if(previous === null) {
        return null;
    }

    return (
        Number(account.balance || 0) -
        previous
    );
}


function getAccountRemainingDrawdown(account) {

    /*
    Erstmal gespeicherten Wert verwenden.
    Später provider-spezifisch automatisieren.
    */

    const value =
        Number(
            account.remainingDrawdown
        );

    if(Number.isFinite(value)) {
        return value;
    }

    return null;
}


function getAccountDLLRemaining(account) {

    const dll =
        Number(
            account.dailyLossLimit
        );

    if(!Number.isFinite(dll)) {
        return null;
    }


    const todayPnL =
        getAccountDailyPnL(account);


    if(todayPnL === null) {
        return dll;
    }


    /*
    Bei Verlust reduziert sich
    der verbleibende DLL.
    */

    if(todayPnL < 0) {

        return Math.max(
            0,
            dll + todayPnL
        );

    }


    return dll;
}


function getAccountConsistencyInfo(account) {

    const limit =
        Number(
            account.consistencyLimit
        );


    const current =
        Number(
            account.consistencyCurrent
        );


    if(
        !Number.isFinite(limit) ||
        !Number.isFinite(current)
    ) {

        return null;
    }


    return {

        current,
        limit

    };
}

/*
=========================================
TRADING DAYS AUS TRADES
=========================================
*/

function getAccountTradingDays(account) {

    const trades =
        Array.isArray(account.trades)
            ? account.trades
            : [];


    const days =
        new Set();


    trades.forEach(trade => {

        let dateValue =
            trade.TradeDay ||
            trade.tradeDay ||
            trade.date ||
            trade.Date ||
            trade.entryTime ||
            trade.EnteredAt ||
            null;


        if(!dateValue) {
            return;
        }


        /*
        Nur Datum verwenden.
        Funktioniert z.B. mit:
        08/07/2026 00:00:00 -05:00
        08/07/2026 16:10:05 +02:00
        */

        const text =
            String(dateValue)
                .trim();


        const match =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
            );


        if(match) {

            const key =
                match[3] +
                "-" +
                match[1].padStart(2, "0") +
                "-" +
                match[2].padStart(2, "0");


            days.add(key);

            return;
        }


        /*
        ISO Datum
        */

        const isoMatch =
            text.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        if(isoMatch) {

            days.add(
                isoMatch[1] +
                "-" +
                isoMatch[2] +
                "-" +
                isoMatch[3]
            );

        }

    });


    return Array.from(days)
        .sort();

}


function getAccountTradingDayCount(account) {

    return getAccountTradingDays(
        account
    ).length;

}

function getAccountPayoutDetail(account) {

    const rules =
        getAccountDetailRules(
            account
        );


    const tradingDays =
        getAccountTradingDayCount(
            account
        );


    const netGrowth =
        getAccountNetGrowth(
            account
        );


    if(!rules) {

        return {

            tradingDays,

            requiredDays: null,

            remainingDays: null,

            remainingAmount: null

        };

    }


    /*
    Trading Days
    */

    const requiredDays =
        Number(
            rules.minTradingDays
        );


    const hasDayRequirement =
        Number.isFinite(
            requiredDays
        );


    const remainingDays =
        hasDayRequirement
            ? Math.max(
                0,
                requiredDays -
                tradingDays
            )
            : 0;


    /*
    Dollar-Betrag bis Payout
    */

    const recommendedBuffer =
        Number(
            rules.recommendedBuffer
        ) || 0;


    const minPayout =
        Number(
            rules.minPayout
        ) || 0;


    /*
    Für einen sinnvollen Payout:
    Ziel = Buffer + Mindestpayout
    */

    const payoutTarget =
        recommendedBuffer +
        minPayout;


    const remainingAmount =
        Math.max(
            0,
            payoutTarget -
            netGrowth
        );


    return {

        tradingDays,

        requiredDays:
            hasDayRequirement
                ? requiredDays
                : null,

        remainingDays,

        recommendedBuffer,

        minPayout,

        payoutTarget,

        remainingAmount

    };

}


function formatAccountDetailMoney(value) {

    if(
        value === null ||
        value === undefined ||
        !Number.isFinite(
            Number(value)
        )
    ) {

        return "--";
    }


    const number =
        Number(value);


    return (
        number > 0
            ? "+"
            : ""
    ) +
    number.toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function buildAccountDetailsHTML(account) {

    const netGrowth =
        getAccountNetGrowth(
            account
        );


    const previousBalance =
        getAccountPreviousBalance(
            account
        );


    const todayPnL =
        getAccountDailyPnL(
            account
        );


    const payout =
        getAccountPayoutDetail(
            account
        );


    const consistency =
        getAccountConsistencyInfo(
            account
        );


    const remainingDrawdown =
        getAccountRemainingDrawdown(
            account
        );


    const dllRemaining =
        getAccountDLLRemaining(
            account
        );


    let payoutHTML =
        `
        <div class="account-detail-section">

            <div class="account-detail-section-title">
                PAYOUT
            </div>

            <div class="account-detail-grid">
        `;


    if(
        payout.qualifyingDays !== null &&
        payout.requiredDays !== null
    ) {

        payoutHTML += `

            <div class="account-detail-item">
                <span>Qualifying Days</span>
                <strong>
                    ${payout.qualifyingDays}
                    /
                    ${payout.requiredDays}
                </strong>
            </div>

        `;

    }


    if(
        payout.remainingDays !== null
    ) {

        payoutHTML += `

            <div class="account-detail-item">
                <span>Noch notwendig</span>
                <strong>
                    ${payout.remainingDays}
                    Tag(e)
                </strong>
            </div>

        `;

    }


    if(
        payout.remainingAmount !== null
    ) {

        payoutHTML += `

            <div class="account-detail-item">
                <span>Noch bis Payout-Ziel</span>
                <strong>
                    ${formatAccountDetailMoney(
                        payout.remainingAmount
                    )}
                </strong>
            </div>

        `;

    }


    payoutHTML += `
            </div>
        </div>
    `;


    let consistencyHTML =
        "";


    if(consistency) {

        consistencyHTML = `

            <div class="account-detail-section">

                <div class="account-detail-section-title">
                    CONSISTENCY
                </div>

                <div class="account-detail-grid">

                    <div class="account-detail-item">

                        <span>Aktuell</span>

                        <strong>
                            ${consistency.current.toFixed(1)} %
                        </strong>

                    </div>


                    <div class="account-detail-item">

                        <span>Limit</span>

                        <strong>
                            ${consistency.limit.toFixed(1)} %
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }


    return `

        <div class="account-detail-content">

            <div class="account-detail-grid">

                <div class="account-detail-item">

                    <span>Net Account Growth</span>

                    <strong>
                        ${formatAccountDetailMoney(
                            netGrowth
                        )}
                    </strong>

                </div>


                <div class="account-detail-item">

                    <span>Previous Balance</span>

                    <strong>
                        ${
                            previousBalance !== null
                                ? formatAccountDetailMoney(
                                    previousBalance
                                )
                                : "--"
                        }
                    </strong>

                </div>


                <div class="account-detail-item">

                    <span>Today P&L</span>

                    <strong>
                        ${
                            todayPnL !== null
                                ? formatAccountDetailMoney(
                                    todayPnL
                                )
                                : "--"
                        }
                    </strong>

                </div>


                <div class="account-detail-item">

                    <span>Remaining Drawdown</span>

                    <strong>
                        ${
                            remainingDrawdown !== null
                                ? formatAccountDetailMoney(
                                    remainingDrawdown
                                )
                                : "--"
                        }
                    </strong>

                </div>


                <div class="account-detail-item">

                    <span>DLL Remaining</span>

                    <strong>
                        ${
                            dllRemaining !== null
                                ? formatAccountDetailMoney(
                                    dllRemaining
                                )
                                : "--"
                        }
                    </strong>

                </div>

            </div>


            ${payoutHTML}

            ${consistencyHTML}

        </div>

    `;
}


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


    const hidden =
        row.style.display ===
        "none";


    row.style.display =
        hidden
            ? "table-row"
            : "none";


    const account =
        getAccount(
            accountId
        );


    if(
        hidden &&
        account
    ) {

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

    }

}

function getAccountDetailRules(account) {

    if(
        typeof PROP_RULES === "undefined" ||
        !PROP_RULES ||
        !PROP_RULES[account.provider] ||
        !PROP_RULES[account.provider].accounts ||
        !PROP_RULES[account.provider]
            .accounts[account.accountType]
    ) {

        return null;

    }


    return PROP_RULES[
        account.provider
    ].accounts[
        account.accountType
    ];
}

function getTradeDayNetPnL(account) {

    const trades =
        Array.isArray(account.trades)
            ? account.trades
            : [];


    const daily =
        {};


    trades.forEach(trade => {

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
            return;
        }


        const text =
            String(dateValue);


        const match =
            text.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
            );


        if(!match) {
            return;
        }


        const dayKey =
            match[3] +
            "-" +
            match[1].padStart(2, "0") +
            "-" +
            match[2].padStart(2, "0");


        let pnl = 0;


        if(
            typeof parseMoney ===
            "function"
        ) {

            pnl =
                parseMoney(
                    trade.PnL ??
                    trade.pnl ??
                    0
                );

        }


        /*
        Topstep:
        Fees + Commissions abziehen
        */

        if(
            String(account.provider)
                .toLowerCase() ===
            "topstep"
        ) {

            pnl -=
                Math.abs(
                    parseMoney(
                        trade.Fees ?? 0
                    )
                );


            pnl -=
                Math.abs(
                    parseMoney(
                        trade.Commissions ?? 0
                    )
                );

        }


        /*
        Lucid:
        1 USD pro Contract
        */

        if(
            String(account.provider)
                .toLowerCase() ===
            "lucid"
        ) {

            pnl -=
                Math.abs(
                    Number(
                        trade.qty ?? 0
                    )
                );

        }


        if(!daily[dayKey]) {

            daily[dayKey] =
                0;

        }


        daily[dayKey] +=
            pnl;

    });


    return daily;
}
