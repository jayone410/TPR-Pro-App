```javascript
/*
=========================================
TPR PRO AI
Account Manager
=========================================
*/


let selectedAccountIds = [];



/*
=========================================
INITIALISIERUNG
=========================================
*/

function initAccountManager() {

    selectedAccountIds =
        loadSelectedAccountIds();


    const addAccountButton =
        document.getElementById(
            "addAccountButton"
        );

    const selectAllButton =
        document.getElementById(
            "selectAllAccounts"
        );

    const clearSelectionButton =
        document.getElementById(
            "clearAccountSelection"
        );

    const toggleAccountFormButton =
        document.getElementById(
            "toggleAccountForm"
        );

    const accountForm =
        document.getElementById(
            "accountForm"
        );


    /*
    Account Formular beim Start ausblenden
    */

    if(accountForm) {

        accountForm.style.display =
            "none";

    }



    /*
    Account Formular öffnen / schließen
    */

    if(
        toggleAccountFormButton &&
        accountForm
    ) {

        toggleAccountFormButton
            .addEventListener(
                "click",
                () => {

                    const hidden =
                        accountForm
                            .style
                            .display ===
                        "none";


                    accountForm
                        .style
                        .display =
                            hidden
                                ? "block"
                                : "none";


                    toggleAccountFormButton
                        .textContent =
                            hidden
                                ? "− Account Formular"
                                : "+ Account";

                }
            );

    }



    /*
    =========================================
    ACCOUNT HINZUFÜGEN
    =========================================
    */

    if(addAccountButton) {

        addAccountButton
            .addEventListener(
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


                    if(
                        !selectedAccountIds.includes(
                            account.id
                        )
                    ) {

                        selectedAccountIds.push(
                            account.id
                        );

                    }


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


                    toggleAccountFormButton
                        .textContent =
                            "+ Account";


                    renderAccounts();

                    renderPortfolio();

                }
            );

    }



    /*
    =========================================
    ALLE ACCOUNTS AUSWÄHLEN
    =========================================
    */

    if(selectAllButton) {

        selectAllButton
            .addEventListener(
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

        clearSelectionButton
            .addEventListener(
                "click",
                () => {

                    selectedAccountIds =
                        [];


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



/*
=========================================
ACCOUNT TABELLE RENDERN
=========================================
*/

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



    /*
    Keine Accounts vorhanden
    */

    if(accounts.length === 0) {

        accountList.innerHTML = `

            <tr>

                <td colspan="7">

                    Noch keine Accounts angelegt.

                </td>

            </tr>

        `;


        if(selectedAccountCount) {

            selectedAccountCount
                .textContent =
                    "0 Accounts ausgewählt";

        }


        return;

    }



    /*
    Account Zeilen erstellen
    */

    accounts.forEach(
        account => {

            const row =
                document.createElement(
                    "tr"
                );


            const checked =
                selectedAccountIds
                    .includes(
                        account.id
                    )
                    ? "checked"
                    : "";


            const tradeCount =
                Array.isArray(
                    account.trades
                )
                    ? account.trades.length
                    : 0;


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

                    ${String(
                        account.provider
                    ).toUpperCase()}

                </td>


                <td>

                    ${account.accountType}

                </td>


                <td>

                    $${Number(
                        account.balance
                    ).toLocaleString()}

                </td>


                <td>

                    ${tradeCount}

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


            accountList.appendChild(
                row
            );

        }
    );



    /*
    =========================================
    CHECKBOX EVENTS
    =========================================
    */

    document
        .querySelectorAll(
            ".accountCheckbox"
        )
        .forEach(
            checkbox => {

                checkbox
                    .addEventListener(
                        "change",
                        event => {

                            const id =
                                event
                                    .target
                                    .dataset
                                    .accountId;


                            if(
                                event.target
                                    .checked
                            ) {

                                if(
                                    !selectedAccountIds
                                        .includes(
                                            id
                                        )
                                ) {

                                    selectedAccountIds
                                        .push(
                                            id
                                        );

                                }

                            }
                            else {

                                selectedAccountIds =
                                    selectedAccountIds
                                        .filter(
                                            accountId =>
                                                accountId !==
                                                id
                                        );

                            }


                            saveSelectedAccountIds(
                                selectedAccountIds
                            );


                            renderAccounts();

                            renderPortfolio();

                        }
                    );

            }
        );



    /*
    =========================================
    ACCOUNT BEARBEITEN
    =========================================
    */

    document
        .querySelectorAll(
            ".editAccountButton"
        )
        .forEach(
            button => {

                button
                    .addEventListener(
                        "click",
                        () => {

                            const id =
                                button
                                    .dataset
                                    .accountId;


                            const account =
                                getAccount(
                                    id
                                );


                            if(!account) {

                                return;

                            }


                            const newName =
                                prompt(
                                    "Account-Name:",
                                    account.accountName
                                );


                            if(
                                newName === null
                            ) {

                                return;

                            }


                            if(
                                !newName.trim()
                            ) {

                                alert(
                                    "Der Account-Name darf nicht leer sein."
                                );

                                return;

                            }


                            account.accountName =
                                newName.trim();


                            updateAccount(
                                account
                            );


                            renderAccounts();

                            renderPortfolio();

                        }
                    );

            }
        );



    /*
    =========================================
    ACCOUNT DUPLIZIEREN
    =========================================
    */

    document
        .querySelectorAll(
            ".duplicateAccountButton"
        )
        .forEach(
            button => {

                button
                    .addEventListener(
                        "click",
                        () => {

                            const id =
                                button
                                    .dataset
                                    .accountId;


                            const copy =
                                duplicateAccount(
                                    id
                                );


                            if(!copy) {

                                return;

                            }


                            if(
                                !selectedAccountIds
                                    .includes(
                                        copy.id
                                    )
                            ) {

                                selectedAccountIds
                                    .push(
                                        copy.id
                                    );

                            }


                            saveSelectedAccountIds(
                                selectedAccountIds
                            );


                            renderAccounts();

                            renderPortfolio();

                        }
                    );

            }
        );



    /*
    =========================================
    ACCOUNT LÖSCHEN
    =========================================
    */

    document
        .querySelectorAll(
            ".deleteAccountButton"
        )
        .forEach(
            button => {

                button
                    .addEventListener(
                        "click",
                        () => {

                            const id =
                                button
                                    .dataset
                                    .accountId;


                            const account =
                                getAccount(
                                    id
                                );


                            if(!account) {

                                return;

                            }


                            const confirmed =
                                confirm(

                                    `Account "${account.accountName}" wirklich löschen?\n\n` +

                                    `Alle gespeicherten Trades dieses Accounts werden ebenfalls gelöscht.`

                                );


                            if(!confirmed) {

                                return;

                            }


                            removeAccount(
                                id
                            );


                            selectedAccountIds =
                                selectedAccountIds
                                    .filter(
                                        accountId =>
                                            accountId !==
                                            id
                                    );


                            saveSelectedAccountIds(
                                selectedAccountIds
                            );


                            renderAccounts();

                            renderPortfolio();

                        }
                    );

            }
        );



    /*
    =========================================
    AUSWAHLZÄHLER
    =========================================
    */

    if(selectedAccountCount) {

        selectedAccountCount
            .textContent =
                selectedAccountIds.length +
                " Account(s) ausgewählt";

    }

}
```
