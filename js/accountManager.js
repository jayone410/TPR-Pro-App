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


    if(accountForm) {

        accountForm.style.display =
            "none";

    }



    /*
    ACCOUNT FORMULAR
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
                        accountForm.style.display ===
                        "none";


                    accountForm.style.display =
                        hidden
                            ? "block"
                            : "none";


                    toggleAccountFormButton.textContent =
                        hidden
                            ? "− Account Formular"
                            : "+ Account";

                }
            );

    }



    /*
    ACCOUNT HINZUFÜGEN
    */

    if(addAccountButton) {

        addAccountButton
            .addEventListener(
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


                    document.getElementById(
                        "accountName"
                    ).value = "";


                    accountForm.style.display =
                        "none";


                    if(toggleAccountFormButton) {

                        toggleAccountFormButton.textContent =
                            "+ Account";

                    }


                    renderAccounts();

                    renderPortfolio();

                }
            );

    }



    /*
    ALLE AUSWÄHLEN
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
    AUSWAHL LÖSCHEN
    */

    if(clearSelectionButton) {

        clearSelectionButton
            .addEventListener(
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



/*
=========================================
BUFFER
=========================================
*/

function getAccountBuffer(account) {

    return (
        Number(account.balance) -
        Number(account.startingBalance)
    );

}



/*
=========================================
PAYOUT STATUS
=========================================
*/

function getAccountPayoutInfo(account) {

    let providerRules = null;


    if(
        PROP_RULES &&
        PROP_RULES[account.provider] &&
        PROP_RULES[account.provider].accounts &&
        PROP_RULES[account.provider].accounts[account.accountType]
    ) {

        providerRules =
            PROP_RULES[account.provider]
                .accounts[
                    account.accountType
                ];

    }


    if(!providerRules) {

        return {
            status: "--",
            label: "Keine Regeln"
        };

    }


    try {

        const engineAccount = {

            ...account,

            buffer:
                getAccountBuffer(
                    account
                ),

            nextPayoutAmount:
                account.nextPayoutAmount || 0

        };


        const payout =
            analyzePayout(
                engineAccount,
                providerRules
            );


        return {

            status:
                payout.status,

            label:
                payout.status

        };

    }
    catch(error) {

        console.error(
            "Payout konnte nicht berechnet werden:",
            error
        );


        return {

            status: "--",

            label: "--"

        };

    }

}


/*
=========================================
STATUS AMPEL
=========================================
*/

function getAccountStatus(account) {

    const buffer =
        getAccountBuffer(
            account
        );


    try {

        const engineAccount = {

            ...account,

            buffer,

            nextPayoutAmount:
                account.nextPayoutAmount ??
                0

        };


        const result =
            analyzeAccount(
                engineAccount
            );


        const recommendation =
            String(
                result.recommendation ??
                ""
            ).toUpperCase();


        if(
            recommendation.includes(
                "DON'T"
            ) ||
            recommendation.includes(
                "STOP"
            )
        ) {

            return {

                level: "red",

                icon: "🔴",

                text: "STOP"

            };

        }


        if(
            recommendation.includes(
                "LOW RISK"
            ) ||
            recommendation.includes(
                "CAUTION"
            )
        ) {

            return {

                level: "yellow",

                icon: "🟡",

                text: "LOW RISK"

            };

        }


        return {

            level: "green",

            icon: "🟢",

            text: "ACTIVE"

        };

    }
    catch(error) {

        /*
        Fallback falls Risk Engine
        einmal nicht verfügbar ist.
        */

        if(buffer <= 0) {

            return {

                level: "red",

                icon: "🔴",

                text: "RISK"

            };

        }


        return {

            level: "yellow",

            icon: "🟡",

            text: "CHECK"

        };

    }

}



/*
=========================================
ACCOUNT TABELLE
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


    accountList.innerHTML =
        "";



    /*
    KEINE ACCOUNTS
    */

    if(accounts.length === 0) {

        accountList.innerHTML = `

            <tr>

                <td colspan="10">

                    Noch keine Accounts angelegt.

                </td>

            </tr>

        `;


        if(selectedAccountCount) {

            selectedAccountCount.textContent =
                "0 Accounts ausgewählt";

        }


        return;

    }



    /*
    ACCOUNT ZEILEN
    */

    accounts.forEach(
        account => {

            const row =
                document.createElement(
                    "tr"
                );


            const checked =
                selectedAccountIds.includes(
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


            const buffer =
                getAccountBuffer(
                    account
                );


            const payout =
                getAccountPayoutInfo(
                    account
                );


            const status =
                getAccountStatus(
                    account
                );


            const bufferPrefix =
                buffer > 0
                    ? "+"
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

                    ${String(
                        account.provider
                    ).toUpperCase()}

                </td>


                <td>

                    ${account.accountType}

                </td>


                <td class="balance-cell">

                    <strong>

                        $${Number(
                            account.balance
                        ).toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </strong>

                    <button
                        class="editBalanceButton"
                        data-account-id="${account.id}"
                        title="Balance ändern"
                    >
                        ✏️
                    </button>

                </td>


                <td>

                    <span
                        class="${
                            buffer >= 0
                                ? "positive-value"
                                : "negative-value"
                        }"
                    >

                        ${bufferPrefix}$${buffer.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )}

                    </span>

                </td>


                <td>

                    <strong>
                        ${payout.label}
                    </strong>

                </td>


                <td>

                    ${tradeCount}

                </td>


                <td>

                    <span
                        class="account-status account-status-${status.level}"
                    >

                        ${status.icon}
                        ${status.text}

                    </span>

                </td>


                <td class="account-actions-cell">

                    <button
                        class="editAccountButton"
                        data-account-id="${account.id}"
                        title="Account bearbeiten"
                    >
                        ✏️
                    </button>


                    <button
                        class="duplicateAccountButton"
                        data-account-id="${account.id}"
                        title="Account duplizieren"
                    >
                        📄
                    </button>


                    <button
                        class="deleteAccountButton"
                        data-account-id="${account.id}"
                        title="Account löschen"
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
    ACCOUNT AUSWAHL
    =========================================
    */

    document
        .querySelectorAll(
            ".accountCheckbox"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    event => {

                        const id =
                            event.target.dataset
                                .accountId;


                        if(
                            event.target.checked
                        ) {

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
    BALANCE MANUELL ÄNDERN
    =========================================
    */

    document
        .querySelectorAll(
            ".editBalanceButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .accountId;


                        const account =
                            getAccount(id);


                        if(!account) {

                            return;

                        }


                        const input =
                            prompt(
                                `Aktuelle Balance für "${account.accountName}":`,
                                Number(
                                    account.balance
                                ).toFixed(2)
                            );


                        if(input === null) {

                            return;

                        }


                        const newBalance =
                            Number(
                                String(input)
                                    .replace(
                                        ",",
                                        "."
                                    )
                            );


                        if(
                            !Number.isFinite(
                                newBalance
                            )
                        ) {

                            alert(
                                "Bitte eine gültige Balance eingeben."
                            );

                            return;

                        }


                        account.balance =
                            newBalance;


                        account.balanceUpdatedAt =
                            new Date()
                                .toISOString();


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
    ACCOUNT NAME BEARBEITEN
    =========================================
    */

    document
        .querySelectorAll(
            ".editAccountButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .accountId;


                        const account =
                            getAccount(id);


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
    DUPLIZIEREN
    =========================================
    */

    document
        .querySelectorAll(
            ".duplicateAccountButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const copy =
                            duplicateAccount(
                                button.dataset
                                    .accountId
                            );


                        if(!copy) {

                            return;

                        }


                        selectedAccountIds
                            .push(
                                copy.id
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
    LÖSCHEN
    =========================================
    */

    document
        .querySelectorAll(
            ".deleteAccountButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
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
                                        accountId !== id
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
    AUSWAHL ZÄHLEN
    =========================================
    */

    if(selectedAccountCount) {

        selectedAccountCount
            .textContent =

                selectedAccountIds.length +

                " Account(s) ausgewählt";

    }

}

.balance-cell {
    white-space: nowrap;
}

.balance-cell .editBalanceButton {
    margin-left: 6px;
    padding: 3px 6px;
    font-size: 11px;
    opacity: 0.65;
}

.balance-cell .editBalanceButton:hover {
    opacity: 1;
}

.positive-value {
    font-weight: 700;
}

.negative-value {
    font-weight: 700;
}

.account-status {
    display: inline-block;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.account-status-green {
    background: rgba(0, 200, 120, 0.12);
}

.account-status-yellow {
    background: rgba(255, 190, 0, 0.12);
}

.account-status-red {
    background: rgba(255, 70, 70, 0.12);
}

.account-actions-cell {
    white-space: nowrap;
}

.account-actions-cell button {
    padding: 5px 7px;
    margin-right: 3px;
}
