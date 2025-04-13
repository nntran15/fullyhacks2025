import pandas as pd

# Read CSV with pandas
df = pd.read_csv('African American Studies_Spring 2025.csv')

# Optional: clean/manipulate dataframe here
# df = df.dropna() or df.columns = ['new', 'col', 'names']

# Save to JSON (Next.js will read this file)
df.to_json('public/data.json', orient='records', indent=2)
