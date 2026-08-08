/*
=========================================
TPR PRO AI
Portfolio Engine
=========================================
*/


/*
=========================================
HELPER
=========================================
*/

function getSelectedPortfolioAccounts() {

    if(
        typeof getSelectedAccounts !== "function" ||
        !Array.isArray(selectedAccountIds)
    ) {

        return [];

    }


    return getSelectedAccounts(
        selectedAccountIds
    );

}


function formatPortfolioMoney(value) {

    const number =
        Number(value);


    if(!Number.isFinite(number)) {

        return "$0.00";

    }


    return number.toLocaleString(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function getProviderRules(account) {

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



/*
=========================================
HAUPT PORTFOLIO RENDER
=========================================
*/

function renderPortfolio() {

    const selectedAccounts =
        getSelectedPortfolioAccounts();


    /*
    Analytics
    */

    if(
        typeof renderPerformanceAnalytics ===
        "function"
    ) {

        renderPerformanceAnalytics(
            selectedAccounts
        );

    }


    if(
        typeof renderAdvancedAnalytics ===
        "function"
    ) {

        renderAdvancedAnalytics(
            selectedAccounts
        );

    }


    if(
        typeof renderEquityChart ===
        "function"
    ) {

        renderEquityChart(
            selectedAccounts
        );

    }


    if(
        typeof renderDrawdownChart ===
        "function"
    ) {

        renderDrawdownChart(
            selectedAccounts
        );

    }


    if(
        typeof renderHourlyChart ===
        "function"
    ) {

        renderHourlyChart(
            selectedAccounts
        );

    }



    /*
    Keine Accounts ausgewählt
    */

    if(selectedAccounts.length === 0) {

        renderEmptyPortfolio();

        return;

    }



    /*
    Einzelaccount
    */

    if(selectedAccounts.length === 1) {

        renderSingleAccount(
            selectedAccounts[0]
        );

        return;

    }



    /*
    Mehrere Accounts
    */

    renderMultipleAccounts(
        selectedAccounts
    );

}



/*
=========================================
KEINE AUSWAHL
=========================================
*/

function renderEmptyPortfolio() {

    const score =
        document.getElementById(
            "score"
        );

    const recommendation =
        document.getElementById(
            "recommendation"
        );

    const reasons =
        document.getElementById(
            "reasons"
        );

    const riskFactors =
        document.getElementById(
            "riskFactors"
        );

    const payout =
        document.getElementById(
            "payout"
        );

    const dailyPlan =
        document.getElementById(
            "dailyPlan"
        );


    if(score) {

        score.textContent =
            "--";

    }


    if(recommendation) {

        recommendation.textContent =
            "Keine Accounts ausgewählt.";

    }


    if(reasons) {

        reasons.innerHTML =
            "";

    }


    if(riskFactors) {

        riskFactors.innerHTML =
            "";

    }


    if(payout) {

        payout.innerHTML =
            "Account auswählen.";

    }


    if(dailyPlan) {

        dailyPlan.innerHTML =
            "Account auswählen.";

    }

}



/*
=========================================
MISSION CONTROL STATUS
=========================================
*/

function getMissionControlStatus(account) {

    if(
        typeof getAccountStatus ===
        "function"
    ) {

        return getAccountStatus(
            account
        );

    }


    return {

        level: "yellow",

        icon: "🟡",

        text: "CHECK"

    };

}



/*
=========================================
MISSION CONTROL PAYOUT
=========================================
*/

function getMissionControlPayout(account) {

    if(
        typeof getAccountPayoutInfo !==
        "function"
    ) {

        return {

            status: "--",

            label: "--"

        };

    }


    return getAccountPayoutInfo(
        account
    );

}



/*
=========================================
MISSION CONTROL BERECHNEN
=========================================
*/

function calculatePortfolioOverview() {

    const accountList =
        getSelectedPortfolioAccounts();


    let totalBalance = 0;

    let totalStartingBalance = 0;

    let payoutReady = 0;

    let tradeToday = 0;

    let attention = 0;

    let greenCount = 0;

    let yellowCount = 0;

    let redCount = 0;


    accountList.forEach(
        account => {

            /*
            Current Balance
            */

            const balance =
                Number(
                    account.balance
                );


            if(
                Number.isFinite(balance)
            ) {

                totalBalance +=
                    balance;

            }


            /*
            Initial Balance
            */

            const startingBalance =
                Number(
                    account.startingBalance
                );


            if(
                Number.isFinite(
                    startingBalance
                )
            ) {

                totalStartingBalance +=
                    startingBalance;

            }


            /*
            Payout
            */

            const payout =
                getMissionControlPayout(
                    account
                );


            const payoutStatus =
                String(
                    payout.status || ""
                ).toUpperCase();


            if(
                payoutStatus.includes(
                    "READY"
                ) ||
                payoutStatus.includes(
                    "ELIGIBLE"
                )
            ) {

                payoutReady++;

            }


            /*
            Status
            */

            const status =
                getMissionControlStatus(
                    account
                );


            if(
                status.level ===
                "green"
            ) {

                greenCount++;

                tradeToday++;

            }


            if(
                status.level ===
                "yellow"
            ) {

                yellowCount++;

                attention++;

            }


            if(
                status.level ===
                "red"
            ) {

                redCount++;

                attention++;

            }

        }
    );


    /*
    Tatsächlich erwirtschafteter Betrag
    */

    const earnedBalance =
        totalBalance -
        totalStartingBalance;


    return {

        accountCount:
            accountList.length,

        totalBalance,

        totalStartingBalance,

        earnedBalance,

        payoutReady,

        tradeToday,

        attention,

        greenCount,

        yellowCount,

        redCount

    };

}


/*
=========================================
MISSION CONTROL RENDERN
=========================================
*/

function renderPortfolioOverview() {

    const data =
        calculatePortfolioOverview();


    const accountCount =
        document.getElementById(
            "portfolioAccountCount"
        );


    const balance =
        document.getElementById(
            "portfolioBalance"
        );


    const payoutReady =
        document.getElementById(
            "portfolioPayoutReady"
        );


    const tradeToday =
        document.getElementById(
            "portfolioTradeToday"
        );


    const riskCount =
        document.getElementById(
            "portfolioRiskCount"
        );


    const overallStatus =
        document.getElementById(
            "portfolioOverallStatus"
        );


    /*
    Accounts
    */

    if(accountCount) {

        accountCount.textContent =
            data.accountCount;

    }


    /*
    Balance
    */

    if(balance) {

        balance.textContent =
        (
            data.earnedBalance > 0
                ? "+"
                : ""
        ) +
        formatPortfolioMoney(
            data.earnedBalance
        );

    }


    /*
    Payout Ready
    */

    if(payoutReady) {

        payoutReady.textContent =
            data.payoutReady;

    }


    /*
    Trade Today
    */

    if(tradeToday) {

        tradeToday.textContent =
            data.tradeToday;

    }


    /*
    Attention
    */

    if(riskCount) {

        riskCount.textContent =
            data.attention;

    }



    /*
    Gesamtstatus
    */

    if(overallStatus) {

        /*
        Keine Auswahl
        */

        if(
            data.accountCount === 0
        ) {

            overallStatus.textContent =
                "● NO SELECTION";

            overallStatus.className =
                "portfolio-status";

            return;

        }


        /*
        Mindestens ein roter Account
        */

        if(
            data.redCount > 0
        ) {

            overallStatus.textContent =
                "● RISK";

            overallStatus.className =
                "portfolio-status portfolio-status-red";

            return;

        }


        /*
        Gelber Account
        */

        if(
            data.yellowCount > 0
        ) {

            overallStatus.textContent =
                "● ATTENTION";

            overallStatus.className =
                "portfolio-status portfolio-status-yellow";

            return;

        }


        /*
        Alle grün
        */

        overallStatus.textContent =
            "● READY";

        overallStatus.className =
            "portfolio-status portfolio-status-green";

    }

}



/*
=========================================
EINZELACCOUNT
=========================================
*/

function renderSingleAccount(account) {

    const balance =
        Number(
            account.balance
        ) || 0;


    const startingBalance =
        Number(
            account.startingBalance
        ) || 0;


    const engineAccount = {

        ...account,

        buffer:
            balance -
            startingBalance,

        nextPayoutAmount:
            account.nextPayoutAmount ||
            0

    };


    /*
    Account Analyse
    */

    const result =
        analyzeAccount(
            engineAccount
        );



    /*
    Score
    */

    const score =
        document.getElementById(
            "score"
        );


    if(score) {

        score.textContent =
            result.score +
            " / 100";

    }



    /*
    Recommendation
    */

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    if(recommendation) {

        recommendation.textContent =
            result.recommendation;

    }



    /*
    Reasons
    */

    const reasons =
        document.getElementById(
            "reasons"
        );


    if(reasons) {

        reasons.innerHTML =
            "";


        if(
            Array.isArray(
                result.reasons
            )
        ) {

            result.reasons.forEach(
                reason => {

                    const item =
                        document.createElement(
                            "p"
                        );


                    item.textContent =
                        "• " + reason;


                    reasons.appendChild(
                        item
                    );

                }
            );

        }

    }



    /*
    Risk Factors
    */

    const riskFactors =
        document.getElementById(
            "riskFactors"
        );


    if(
        riskFactors &&
        result.risk
    ) {

        riskFactors.innerHTML = `

            <p>
                Account Risk:
                ${result.risk.accountRisk}/100
            </p>

            <p>
                Market Risk:
                ${result.risk.marketRisk}/100
            </p>

            <p>
                Performance Risk:
                ${result.risk.performanceRisk}/100
            </p>

            <p>
                Discipline Risk:
                ${result.risk.disciplineRisk}/100
            </p>

        `;

    }



    /*
    Provider Regeln
    */

    const providerRules =
        getProviderRules(
            account
        );


    const payoutBox =
        document.getElementById(
            "payout"
        );


    const dailyPlanBox =
        document.getElementById(
            "dailyPlan"
        );


    if(!providerRules) {

        if(payoutBox) {

            payoutBox.innerHTML =
                "Keine Payout-Regeln hinterlegt.";

        }


        if(dailyPlanBox) {

            dailyPlanBox.innerHTML =
                "Kein Daily Plan verfügbar.";

        }


        return;

    }



    /*
    Payout
    */

    const payout =
        analyzePayout(
            engineAccount,
            providerRules
        );



    /*
    Daily Plan
    */

    const dailyPlan =
        createDailyPlan(
            engineAccount,
            payout
        );



    /*
    Readiness 2.0
    */

    if(
        typeof buildReadinessDecision ===
            "function" &&
        typeof renderReadinessDecision ===
            "function"
    ) {

        const readinessDecision =
            buildReadinessDecision(
                engineAccount,
                result,
                payout,
                dailyPlan,
                providerRules
            );


        renderReadinessDecision(
            readinessDecision
        );

    }



    /*
    Payout Card
    */

    if(payoutBox) {

        payoutBox.innerHTML = `

            <p>

                Account:

                <strong>
                    ${account.accountName}
                </strong>

            </p>


            <p>

                Payout Status:

                <strong>
                    ${payout.status}
                </strong>

            </p>


            <p>

                ${payout.message || ""}

            </p>


            <p>

                AI Empfehlung:

                <br>

                ${payout.action || ""}

            </p>

        `;

    }



    /*
    Daily Plan Card
    */

    if(dailyPlanBox) {

        const advice =
            Array.isArray(
                dailyPlan.advice
            )
                ? dailyPlan.advice
                : [];


        dailyPlanBox.innerHTML = `

            <p>

                Risk Mode:

                <strong>
                    ${dailyPlan.mode}
                </strong>

            </p>


            <p>

                Tagesziel:

                ${dailyPlan.target}

            </p>


            <p>

                Max Loss:

                ${dailyPlan.maxLoss}

            </p>


            <p>

                AI Hinweise:

            </p>


            ${advice
                .map(
                    item =>
                        "✓ " + item
                )
                .join("<br>")}

        `;

    }

}



/*
=========================================
MEHRERE ACCOUNTS
=========================================
*/

function renderMultipleAccounts(
    selectedAccounts
) {

    const totalBalance =
        selectedAccounts.reduce(
            (sum, account) => {

                const balance =
                    Number(
                        account.balance
                    );


                return (
                    sum +
                    (
                        Number.isFinite(
                            balance
                        )
                            ? balance
                            : 0
                    )
                );

            },
            0
        );


    const totalStartingBalance =
        selectedAccounts.reduce(
            (sum, account) => {

                const start =
                    Number(
                        account.startingBalance
                    );


                return (
                    sum +
                    (
                        Number.isFinite(
                            start
                        )
                            ? start
                            : 0
                    )
                );

            },
            0
        );


    const totalProfit =
        totalBalance -
        totalStartingBalance;


    const totalTrades =
        selectedAccounts.reduce(
            (sum, account) => {

                const tradeCount =
                    Array.isArray(
                        account.trades
                    )
                        ? account.trades.length
                        : 0;


                return (
                    sum +
                    tradeCount
                );

            },
            0
        );



    /*
    Score
    */

    const score =
        document.getElementById(
            "score"
        );


    if(score) {

        score.textContent =
            selectedAccounts.length +
            " Accounts";

    }



    /*
    Recommendation
    */

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    if(recommendation) {

        recommendation.textContent =
            "Portfolio Ansicht";

    }



    /*
    Portfolio Details
    */

    const reasons =
        document.getElementById(
            "reasons"
        );


    if(reasons) {

        reasons.innerHTML = `

            <p>

                Gesamtbalance:

                <strong>

                    ${formatPortfolioMoney(
                        totalBalance
                    )}

                </strong>

            </p>


            <p>

                Gesamt P&L:

                <strong>

                    ${
                        totalProfit >= 0
                            ? "+"
                            : ""
                    }

                    ${formatPortfolioMoney(
                        totalProfit
                    )}

                </strong>

            </p>


            <p>

                Gesamt Trades:

                <strong>
                    ${totalTrades}
                </strong>

            </p>

        `;

    }



    /*
    Risk Box
    */

    const riskFactors =
        document.getElementById(
            "riskFactors"
        );


    if(riskFactors) {

        riskFactors.innerHTML =
            "<p>Portfolio-Analyse aktiv.</p>";

    }



    /*
    Payout
    */

    const payoutBox =
        document.getElementById(
            "payout"
        );


    if(payoutBox) {

        payoutBox.innerHTML =

            selectedAccounts.length +

            " Accounts ausgewählt.";

    }



    /*
    Daily Plan
    */

    const dailyPlanBox =
        document.getElementById(
            "dailyPlan"
        );


    if(dailyPlanBox) {

        dailyPlanBox.innerHTML =
            "Portfolio Daily Plan folgt.";

    }

}

function calculateAccountNetPnL(account) {

    const trades =
        Array.isArray(account.trades)
            ? account.trades
            : [];


    let grossPnL = 0;
    let fees = 0;


    trades.forEach(trade => {

        const pnl =
            typeof parseMoney === "function"
                ? parseMoney(
                    trade.pnl ??
                    trade.PnL ??
                    0
                )
                : 0;


        grossPnL += pnl;


        /*
        LUCID
        Performance CSV:
        pnl = Gross P&L
        Gebühren = $1 pro Kontrakt
        */

        if(
            String(account.provider)
                .toLowerCase() === "lucid"
        ) {

            const qty =
                Number(
                    trade.qty || 0
                );


            if(Number.isFinite(qty)) {

                fees += qty * 1.00;

            }

        }


        /*
        TOPSTEP / TRADOVATE
        später separat sauber behandeln
        */

    });


    return {

        grossPnL,

        fees,

        netPnL:
            grossPnL - fees

    };

}
