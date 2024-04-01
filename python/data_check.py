import json

# Load the JSON data
with open('../json/combined_data.json') as f:
    data = json.load(f)

# Iterate over each country
for country, country_data in data.items():
    # Get the set of all parties in the election data
    election_parties = set()
    for year, year_data in country_data['election_data'].items():
        # Check that the vote percentages sum to 100%
        if not (99.5 <= sum(year_data.values()) <= 100.5):
            print(f'Error in {country}, {year}: vote percentages do not sum to 100%')
        # Exclude 'Other parties' from the set of parties
        parties = set(year_data.keys())
        parties.discard('Other parties')
        election_parties.update(parties)

    # Get the set of all parties in the leaning data
    leaning_parties = set()
    for leaning, parties in country_data['leaning_data'].items():
        leaning_parties.update(parties)

    # Check that the sets of parties are the same
    if election_parties != leaning_parties:
        print(f'Error in {country}: mismatch between election parties and leaning parties')
        print('Parties only in election data:', election_parties - leaning_parties)
        print('Parties only in leaning data:', leaning_parties - election_parties)