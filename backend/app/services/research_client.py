import logging
import httpx
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


class ResearchClientError(Exception):
    pass


async def search_arxiv(query: str, max_results: int = 10) -> list[dict]:
    url = "https://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query} AND cat:astro-ph",
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    results = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            import xml.etree.ElementTree as ET
            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
            for entry in root.findall("atom:entry", ns):
                title = entry.findtext("atom:title", default="", namespaces=ns).strip()
                abstract = entry.findtext("atom:summary", default="", namespaces=ns).strip()
                published = entry.findtext("atom:published", default="", namespaces=ns)
                link_el = entry.find("atom:link[@rel='alternate']", ns) or entry.find("atom:link", ns)
                link = link_el.get("href", "") if link_el is not None else ""
                authors = [a.findtext("atom:name", default="", namespaces=ns) for a in entry.findall("atom:author", ns)]
                pdf_link = ""
                for link_el in entry.findall("atom:link", ns):
                    if link_el.get("title") == "pdf":
                        pdf_link = link_el.get("href", "")
                        break
                results.append({
                    "title": title,
                    "authors": authors,
                    "abstract": abstract,
                    "url": link,
                    "pdf_url": pdf_link,
                    "published_date": published,
                    "source": "arxiv",
                })
    except Exception as exc:
        logger.error("arXiv search failed: %s", exc)
        raise ResearchClientError(f"arXiv search failed: {exc}") from exc
    return results


async def search_ads(query: str, max_results: int = 10) -> list[dict]:
    url = "https://api.adsabs.harvard.edu/v1/search/query"
    headers = {"Content-Type": "application/json"}
    if settings.ADS_API_TOKEN:
        headers["Authorization"] = f"Bearer {settings.ADS_API_TOKEN}"
    payload = {
        "q": query,
        "rows": max_results,
        "sort": "date desc",
        "fl": "title,author,abstract,url,pubdate",
    }
    results = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            for doc in data.get("response", {}).get("docs", []):
                results.append({
                    "title": doc.get("title", [""])[0] if doc.get("title") else "",
                    "authors": doc.get("author", []),
                    "abstract": doc.get("abstract", ""),
                    "url": doc.get("url", ""),
                    "pdf_url": "",
                    "published_date": doc.get("pubdate", ""),
                    "source": "nasa_ads",
                })
    except Exception as exc:
        logger.error("NASA ADS search failed: %s", exc)
        raise ResearchClientError(f"NASA ADS search failed: {exc}") from exc
    return results


async def search_doaj(query: str, max_results: int = 10) -> list[dict]:
    url = "https://www.doaj.org/api/v2/search/articles"
    params = {"q": query, "pageSize": max_results}
    results = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            for doc in data.get("results", []):
                biblio = doc.get("bibjson", {})
                title = biblio.get("title", "")
                abstract = biblio.get("abstract", "")
                authors = [a.get("name", "") for a in biblio.get("author", [])]
                link = biblio.get("link", [{}])[0].get("url", "") if biblio.get("link") else ""
                results.append({
                    "title": title,
                    "authors": authors,
                    "abstract": abstract,
                    "url": link,
                    "pdf_url": "",
                    "published_date": biblio.get("year", ""),
                    "source": "doaj",
                })
    except Exception as exc:
        logger.error("DOAJ search failed: %s", exc)
        raise ResearchClientError(f"DOAJ search failed: {exc}") from exc
    return results


async def search_research(query: str, max_results: int = 10) -> list[dict]:
    results = []
    seen_titles = set()
    for fetcher in [search_arxiv, search_ads, search_doaj]:
        try:
            batch = await fetcher(query, max_results=max_results)
            for item in batch:
                if item["title"] and item["title"] not in seen_titles:
                    seen_titles.add(item["title"])
                    results.append(item)
        except ResearchClientError:
            continue
    return results[:max_results]
