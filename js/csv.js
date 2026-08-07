/*
=========================================
TPR PRO AI
CSV Import Engine
=========================================
*/


function parseCSV(file){


    return new Promise((resolve, reject)=>{


        const reader = new FileReader();



        reader.onload = function(e){


            const text = e.target.result;


            const rows = text
                .split("\n")
                .map(row => row.trim())
                .filter(row => row.length);



            const headers =
                rows[0]
                .split(",");



            const data = rows
                .slice(1)
                .map(row => {


                    const values =
                        row.split(",");


                    let obj = {};


                    headers.forEach((header,index)=>{

                        obj[header.trim()] =
                        values[index]?.trim();

                    });


                    return obj;


                });



            resolve(data);


        };



        reader.onerror = reject;


        reader.readAsText(file);


    });


}
