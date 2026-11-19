
import requests


CROSSREF_API_URL = "https://api.crossref.org/works"


def search_crossref(title, start_year, end_year, rows=20):
    """
    Search Crossref for scholarly publications
    matching a research title and publication year range.
    """

    params = {
        "query.title": title,
        "filter": (
            f"from-pub-date:{start_year},"
            f"until-pub-date:{end_year}"
        ),
        "rows": rows,
        "select": (
            "title,author,published,published-print,"
            "published-online,issued,abstract,URL,DOI,"
            "container-title,type"
        ),
    }

    headers = {
        "User-Agent": "RRLFinder/1.0 (mailto:richardculata319@gmail.com)"
    }

    response = requests.get(
        CROSSREF_API_URL,
        params=params,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()
    items = data.get("message", {}).get("items", [])

    results = []

    for item in items:

        # Extract publication title
        titles = item.get("title", [])
        publication_title = (
            titles[0] if titles else "Title unavailable"
        )

        # Extract authors
        authors = []

        for author in item.get("author", []):
            given = author.get("given", "")
            family = author.get("family", "")

            full_name = f"{given} {family}".strip()

            if full_name:
                authors.append(full_name)

        # Find publication year
        year = None

        for date_field in (
            "published",
            "published-print",
            "published-online",
            "issued"
        ):
            date_parts = (
                item.get(date_field, {})
                .get("date-parts", [])
            )

            if date_parts and date_parts[0]:
                year = date_parts[0][0]
                break

        # Extract DOI and source link
        doi = item.get("DOI", "")

        url = item.get("URL", "")

        if doi:
            url = f"https://doi.org/{doi}"

        # Extract journal or publication name
        container_titles = item.get("container-title", [])

        journal = (
            container_titles[0]
            if container_titles
            else "Publication name unavailable"
        )

        results.append({
            "title": publication_title,
            "authors": authors,
            "year": year,
            "abstract": item.get("abstract", ""),
            "journal": journal,
            "doi": doi,
            "url": url,
            "type": item.get("type", "unknown")
        })

    return results
