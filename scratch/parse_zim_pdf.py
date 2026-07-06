import re
import json
import os
import sqlite3
from pypdf import PdfReader

pdf_path = "/Users/voquy/.gemini/antigravity/brain/30b75604-0a17-44d0-9b3b-9e3756f6f7b0/media__1782950321825.pdf"
db_path = "HaniVoca/Resources/tudien.db"

# Word dictionary for cleaning missing spaces
dictionary_words = set()
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT word FROM dictionary")
        # Lowercase for lookups
        dictionary_words = set(row[0].lower() for row in cursor.fetchall())
        conn.close()
        print(f"Loaded {len(dictionary_words)} reference dictionary words for spacing cleanup.")
    except Exception as e:
        print(f"Could not load reference dictionary: {e}")

# Helper to split words that have missing spaces
# E.g. "TestTube" -> "Test Tube", "Stapleremover" -> "Staple Remover"
def fix_compound_word_spaces(compound):
    # First split CamelCase
    split = re.sub(r"([a-z])([A-Z])", r"\1 \2", compound)
    
    # If it is lowercase with potential missing spaces (e.g. "tapemeasure" or "paperfastener")
    # We can try to split it into two words if they exist in our reference dictionary
    words = split.split()
    cleaned_words = []
    
    for w in words:
        wl = w.lower()
        if wl in dictionary_words or len(wl) <= 2:
            cleaned_words.append(w)
            continue
            
        # Try to find a split point
        split_found = False
        for split_idx in range(3, len(wl) - 2):
            part1 = wl[:split_idx]
            part2 = wl[split_idx:]
            if part1 in dictionary_words and part2 in dictionary_words:
                # Keep original casing
                cleaned_words.append(w[:split_idx].capitalize())
                cleaned_words.append(w[split_idx:].capitalize() if w[split_idx].isupper() else w[split_idx:])
                split_found = True
                break
        if not split_found:
            cleaned_words.append(w)
            
    final_word = " ".join(cleaned_words)
    # Basic cleanups
    final_word = final_word.replace("Paperfastener", "Paper Fastener")
    final_word = final_word.replace("Stapleremover", "Staple Remover")
    final_word = final_word.replace("Tapemeasure", "Tape Measure")
    final_word = final_word.replace("Post-itnote", "Post-it Note")
    final_word = final_word.replace("Paperfastener", "Paper Fastener")
    final_word = final_word.replace("Watercolour", "Watercolour")
    final_word = final_word.replace("ColouredPencil", "Coloured Pencil")
    final_word = final_word.replace("Ballpointpen", "Ballpoint Pen")
    final_word = final_word.replace("Carbonpaper", "Carbon Paper")
    
    return final_word

