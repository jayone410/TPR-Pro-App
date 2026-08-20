/*
=========================================
TPR PRO AI
Account Manager
=========================================
*/

let selectedAccountIds = [];


/*
=========================================
UI REFRESH
=========================================
*/

function refreshAccountUI() {

    renderAccounts();

    if(
        typeof renderPortfolio ===
        "function"
    ) {
        renderPortfolio();
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
        typeof renderMarketIntelligence ===
        "function"
    ) {
    
        renderMarketIntelligence();
    
    }
}



/*
=========================================
INITIALISIERUNG
=========================================
*/

function initAccountManager() {

    selectedAccountIds =
        loadSelectedAccountIds();


    /*
    Nicht mehr vorhandene Account IDs
    aus gespeicherter Auswahl entfernen.
    */

    selectedAccountIds =
        selectedAccountIds.filter(
            id =>
                accounts.some(
                    account =>
                        account.id === id
                )
        );


    saveSelectedAccountIds(
        selectedAccountIds
    );


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
    =====================================
    ACCOUNT FORMULAR
    =====================================
    */

    if(accountForm) {

        accountForm.style.display =
            "none";

    }


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
    =====================================
    ACCOUNT HINZUFÜGEN
    =====================================
    */

    if(addAccountButton) {

        addAccountButton
            .addEventListener(
                "click",
                () => {

                    const providerElement =
                        document.getElementById(
                            "accountProvider"
                        );

                    const accountProgramElement =
                        document.getElementById(
                            "accountProgram"
                        );

                    const accountTypeElement =
                        document.getElementById(
                            "accountType"
                        );

                    const accountNameElement =
                        document.getElementById(
                            "accountName"
                        );

                    const startingBalanceElement =
                        document.getElementById(
                            "startingBalance"
                        );


                    if(
                        !providerElement ||
                        !accountProgramElement ||
                        !accountTypeElement ||
                        !accountNameElement ||
                        !startingBalanceElement
                    ) {

                        console.error(
                            "Account Formular unvollständig."
                        );

                        alert(
                            "Account Formular unvollständig. Bitte Provider, Programm, Accountgröße, Name und Startbalance prüfen."
                        );

                        return;

                    }


                    const provider =
                        providerElement.value;

                    const program =
                        accountProgramElement.value;

                    const accountType =
                        accountTypeElement.value;

                    const accountName =
                        accountNameElement
                            .value
                            .trim();

                    const startingBalance =
                        startingBalanceElement.value;


                    if(!provider) {

                        alert(
                            "Bitte einen Provider auswählen."
                        );

                        return;

                    }


                    if(!program) {

                        alert(
                            "Bitte ein Account-Programm auswählen."
                        );

                        return;

                    }


                    if(!accountType) {

                        alert(
                            "Bitte eine Accountgröße auswählen."
                        );

                        return;

                    }


                    if(!accountName) {

                        alert(
                            "Bitte einen Account-Namen eingeben."
                        );

                        return;

                    }


                    const account =
                        createAccount(
                            provider,
                            program,
                            accountType,
                            accountName,
                            startingBalance
                        );


                    if(
                        !account ||
                        !account.id
                    ) {

                        console.error(
                            "Account konnte nicht erstellt werden."
                        );

                        return;

                    }


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


                    accountNameElement.value =
                        "";


                    if(accountForm) {

                        accountForm.style.display =
                            "none";

                    }


                    if(toggleAccountFormButton) {

                        toggleAccountFormButton.textContent =
                            "+ Account";

                    }


                    refreshAccountUI();

                }
            );

    }


    /*
    =====================================
    ALLE AUSWÄHLEN
    =====================================
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


                    refreshAccountUI();

                }
            );

    }


    /*
    =====================================
    AUSWAHL LÖSCHEN
    =====================================
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


                    refreshAccountUI();

                }
            );

    }


    /*
    Initialer Aufbau
    */

    refreshAccountUI();

}


/*
=========================================
BUFFER
=========================================
*/

