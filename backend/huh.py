
import requests
resp = requests.post('http://localhost:4001/api/update-realtime')
print(resp.json())