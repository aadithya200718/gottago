import sys
from PIL import Image

def remove_white_bg(img_path):
    try:
        img = Image.open(img_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is white or nearly white (e.g., > 240, 240, 240)
            if item[0] >= 240 and item[1] >= 240 and item[2] >= 240:
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(img_path, "PNG")
        print(f"Successfully removed white background from {img_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

if __name__ == "__main__":
    import os
    logo_path = os.path.join("d:\\gottago-1-main", "frontend", "public", "logo.png")
    remove_white_bg(logo_path)
