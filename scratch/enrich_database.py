import json
import urllib.request
import urllib.parse
import json
import concurrent.futures
import time
import sys
import re

def get_vietnamese_translation(text):
    if not text:
        return ""
    # Try translating with retry logic
    for attempt in range(3):
        try:
            q = urllib.parse.quote(text)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q={q}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=8)
            data = json.loads(res.read().decode('utf-8'))
            return data[0][0][0]
        except Exception as e:
            time.sleep(1 + attempt)
    return ""

def fetch_dictionary_example(word):
    for attempt in range(3):
        try:
            url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(word)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=8)
            data = json.loads(res.read().decode('utf-8'))
            
            # Scan meanings and definitions for examples
            for entry in data:
                for meaning in entry.get('meanings', []):
                    for definition in meaning.get('definitions', []):
                        ex = definition.get('example', '').strip()
                        if ex and len(ex.split()) >= 4 and len(ex.split()) <= 16:
                            # Verify the word is in the example
                            if word.lower() in ex.lower():
                                return ex
            break
        except Exception:
            # Word not found or API error
            time.sleep(0.5)
            break
    return None

def generate_template_example(word, topic):
    t = topic.lower()
    w = word.lower()
    
    if 'động vật' in t or 'animal' in t:
        return f"The biologist spent months studying the behavior of the wild {w} in its natural habitat."
    elif 'ăn' in t or 'uống' in t or 'food' in t or 'drink' in t:
        return f"We ordered a delicious local dish served with fresh {w} and organic vegetables."
    elif 'học' in t or 'trường' in t or 'school' in t or 'study' in t:
        return f"Students are required to bring a {w} to every science class for reference."
    elif 'gia đình' in t or 'family' in t:
        return f"She shared a warm and memorable story about her beloved {w} during dinner."
    elif 'xe' in t or 'giao thông' in t or 'travel' in t or 'traffic' in t:
        return f"The tourists preferred to commute by {w} to explore the historic city center."
    elif 'nghề' in t or 'work' in t or 'job' in t:
        return f"A highly skilled {w} was hired to coordinate the new project effectively."
    else:
        return f"It is important to understand the practical usage of the word '{w}' in conversation."

def process_word(w):
    word_text = w.get("word", "").strip()
    topic = w.get("topic", "").strip()
    
    # 1. Fetch from Dictionary API
    eng_ex = fetch_dictionary_example(word_text)
    
    # 2. Fallback to topic template if no dictionary example
    if not eng_ex:
        eng_ex = generate_template_example(word_text, topic)
        
    # 3. Translate to Vietnamese
    vi_ex = get_vietnamese_translation(eng_ex)
    
    # 4. Update fields
    w["exampleEnglish"] = eng_ex
    w["exampleVietnamese"] = vi_ex
    return w

def main():
    file_path = "webapp/public/data/words.json"
    print(f"Reading file from: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        words = json.load(f)
        
    print(f"Loaded {len(words)} words. Starting parallel enrichment...")
    
    completed = 0
    start_time = time.time()
    
    # Use ThreadPoolExecutor for high-speed parallel fetches
    with concurrent.futures.ThreadPoolExecutor(max_workers=25) as executor:
        futures = {executor.submit(process_word, w): w for w in words}
        
        for future in concurrent.futures.as_completed(futures):
            completed += 1
            if completed % 100 == 0 or completed == len(words):
                elapsed = time.time() - start_time
                speed = completed / elapsed
                eta = (len(words) - completed) / speed if speed > 0 else 0
                print(f"Progress: {completed}/{len(words)} ({completed/len(words)*100:.1f}%) | Speed: {speed:.1f} words/s | ETA: {eta:.1f}s")
                
    # Save back to webapp database
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=4)
        
    # Save back to iOS Resources database to keep them synchronized
    ios_file_path = "HaniVoca/Resources/words.json"
    try:
        with open(ios_file_path, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=4)
        print(f"Synchronized with iOS dataset: {ios_file_path}")
    except Exception as e:
        print(f"Could not write to iOS path: {e}")
        
    print(f"Successfully enriched {len(words)} words in {time.time() - start_time:.1f} seconds!")

if __name__ == "__main__":
    main()
