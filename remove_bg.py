from PIL import Image
import os
import sys

def remove_background(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Use a small threshold to catch "near-black" pixels if necessary
    for item in data:
        # If pixels are almost black (R,G,B < 10)
        if item[0] < 10 and item[1] < 10 and item[2] < 10:
            new_data.append((0, 0, 0, 0)) # Fully transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output>")
    else:
        remove_background(sys.argv[1], sys.argv[2])
