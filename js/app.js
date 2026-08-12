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


                    /*
                    Nach geladenen Marktdaten
                    Mission Control erneut rendern.

                    Später kann Market Risk direkt
                    in die Account Guidance einfließen.
                    */

                    if(
                        typeof renderMissionControl ===
                        "function"
                    ) {

                        renderMissionControl();

                    }

                })
                .catch(
                    error => {

                        console.error(
                            "Market Intelligence Fehler:",
                            error
                        );


                        /*
                        Auch bei API-/JSON-Fehler
                        den Market-Block rendern.
                        */

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

            /*
            Fallback ohne Calendar Loader
            */

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


        console.log(
            "✅ TPR PRO AI Initialisierung abgeschlossen"
        );

    }
);
