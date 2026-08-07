/*
=========================================
TPR PRO AI
Account Manager
=========================================
*/


let accounts = loadAccounts();


function loadAccounts(){

    const saved =
        localStorage.getItem("tpr_accounts");

    if(saved){

        return JSON.parse(saved);

    }

    return [];

}



function saveAccounts(){

    localStorage.setItem(
        "tpr_accounts",
        JSON.stringify(accounts)
    );

}



function createAccount(
    provider,
    accountType,
    accountName,
    startingBalance
){

    const account = {

        id:
            "TPR-" +
            Date.now(),

        provider,

        accountType,

        accountName,

        startingBalance:
            Number(startingBalance),

        balance:
            Number(startingBalance),

        daysTraded: 0,

        trades: [],

        createdAt:
            new Date().toISOString()

    };


    accounts.push(account);

    saveAccounts();

    return account;

}



function deleteAccount(accountId){

    accounts =
        accounts.filter(
            account =>
            account.id !== accountId
        );

    saveAccounts();

}



function getAccount(accountId){

    return accounts.find(
        account =>
        account.id === accountId
    );

}



function updateAccount(account){

    const index =
        accounts.findIndex(
            item =>
            item.id === account.id
        );


    if(index === -1){

        return;

    }


    accounts[index] = account;

    saveAccounts();

}
