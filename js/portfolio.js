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
