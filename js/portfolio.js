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
    Payout / Evaluation Intelligence
    */

    renderPayoutIntelligence(
        account,
        payout,
        providerRules
    );


    /*
    Daily Trading Plan
    */

    renderDailyTradingPlan(
        account,
        dailyPlan,
        payout,
        providerRules
    );

}


/*
=========================================
PAYOUT / EVALUATION INTELLIGENCE UI
=========================================
*/

function renderPayoutIntelligence(
    account,
    payout,
    rules
) {

    const box =
        document.getElementById(
            "payout"
        );

    if(!box) {
        return;
    }


    const stage =
        String(
            account.stage ||
            rules?.stage ||
            ""
        ).toLowerCase();


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(stage === "evaluation") {

        const currentProfit =
            typeof getAccountCurrentProfit ===
            "function"
                ? Number(
                    getAccountCurrentProfit(
                        account
                    )
                )
                : (
                    Number(account.balance) -
                    Number(account.startingBalance)
                );


        const profitTarget =
            Number(
                rules?.profitTarget
            );


        const targetRemaining =
            Number.isFinite(
                profitTarget
            )
                ? Math.max(
                    0,
                    profitTarget -
                    currentProfit
                )
                : null;


        const progress =
            Number.isFinite(
                profitTarget
            ) &&
            profitTarget > 0
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            currentProfit /
                            profitTarget
                        ) * 100
                    )
                )
                : null;


        const consistency =
            typeof getAccountConsistencyInfo ===
            "function"
                ? getAccountConsistencyInfo(
                    account
                )
                : null;


        const drawdown =
            typeof getAccountDrawdownInfo ===
            "function"
                ? getAccountDrawdownInfo(
                    account
                )
                : null;


        const dll =
            typeof getAccountDLLInfo ===
            "function"
                ? getAccountDLLInfo(
                    account
                )
                : null;


        box.innerHTML = `

            <div class="payout-intelligence-header">

                <div>
                    <small>
                        EVALUATION PROGRESS
                    </small>

                    <strong>
                        ${account.accountName}
                    </strong>
                </div>

                <span>
                    ${payout?.status || "EVAL"}
                </span>

            </div>

            <div class="payout-intelligence-grid">

                ${buildPortfolioMetric(
                    "Current Profit",
                    formatPortfolioSignedMoney(
                        currentProfit
                    )
                )}

                ${buildPortfolioMetric(
                    "Profit Target",
                    Number.isFinite(
                        profitTarget
                    )
                        ? formatPortfolioMoney(
                            profitTarget
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Target Remaining",
                    targetRemaining !== null
                        ? formatPortfolioMoney(
                            targetRemaining
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Progress",
                    progress !== null
                        ? progress.toFixed(1) +
                            "%"
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Consistency",
                    consistency
                        ? (
                            Number(
                                consistency.current
                            ).toFixed(1) +
                            "% / " +
                            Number(
                                consistency.limit
                            ).toFixed(1) +
                            "%"
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Remaining DD",
                    drawdown &&
                    Number.isFinite(
                        Number(
                            drawdown.remaining
                        )
                    )
                        ? formatPortfolioMoney(
                            drawdown.remaining
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "DLL Left",
                    dll &&
                    Number.isFinite(
                        Number(
                            dll.remaining
                        )
                    )
                        ? formatPortfolioMoney(
                            dll.remaining
                        )
                        : "--"
                )}

            </div>

            <div class="payout-intelligence-action">

                <strong>
                    ${payout?.message || "Evaluation aktiv."}
                </strong>

                <div>
                    ${payout?.action || ""}
                </div>

            </div>
        `;


        return;

    }



    /*
    =====================================
    FUNDED
    =====================================
    */

    if(stage === "funded") {

        const payoutData =
            typeof getAccountPayoutAvailability ===
            "function"
                ? getAccountPayoutAvailability(
                    account
                )
                : null;


        const tradingDays =
            typeof getAccountTradingDayRequirement ===
            "function"
                ? getAccountTradingDayRequirement(
                    account
                )
                : null;


        const winningDays =
            typeof getAccountWinningDaysInfo ===
            "function"
                ? getAccountWinningDaysInfo(
                    account
                )
                : null;


        const consistency =
            typeof getAccountConsistencyInfo ===
            "function"
                ? getAccountConsistencyInfo(
                    account
                )
                : null;


        const drawdown =
            typeof getAccountDrawdownInfo ===
            "function"
                ? getAccountDrawdownInfo(
                    account
                )
                : null;


        const dll =
            typeof getAccountDLLInfo ===
            "function"
                ? getAccountDLLInfo(
                    account
                )
                : null;


        let dayMetric =
            "--";

        let dayLabel =
            "Qualifying Days";


        if(tradingDays) {

            dayMetric =
                tradingDays.current +
                " / " +
                tradingDays.required;

            dayLabel =
                "Trading Days";

        }
        else if(winningDays) {

            dayMetric =
                winningDays.current +
                " / " +
                winningDays.required;

            dayLabel =
                "Winning Days";

        }


        box.innerHTML = `

            <div class="payout-intelligence-header">

                <div>
                    <small>
                        PAYOUT INTELLIGENCE
                    </small>

                    <strong>
                        ${account.accountName}
                    </strong>
                </div>

                <span>
                    ${payout?.status || "--"}
                </span>

            </div>

            <div class="payout-intelligence-grid">

                ${buildPortfolioMetric(
                    dayLabel,
                    dayMetric
                )}

                ${buildPortfolioMetric(
                    "Consistency",
                    consistency
                        ? (
                            Number(
                                consistency.current
                            ).toFixed(1) +
                            "% / " +
                            Number(
                                consistency.limit
                            ).toFixed(1) +
                            "%"
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Potential Payout",
                    payoutData
                        ? formatPortfolioMoney(
                            payoutData.potentialAvailable
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Payout Available",
                    payoutData
                        ? formatPortfolioMoney(
                            payoutData.available
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Still Needed",
                    payoutData
                        ? formatPortfolioMoney(
                            payoutData.stillNeeded
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "Remaining DD",
                    drawdown &&
                    Number.isFinite(
                        Number(
                            drawdown.remaining
                        )
                    )
                        ? formatPortfolioMoney(
                            drawdown.remaining
                        )
                        : "--"
                )}

                ${buildPortfolioMetric(
                    "DLL Left",
                    dll &&
                    Number.isFinite(
                        Number(
                            dll.remaining
                        )
                    )
                        ? formatPortfolioMoney(
                            dll.remaining
                        )
                        : "--"
                )}

            </div>

            <div class="payout-intelligence-action">

                <strong>
                    ${payout?.message || "Payout-Status prüfen."}
                </strong>

                <div>
                    ${payout?.action || ""}
                </div>

            </div>
        `;


        return;

    }


    box.innerHTML =
        "Account Stage prüfen.";

}


