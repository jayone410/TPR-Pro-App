let selectedAccountIds = [];

function initAccountManager() {

    selectedAccountIds =
        loadSelectedAccountIds();

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


    if(accountForm) {
        accountForm.style.display = "none";
    }


    if(toggleAccountFormButton && accountForm) {

        toggleAccountFormButton.addEventListener(
            "click",
            () => {

                const hidden =
                    accountForm.style.display === "none";

                accountForm.style.display =
                    hidden ? "block" : "none";

                toggleAccountFormButton.textContent =
                    hidden
                        ? "− Account Formular"
                        : "+ Account";
            }
        );
    }


    if(addAccountButton) {

        addAccountButton.addEventListener(
            "click",
            () => {

                const provider =
                    document.getElementById(
                        "accountProvider"
                    ).value;

                const accountType =
                    document.getElementById(
                        "accountType"
                    ).value;

                const accountName =
                    document.getElementById(
                        "accountName"
                    ).value.trim();

                const startingBalance =
                    document.getElementById(
                        "startingBalance"
                    ).value;


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


                document.getElementById(
                    "accountName"
                ).value = "";


                accountForm.style.display =
                    "none";


                renderAccounts();

                renderPortfolio();
            }
        );
    }


    if(selectAllButton) {

        selectAllButton.addEventListener(
            "click",
            () => {

                selectedAccountIds =
                    accounts.map(
                        account => account.id
                    );

                saveSelectedAccountIds(
                    selectedAccountIds
                );

                renderAccounts();
                renderPortfolio();
            }
        );
    }


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


    renderAccounts();
}


function renderAccounts() {

    const accountList =
        document.getElementById(
            "accountList"
        );

    const selectedAccountCount =
        document.getElementById(
            "selectedAccountCount"
        );


    if(!accountList) {
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
    }


    accounts.forEach(account => {

        const row =
            document.createElement("tr");


        const checked =
            selectedAccountIds.includes(
                account.id
            )
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

            <td class="account-actions-cell">

                <button
                    class="editAccountButton"
                    data-account-id="${account.id}"
                    title="Bearbeiten"
                >
                    ✏️
                </button>
            
                <button
                    class="duplicateAccountButton"
                    data-account-id="${account.id}"
                    title="Duplizieren"
                >
                    📄
                </button>
            
                <button
                    class="deleteAccountButton"
                    data-account-id="${account.id}"
                    title="Löschen"
                >
                    🗑️
                </button>
            
            </td>
        `;


        accountList.appendChild(row);
    });


    document
        .querySelectorAll(
            ".accountCheckbox"
        )
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                event => {

                    const id =
                        event.target.dataset
                            .accountId;


                    if(event.target.checked) {

                        if(
                            !selectedAccountIds
                                .includes(id)
                        ) {

                            selectedAccountIds
                                .push(id);
                        }

                    }
                    else {

                        selectedAccountIds =
                            selectedAccountIds
                                .filter(
                                    accountId =>
                                        accountId !== id
                                );
                    }


                    saveSelectedAccountIds(
                        selectedAccountIds
                    );


                    renderAccounts();
                    renderPortfolio();
                }
            );
        });


    if(selectedAccountCount) {

        selectedAccountCount.textContent =
            selectedAccountIds.length +
            " Account(s) ausgewählt";
    }
}
