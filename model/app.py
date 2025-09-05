from flask import Flask, request, jsonify
import joblib
import pandas as pd
from geopy.distance import geodesic
import folium
import base64
from io import BytesIO

# Load model
clf = joblib.load("anomaly_detector.pkl")

# Route points (same as training)
route_points = [
    (13.151683283802203, 77.61164598025974),
    (13.152862, 77.607352),
    (13.148552, 77.602985),
    (13.148355, 77.610439)
]

app = Flask(__name__)

@app.route("/")
def home():
    return "Anomaly Detection API running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Expect JSON input
        data = request.get_json()
        lat = float(data["lat"])
        lon = float(data["lon"])
        speed = float(data["speed"])

        # distance from route
        coord = (lat, lon)
        dist_from_route = min([geodesic(coord, rp).meters for rp in route_points])

        # Prepare features
        X = pd.DataFrame([{
            "speed": speed,
            "dist_from_route_m": dist_from_route
        }])

        pred = clf.predict(X)[0]
        status = "Anomaly" if pred == 1 else "Normal"

        # Generate map
        m = folium.Map(location=[lat, lon], zoom_start=16, control_scale=True)
        folium.Marker(
            [lat, lon],
            popup=f"Lat: {lat}, Lon: {lon}, Speed: {speed} km/h, Status: {status}",
            icon=folium.Icon(color="red" if pred==1 else "green")
        ).add_to(m)

        # Save map as HTML string
        map_html = m._repr_html_()

        return jsonify({
            "prediction": int(pred),
            "status": status,
            "dist_from_route_m": dist_from_route,
            "map_html": map_html  # can be embedded in a front-end
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
