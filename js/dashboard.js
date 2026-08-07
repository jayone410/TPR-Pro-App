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

function renderAdvancedAnalytics(
    selectedAccounts
) {

    const box =
        document.getElementById(
            "advancedAnalytics"
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


    const rawTrades =
        selectedAccounts.flatMap(
            account =>
                Array.isArray(account.trades)
                    ? account.trades
                    : []
        );


    if(rawTrades.length === 0) {

        box.innerHTML =
            "Noch keine Trades importiert.";

        return;
    }


    const analytics =
        calculateAdvancedAnalytics(
            rawTrades
        );


    const bestHour =
        analytics.bestHour;

    const worstHour =
        analytics.worstHour;


    const bestHourText =
        bestHour
            ? `${bestHour[0]}:00 · ${formatMoney(
                bestHour[1].pnl
              )}`
            : "--";


    const worstHourText =
        worstHour
            ? `${worstHour[0]}:00 · ${formatMoney(
                worstHour[1].pnl
              )}`
            : "--";


    box.innerHTML = `

        <div class="stats-grid">

            <div class="stat-item">

                <span>
                    Max Drawdown
                </span>

                <strong>
                    ${formatMoney(
                        analytics.maxDrawdown
                    )}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Beste Stunde
                </span>

                <strong>
                    ${bestHourText}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Schlechteste Stunde
                </span>

                <strong>
                    ${worstHourText}
                </strong>

            </div>


            <div class="stat-item">

                <span>
                    Long P&L
                </span>

                <strong>
                    ${formatMoney(
                        analytics.longStats.pnl
                    )}
                </strong>

                <small>
                    ${analytics.longStats.trades}
                    Trades ·
                    ${formatNumber(
                        analytics.longStats.winRate,
                        1
                    )}% WR
                </small>

            </div>


            <div class="stat-item">

                <span>
                    Short P&L
                </span>

                <strong>
                    ${formatMoney(
                        analytics.shortStats.pnl
                    )}
                </strong>

                <small>
                    ${analytics.shortStats.trades}
                    Trades ·
                    ${formatNumber(
                        analytics.shortStats.winRate,
                        1
                    )}% WR
                </small>

            </div>

        </div>


        <br>


        <div class="analytics-insight">

            <strong>
                Erste Erkenntnis:
            </strong>

            <br><br>

            ${
                analytics.longStats.pnl >
                analytics.shortStats.pnl

                    ? "Long-Trades performen aktuell besser als Short-Trades."

                    : "Short-Trades performen aktuell besser als Long-Trades."
            }

        </div>

    `;

}

function renderReadinessDecision(
    decision
) {

    const status =
        document.getElementById(
            "readinessStatus"
        );

    const score =
        document.getElementById(
            "score"
        );

    const recommendation =
        document.getElementById(
            "recommendation"
        );

    const buffer =
        document.getElementById(
            "readinessBuffer"
        );

    const bufferDetail =
        document.getElementById(
            "readinessBufferDetail"
        );

    const payout =
        document.getElementById(
            "readinessPayout"
        );

    const payoutDetail =
        document.getElementById(
            "readinessPayoutDetail"
        );

    const goal =
        document.getElementById(
            "readinessGoal"
        );

    const stop =
        document.getElementById(
            "readinessStop"
        );

    const ai =
        document.getElementById(
            "readinessAI"
        );


    if(!status) {
        return;
    }


    status.textContent =
        decision.status;


    status.className =
        "readiness-status " +
        "readiness-" +
        decision.level;


    score.textContent =
        decision.score +
        " / 100";


    recommendation.textContent =
        decision.status;


    buffer.textContent =
        "$" +
        decision.buffer
            .toLocaleString();


    bufferDetail.textContent =
        decision.bufferStatus +
        " · " +
        decision.bufferDetail;


    payout.textContent =
        decision.payoutText;


    payoutDetail.textContent =
        decision.payoutDetail;


    goal.textContent =
        decision.goal;


    stop.textContent =
        decision.stop;


    ai.innerHTML =
        decision.ai
            .map(
                item =>
                    "✓ " + item
            )
            .join("<br>");

}
