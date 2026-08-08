function renderPortfolio() {

    const selectedAccounts =
        getSelectedAccounts(
            selectedAccountIds
        );

        renderPerformanceAnalytics(
            selectedAccounts
        );
    
        renderAdvancedAnalytics(
            selectedAccounts
        );

        renderEquityChart(
            selectedAccounts
        );

        renderDrawdownChart(
            selectedAccounts
        );
    
        renderHourlyChart(
            selectedAccounts
        );
    
    if(selectedAccounts.length === 0) {

        document.getElementById(
            "score"
        ).textContent = "--";

        document.getElementById(
            "recommendation"
        ).textContent =
            "Keine Accounts ausgewählt.";

        document.getElementById(
            "reasons"
        ).innerHTML = "";

        document.getElementById(
            "riskFactors"
        ).innerHTML = "";

        document.getElementById(
            "payout"
        ).innerHTML =
            "Account auswählen.";

        document.getElementById(
            "dailyPlan"
        ).innerHTML =
            "Account auswählen.";

        return;
    }


    if(selectedAccounts.length === 1) {

        renderSingleAccount(
            selectedAccounts[0]
        );

        return;
    }


    renderMultipleAccounts(
        selectedAccounts
    );
}

/*
=========================================
MISSION CONTROL / PORTFOLIO OVERVIEW
=========================================
*/

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


function getMissionControlStatus(account) {

    if(
        typeof getAccountStatus ===
        "function"
    ) {

        return getAccountStatus(account);

    }


    return {
        level: "yellow",
        icon: "🟡",
        text: "CHECK"
    };

}


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


    return getAccountPayoutInfo(account);

}


function calculatePortfolioOverview() {

    const accountList =
        Array.isArray(accounts)
            ? accounts
            : [];


    let totalBalance = 0;

    let payoutReady = 0;

    let tradeToday = 0;

    let attention = 0;


    accountList.forEach(account => {

        totalBalance +=
            Number(account.balance || 0);


        const payout =
            getMissionControlPayout(account);


        const payoutStatus =
            String(
                payout.status || ""
            ).toUpperCase();


        if(
            payoutStatus.includes("READY") ||
            payoutStatus.includes("ELIGIBLE")
        ) {

            payoutReady++;

        }


        const status =
            getMissionControlStatus(account);


        if(status.level === "green") {

            tradeToday++;

        }


        if(
            status.level === "red" ||
            status.level === "yellow"
        ) {

            attention++;

        }

    });


    return {

        accountCount:
            accountList.length,

        totalBalance,

        payoutReady,

        tradeToday,

        attention

    };

}


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


    if(accountCount) {

        accountCount.textContent =
            data.accountCount;

    }


    if(balance) {

        balance.textContent =
            formatPortfolioMoney(
                data.totalBalance
            );

    }


    if(payoutReady) {

        payoutReady.textContent =
            data.payoutReady;

    }


    if(tradeToday) {

        tradeToday.textContent =
            data.tradeToday;

    }


    if(riskCount) {

        riskCount.textContent =
            data.attention;

    }


    if(overallStatus) {

        if(data.attention > 0) {

            overallStatus.textContent =
                "● ATTENTION";

            overallStatus.className =
                "portfolio-status portfolio-status-yellow";

        }
        else {

            overallStatus.textContent =
                "● READY";

            overallStatus.className =
                "portfolio-status portfolio-status-green";

        }

    }

}

function renderSingleAccount(account) {

    const engineAccount = {

        ...account,

        buffer:
            Number(account.balance) -
            Number(account.startingBalance),

        nextPayoutAmount:
            account.nextPayoutAmount || 0
    };


    const result =
        analyzeAccount(
            engineAccount
        );


    document.getElementById(
        "score"
    ).textContent =
        result.score + " / 100";


    document.getElementById(
        "recommendation"
    ).textContent =
        result.recommendation;


    const reasons =
        document.getElementById(
            "reasons"
        );


    reasons.innerHTML = "";


    result.reasons.forEach(
        reason => {

            const item =
                document.createElement("p");

            item.textContent =
                "• " + reason;

            reasons.appendChild(item);
        }
    );


    document.getElementById(
        "riskFactors"
    ).innerHTML = `

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


    const providerRules =
        PROP_RULES[
            account.provider
        ]?.accounts[
            account.accountType
        ];


    if(!providerRules) {

        document.getElementById(
            "payout"
        ).innerHTML =
            "Keine Payout-Regeln hinterlegt.";

        document.getElementById(
            "dailyPlan"
        ).innerHTML =
            "Kein Daily Plan verfügbar.";

        return;
    }


    const payout =
        analyzePayout(
            engineAccount,
            providerRules
        );


    const dailyPlan =
        createDailyPlan(
            engineAccount,
            payout
        );

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

    document.getElementById(
        "payout"
    ).innerHTML = `

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
            ${payout.message}
        </p>

        <p>
            AI Empfehlung:
            <br>
            ${payout.action}
        </p>
    `;


    document.getElementById(
        "dailyPlan"
    ).innerHTML = `

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

        ${dailyPlan.advice
            .map(
                item =>
                    "✓ " + item
            )
            .join("<br>")}
    `;
}


function renderMultipleAccounts(
    selectedAccounts
) {

    const totalBalance =
        selectedAccounts.reduce(
            (sum, account) =>
                sum +
                Number(account.balance),
            0
        );


    const totalStartingBalance =
        selectedAccounts.reduce(
            (sum, account) =>
                sum +
                Number(
                    account.startingBalance
                ),
            0
        );


    const totalProfit =
        totalBalance -
        totalStartingBalance;


    const totalTrades =
        selectedAccounts.reduce(
            (sum, account) =>
                sum +
                (
                    Array.isArray(
                        account.trades
                    )
                        ? account.trades.length
                        : 0
                ),
            0
        );


    document.getElementById(
        "score"
    ).textContent =
        selectedAccounts.length +
        " Accounts";


    document.getElementById(
        "recommendation"
    ).textContent =
        "Portfolio Ansicht";


    document.getElementById(
        "reasons"
    ).innerHTML = `

        <p>
            Gesamtbalance:
            <strong>
                $${totalBalance
                    .toLocaleString()}
            </strong>
        </p>

        <p>
            Gesamt P&L:
            <strong>
                ${totalProfit >= 0 ? "+" : ""}
                $${totalProfit
                    .toLocaleString()}
            </strong>
        </p>

        <p>
            Gesamt Trades:
            <strong>
                ${totalTrades}
            </strong>
        </p>
    `;


    document.getElementById(
        "riskFactors"
    ).innerHTML =
        "<p>Portfolio-Analyse aktiv.</p>";


    document.getElementById(
        "payout"
    ).innerHTML =
        selectedAccounts.length +
        " Accounts ausgewählt.";


    document.getElementById(
        "dailyPlan"
    ).innerHTML =
        "Portfolio Daily Plan folgt.";
}