/*
=========================================
DAILY TRADING PLAN UI
=========================================
*/

function renderDailyTradingPlan(
    account,
    dailyPlan,
    payout,
    rules
) {

    const box =
        document.getElementById(
            "dailyPlan"
        );


    if(!box) {
        return;
    }


    const stage =
        String(
            account.stage ||
            rules?.stage ||
            ""
        ).toLowerCase();


    const advice =
        Array.isArray(
            dailyPlan?.advice
        )
            ? dailyPlan.advice
            : [];


    const drawdown =
        typeof getAccountDrawdownInfo ===
        "function"
            ? getAccountDrawdownInfo(
                account
            )
            : null;


    const dll =
        typeof getAccountDLLInfo ===
        "function"
            ? getAccountDLLInfo(
                account
            )
            : null;


    box.innerHTML = `

        <div class="daily-plan-header">

            <div>
                <small>
                    ${
                        stage === "evaluation"
                            ? "EVALUATION PLAN"
                            : "FUNDED PLAN"
                    }
                </small>

                <strong>
                    ${account.accountName}
                </strong>
            </div>

            <span>
                ${dailyPlan?.mode || "--"}
            </span>

        </div>

        <div class="daily-plan-grid">

            ${buildPortfolioMetric(
                "Today's Goal",
                dailyPlan?.target || "--"
            )}

            ${buildPortfolioMetric(
                "Today's Stop",
                dailyPlan?.maxLoss || "--"
            )}

            ${buildPortfolioMetric(
                "Remaining DD",
                drawdown &&
                Number.isFinite(
                    Number(
                        drawdown.remaining
                    )
                )
                    ? formatPortfolioMoney(
                        drawdown.remaining
                    )
                    : "--"
            )}

            ${buildPortfolioMetric(
                "DLL Left",
                dll &&
                Number.isFinite(
                    Number(
                        dll.remaining
                    )
                )
                    ? formatPortfolioMoney(
                        dll.remaining
                    )
                    : "--"
            )}

            ${buildPortfolioMetric(
                stage === "evaluation"
                    ? "Eval Status"
                    : "Payout Status",
                payout?.status || "--"
            )}

        </div>

        <div class="daily-plan-advice">

            ${
                advice.length > 0
                    ? advice
                        .map(
                            item =>
                                "✓ " + item
                        )
                        .join("<br>")
                    : "Keine Hinweise."
            }

        </div>
    `;

}


/*
=========================================
UI HELPERS
=========================================
*/

function buildPortfolioMetric(
    label,
    value
) {

    return `
        <div class="portfolio-info-metric">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;

}


function formatPortfolioSignedMoney(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        )
    ) {

        return "--";

    }


    const formatted =
        formatPortfolioMoney(
            Math.abs(
                number
            )
        );


    if(number > 0) {

        return "+" + formatted;

    }


    if(number < 0) {

        return "-" + formatted;

    }


    return formatted;

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


/*
=========================================
ACCOUNT NET P&L
=========================================
*/

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


            if(
                Number.isFinite(qty)
            ) {

                fees +=
                    qty * 1.00;

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
