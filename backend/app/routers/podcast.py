from fastapi import APIRouter
from typing import List, Optional
import os
import json
import math
from datetime import datetime, timezone

router = APIRouter(prefix="/podcast", tags=["podcast"])

EPISODES_FILE = os.path.join(os.path.dirname(__file__), "..", "astronomycast_episodes.json")

INITIAL_CURATED_EPISODES = [
    {
        "id": "ac-1",
        "ep_number": 1,
        "title": "Ep. 1: The Moon",
        "description": "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon — its origin, geology, tidal effects, and human exploration history.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3",
        "published": "Mon, 18 Dec 2006",
        "duration": "28:15",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-2",
        "ep_number": 2,
        "title": "Ep. 2: Getting Around the Solar System",
        "description": "How spacecraft navigate gravity assists, Hohmann transfer orbits, and propulsion physics to travel across the vast distances of our solar system.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-080414.mp3?dest-id=11189",
        "published": "Wed, 24 Mar 2010",
        "duration": "40:21",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-3",
        "ep_number": 3,
        "title": "Ep. 3: Solar Activity & Space Weather",
        "description": "Exploring sunspots, coronal mass ejections, magnetic reconnection, and how the Sun impacts Earth and satellite constellations.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111107.mp3?dest-id=11189",
        "published": "Tue, 08 Nov 2011",
        "duration": "31:06",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-4",
        "ep_number": 4,
        "title": "Ep. 4: Astrophotography (Pt. 1: The Gear)",
        "description": "What telescopes, mounts, sensors, filters, and guide cameras are needed to capture deep sky objects from your backyard observatory.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111114.mp3?dest-id=11189",
        "published": "Sat, 19 Nov 2011",
        "duration": "28:53",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-5",
        "ep_number": 5,
        "title": "Ep. 5: Astrophotography (Pt. 2: Techniques)",
        "description": "Polar alignment, tracking, exposure times, dark frames, bias frames, and calibration methods to maximize signal-to-noise ratio.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111121.mp3?dest-id=11189",
        "published": "Sun, 27 Nov 2011",
        "duration": "36:34",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    }
]

def get_all_episodes():
    if os.path.exists(EPISODES_FILE):
        try:
            with open(EPISODES_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                if loaded and len(loaded) > 5:
                    existing_numbers = {e.get('ep_number') for e in loaded}
                    combined = [ep for ep in INITIAL_CURATED_EPISODES if ep['ep_number'] not in existing_numbers] + loaded
                    combined.sort(key=lambda x: x.get('ep_number', 0))
                    return combined
        except Exception:
            pass
    return INITIAL_CURATED_EPISODES

# Base anchor date for 2-day rotation: August 18, 2026 UTC
ROTATION_EPOCH = datetime(2026, 8, 18, 0, 0, 0, tzinfo=timezone.utc)

@router.get("/current")
def get_current_podcast():
    """
    Returns the currently active Astronomy Cast episode based on the 2-day period, starting with Episode 1.
    """
    episodes = get_all_episodes()
    if not episodes:
        return INITIAL_CURATED_EPISODES[0]
        
    now = datetime.now(timezone.utc)
    seconds_passed = max(0, (now - ROTATION_EPOCH).total_seconds())
    
    # Rotation period: 2 days = 172,800 seconds
    ROTATION_SECONDS = 2 * 24 * 3600
    
    current_index = int(seconds_passed // ROTATION_SECONDS) % len(episodes)
    current_ep = episodes[current_index].copy()
    current_ep["source_website"] = "https://www.astronomycast.com/"
    
    return current_ep

@router.get("/all")
def list_podcast_episodes(limit: int = 50, offset: int = 0):
    """
    Returns all Astronomy Cast episodes available in the catalogue sequentially.
    """
    episodes = get_all_episodes()
    total = len(episodes)
    paged = episodes[offset : offset + limit]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "episodes": paged,
        "source": "Astronomy Cast (https://www.astronomycast.com/)"
    }
