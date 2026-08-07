const DASHBOARD_CARDS = {

    cardAccountManager: true,
    cardReadiness: true,
    cardPayout: true,
    cardDailyPlan: true,
    cardNews: true,
    cardAiCoach: true,
    cardPerformance: true,
    cardAdvancedAnalytics: true,
    cardEquity: true,
    cardDrawdown: true,
    cardHourly: true

};


function loadDashboardLayout() {

    const saved =
        localStorage.getItem(
            "tpr_dashboard_layout"
        );


    if(!saved) {

        return {
            ...DASHBOARD_CARDS
        };

    }


    return {

        ...DASHBOARD_CARDS,

        ...JSON.parse(saved)

    };

}



function saveDashboardLayout(layout) {

    localStorage.setItem(
        "tpr_dashboard_layout",
        JSON.stringify(layout)
    );

}



function applyDashboardLayout() {

    const layout =
        loadDashboardLayout();


    Object.entries(layout)
        .forEach(
            ([cardId, visible]) => {

                const card =
                    document.getElementById(
                        cardId
                    );


                if(!card) {
                    return;
                }


                card.style.display =
                    visible
                        ? ""
                        : "none";

            }
        );

}



function setCardVisibility(
    cardId,
    visible
) {

    const layout =
        loadDashboardLayout();


    layout[cardId] =
        visible;


    saveDashboardLayout(
        layout
    );


    applyDashboardLayout();

}