# Helper to fix spacing in Vietnamese meanings
# E.g. "Màunước" -> "Màu nước", "Đinhghim" -> "Đinh ghim"
def fix_vietnamese_spaces(text):
    # Common words in ZIM list to split
    replacements = {
        "Màunước": "Màu nước",
        "Đinhghim": "Đinh ghim",
        "Sáchgiáokhoa": "Sách giáo khoa",
        "Ốngnghiệm": "Ống nghiệm",
        "Thướcdây": "Thước dây",
        "Giấynến": "Giấy nến",
        "Đồdậpghim": "Đồ dập ghim",
        "Ê-ke": "Ê-ke",
        "Băngdínhtrongsuốt": "Băng dính trong suốt",
        "Cụctẩy": "Cục tẩy",
        "Khănlaubảng": "Khăn lau bảng",
        "Hồsơ": "Hồ sơ",
        "Bànhọc": "Bàn học",
        "Bútchìmàu": "Bút chì màu",
        "Máytínhbàn": "Máy tính bàn",
        "Đồnghồtreotường": "Đồng hồ treo tường",
        "Giấythan": "Giấy than",
        "Máytínhcầmtay": "Máy tính cầm tay",
        "Giásách": "Giá sách",
        "Bảngđen": "Bảng đen",
        "Cốcbêse": "Cốc bê-se",
        "Bútbi": "Bút bi",
        "Cặpsách": "Cặp sách",
        "Cáiphễu": "Cái phễu",
        "Đồdùnghọctập": "Đồ dùng học tập",
        "Hànhđộng": "Hành động",
        "Hoạtđộngthườngngày": "Hoạt động thường ngày",
        "Chủđềbiển": "Chủ đề biển",
        "Muasắm": "Mua sắm",
        "Phòngngủ": "Phòng ngủ",
        "Tìnhbạn": "Tình bạn",
        "Nhàbếp": "Nhà bếp",
        "Đồtrangsức": "Đồ trang sức",
        "Môitrường": "Môi trường",
        "Phòngkhách": "Phòng khách",
        "Bệnhviện": "Bệnh viện",
        "Máytính": "Máy tính",
        "Côngviệcnhà": "Công việc nhà",
        "Cửahàng": "Cửa hàng",
        "Giải trí": "Giải trí",
        "Dulịch": "Du lịch",
        "Tết trung thu": "Tết trung thu",
        "Thểthao": "Thể thao",
        "Quêhương": "Quê hương",
        "Đámcưới": "Đám cưới",
        "Sânbay": "Sân bay",
        "Sứckhỏe": "Sức khỏe",
        "Rau,củ,quả": "Rau, củ, quả",
        "Thờigian": "Thời gian",
        "Giaothông": "Giao thông",
        "Cảmxúc,cảmgiác": "Cảm xúc, cảm giác",
        "Tínhcách": "Tính cách",
        "Đồuống": "Đồ uống",
        "Các loài hoa": "Các loài hoa",
        "Phim ảnh": "Phim ảnh",
        "Bóngđá": "Bóng đá",
        "Giáng sinh": "Giáng sinh",
        "Đồăn": "Đồ ăn",
        "Âmnhạc": "Âm nhạc",
        "Tìnhyêu": "Tình yêu",
        "Nhàhàng,kháchsạn": "Nhà hàng, khách sạn",
        "Trườnghọc": "Trường học",
        "Màusắc": "Màu sắc",
        "Thời tiết": "Thời tiết",
        "Quầnáo": "Quần áo",
        "Bộphậncơthể": "Bộ phận cơ thể",
        "Giáodục": "Giáo dục",
        "Giađình": "Gia đình",
        "Tráicây": "Trái cây",
        "Độngvật": "Động vật",
        "Côntrùng": "Côn trùng",
        "Họctập": "Học tập",
        "Thựcvật": "Thực vật",
        "Quốcgia": "Quốc gia",
        "Hảisản": "Hải sản",
        "Nănglượng": "Năng lượng",
        "Nghềnghiệp": "Nghề nghiệp",
        "Chếđộănuống": "Chế độ ăn uống",
        "Thảmhọathiênnhiên": "Thảm họa thiên nhiên",
        "Chỉđường": "Chỉ đường",
        "Phòngkháchsạn": "Phòng khách sạn",
        "Bưuđiện": "Bưu điện",
        "Ngânhàng": "Ngân hàng",
        "Cáigỡghimbấm": "Cái gỡ ghim bấm",
        "Băngdínhtrong": "Băng dính trong",
        "Thẻghinhớ": "Thẻ ghi nhớ",
        "Tậphồsơ": "Tập hồ sơ",
        "Tủđựngtài liệu": "Tủ đựng tài liệu",
        "Bútdạ": "Bút dạ",
        "Bìarời (báo,tạpchí)": "Bìa rời (báo, tạp chí)",
        "Bìarời": "Bìa rời",
        "Khănlau chén": "Khăn lau chén",
        "Tủ lạnh": "Tủ lạnh",
        "Tủđông": "Tủ đông",
        "Tủ(cónhiềungăn)": "Tủ (có nhiều ngăn)",
        "Lòvi sóng": "Lò vi sóng",
        "Bát,chén": "Bát, chén",
        "Máyphacàphê": "Máy pha cà phê",
        "Lò,lònướng": "Lò, lò nướng",
        "Nướctẩyrửalò": "Nước tẩy rửa lò",
        "Bồnrửabát": "Bồn rửa bát"
    }
    
    cleaned = text
    for k, v in replacements.items():
        cleaned = re.sub(r'\b' + re.escape(k) + r'\b', v, cleaned)
        cleaned = cleaned.replace(k, v)
        
    # Also separate standard lowercase words glued together
    # E.g. "nhânviên" -> "nhân viên", "giámđốc" -> "giám đốc"
    vi_replacements = {
        "nhânviên": "nhân viên",
        "thuốc": "thuốc",
        "bảnđồ": "bản đồ",
        "kínhlúp": "kính lúp",
        "phiếulàm": "phiếu làm",
        "bútđánh": "bút đánh",
        "quảđịa": "quả địa",
        "giámđốc": "giám đốc",
        "vítiền": "ví tiền",
        "cáicân": "cái cân",
        "quầyhàng": "quầy hàng",
        "máyđọc": "máy đọc",
        "mãvạch": "mã vạch",
        "biênlai": "biên lai",
        "trảtiền": "trả tiền",
        "giảmgiá": "giảm giá",
        "giácả": "giá cả",
        "xeđẩy": "xe đẩy",
        "thẻtín": "thẻ tín",
        "dụng": "dụng",
        "tiềnmặt": "tiền mặt",
        "cửahàng": "cửa hàng",
        "bánrau": "bán rau",
        "đồgia": "đồ gia",
        "trungtâm": "trung tâm",
        "tạphóa": "tạp hóa",
        "tiệnlợi": "tiện lợi",
        "mặccả": "mặc cả",
        "hoànlại": "hoàn lại",
        "trảlại": "trả lại",
        "quảngcáo": "quảng cáo",
        "quánrượu": "quán rượu",
        "tiệmthuốc": "tiệm thuốc",
        "tiệmgiày": "tiệm giày",
        "bánhoa": "bán hoa",
        "bánthịt": "bán thịt",
        "baogối": "bao gối",
        "tủquần": "tủ quần",
        "thảmlót": "thảm lót",
        "bàntrang": "bàn trang",
        "giấydán": "giấy dán",
        "tấmthảm": "tấm thảm",
        "rèmche": "rèm che",
        "khăntrải": "khăn trải",
        "tấmchăn": "tấm chăn",
        "trangsức": "trang sức",
        "máydiều": "máy điều",
        "hòa": "hòa",
        "khunglò": "khung lò",
        "nângnệm": "nâng nệm",
        "chănbông": "chăn bông",
        "móctreo": "móc treo",
        "trongtường": "trong tường",
        "côngtắc": "công tắc",
        "tủkéo": "tủ kéo",
        "bạncùng": "bạn cùng",
        "đồngnghiệp": "đồng nghiệp",
        "tìnhđồng": "tình đồng",
        "cộngsự": "cộng sự",
        "thânthiết": "thân thiết",
        "máyxay": "máy xay",
        "sinh tố": "sinh tố",
        "lònướng": "lò nướng",
        "khănlau": "khăn lau",
        "nướctẩy": "nước tẩy",
        "bồnrửa": "bồn rửa"
    }
    
    for k, v in vi_replacements.items():
        cleaned = cleaned.replace(k, v)
        
    return cleaned

