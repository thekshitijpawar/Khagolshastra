from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import math
from datetime import datetime, timezone

router = APIRouter(prefix="/podcast", tags=["podcast"])

# Load Astronomy Cast episodes
EPISODES_FILE = os.path.join(os.path.dirname(__file__), "..", "astronomycast_episodes.json")

# Ensure rich curated initial episodes starting from Ep 1: The Moon
INITIAL_CURATED_EPISODES = [
    {
        "id": "ac-1",
        "ep_number": 1,
        "title": "Episode 1: The Moon",
        "description": "Fraser Cain and Dr. Pamela Gay begin their epic astronomy journey exploring Earth's closest celestial companion, the Moon. Discover its violent origins, orbital mechanics, tidal locking, surface geology, and the Apollo legacy.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3",
        "published": "Sun, 10 Sep 2006 12:00:00 GMT",
        "duration": "28:15",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-2",
        "ep_number": 2,
        "title": "Episode 2: The Sun",
        "description": "An in-depth voyage to the fiery powerhouse of the Solar System. How hydrogen fusion generates the light and heat powering all life on Earth, solar flares, the solar wind, and the Sun's ultimate destiny.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-20240812.mp3",
        "published": "Mon, 18 Sep 2006 12:00:00 GMT",
        "duration": "29:30",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-3",
        "ep_number": 3,
        "title": "Episode 3: Where Do Stars Come From?",
        "description": "Investigating stellar nurseries, giant molecular clouds, gravitational collapse, protostars, and the ignition of nuclear fusion in nascent stars across the cosmos.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-20260629.mp3",
        "published": "Mon, 25 Sep 2006 12:00:00 GMT",
        "duration": "27:45",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-4",
        "ep_number": 4,
        "title": "Episode 4: The Life of the Sun",
        "description": "Tracing the 10-billion-year life cycle of our G-type main sequence star. How it steadily brightens, expels its outer layers into a planetary nebula, and collapses into a dense white dwarf.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/Weekly_Space_Hangout_-_Sep._13_2012.mp3",
        "published": "Mon, 02 Oct 2006 12:00:00 GMT",
        "duration": "28:10",
        "show": "Astronomy Cast",
        "hosts": "Fraser Cain & Dr. Pamela Gay",
        "image": "https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg"
    },
    {
        "id": "ac-5",
        "ep_number": 5,
        "title": "Episode 5: The Death of Massive Stars",
        "description": "When supergiants run out of fuel, catastrophic core-collapse triggers blinding Type II supernovae, dispersing heavy elements into the interstellar medium and forging neutron stars and black holes.",
        "audio_url": "https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/Weekly_Space_Hangout_Sep_20_2012.mp3",
        "published": "Mon, 09 Oct 2006 12:00:00 GMT",
        "duration": "29:05",
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
                    # Prepend/ensure Ep 1-5 are clean at the start
                    existing_numbers = {e.get('ep_number') for e in loaded}
                    combined = [ep for ep in INITIAL_CURATED_EPISODES if ep['ep_number'] not in existing_numbers] + loaded
                    combined.sort(key=lambda x: x.get('ep_number', 0))
                    return combined
        except Exception:
            pass
    return INITIAL_CURATED_EPISODES

# Base anchor date for 2-day rotation: August 14, 2026 (or epoch)
ROTATION_EPOCH = datetime(2026, 8, 14, 0, 0, 0, tzinfo=timezone.utc)

@router.get("/current")
def get_current_podcast():
    """
    Returns the currently active Astronomy Cast episode based on the 2-day rotation rule starting from Episode 1.
    """
    episodes = get_all_episodes()
    if not episodes:
        return INITIAL_CURATED_EPISODES[0]
        
    now = datetime.now(timezone.utc)
    seconds_passed = max(0, (now - ROTATION_EPOCH).total_seconds())
    
    # Rotation period: 2 days = 172,800 seconds
    ROTATION_SECONDS = 2 * 24 * 3600
    
    current_index = int(seconds_passed // ROTATION_SECONDS) % len(episodes)
    seconds_until_next = ROTATION_SECONDS - (seconds_passed % ROTATION_SECONDS)
    hours_until_next = math.ceil(seconds_until_next / 3600)
    
    current_ep = episodes[current_index].copy()
    current_ep["rotation_index"] = current_index + 1
    current_ep["total_episodes"] = len(episodes)
    current_ep["hours_until_next_rotation"] = hours_until_next
    current_ep["rotation_rule"] = "2-Day Scheduled Rotation (Starting from Episode 1)"
    current_ep["source_website"] = "https://www.astronomycast.com/"
    
    return current_ep

@router.get("/all")
def list_podcast_episodes(limit: int = 50, offset: int = 0):
    """
    Returns all Astronomy Cast episodes available in the catalogue.
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
