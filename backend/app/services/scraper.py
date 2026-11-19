
import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


MAX_PAGE_SIZE = 2 * 1024 * 1024  # 2 MB
MAX_REDIRECTS = 5

HEADERS = {
    "User-Agent": "RRL-Finder/1.0 (educational research project)"
}


def validate_public_url(url):
    """Allow only public HTTP/HTTPS website addresses."""

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only HTTP and HTTPS website URLs are allowed.")

    if not parsed.hostname:
        raise ValueError("Please provide a valid website URL.")

    if parsed.username or parsed.password:
        raise ValueError("URLs containing login credentials are not allowed.")

    hostname = parsed.hostname

    try:
        addresses = [ipaddress.ip_address(hostname)]
    except ValueError:
        try:
            addresses = [
                ipaddress.ip_address(result[4][0])
                for result in socket.getaddrinfo(
                    hostname, None, type=socket.SOCK_STREAM
                )
            ]
        except socket.gaierror:
            raise ValueError("The website address could not be found.")

    if not addresses:
        raise ValueError("The website address could not be found.")

    for address in addresses:
        if not address.is_global:
            raise ValueError("Private or local network addresses are not allowed.")

    return url


def download_page(url):
    """Download a public HTML page with size and redirect limits."""

    current_url = url

    for _ in range(MAX_REDIRECTS + 1):
        validate_public_url(current_url)

        response = requests.get(
            current_url,
            headers=HEADERS,
            timeout=15,
            allow_redirects=False,
            stream=True
        )

        if response.is_redirect or response.is_permanent_redirect:
            location = response.headers.get("Location")
            response.close()

            if not location:
                raise ValueError("The website returned an invalid redirect.")

            current_url = urljoin(current_url, location)
            continue

        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "").lower()

        if "text/html" not in content_type:
            response.close()
            raise ValueError("The provided URL does not contain an HTML page.")

        content_length = response.headers.get("Content-Length")

        if content_length and int(content_length) > MAX_PAGE_SIZE:
            response.close()
            raise ValueError("The webpage is too large to process.")

        content = bytearray()

        try:
            for chunk in response.iter_content(chunk_size=8192):
                content.extend(chunk)

                if len(content) > MAX_PAGE_SIZE:
                    raise ValueError("The webpage is too large to process.")
        finally:
            response.close()

        return bytes(content), current_url

    raise ValueError("The website redirected too many times.")


def scrape_website(url, keyword="", max_results=10):
    """
    Extract the title, description, headings, and relevant text
    from one publicly accessible webpage.
    """

    html, final_url = download_page(url)

    soup = BeautifulSoup(html, "html.parser")

    # Remove elements that usually do not contain article content.
    for element in soup([
        "script", "style", "noscript", "svg",
        "iframe", "nav", "footer", "form"
    ]):
        element.decompose()

    page_title = (
        soup.title.get_text(" ", strip=True)
        if soup.title else "Title unavailable"
    )

    description_tag = soup.find(
        "meta", attrs={"name": "description"}
    )

    description = (
        description_tag.get("content", "").strip()
        if description_tag else ""
    )

    headings = [
        heading.get_text(" ", strip=True)
        for heading in soup.find_all(["h1", "h2", "h3"])
        if heading.get_text(" ", strip=True)
    ]

    paragraphs = [
        paragraph.get_text(" ", strip=True)
        for paragraph in soup.find_all(["p", "li"])
        if len(paragraph.get_text(" ", strip=True)) > 40
    ]

    # Remove duplicate text while preserving order.
    paragraphs = list(dict.fromkeys(paragraphs))

    # Rank paragraphs using simple keyword matching.
    keywords = [
        word.lower()
        for word in keyword.split()
        if len(word) > 2
    ]

    if keywords:
        paragraphs.sort(
            key=lambda paragraph: sum(
                paragraph.lower().count(word)
                for word in keywords
            ),
            reverse=True
        )

    selected_paragraphs = paragraphs[:max_results]

    return {
        "title": page_title,
        "description": description,
        "headings": headings,
        "content": selected_paragraphs,
        "url": final_url,
        "source": "Website"
    }
