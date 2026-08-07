// Dashboard
/*
=========================================
TPR PRO AI
Dashboard Rendering
=========================================
*/


function formatMoney(value) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(value);

}



function formatNumber(value, digits = 1) {

    return Number(value)
        .toFixed(digits);

}



function renderPerformanceAnalytics(
    selectedAccounts
) {

    const box =
        document.getElementById(
            "performanceAnalytics"
        );


    if(!box) {
        return;
    }


    if(
        !selectedAccounts ||
        selectedAccounts.length === 0
    ) {

        box.innerHTML =
            "Keine Accounts ausgewählt.";

        return;
    }


    const trades =
        selectedAccounts.flatMap(
            account =>
                Array.isArray(
                    account.trades
                )
                    ? account.trades
                    : []
        );


    const stats =
        calculateStatistics(
            trades
        );


    const profitFactorText =
        stats.profitFactor === Infinity
            ? "∞"
            : formatNumber(
                stats.profitFactor,
                2
            );


    box.innerHTML = `

        <div class="stats-grid">

            <div class="stat-item">

                <span>
                    Accounts
                </span>

                <strong>
                    ${selectedAccounts.length}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Trades
                </span>

                <strong>
                    ${stats.totalTrades}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Winrate
                </span>

                <strong>
                    ${formatNumber(
                        stats.winRate,
                        1
                    )}%
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Gesamt P&L
                </span>

                <strong>
                    ${formatMoney(
                        stats.totalPnL
                    )}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Profit Factor
                </span>

                <strong>
                    ${profitFactorText}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Avg Winner
                </span>

                <strong>
                    ${formatMoney(
                        stats.averageWinner
                    )}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Avg Loser
                </span>

                <strong>
                    -${formatMoney(
                        stats.averageLoser
                    ).replace("-", "")}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Expectancy
                </span>

                <strong>
                    ${formatMoney(
                        stats.expectancy
                    )}
                </strong>

            </div>

        </div>

    `;

}
