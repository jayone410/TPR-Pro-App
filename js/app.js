document.addEventListener("DOMContentLoaded", () => {

    /*
    =========================================
    ELEMENTE
    =========================================
    */

    const accountList =
        document.getElementById("accountList");

    const selectedAccountCount =
        document.getElementById("selectedAccountCount");

    const addAccountButton =
        document.getElementById("addAccountButton");

    const selectAllButton =
        document.getElementById("selectAllAccounts");

    const clearSelectionButton =
        document.getElementById("clearAccountSelection");

    const toggleAccountFormButton =
        document.getElementById("toggleAccountForm");

    const accountForm =
        document.getElementById("accountForm");

    const importCsvButton =
        document.getElementById("importCsvButton");

    const csvFile =
        document.getElementById("csvFile");

    const csvStatus =
        document.getElementById("csvStatus");


    /*
    =========================================
    AUSWAHL LADEN
    =========================================
    */

    let selectedAccountIds =
        loadSelectedAccountIds();


    /*
    =========================================
    ACCOUNT FORM EIN-/AUSBLENDEN
    =========================================
    */

    if(accountForm) {
        accountForm.style.display = "none";
    }


    if(toggleAccountFormButton && accountForm) {

        toggleAccountFormButton.addEventListener(
            "click",
            () => {

                if(accountForm.style.display === "none") {

                    accountForm.style.display = "block";

                    toggleAccountFormButton.textContent =
                        "− Account Formular";

                }
                else {

                    accountForm.style.display = "none";

                    toggleAccountFormButton.textContent =
                        "+ Account";

                }

            }
        );

    }


    /*
    =========================================
    AUSWAHLZÄHLER
    =========================================
    */

    function updateSelectionCount() {

        if(!selectedAccountCount) {
            return;
        }


        selectedAccountCount.textContent =
            selectedAccountIds.length +
            " Account(s) ausgewählt";

    }


    /*
    =========================================
    ACCOUNT TABELLE
    =========================================
    */

    function renderAccounts() {

        if(!accountList) {
            console.error(
                "TPR PRO: #accountList wurde nicht gefunden."
            );
            return;
        }


        accountList.innerHTML = "";


        if(accounts.length === 0) {

            accountList.innerHTML = `
                <tr>
                    <td colspan="6">
                        Noch keine Accounts angelegt.
                    </td>
                </tr>
            `;

            updateSelectionCount();

            return;

        }


        accounts.forEach(account => {

            const row =
                document.createElement("tr");


            const checked =
                selectedAccountIds.includes(account.id)
                    ? "checked"
                    : "";


            row.innerHTML = `

                <td>
                    <input
                        type="checkbox"
                        class="accountCheckbox"
                        data-account-id="${account.id}"
                        ${checked}
                    >
                </td>

                <td>
                    <strong>
                        ${account.accountName}
                    </strong>
                </td>

                <td>
                    ${account.provider.toUpperCase()}
                </td>

                <td>
                    ${account.accountType}
                </td>

                <td>
                    $${Number(account.balance)
                        .toLocaleString()}
                </td>

                <td>
                    ${
                        Array.isArray(account.trades)
                            ? account.trades.length
                            : 0
                    }
                </td>

            `;


            accountList.appendChild(row);

        });


        document
            .querySelectorAll(".accountCheckbox")
            .forEach(checkbox => {

                checkbox.addEventListener(
                    "change",
                    event => {

                        const id =
                            event.target.dataset.accountId;


                        if(event.target.checked) {

                            if(
                                !selectedAccountIds
                                    .includes(id)
                            ) {

                                selectedAccountIds.push(id);

                            }

                        }
                        else {

                            selectedAccountIds =
                                selectedAccountIds.filter(
                                    accountId =>
                                        accountId !== id
                                );

                        }


                        saveSelectedAccountIds(
                            selectedAccountIds
                        );


                        updateSelectionCount();

                        renderPortfolio();

                    }
                );

            });


        updateSelectionCount();

    }


    /*
    =========================================
    PORTFOLIO / EINZELACCOUNT
    =========================================
    */

    function renderPortfolio() {

        const selectedAccounts =
            getSelectedAccounts(
                selectedAccountIds
            );


        if(selectedAccounts.length === 0) {

            document.getElementById("score").textContent =
                "--";

            document.getElementById("recommendation").textContent =
                "Keine Accounts ausgewählt.";

            document.getElementById("reasons").innerHTML =
                "";

            document.getElementById("riskFactors").innerHTML =
                "";

            document.getElementById("payout").innerHTML =
                "Account auswählen.";

            document.getElementById("dailyPlan").innerHTML =
                "Account auswählen.";

            return;

        }


        /*
        =====================================
        EIN ACCOUNT
        =====================================
        */

        if(selectedAccounts.length === 1) {

            const account =
                selectedAccounts[0];


            const engineAccount = {

                ...account,

                buffer:
                    Number(account.balance) -
                    Number(account.startingBalance),

                nextPayoutAmount:
                    account.nextPayoutAmount || 0

            };


            const result =
                analyzeAccount(engineAccount);


            document.getElementById("score").textContent =
                result.score + " / 100";


            document
                .getElementById("recommendation")
                .textContent =
                    result.recommendation;


            const reasons =
                document.getElementById("reasons");


            reasons.innerHTML = "";


            result.reasons.forEach(reason => {

                const item =
                    document.createElement("p");

                item.textContent =
                    "• " + reason;

                reasons.appendChild(item);

            });


            document
                .getElementById("riskFactors")
                .innerHTML = `

                <p>
                    Account Risk:
                    ${result.risk.accountRisk}/100
                </p>

                <p>
                    Market Risk:
                    ${result.risk.marketRisk}/100
                </p>

                <p>
                    Performance Risk:
                    ${result.risk.performanceRisk}/100
                </p>

                <p>
                    Discipline Risk:
                    ${result.risk.disciplineRisk}/100
                </p>

            `;


            /*
            PROP RULES
            */

            const providerRules =
                PROP_RULES[
                    account.provider
                ]?.accounts[
                    account.accountType
                ];


            if(providerRules) {

                const payout =
                    analyzePayout(
                        engineAccount,
                        providerRules
                    );


                const dailyPlan =
                    createDailyPlan(
                        engineAccount,
                        payout
                    );


                document
                    .getElementById("payout")
                    .innerHTML = `

                    <p>
                        Account:
                        <strong>
                            ${account.accountName}
                        </strong>
                    </p>

                    <p>
                        Payout Status:
                        <strong>
                            ${payout.status}
                        </strong>
                    </p>

                    <p>
                        ${payout.message}
                    </p>

                    <p>
                        AI Empfehlung:
                        <br>
                        ${payout.action}
                    </p>

                `;


                document
                    .getElementById("dailyPlan")
                    .innerHTML = `

                    <p>
                        Risk Mode:
                        <strong>
                            ${dailyPlan.mode}
                        </strong>
                    </p>

                    <p>
                        Tagesziel:
                        ${dailyPlan.target}
                    </p>

                    <p>
                        Max Loss:
                        ${dailyPlan.maxLoss}
                    </p>

                    <p>
                        AI Hinweise:
                    </p>

                    ${dailyPlan.advice
                        .map(
                            item =>
                                "✓ " + item
                        )
                        .join("<br>")}

                `;

            }
            else {

                document
                    .getElementById("payout")
                    .innerHTML =
                        "Noch keine Regeln für diesen Account hinterlegt.";

                document
                    .getElementById("dailyPlan")
                    .innerHTML =
                        "Noch kein Daily Plan verfügbar.";

            }


            return;

        }


        /*
        =====================================
        MEHRERE ACCOUNTS
        =====================================
        */

        const totalBalance =
            selectedAccounts.reduce(
                (sum, account) =>
                    sum + Number(account.balance),
                0
            );


        const totalStartingBalance =
            selectedAccounts.reduce(
                (sum, account) =>
                    sum +
                    Number(account.startingBalance),
                0
            );


        const totalProfit =
            totalBalance -
            totalStartingBalance;


        const totalTrades =
            selectedAccounts.reduce(
                (sum, account) =>
                    sum +
                    (
                        Array.isArray(account.trades)
                            ? account.trades.length
                            : 0
                    ),
                0
            );


        document.getElementById("score").textContent =
            selectedAccounts.length +
            " Accounts";


        document
            .getElementById("recommendation")
            .textContent =
                "Portfolio Ansicht";


        document
            .getElementById("reasons")
            .innerHTML = `

            <p>
                Gesamtbalance:
                <strong>
                    $${totalBalance.toLocaleString()}
                </strong>
            </p>

            <p>
                Gesamt P&L:
                <strong>
                    ${totalProfit >= 0 ? "+" : ""}
                    $${totalProfit.toLocaleString()}
                </strong>
            </p>

            <p>
                Gesamt Trades:
                <strong>
                    ${totalTrades}
                </strong>
            </p>

        `;


        document
            .getElementById("riskFactors")
            .innerHTML =
                "<p>Portfolio-Analyse aktiv.</p>";


        document
            .getElementById("payout")
            .innerHTML = `
                ${selectedAccounts.length}
                Accounts ausgewählt.
                <br><br>
                Payouts werden weiterhin
                pro Account bewertet.
            `;


        document
            .getElementById("dailyPlan")
            .innerHTML =
                "Portfolio Daily Plan folgt.";

    }


    /*
    =========================================
    ACCOUNT HINZUFÜGEN
    =========================================
    */

    if(addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            () => {

                const provider =
                    document
                        .getElementById(
                            "accountProvider"
                        )
                        .value;


                const accountType =
                    document
                        .getElementById(
                            "accountType"
                        )
                        .value;


                const accountName =
                    document
                        .getElementById(
                            "accountName"
                        )
                        .value
                        .trim();


                const startingBalance =
                    document
                        .getElementById(
                            "startingBalance"
                        )
                        .value;


                if(!accountName) {

                    alert(
                        "Bitte einen Account-Namen eingeben."
                    );

                    return;

                }


                const account =
                    createAccount(
                        provider,
                        accountType,
                        accountName,
                        startingBalance
                    );


                selectedAccountIds.push(
                    account.id
                );


                saveSelectedAccountIds(
                    selectedAccountIds
                );


                document
                    .getElementById(
                        "accountName"
                    )
                    .value = "";


                accountForm.style.display =
                    "none";


                renderAccounts();

                renderPortfolio();

            }
        );

    }


    /*
    =========================================
    ALLE AUSWÄHLEN
    =========================================
    */

    if(selectAllButton) {

        selectAllButton.addEventListener(
            "click",
            () => {

                selectedAccountIds =
                    accounts.map(
                        account =>
                            account.id
                    );


                saveSelectedAccountIds(
                    selectedAccountIds
                );


                renderAccounts();

                renderPortfolio();

            }
        );

    }


    /*
    =========================================
    AUSWAHL LÖSCHEN
    =========================================
    */

    if(clearSelectionButton) {

        clearSelectionButton.addEventListener(
            "click",
            () => {

                selectedAccountIds = [];


                saveSelectedAccountIds(
                    selectedAccountIds
                );


                renderAccounts();

                renderPortfolio();

            }
        );

    }


    /*
    =========================================
    CSV IMPORT
    =========================================
    */

    if(importCsvButton && csvFile) {

        importCsvButton.addEventListener(
            "click",
            () => {

                if(selectedAccountIds.length !== 1) {

                    alert(
                        "Bitte genau einen Account auswählen, bevor du eine CSV importierst."
                    );

                    return;

                }


                csvFile.click();

            }
        );


        csvFile.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files[0];


                if(!file) {
                    return;
                }


                const trades =
                    await parseCSV(file);


                if(csvStatus) {

                    csvStatus.innerHTML = `

                        Datei:
                        <strong>
                            ${file.name}
                        </strong>

                        ·

                        ${trades.length}
                        Zeilen erkannt

                    `;

                }


                console.log(
                    "CSV IMPORT:",
                    trades
                );


                /*
                Gleiche Datei später erneut
                auswählbar machen
                */

                csvFile.value = "";

            }
        );

    }


    /*
    =========================================
    START
    =========================================
    */

    console.log(
        "TPR PRO Accounts:",
        accounts
    );


    renderAccounts();

    renderPortfolio();

});
