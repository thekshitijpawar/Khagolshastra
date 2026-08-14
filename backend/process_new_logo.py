import os
from PIL import Image

src_path = r"C:\Users\thece\.gemini\antigravity\brain\d3bb047c-fb88-431f-a0fa-8ec6520cf016\.user_uploaded\media_1786725337867.png"
if not os.path.exists(src_path):
    src_path = r"C:\Users\thece\.gemini\antigravity\brain\d3bb047c-fb88-431f-a0fa-8ec6520cf016\.user_uploaded\media_1786724850835.png"

img = Image.open(src_path).convert("RGBA")
print(f"Original size: {img.size}")

# Process transparency: make pure white / near-white background transparent
datas = img.getdata()
new_data = []

for item in datas:
    # item is (r, g, b, a)
    # Check if pixel is white / light off-white (background)
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0)) # transparent
    else:
        new_data.append(item)

img.putdata(new_data)

# Crop transparent borders to tight bounding box
bbox = img.getbbox()
if bbox:
    cropped = img.crop(bbox)
    print(f"Cropped size: {cropped.size}")
else:
    cropped = img

# Save to public directory
dst1 = "frontend/public/khagolshastra-mascot.png"
dst2 = "frontend/public/khagolshastra-logo-tight.png"
cropped.save(dst1, "PNG")
cropped.save(dst2, "PNG")
print(f"Saved successfully to {dst1} and {dst2}")
