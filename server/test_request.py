import requests

url = "http://127.0.0.1:8001/predict"
files = {"photo": open("test_leaf.jpg", "rb")}  # Ensure image exists

response = requests.post(url, files=files)
print("Status:", response.status_code)
print("Response:", response.json())
