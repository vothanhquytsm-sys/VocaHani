import urllib.request
import json
import os
import zipfile

api_url = "https://api.github.com/repos/redphx/tudien/releases/latest"
headers = {"User-Agent": "Mozilla/5.0"}

print("Querying latest release from GitHub API...")
req = urllib.request.Request(api_url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        release_data = json.loads(response.read().decode())
    
    tag_name = release_data.get("tag_name")
    print(f"Latest release tag: {tag_name}")
    
    stardict_asset = None
    for asset in release_data.get("assets", []):
        name = asset.get("name")
        if "stardict" in name.lower() and name.endswith(".zip"):
            stardict_asset = asset
            break
            
    if not stardict_asset:
        print("StarDict zip asset not found in latest release! Assets found:")
        for asset in release_data.get("assets", []):
            print(f" - {asset.get('name')}")
    else:
        download_url = stardict_asset.get("browser_download_url")
        file_name = stardict_asset.get("name")
        print(f"Found StarDict asset: {file_name}")
        print(f"Download URL: {download_url}")
        
        # Download the file
        print(f"Downloading {file_name}...")
        urllib.request.urlretrieve(download_url, file_name)
        print("Download complete.")
        
        # Extract the zip file
        print(f"Extracting {file_name}...")
        with zipfile.ZipFile(file_name, 'r') as zip_ref:
            zip_ref.extractall("tudien_extracted")
        print("Extraction complete. Extracted files:")
        for root, dirs, files in os.walk("tudien_extracted"):
            for f in files:
                print(f" - {os.path.join(root, f)}")
                
except Exception as e:
    print(f"An error occurred: {e}")
