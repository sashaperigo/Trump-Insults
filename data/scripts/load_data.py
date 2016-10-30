import collections
import csv
import json

# insults_file = open("../original_files/insults.csv", "r")
lookup_file = open("../out_file.csv", "r")
# csv_out = open("../gendered_insults.csv", "w")

# writer = csv.writer(csv_out)
# insults_reader = csv.reader(insults_file)
# writer.writerow(["name", "gender", "slug", "quotes_vec", "tweet",
#                  "tweet_link", "people_mentioned", "date"])


# def find_in_lookup_table(slug):
#     reader = csv.reader(lookup_file, delimiter="\t")
#     found = None
#     for row in reader:
#         if slug == row[0]:
#             found = row
#     # Rewinds the file pointer so we can search in the file again.
#     lookup_file.seek(0)
#     return found


# for row in insults_reader:
#     lookup_row = find_in_lookup_table(row[0])
#     if not lookup_row:
#         continue
#     if lookup_row[6] not in ["man", "woman"]:
#         continue
#     writer.writerow([lookup_row[1], lookup_row[6]] + row)

# insults_file.close()
# lookup_file.close()
# csv_out.close()

insults_file = open("../gendered_insults.csv", "r")
json_out = open("../gendered_insults.json", "w")
insults_reader = csv.reader(insults_file)


def get_bio(name):
    reader = csv.reader(lookup_file)
    found = None
    for row in reader:
        print(row[0])
        if name == row[0]:
            found = row

    # Rewinds the file pointer so we can search in the file again.
    lookup_file.seek(0)
    return found[1]


counts = collections.defaultdict(int)
genders = {}
insults_dict = collections.defaultdict(list)
for row in insults_reader:
    counts[row[0]] += 1
    genders[row[0]] = row[1]
    insult = {
        "quotes_vec": row[3],
        "tweet": row[4],
        "url": row[5],
        "date": row[7]
    }
    insults_dict[row[0]].append(insult)

data = []
for name in counts.keys():
    woman = False
    man = False
    if genders[name] == "woman":
        woman = True
    else:
        man = True
    bio = get_bio(name)
    entry = {
        "name": name,
        "bio": bio,
        "woman": woman,
        "man": man,
        "count": counts[name],
        "insults": insults_dict[name]
    }
    data.append(entry)

json.dump(data, json_out)

insults_file.close()
json_out.close()
