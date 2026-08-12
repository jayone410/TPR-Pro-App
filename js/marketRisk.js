/*
=========================================
TPR PRO AI
Market Risk Engine v1
=========================================

Aufgaben:

- Economic Events bewerten
- Nasdaq-Relevanz bestimmen
- Tagesrisiko bestimmen
- Volatilität einschätzen
- Trading Restrictions erzeugen

Später:
- automatische News API
- Earnings
- FOMC / Fed
- Live Volatility
=========================================
*/


/*
=========================================
TEMPORARY EVENT DATA

Später wird dieses Array automatisch
durch eine API gefüllt.
=========================================
*/

const marketEvents = [

    /*
    Beispiel:

    {
        date: "2026-08-12",
        time: "14:30",
        title: "CPI",
        impact: "high",
        relevance: "nasdaq"
    }

    */

];


/*
=========================================
TODAY STRING
=========================================
*/

function getMarketTodayString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/*
=========================================
TODAY EVENTS
=========================================
*/

function getTodayMarketEvents() {

    const today =
        getMarketTodayString();


    return marketEvents
        .filter(
            event =>
                event.date ===
                today
        )
        .sort(
            (a, b) =>
                String(a.time)
                    .localeCompare(
                        String(b.time)
                    )
        );

}


/*
=========================================
NASDAQ RELEVANCE
=========================================
*/

function isNasdaqRelevantEvent(
    event
) {

    if(!event) {

        return false;

    }


    const relevance =
        String(
            event.relevance ||
            ""
        ).toLowerCase();


    return (
        relevance === "nasdaq" ||
        relevance === "all" ||
        relevance === "usd"
    );

}


/*
=========================================
EVENT RISK SCORE
=========================================
*/

function getMarketEventRiskScore(
    event
) {

    if(!event) {

        return 0;

    }


    const impact =
        String(
            event.impact ||
            ""
        ).toLowerCase();


    let score = 0;


    if(
        impact === "high"
    ) {

        score = 80;

    }


    else if(
        impact === "medium"
    ) {

        score = 45;

    }


    else if(
        impact === "low"
    ) {

        score = 15;

    }


    /*
    Nasdaq relevante News bekommen
    zusätzliche Gewichtung.
    */

    if(
        isNasdaqRelevantEvent(
            event
        )
    ) {

        score += 10;

    }


    return Math.min(
        100,
        score
    );

}


/*
=========================================
SPECIAL EVENT DETECTION
=========================================
*/

function getSpecialEventType(
    event
) {

    const title =
        String(
            event?.title ||
            ""
        ).toLowerCase();


    if(
        title.includes("nonfarm") ||
        title.includes("nfp")
    ) {

        return "NFP";

    }


    if(
        title.includes("cpi") ||
        title.includes(
            "consumer price"
        )
    ) {

        return "CPI";

    }


    if(
        title.includes("fomc") ||
        title.includes(
            "federal funds"
        ) ||
        title.includes(
            "interest rate"
        )
    ) {

        return "FOMC";

    }


    if(
        title.includes("powell")
    ) {

        return "POWELL";

    }


    if(
        title.includes("ppi")
    ) {

        return "PPI";

    }


    if(
        title.includes("gdp")
    ) {

        return "GDP";

    }


    return null;

}


/*
=========================================
EVENT VOLATILITY
=========================================
*/

function getEventVolatility(
    event
) {

    const special =
        getSpecialEventType(
            event
        );


    /*
    Tier 1 Events
    */

    if(
        special === "NFP" ||
        special === "CPI" ||
        special === "FOMC"
    ) {

        return "EXTREME";

    }


    /*
    Tier 2 Events
    */

    if(
        special === "POWELL" ||
        special === "PPI" ||
        special === "GDP"
    ) {

        return "HIGH";

    }


    const impact =
        String(
            event?.impact ||
            ""
        ).toLowerCase();


    if(
        impact === "high"
    ) {

        return "HIGH";

    }


    if(
        impact === "medium"
    ) {

        return "MEDIUM";

    }


    return "LOW";

}


/*
=========================================
DAY MARKET RISK
=========================================
*/

function analyzeTodayMarketRisk() {

    const events =
        getTodayMarketEvents();


    const relevantEvents =
        events.filter(
            isNasdaqRelevantEvent
        );


    /*
    Keine relevanten Events
    */

    if(
        relevantEvents.length ===
        0
    ) {

        return {

            level:
                "LOW",

            score:
                20,

            volatility:
                "NORMAL",

            eventCount:
                0,

            highImpactCount:
                0,

            primaryEvent:
                null,

            events:
                [],

            recommendation:
                "Keine relevanten High-Impact-News erkannt.",

            riskMultiplier:
                1,

            tradingAllowed:
                true

        };

    }


    /*
    Höchstes Event bestimmen
    */

    const scored =
        relevantEvents
            .map(
                event => ({

                    ...event,

                    riskScore:
                        getMarketEventRiskScore(
                            event
                        ),

                    volatility:
                        getEventVolatility(
                            event
                        ),

                    specialType:
                        getSpecialEventType(
                            event
                        )

                })
            )
            .sort(
                (a, b) =>
                    b.riskScore -
                    a.riskScore
            );


    const primaryEvent =
        scored[0];


    const highImpactCount =
        scored.filter(
            event =>
                String(
                    event.impact
                ).toLowerCase() ===
                "high"
        ).length;


    let level =
        "LOW";


    let volatility =
        "NORMAL";


    let recommendation =
        "Normale Marktbedingungen.";


    let riskMultiplier =
        1;


    /*
    EXTREME
    */

    if(
        primaryEvent.volatility ===
        "EXTREME"
    ) {

        level =
            "EXTREME";


        volatility =
            "EXTREME";


        recommendation =
            `${primaryEvent.specialType || primaryEvent.title}: keine neuen Trades unmittelbar vor der Veröffentlichung. Nach dem Event auf Stabilisierung warten.`;


        riskMultiplier =
            0.25;

    }


    /*
    HIGH
    */

    else if(
        primaryEvent.riskScore >=
        75
    ) {

        level =
            "HIGH";


        volatility =
            "HIGH";


        recommendation =
            "High-Impact-News: Positionsgröße reduzieren und News-Zeitfenster meiden.";


        riskMultiplier =
            0.5;

    }


    /*
    MEDIUM
    */

    else if(
        primaryEvent.riskScore >=
        40
    ) {

        level =
            "MEDIUM";


        volatility =
            "ELEVATED";


        recommendation =
            "Erhöhte Volatilität möglich. Selektiver handeln.";


        riskMultiplier =
            0.75;

    }


    return {

        level,

        score:
            primaryEvent.riskScore,

        volatility,

        eventCount:
            scored.length,

        highImpactCount,

        primaryEvent,

        events:
            scored,

        recommendation,

        riskMultiplier,

        tradingAllowed:
            true

    };

}


/*
=========================================
DEBUG
=========================================
*/

function debugMarketRisk() {

    const result =
        analyzeTodayMarketRisk();


    console.log(
        "TPR MARKET RISK",
        result
    );


    if(
        result.events.length
    ) {

        console.table(
            result.events.map(
                event => ({

                    time:
                        event.time,

                    event:
                        event.title,

                    impact:
                        event.impact,

                    special:
                        event.specialType,

                    volatility:
                        event.volatility,

                    risk:
                        event.riskScore

                })
            )
        );

    }


    return result;

}
