import os
from PIL import Image, ImageFilter
from rembg import remove

def refine_image(file_path):
    print(f"Refining {file_path}...")
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    # 1. Open original
    try:
        original = Image.open(file_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening image: {e}")
        return
    
    # 2. Extract AI mask (using rembg)
    # Note: rembg remove() returns the image with alpha
    try:
        ai_removed = remove(original)
        ai_alpha = ai_removed.split()[-1] # Extract Alpha channel
    except Exception as e:
        print(f"Error during rembg: {e}")
        return
    
    # 3. Dilate the mask (to avoid aggressive edge cutting)
    # We use a MaxFilter to expand the opaque areas slightly
    dilated_mask = ai_alpha.filter(ImageFilter.MaxFilter(3)) # 3x3 kernel
    
    # 4. Apply the refined mask to the original image
    refined = Image.new("RGBA", original.size, (0, 0, 0, 0))
    refined.paste(original, (0, 0), mask=dilated_mask)
    
    # 5. Save the result
    refined.save(file_path)
    print(f"Successfully refined: {file_path}")

# List of Blood Echo sprites
base_dir = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\enemies\blood_echoes"
files = [
    "blackthorncity/ashen_confessor.png",
    "catacombsoftheoldempire/bone_sovereign.png",
    "crimsonhighlands/blood_ascendant.png",
    "eternalnightcitadel/first_betrayer.png",
    "forgottenhamlet/hollow_witness.png",
    "grimwoodforest/skinwalker_alpha.png"
]

for sub_path in files:
    full_path = os.path.join(base_dir, sub_path.replace("/", os.sep))
    refine_image(full_path)
