import re
import json
import os

def clean_html(text):
    text = re.sub(r'<[^>]*>', '', text)
    return html_unescape(text.strip())

def html_unescape(text):
    import html
    return html.unescape(text)

# Path to downloaded HTML markdown
file_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/.system_generated/steps/141/content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Topic mapping config
topic_mapping = {
    'đồ dùng học tập': {'vietnamese': 'Đồ dùng học tập', 'level': 'A1', 'symbol': 'pencil.and.ruler.fill'},
    'hành động': {'vietnamese': 'Hành động', 'level': 'A1', 'symbol': 'figure.run'},
    'đời sống thường ngày': {'vietnamese': 'Đời sống thường ngày', 'level': 'A1', 'symbol': 'house.fill'},
    'thường ngày': {'vietnamese': 'Đời sống thường ngày', 'level': 'A1', 'symbol': 'house.fill'},
    'chủ đề biển': {'vietnamese': 'Chủ đề biển', 'level': 'A2', 'symbol': 'water.waves'},
    'biển': {'vietnamese': 'Chủ đề biển', 'level': 'A2', 'symbol': 'water.waves'},
    'số': {'vietnamese': 'Con số & Toán học', 'level': 'A1', 'symbol': 'number'},
    'mua sắm': {'vietnamese': 'Mua sắm', 'level': 'A2', 'symbol': 'cart.fill'},
    'phòng ngủ': {'vietnamese': 'Phòng ngủ', 'level': 'A2', 'symbol': 'bed.double.fill'},
    'tình bạn': {'vietnamese': 'Tình bạn', 'level': 'B1', 'symbol': 'person.2.fill'},
    'nhà bếp': {'vietnamese': 'Nhà bếp & Dụng cụ', 'level': 'A2', 'symbol': 'frying.pan.fill'},
    'trang sức': {'vietnamese': 'Đồ trang sức', 'level': 'B2', 'symbol': 'sparkles'},
    'phòng khách': {'vietnamese': 'Phòng khách', 'level': 'A2', 'symbol': 'chair.lounge.fill'},
    'bệnh viện': {'vietnamese': 'Bệnh viện & Y tế', 'level': 'B1', 'symbol': 'medical.thermometer.fill'},
    'công việc nhà': {'vietnamese': 'Công việc nhà', 'level': 'A1', 'symbol': 'washer.fill'},
    'giải trí': {'vietnamese': 'Giải trí', 'level': 'A2', 'symbol': 'gamecontroller.fill'},
    'du lịch': {'vietnamese': 'Du lịch & Khám phá', 'level': 'B1', 'symbol': 'airplane.circle.fill'},
    'thể thao': {'vietnamese': 'Thể thao', 'level': 'A2', 'symbol': 'sportscourt.fill'},
    'quê hương': {'vietnamese': 'Quê hương & Đất nước', 'level': 'A2', 'symbol': 'map.fill'},
    'sân bay': {'vietnamese': 'Sân bay & Chuyến bay', 'level': 'B1', 'symbol': 'airplane'},
    'sức khỏe': {'vietnamese': 'Sức khỏe & Thể hình', 'level': 'B1', 'symbol': 'heart.text.square.fill'},
    'rau, củ, quả': {'vietnamese': 'Rau củ quả', 'level': 'A1', 'symbol': 'carrot.fill'},
    'rau củ': {'vietnamese': 'Rau củ quả', 'level': 'A1', 'symbol': 'carrot.fill'},
    'thời gian': {'vietnamese': 'Thời gian', 'level': 'A1', 'symbol': 'clock.fill'},
    'giao thông': {'vietnamese': 'Giao thông & Đi lại', 'level': 'A2', 'symbol': 'car.fill'},
    'cảm xúc': {'vietnamese': 'Cảm xúc & Cảm giác', 'level': 'B1', 'symbol': 'face.smiling.fill'},
    'cảm giác': {'vietnamese': 'Cảm xúc & Cảm giác', 'level': 'B1', 'symbol': 'face.smiling.fill'},
    'đồ uống': {'vietnamese': 'Đồ uống', 'level': 'A1', 'symbol': 'cup.and.saucer.fill'},
    'phim ảnh': {'vietnamese': 'Phim ảnh', 'level': 'B1', 'symbol': 'film.fill'},
    'Giáng sinh': {'vietnamese': 'Giáng sinh & Lễ hội', 'level': 'A2', 'symbol': 'snowflake'},
    'đồ ăn': {'vietnamese': 'Đồ ăn', 'level': 'A1', 'symbol': 'fork.knife'},
    'âm nhạc': {'vietnamese': 'Âm nhạc & Nhạc cụ', 'level': 'A2', 'symbol': 'music.note'},
    'nhà hàng': {'vietnamese': 'Nhà hàng & Khách sạn', 'level': 'B1', 'symbol': 'bed.double.fill'},
    'khách sạn': {'vietnamese': 'Nhà hàng & Khách sạn', 'level': 'B1', 'symbol': 'bed.double.fill'},
    'trường học': {'vietnamese': 'Trường học', 'level': 'A1', 'symbol': 'school.fill'},
    'màu sắc': {'vietnamese': 'Màu sắc', 'level': 'A1', 'symbol': 'paintpalette.fill'},
    'thời tiết': {'vietnamese': 'Thời tiết', 'level': 'A1', 'symbol': 'cloud.sun.fill'},
    'bộ phận cơ thể': {'vietnamese': 'Bộ phận cơ thể', 'level': 'A1', 'symbol': 'hand.raised.fill'},
    'gia đình': {'vietnamese': 'Gia đình', 'level': 'A1', 'symbol': 'person.2.fill'},
    'trái cây': {'vietnamese': 'Trái cây', 'level': 'A1', 'symbol': 'apple.logo'},
    'động vật': {'vietnamese': 'Động vật', 'level': 'A1', 'symbol': 'pawprint.fill'},
    'học tập': {'vietnamese': 'Học tập', 'level': 'A1', 'symbol': 'book.closed.fill'},
    'thực vật': {'vietnamese': 'Thực vật & Cây cối', 'level': 'A2', 'symbol': 'leaf.fill'},
    'quốc gia': {'vietnamese': 'Các quốc gia', 'level': 'A2', 'symbol': 'globe'},
    'hải sản': {'vietnamese': 'Hải sản', 'level': 'B1', 'symbol': 'fish.fill'},
    'nghề nghiệp': {'vietnamese': 'Nghề nghiệp', 'level': 'A2', 'symbol': 'briefcase.fill'},
    'chế độ ăn uống': {'vietnamese': 'Chế độ ăn uống', 'level': 'B2', 'symbol': 'heart.fill'},
    'chỉ đường': {'vietnamese': 'Chỉ đường & Phương hướng', 'level': 'A2', 'symbol': 'arrow.turn.up.right'},
    'phòng khách sạn': {'vietnamese': 'Phòng khách sạn', 'level': 'B1', 'symbol': 'key.fill'},
    'bưu điện': {'vietnamese': 'Bưu điện & Thư từ', 'level': 'B2', 'symbol': 'envelope.fill'},
    'ngân hàng': {'vietnamese': 'Ngân hàng & Tài chính', 'level': 'B2', 'symbol': 'dollarsign.circle.fill'}
}

