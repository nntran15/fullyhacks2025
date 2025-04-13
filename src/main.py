import requests
 
# Make a GET request to the TuffySearch API
response = requests.get("https://tuffysearch.com/api/courses?course_id=538057")
 
# Print the response
print(response.json())