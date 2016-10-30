import csv
import json
import urllib
from urllib import parse, request

csv_in = open("people_index.csv", "r")
reader = csv.reader(csv_in)

api_key = "AIzaSyA31b1W0Cv0nRrHZyavCCOxf5DG5F3IIhA"

bios = {}
for row in reader:
    if row[0] == "name":
        continue

    query = row[0]
    service_url = 'https://kgsearch.googleapis.com/v1/entities:search'
    params = {
        'query': query,
        'limit': 10,
        'indent': True,
        'key': api_key,
    }
    url = service_url + '?' + urllib.parse.urlencode(params)
    response = json.loads(urllib.request.urlopen(url).read().decode('utf-8'))
    if len(response['itemListElement']) < 1:
        continue

    knowledge_entry = response['itemListElement'][0]['result']
    if not knowledge_entry.get('detailedDescription'):
        continue
    bios[row[0]] = knowledge_entry['detailedDescription']['articleBody']

csv_in.close()

csv_in = open("people_index.csv", "r")
csv_out = open("people_index_2.csv", "w")

reader = csv.reader(csv_in)
writer = csv.writer(csv_out)

for row in reader:
    if row[0] == "name":
        writer.writerow(row)
    name = row[0]
    if name in bios:
        writer.writerow([row[0], bios[name]] + row[2:])
    else:
        writer.writerow(row)