def get_topic_info(header_text):
    for key, info in topic_mapping.items():
        if key.lower() in header_text.lower():
            return info['vietnamese'], info['level'], info['symbol']
    # Default fallback
    return "Tổng hợp", "B1", "book.fill"

# Find all heading-table sections
pattern = re.compile(r'(<h\d.*?>.*?</h\d>|<p><strong>.*?</strong></p>).*?(<table.*?>.*?</table>)', re.DOTALL)
matches = pattern.findall(content)

extracted_words = []
word_counter = 0

for header, table in matches:
    clean_header = re.sub(r'<[^>]*>', '', header).strip()
    # Skip articles index lists if they contain 'Bài viết cùng chủ đề'
    if 'bài viết cùng chủ đề' in clean_header.lower():
        continue
        
    topic, level, symbol = get_topic_info(clean_header)
    
    # Parse rows
    rows = re.findall(r'<tr.*?>(.*?)</tr>', table, re.DOTALL)
    if len(rows) <= 1:
        continue
        
    for r_idx, row in enumerate(rows[1:]): # skip table header
        cols = re.findall(r'<t[d|h].*?>(.*?)</t[d|h]>', row, re.DOTALL)
        clean_cols = [clean_html(c) for c in cols]
        
        # We need at least English word and Vietnamese meaning
        if len(clean_cols) < 2:
            continue
            
        word_eng = clean_cols[0]
        # Clean word_eng if it has multiple lines or symbols
        word_eng = word_eng.split('\n')[0].strip()
        # Some words might have brackets like "cardinal number (n)", clean it
        word_eng = re.sub(r'\s*\(.*?\)\s*', '', word_eng).strip()
        
        if not word_eng or word_eng.lower() == 'từ vựng':
            continue
            
        # Parse fields based on columns count
        part_of_speech = ""
        ipa = ""
        meaning = ""
        
        if len(clean_cols) >= 4:
            part_of_speech = clean_cols[1]
            ipa = clean_cols[2]
            meaning = clean_cols[3]
        elif len(clean_cols) == 3:
            # Check which col has IPA
            if '/' in clean_cols[1]:
                ipa = clean_cols[1]
                meaning = clean_cols[2]
            else:
                part_of_speech = clean_cols[1]
                meaning = clean_cols[2]
        else:
            meaning = clean_cols[1]
            
        # Clean translation meaning
        meaning = meaning.split('\n')[0].strip()
        meaning = re.sub(r'\s*\(.*?\)\s*', '', meaning).strip()
        
        # Clean IPA
        if not ipa:
            ipa = f"/{word_eng.lower()}/" # default phonetic representation
        ipa = ipa.strip()
        if not ipa.startswith('/'):
            ipa = '/' + ipa
        if not ipa.endswith('/'):
            ipa = ipa + '/'
            
        # Standard part of speech cleanup
        part_of_speech = part_of_speech.lower().strip()
        if 'v' in part_of_speech:
            pos = 'v'
        elif 'adj' in part_of_speech:
            pos = 'adj'
        elif 'adv' in part_of_speech:
            pos = 'adv'
        else:
            pos = 'n'
            
        # Generate dynamic example templates based on part of speech
        example_en = ""
        example_vi = ""
        
        # Singularize meaning for template output if it contains commas
        first_meaning = meaning.split(',')[0].strip().lower()
        
        if pos == 'v':
            example_en = f"You should {word_eng.lower()} this as soon as possible."
            example_vi = f"Bạn nên {first_meaning} cái này càng sớm càng tốt."
        elif pos == 'adj':
            example_en = f"The situation became very {word_eng.lower()} yesterday."
            example_vi = f"Tình huống đã trở nên rất {first_meaning} ngày hôm qua."
        elif pos == 'adv':
            example_en = f"She completed the task {word_eng.lower()}."
            example_vi = f"Cô ấy đã hoàn thành nhiệm vụ một cách {first_meaning}."
        else: # noun
            example_en = f"Please give me the {word_eng.lower()}."
            example_vi = f"Làm ơn đưa cho tôi {first_meaning}."
            
        word_counter += 1
        
        extracted_words.append({
            "id": f"oxford_{word_counter:04d}",
            "word": word_eng.capitalize(),
            "ipa": ipa,
            "vietnameseMeaning": meaning,
            "exampleEnglish": example_en,
            "exampleVietnamese": example_vi,
            "topic": topic,
            "level": level,
            "symbolName": symbol,
            "isCustom": False,
            "isLearned": False,
            "isFavorite": False
        })

# Write to file
output_path = "HaniVoca/Resources/words.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(extracted_words, f, ensure_ascii=False, indent=4)

print(f"Successfully parsed and saved {len(extracted_words)} words to {output_path}!")
