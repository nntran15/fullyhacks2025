from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)

@app.route("/api/classes", methods=["GET"])
def get_classes():
    subject = request.args.get("subject")
    term = request.args.get("term")
    file_path = f"./src/csv/{subject}_{term}.csv"

    try:
        df = pd.read_csv(file_path)
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000) 
