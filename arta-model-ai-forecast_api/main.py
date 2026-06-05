import os
import logging
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from typing import List, Dict, Any
from datetime import date, timedelta
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.preprocessing import MinMaxScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# ==========================================
# 1. CUSTOM LAYER & LOSS FOR TENSORFLOW
# ==========================================
@tf.keras.utils.register_keras_serializable()
class FinancialNormalizationLayer(keras.layers.Layer):
    def __init__(self, epsilon: float = 1e-6, **kwargs):
        super().__init__(**kwargs)
        self.epsilon = epsilon

    def build(self, input_shape):
        n_features = input_shape[-1]
        self.gamma = self.add_weight(name="gamma", shape=(n_features,), initializer="ones", trainable=True)
        self.beta = self.add_weight(name="beta", shape=(n_features,), initializer="zeros", trainable=True)
        super().build(input_shape)

    def call(self, x):
        mean, variance = tf.nn.moments(x, axes=[1], keepdims=True)
        return self.gamma * (x - mean) / tf.sqrt(variance + self.epsilon) + self.beta

@tf.keras.utils.register_keras_serializable(package="Custom", name="asymmetric_loss")
def asymmetric_loss(y_true, y_pred):
    error = y_pred - y_true
    penalty = tf.where(error > 0.0, 3.0, 1.0) 
    return tf.reduce_mean(penalty * tf.square(error))

# ==========================================
# 2. PYDANTIC SCHEMAS (SWAGGER COMPLIANT)
# ==========================================
class CashflowRecord(BaseModel):
    date: str = Field(..., example="2026-05-01", description="Tanggal catatan arus kas (YYYY-MM-DD)")
    income: float = Field(..., example=2500000.0, description="Total pemasukan pada hari tersebut")
    expense: float = Field(..., example=1200000.0, description="Total pengeluaran pada hari tersebut")
    net: float = Field(..., example=1300000.0, description="Arus kas bersih (income - expense)")

class ForecastRequest(BaseModel):
    company_id: str = Field(..., example="Arta_Motor_Bandung", description="ID atau Nama UMKM")
    historical_data: List[CashflowRecord] = Field(..., description="Minimal 30 hari data historis arus kas berurutan")

class ForecastPoint(BaseModel):
    date: str = Field(..., example="2026-05-22")
    predicted_net_cashflow: float = Field(..., example=1450000.0)

