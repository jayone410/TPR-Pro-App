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

        initAccountManager();


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
            typeof renderMarketIntelligence ===
            "function"
        ) {

            renderMarketIntelligence();

        }


        /*
        =====================================
        CSV IMPORT
        =====================================
        */

        initCsvImport();


        /*
        =====================================
        DASHBOARD LAYOUT
        =====================================
        */

        initDashboardLayout();


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

    }
);
