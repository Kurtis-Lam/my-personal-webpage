from PIL import Image, ImageDraw


def convert_to_circle_png(input_path, output_path):
  """Crops any image into a circle with a transparent background

  and saves it as a PNG.
  """
  # 1. Open the image and ensure it has an alpha (transparency) channel
  img = Image.open(input_path).convert("RGBA")
  width, height = img.size

  # 2. Find the minimum dimension to create a centered square crop
  min_dim = min(width, height)
  left = (width - min_dim) / 2
  top = (height - min_dim) / 2
  right = (width + min_dim) / 2
  bottom = (height + min_dim) / 2

  # Crop image to square
  img = img.crop((left, top, right, bottom))

  # 3. Create a grayscale mask for the circular shape (black background, white circle)
  mask = Image.new("L", (min_dim, min_dim), 0)
  draw = ImageDraw.Draw(mask)
  draw.ellipse((0, 0, min_dim, min_dim), fill=255)

  # 4. Apply the circular mask as the alpha channel
  img.putalpha(mask)

  # 5. Save the result as a transparent PNG
  img.save(output_path, "PNG")
  print(f"Success! Circular transparent image saved to: {output_path}")


# --- Example Usage ---
if __name__ == "__main__":
  input_image = "public/assets/e.jpeg"  # Replace with your input image path
  output_image = "out.png"  # Desired output path
  convert_to_circle_png(input_image, output_image)