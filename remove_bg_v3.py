from PIL import Image
import os

def remove_pure_black(file_path):
    print(f"Processing {file_path} with precise color mask...")
    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Identify pure black background
    for item in datas:
        r, g, b, a = item
        # Only remove if it's almost pure black to avoid eating edges
        if r < 5 and g < 5 and b < 5:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(file_path, "PNG")
    print(f"Saved {file_path}")

# Target paths
paths = [
    r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\assets\skills\bloodletting\bloodletting.png"
]

# Source image from artifacts (the one on black)
src = r"C:\Users\lingd\.gemini\antigravity\brain\ec7f8e51-5eaf-487b-9a77-bb40e2c7a05b\bloodletting_icon_v8_black_bg_precise_1774380518645.png"
dst = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\assets\skills\bloodletting\bloodletting.png"

import shutil
if os.path.exists(src):
    shutil.copy(src, dst)
    remove_pure_black(dst)
else:
    print(f"Source not found: {src}")
