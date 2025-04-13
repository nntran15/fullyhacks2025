import pandas as pd

# Read CSV with pandas
df = pd.read_csv('your_file.csv')

# Optional: clean/manipulate dataframe here
# df = df.dropna() or df.columns = ['new', 'col', 'names']

# Save to JSON (Next.js will read this file)
df.to_json('public/data.json', orient='records', indent=2)
