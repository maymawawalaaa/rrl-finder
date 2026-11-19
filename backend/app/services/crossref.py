import requests

def search_crossref(title, start_year, end_year):
    url = "https://api.crossref.org/works"

    params = {
        "query.title": title,
        "filter": (
            f"from-pub-date:{start_year},"
            f"until-pub-date:{end_year}"
        ),
        "rows": 20,
        "select": "title,author,published,abstract,URL,DOI"
    }

    response = requests.get(
        url,
        params=params,
        headers={
            "User-Agent": "RRLFinder/1.0 (mailto:your-email@example.com)"
        },
        timeout=30
    )

    response.raise_for_status()

    items = response.json()["message"]["items"]

    results = []

    for item in items:
        authors = [
            author.get("family", "")
            for author in item.get("author", [])
        ]

        results.append({
            "title": item.get("title", ["No title"])[0],
            "authors": authors,
            "year": (
                item.get("published", {})
                .get("date-parts", [[None]])[0][0]
            ),
            "abstract": item.get("abstract", ""),
            "url": item.get("URL", ""),
            "doi": item.get("DOI", "")
        })

    return results