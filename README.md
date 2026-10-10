# Demand Forecasting for a Quick-Commerce Store Using Machine Learning

## 1. Project Overview

This project develops a machine-learning-based demand forecasting
web application for a quick-commerce store.

The system uses historical sales data and machine learning to estimate
product demand. It presents demand trends, prediction results, dataset
information, and model-related insights through an interactive web
interface.

The project combines machine learning, data analysis, and business
intelligence to support inventory planning.

## 2. Project Objectives

- Analyze historical product demand.
- Prepare and process sales data.
- Train machine learning models for demand forecasting.
- Compare model performance using evaluation metrics.
- Visualize demand patterns through interactive charts.
- Provide a web interface for exploring demand forecasts.
- Support inventory-planning decisions through analytical insights.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| Flask | Backend web framework |
| HTML | Web page structure |
| CSS | Styling and layout |
| JavaScript | Interactive functionality |
| Pandas | Data processing |
| XGBoost | Demand forecasting model |
| Chart.js | Interactive web charts |
| CSV | Data storage and exchange |
| Power BI | Business intelligence dashboards |
| Jupyter Notebook | Data analysis and model experiments |

## 4. Machine Learning Models

The project experiments with the following regression algorithms:

1. Linear Regression
2. Random Forest
3. XGBoost

The models were compared using three evaluation metrics:

- **MAE:** Mean Absolute Error
- **RMSE:** Root Mean Squared Error
- **R²:** Coefficient of Determination

### Previously Recorded Model Results

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| Linear Regression | 0.890078 | 1.298526 | 0.150466 |
| Random Forest | 0.950579 | 1.325256 | 0.115131 |
| XGBoost | 0.910882 | 1.284785 | 0.168350 |

XGBoost achieved the lowest RMSE and highest R² in the recorded
comparison. Linear Regression achieved the lowest MAE.

These results belong to the earlier model evaluation. They should
not automatically be treated as the performance metrics of a newly
trained web application model.

## 5. Web Application Features

### Overview
Displays key project information and demand trends.

### Analytics
Provides charts for demand patterns, product comparisons, forecast
errors, weekday and monthly analysis, event comparisons, and
price-demand relationships.

### Future Prediction
Provides an interface for exploring future demand predictions.

### ML Model
Presents machine-learning-related information and model results.

### Dataset
Allows users to explore the available dataset.

### Reports
Provides access to project documentation and the IEEE project report.

### About Project
Describes the project and its workflow.

## 6. Project Workflow

The main project workflow is:

1. Load historical sales data.
2. Preprocess and clean the dataset.
3. Integrate calendar and selling-price information.
4. Perform feature engineering.
5. Train machine learning models.
6. Evaluate model performance.
7. Generate demand predictions.
8. Visualize analytical results.
9. Interpret the results for inventory-planning support.

## 7. Folder Structure

```text
demand_forecasting_webapp/
│
├── app.py
├── train_model.py
├── requirements.txt
├── README.md
│
├── data/
│   └── PowerBI_Demand_Forecasting.csv
│
├── model/
│   ├── xgboost_future_model.pkl
│   └── model_meta.json
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── reports/
│       └── Demand_Forecasting_Mini_Project_Report_Updated__001.pdf
│
└── reports/
```

Note: This structure describes the expected project files. The actual
files and folders may differ depending on your local setup.

## 8. Installation and Setup

### Prerequisites

- Python 3.10 or a compatible version supported by the project's
  dependencies.
- Visual Studio Code or another code editor.
- Command Prompt or a terminal.

### Step 1: Open the Project Folder

Open Command Prompt in the project directory:

```text
demand_forecasting_webapp
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

### Step 3: Activate the Environment

On Windows:

```bash
venv\Scripts\activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 5: Check the Dataset

Ensure the required CSV file is available at:

```text
data/PowerBI_Demand_Forecasting.csv
```

Use the actual dataset required by the application.

### Step 6: Train the Web Application Model

```bash
python train_model.py
```

This step trains the web prediction model using the data and
features implemented in the training script.

### Step 7: Start the Web Application

```bash
python app.py
```

### Step 8: Open the Website

Open the local address displayed by Flask. It is normally:

http://127.0.0.1:5000

## 9. Important Notes

- The web application's prediction model is trained using
  `train_model.py`.
- Newly trained model performance should be evaluated separately
  before reporting new metrics.
- The recorded model evaluation results refer to the earlier
  project experiment.
- The current Power BI export represents a limited subset of the
  original data, including five HOBBIES products and one store.
- Forecasts are estimates and should not be treated as guaranteed
  future demand.
- The application is a project prototype and requires further
  validation before operational use.

## 10. Limitations

- The available dashboard dataset represents a limited selection
  of products and stores.
- The recorded R² values are relatively modest.
- Additional data may be required to capture more demand patterns.
- Forecast errors can affect inventory-planning decisions.
- The model does not independently verify current stock levels,
  supplier lead times, or replenishment constraints.

## 11. Future Enhancements

Potential future improvements include:

- Expanding the dataset to additional products and stores.
- Improving feature engineering.
- Performing chronological model validation.
- Comparing additional forecasting algorithms.
- Improving prediction accuracy.
- Adding more advanced analytics and filtering.
- Integrating reliable inventory and supplier information.
- Evaluating forecast errors against business costs.

## 12. Conclusion

This project demonstrates an end-to-end demand forecasting workflow
using machine learning, data processing, and interactive reporting.

The web application provides a convenient interface for exploring
demand information and prediction results. The project also
demonstrates how machine-learning outputs can be presented through
charts and dashboards to support inventory-planning discussions.

Further improvements in data coverage, model validation, and
forecasting performance are necessary before the system can be
considered suitable for operational inventory decisions.

---

**Project:** Demand Forecasting for a Quick-Commerce Store Using
Machine Learning

**Student:** Abrar Khan Afghan

**Program:** Master of Computer Applications (Data Science)

**Academic Year:** 2026–2028

**University:** Alliance University