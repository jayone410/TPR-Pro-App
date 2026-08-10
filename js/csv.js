/*
=========================================
TPR PRO AI
CSV Parser
=========================================
*/


function parseCSV(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function(e) {

                    try {

                        const text =
                            String(
                                e.target.result || ""
                            );


                        const rows =
                            parseCSVText(
                                text
                            );


                        if(
                            rows.length === 0
                        ) {

                            resolve(
                                []
                            );

                            return;
                        }


                        const headers =
                            rows[0]
                                .map(
                                    header =>
                                        cleanCSVValue(
                                            header
                                        )
                                );


                        const data =
                            rows
                                .slice(1)
                                .filter(
                                    row =>
                                        row.some(
                                            value =>
                                                String(
                                                    value ?? ""
                                                )
                                                    .trim()
                                                    .length > 0
                                        )
                                )
                                .map(
                                    row => {

                                        const obj =
                                            {};


                                        headers.forEach(
                                            (
                                                header,
                                                index
                                            ) => {

                                                obj[
                                                    header
                                                ] =
                                                    cleanCSVValue(
                                                        row[
                                                            index
                                                        ] ??
                                                        ""
                                                    );

                                            }
                                        );


                                        return obj;

                                    }
                                );


                        resolve(
                            data
                        );

                    }
                    catch(error) {

                        console.error(
                            "CSV Parse Fehler:",
                            error
                        );


                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                reject;


            reader.readAsText(
                file
            );

        }
    );

}


/*
=========================================
CSV TEXT PARSEN
Quote-aware
=========================================
*/

function parseCSVText(text) {

    const rows =
        [];


    let row =
        [];


    let value =
        "";


    let insideQuotes =
        false;


    for(
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];


        const nextChar =
            text[
                i + 1
            ];


        /*
        =====================================
        QUOTES
        =====================================
        */

        if(
            char === '"'
        ) {

            /*
            Doppeltes Quote innerhalb
            eines quoted Feldes:

            "" -> "
            */

            if(
                insideQuotes &&
                nextChar === '"'
            ) {

                value +=
                    '"';


                i++;


                continue;

            }


            insideQuotes =
                !insideQuotes;


            continue;

        }


        /*
        =====================================
        KOMMA
        =====================================
        */

        if(
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value
            );


            value =
                "";


            continue;

        }


        /*
        =====================================
        ZEILENUMBRUCH
        =====================================
        */

        if(
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            /*
            Windows CRLF
            */

            if(
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            row.push(
                value
            );


            value =
                "";


            /*
            Nur echte Zeilen speichern
            */

            if(
                row.some(
                    item =>
                        String(
                            item ?? ""
                        )
                            .trim()
                            .length > 0
                )
            ) {

                rows.push(
                    row
                );

            }


            row =
                [];


            continue;

        }


        /*
        =====================================
        NORMALER TEXT
        =====================================
        */

        value +=
            char;

    }


    /*
    Letztes Feld / letzte Zeile
    */

    if(
        value.length > 0 ||
        row.length > 0
    ) {

        row.push(
            value
        );


        if(
            row.some(
                item =>
                    String(
                        item ?? ""
                    )
                        .trim()
                        .length > 0
            )
        ) {

            rows.push(
                row
            );

        }

    }


    return rows;

}


/*
=========================================
CSV VALUE CLEANUP
=========================================
*/

function cleanCSVValue(
    value
) {

    if(
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )
        .trim();

}
