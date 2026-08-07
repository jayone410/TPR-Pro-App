/*
=========================================
TPR PRO AI
Dashboard Layout Manager
=========================================
*/


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


    try {

        return {

            ...DASHBOARD_CARDS,
            ...JSON.parse(saved)

        };

    }
    catch(error) {

        console.error(
            "Dashboard Layout konnte nicht geladen werden:",
            error
        );


        return {
            ...DASHBOARD_CARDS
        };

    }

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


    syncDashboardCheckboxes(
        layout
    );

}



function syncDashboardCheckboxes(layout) {

    document
        .querySelectorAll(
            "[data-card-toggle]"
        )
        .forEach(
            checkbox => {

                const cardId =
                    checkbox.dataset.cardToggle;


                checkbox.checked =
                    layout[cardId] !== false;

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



function setDashboardPreset(preset) {

    let layout = {
        ...DASHBOARD_CARDS
    };


    if(preset === "compact") {

        layout = {

            cardAccountManager: true,

            cardReadiness: true,

            cardPayout: true,

            cardDailyPlan: true,

            cardNews: true,

            cardAiCoach: true,

            cardPerformance: false,

            cardAdvancedAnalytics: false,

            cardEquity: false,

            cardDrawdown: false,

            cardHourly: false

        };

    }


    if(preset === "standard") {

        layout = {

            cardAccountManager: true,

            cardReadiness: true,

            cardPayout: true,

            cardDailyPlan: true,

            cardNews: true,

            cardAiCoach: true,

            cardPerformance: true,

            cardAdvancedAnalytics: true,

            cardEquity: false,

            cardDrawdown: false,

            cardHourly: true

        };

    }


    if(preset === "analytics") {

        layout = {

            ...DASHBOARD_CARDS

        };

    }


    saveDashboardLayout(
        layout
    );


    applyDashboardLayout();

}



function initDashboardLayout() {

    const settingsButton =
        document.getElementById(
            "dashboardSettingsButton"
        );


    const settingsPanel =
        document.getElementById(
            "dashboardSettingsPanel"
        );


    if(
        settingsButton &&
        settingsPanel
    ) {

        settingsButton.addEventListener(
            "click",
            () => {

                const hidden =
                    settingsPanel.style.display ===
                    "none";


                settingsPanel.style.display =
                    hidden
                        ? "block"
                        : "none";

            }
        );

    }



    document
        .querySelectorAll(
            "[data-card-toggle]"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    event => {

                        const cardId =
                            event.target.dataset.cardToggle;


                        setCardVisibility(
                            cardId,
                            event.target.checked
                        );

                    }
                );

            }
        );


    applyDashboardLayout();

}