# ==========================================
# 3. FASTAPI INITIALIZATION
# ==========================================
app = FastAPI(
    title="Arta Cashflow Forecasting API",
    description="Prediksi arus kas bersih (net cashflow) UMKM per sektor menggunakan arsitektur LSTM Deep Learning Zero-Shot.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftar Sektor
SECTORS = ["otomotif", "kuliner", "jasa", "retail"]

# ==========================================
# 4. API ENDPOINTS
# ==========================================

@app.get("/", summary="Health Check & Status API")
def health_check():
    """Mengecek status keaktifan service forecasting Arta."""
    return {
        "status": "Active",
        "service": "Arta Cashflow Forecasting Service",
        "available_sectors": SECTORS
    }

@app.get("/sectors", summary="Daftar Sektor Aktif")
def list_sectors():
    """Mengembalikan daftar sektor UMKM yang model LSTM-nya sudah siap dimuat."""
    return {
        "status": "success",
        "data": {
            "available_sectors": SECTORS,
            "total": len(SECTORS)
        }
    }

@app.post("/forecast/{sector}", summary="Prediksi Arus Kas Bersih (LSTM / Fallback)")
def forecast(sector: str, body: ForecastRequest):
    if sector not in SECTORS:
        raise HTTPException(status_code=404, detail=f"Model untuk sektor '{sector}' tidak ditemukan.")
    
    total_hari = len(body.historical_data)
    last_historical_date = date.fromisoformat(body.historical_data[-1].date)
    forecast_results = []

    # =======================================================
    # PERKONDISIAN COLD START (JIKA DATA < 30 HARI)
    # =======================================================
    if total_hari < 30:
        logger.info(f"Cold Start terdeteksi untuk {body.company_id}. Menggunakan metode Fallback Moving Average.")
        
        net_history = [r.net for r in body.historical_data]
        
        for i in range(1, 8):
            target_date = last_historical_date + timedelta(days=i)
            
            if len(net_history) > 1:
                rata_rata = np.mean(net_history)
                tren = net_history[-1] - net_history[-2]
                pred_simple = rata_rata + (tren * 0.1 * i)
            else:
                pred_simple = net_history[-1] 
                
            forecast_results.append(
                ForecastPoint(
                    date=target_date.isoformat(),
                    predicted_net_cashflow=max(0.0, round(float(pred_simple), 2))
                )
            )
            
        return {
            "status": "success",
            "data": {
                "sector": sector,
                "company_id": body.company_id,
                "method_used": "Statistical Fallback (Moving Average)",
                "window_size_used": total_hari,
                "forecast_steps": 7,
                "last_historical_date": last_historical_date.isoformat(),
                "forecast": forecast_results
            }
        }

    # =======================================================
    # JIKA DATA JALUR NORMAL (>= 30 HARI) -> JALANKAN LSTM ASLI
    # =======================================================
    try:
        # 1. LOAD MODEL
        model_path = os.path.join(MODELS_DIR, f"lstm_{sector}.keras")
        
        if not os.path.exists(model_path):
            raise HTTPException(status_code=500, detail=f"Berkas model untuk sektor {sector} belum siap di server.")
            
        model = tf.keras.models.load_model(model_path, custom_objects={
            'FinancialNormalizationLayer': FinancialNormalizationLayer, 
            'asymmetric_loss': asymmetric_loss
        })

        # 2. PREPROCESSING & ON-THE-FLY SCALING
        recent_data = body.historical_data[-30:]
        input_list = [[r.income, r.expense, r.net] for r in recent_data]
        input_array = np.array(input_list)
        
        # Buat scaler baru KHUSUS untuk 30 hari data request ini
        scaler = MinMaxScaler(feature_range=(0, 1))
        input_scaled = scaler.fit_transform(input_array)
        
        # 3. PREDIKSI (Langsung 7 hari sekaligus, tanpa loop autoregressive)
        # Reshape ke bentuk tensor 3D: (1, 30, 3) -> (Batch, Timesteps, Features)
        ts_tensor = input_scaled.reshape(1, 30, 3)
        
        # Model memuntahkan 7 prediksi berdasarkan arsitektur Dense(forecast_steps)
        pred_scaled = model.predict(ts_tensor, verbose=0)[0] 
        
        # 4. INVERSE TRANSFORM HASIL PREDIKSI
        dummy_array = np.zeros((7, 3))
        dummy_array[:, 2] = pred_scaled  # Tempatkan 7 nilai prediksi di kolom 'net'
        pred_rupiah = scaler.inverse_transform(dummy_array)[:, 2]
        
        # 5. FORMATTING OUTPUT KE JSON
        for i in range(7):
            target_date = last_historical_date + timedelta(days=i+1)
            forecast_results.append(
                ForecastPoint(
                    date=target_date.isoformat(),
                    predicted_net_cashflow=max(0.0, round(float(pred_rupiah[i]), 2)) # Hindari cashflow minus tak wajar
                )
            )
        
        return {
            "status": "success",
            "data": {
                "sector": sector,
                "company_id": body.company_id,
                "method_used": "LSTM Zero-Shot Global Model",
                "window_size_used": 30,
                "forecast_steps": 7,
                "last_historical_date": last_historical_date.isoformat(),
                "forecast": forecast_results
            }
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Format data tidak valid: {str(ve)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during forecasting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan internal pada pemrosesan model LSTM: {str(e)}")