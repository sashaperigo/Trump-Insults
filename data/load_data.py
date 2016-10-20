import collections
import csv
import json

insults_file = open("insults.csv", "r")
lookup_file = open("lookup_table.txt", "r")
csv_out = open("gendered_insults.csv", "w")

writer = csv.writer(csv_out)
insults_reader = csv.reader(insults_file)
writer.writerow(["name", "gender", "slug", "quotes_vec", "tweet",
                 "tweet_link", "people_mentioned", "date"])


def find_in_lookup_table(slug):
    reader = csv.reader(lookup_file, delimiter="\t")
    found = None
    for row in reader:
        if slug == row[0]:
            found = row
    # Rewinds the file pointer so we can search in the file again.
    lookup_file.seek(0)
    return found


for row in insults_reader:
    lookup_row = find_in_lookup_table(row[0])
    if not lookup_row:
        continue
    if lookup_row[6] not in ["man", "woman"]:
        continue
    writer.writerow([lookup_row[1], lookup_row[6]] + row)

insults_file.close()
lookup_file.close()
csv_out.close()

csv_out = open("gendered_insults.csv", "r")
json_out = open("gendered_insults.json", "w")
reader = csv.reader(csv_out)

counts = collections.defaultdict(int)
genders = {}
for row in reader:
    counts[row[0]] += 1
    genders[row[0]] = row[1]

print(counts)

data = []
for name in counts.keys():
    entry = {"name": name, "gender": genders[name], "count": counts[name]}
    data.append(entry)

print(data)

json.dump(data, json_out)

csv_out.close()
json_out.close()
