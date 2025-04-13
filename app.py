from flask import Flask, jsonify, request
import os
import csv
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

DATA_DIR = './src/cleaned_csv/'  # Update with your actual path

@app.route('/api/terms', methods=['GET'])
def get_terms():
    """Get available terms from CSV filenames"""
    terms = set()
    
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.csv'):
            # Extract term from filename (e.g., "Computer Science_Spring 2025.csv")
            parts = filename.split('_')
            if len(parts) > 1:
                term = parts[1].replace('.csv', '')
                terms.add(term)
    
    return jsonify(sorted(list(terms)))

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get available departments from CSV filenames"""
    departments = set()
    
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.csv'):
            # Extract department from filename (e.g., "Computer Science_Spring 2025.csv")
            parts = filename.split('_')
            if len(parts) > 0:
                department = parts[0]
                # Create a department ID (e.g., "Computer Science" -> "COMPSCI")
                dept_id = ''.join(word[0:3].upper() for word in department.split())
                departments.add((dept_id, department))
    
    # Format as list of dictionaries
    formatted_depts = [{"id": dept_id, "name": dept_name} for dept_id, dept_name in departments]
    return jsonify(formatted_depts)

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get classes based on term, subject, and query"""
    term = request.args.get('term', '')
    subject = request.args.get('subject', '')
    query = request.args.get('query', '').lower()
    
    results = []
    
    # Find the appropriate CSV file
    csv_file = None
    if subject:
        csv_file = f"{subject}_{term}.csv"
        if not os.path.exists(os.path.join(DATA_DIR, csv_file)):
            return jsonify([])
    else:
        # Search across all CSVs for the given term
        for filename in os.listdir(DATA_DIR):
            if term in filename and filename.endswith('.csv'):
                csv_file = filename
                break
    
    if not csv_file:
        return jsonify([])
    
    # Read CSV file and filter results
    try:
        with open(os.path.join(DATA_DIR, csv_file), 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # If query is provided, check if it matches the class name
                if query and query not in row.get("Class Name", "").lower():
                    continue
                
                results.append(row)
        
        return jsonify(results)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)