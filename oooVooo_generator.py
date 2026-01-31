import qrcode
from PIL import Image

def generate_oooVooo_card(data, skin_path, output_name="final_qr_card.png"):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#50C878", back_color="white").convert("RGBA")
    
    try:
        skin = Image.open(skin_path).convert("RGBA")
    except FileNotFoundError:
        print(f"Hiba: A '{skin_path}' nem található a mappában!")
        return

    size = (1024, 1024)
    skin = skin.resize(size, Image.Resampling.LANCZOS)
    qr_img = qr_img.resize(size, Image.Resampling.LANCZOS)
    
    final_card = Image.alpha_composite(qr_img, skin)
    final_card.save(output_name, "PNG")
    print(f"Siker! A kész kártya elmentve: {output_name}")

# Itt add meg a skin fájlnevedet, ami a mappában van!
generate_oooVooo_card("https://ooovooo.com/marcsika", "skin.png")
