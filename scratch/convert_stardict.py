import os
import gzip
import shutil
import struct
import sqlite3

extracted_dir = "tudien_extracted"
idx_file = None
dict_dz_file = None

for f in os.listdir(extracted_dir):
    if f.endswith(".idx"):
        idx_file = os.path.join(extracted_dir, f)
    elif f.endswith(".dict.dz"):
        dict_dz_file = os.path.join(extracted_dir, f)

if not idx_file or not dict_dz_file:
    print("Error: Could not locate .idx or .dict.dz files in extracted folder.")
    exit(1)

print(f"Index file: {idx_file}")
print(f"Compressed dict file: {dict_dz_file}")

# Step 1: Decompress .dict.dz to .dict
raw_dict_path = "tudien.dict"
print("Decompressing dict.dz file...")
try:
    with gzip.open(dict_dz_file, "rb") as f_in:
        with open(raw_dict_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)
    print("Decompression complete.")
except Exception as e:
    print(f"Failed to decompress dict.dz: {e}")
    exit(1)

# Step 2: Parse .idx and write to SQLite tudien.db
db_path = "tudien.db"
if os.path.exists(db_path):
    os.remove(db_path)

print("Parsing index and building SQLite database...")
try:
    # Read binary index data
    with open(idx_file, "rb") as f:
        idx_data = f.read()
        
    # Read raw dictionary definitions data
    with open(raw_dict_path, "rb") as f:
        dict_data = f.read()
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE dictionary (word TEXT, definition TEXT)")
    
    idx = 0
    length = len(idx_data)
    entries = []
    
    while idx < length:
        # Find null terminator for word
        end = idx_data.find(b'\0', idx)
        if end == -1:
            break
        word_bytes = idx_data[idx:end]
        word = word_bytes.decode('utf-8', errors='ignore')
        idx = end + 1
        
        # Read 8 bytes: 4 bytes offset, 4 bytes size (big-endian)
        offset, size = struct.unpack(">II", idx_data[idx:idx+8])
        idx += 8
        
        # Extract definition
        def_bytes = dict_data[offset : offset + size]
        definition = def_bytes.decode('utf-8', errors='ignore')
        
        entries.append((word, definition))
        
        if len(entries) >= 5000:
            cursor.executemany("INSERT INTO dictionary VALUES (?, ?)", entries)
            entries = []
            
    if entries:
        cursor.executemany("INSERT INTO dictionary VALUES (?, ?)", entries)
        
    print("Creating index for fast lookups...")
    cursor.execute("CREATE INDEX idx_word ON dictionary(word)")
    conn.commit()
    
    # Query database stats
    cursor.execute("SELECT COUNT(*) FROM dictionary")
    count = cursor.fetchone()[0]
    print(f"Database build succeeded! Total words parsed: {count}")
    
    conn.close()
    
    # Cleanup raw temporary files
    os.remove(raw_dict_path)
    shutil.rmtree(extracted_dir)
    print("Cleaned up temporary files.")
    
except Exception as e:
    print(f"An error occurred during SQLite build: {e}")
    if os.path.exists(raw_dict_path):
        os.remove(raw_dict_path)
