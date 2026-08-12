/*
=========================================
TPR PRO AI
PORTFOLIO RISK ENGINE v1
=========================================

Aufgabe:

- Account Guidance aggregieren
- Portfolio Drawdown analysieren
- handelbare Accounts zählen
- Risiko-Konzentration erkennen
- maximale Anzahl Accounts empfehlen
- Portfolio Daily Stop bestimmen
- schwächsten Account identifizieren

WICHTIG:

Diese Engine verändert KEINE Accounts.

Sie analysiert ausschließlich den
aktuellen Portfolio-Zustand.

=========================================
*/


function analyzePortfolioRisk() {

    /*
    =====================================
    ACCOUNTS
    =====================================
    */

    const source =
        Array.isArray(accounts)
            ? accounts
            : [];


    if(
        source.length === 0
    ) {

        return buildEmptyPortfolioRisk();

    }


    /*
    =====================================
    GUIDANCE
    =====================================
    */

    const guidance =
        typeof buildAllAccountGuidance ===
        "function"

            ? buildAllAccountGuidance()

            : [];


    /*
    =====================================
    BASIC COUNTS
    =====================================
    */

    const totalAccounts =
        source.length;


    const fundedAccounts =
        source.filter(
            account =>
                String(
                    account.stage || ""
                ).toLowerCase() ===
                "funded"
        ).length;


    const evaluationAccounts =
        totalAccounts -
        fundedAccounts;


    /*
    =====================================
    TRADABLE ACCOUNTS
    =====================================
    */

    const tradableGuidance =
        guidance.filter(
            item =>
                isPortfolioGuidanceTradable(
                    item
                )
        );


    const tradableAccounts =
        tradableGuidance.length;


    const pausedAccounts =
        Math.max(
            0,
            totalAccounts -
            tradableAccounts
        );


    /*
    =====================================
    DRAWDOWN
    =====================================
    */

    const remainingDDValues =
        guidance
            .map(
                item =>
                    portfolioFiniteNumber(
                        item.remainingDD
                    )
            )
            .filter(
                value =>
                    value !== null
            );


    const totalRemainingDD =
        remainingDDValues.reduce(
            (sum, value) =>
                sum +
                Math.max(
                    0,
                    value
                ),
            0
        );


    const minimumRemainingDD =
        remainingDDValues.length

            ? Math.min(
                ...remainingDDValues
            )

            : 0;


    /*
    =====================================
    TODAY MAX LOSS
    =====================================
    */

    const dailyStops =
        tradableGuidance
            .map(
                item =>
                    portfolioFiniteNumber(
                        item.maxLossToday
                    )
            )
            .filter(
                value =>
                    value !== null &&
                    value > 0
            );


    const combinedAccountStops =
        dailyStops.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    /*
    =====================================
    WEAKEST ACCOUNT
    =====================================
    */

    const weakestGuidance =
        findWeakestPortfolioAccount(
            guidance
        );


    /*
    =====================================
    CONCENTRATION

    Aktuell konservative Annahme:

    Werden mehrere Accounts gleichzeitig
    gehandelt, behandeln wir sie als stark
    korreliert.

    Später erweitern wir dies um echte
    Symbol-/Instrument-Exposure.
    =====================================
    */

    const concentration =
        calculatePortfolioConcentration(
            tradableAccounts
        );


    /*
    =====================================
    BASE SCORE
    =====================================
    */

    let score =
        0;


    /*
    -------------------------------------
    ACCOUNT COUNT
    -------------------------------------
    */

    if(
        tradableAccounts >= 4
    ) {

        score +=
            30;

    }
    else if(
        tradableAccounts === 3
    ) {

        score +=
            22;

    }
    else if(
        tradableAccounts === 2
    ) {

        score +=
            12;

    }


    /*
    -------------------------------------
    CONCENTRATION
    -------------------------------------
    */

    if(
        concentration.level ===
        "EXTREME"
    ) {

        score +=
            30;

    }
    else if(
        concentration.level ===
        "HIGH"
    ) {

        score +=
            22;

    }
    else if(
        concentration.level ===
        "MEDIUM"
    ) {

        score +=
            12;

    }


    /*
    -------------------------------------
    WEAKEST ACCOUNT DD
    -------------------------------------
    */

    if(
        minimumRemainingDD > 0 &&
        minimumRemainingDD <= 500
    ) {

        score +=
            30;

    }
    else if(
        minimumRemainingDD <= 750 &&
        minimumRemainingDD > 0
    ) {

        score +=
            22;

    }
    else if(
        minimumRemainingDD <= 1200 &&
        minimumRemainingDD > 0
    ) {

        score +=
            12;

    }


    /*
    -------------------------------------
    MARKET RISK
    -------------------------------------
    */

    const market =
        typeof analyzeTodayMarketRisk ===
        "function"

            ? analyzeTodayMarketRisk()

            : null;


    const marketLevel =
        String(
            market?.level ||
            "LOW"
        ).toUpperCase();


    if(
        marketLevel ===
        "EXTREME"
    ) {

        score +=
            25;

    }
    else if(
        marketLevel ===
        "HIGH"
    ) {

        score +=
            15;

    }
    else if(
        marketLevel ===
        "MEDIUM"
    ) {

        score +=
            7;

    }


    /*
    =====================================
    SCORE CAP
    =====================================
    */

    score =
        Math.min(
            100,
            Math.max(
                0,
                score
            )
        );


    /*
    =====================================
    LEVEL
    =====================================
    */

    const level =
        getPortfolioRiskLevel(
            score
        );


    /*
    =====================================
    MAX ACCOUNTS
    =====================================
    */

    const recommendedMaxAccounts =
        getRecommendedPortfolioAccounts(
            level,
            marketLevel,
            tradableAccounts
        );


    /*
    =====================================
    PORTFOLIO STOP
    =====================================
    */

    const recommendedPortfolioStop =
        calculateRecommendedPortfolioStop(
            tradableGuidance,
            recommendedMaxAccounts,
            level
        );


    /*
    =====================================
    STATUS
    =====================================
    */

    const status =
        getPortfolioRiskStatus(
            level,
            tradableAccounts
        );


    /*
    =====================================
    REASON
    =====================================
    */

    const reason =
        buildPortfolioRiskReason({

            level,

            tradableAccounts,

            recommendedMaxAccounts,

            minimumRemainingDD,

            marketLevel,

            concentration

        });


    /*
    =====================================
    RESULT
    =====================================
    */

    return {

        level,

        score,

        status,

        reason,

        totalAccounts,

        fundedAccounts,

        evaluationAccounts,

        tradableAccounts,

        pausedAccounts,

        totalRemainingDD:
            roundPortfolioMoney(
                totalRemainingDD
            ),

        minimumRemainingDD:
            roundPortfolioMoney(
                minimumRemainingDD
            ),

        combinedAccountStops:
            roundPortfolioMoney(
                combinedAccountStops
            ),

        recommendedPortfolioStop,

        recommendedMaxAccounts,

        concentrationRisk:
            concentration.level,

        concentrationScore:
            concentration.score,

        marketRisk:
            marketLevel,

        weakestAccount:
            weakestGuidance
                ? weakestGuidance.accountName
                : null,

        weakestAccountDD:
            weakestGuidance
                ? roundPortfolioMoney(
                    weakestGuidance.remainingDD
                )
                : null

    };

}



