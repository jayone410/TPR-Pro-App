/*
=========================================
TPR PRO AI
Mission Control v1
=========================================

Ziel:
Aus Guidance-Daten eine klare
TODAY'S PRIORITIES / ToDo-Liste bauen.
=========================================
*/


/*
=========================================
MAIN RENDER
=========================================
*/

function renderMissionControl() {

    const container =
        document.getElementById(
            "missionControlPriorities"
        );


    if(!container) {

        return;

    }


    if(
        typeof buildAllAccountGuidance !==
        "function"
    ) {

        container.innerHTML = `
            <div class="mission-empty">
                Guidance Engine nicht verfügbar.
            </div>
        `;

        return;

    }


    const selectedAccounts =
        typeof getSelectedPortfolioAccounts ===
        "function"

            ? getSelectedPortfolioAccounts()

            : (
                Array.isArray(accounts)
                    ? accounts
                    : []
            );


    const sourceAccounts =
        selectedAccounts.length > 0

            ? selectedAccounts

            : (
                Array.isArray(accounts)
                    ? accounts
                    : []
            );


    const guidance =
        buildAllAccountGuidance(
            sourceAccounts
        );


    renderMissionControlSummary(
        guidance
    );


    if(
        guidance.length ===
        0
    ) {

        container.innerHTML = `
            <div class="mission-empty">
                Keine Accounts verfügbar.
            </div>
        `;

        return;

    }


    container.innerHTML =
        guidance
            .map(
                (
                    item,
                    index
                ) =>
                    buildMissionPriorityCard(
                        item,
                        index
                    )
            )
            .join("");

}


/*
=========================================
SUMMARY
=========================================
*/

function renderMissionControlSummary(
    guidance
) {

    const total =
        document.getElementById(
            "missionControlAccountCount"
        );


    const stop =
        document.getElementById(
            "missionControlStopCount"
        );


    const defensive =
        document.getElementById(
            "missionControlDefensiveCount"
        );


    const payout =
        document.getElementById(
            "missionControlPayoutCount"
        );


    if(total) {

        total.textContent =
            guidance.length;

    }


    if(stop) {
    
        stop.textContent =
            guidance.filter(
                item => {
    
                    const action =
                        String(
                            item.todayAction ||
                            ""
                        ).toUpperCase();
    
    
                    const riskMode =
                        String(
                            item.riskMode ||
                            ""
                        ).toUpperCase();
    
    
                    return (
                        action === "STOP TODAY" ||
                        action === "NO TRADING REQUIRED" ||
                        action.startsWith("WAIT FOR") ||
                        riskMode === "PAUSE" ||
                        riskMode === "STOP"
                    );
    
                }
            ).length;
    
    }


    if(defensive) {

        defensive.textContent =
            guidance.filter(
                item =>
                    item.riskMode ===
                    "DEFENSIVE"
            ).length;

    }


    if(payout) {

        payout.textContent =
            guidance.filter(
                item =>
                    item.accountGoal ===
                    "PAYOUT READY"
            ).length;

    }

}


/*
=========================================
PRIORITY CARD
=========================================
*/

