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
CACHE_TTL_SECONDS = 60

FALLBACK_WEBB_DATA = {
    "target": "HIP11161B",
    "target_category": "Brown Dwarf / Star",
    "instruments": ["NIRSPEC", "MIRI"],
    "proposal_id": "8140",
    "proposal_title": "Empirically anchoring the physics of silicate clouds using L0- T9 benchmark brown dwarfs",
    "pi_name": "Dr. Zhoujian Zhang",
    "category": "Stars And Stellar Populations",
    "duration": "30m31s",
    "ra": "35.90°",
    "dec": "52.67°",
    "status": "LIVE OBSERVATION",
    "telescope": "James Webb Space Telescope (JWST)",
    "location": "Sun-Earth L2 Lagrange Point (1.5M km)",
}


@router.get("/observatory/webb")
async def get_webb_live() -> Dict[str, Any]:
    now = time.time()
    cache_entry = _CACHE["webb"]

    if cache_entry["data"] and (now - cache_entry["timestamp"]) < CACHE_TTL_SECONDS:
        return cache_entry["data"]

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Khagolshastra/1.0",
            "endpoint": "current",
            "Referer": "https://spacetelescopelive.org/webb",
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get("https://spacetelescopelive.org/api/get/webb", headers=headers)
            if res.status_code == 200:
                raw = res.json()
                data_block = raw.get("data", {})
                proposal = data_block.get("proposal", {})
                targets = data_block.get("targets", [])
                target_obj = targets[0] if targets else {}

                instruments = [inst.get("code") or inst.get("title") for inst in proposal.get("instruments", [])]
                pi = proposal.get("primaryInvestigator", {})
                pi_name = pi.get("formalName") or f"{pi.get('honorific', '')} {pi.get('firstName', '')} {pi.get('lastName', '')}".strip()

                ra_val = target_obj.get("rightAscensionInDegrees") or data_block.get("boreSightRightAscensionInDegrees")
                dec_val = target_obj.get("declinationInDegrees") or data_block.get("boreSightDeclinationInDegrees")

                ra_str = f"{float(ra_val):.2f}°" if ra_val else "N/A"
                dec_str = f"{float(dec_val):.2f}°" if dec_val else "N/A"

                parsed = {
                    "target": target_obj.get("name") or "Deep Sky Target",
                    "target_category": target_obj.get("category") or "Cosmic Field",
                    "instruments": instruments or ["NIRCam"],
                    "proposal_id": proposal.get("proposalID") or "General Observation",
                    "proposal_title": proposal.get("title") or "JWST Cycle Scientific Program",
                    "pi_name": pi_name or "NASA / ESA / CSA Consortium",
                    "category": proposal.get("scientificCategory", {}).get("title") or "Astrophysics",
                    "duration": data_block.get("scheduledDurationInSecondsFormatted") or "In Progress",
                    "ra": ra_str,
                    "dec": dec_str,
                    "start_time": data_block.get("scheduledStartTime"),
                    "end_time": data_block.get("scheduledEndTime"),
                    "status": "LIVE OBSERVATION",
                    "telescope": "James Webb Space Telescope (JWST)",
                    "location": "Sun-Earth L2 Lagrange Point (1.5M km)",
                    "source_url": "https://spacetelescopelive.org/webb",
                }

                _CACHE["webb"] = {"data": parsed, "timestamp": now}
                return parsed

    except Exception as exc:
        logger.warning("Failed fetching live Webb data: %s", exc)

    if cache_entry["data"]:
        return cache_entry["data"]

    return FALLBACK_WEBB_DATA
