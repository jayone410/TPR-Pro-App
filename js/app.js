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


        initAccountManager();

        if(
            typeof renderPortfolioOverview ===
            "function"
        ) {

    renderPortfolioOverview();

}

        initCsvImport();

        initDashboardLayout();

        renderPortfolio();

    }
);
