let dashboard = null;
let trendChart = null;
let analyticsChart = null;
let productChart = null;
let weekdayChart = null;
let monthlyChart = null;
let errorChart = null;
let eventChart = null;
let priceChart = null;
let dataRows = [];

const pages = {
    overview: "Demand Forecasting System",
    dashboard: "Demand & Inventory Insights",
    prediction: "Future Demand Prediction",
    model: "Machine Learning Models",
    dataset: "Dataset Explorer",
    reports: "Project Reports",
    about: "End-to-End System"
};

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
});

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(page).classList.add("active");
    document.querySelector(`[data-page="${page}"]`)?.classList.add("active");
    document.getElementById("page-title").textContent = pages[page] || "Demand Forecasting System";
    if (page === "dashboard" && !analyticsChart) renderAnalytics();
    if (page === "dataset" && dataRows.length === 0) loadDataset();
}

async function loadDashboard() {
    const res = await fetch("/api/dashboard");
    dashboard = await res.json();

    document.getElementById("total-demand").textContent = formatNumber(dashboard.total_demand);
    document.getElementById("total-predicted").textContent = formatNumber(dashboard.total_predicted);
    document.getElementById("product-count").textContent = dashboard.products;

    const cfg = lineConfig(dashboard.trend);
    trendChart = new Chart(document.getElementById("overviewTrend"), cfg);
}

