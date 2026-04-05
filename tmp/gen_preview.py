import base64
import re
import os
from PIL import Image
import io

svg_path = r'c:\Users\limkhi-laptop\Desktop\pyanalypt\pyanalypt_frontend\public\logo.svg'
output_path = r'c:\Users\limkhi-laptop\Desktop\pyanalypt\pyanalypt_frontend\public\github-preview.png'

if os.path.exists(svg_path):
    with open(svg_path, 'r') as f:
        svg_content = f.read()
    
    # Simple regex to find the base64 data inside the <image> tag
    match = re.search(r'data:image/png;base64,([^"]+)', svg_content)
    if match:
        b64_data = match.group(1)
        png_bytes = base64.b64decode(b64_data)
        
        # Load the original logo (should be square)
        logo_img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        
        # Create a new white/transparent background of 1280x640
        # Given it's for GitHub, a white background is often safest but let's go with transparent 
        new_img = Image.new("RGBA", (1280, 640), (0, 0, 0, 0))
        
        # Scale the logo up correctly to fit centered in the 640 height
        # Giving it some padding
        logo_size = 500 
        logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Calculate centering position
        x = (1280 - logo_size) // 2
        y = (640 - logo_size) // 2
        
        new_img.paste(logo_img, (x, y), logo_img)
        
        new_img.save(output_path)
        print('GitHub Social Preview generated at 1280x640!')
else:
    print('logo.svg not found!')
