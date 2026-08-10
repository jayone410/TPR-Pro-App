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


    /*
    =====================================
    STATUS
    =====================================
    */

    status.textContent =
        decision.status;


    status.className =
        "readiness-status " +
        "readiness-" +
        decision.level;


    if(score) {

        score.textContent =
            decision.score +
            " / 100";

    }


    /*
    =====================================
    RECOMMENDATION
    =====================================
    */

    if(recommendation) {

        if(
            decision.level ===
            "green"
        ) {

            recommendation.textContent =
                "🟢 TRADE NORMAL";

        }
        else if(
            decision.level ===
            "yellow"
        ) {

            if(
                decision.status ===
                "PROTECT"
            ) {

                recommendation.textContent =
                    "🟡 PROTECT ACCOUNT";

            }
            else {

                recommendation.textContent =
                    "🟡 REDUCE RISK";

            }

        }
        else {

            recommendation.textContent =
                "🔴 DON'T TRADE";

        }

    }


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(
        decision.stage ===
        "evaluation"
    ) {

        const selectedAccounts =
            typeof getSelectedAccounts ===
            "function"

                ? getSelectedAccounts(
                    selectedAccountIds
                )

                : [];


        const account =
            selectedAccounts.length ===
            1

                ? selectedAccounts[0]

                : null;


        const rules =
            account &&
            typeof getEffectiveRules ===
            "function"

                ? getEffectiveRules(
                    account
                )

                : null;


        const profitTarget =
            Number(
                rules?.profitTarget
            );


        const currentProfit =
            Number(
                decision.currentProfit
            );


        const remaining =
            Number.isFinite(
                profitTarget
            ) &&
            Number.isFinite(
                currentProfit
            )

                ? Math.max(
                    0,
                    profitTarget -
                    currentProfit
                )

                : null;


        /*
        Linke Metrik:
        Target Remaining
        */

        if(buffer) {

            buffer.textContent =
                remaining !== null

                    ? formatReadinessMoney(
                        remaining
                    )

                    : "--";

        }


        if(bufferDetail) {

            bufferDetail.textContent =
                remaining !== null

                    ? "bis Profit Target"

                    : "Evaluation aktiv";

        }


        /*
        Rechte Metrik:
        Consistency
        */

        if(payout) {

            if(
                decision.consistency &&
                Number.isFinite(
                    Number(
                        decision.consistency.current
                    )
                )
            ) {

                payout.textContent =
                    Number(
                        decision.consistency.current
                    ).toFixed(1) +
                    "%";

            }
            else {

                payout.textContent =
                    "--";

            }

        }


        if(payoutDetail) {

            if(
                decision.consistency &&
                Number.isFinite(
                    Number(
                        decision.consistency.limit
                    )
                )
            ) {

                payoutDetail.textContent =
                    "Limit " +
                    Number(
                        decision.consistency.limit
                    ).toFixed(1) +
                    "%";

            }
            else {

                payoutDetail.textContent =
                    "Keine Consistency Rule";

            }

        }

    }


    /*
    =====================================
    FUNDED
    =====================================
    */

    else if(
        decision.stage ===
        "funded"
    ) {

        /*
        Linke Metrik:
        Remaining Drawdown
        */

        if(buffer) {

            if(
                decision.drawdown &&
                Number.isFinite(
                    Number(
                        decision.drawdown.remaining
                    )
                )
            ) {

                buffer.textContent =
                    formatReadinessMoney(
                        decision.drawdown.remaining
                    );

            }
            else {

                buffer.textContent =
                    "--";

            }

        }


        if(bufferDetail) {

            if(
                decision.drawdown &&
                Number.isFinite(
                    Number(
                        decision.drawdown.floor
                    )
                )
            ) {

                bufferDetail.textContent =
                    "Floor " +
                    formatReadinessMoney(
                        decision.drawdown.floor
                    );

            }
            else {

                bufferDetail.textContent =
                    "Remaining Drawdown";

            }

        }


        /*
        Rechte Metrik:
        Payout
        */

        if(payout) {

            payout.textContent =
                decision.payoutText ||
                "--";

        }


        if(payoutDetail) {

            payoutDetail.textContent =
                decision.payoutDetail ||
                "--";

        }

    }


    /*
    =====================================
    FALLBACK
    =====================================
    */

    else {

        if(buffer) {
            buffer.textContent = "--";
        }

        if(bufferDetail) {
            bufferDetail.textContent = "--";
        }

        if(payout) {
            payout.textContent = "--";
        }

        if(payoutDetail) {
            payoutDetail.textContent = "--";
        }

    }


    /*
    =====================================
    DAILY PLAN
    =====================================
    */

    if(goal) {

        goal.textContent =
            decision.goal ||
            "--";

    }


    if(stop) {

        stop.textContent =
            decision.stop ||
            "--";

    }


    /*
    =====================================
    AI DECISION
    =====================================
    */

    if(ai) {

        const messages =
            Array.isArray(
                decision.ai
            )
                ? decision.ai
                : [];


        ai.innerHTML =
            messages.length > 0

                ? messages
                    .map(
                        item =>
                            "✓ " + item
                    )
                    .join("<br>")

                : "Keine Hinweise.";

    }

}


/*
=========================================
FORMAT
=========================================
*/

function formatReadinessMoney(
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


    return number.toLocaleString(
        "en-US",
        {
            style:
                "currency",

            currency:
                "USD",

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );

}