function getAccountBuffer(account) {

    const balance =
        Number(
            account.balance
        );

    const startingBalance =
        Number(
            account.startingBalance
        );


    if(
        !Number.isFinite(balance) ||
        !Number.isFinite(startingBalance)
    ) {

        return 0;

    }


    return (
        balance -
        startingBalance
    );

}


/*
=========================================
PAYOUT STATUS
=========================================
*/

function getAccountPayoutInfo(account) {

    /*
    Evaluation Accounts
    haben keinen Payout.
    */

    if(
        String(
            account.stage || ""
        ).toLowerCase() ===
        "evaluation"
    ) {

        return {

            status:
                "EVAL",

            label:
                "EVAL",

            message:
                "Evaluation Account",

            action:
                ""

        };

    }


    if(
        typeof getEffectiveRules !==
        "function"
    ) {

        return {
            status: "--",
            label: "Keine Rules Engine"
        };

    }


    const rules =
        getEffectiveRules(
            account
        );


    if(!rules) {

        return {
            status: "--",
            label: "Programm wählen"
        };

    }


    if(
        typeof analyzePayout !==
        "function"
    ) {

        return {
            status: "--",
            label: "--"
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
                account.nextPayoutAmount ||
                0

        };


        const payout =
            analyzePayout(
                engineAccount,
                rules
            );


        return {

            status:
                payout.status ||
                "--",

            label:
                payout.status ||
                "--",

            message:
                payout.message ||
                "",

            action:
                payout.action ||
                ""

        };

    }
    catch(error) {

        console.error(
            "Payout konnte nicht berechnet werden:",
            account.accountName,
            error
        );


        return {
            status: "--",
            label: "RULE ERROR"
        };

    }

}


/*
=========================================
ACCOUNT STATUS
=========================================
*/

