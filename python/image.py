from PIL import Image
import os

base_directory = "./flags"
new_size = (25, 25) 

for country_dir in os.listdir(base_directory):
    country_path = os.path.join(base_directory, country_dir)
    if os.path.isdir(country_path):
        for filename in os.listdir(country_path):
            if filename.endswith(".png"):
                img = Image.open(os.path.join(country_path, filename))
                img_resized = img.resize(new_size, Image.ANTIALIAS)
                base_filename, _ = os.path.splitext(filename)
                img_resized.save(os.path.join(country_path, f"{base_filename}_small.png"))
                
# def remove_small_images(base_directory):
#     for country_dir in os.listdir(base_directory):
#         country_path = os.path.join(base_directory, country_dir)
#         if os.path.isdir(country_path):
#             for filename in os.listdir(country_path):
#                 if filename.endswith("_small.png"):
#                     os.remove(os.path.join(country_path, filename))

# # Call the function
# base_directory = "./flags"
# remove_small_images(base_directory)