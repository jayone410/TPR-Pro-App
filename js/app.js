document.addEventListener(
"DOMContentLoaded",
()=>{


    let selectedAccountId =
        localStorage.getItem(
            "tpr_selected_account"
        );


    const accountList =
        document.getElementById(
            "accountList"
        );


    const addAccountButton =
        document.getElementById(
            "addAccountButton"
        );



    function renderAccounts(){


        if(accounts.length === 0){

            accountList.innerHTML =
                "Noch keine Accounts angelegt.";

            return;

        }


        accountList.innerHTML = "";


        accounts.forEach(account=>{


            const row =
                document.createElement("div");


            row.className =
                "account-row";


            row.innerHTML = `

                <strong>
                    ${account.accountName}
                </strong>

                <br>

                ${account.provider.toUpperCase()}
                ·
                ${account.accountType}

                <br>

                Balance:
                $${account.balance.toLocaleString()}

                <br><br>

                <button
                    data-account="${account.id}"
                    class="selectAccountButton"
                >
                    Account auswählen
                </button>

                <hr>

            `;


            accountList.appendChild(row);

        });



        document
            .querySelectorAll(
                ".selectAccountButton"
            )
            .forEach(button=>{


                button.addEventListener(
                    "click",
                    ()=>{


                        selectedAccountId =
                            button.dataset.account;


                        localStorage.setItem(
                            "tpr_selected_account",
                            selectedAccountId
                        );


                        renderSelectedAccount();

                    }
                );


            });

    }



    function renderSelectedAccount(){


        if(!selectedAccountId){

            return;

        }


        const account =
            getAccount(
                selectedAccountId
            );


        if(!account){

            return;

        }


        /*
        Temporäre Engine-Werte.
        Später werden diese aus CSV
        und Prop-Regeln berechnet.
        */


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
            .getElementById(
                "recommendation"
            )
            .textContent =
                result.recommendation;



        const reasons =
            document.getElementById(
                "reasons"
            );


        reasons.innerHTML = "";


        result.reasons.forEach(
            reason=>{


                const item =
                    document.createElement(
                        "p"
                    );


                item.textContent =
                    "• " + reason;


                reasons.appendChild(
                    item
                );

            }
        );


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
        ()=>{


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


            if(!accountName){

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


            selectedAccountId =
                account.id;


            localStorage.setItem(
                "tpr_selected_account",
                selectedAccountId
            );


            document.getElementById(
                "accountName"
            ).value = "";


            renderAccounts();

            renderSelectedAccount();

    });



    renderAccounts();

    renderSelectedAccount();

});
