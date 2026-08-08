/*
=========================================
TPR PRO AI
Rules Editor
=========================================
*/


function getEditableRuleFields() {

    return [

        {
            key: "minTradingDays",
            label: "Min Trading Days"
        },

        {
            key: "minWinningDays",
            label: "Min Winning Days"
        },

        {
            key: "winningDayMinProfit",
            label: "Winning Day Min Profit"
        },

        {
            key: "consistencyLimit",
            label: "Consistency Limit %"
        },

        {
            key: "maxLossLimit",
            label: "Maximum Loss Limit"
        },

        {
            key: "dll",
            label: "Daily Loss Limit"
        },

        {
            key: "fixedDLL",
            label: "Fixed DLL"
        },

        {
            key: "scalingDLLPercent",
            label: "DLL Scaling %"
        },

        {
            key: "minPayout",
            label: "Minimum Payout"
        },

        {
            key: "payoutPercent",
            label: "Payout %"
        },

        {
            key: "maxPayout",
            label: "Max Payout"
        },

        {
            key: "maxPayoutFirst",
            label: "Max Payout #1"
        },

        {
            key: "maxPayoutLater",
            label: "Max Payout #2+"
        },

        {
            key: "bufferBalance",
            label: "Buffer Balance"
        },

        {
            key: "payoutProfitGoal",
            label: "Payout Profit Goal"
        }

    ];

}


/*
=========================================
MODAL HTML
=========================================
*/

function ensureRulesEditorModal() {

    let modal =
        document.getElementById(
            "rulesEditorModal"
        );


    if(modal) {
        return modal;
    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "rulesEditorModal";


    modal.className =
        "rules-editor-backdrop";


    modal.style.display =
        "none";


    modal.innerHTML = `

        <div class="rules-editor-modal">

            <div class="rules-editor-header">

                <div>

                    <div class="rules-editor-label">
                        ACCOUNT RULES
                    </div>

                    <h2 id="rulesEditorTitle">
                        Rules
                    </h2>

                </div>

                <button
                    id="closeRulesEditor"
                    class="rules-editor-close"
                >
                    ✕
                </button>

            </div>


            <div id="rulesEditorMeta">

            </div>


            <div
                id="rulesEditorFields"
                class="rules-editor-grid"
            >

            </div>


            <div class="rules-editor-actions">

                <button
                    id="resetRulesButton"
                >
                    Official Defaults
                </button>

                <button
                    id="saveRulesButton"
                >
                    Save Overrides
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    return modal;
}


/*
=========================================
EDITOR ÖFFNEN
=========================================
*/

function openRulesEditor(accountId) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {
        return;
    }


    const officialRules =
        getOfficialRules(
            account.provider,
            account.program,
            account.accountType
        );


    if(!officialRules) {

        alert(
            "Für diesen Account wurden keine offiziellen Regeln gefunden."
        );

        return;
    }


    const effectiveRules =
        getEffectiveRules(
            account
        );


    const modal =
        ensureRulesEditorModal();


    modal.dataset.accountId =
        account.id;


    const title =
        document.getElementById(
            "rulesEditorTitle"
        );


    title.textContent =
        account.accountName;


    const meta =
        document.getElementById(
            "rulesEditorMeta"
        );


    meta.innerHTML = `

        <div class="rules-editor-meta">

            <span>
                ${String(account.provider).toUpperCase()}
            </span>

            <span>
                ${officialRules.programLabel}
            </span>

            <span>
                ${account.accountType}
            </span>

            <span>
                ${officialRules.stage}
            </span>

        </div>

    `;


    const fieldsContainer =
        document.getElementById(
            "rulesEditorFields"
        );


    fieldsContainer.innerHTML =
        "";


    const fields =
        getEditableRuleFields();


    fields.forEach(field => {

        /*
        Nur Regeln anzeigen,
        die im offiziellen Rule Object existieren.
        */

        if(
            officialRules[field.key] ===
            undefined
        ) {
            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "rules-editor-field";


        const effectiveValue =
            effectiveRules[field.key];


        const officialValue =
            officialRules[field.key];


        wrapper.innerHTML = `

            <label>
                ${field.label}
            </label>

            <input
                type="number"
                step="any"
                data-rule-key="${field.key}"
                value="${
                    effectiveValue === null
                        ? ""
                        : effectiveValue
                }"
            >

            <small>
                Official:
                ${
                    officialValue === null
                        ? "None"
                        : officialValue
                }
            </small>

        `;


        fieldsContainer.appendChild(
            wrapper
        );

    });


    modal.style.display =
        "flex";


    const closeButton =
        document.getElementById(
            "closeRulesEditor"
        );


    closeButton.onclick =
        () => {

            modal.style.display =
                "none";

        };


    const saveButton =
        document.getElementById(
            "saveRulesButton"
        );


    saveButton.onclick =
        () => {

            saveRulesOverrides(
                account.id
            );

        };


    const resetButton =
        document.getElementById(
            "resetRulesButton"
        );


    resetButton.onclick =
        () => {

            resetRulesOverrides(
                account.id
            );

        };

}


/*
=========================================
OVERRIDES SPEICHERN
=========================================
*/

function saveRulesOverrides(
    accountId
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {
        return;
    }


    const officialRules =
        getOfficialRules(
            account.provider,
            account.program,
            account.accountType
        );


    if(!officialRules) {
        return;
    }


    const inputs =
        document.querySelectorAll(
            "#rulesEditorFields input[data-rule-key]"
        );


    const overrides =
        {};


    inputs.forEach(input => {

        const key =
            input.dataset.ruleKey;


        const raw =
            input.value.trim();


        if(raw === "") {

            /*
            Leeres Feld = null
            */

            if(
                officialRules[key] !==
                null
            ) {

                overrides[key] =
                    null;

            }

            return;

        }


        const number =
            Number(raw);


        if(
            !Number.isFinite(
                number
            )
        ) {
            return;
        }


        /*
        Nur speichern,
        wenn Wert vom Official Default abweicht.
        */

        if(
            number !==
            Number(
                officialRules[key]
            )
        ) {

            overrides[key] =
                number;

        }

    });


    account.ruleOverrides =
        overrides;


    updateAccount(
        account
    );


    const modal =
        document.getElementById(
            "rulesEditorModal"
        );


    if(modal) {

        modal.style.display =
            "none";

    }


    if(
        typeof refreshAccountUI ===
        "function"
    ) {

        refreshAccountUI();

    }


    console.log(
        "✅ Rule Overrides gespeichert:",
        account.accountName,
        overrides
    );

}


/*
=========================================
OFFICIAL DEFAULTS
=========================================
*/

function resetRulesOverrides(
    accountId
) {

    const account =
        getAccount(
            accountId
        );


    if(!account) {
        return;
    }


    const confirmed =
        confirm(
            "Alle Rule Overrides für diesen Account entfernen?"
        );


    if(!confirmed) {
        return;
    }


    account.ruleOverrides =
        {};


    updateAccount(
        account
    );


    openRulesEditor(
        accountId
    );


    if(
        typeof refreshAccountUI ===
        "function"
    ) {

        refreshAccountUI();

    }

}