/*
=========================================
TRADABLE?
=========================================
*/

function isPortfolioGuidanceTradable(
    guidance
) {

    if(!guidance) {

        return false;

    }


    const action =
        String(
            guidance.todayAction ||
            ""
        ).toUpperCase();


    const riskMode =
        String(
            guidance.riskMode ||
            ""
        ).toUpperCase();


    if(
        action ===
            "STOP TODAY" ||
        action ===
            "NO TRADING REQUIRED" ||
        action.startsWith(
            "WAIT FOR"
        ) ||
        riskMode ===
            "PAUSE" ||
        riskMode ===
            "STOP"
    ) {

        return false;

    }


    return true;

}



/*
=========================================
WEAKEST ACCOUNT
=========================================
*/

function findWeakestPortfolioAccount(
    guidance
) {

    if(
        !Array.isArray(
            guidance
        ) ||
        guidance.length === 0
    ) {

        return null;

    }


    const candidates =
        guidance
            .filter(
                item => {

                    const dd =
                        portfolioFiniteNumber(
                            item.remainingDD
                        );


                    return (
                        dd !== null &&
                        dd >= 0
                    );

                }
            )
            .sort(
                (a,b) => {

                    const ddA =
                        portfolioFiniteNumber(
                            a.remainingDD
                        ) || 0;


                    const ddB =
                        portfolioFiniteNumber(
                            b.remainingDD
                        ) || 0;


                    return (
                        ddA -
                        ddB
                    );

                }
            );


    return (
        candidates[0] ||
        null
    );

}



