/*
=========================================
TPR PRO AI
Charts
=========================================
*/

let equityChartInstance = null;


function renderEquityChart(selectedAccounts) {

    const canvas =
        document.getElementById(
            "equityChart"
        );


    if(!canvas) {
        return;
    }


    const rawTrades =
        selectedAccounts.flatMap(
            account =>
                Array.isArray(account.trades)
                    ? account.trades
                    : []
        );


    if(rawTrades.length === 0) {

        if(equityChartInstance) {

            equityChartInstance.destroy();

            equityChartInstance = null;
        }

        return;
    }


    const analytics =
        calculateAdvancedAnalytics(
            rawTrades
        );


    const curve =
        analytics.equityCurve;


    const labels =
        curve.map(
            (point, index) =>
                index + 1
        );


    const values =
        curve.map(
            point =>
                point.equity
        );


    if(equityChartInstance) {

        equityChartInstance.destroy();

    }


    equityChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Cumulative P&L",

                            data: values,

                            tension: 0.25,

                            pointRadius: 2,

                            borderWidth: 2

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {

                        intersect: false,

                        mode: "index"

                    },


                    plugins: {

                        legend: {

                            display: false

                        }

                    },


                    scales: {

                        x: {

                            title: {

                                display: true,

                                text: "Trade"

                            }

                        },


                        y: {

                            title: {

                                display: true,

                                text: "P&L USD"

                            },

                            ticks: {

                                callback: value =>
                                    "$" + value

                            }

                        }

                    }

                }

            }
        );

}
