/*
=====================================
MARKET INTELLIGENCE
=====================================
*/

if(
    typeof loadEconomicCalendar ===
    "function"
) {

    loadEconomicCalendar()
        .then(() => {

            if(
                typeof renderMarketIntelligence ===
                "function"
            ) {

                renderMarketIntelligence();

            }

        });

}
