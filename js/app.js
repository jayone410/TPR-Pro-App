document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "TPR PRO AI gestartet"
        );

        console.log(
            "Accounts:",
            accounts
        );


        /*
        =====================================
        ACCOUNT MANAGER
        =====================================
        */

        if(
            typeof initAccountManager ===
            "function"
        ) {

            initAccountManager();

        }


        /*
        =====================================
        ACCOUNT LIST
        =====================================
        */

        if(
            typeof renderAccounts ===
            "function"
        ) {

            renderAccounts();

        }


        /*
        =====================================
        ACCOUNT PERFORMANCE
        =====================================
        */

        if(
            typeof initAccountPerformance ===
            "function"
        ) {

            initAccountPerformance();

        }


        /*
        =====================================
        PORTFOLIO OVERVIEW
        =====================================
        */

        if(
            typeof renderPortfolioOverview ===
            "function"
        ) {

            renderPortfolioOverview();

        }


        /*
        =====================================
        MISSION CONTROL
        =====================================
        */

        if(
            typeof renderMissionControl ===
            "function"
        ) {

            renderMissionControl();

        }


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


                    if(
                        typeof renderMissionControl ===
                        "function"
                    ) {

                        renderMissionControl();

                    }


                    if(
                        typeof renderAccountPerformance ===
                        "function"
                    ) {

                        renderAccountPerformance();

                    }

                })
                .catch(
                    error => {

                        console.error(
                            "Market Intelligence Fehler:",
                            error
                        );


                        if(
                            typeof renderMarketIntelligence ===
                            "function"
                        ) {

                            renderMarketIntelligence();

                        }

                    }
                );

        }

        else {

            if(
                typeof renderMarketIntelligence ===
                "function"
            ) {

                renderMarketIntelligence();

            }

        }


        /*
        =====================================
        CSV IMPORT
        =====================================
        */

        if(
            typeof initCsvImport ===
            "function"
        ) {

            initCsvImport();

        }


        /*
        =====================================
        DASHBOARD LAYOUT
        =====================================
        */

        if(
            typeof initDashboardLayout ===
            "function"
        ) {

            initDashboardLayout();

        }


        /*
        =====================================
        PORTFOLIO
        =====================================
        */

        if(
            typeof renderPortfolio ===
            "function"
        ) {

            renderPortfolio();

        }


        /*
        =====================================
        FINAL UI REFRESH
        =====================================
        */

        if(
            typeof renderAccounts ===
            "function"
        ) {

            renderAccounts();

        }


        if(
            typeof renderPortfolioOverview ===
            "function"
        ) {

            renderPortfolioOverview();

        }


        if(
            typeof renderMissionControl ===
            "function"
        ) {

            renderMissionControl();

        }


        if(
            typeof renderAccountPerformanceTabs ===
            "function"
        ) {

            renderAccountPerformanceTabs();

        }


        if(
            typeof renderAccountPerformance ===
            "function"
        ) {

            renderAccountPerformance();

        }


        console.log(
            "✅ TPR PRO AI Initialisierung abgeschlossen"
        );

    }
);
