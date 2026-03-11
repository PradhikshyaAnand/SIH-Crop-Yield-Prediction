import requests

# API URL
url = "http://127.0.0.1:8003/recommend"

# Example input values
payload = {
    "soil": "Loamy",
    "season": "Kharif",
    "previous_crop": "Paddy"
}

# Send POST request
response = requests.post(url, params=payload)  # Use params for query parameters

# Print recommended crop
print(response.json())
