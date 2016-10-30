import collections
import csv

csv_in = open("gendered_insults.csv", "r")
csv_out = open("people_index.csv", "w")

writer = csv.writer(csv_out)
writer.writerow(["name", "bio", "num_insults", "date_of_first_insult"])

counts = collections.defaultdict(int)
dates = {}

reader = csv.reader(csv_in)
for row in reader:
    if row[0] == "name":
        continue
    name = row[0]
    counts[name] += 1
    tweet_date = row[7]
    if name in dates:
        if tweet_date < dates[name]:
            dates[name] = tweet_date
    else:
        dates[name] = tweet_date

for name in counts:
    writer.writerow([name, None, counts[name], dates[name]])
