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

        initCsvImport();

        initDashboardLayout();

        renderPortfolio();

    }
);
