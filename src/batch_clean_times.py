import csv
import os
import glob
import re

input_folder = './csv'
output_folder = './cleaned_csv'

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Find all CSV files in the input folder
csv_files = glob.glob(os.path.join(input_folder, '*.csv'))

for file_path in csv_files:
    filename = os.path.basename(file_path)
    output_path = os.path.join(output_folder, filename)

    with open(file_path, newline='', encoding='utf-8') as infile, \
         open(output_path, 'w', newline='', encoding='utf-8') as outfile:

        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in reader:
            if 'Time' in row and '-' in row['Time']:
                # Remove spaces around dash
                time_str = row['Time'].replace(' - ', '-')

                # Regex to remove first AM/PM if both times have it (e.g., 10:00AM-10:50AM => 10:00-10:50AM)
                match = re.match(r'(.*?)(AM|PM)-(.*?)(AM|PM)', time_str)
                if match and match.group(2) == match.group(4):
                    time_str = f"{match.group(1)}-{match.group(3)}{match.group(4)}"

                row['Time'] = time_str

            writer.writerow(row)

    print(f"✅ Cleaned: {filename}")

print(f"\n🎉 All cleaned files are saved in '{output_folder}/'")
