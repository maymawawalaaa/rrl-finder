import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def scrape_website(url):
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Invalid website URL")

    response = requests.get(
        url,
        headers={"User-Agent": "Mozilla/5.0 RRLFinder/1.0"},
        timeout=15
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for element in soup(["script", "style", "nav", "footer"]):
        element.decompose()

    return soup.get_text(" ", strip=True)