/*
=========================================
CONCENTRATION
=========================================
*/

function calculatePortfolioConcentration(
    tradableAccounts
) {

    if(
        tradableAccounts >= 4
    ) {

        return {

            level:
                "EXTREME",

            score:
                100

        };

    }


    if(
        tradableAccounts === 3
    ) {

        return {

            level:
                "HIGH",

            score:
                75

        };

    }


    if(
        tradableAccounts === 2
    ) {

        return {

            level:
                "MEDIUM",

            score:
                50

        };

    }


    return {

        level:
            "LOW",

        score:
            tradableAccounts === 1
                ? 25
                : 0

    };

}



/*
=========================================
RISK LEVEL
=========================================
*/

function getPortfolioRiskLevel(
    score
) {

    if(
        score >= 80
    ) {

        return "EXTREME";

    }


    if(
        score >= 60
    ) {

        return "HIGH";

    }


    if(
        score >= 35
    ) {

        return "MEDIUM";

    }


    return "LOW";

}



/*
=========================================
RECOMMENDED ACCOUNT COUNT
=========================================
*/

function getRecommendedPortfolioAccounts(
    level,
    marketLevel,
    tradableAccounts
) {

    if(
        tradableAccounts <= 0
    ) {

        return 0;

    }


    if(
        level ===
            "EXTREME" ||
        marketLevel ===
            "EXTREME"
    ) {

        return Math.min(
            1,
            tradableAccounts
        );

    }


    if(
        level ===
            "HIGH" ||
        marketLevel ===
            "HIGH"
    ) {

        return Math.min(
            2,
            tradableAccounts
        );

    }


    if(
        level ===
        "MEDIUM"
    ) {

        return Math.min(
            3,
            tradableAccounts
        );

    }


    return tradableAccounts;

}



/*
=========================================
PORTFOLIO STOP
=========================================
*/

function calculateRecommendedPortfolioStop(
    tradableGuidance,
    maxAccounts,
    level
) {

    if(
        !Array.isArray(
            tradableGuidance
        ) ||
        maxAccounts <= 0
    ) {

        return 0;

    }


    const stops =
        tradableGuidance
            .map(
                item =>
                    portfolioFiniteNumber(
                        item.maxLossToday
                    )
            )
            .filter(
                value =>
                    value !== null &&
                    value > 0
            )
            .sort(
                (a,b) =>
                    a - b
            );


    if(
        stops.length === 0
    ) {

        return 0;

    }


    /*
    Konservativ:
    kleinste Account Stops zuerst.
    */

    const selected =
        stops.slice(
            0,
            maxAccounts
        );


    let stop =
        selected.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    /*
    Portfolio-Level zusätzlicher Haircut.
    */

    if(
        level ===
        "EXTREME"
    ) {

        stop *=
            0.50;

    }
    else if(
        level ===
        "HIGH"
    ) {

        stop *=
            0.70;

    }
    else if(
        level ===
        "MEDIUM"
    ) {

        stop *=
            0.85;

    }


    return roundPortfolioMoney(
        stop
    );

}



/*
=========================================
PORTFOLIO STATUS
=========================================
*/

