"""
Train a fresh XGBoost model for the web application's future-prediction page.

1. Put your actual PowerBI_Demand_Forecasting.csv inside data/
2. Run:
       python train_model.py
3. The trained model will be saved inside model/
"""

from pathlib import Path
import json
import joblib
import pandas as pd
from xgboost import XGBRegressor

BASE = Path(__file__).resolve().parent
DATA_FILE = BASE / "data" / "PowerBI_Demand_Forecasting.csv"
MODEL_FILE = BASE / "model" / "xgboost_future_model.pkl"
META_FILE = BASE / "model" / "model_meta.json"

if not DATA_FILE.exists():
    raise FileNotFoundError(
        "PowerBI_Demand_Forecasting.csv was not found. "
        "Copy your real CSV into the data folder first."
    )

df = pd.read_csv(DATA_FILE)
required = ["date", "item_id", "demand", "sell_price", "is_event"]
missing = [c for c in required if c not in df.columns]
if missing:
    raise ValueError(f"Missing columns: {missing}")

df["date"] = pd.to_datetime(df["date"], errors="coerce")
df = df.dropna(subset=["date"]).sort_values(["item_id", "date"]).copy()

df["sell_price"] = pd.to_numeric(df["sell_price"], errors="coerce")
df["is_event"] = pd.to_numeric(df["is_event"], errors="coerce").fillna(0)
df["demand"] = pd.to_numeric(df["demand"], errors="coerce").fillna(0)

# Build time and historical-demand features.
g = df.groupby("item_id", group_keys=False)
df["lag_1"] = g["demand"].shift(1)
df["lag_7"] = g["demand"].shift(7)
df["rolling_7"] = g["demand"].transform(lambda s: s.shift(1).rolling(7).mean())

df["day"] = df["date"].dt.day
df["day_of_week"] = df["date"].dt.dayofweek
df["week"] = df["date"].dt.isocalendar().week.astype(int)
df["month"] = df["date"].dt.month
df["quarter"] = df["date"].dt.quarter

df = df.dropna(subset=["lag_1", "lag_7", "rolling_7", "sell_price"]).copy()

items = sorted(df["item_id"].astype(str).unique())
item_map = {item: i for i, item in enumerate(items)}
df["item_code"] = df["item_id"].astype(str).map(item_map)

features = [
    "item_code", "sell_price", "day", "day_of_week", "week",
    "month", "quarter", "is_event", "lag_1", "lag_7", "rolling_7"
]

X = df[features]
y = df["demand"]

# Time-ordered split: last 20% is validation data.
split = int(len(df) * 0.80)
X_train, X_test = X.iloc[:split], X.iloc[split:]
y_train, y_test = y.iloc[:split], y.iloc[split:]

model = XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    objective="reg:squarederror",
    random_state=42
)

model.fit(X_train, y_train)

joblib.dump(model, MODEL_FILE)
META_FILE.write_text(json.dumps({
    "item_map": item_map,
    "features": features,
    "training_rows": len(X_train),
    "validation_rows": len(X_test)
}, indent=2))

print("Model trained successfully.")
print(f"Saved: {MODEL_FILE}")
print(f"Products: {len(items)}")
