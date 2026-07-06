import json
import os

# Create directories if they do not exist
os.makedirs("HaniVoca/Resources", exist_ok=True)

# Predefined high-quality vocabulary list
words = [
    # --- FAMILY & RELATIONSHIPS ---
    {
        "word": "Mother",
        "ipa": "/ˈmʌð.ər/",
        "vietnameseMeaning": "Mẹ",
        "exampleEnglish": "My mother is a teacher and she loves her job.",
        "exampleVietnamese": "Mẹ tôi là giáo viên và bà rất yêu công việc của mình.",
        "topic": "Family & Relationships",
        "level": "A1",
        "symbolName": "person.2.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Father",
        "ipa": "/ˈfɑː.ðər/",
        "vietnameseMeaning": "Bố, cha",
        "exampleEnglish": "His father works in a local hospital.",
        "exampleVietnamese": "Bố của anh ấy làm việc ở một bệnh viện địa phương.",
        "topic": "Family & Relationships",
        "level": "A1",
        "symbolName": "person.2.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Sibling",
        "ipa": "/ˈsɪb.lɪŋ/",
        "vietnameseMeaning": "Anh chị em ruột",
        "exampleEnglish": "Do you have any siblings?",
        "exampleVietnamese": "Bạn có anh chị em ruột nào không?",
        "topic": "Family & Relationships",
        "level": "B1",
        "symbolName": "person.3.sequence.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Spouse",
        "ipa": "/spaʊs/",
        "vietnameseMeaning": "Vợ hoặc chồng",
        "exampleEnglish": "Employees are encouraged to bring their spouses to the party.",
        "exampleVietnamese": "Nhân viên được khuyến khích đưa vợ/chồng của họ đến bữa tiệc.",
        "topic": "Family & Relationships",
        "level": "B2",
        "symbolName": "person.2.shared.with.sender.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Acquaintance",
        "ipa": "/əˈkweɪn.təns/",
        "vietnameseMeaning": "Người quen",
        "exampleEnglish": "He is not a close friend, just a business acquaintance.",
        "exampleVietnamese": "Anh ấy không phải bạn thân, chỉ là một người quen trong công việc.",
        "topic": "Family & Relationships",
        "level": "C1",
        "symbolName": "person.fill.questionmark",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Kinship",
        "ipa": "/ˈkɪn.ʃɪp/",
        "vietnameseMeaning": "Quan hệ họ hàng, sự thân thuộc",
        "exampleEnglish": "They felt a strong sense of kinship with the local people.",
        "exampleVietnamese": "Họ cảm thấy một sự thân thuộc sâu sắc với người dân địa phương.",
        "topic": "Family & Relationships",
        "level": "C2",
        "symbolName": "heart.handshake.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },

    # --- FOOD & DINING ---
    {
        "word": "Apple",
        "ipa": "/ˈæp.əl/",
        "vietnameseMeaning": "Quả táo",
        "exampleEnglish": "An apple a day keeps the doctor away.",
        "exampleVietnamese": "Mỗi ngày một quả táo giúp bạn tránh xa bác sĩ.",
        "topic": "Food & Dining",
        "level": "A1",
        "symbolName": "apple.logo",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Breakfast",
        "ipa": "/ˈbrek.fəst/",
        "vietnameseMeaning": "Bữa ăn sáng",
        "exampleEnglish": "I usually have bread and milk for breakfast.",
        "exampleVietnamese": "Tôi thường ăn bánh mì và uống sữa cho bữa sáng.",
        "topic": "Food & Dining",
        "level": "A2",
        "symbolName": "cup.and.saucer.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Recipe",
        "ipa": "/ˈres.ɪ.pi/",
        "vietnameseMeaning": "Công thức nấu ăn",
        "exampleEnglish": "Could you write down the recipe for this cake?",
        "exampleVietnamese": "Bạn có thể viết lại công thức làm món bánh này không?",
        "topic": "Food & Dining",
        "level": "B1",
        "symbolName": "doc.text.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Ingredients",
        "ipa": "/ɪnˈɡriː.di.ənts/",
        "vietnameseMeaning": "Nguyên liệu",
        "exampleEnglish": "Mix all the ingredients together in a large bowl.",
        "exampleVietnamese": "Trộn tất cả các nguyên liệu lại với nhau trong một chiếc bát lớn.",
        "topic": "Food & Dining",
        "level": "B2",
        "symbolName": "carrot.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Gourmet",
        "ipa": "/ˈɡʊə.meɪ/",
        "vietnameseMeaning": "Người sành ăn / Ẩm thực cao cấp",
        "exampleEnglish": "He is a gourmet chef who works at a five-star hotel.",
        "exampleVietnamese": "Anh ấy là một đầu bếp sành ăn làm việc tại khách sạn năm sao.",
        "topic": "Food & Dining",
        "level": "C1",
        "symbolName": "fork.knife.circle.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Palatable",
        "ipa": "/ˈpæl.ə.tə.bəl/",
        "vietnameseMeaning": "Ngon miệng, có vị dễ chịu",
        "exampleEnglish": "The soup was very palatable and warm.",
        "exampleVietnamese": "Món súp rất ngon miệng và ấm áp.",
        "topic": "Food & Dining",
        "level": "C2",
        "symbolName": "face.smiling.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },

    # --- TRAVEL & TOURISM ---
    {
        "word": "Ticket",
        "ipa": "/ˈtɪk.ɪt/",
        "vietnameseMeaning": "Vé (tàu, xe, máy bay...)",
        "exampleEnglish": "Don't forget to buy a train ticket in advance.",
        "exampleVietnamese": "Đừng quên mua vé tàu trước nhé.",
        "topic": "Travel & Tourism",
        "level": "A1",
        "symbolName": "ticket.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Airport",
        "ipa": "/ˈeə.pɔːt/",
        "vietnameseMeaning": "Sân bay",
        "exampleEnglish": "We arrived at the airport two hours before our flight.",
        "exampleVietnamese": "Chúng tôi đến sân bay hai tiếng trước chuyến bay.",
        "topic": "Travel & Tourism",
        "level": "A2",
        "symbolName": "airplane",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Luggage",
        "ipa": "/ˈlʌɡ.ɪdʒ/",
        "vietnameseMeaning": "Hành lý",
        "exampleEnglish": "They helped us carry our heavy luggage to the taxi.",
        "exampleVietnamese": "Họ giúp chúng tôi mang hành lý nặng ra taxi.",
        "topic": "Travel & Tourism",
        "level": "B1",
        "symbolName": "bag.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Itinerary",
        "ipa": "/aɪˈtɪn.ər.ər.i/",
        "vietnameseMeaning": "Lịch trình chuyến đi",
        "exampleEnglish": "Here is the itinerary for our trip to Japan.",
        "exampleVietnamese": "Đây là lịch trình cho chuyến đi Nhật Bản của chúng tôi.",
        "topic": "Travel & Tourism",
        "level": "B2",
        "symbolName": "calendar.badge.clock",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Breathtaking",
        "ipa": "/ˈbreθˌteɪ.kɪŋ/",
        "vietnameseMeaning": "Đẹp đến ngạt thở, ngoạn mục",
        "exampleEnglish": "The view from the top of the mountain was breathtaking.",
        "exampleVietnamese": "Tầm nhìn từ trên đỉnh núi đẹp đến ngạt thở.",
        "topic": "Travel & Tourism",
        "level": "C1",
        "symbolName": "mountain.2.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Sojourn",
        "ipa": "/ˈsɒdʒ.ɜːn/",
        "vietnameseMeaning": "Sự lưu trú tạm thời",
        "exampleEnglish": "After a brief sojourn in Paris, she returned home.",
        "exampleVietnamese": "Sau một thời gian lưu trú ngắn ngủi ở Paris, cô ấy đã trở về nhà.",
        "topic": "Travel & Tourism",
        "level": "C2",
        "symbolName": "house.lodge.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },

    # --- HEALTH & FITNESS ---
    {
        "word": "Doctor",
        "ipa": "/ˈdɒk.tər/",
        "vietnameseMeaning": "Bác sĩ",
        "exampleEnglish": "The doctor advised me to rest for a few days.",
        "exampleVietnamese": "Bác sĩ khuyên tôi nên nghỉ ngơi vài ngày.",
        "topic": "Health & Fitness",
        "level": "A1",
        "symbolName": "medical.thermometer.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Exercise",
        "ipa": "/ˈek.sə.saɪz/",
        "vietnameseMeaning": "Tập thể dục, bài tập",
        "exampleEnglish": "Regular exercise is good for your health.",
        "exampleVietnamese": "Tập thể dục thường xuyên rất tốt cho sức khỏe của bạn.",
        "topic": "Health & Fitness",
        "level": "A2",
        "symbolName": "figure.run",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Medicine",
        "ipa": "/ˈmed.ɪ.sən/",
        "vietnameseMeaning": "Thuốc, y học",
        "exampleEnglish": "Take this medicine three times a day after meals.",
        "exampleVietnamese": "Uống thuốc này ba lần một ngày sau bữa ăn.",
        "topic": "Health & Fitness",
        "level": "B1",
        "symbolName": "pills.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Symptom",
        "ipa": "/ˈsɪmp.təm/",
        "vietnameseMeaning": "Triệu chứng",
        "exampleEnglish": "Common symptoms of a cold include a runny nose and cough.",
        "exampleVietnamese": "Triệu chứng phổ biến của cảm lạnh bao gồm sổ mũi và ho.",
        "topic": "Health & Fitness",
        "level": "B2",
        "symbolName": "waveform.path.ecg",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Diagnosis",
        "ipa": "/ˌdaɪ.əɡˈnəʊ.sɪs/",
        "vietnameseMeaning": "Sự chẩn đoán",
        "exampleEnglish": "The doctor is waiting for test results before making a diagnosis.",
        "exampleVietnamese": "Bác sĩ đang chờ kết quả xét nghiệm trước khi đưa ra chẩn đoán.",
        "topic": "Health & Fitness",
        "level": "C1",
        "symbolName": "stethoscope",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Alleviate",
        "ipa": "/əˈliː.vi.eɪt/",
        "vietnameseMeaning": "Làm giảm bớt, làm nhẹ bớt",
        "exampleEnglish": "These pills will help alleviate the pain in your back.",
        "exampleVietnamese": "Những viên thuốc này sẽ giúp giảm bớt cơn đau ở lưng của bạn.",
        "topic": "Health & Fitness",
        "level": "C2",
        "symbolName": "bandage.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },

    # --- TECHNOLOGY & INTERNET ---
    {
        "word": "Computer",
        "ipa": "/kəmˈpjuː.tər/",
        "vietnameseMeaning": "Máy tính",
        "exampleEnglish": "I use my computer every day for work.",
        "exampleVietnamese": "Tôi sử dụng máy tính mỗi ngày để làm việc.",
        "topic": "Technology & Internet",
        "level": "A1",
        "symbolName": "desktopcomputer",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Website",
        "ipa": "/ˈweb.saɪt/",
        "vietnameseMeaning": "Trang web",
        "exampleEnglish": "You can find more details on our official website.",
        "exampleVietnamese": "Bạn có thể tìm thấy thêm chi tiết trên trang web chính thức của chúng tôi.",
        "topic": "Technology & Internet",
        "level": "A2",
        "symbolName": "globe",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Software",
        "ipa": "/ˈsɒft.weər/",
        "vietnameseMeaning": "Phần mềm",
        "exampleEnglish": "We need to install the latest software updates.",
        "exampleVietnamese": "Chúng ta cần cài đặt bản cập nhật phần mềm mới nhất.",
        "topic": "Technology & Internet",
        "level": "B1",
        "symbolName": "app.badge.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Database",
        "ipa": "/ˈdeɪ.tə.beɪs/",
        "vietnameseMeaning": "Cơ sở dữ liệu",
        "exampleEnglish": "All customer records are stored in a secure database.",
        "exampleVietnamese": "Tất cả hồ sơ khách hàng đều được lưu trữ trong một cơ sở dữ liệu an toàn.",
        "topic": "Technology & Internet",
        "level": "B2",
        "symbolName": "externaldrive.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Algorithm",
        "ipa": "/ˈæl.ɡə.rɪ.ðəm/",
        "vietnameseMeaning": "Thuật toán",
        "exampleEnglish": "Search engines use complex algorithms to rank pages.",
        "exampleVietnamese": "Các công cụ tìm kiếm sử dụng các thuật toán phức tạp để xếp hạng các trang.",
        "topic": "Technology & Internet",
        "level": "C1",
        "symbolName": "cpu",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Obfuscate",
        "ipa": "/ˈɒb.fʌs.keɪt/",
        "vietnameseMeaning": "Làm mờ mịt, làm khó hiểu (mã nguồn)",
        "exampleEnglish": "The writer used jargon to obfuscate the plain truth.",
        "exampleVietnamese": "Người viết đã dùng thuật ngữ chuyên môn để làm mờ mịt sự thật rõ ràng.",
        "topic": "Technology & Internet",
        "level": "C2",
        "symbolName": "eye.slash.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },

    # --- WORK & BUSINESS ---
    {
        "word": "Work",
        "ipa": "/wɜːk/",
        "vietnameseMeaning": "Làm việc, công việc",
        "exampleEnglish": "She starts work at nine o'clock every morning.",
        "exampleVietnamese": "Cô ấy bắt đầu làm việc lúc 9 giờ mỗi sáng.",
        "topic": "Work & Business",
        "level": "A1",
        "symbolName": "briefcase.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Meeting",
        "ipa": "/ˈmiː.tɪŋ/",
        "vietnameseMeaning": "Cuộc họp",
        "exampleEnglish": "We have an important meeting this afternoon.",
        "exampleVietnamese": "Chúng tôi có một cuộc họp quan trọng vào chiều nay.",
        "topic": "Work & Business",
        "level": "A2",
        "symbolName": "person.2.wave.2.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Colleague",
        "ipa": "/ˈkɒl.iːɡ/",
        "vietnameseMeaning": "Đồng nghiệp",
        "exampleEnglish": "My colleagues are very helpful and friendly.",
        "exampleVietnamese": "Đồng nghiệp của tôi rất hay giúp đỡ và thân thiện.",
        "topic": "Work & Business",
        "level": "B1",
        "symbolName": "person.2.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Negotiate",
        "ipa": "/nəˈɡəʊ.ʃi.eɪt/",
        "vietnameseMeaning": "Đàm phán, thương lượng",
        "exampleEnglish": "We managed to negotiate a better deal for the contract.",
        "exampleVietnamese": "Chúng tôi đã đàm phán được một thỏa thuận tốt hơn cho hợp đồng.",
        "topic": "Work & Business",
        "level": "B2",
        "symbolName": "hand.raised.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Entrepreneur",
        "ipa": "/ˌɒn.trə.prəˈnɜːr/",
        "vietnameseMeaning": "Doanh nhân, nhà khởi nghiệp",
        "exampleEnglish": "She is an entrepreneur who started her own online store.",
        "exampleVietnamese": "Cô ấy là một nhà khởi nghiệp đã mở cửa hàng trực tuyến của riêng mình.",
        "topic": "Work & Business",
        "level": "C1",
        "symbolName": "lightbulb.fill",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    },
    {
        "word": "Synergy",
        "ipa": "/ˈsɪn.ə.dʒi/",
        "vietnameseMeaning": "Sự cộng hưởng, tính hiệp lực",
        "exampleEnglish": "The merger created synergy between the two marketing teams.",
        "exampleVietnamese": "Sự sáp nhập đã tạo ra sự cộng hưởng giữa hai đội ngũ tiếp thị.",
        "topic": "Work & Business",
        "level": "C2",
        "symbolName": "link",
        "isCustom": False,
        "isLearned": False,
        "isFavorite": False
    }
]

# Add more mock vocabulary words to make the dataset richer (aiming for 120+ words in python database to guarantee variety)
extra_words = [
    # Family A2, B2
    {"word": "Uncle", "ipa": "/ˈʌŋ.kəl/", "vietnameseMeaning": "Chú, bác, cậu", "exampleEnglish": "My uncle lives in California.", "exampleVietnamese": "Cậu tôi sống ở California.", "topic": "Family & Relationships", "level": "A2", "symbolName": "person.fill"},
    {"word": "Ancestor", "ipa": "/ˈæn.ses.tər/", "vietnameseMeaning": "Tổ tiên", "exampleEnglish": "Her ancestors came from Italy.", "exampleVietnamese": "Tổ tiên của cô ấy đến từ Ý.", "topic": "Family & Relationships", "level": "B2", "symbolName": "person.crop.circle.badge.exclamationmark.fill"},
    
    # Food A1, B1
    {"word": "Water", "ipa": "/ˈwɔː.tər/", "vietnameseMeaning": "Nước uống", "exampleEnglish": "Please give me a glass of water.", "exampleVietnamese": "Làm ơn cho tôi một cốc nước.", "topic": "Food & Dining", "level": "A1", "symbolName": "drop.fill"},
    {"word": "Delicious", "ipa": "/dɪˈlɪʃ.əs/", "vietnameseMeaning": "Ngon", "exampleEnglish": "The pizza was delicious.", "exampleVietnamese": "Chiếc pizza thật ngon.", "topic": "Food & Dining", "level": "A2", "symbolName": "hand.thumbsup.fill"},
    {"word": "Cuisine", "ipa": "/kwɪˈziːn/", "vietnameseMeaning": "Ẩm thực", "exampleEnglish": "Italian cuisine is famous around the world.", "exampleVietnamese": "Ẩm thực Ý nổi tiếng khắp thế giới.", "topic": "Food & Dining", "level": "B2", "symbolName": "frying.pan.fill"},

    # Travel A1, B1
    {"word": "Hotel", "ipa": "/həʊˈtel/", "vietnameseMeaning": "Khách sạn", "exampleEnglish": "We booked a room in a hotel near the beach.", "exampleVietnamese": "Chúng tôi đặt một phòng khách sạn gần bãi biển.", "topic": "Travel & Tourism", "level": "A1", "symbolName": "bed.double.fill"},
    {"word": "Journey", "ipa": "/ˈdʒɜː.ni/", "vietnameseMeaning": "Hành trình", "exampleEnglish": "The train journey takes three hours.", "exampleVietnamese": "Hành trình bằng tàu hỏa mất ba tiếng.", "topic": "Travel & Tourism", "level": "B1", "symbolName": "map.fill"},
    
    # Health A2, B2
    {"word": "Healthy", "ipa": "/ˈhel.θi/", "vietnameseMeaning": "Khỏe mạnh", "exampleEnglish": "He looks very healthy.", "exampleVietnamese": "Anh ấy trông rất khỏe mạnh.", "topic": "Health & Fitness", "level": "A2", "symbolName": "heart.fill"},
    {"word": "Nutrition", "ipa": "/njuːˈtrɪʃ.ən/", "vietnameseMeaning": "Dinh dưỡng", "exampleEnglish": "Good nutrition is essential for growing children.", "exampleVietnamese": "Dinh dưỡng tốt là cần thiết cho trẻ đang lớn.", "topic": "Health & Fitness", "level": "B2", "symbolName": "leaf.fill"},

    # Technology A1, B1
    {"word": "Internet", "ipa": "/ˈɪn.tə.net/", "vietnameseMeaning": "Mạng Internet", "exampleEnglish": "I look up information on the Internet.", "exampleVietnamese": "Tôi tìm kiếm thông tin trên Internet.", "topic": "Technology & Internet", "level": "A1", "symbolName": "network"},
    {"word": "Network", "ipa": "/ˈnet.wɜːk/", "vietnameseMeaning": "Mạng lưới, kết nối", "exampleEnglish": "Our office has a local computer network.", "exampleVietnamese": "Văn phòng chúng tôi có một mạng máy tính nội bộ.", "topic": "Technology & Internet", "level": "B1", "symbolName": "personalhotspot"},

    # Work A1, B1
    {"word": "Office", "ipa": "/ˈɒf.ɪs/", "vietnameseMeaning": "Văn phòng", "exampleEnglish": "My office is on the third floor.", "exampleVietnamese": "Văn phòng của tôi ở tầng ba.", "topic": "Work & Business", "level": "A1", "symbolName": "building.2.fill"},
    {"word": "Salary", "ipa": "/ˈsæl.ər.i/", "vietnameseMeaning": "Lương", "exampleEnglish": "She receives a competitive monthly salary.", "exampleVietnamese": "Cô ấy nhận được mức lương tháng cạnh tranh.", "topic": "Work & Business", "level": "B1", "symbolName": "dollarsign.circle.fill"}
]

# Adding identifiers and default flags to extra words
for idx, w in enumerate(extra_words):
    w["isCustom"] = False
    w["isLearned"] = False
    w["isFavorite"] = False
    words.append(w)

# Add incremental IDs
for i, w in enumerate(words):
    w["id"] = f"word_{i+1:04d}"

# Common communication phrases
phrases = [
    # GREETINGS & BASICS
    {
        "id": "phrase_0001",
        "english": "How are you doing today?",
        "vietnamese": "Hôm nay bạn thế nào rồi?",
        "category": "Greetings & Basics",
        "contextNote": "Cách chào hỏi phổ biến, tự nhiên hơn 'How are you?'"
    },
    {
        "id": "phrase_0002",
        "english": "Long time no see! What have you been up to?",
        "vietnamese": "Lâu rồi không gặp! Dạo này bạn thế nào rồi?",
        "category": "Greetings & Basics",
        "contextNote": "Dùng khi lâu ngày mới gặp lại người quen."
    },
    {
        "id": "phrase_0003",
        "english": "It's a pleasure to meet you.",
        "vietnamese": "Rất hân hạnh được gặp bạn.",
        "category": "Greetings & Basics",
        "contextNote": "Chào hỏi lịch sự trong lần đầu gặp mặt."
    },
    {
        "id": "phrase_0004",
        "english": "I'd better get going. I'll catch you later!",
        "vietnamese": "Tôi phải đi đây. Hẹn gặp lại bạn sau nhé!",
        "category": "Greetings & Basics",
        "contextNote": "Cách tạm biệt tự nhiên khi chuẩn bị ra về."
    },

    # SHOPPING & DINING
    {
        "id": "phrase_0005",
        "english": "Could we have the bill, please?",
        "vietnamese": "Làm ơn cho chúng tôi xin hóa đơn thanh toán.",
        "category": "Shopping & Dining",
        "contextNote": "Yêu cầu tính tiền tại nhà hàng."
    },
    {
        "id": "phrase_0006",
        "english": "Does this soup contain any nuts? I'm allergic.",
        "vietnamese": "Món súp này có đậu phộng không? Tôi bị dị ứng.",
        "category": "Shopping & Dining",
        "contextNote": "Hỏi thông tin món ăn khi có dị ứng."
    },
    {
        "id": "phrase_0007",
        "english": "Can I try this jacket on? Where is the fitting room?",
        "vietnamese": "Tôi có thể thử chiếc áo khoác này không? Phòng thay đồ ở đâu thế?",
        "category": "Shopping & Dining",
        "contextNote": "Sử dụng khi mua quần áo."
    },
    {
        "id": "phrase_0008",
        "english": "Is there any discount on this item?",
        "vietnamese": "Mặt hàng này có được giảm giá không?",
        "category": "Shopping & Dining",
        "contextNote": "Dùng khi muốn hỏi giá khuyến mãi."
    },

    # TRAVEL & DIRECTIONS
    {
        "id": "phrase_0009",
        "english": "Excuse me, could you tell me how to get to the train station?",
        "vietnamese": "Xin lỗi, bạn có thể chỉ tôi đường ra ga tàu hỏa được không?",
        "category": "Travel & Directions",
        "contextNote": "Hỏi đường đi một cách lịch sự."
    },
    {
        "id": "phrase_0010",
        "english": "Is it within walking distance or should I take a cab?",
        "vietnamese": "Chỗ đó có đi bộ tới được không hay tôi nên bắt taxi?",
        "category": "Travel & Directions",
        "contextNote": "Hỏi về khoảng cách điểm đến."
    },
    {
        "id": "phrase_0011",
        "english": "Could you recommend any good local restaurants around here?",
        "vietnamese": "Bạn có thể gợi ý nhà hàng nào ngon gần đây không?",
        "category": "Travel & Directions",
        "contextNote": "Hỏi xin gợi ý quán ăn từ người bản xứ."
    },
    
    # SOCIAL INTERACTIONS
    {
        "id": "phrase_0012",
        "english": "I'm sorry, I didn't quite catch that. Could you repeat it?",
        "vietnamese": "Xin lỗi, tôi chưa nghe rõ lắm. Bạn có thể nhắc lại được không?",
        "category": "Social Interactions",
        "contextNote": "Cách lịch sự khi muốn người khác lặp lại câu nói."
    },
    {
        "id": "phrase_0013",
        "english": "Thank you so much for your help, I really appreciate it.",
        "vietnamese": "Cảm ơn bạn rất nhiều vì đã giúp đỡ, tôi thực sự trân trọng điều đó.",
        "category": "Social Interactions",
        "contextNote": "Lời cảm ơn chân thành, ấm áp."
    },
    {
        "id": "phrase_0014",
        "english": "No worries! Don't mention it.",
        "vietnamese": "Không sao đâu! Đừng bận tâm.",
        "category": "Social Interactions",
        "contextNote": "Trả lời khi người khác cảm ơn."
    }
]

# Write to files
with open("HaniVoca/Resources/words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=4)

with open("HaniVoca/Resources/phrases.json", "w", encoding="utf-8") as f:
    json.dump(phrases, f, ensure_ascii=False, indent=4)

print(f"Successfully generated {len(words)} vocabulary words and {len(phrases)} phrases.")
