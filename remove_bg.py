import os
from PIL import Image

icons_dir = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\assets\icons"
icon_files = ["blood_shard.png", "grave_steel.png", "cursed_ichor.png", "stabilized_ichor.png"]

def remove_background(file_path):
    print(f"Processing: {file_path}")
    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # Check if the pixel is "near black"
        # Using a threshold to catch compression noise in the background
        if item[0] < 20 and item[1] < 20 and item[2] < 20:
            new_data.append((0, 0, 0, 0)) # Fully transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(file_path, "PNG")
    print(f"Saved: {file_path}")

for icon in icon_files:
    full_path = os.path.join(icons_dir, icon)
    if os.path.exists(full_path):
        remove_background(full_path)
    else:
        print(f"Not found: {full_path}")
