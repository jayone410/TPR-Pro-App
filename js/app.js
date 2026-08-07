document.addEventListener("DOMContentLoaded", () => {

    const importCsvButton =
    document.getElementById("importCsvButton");

    const csvFile =
        document.getElementById("csvFile");
    
    const csvStatus =
        document.getElementById("csvStatus");
    
    
    importCsvButton.addEventListener(
        "click",
        () => {
            csvFile.click();
        }
    );
    
    
    csvFile.addEventListener(
        "change",
        async event => {
    
            const file =
                event.target.files[0];
    
            if(!file) return;
    
    
            const trades =
                await parseCSV(file);
    
    
            csvStatus.innerHTML = `
                Datei:
                <strong>${file.name}</strong>
                ·
                ${trades.length} Zeilen geladen
            `;
    
    
            console.log(
                "CSV IMPORT:",
                trades
            );
    
        }
    );
    
    let selectedAccountIds =
        loadSelectedAccountIds();


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


    function updateSelectionCount() {

        selectedAccountCount.textContent =
            selectedAccountIds.length +
            " Account(s) ausgewählt";

    }


    function renderAccounts() {

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
                    $${account.balance.toLocaleString()}
                </td>

                <td>
                    ${account.trades.length}
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

                            if(!selectedAccountIds.includes(id)) {

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


    function renderPortfolio() {

        const selectedAccounts =
            getSelectedAccounts(
                selectedAccountIds
            );


        if(selectedAccounts.length === 0) {

            document
                .getElementById("score")
                .textContent = "--";


            document
                .getElementById("recommendation")
                .textContent =
                    "Keine Accounts ausgewählt.";


            document
                .getElementById("reasons")
                .innerHTML = "";


            document
                .getElementById("riskFactors")
                .innerHTML = "";

            return;
        }


        /*
        Vorerst analysieren wir den ersten
        ausgewählten Account für Readiness.

        Portfolio-Statistiken bauen wir
        im nächsten Schritt.
        */

        const account =
            selectedAccounts[0];


        const engineAccount = {

            ...account,

            buffer:
                account.balance -
                account.startingBalance,

            nextPayoutAmount: 0

        };


        const result =
            analyzeAccount(
                engineAccount
            );


        document
            .getElementById("score")
            .textContent =
                result.score +
                " / 100";


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


        const riskBox =
            document.getElementById(
                "riskFactors"
            );


        riskBox.innerHTML = `

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

    }


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


            renderAccounts();

            renderPortfolio();

        }
    );


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


    renderAccounts();

    renderPortfolio();

});
