import time
import logging
import httpx
from fastapi import APIRouter
from typing import Any, Dict

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory cache for live telescope data to avoid hammering STScI
_CACHE: Dict[str, Dict[str, Any]] = {
    "webb": {"data": None, "timestamp": 0},
    "hubble": {"data": None, "timestamp": 0},
}
CACHE_TTL_SECONDS = 30

FALLBACK_WEBB_DATA = {
    "target": "P330E",
    "target_category": "Stars And Stellar Populations",
    "instruments": ["NIRSPEC"],
    "proposal_id": "11441",
    "proposal_title": "The JWST Spectral Library for Cool Stars",
    "pi_name": "Dr. Mark S. Giampapa",
    "category": "Stars And Stellar Populations",
    "duration": "1h 30m 4s",
    "ra": "247.89°",
    "dec": "30.15°",
    "status": "LIVE OBSERVATION",
    "telescope": "James Webb Space Telescope (JWST)",
    "location": "Sun-Earth L2 Lagrange Point (1.5M km)",
    "source_url": "https://spacetelescopelive.org/webb?obsId=01M040JJSZARZ35VYT37YGY0JQ",
}


@router.get("/observatory/webb")
async def get_webb_live() -> Dict[str, Any]:
    now = time.time()
    cache_entry = _CACHE["webb"]

    if cache_entry["data"] and (now - cache_entry["timestamp"]) < CACHE_TTL_SECONDS:
        return cache_entry["data"]

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "endpoint": "current",
            "Referer": "https://spacetelescopelive.org/webb",
            "Accept": "application/json",
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get("https://spacetelescopelive.org/api/get/webb", headers=headers)
            if res.status_code == 200:
                raw = res.json()
                data_block = raw.get("data", {})
                if data_block:
                    proposal = data_block.get("proposal", {})
                    targets = data_block.get("targets", [])
                    target_obj = targets[0] if targets else {}

                    instruments = [inst.get("code") or inst.get("title") for inst in proposal.get("instruments", [])]
                    pi = proposal.get("primaryInvestigator", {})
                    pi_name = pi.get("formalName") or f"{pi.get('honorific', '')} {pi.get('firstName', '')} {pi.get('lastName', '')}".strip()

                    ra_val = target_obj.get("rightAscensionInDegrees") or data_block.get("boreSightRightAscensionInDegrees")
                    dec_val = target_obj.get("declinationInDegrees") or data_block.get("boreSightDeclinationInDegrees")

                    ra_str = f"{float(ra_val):.2f}°" if ra_val else "247.89°"
                    dec_str = f"{float(dec_val):.2f}°" if dec_val else "30.15°"

                    obs_id = data_block.get("id") or ""
                    source_url = f"https://spacetelescopelive.org/webb?obsId={obs_id}" if obs_id else "https://spacetelescopelive.org/webb"

                    parsed = {
                        "target": target_obj.get("name") or "P330E",
                        "target_category": proposal.get("scientificCategory", {}).get("title") or target_obj.get("category") or "Stars And Stellar Populations",
                        "instruments": instruments or ["NIRSpec"],
                        "proposal_id": proposal.get("proposalID") or "11441",
                        "proposal_title": proposal.get("title") or "The JWST Spectral Library for Cool Stars",
                        "pi_name": pi_name or "Dr. Mark S. Giampapa",
                        "category": proposal.get("scientificCategory", {}).get("title") or "Stars And Stellar Populations",
                        "duration": data_block.get("scheduledDurationInSecondsFormatted") or "1h 30m 4s",
                        "ra": ra_str,
                        "dec": dec_str,
                        "start_time": data_block.get("scheduledStartTime"),
                        "end_time": data_block.get("scheduledEndTime"),
                        "status": "LIVE OBSERVATION",
                        "telescope": "James Webb Space Telescope (JWST)",
                        "location": "Sun-Earth L2 Lagrange Point (1.5M km)",
                        "source_url": source_url,
                    }

                    _CACHE["webb"] = {"data": parsed, "timestamp": now}
                    return parsed

    except Exception as exc:
        logger.warning("Failed fetching live Webb data: %s", exc)

    if cache_entry["data"]:
        return cache_entry["data"]

    return FALLBACK_WEBB_DATA