function buildMissionPriorityCard(
    item,
    index
) {

    const level =
        getMissionPriorityLevel(
            item
        );


    const icon =
        getMissionPriorityIcon(
            level
        );


    const stageLabel =
        String(
            item.stage ||
            ""
        ).toUpperCase();


    const provider =
        String(
            item.provider ||
            ""
        ).toUpperCase();


    const todayTarget =
        formatMissionSignedMoney(
            item.targetToday
        );


    const todayStop =
        formatMissionNegativeMoney(
            item.maxLossToday
        );


    const remainingDD =
        getMissionMetric(
            item.drawdown,
            "remaining"
        );


    const remainingDLL =
        getMissionMetric(
            item.dll,
            "remaining"
        );


    const consistency =
        getMissionConsistencyText(
            item.consistency
        );


    return `

        <div class="mission-priority-card mission-priority-${level}">

            <div class="mission-priority-rank">
                ${index + 1}
            </div>


            <div class="mission-priority-main">

                <div class="mission-priority-top">

                    <div>

                        <div class="mission-account-name">
                            ${escapeMissionHtml(
                                item.accountName
                            )}
                        </div>

                        <div class="mission-account-meta">
                            ${provider}
                            ${provider && stageLabel ? " · " : ""}
                            ${stageLabel}
                        </div>

                    </div>


                    <div class="mission-today-status mission-today-${level}">
                        ${icon}
                        ${escapeMissionHtml(
                            item.todayAction
                        )}
                    </div>

                </div>


                <div class="mission-goal-row">

                    <span class="mission-label">
                        ACCOUNT GOAL
                    </span>

                    <strong>
                        ${escapeMissionHtml(
                            item.accountGoal
                        )}
                    </strong>

                </div>


                <div class="mission-headline">
                    ${escapeMissionHtml(
                        item.headline
                    )}
                </div>


                <div class="mission-reason">
                    ${escapeMissionHtml(
                        item.todayReason
                    )}
                </div>


                <div class="mission-metrics">

                    ${buildMissionMetricHtml(
                        "Today's Target",
                        todayTarget
                    )}

                    ${buildMissionMetricHtml(
                        "Today's Stop",
                        todayStop
                    )}

                    ${buildMissionMetricHtml(
                        "Remaining DD",
                        remainingDD
                    )}

                    ${buildMissionMetricHtml(
                        "Remaining DLL",
                        remainingDLL
                    )}

                    ${buildMissionMetricHtml(
                        "Consistency",
                        consistency
                    )}

                </div>


                <div class="mission-next-action">

                    <span>
                        NEXT STEP
                    </span>

                    <strong>
                        ${escapeMissionHtml(
                            item.nextAction
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;

}


/*
=========================================
PRIORITY LEVEL
=========================================
*/

function getMissionPriorityLevel(
    item
) {

    if(
        item.todayPriority ===
        "critical"
    ) {

        return "critical";

    }


    if(
        item.accountGoalPriority ===
        "critical"
    ) {

        return "critical";

    }


    if(
        item.todayPriority ===
        "high" ||
        item.accountGoalPriority ===
        "high"
    ) {

        return "high";

    }


    if(
        item.accountGoalPriority ===
        "complete"
    ) {

        return "complete";

    }


    return "normal";

}


/*
=========================================
ICON
=========================================
*/

function getMissionPriorityIcon(
    level
) {

    if(
        level ===
        "critical"
    ) {

        return "🔴";

    }


    if(
        level ===
        "high"
    ) {

        return "🟠";

    }


    if(
        level ===
        "complete"
    ) {

        return "🟢";

    }


    return "🟡";

}


/*
=========================================
METRIC HTML
=========================================
*/

function buildMissionMetricHtml(
    label,
    value
) {

    return `
        <div class="mission-metric">

            <span>
                ${escapeMissionHtml(
                    label
                )}
            </span>

            <strong>
                ${escapeMissionHtml(
                    value
                )}
            </strong>

        </div>
    `;

}


/*
=========================================
METRIC VALUES
=========================================
*/

function getMissionMetric(
    object,
    key
) {

    if(!object) {

        return "--";

    }


    const value =
        Number(
            object[key]
        );


    if(
        !Number.isFinite(
            value
        )
    ) {

        return "--";

    }


    /*
    Bei nicht vorhandenem DLL
    lieber "--" als "$0.00".
    */

    if(
        key === "remaining" &&
        Number(
            object.limit
        ) <= 0
    ) {

        return "--";

    }


    return formatMissionMoney(
        value
    );

}


function getMissionConsistencyText(
    consistency
) {

    if(!consistency) {

        return "--";

    }


    const current =
        Number(
            consistency.current
        );


    const limit =
        Number(
            consistency.limit
        );


    if(
        !Number.isFinite(
            current
        ) ||
        !Number.isFinite(
            limit
        )
    ) {

        return "--";

    }


    return (
        current.toFixed(
            1
        ) +
        "% / " +
        limit.toFixed(
            1
        ) +
        "%"
    );

}


/*
=========================================
MONEY
=========================================
*/

function formatMissionMoney(
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


function formatMissionSignedMoney(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        ) ||
        number === 0
    ) {

        return "$0.00";

    }


    return (
        number > 0
            ? "+"
            : "-"
    ) +
    formatMissionMoney(
        Math.abs(
            number
        )
    );

}


function formatMissionNegativeMoney(
    value
) {

    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(
            number
        ) ||
        number <= 0
    ) {

        return "$0.00";

    }


    return "-" +
        formatMissionMoney(
            number
        );

}


/*
=========================================
HTML ESCAPE
=========================================
*/

function escapeMissionHtml(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