async function loadProducts() {
    const res = await fetch("/api/products");
    const products = await res.json();
    const select = document.getElementById("product");
    select.innerHTML = "";
    products.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.name} (${p.id})`;
        select.appendChild(option);
    });
}

function lineConfig(trend) {
    return {
        type: "line",

        data: {
            labels: trend.labels,

            datasets: [
                {
                    label: "Actual Demand",
                    data: trend.actual,
                    borderColor: "#3559e0",
                    backgroundColor: "rgba(53, 89, 224, 0.08)",
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.25,
                    fill: false,
                    spanGaps: true
                },
                {
                    label: "Predicted Demand",
                    data: trend.predicted,
                    borderColor: "#ef476f",
                    backgroundColor: "rgba(239, 71, 111, 0.08)",
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.25,
                    fill: false,
                    spanGaps: true
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 18
                    }
                },

                tooltip: {
                    enabled: true
                }
            },

            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date"
                    },

                    ticks: {
                        maxTicksLimit: 7,
                        maxRotation: 0,
                        minRotation: 0
                    },

                    grid: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "Demand (units)"
                    }
                }
            }
        }
    };
}

function renderAnalytics() {

    if (!dashboard) {
        console.error("Dashboard data has not loaded yet.");
        return;
    }

    // Prevent duplicate charts when opening Analytics again
    [
        analyticsChart,
        productChart,
        weekdayChart,
        monthlyChart,
        errorChart,
        eventChart,
        priceChart
    ].forEach(chart => {
        if (chart) chart.destroy();
    });

    // Load project data
    fetch("/api/data")
        .then(res => {
            if (!res.ok) {
                throw new Error("Unable to load analytics data.");
            }
            return res.json();
        })
        .then(rows => {

            dataRows = rows;

            if (!rows.length) {
                console.error("No analytics data was returned.");
                return;
            }

            // Helper: safely convert numbers
            const number = value => {
                const result = Number(value);
                return Number.isFinite(result) ? result : 0;
            };

            // Helper: create chart with common settings
            function createChart(id, type, labels, datasets, extraOptions = {}) {

                const canvas = document.getElementById(id);

                if (!canvas) {
                    console.warn("Chart canvas not found:", id);
                    return null;
                }

                return new Chart(canvas, {
                    type: type,

                    data: {
                        labels: labels,
                        datasets: datasets
                    },

                    options: {
                        responsive: true,
                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                position: "top",
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8
                                }
                            },

                            tooltip: {
                                enabled: true
                            }
                        },

                        ...extraOptions
                    }
                });
            }

            // ==================================
            // 1. ACTUAL VS PREDICTED DEMAND
            // ==================================

            analyticsChart = createChart(
                "analyticsTrend",
                "line",
                dashboard.trend.labels,
                [
                    {
                        label: "Actual Demand",
                        data: dashboard.trend.actual,
                        borderColor: "#3559e0",
                        backgroundColor: "rgba(53,89,224,0.08)",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.25
                    },
                    {
                        label: "Predicted Demand",
                        data: dashboard.trend.predicted,
                        borderColor: "#ef476f",
                        backgroundColor: "rgba(239,71,111,0.08)",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.25
                    }
                ],
                {
                    interaction: {
                        mode: "index",
                        intersect: false
                    },

                    scales: {
                        x: {
                            ticks: {
                                maxTicksLimit: 7,
                                maxRotation: 0
                            },
                            grid: {
                                display: false
                            }
                        },

                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Demand (units)"
                            }
                        }
                    }
                }
            );

            // ==================================
            // 2. PRODUCT DEMAND RANKING
            // ==================================

            productChart = createChart(
                "productChart",
                "bar",
                dashboard.products_chart.labels,
                [
                    {
                        label: "Total Demand",
                        data: dashboard.products_chart.values,
                        backgroundColor: "#6d5dfc",
                        borderRadius: 6
                    }
                ],
                {
                    indexAxis: "y",

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            );

            // ==================================
            // 3. DEMAND BY DAY OF WEEK
            // ==================================

            const weekdays = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ];

            const weekdayTotals = Array(7).fill(0);
            const weekdayCounts = Array(7).fill(0);

            rows.forEach(row => {

                let day = row.day_of_week;

                if (typeof day === "string" && isNaN(Number(day))) {
                    day = weekdays.findIndex(
                        name => name.toLowerCase() === day.toLowerCase()
                    );
                } else {
                    day = number(day);
                }

                // Supports Monday=0 through Sunday=6
                if (day >= 0 && day <= 6) {
                    weekdayTotals[day] += number(row.demand);
                    weekdayCounts[day]++;
                }
            });

            const weekdayAverages = weekdayTotals.map((total, i) =>
                weekdayCounts[i] ? total / weekdayCounts[i] : 0
            );

            weekdayChart = createChart(
                "weekdayChart",
                "bar",
                weekdays,
                [
                    {
                        label: "Average Demand",
                        data: weekdayAverages,
                        backgroundColor: "#55b7e8",
                        borderRadius: 6
                    }
                ],
                {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Average Demand"
                            }
                        }
                    }
                }
            );

            // ==================================
            // 4. MONTHLY DEMAND
            // ==================================

            const monthNames = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];

            const monthlyTotals = Array(12).fill(0);
            const monthlyCounts = Array(12).fill(0);

            rows.forEach(row => {
                const month = number(row.month);

                if (month >= 1 && month <= 12) {
                    monthlyTotals[month - 1] += number(row.demand);
                    monthlyCounts[month - 1]++;
                }
            });

            const monthlyAverages = monthlyTotals.map((total, i) =>
                monthlyCounts[i] ? total / monthlyCounts[i] : 0
            );

            monthlyChart = createChart(
                "monthlyChart",
                "line",
                monthNames,
                [
                    {
                        label: "Average Demand",
                        data: monthlyAverages,
                        borderColor: "#6d5dfc",
                        backgroundColor: "rgba(109,93,252,0.12)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3
                    }
                ],
                {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        },

                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        }
                    }
                }
            );

            // ==================================
            // 5. FORECAST ERROR BY PRODUCT
            // ==================================

            const errors = {};

            rows.forEach(row => {

                const product = row.item_id || row["Product Name"] || "Unknown";

                const actual = number(row.demand);
                const predicted = number(row.Predicted_Demand);

                if (!errors[product]) {
                    errors[product] = {
                        total: 0,
                        count: 0
                    };
                }

                errors[product].total += Math.abs(actual - predicted);
                errors[product].count++;
            });

            const errorEntries = Object.entries(errors)
                .map(([product, value]) => ({
                    product: product,
                    mae: value.count ? value.total / value.count : 0
                }))
                .sort((a, b) => b.mae - a.mae)
                .slice(0, 10);

            errorChart = createChart(
                "errorChart",
                "bar",
                errorEntries.map(item => item.product),
                [
                    {
                        label: "Mean Absolute Error",
                        data: errorEntries.map(item => item.mae),
                        backgroundColor: "#ef476f",
                        borderRadius: 6
                    }
                ],
                {
                    indexAxis: "y",

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            );

            // ==================================
            // 6. EVENT VS REGULAR DAY DEMAND
            // ==================================

            const eventTotals = [0, 0];
            const eventCounts = [0, 0];

            rows.forEach(row => {
                const event = number(row.is_event) > 0 ? 1 : 0;

                eventTotals[event] += number(row.demand);
                eventCounts[event]++;
            });

            const eventAverages = eventTotals.map((total, i) =>
                eventCounts[i] ? total / eventCounts[i] : 0
            );

            eventChart = createChart(
                "eventChart",
                "bar",
                ["Regular Days", "Event Days"],
                [
                    {
                        label: "Average Demand",
                        data: eventAverages,
                        backgroundColor: ["#55b7e8", "#ef9b47"],
                        borderRadius: 6
                    }
                ],
                {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            );

            // ==================================
            // 7. SELLING PRICE VS DEMAND
            // ==================================

            const pricePoints = rows
                .filter(row =>
                    row.sell_price !== null &&
                    row.sell_price !== "" &&
                    row.sell_price !== undefined
                )
                .map(row => ({
                    x: number(row.sell_price),
                    y: number(row.demand)
                }))
                .filter(point =>
                    Number.isFinite(point.x) &&
                    Number.isFinite(point.y)
                );

            priceChart = createChart(
                "priceChart",
                "scatter",
                [],
                [
                    {
                        label: "Product-Day Observations",
                        data: pricePoints,
                        backgroundColor: "rgba(109,93,252,0.55)",
                        pointRadius: 3
                    }
                ],
                {
                    scales: {
                        x: {
                            type: "linear",
                            title: {
                                display: true,
                                text: "Selling Price"
                            }
                        },

                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Demand"
                            }
                        }
                    }
                }
            );

            // ==================================
            // 8. ANALYTICS SUMMARY CARDS
            // ==================================

            const totalActual = rows.reduce(
                (sum, row) => sum + number(row.demand), 0
            );

            const totalPredicted = rows.reduce(
                (sum, row) => sum + number(row.Predicted_Demand), 0
            );

            const totalError = rows.reduce(
                (sum, row) => sum + Math.abs(
                    number(row.demand) - number(row.Predicted_Demand)
                ), 0
            );

            const mae = rows.length ? totalError / rows.length : 0;

            document.getElementById("analytics-actual").textContent =
                formatNumber(totalActual);

            document.getElementById("analytics-predicted").textContent =
                formatNumber(totalPredicted);

            document.getElementById("analytics-mae").textContent =
                formatNumber(mae);

            // ==================================
            // 9. INVENTORY PLANNING INSIGHTS
            // ==================================

            const inventoryBox = document.getElementById("inventoryInsights");

            const productInsights = Object.entries(
                rows.reduce((result, row) => {

                    const product =
                        row.item_id || row["Product Name"] || "Unknown";

                    if (!result[product]) {
                        result[product] = {
                            demand: 0,
                            predicted: 0,
                            error: 0,
                            count: 0
                        };
                    }

                    result[product].demand += number(row.demand);
                    result[product].predicted += number(row.Predicted_Demand);

                    result[product].error += Math.abs(
                        number(row.demand) - number(row.Predicted_Demand)
                    );

                    result[product].count++;

                    return result;

                }, {})
            ).map(([product, values]) => ({
                product,
                averageDemand: values.count ? values.demand / values.count : 0,
                averagePrediction: values.count ? values.predicted / values.count : 0,
                mae: values.count ? values.error / values.count : 0
            }));

            productInsights.sort((a, b) => b.averageDemand - a.averageDemand);

            inventoryBox.innerHTML = productInsights.slice(0, 5).map(item => `
                <div class="inventory-item">
                    <strong>${escapeHtml(item.product)}</strong>

                    <span>
                        Average actual demand:
                        <b class="inventory-value">${formatNumber(item.averageDemand)}</b>
                        units per recorded observation.
                    </span>

                    <br>

                    <span>
                        Average predicted demand:
                        <b class="inventory-value">${formatNumber(item.averagePrediction)}</b>
                    </span>

                    <br>

                    <span>
                        Mean absolute forecast error:
                        <b>${formatNumber(item.mae)}</b>
                    </span>
                </div>
            `).join("");

        })
        .catch(error => {
            console.error("Analytics error:", error);
        });
}

document.getElementById("predictionForm").addEventListener("submit", async e => {
    e.preventDefault();
    const body = {
        product: document.getElementById("product").value,
        date: document.getElementById("date").value,
        price: document.getElementById("price").value,
        event: document.getElementById("event").value,
        lag_1: document.getElementById("lag1").value,
        lag_7: document.getElementById("lag7").value,
        rolling_7: document.getElementById("rolling7").value
    };

    const btn = e.target.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Predicting...";

    try {
        const res = await fetch("/api/predict", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Prediction failed");

        document.getElementById("prediction-placeholder").classList.add("hidden");
        document.getElementById("prediction-output").classList.remove("hidden");
        document.getElementById("prediction-value").textContent = data.prediction;
        document.getElementById("recommendation-value").textContent = `${data.recommendation} units`;
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Predict Future Demand";
    }
});

async function loadDataset() {
    const res = await fetch("/api/data");
    dataRows = await res.json();
    renderTable(dataRows);
}

function renderTable(rows) {
    const head = document.querySelector("#dataTable thead");
    const body = document.querySelector("#dataTable tbody");
    head.innerHTML = ""; body.innerHTML = "";
    if (!rows.length) {
        body.innerHTML = "<tr><td>No data found. Put your CSV in the data folder.</td></tr>";
        return;
    }
    const columns = Object.keys(rows[0]).slice(0, 10);
    head.innerHTML = `<tr>${columns.map(c=>`<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
    rows.forEach(row => {
        body.innerHTML += `<tr>${columns.map(c=>`<td>${escapeHtml(row[c])}</td>`).join("")}</tr>`;
    });
}

document.getElementById("tableSearch").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderTable(dataRows.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q))));
});

function downloadReadme() {
    const readme = `# Demand Forecasting for a Quick-Commerce Store Using Machine Learning

Student: Abrar Khan Afghan
Program: Master of Computer Applications (Data Science)

Pipeline:
Data -> Preprocessing -> Feature Engineering -> ML Models -> Evaluation -> Future Prediction -> Power BI -> Business Insights -> Inventory Decisions

Models:
Linear Regression, Random Forest, XGBoost

XGBoost project metrics:
MAE: 0.910882
RMSE: 1.284785
R2: 0.168350
`;
    const blob = new Blob([readme], {type:"text/markdown"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(a.href);
}

function formatNumber(n) {
    return Number(n || 0).toLocaleString(undefined,{maximumFractionDigits:2});
}
function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[s]));
}

loadDashboard();
loadProducts();
document.getElementById("date").value = new Date().toISOString().slice(0,10);
