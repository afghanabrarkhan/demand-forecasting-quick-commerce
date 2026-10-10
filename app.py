from flask import Flask, render_template, request, jsonify, send_from_directory
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import json

app = Flask(__name__)

BASE = Path(__file__).resolve().parent
DATA_FILE = BASE / "data" / "PowerBI_Demand_Forecasting.csv"
MODEL_FILE = BASE / "model" / "xgboost_future_model.pkl"
META_FILE = BASE / "model" / "model_meta.json"

PROJECT_METRICS = {
    "mae": 0.910882,
    "rmse": 1.284785,
    "r2": 0.168350
}

def load_data():
    if not DATA_FILE.exists():
        return pd.DataFrame()
    try:
        return pd.read_csv(DATA_FILE)
    except Exception:
        return pd.DataFrame()

def load_model():
    if not MODEL_FILE.exists():
        return None, {}
    try:
        model = joblib.load(MODEL_FILE)
        meta = json.loads(META_FILE.read_text()) if META_FILE.exists() else {}
        return model, meta
    except Exception:
        return None, {}

def dashboard_data():
    df = load_data()
    if df.empty:
        return {
            "total_demand": 0,
            "total_predicted": 0,
            "products": 0,
            "avg_demand": 0,
            "trend": {"labels": [], "actual": [], "predicted": []},
            "products_chart": {"labels": [], "values": []}
        }

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    total_demand = float(df["demand"].sum())
    total_predicted = float(df["Predicted_Demand"].sum()) if "Predicted_Demand" in df else 0
    products = int(df["item_id"].nunique()) if "item_id" in df else 0
    avg_demand = float(df["demand"].mean())

    daily = df.groupby("date", as_index=False).agg(
        demand=("demand", "sum"),
        Predicted_Demand=("Predicted_Demand", "sum") if "Predicted_Demand" in df else ("demand", "sum")
    ).sort_values("date")

    product_col = "Product Name" if "Product Name" in df.columns else "item_id"
    products_df = df.groupby(product_col)["demand"].sum().sort_values(ascending=False).head(10)

    return {
        "total_demand": round(total_demand, 2),
        "total_predicted": round(total_predicted, 2),
        "products": products,
        "avg_demand": round(avg_demand, 2),
        "trend": {
            "labels": daily["date"].dt.strftime("%Y-%m-%d").tolist(),
            "actual": daily["demand"].round(3).tolist(),
            "predicted": daily["Predicted_Demand"].round(3).tolist()
        },
        "products_chart": {
            "labels": products_df.index.astype(str).tolist(),
            "values": products_df.round(3).tolist()
        }
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/dashboard")
def api_dashboard():
    return jsonify(dashboard_data())

@app.route("/api/metrics")
def api_metrics():
    return jsonify(PROJECT_METRICS)

@app.route("/api/products")
def api_products():
    df = load_data()

    if df.empty or "item_id" not in df.columns:
        return jsonify([])

    products = []

    for item_id in sorted(df["item_id"].dropna().unique()):
        item_id = str(item_id)

        if item_id == "HOBBIES_1_001":
            name = "Hobbies Product 001"
        elif item_id == "HOBBIES_1_002":
            name = "Hobbies Product 002"
        elif item_id == "HOBBIES_1_003":
            name = "Hobbies Product 003"
        elif item_id == "HOBBIES_1_004":
            name = "Hobbies Product 004"
        elif item_id == "HOBBIES_1_005":
            name = "Hobbies Product 005"
        else:
            name = item_id

        products.append({
            "id": item_id,
            "name": name
        })

    return jsonify(products)

@app.route("/api/data")
def api_data():
    df = load_data()
    if df.empty:
        return jsonify([])
    df = df.head(500).copy()
    df = df.replace({np.nan: None})
    return jsonify(df.to_dict(orient="records"))

@app.route("/api/predict", methods=["POST"])
def predict():
    payload = request.get_json(silent=True) or {}
    product = payload.get("product", "")
    date_value = payload.get("date", "")
    price = float(payload.get("price", 0) or 0)
    event = int(payload.get("event", 0) or 0)
    lag_1 = float(payload.get("lag_1", 0) or 0)
    lag_7 = float(payload.get("lag_7", 0) or 0)
    rolling_7 = float(payload.get("rolling_7", 0) or 0)

    try:
        dt = pd.to_datetime(date_value)
    except Exception:
        return jsonify({"error": "Please enter a valid date."}), 400

    model, meta = load_model()

    if model is None:
        return jsonify({
            "error": "Prediction model is not trained yet. Run train_model.py after placing your Power BI CSV in the data folder."
        }), 400

    item_map = meta.get("item_map", {})
    if product not in item_map:
        return jsonify({"error": "Selected product is not available in the trained model."}), 400

    features = pd.DataFrame([{
        "item_code": item_map[product],
        "sell_price": price,
        "day": dt.day,
        "day_of_week": dt.dayofweek,
        "week": int(dt.isocalendar().week),
        "month": dt.month,
        "quarter": dt.quarter,
        "is_event": event,
        "lag_1": lag_1,
        "lag_7": lag_7,
        "rolling_7": rolling_7
    }])

    prediction = float(model.predict(features)[0])
    prediction = max(0, prediction)

    return jsonify({
        "prediction": round(prediction, 2),
        "recommendation": int(np.ceil(prediction * 1.10)),
        "model": "XGBoost"
    })

@app.route("/report/<path:filename>")
def report(filename):
    return send_from_directory(BASE / "reports", filename)

@app.route("/readme")
def readme():
    readme_path = BASE / "README.md"

    if not readme_path.exists():
        return "README.md file not found in project folder", 404

    content = readme_path.read_text(encoding="utf-8")
    return render_template("readme.html", content=content)

if __name__ == "__main__":
    app.run(debug=True)