function getPortfolioRiskStatus(
    level,
    tradableAccounts
) {

    if(
        tradableAccounts === 0
    ) {

        return "NO TRADING";

    }


    if(
        level ===
        "EXTREME"
    ) {

        return "MINIMUM EXPOSURE";

    }


    if(
        level ===
        "HIGH"
    ) {

        return "REDUCE EXPOSURE";

    }


    if(
        level ===
        "MEDIUM"
    ) {

        return "CONTROLLED EXPOSURE";

    }


    return "NORMAL EXPOSURE";

}



/*
=========================================
PORTFOLIO REASON
=========================================
*/

function buildPortfolioRiskReason(
    data
) {

    const reasons =
        [];


    if(
        data.marketLevel ===
        "EXTREME"
    ) {

        reasons.push(
            "Extreme Market Risk"
        );

    }
    else if(
        data.marketLevel ===
        "HIGH"
    ) {

        reasons.push(
            "High Market Risk"
        );

    }


    if(
        data.concentration.level ===
        "EXTREME"
    ) {

        reasons.push(
            "sehr hohe Account-Konzentration"
        );

    }
    else if(
        data.concentration.level ===
        "HIGH"
    ) {

        reasons.push(
            "hohe Account-Konzentration"
        );

    }


    if(
        data.minimumRemainingDD > 0 &&
        data.minimumRemainingDD <= 750
    ) {

        reasons.push(
            "mindestens ein Account hat geringen verbleibenden Drawdown"
        );

    }


    if(
        data.tradableAccounts >
        data.recommendedMaxAccounts
    ) {

        reasons.push(
            `nur ${data.recommendedMaxAccounts} von ${data.tradableAccounts} handelbaren Accounts gleichzeitig empfohlen`
        );

    }


    if(
        reasons.length === 0
    ) {

        return (
            "Portfolio-Risiko innerhalb der aktuellen Limits."
        );

    }


    return (
        reasons.join(
            " · "
        ) +
        "."
    );

}



/*
=========================================
EMPTY RESULT
=========================================
*/

function buildEmptyPortfolioRisk() {

    return {

        level:
            "LOW",

        score:
            0,

        status:
            "NO ACCOUNTS",

        reason:
            "Keine Accounts vorhanden.",

        totalAccounts:
            0,

        fundedAccounts:
            0,

        evaluationAccounts:
            0,

        tradableAccounts:
            0,

        pausedAccounts:
            0,

        totalRemainingDD:
            0,

        minimumRemainingDD:
            0,

        combinedAccountStops:
            0,

        recommendedPortfolioStop:
            0,

        recommendedMaxAccounts:
            0,

        concentrationRisk:
            "LOW",

        concentrationScore:
            0,

        marketRisk:
            "LOW",

        weakestAccount:
            null,

        weakestAccountDD:
            null

    };

}



/*
=========================================
NUMBER HELPER
=========================================
*/

function portfolioFiniteNumber(
    value
) {

    if(
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : null;

}



/*
=========================================
MONEY ROUNDING
=========================================
*/

function roundPortfolioMoney(
    value
) {

    const number =
        portfolioFiniteNumber(
            value
        );


    if(
        number === null
    ) {

        return 0;

    }


    return Math.round(
        number *
        100
    ) / 100;

}



/*
=========================================
DEBUG
=========================================
*/

function debugPortfolioRisk() {

    const risk =
        analyzePortfolioRisk();


    console.log(
        "TPR PORTFOLIO RISK",
        risk
    );


    console.table(
        [
            {

                level:
                    risk.level,

                score:
                    risk.score,

                status:
                    risk.status,

                accounts:
                    risk.totalAccounts,

                tradable:
                    risk.tradableAccounts,

                paused:
                    risk.pausedAccounts,

                maxAccounts:
                    risk.recommendedMaxAccounts,

                totalDD:
                    risk.totalRemainingDD,

                minDD:
                    risk.minimumRemainingDD,

                accountStops:
                    risk.combinedAccountStops,

                portfolioStop:
                    risk.recommendedPortfolioStop,

                concentration:
                    risk.concentrationRisk,

                market:
                    risk.marketRisk,

                weakest:
                    risk.weakestAccount

            }
        ]
    );


    return risk;

}
