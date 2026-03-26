from PIL import Image
import os

def remove_pure_black(file_path):
    print(f"Processing {file_path}...")
    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            r, g, b, a = item
            # Precise color mask for pure black/very dark regions
            if r < 10 and g < 10 and b < 10:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(file_path, "PNG")
        print(f"Saved {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def process_directory(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith(".png"):
                full_path = os.path.join(root, file)
                remove_pure_black(full_path)

if __name__ == "__main__":
    target_dir = r"c:\Users\lingd\OneDrive\Desktop\Antigravity Projects\combat_system\src\assets\items"
    if os.path.exists(target_dir):
        process_directory(target_dir)
    else:
        print(f"Directory not found: {target_dir}")
