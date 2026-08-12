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

let marketEvents = [];


/*
=========================================
FRED RELEASE RULES
MNQ / NQ RELEVANT EVENTS
=========================================
*/

const MARKET_RELEASE_RULES = {

    10: {
        title: "CPI",
        impact: "high",
        volatility: "EXTREME"
    },

    46: {
        title: "PPI",
        impact: "high",
        volatility: "HIGH"
    },

    180: {
        title: "Initial Jobless Claims",
        impact: "medium",
        volatility: "MEDIUM"
    },

    9: {
        title: "Retail Sales",
        impact: "high",
        volatility: "HIGH"
    },

    321: {
        title: "Empire State Manufacturing",
        impact: "medium",
        volatility: "MEDIUM"
    },

    13: {
        title: "Industrial Production",
        impact: "medium",
        volatility: "MEDIUM"
    },

    27: {
        title: "Housing Starts",
        impact: "medium",
        volatility: "MEDIUM"
    },

    188: {
        title: "Import / Export Prices",
        impact: "medium",
        volatility: "MEDIUM"
    }

};

/*
=========================================
LOAD FRED ECONOMIC CALENDAR
=========================================
*/

async function loadEconomicCalendar() {

    try {

        const response =
            await fetch(
                "data/economic-calendar.json?t=" +
                Date.now()
            );


        if(!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const raw =
            await response.json();


        if(!Array.isArray(raw)) {

            throw new Error(
                "Economic Calendar ist kein Array."
            );

        }


        marketEvents =
            raw
                .map(
                    normalizeFredEvent
                )
                .filter(Boolean);


        console.log(
            "✅ FRED Calendar:",
            raw.length,
            "Releases geladen /",
            marketEvents.length,
            "MNQ-relevant"
        );


        return marketEvents;

    }

    catch(error) {

        console.error(
            "❌ FRED Calendar:",
            error
        );

        marketEvents = [];

        return [];

    }

}

/*
=========================================
NORMALIZE + FILTER FRED
=========================================
*/

function normalizeFredEvent(raw) {

    if(!raw) {

        return null;

    }


    const releaseId =
        Number(
            raw.release_id
        );


    const rule =
        MARKET_RELEASE_RULES[
            releaseId
        ];


    /*
    Nicht in unserer Whitelist
    = für TPR ignorieren.
    */

    if(!rule) {

        return null;

    }


    return {

        date:
            raw.date,

        time:
            getFredReleaseTime(
                releaseId
            ),

        title:
            rule.title,

        impact:
            rule.impact,

        relevance:
            "nasdaq",

        volatility:
            rule.volatility,

        releaseId,

        sourceTitle:
            raw.release_name

    };

}

/*
=========================================
FRED RELEASE TIMES
Berlin time is calculated separately later.
These are US Eastern release times.
=========================================
*/

function getFredReleaseTime(
    releaseId
) {

    const times = {

        10: "08:30",   // CPI
        46: "08:30",   // PPI
        180: "08:30",  // Jobless Claims
        9: "08:30",    // Retail Sales
        321: "08:30",  // Empire State
        13: "09:15",   // Industrial Production
        27: "08:30",   // Housing Starts
        188: "08:30"   // Import / Export Prices

    };


    return (
        times[releaseId] ||
        null
    );

}

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

    if(
        event?.volatility
    ) {
    
        return event.volatility;

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

/*
=========================================
MARKET INTELLIGENCE UI
=========================================
*/

function renderMarketIntelligence() {

    if(
        typeof analyzeTodayMarketRisk !==
        "function"
    ) {

        return;

    }


    const result =
        analyzeTodayMarketRisk();


    const riskLevel =
        document.getElementById(
            "marketRiskLevel"
        );


    const volatility =
        document.getElementById(
            "marketVolatility"
        );


    const eventCount =
        document.getElementById(
            "marketEventCount"
        );


    const highImpact =
        document.getElementById(
            "marketHighImpactCount"
        );


    const primaryEvent =
        document.getElementById(
            "marketPrimaryEvent"
        );


    const primaryTime =
        document.getElementById(
            "marketPrimaryEventTime"
        );


    const recommendation =
        document.getElementById(
            "marketRecommendation"
        );


    const eventList =
        document.getElementById(
            "marketEventList"
        );


    /*
    =====================================
    SUMMARY
    =====================================
    */

    if(riskLevel) {

        riskLevel.textContent =
            result.level;

        riskLevel.dataset.level =
            String(
                result.level
            ).toLowerCase();

    }


    if(volatility) {

        volatility.textContent =
            result.volatility;

    }


    if(eventCount) {

        eventCount.textContent =
            result.eventCount;

    }


    if(highImpact) {

        highImpact.textContent =
            result.highImpactCount;

    }


    /*
    =====================================
    PRIMARY EVENT
    =====================================
    */

    if(
        result.primaryEvent
    ) {

        if(primaryEvent) {

            primaryEvent.textContent =
                result.primaryEvent.title;

        }


        if(primaryTime) {

            primaryTime.textContent =
                result.primaryEvent.time ||
                "--";

        }

    }

    else {

        if(primaryEvent) {

            primaryEvent.textContent =
                "Keine relevanten Events";

        }


        if(primaryTime) {

            primaryTime.textContent =
                "--";

        }

    }


    /*
    =====================================
    RECOMMENDATION
    =====================================
    */

    if(recommendation) {

        recommendation.textContent =
            result.recommendation;

    }


    /*
    =====================================
    EVENT LIST
    =====================================
    */

    if(!eventList) {

        return;

    }


    if(
        !Array.isArray(
            result.events
        ) ||
        result.events.length ===
        0
    ) {

        eventList.innerHTML = `
            <div class="market-event-empty">
                Keine Nasdaq-relevanten Events erkannt.
            </div>
        `;

        return;

    }


    eventList.innerHTML =
        result.events
            .map(
                event =>
                    buildMarketEventHtml(
                        event
                    )
            )
            .join("");

}


/*
=========================================
EVENT HTML
=========================================
*/

function buildMarketEventHtml(
    event
) {

    const impact =
        String(
            event.impact ||
            "low"
        ).toLowerCase();


    const volatility =
        String(
            event.volatility ||
            "LOW"
        );


    const special =
        event.specialType
            ? event.specialType
            : "";


    return `

        <div class="market-event market-event-${impact}">

            <div class="market-event-time">
                ${escapeMarketHtml(
                    event.time ||
                    "--"
                )}
            </div>


            <div class="market-event-content">

                <strong>
                    ${escapeMarketHtml(
                        event.title ||
                        "Event"
                    )}
                </strong>

                <span>
                    ${escapeMarketHtml(
                        impact.toUpperCase()
                    )}
                    ${special ? " · " + escapeMarketHtml(special) : ""}
                    ·
                    ${escapeMarketHtml(volatility)}
                </span>

            </div>


            <div class="market-event-risk">
                ${Number(
                    event.riskScore ||
                    0
                )}
            </div>

        </div>

    `;

}


/*
=========================================
ESCAPE
=========================================
*/

function escapeMarketHtml(
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
