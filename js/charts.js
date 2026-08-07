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

let drawdownChartInstance = null;
let hourlyChartInstance = null;


function renderDrawdownChart(selectedAccounts) {

    const canvas =
        document.getElementById(
            "drawdownChart"
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

        if(drawdownChartInstance) {

            drawdownChartInstance.destroy();

            drawdownChartInstance = null;
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
                -point.drawdown
        );


    if(drawdownChartInstance) {

        drawdownChartInstance.destroy();

    }


    drawdownChartInstance =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Drawdown",

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

                                text: "Drawdown USD"

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



function renderHourlyChart(selectedAccounts) {

    const canvas =
        document.getElementById(
            "hourlyChart"
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

        if(hourlyChartInstance) {

            hourlyChartInstance.destroy();

            hourlyChartInstance = null;
        }

        return;
    }


    const analytics =
        calculateAdvancedAnalytics(
            rawTrades
        );


    const hours =
        Object.keys(
            analytics.hourly
        )
        .map(Number)
        .sort(
            (a, b) =>
                a - b
        );


    const labels =
        hours.map(
            hour =>
                hour
                    .toString()
                    .padStart(2, "0")
                + ":00"
        );


    const pnlValues =
        hours.map(
            hour =>
                analytics.hourly[hour].pnl
        );


    if(hourlyChartInstance) {

        hourlyChartInstance.destroy();

    }


    hourlyChartInstance =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "P&L by Hour",

                            data:
                                pnlValues,

                            borderWidth: 1

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            display: false

                        }

                    },


                    scales: {

                        x: {

                            title: {

                                display: true,

                                text: "Entry Hour"

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