print("Loading ZIM PDF Reader...")
reader = PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Successfully loaded PDF. Pages count: {total_pages}")

current_topic = "General"
topic_counter = 0
parsed_words = []
word_counter = 1

type_pattern = r"\b(n|v|adj|adv|n\.\s*phr|v\.\s*phr|phrasal\s*v|pre|prep|pron|conj|n/v|adj/n|adj/v)\b"

# We start reading from page 4 (index 3) to page 106 (index 105)
for page_idx in range(3, 106):
    text = reader.pages[page_idx].extract_text()
    if not text:
        continue
        
    lines = text.split("\n")
    
    # Merge lines that were split
    merged_lines = []
    temp_line = ""
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect topic headers (spaces might be missing, e.g. "Từvựngvề...")
        topic_match = re.match(r"^(\d+)\.?\s*Từ\s*vựng\s*về\s*(.+)$", line, re.IGNORECASE)
        if not topic_match:
            # Match with missing spaces
            topic_match = re.match(r"^(\d+)\.?\s*Từvựngvề\s*(.+)$", line, re.IGNORECASE)
        if not topic_match:
            topic_match = re.match(r"^(\d+)\.?\s*Từvựngvề(.+)$", line, re.IGNORECASE)
            
        if topic_match:
            if temp_line:
                merged_lines.append(temp_line)
                temp_line = ""
            current_topic = topic_match.group(2).strip()
            # Clean dot leaders or page page numbers from header if matched
            current_topic = re.sub(r"\.+\s*\d+$", "", current_topic).strip()
            current_topic = fix_vietnamese_spaces(current_topic)
            topic_counter += 1
            continue
            
        # Ignore index lists dot leaders
        if re.search(r"\.{5,}\s*\d+", line):
            continue
            
        # Ignore table column headers
        if "Từvựng" in line or "Từloại" in line or "Phiênâm" in line or "Ýnghĩa" in line:
            continue
        if "Từ vựng" in line or "Từ loại" in line or "Phiên âm" in line or "Ý nghĩa" in line:
            continue
            
        # Spacing fixes / continuation line merge heuristics
        is_continuation = False
        if temp_line:
            if line.startswith("/"):
                is_continuation = True
            elif re.search(r"\b(n|v|adj|adv|n\.\s*phr|v\.\s*phr|phrasal\s*v|pre|prep|pron|conj)\b$", temp_line):
                is_continuation = True
            elif not re.search(type_pattern, line) and not "/" in temp_line:
                is_continuation = True
                
        if is_continuation:
            temp_line += " " + line
        else:
            if temp_line:
                merged_lines.append(temp_line)
            temp_line = line
            
    if temp_line:
        merged_lines.append(temp_line)
        
    # Now parse entries for this page
    for line in merged_lines:
        # Match type
        type_match = re.search(type_pattern, line)
        if type_match:
            type_start, type_end = type_match.span()
            word = line[:type_start].strip()
            word_type = type_match.group(1).strip()
            rest = line[type_end:].strip()
            
            # Match IPA /.../ or starting with /
            ipa_match = re.search(r"/?([^/]+)/", rest)
            if ipa_match:
                ipa = "/" + ipa_match.group(1).strip() + "/"
                ipa_start, ipa_end = ipa_match.span()
                meaning = rest[ipa_end:].strip()
                
                # Cleanup spaces and format
                word = fix_compound_word_spaces(word)
                meaning = fix_vietnamese_spaces(meaning)
                meaning = re.sub(r"^[,\s:\-—]+", "", meaning).strip()
                
                # Assign visual SF symbol based on topic name keywords
                symbol = "book.closed.fill"
                topic_lower = current_topic.lower()
                if "học" in topic_lower or "trường" in topic_lower or "giáo" in topic_lower:
                    symbol = "pencil.and.ruler.fill"
                elif "hành động" in topic_lower:
                    symbol = "figure.walk"
                elif "thường ngày" in topic_lower:
                    symbol = "house.fill"
                elif "biển" in topic_lower or "hải sản" in topic_lower:
                    symbol = "drop.fill"
                elif "số" in topic_lower:
                    symbol = "number"
                elif "mua sắm" in topic_lower or "cửa hàng" in topic_lower:
                    symbol = "cart.fill"
                elif "phòng ngủ" in topic_lower:
                    symbol = "bed.double.fill"
                elif "tình bạn" in topic_lower or "tình yêu" in topic_lower:
                    symbol = "heart.fill"
                elif "nhà bếp" in topic_lower or "đồ ăn" in topic_lower or "đồ uống" in topic_lower or "ăn uống" in topic_lower:
                    symbol = "fork.knife"
                elif "sức khỏe" in topic_lower or "bệnh viện" in topic_lower:
                    symbol = "heart.text.square.fill"
                elif "giao thông" in topic_lower or "chỉ đường" in topic_lower:
                    symbol = "car.fill"
                elif "thể thao" in topic_lower or "bóng đá" in topic_lower:
                    symbol = "sportscourt.fill"
                elif "trái cây" in topic_lower or "rau" in topic_lower:
                    symbol = "carrot.fill"
                elif "quốc gia" in topic_lower:
                    symbol = "globe"
                elif "nghề" in topic_lower:
                    symbol = "briefcase.fill"
                elif "thời tiết" in topic_lower or "thảm họa" in topic_lower:
                    symbol = "cloud.sun.fill"
                elif "phim" in topic_lower:
                    symbol = "film.fill"
                elif "nhạc" in topic_lower:
                    symbol = "music.note"
                
                parsed_words.append({
                    "id": f"zim_{word_counter:04d}",
                    "word": word,
                    "ipa": ipa,
                    "vietnameseMeaning": meaning,
                    "exampleEnglish": "",
                    "exampleVietnamese": "",
                    "topic": current_topic,
                    "level": "A1",
                    "symbolName": symbol,
                    "isCustom": False,
                    "isLearned": False,
                    "isFavorite": False
                })
                word_counter += 1

print(f"\nSuccessfully parsed ZIM book database.")
print(f"Total topics parsed: {topic_counter}")
print(f"Total vocabulary parsed: {len(parsed_words)} words.")

# Distribute levels evenly among the parsed list to fit A1-C2 curriculum nicely
levels_pool = ["A1", "A2", "B1", "B2", "C1", "C2"]
for i, w in enumerate(parsed_words):
    # Dynamic distribution: first 15% A1, next 20% A2, next 25% B1, next 20% B2, next 10% C1, next 10% C2
    idx = i / len(parsed_words)
    if idx < 0.15:
        level = "A1"
    elif idx < 0.35:
        level = "A2"
    elif idx < 0.60:
        level = "B1"
    elif idx < 0.80:
        level = "B2"
    elif idx < 0.90:
        level = "C1"
    else:
        level = "C2"
    w["level"] = level

# Save words to HaniVoca resources words.json!
output_path = "HaniVoca/Resources/words.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(parsed_words, f, ensure_ascii=False, indent=4)
print(f"Saved database to {output_path} successfully!")
