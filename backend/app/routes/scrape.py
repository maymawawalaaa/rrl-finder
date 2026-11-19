
import requests

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl

from app.services.scraper import scrape_website

router = APIRouter()


class ScrapeRequest(BaseModel):
    website_url: HttpUrl
    keyword: str = Field(default="", max_length=500)
    max_results: int = Field(default=10, ge=1, le=30)


@router.post("/scrape")
def scrape_website_endpoint(data: ScrapeRequest):
    try:
        results = scrape_website(
            url=str(data.website_url),
            keyword=data.keyword,
            max_results=data.max_results
        )

        return {
            "status": "success",
            "website": str(data.website_url),
            "results": results
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except requests.Timeout:
        raise HTTPException(
            status_code=504,
            detail="The website took too long to respond."
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve the website."
        )
