import os
from PIL import Image, ImageFilter
from rembg import remove

def refine_image_strict(file_path):
    print(f"Refining strictly {file_path}...")
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
    try:
        ai_removed = remove(original)
        ai_alpha = ai_removed.split()[-1] # Extract Alpha channel
    except Exception as e:
        print(f"Error during rembg: {e}")
        return
    
    # 3. Erode the mask (to remove white fringe)
    # We use a MinFilter to shrink the opaque areas slightly
    eroded_mask = ai_alpha.filter(ImageFilter.MinFilter(3)) # 3x3 kernel for 1px erosion
    
    # 4. Apply the refined mask to the original image
    refined = Image.new("RGBA", original.size, (0, 0, 0, 0))
    refined.paste(original, (0, 0), mask=eroded_mask)
    
    # 5. Save the result
    refined.save(file_path)
    print(f"Successfully refined (strict): {file_path}")

target = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\enemies\blood_echoes\grimwoodforest\skinwalker_alpha.png"
refine_image_strict(target)
