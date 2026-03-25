import os
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove

def refined_remove_bg(file_path):
    print(f"Refining {file_path}...")
    
    # 1. Open original
    original = Image.open(file_path).convert("RGBA")
    
    # 2. Get AI mask (this will be the aggressive one)
    # Note: rembg remove() returns the image with alpha, we can extract the alpha as a mask
    ai_removed = remove(original)
    ai_alpha = ai_removed.split()[-1] # Extract Alpha channel
    
    # 3. Dilate the mask (make it slightly 'fatter' to include the edges)
    # We use a MaxFilter (Dilation) to expand the white (opaque) areas
    dilated_mask = ai_alpha.filter(ImageFilter.MaxFilter(3)) # 3x3 kernel for 1px dilation
    
    # 4. Apply the refined mask to the original image
    # We create a new image and paste the original through the dilated mask
    refined = Image.new("RGBA", original.size, (0, 0, 0, 0))
    refined.paste(original, (0, 0), mask=dilated_mask)
    
    # 5. Save the result
    refined.save(file_path)
    print(f"Refined asset saved: {file_path}")

# Target path
path = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\assets\skills\bloodletting\bloodletting.png"

import shutil
# Restore the original first before re-processing (using the media file I saw earlier)
# I'll use media__1774379672950.png as the source
src = r"C:\Users\lingd\.gemini\antigravity\brain\ec7f8e51-5eaf-487b-9a77-bb40e2c7a05b\media__1774379672950.png"

if os.path.exists(src):
    shutil.copy(src, path)
    refined_remove_bg(path)
else:
    print("Source not found")
