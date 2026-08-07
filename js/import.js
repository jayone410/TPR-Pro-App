function initCsvImport() {

    const importCsvButton =
        document.getElementById(
            "importCsvButton"
        );

    const csvFile =
        document.getElementById(
            "csvFile"
        );

    const csvStatus =
        document.getElementById(
            "csvStatus"
        );


    if(!importCsvButton || !csvFile) {
        return;
    }


    importCsvButton.addEventListener(
        "click",
        () => {

            if(
                selectedAccountIds.length !== 1
            ) {

                alert(
                    "Bitte genau einen Account auswählen."
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


            const accountId =
                selectedAccountIds[0];


            const account =
                getAccount(accountId);


            try {

                const trades =
                    await parseCSV(file);


                const result =
                    importTradesToAccount(
                        accountId,
                        trades
                    );


                if(csvStatus) {

                    csvStatus.innerHTML = `

                        <strong>
                            ${account.accountName}
                        </strong>

                        <br>

                        Datei:
                        ${file.name}

                        <br><br>

                        Neue Trades:
                        <strong>
                            ${result.added}
                        </strong>

                        <br>

                        Duplikate:
                        <strong>
                            ${result.duplicates}
                        </strong>

                        <br>

                        Gesamt:
                        <br><br>

                        Trading P&L:
                        <strong>
                            ${formatMoney(
                                result.tradingPnL
                            )}
                        </strong>
                        
                        <br>
                        
                        Aktuelle Balance:
                        <strong>
                            ${formatMoney(
                                result.balance
                            )}
                        </strong>
                        <strong>
                            ${result.total}
                        </strong>
                    `;
                }


                renderAccounts();
                renderPortfolio();

            }
            catch(error) {

                console.error(
                    "CSV IMPORT ERROR:",
                    error
                );


                if(csvStatus) {

                    csvStatus.innerHTML =
                        "❌ " +
                        error.message;
                }
            }
            finally {

                csvFile.value = "";

            }
        }
    );
}