function getAccountStatus(account) {

    const buffer =
        getAccountBuffer(
            account
        );


    if(
        typeof analyzeAccount !==
        "function"
    ) {

        return {

            level: "yellow",

            icon: "🟡",

            text: "CHECK"

        };

    }


    try {

        const engineAccount = {

            ...account,

            buffer,

            nextPayoutAmount:
                account.nextPayoutAmount ||
                0

        };


        const result =
            analyzeAccount(
                engineAccount
            );


        const recommendation =
            String(
                result.recommendation ||
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

        console.error(
            "Account Status Fehler:",
            account.accountName,
            error
        );


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
ACCOUNT LIFECYCLE
=========================================
*/

function getAccountLifecycleState(
    account
) {

    const status =
        String(
            account?.lifecycleStatus ||
            "active"
        ).toLowerCase();


    if(
        [
            "active",
            "lost",
            "closed",
            "archived"
        ].includes(
            status
        )
    ) {

        return status;

    }


    return "active";

}



function isAccountActive(
    account
) {

    return (
        getAccountLifecycleState(
            account
        ) ===
        "active"
    );

}



function getAccountLifecycleLabel(
    account
) {

    const status =
        getAccountLifecycleState(
            account
        );


    const labels = {

        active:
            "ACTIVE",

        lost:
            "LOST",

        closed:
            "CLOSED",

        archived:
            "ARCHIVED"

    };


    return (
        labels[status] ||
        "ACTIVE"
    );

}



function getAccountLifecycleClass(
    account
) {

    return (
        "account-lifecycle-" +
        getAccountLifecycleState(
            account
        )
    );

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
    =====================================
    KEINE ACCOUNTS
    =====================================
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

    function setAccountLifecycleStatus(
    accountId,
    newStatus
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {

        return false;

    }


    const allowedStatuses = [
        "active",
        "lost",
        "closed",
        "archived"
    ];


    const cleanStatus =
        String(
            newStatus
        ).toLowerCase();


    if(
        !allowedStatuses.includes(
            cleanStatus
        )
    ) {

        return false;

    }


    account.lifecycleStatus =
        cleanStatus;


    account.lifecycleUpdatedAt =
        new Date()
            .toISOString();


    if(
        cleanStatus !==
        "active"
    ) {

        account.closedAt =
            new Date()
                .toISOString();


        /*
        Deaktivierte Accounts auch
        aus der aktiven Auswahl entfernen.
        */

        selectedAccountIds =
            selectedAccountIds.filter(
                id =>
                    id !==
                    account.id
            );


        saveSelectedAccountIds(
            selectedAccountIds
        );

    }
    else {

        account.closedAt =
            null;

    }


    updateAccount(
        account
    );


    refreshAccountUI();


    return true;

}

    /*
    =====================================
    ACCOUNT ZEILEN
    =====================================
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


            const lifecycleState =
                getAccountLifecycleState(
                    account
                );
            
            
            const status =
                lifecycleState ===
                    "active"
            
                    ? getAccountLifecycleStatus(
                        account
                    )
            
                    : {
            
                        level:
                            "lost",
            
                        icon:
                            "●",
            
                        text:
                            getAccountLifecycleLabel(
                                account
                            )
            
                    };


            const balance =
                Number(
                    account.balance
                ) || 0;


            const bufferPrefix =
                buffer > 0
                    ? "+"
                    : buffer < 0
                        ? "-"
                        : "";
            
            
            /*
            =====================================
            PAYOUT BUTTON
            Nur für Funded Accounts
            =====================================
            */
            
            const payoutButtonHtml =
                String(
                    account.stage || ""
                ).toLowerCase() === "funded"
            
                    ? `
                        <button
                            class="payoutAccountButton"
                            data-account-id="${account.id}"
                            title="Payout buchen"
                        >
                            💰
                        </button>
                    `
            
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

                    <button
                        class="account-expand-button"
                        data-account-id="${account.id}"
                    >
                        ▶
                    </button>

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

                        ${balance.toLocaleString(
                            "en-US",
                            {
                                style: "currency",
                                currency: "USD",
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

                        ${bufferPrefix}$${Math.abs(
                            buffer
                        ).toLocaleString(
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

                    ${payoutButtonHtml}

                    <button
                        class="rulesAccountButton"
                        data-account-id="${account.id}"
                        title="Rules bearbeiten"
                    >
                        ⚙️
                    </button>

                    <button
                        class="lifecycleAccountButton"
                        data-account-id="${account.id}"
                        title="Account deaktivieren"
                    >
                        ${
                            getAccountLifecycleStatus(
                                account
                            ) === "active"
                                ? "⏸️"
                                : "▶️"
                        }
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


            const detailsRow =
                document.createElement(
                    "tr"
                );

            row.classList.add(
                getAccountLifecycleClass(
                    account
                )
            );

            detailsRow.id =
                "accountDetails-" +
                account.id;


            detailsRow.style.display =
                "none";


            detailsRow.innerHTML = `

                <td colspan="10">

                    <div class="account-details-container">

                    </div>

                </td>

            `;


            accountList.appendChild(
                detailsRow
            );

        }
    );


    /*
    =====================================
    ACCOUNT AUSWAHL
    =====================================
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
                            event.target
                                .dataset
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


                        refreshAccountUI();

                    }
                );

            }
        );


    /*
    =====================================
    BALANCE ÄNDERN
    =====================================
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


                        const oldBalance =
                            Number(
                                account.balance
                            ) || 0;


                        const input =
                            prompt(
                                `Aktuelle Balance für "${account.accountName}":`,
                                oldBalance.toFixed(2)
                            );


                        if(input === null) {

                            return;

                        }


                        const normalizedInput =
                            String(input)
                                .trim()
                                .replace(
                                    /\s/g,
                                    ""
                                )
                                .replace(
                                    ",",
                                    "."
                                );


                        const newBalance =
                            Number(
                                normalizedInput
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


                        if(
                            newBalance !==
                            oldBalance
                        ) {

                            account.previousBalance =
                                oldBalance;

                        }


                        account.balance =
                            newBalance;


                        account.balanceUpdatedAt =
                            new Date()
                                .toISOString();


                        updateAccount(
                            account
                        );


                        refreshAccountUI();

                    }
                );

            }
        );


    /*
    =====================================
    ACCOUNT NAME ÄNDERN
    =====================================
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


                        const cleanName =
                            newName.trim();


                        if(!cleanName) {

                            alert(
                                "Der Account-Name darf nicht leer sein."
                            );

                            return;

                        }


                        account.accountName =
                            cleanName;


                        updateAccount(
                            account
                        );


                        refreshAccountUI();

                    }
                );

            }
        );


    /*
    =====================================
    DUPLIZIEREN
    =====================================
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


                        refreshAccountUI();

                    }
                );

            }
        );

    /*
=========================================
PAYOUT BUCHEN
=========================================
*/

document
    .querySelectorAll(
        ".payoutAccountButton"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const accountId =
                        button.dataset
                            .accountId;


                    const account =
                        getAccount(
                            accountId
                        );


                    if(!account) {

                        return;

                    }


                    if(
                        String(
                            account.stage || ""
                        ).toLowerCase() !==
                        "funded"
                    ) {

                        alert(
                            "Payouts können nur für Funded Accounts gebucht werden."
                        );

                        return;

                    }


                    /*
                    Betrag
                    */

                    const payoutInfo =
                        typeof getAccountPayoutAvailability ===
                        "function"

                            ? getAccountPayoutAvailability(
                                account
                            )

                            : null;


                    const suggestedAmount =
                        payoutInfo &&
                        Number.isFinite(
                            Number(
                                payoutInfo.available
                            )
                        )

                            ? Number(
                                payoutInfo.available
                            ).toFixed(2)

                            : "";


                    const amountInput =
                        prompt(
                            `Payout-Betrag für "${account.accountName}":`,
                            suggestedAmount
                        );


                    if(
                        amountInput ===
                        null
                    ) {

                        return;

                    }


                    const amount =
                        Number(
                            String(
                                amountInput
                            )
                                .trim()
                                .replace(
                                    /\s/g,
                                    ""
                                )
                                .replace(
                                    "$",
                                    ""
                                )
                                .replace(
                                    ",",
                                    "."
                                )
                        );


                    if(
                        !Number.isFinite(
                            amount
                        ) ||
                        amount <= 0
                    ) {

                        alert(
                            "Bitte einen gültigen Payout-Betrag eingeben."
                        );

                        return;

                    }


                    /*
                    Datum
                    */

                    const today =
                        new Date()
                            .toISOString()
                            .slice(
                                0,
                                10
                            );


                    const dateInput =
                        prompt(
                            "Payout-Datum (YYYY-MM-DD):",
                            today
                        );


                    if(
                        dateInput ===
                        null
                    ) {

                        return;

                    }


                    const payoutDate =
                        String(
                            dateInput
                        ).trim();


                    if(
                        !/^\d{4}-\d{2}-\d{2}$/
                            .test(
                                payoutDate
                            )
                    ) {

                        alert(
                            "Bitte Datum als YYYY-MM-DD eingeben."
                        );

                        return;

                    }


                    /*
                    Zusammenfassung
                    */

                    const confirmed =
                        confirm(
                            `Payout buchen?\n\n` +
                            `Account: ${account.accountName}\n` +
                            `Betrag: $${amount.toFixed(2)}\n` +
                            `Datum: ${payoutDate}`
                        );


                    if(!confirmed) {

                        return;

                    }


                    /*
                    Speichern
                    */

                    const result =
                        addAccountPayout(
                            accountId,
                            amount,
                            payoutDate
                        );


                    if(
                        !result ||
                        result.success !==
                        true
                    ) {

                        alert(
                            result?.message ||
                            "Payout konnte nicht gespeichert werden."
                        );

                        return;

                    }


                    alert(
                        `Payout gespeichert.\n\n` +
                        `Cycle #${result.payout.cycleNumber}\n` +
                        `Betrag: $${amount.toFixed(2)}\n` +
                        `Neuer Cycle Start: ${result.nextCycleStart || "--"}`
                    );


                    refreshAccountUI();

                }
            );

        }
    );


    /*
=====================================
ACCOUNT LIFECYCLE
=====================================
*/

document
    .querySelectorAll(
        ".lifecycleAccountButton"
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


                    const currentStatus =
                        getAccountLifecycleState(
                            account
                        );


                    /*
                    =====================================
                    ACTIVE -> LOST
                    =====================================
                    */

                    if(
                        currentStatus ===
                        "active"
                    ) {

                        const tradeCount =
                            Array.isArray(
                                account.trades
                            )
                                ? account.trades.length
                                : 0;


                        const confirmed =
                            confirm(
                                `Account "${account.accountName}" als LOST markieren?\n\n` +
                                `${tradeCount} gespeicherte Trades bleiben vollständig erhalten.\n\n` +
                                `Der Account wird künftig nicht mehr als aktiver Trading-Account behandelt.`
                            );


                        if(!confirmed) {

                            return;

                        }


                        setAccountLifecycleStatus(
                            id,
                            "lost"
                        );


                        return;

                    }


                    /*
                    =====================================
                    LOST / CLOSED / ARCHIVED -> ACTIVE
                    =====================================
                    */

                    const confirmed =
                        confirm(
                            `Account "${account.accountName}" wieder aktivieren?`
                        );


                    if(!confirmed) {

                        return;

                    }


                    setAccountLifecycleStatus(
                        id,
                        "active"
                    );

                }
            );

        }
    );
    
    /*
    =====================================
    LÖSCHEN
    =====================================
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
                            getAccount(id);


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


                        refreshAccountUI();

                    }
                );

            }
        );


    /*
    =====================================
    RULES EDITOR
    =====================================
    */

    document
        .querySelectorAll(
            ".rulesAccountButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .accountId;


                        if(
                            typeof openRulesEditor ===
                            "function"
                        ) {

                            openRulesEditor(
                                id
                            );

                        }

                    }
                );

            }
        );


    /*
    =====================================
    ACCOUNT DETAILS AUF / ZUKLAPPEN
    =====================================
    */

    document
        .querySelectorAll(
            ".account-expand-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .accountId;


                        if(
                            typeof toggleAccountDetails ===
                            "function"
                        ) {

                            toggleAccountDetails(
                                id
                            );

                        }


                        button.textContent =
                            button.textContent === "▶"
                                ? "▼"
                                : "▶";

                    }
                );

            }
        );


    /*
    =====================================
    AUSWAHL ZÄHLEN
    =====================================
    */

    if(selectedAccountCount) {

        selectedAccountCount.textContent =
            selectedAccountIds.length +
            " Account(s) ausgewählt";

    }

}


/*
=========================================
ACCOUNT LIFECYCLE STATUS
=========================================
*/

function getAccountLifecycleStatus(
    account
) {

    const stage =
        String(
            account.stage || ""
        ).toLowerCase();


    /*
    =====================================
    EVALUATION
    =====================================
    */

    if(
        stage ===
        "evaluation"
    ) {

        return {

            level:
                "evaluation",

            icon:
                "●",

            text:
                "EVALUATION"

        };

    }


    /*
    =====================================
    FUNDED
    =====================================
    */

    if(
        stage ===
        "funded"
    ) {

        let payoutReady =
            false;


        if(
            typeof getAccountPayoutAvailability ===
            "function"
        ) {

            const payout =
                getAccountPayoutAvailability(
                    account
                );


            payoutReady =
                payout &&
                payout.eligible ===
                true;

        }


        if(payoutReady) {

            return {

                level:
                    "funded-ready",

                icon:
                    "●",

                text:
                    "PAYOUT READY"

            };

        }


        return {

            level:
                "funded-building",

            icon:
                "●",

            text:
                "FUNDED"

        };

    }


    /*
    Fallback
    */

    return {

        level:
            "unknown",

        icon:
            "●",

        text:
            "CHECK"

    };

}
