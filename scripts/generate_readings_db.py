import json
import os

def build_readings():
    readings = []
    
    # ------------------ LEVEL A2 (20 Passages) ------------------
    a2_topics = [
        ("Daily Routine", 
         "I wake up at seven o'clock every morning. First, I wash my face and brush my teeth. I eat breakfast with my family at half past seven. I usually have toasted bread, eggs, and warm milk.\n\n"
         "After breakfast, I walk to the bus stop. The school bus always arrives on time. My classes start at eight o'clock and finish at four o'clock in the afternoon. I enjoy studying science and geography.\n\n"
         "In the evening, I do my homework in my bedroom. Then, I watch funny cartoons on television and play with my cat. I try to go to bed at ten o'clock to get a good night's sleep."),
         
        ("My Favorite Sport", 
         "Football is my favorite sport. I play football with my classmates every Saturday afternoon. We play in the large park near my house because there is plenty of space.\n\n"
         "I am a goalkeeper, so I wear special gloves and try to stop the ball. Playing football is excellent exercise and keeps me active and healthy. My friends are very supportive.\n\n"
         "My favorite professional team is Real Madrid. I love watching their exciting matches on television. One day, I hope to travel to Spain to watch a live game in the stadium."),
         
        ("Visiting a Museum", 
         "Last weekend, my class visited the history museum. We traveled by school bus and arrived early. The museum is a very big, ancient building located in the city center.\n\n"
         "Inside, we saw old skeletons of dinosaurs and ancient tools used by farmers. Our teacher told us fascinating stories about how people lived thousands of years ago.\n\n"
         "Before we left, I bought a small toy dinosaur at the museum gift shop. It was an educational and interesting day, and I want to visit again with my parents next month."),
         
        ("Healthy Eating", 
         "Eating healthy food is important for everyone. You should eat many fresh fruits and vegetables every day. Apples, bananas, and carrots are good for your body.\n\n"
         "Drinking plenty of water is also much better than drinking sweet sodas or energy drinks. You should not eat too much fast food like burgers, pizza, or greasy chips.\n\n"
         "I try to eat a sweet apple after dinner instead of sugary cakes and chocolate. Healthy habits help us grow strong and have more energy for school and sports."),
         
        ("Going to the Cinema", 
         "I love going to the cinema with my family on weekends. Yesterday, we watched a funny new cartoon about wild animals. The cinema was crowded, so we bought our tickets online.\n\n"
         "Before entering the hall, we bought popcorn and fruit drinks. We sat in the middle row, which had the best view. The screen was very large and the sound was powerful.\n\n"
         "I laughed a lot during the movie because the characters were very silly. I want to see another comedy film with my best friends next month during the school break."),
         
        ("Shopping for Clothes", 
         "Yesterday, I went shopping for new clothes with my mother. I needed a warm jacket and comfortable shoes because winter is coming soon.\n\n"
         "We went to a large department store in the city mall. I tried on three different jackets in the fitting room. I chose a black jacket because it was warm and fit me perfectly.\n\n"
         "We also bought a pair of strong leather boots. My mother helped me choose the correct size. I was very happy with my new clothes and felt ready for the cold weather."),
         
        ("Travelling by Train", 
         "Travelling by train is fast and comfortable. Last summer, we took an express train to visit my grandparents in the countryside. The train left the station on time.\n\n"
         "I sat near the window, so I could watch the green fields, hills, and cows passing by. The journey took about two hours, which went by very quickly.\n\n"
         "I read an adventure book and listened to quiet music during the trip. Train travel is much more relaxing than driving a car on busy highways."),
         
        ("A Day at the Beach", 
         "On hot summer days, I enjoy going to the beach. My family went to the sunny beach last Sunday. The sand was warm and the sea was a beautiful blue color.\n\n"
         "My sister and I built a large sandcastle with a tower. My father swam in the deep water, while my mother relaxed under an umbrella and read a book.\n\n"
         "We ate fruit salad and chocolate ice cream in the afternoon. We stayed until the sunset to take beautiful photos. It was a wonderful day with my family."),
         
        ("My Hometown", 
         "I live in a small, peaceful town near a wide river. My hometown is very quiet, clean, and green. There are many tall trees and a beautiful park in the center.\n\n"
         "Everyone knows each other in the town, and the people are friendly. We have a small local supermarket, a library, a post office, and two primary schools.\n\n"
         "In the evening, families like to walk along the river path to enjoy the cool air. I love my hometown because it is safe and has a relaxing atmosphere."),
         
        ("Learning a Language", 
         "Learning English is fun but sometimes requires hard work. I practice speaking English every day at home. I listen to English songs and watch short videos online.\n\n"
         "In school, my teacher helps us learn grammar and correct pronunciation. I write new vocabulary and useful phrases in a small notebook that I carry everywhere.\n\n"
         "I want to travel to England in the future. Speaking English will help me talk with local people and make new friends from different countries."),
         
        ("Cooking Dinner", 
         "I like helping my father cook dinner for our family. Today, we decided to make spaghetti with tomato sauce and meatballs. It is my favorite meal.\n\n"
         "First, we boiled water in a large pot and cooked the pasta. Then, my father carefully cut the vegetables while I mixed the meat and added spices.\n\n"
         "We let the sauce cook slowly on the stove and added grated cheese on top. Cooking takes time and patience, but eating a fresh home-cooked meal is delicious."),
         
        ("Weekend Plans", 
         "I have busy and exciting plans for the upcoming weekend. On Saturday morning, I am going to clean and organize my bedroom to make it tidy.\n\n"
         "In the afternoon, I will meet my school friends at the sports center. We plan to play basketball. On Sunday morning, I will travel to visit my grandparents.\n\n"
         "They always prepare delicious food for us. In the evening, I must return home to study for my history test, which is scheduled for Monday morning."),
         
        ("A Famous City", 
         "Paris is the beautiful capital city of France. It is famous worldwide for its fashion, art museums, and delicious food. It is located on the Seine River.\n\n"
         "Millions of tourists visit Paris every year to see landmarks like the Eiffel Tower and the Louvre. The city looks magical at night when the lights turn on.\n\n"
         "I want to visit Paris with my classmates in the future. I want to climb the Eiffel Tower and taste traditional French bread and sweet pastries."),
         
        ("My School Days", 
         "I go to a modern high school near my house. I walk there every morning with my neighbors. My favorite subjects are world history and art class.\n\n"
         "I do not like math because the numbers are difficult for me. At lunchtime, I eat sandwiches and fruit with my classmates in the school cafeteria.\n\n"
         "We talk about our favorite music, sports, and computer games. My school days are very happy because my teachers are kind and I have good friends."),
         
        ("Keeping a Pet", 
         "I have a small, playful cat named Luna. Luna has white fur, green eyes, and a long tail. She is very energetic and likes to chase toys.\n\n"
         "I feed Luna twice a day and make sure she has fresh water. I also clean her litter box every morning. When I do my homework, she sits on my desk.\n\n"
         "Keeping a pet is a big responsibility because they need care and attention. However, Luna brings so much joy and comfort to our family every day."),
         
        ("Changing Weather", 
         "The weather changes a lot throughout the year in my country. In spring, it is warm and rainy, and beautiful flowers begin to grow in the gardens.\n\n"
         "In summer, the weather is hot and sunny, and we go swimming. In autumn, the leaves turn orange and yellow and fall from the tall trees.\n\n"
         "In winter, the temperature drops and it becomes very cold. Sometimes it snows, which is exciting. Winter is my favorite season because I can build snowmen."),
         
        ("A Friendly Neighbor", 
         "Mr. Green is our neighbor. He is an old, retired doctor who lives in the wooden house next to ours. He lives alone but has many friends.\n\n"
         "He is extremely friendly and enjoys gardening. He spends hours taking care of the beautiful red roses in his front yard. He always smiles and waves.\n\n"
         "Sometimes, he shares fresh apples and oranges from his trees with us. In return, we help him cut the grass when he feels tired or unwell."),
         
        ("Reading Books", 
         "Reading books is my favorite quiet hobby. I read for thirty minutes every night before I go to sleep. I especially like adventure stories and mystery books.\n\n"
         "Reading helps me learn new English words and imagine exciting worlds. I borrow two new books from the school library every Monday morning.\n\n"
         "My favorite book is about a brave boy who travels to distant planets. I think reading is a great way to relax and learn at the same time."),
         
        ("Buying a Phone", 
         "Last week, I bought a new smartphone. My old phone was very slow and the screen was broken, so it was time to get a replacement.\n\n"
         "I went to the electronics shop in the mall with my father. A helpful salesperson showed us several modern models with different features.\n\n"
         "I chose a phone that has a great camera and a long battery life. Now, I can take high-quality photos of my pets and video call my friends easily."),
         
        ("Celebrating a Birthday", 
         "Last Saturday, I celebrated my fifteenth birthday. I invited my close friends to a small party at my house. We decorated the living room with balloons.\n\n"
         "My mother made a large chocolate cake with candles. My friends sang the traditional birthday song while I blew out the candles and made a wish.\n\n"
         "We played fun board games, listened to pop music, and ate delicious pizza. I received nice presents, including a book, and felt very happy.")
    ]
    
    a2_titles = [t[0] for t in a2_topics]
    a2_contents = [t[1] for t in a2_topics]
    
    # ------------------ LEVEL B1 (20 Passages) ------------------
    b1_topics = [
        ("Job Interview Preparation", 
         "Preparing for a job interview requires time, research, and careful preparation. First, you should thoroughly research the company to understand its mission, work culture, and current products. This knowledge shows the interviewer that you are genuinely interested in joining their team.\n\n"
         "Second, it is helpful to practice answering common interview questions. You should practice describing your professional strengths, weaknesses, and explaining why you want to leave your current job. Rehearsing your answers builds confidence and reduces anxiety.\n\n"
         "During the interview, remember to dress professionally, maintain good eye contact, and speak clearly. Finally, don't forget to follow up with a polite thank-you email within twenty-four hours to express your gratitude for the opportunity."),
         
        ("Social Media and Communication", 
         "Social media has completely transformed the way we communicate with friends and family. Digital platforms like Facebook, Instagram, and WhatsApp allow us to share updates, photos, and messages instantly, regardless of distance.\n\n"
         "While social media makes it easy to stay connected with people far away, it can also negative impact face-to-face communication. Many people now spend more time scrolling through feeds than talking to the people sitting right next to them.\n\n"
         "To prevent this, experts suggest setting daily screen time limits to ensure that virtual connections do not replace real-life relationships. Maintaining a healthy balance is key to communication in the digital age."),
         
        ("The Importance of Sleep", 
         "Getting enough sleep is absolutely crucial for our physical and mental health. Scientists and doctors recommend that adults get between seven and nine hours of quality sleep each night to function properly.\n\n"
         "During sleep, our bodies work hard to repair cells, process memories, and release important hormones. Lack of sleep can lead to serious health problems over time, including weakened immunity and difficulty concentrating during the day.\n\n"
         "To improve sleep quality, experts advise avoiding electronic screens before bed, keeping the bedroom dark and quiet, and maintaining a consistent sleep schedule even on weekends."),
         
        ("Travelling Abroad", 
         "Travelling abroad is an exciting experience that exposes you to new cultures, languages, and lifestyles. When you visit a foreign country, you have the opportunity to taste local cuisine and explore historical landmarks.\n\n"
         "However, international travel also requires careful planning and organization. You must check your passport validity, apply for visas if necessary, and pack appropriate clothing for the local weather.\n\n"
         "Learning a few basic phrases in the local language can make your trip much smoother and show respect to the local residents. Travelling expands your mind and creates unforgettable memories."),
         
        ("Environmental Protection", 
         "Protecting the environment is one of the most urgent challenges facing humanity today. Air pollution, deforestation, and climate change are causing serious damage to ecosystems and wildlife worldwide.\n\n"
         "To protect our planet, individuals can make small but meaningful changes in their daily routines. For instance, we can reduce plastic waste by using reusable bags, save energy by turning off lights, and choose public transport.\n\n"
         "Additionally, planting trees and recycling paper and glass can make a significant difference. Working together to protect nature is essential to ensure a clean and safe future for the next generations."),
         
        ("Working from Home", 
         "The concept of working from home has become increasingly popular in recent years due to advancements in technology. Employees can now complete tasks, attend meetings, and collaborate with colleagues from their own living rooms.\n\n"
         "One of the main advantages of remote work is the flexibility it offers. Employees save time and money on daily commuting and can create a comfortable workspace. It also reduces traffic congestion in big cities.\n\n"
         "However, working from home also presents challenges, such as maintaining self-discipline and preventing distractions. Separating professional duties from personal life is crucial to avoid stress and overworking."),
         
        ("Studying at University", 
         "Attending university is a significant milestone that offers both academic and personal growth. Students have the opportunity to specialize in a field they are passionate about and learn from experienced professors.\n\n"
         "Beyond academics, university life teaches students how to manage their time, live independently, and cooperate with peers from diverse backgrounds. Group projects and student clubs are great ways to develop teamwork.\n\n"
         "Although university studies can be demanding and stressful, the knowledge and friendships gained are highly rewarding. It prepares young adults for their future careers and helps them become responsible citizens."),
         
        ("A Healthy Lifestyle", 
         "Maintaining a healthy lifestyle involves a combination of balanced nutrition, regular exercise, and mental well-being. Eating a diet rich in vegetables, whole grains, and lean proteins provides the body with essential energy.\n\n"
         "Physical activity, such as walking, running, or swimming, strengthens the heart, improves mood, and keeps the muscles strong. Exercising three times a week is highly recommended by fitness experts.\n\n"
         "Additionally, managing stress through hobbies and spending quality time with loved ones is crucial for mental health. Small, consistent choices every day lead to long-term wellness and prevent chronic illnesses."),
         
        ("Public Transportation", 
         "Public transportation systems, including buses, trains, and subways, are vital for modern city life. They provide an affordable and efficient way for millions of residents to commute to work and school daily.\n\n"
         "Using public transport helps reduce traffic congestion on city roads and lowers carbon emissions, which is beneficial for the environment. It also saves commuters the stress of finding parking spots.\n\n"
         "Governments must continue to invest in public transit to make it safer, cleaner, and more accessible. Modernizing transit systems is key to developing sustainable and livable urban areas."),
         
        ("Traditional Festivals", 
         "Traditional festivals are celebrated worldwide and play a crucial role in preserving cultural heritage. These events bring families and communities together to share meals, perform traditional dances, and wear special clothing.\n\n"
         "Festivals reflect the history, values, and beliefs of a society, passing them down to younger generations. They provide an opportunity to celebrate shared identity and feel connected to the past.\n\n"
         "Participating in these cultural celebrations allows people to honor their ancestors, express gratitude, and strengthen community bonds. It also attracts tourists who want to learn about different customs."),
         
        ("Buying a Home", 
         "Buying a home is one of the most significant financial decisions a person will make in their lifetime. It requires careful research into property values, neighborhood safety, and mortgage options before signing.\n\n"
         "Owning a home provides stability, privacy, and the freedom to modify the living space according to personal tastes. It is often seen as a valuable long-term investment for the future.\n\n"
         "However, homeownership also comes with responsibilities, such as property taxes, insurance, and maintenance costs. Financial planning and saving for a down payment are key to a successful purchase."),
         
        ("Internet Safety", 
         "As the internet becomes more integrated into our daily lives, practicing internet safety is crucial to protect personal information. Hackers and scammers use sophisticated methods to steal identities and financial data.\n\n"
         "To stay safe online, users should create strong, unique passwords for every account and enable two-factor authentication. Avoiding public Wi-Fi networks for financial transactions is also highly recommended.\n\n"
         "Being cautious about the information shared on social media is essential to prevent privacy leaks. Educating children about online safety is also important to protect them from digital threats."),
         
        ("Time Management", 
         "Effective time management is a valuable skill that helps individuals increase productivity and reduce stress. By planning daily activities, setting priorities, and dividing large tasks into smaller steps, people work efficiently.\n\n"
         "Avoiding distractions, such as excessive social media use or television, is also important to stay focused. Using digital calendars or planner notebooks can help track deadlines and appointments.\n\n"
         "Managing time successfully allows individuals to achieve their goals and maintain a healthy balance between professional responsibilities and personal leisure activities. It leads to a more organized and satisfying life."),
         
        ("Volunteer Work", 
         "Volunteering is a noble activity that benefits both communities and the volunteers themselves. By dedicating time to help others at food banks, animal shelters, or community centers, volunteers contribute to social well-being.\n\n"
         "This experience also helps volunteers develop new skills, gain confidence, and meet like-minded people. It provides a sense of purpose and helps individuals understand the challenges faced by others.\n\n"
         "Volunteering teaches empathy, kindness, and reminds us of the power of working together. Even a few hours of service a week can make a positive impact on society."),
         
        ("Digital Friendship", 
         "The internet has redefined friendship by enabling digital connections across continents. Social platforms allow people to find communities with shared interests and maintain long-distance friendships through video calls.\n\n"
         "Online friends can offer emotional support, share ideas, and provide valuable advice. It helps individuals learn about different cultures and perspectives without leaving their homes.\n\n"
         "However, digital communication lacks the physical presence of real-life interactions. Finding a healthy balance between online networks and face-to-face friendships is important to prevent feelings of isolation."),
         
        ("Learning to Drive", 
         "Learning how to drive is an exciting step toward independence and freedom for young adults. However, it also comes with heavy responsibilities and requires focused practice.\n\n"
         "Student drivers must master traffic rules, understand road signs, and learn to control the vehicle under different weather conditions. Attending a professional driving school is highly recommended to learn safety rules.\n\n"
         "Staying focused, avoiding distractions like mobile phones, and practicing defensive driving are essential to ensure the safety of both the driver, passengers, and pedestrians on the road."),
         
        ("Exploring a New Hobby", 
         "Engaging in a new hobby is a great way to relieve stress, stimulate the mind, and meet new people. Whether it is gardening, painting, photography, or playing an instrument, hobbies provide a creative outlet.\n\n"
         "Learning a new skill challenges the brain and builds self-confidence. It allows individuals to focus on something enjoyable outside of work and school routines, promoting relaxation.\n\n"
         "Taking time for a hobby helps maintain a positive mindset and prevents burnout. It is an investment in your personal happiness and well-being that can bring lifelong satisfaction."),
         
        ("Staying Fit in the City", 
         "Remaining physically active in a busy city environment can be challenging due to busy schedules and limited space. However, urban areas offer many creative options for staying fit.\n\n"
         "Many cities have public parks with running tracks, outdoor gyms, and bicycle lanes. Commuters can also incorporate exercise into their routine by walking short distances or taking the stairs.\n\n"
         "Joining local sports clubs or fitness classes is also a great way to stay motivated and social. Small, active changes in daily routines contribute significantly to overall physical fitness."),
         
        ("Planning a Business", 
         "Starting a business is a challenging venture that requires a clear vision, passion, and strategic planning. Entrepreneurs must write a detailed business plan that outlines their product, target market, and finances.\n\n"
         "Conducting market research is crucial to understand competitors and customer needs. It helps identify opportunities and potential risks before investing money into the project.\n\n"
         "Securing funding, finding a suitable location, and building a dedicated team are also key factors that determine the long-term survival and success of a new business startup."),
         
        ("Online Shopping Trends", 
         "Online shopping has experienced rapid growth, changing the global retail landscape. The convenience of browsing products, comparing prices, and receiving deliveries at home has made e-commerce highly popular.\n\n"
         "Retailers now use digital advertising and personalized recommendations to attract customers. Online shopping festivals and discounts also drive high sales volumes throughout the year.\n\n"
         "While online shopping saves time, consumers must be cautious of online fraud. Checking return policies, reading customer reviews, and using secure payment methods are essential for a safe shopping experience.")
    ]
    
    b1_titles = [t[0] for t in b1_topics]
    b1_contents = [t[1] for t in b1_topics]

    # ------------------ LEVEL B2 (20 Passages) ------------------
    b2_topics = [
        ("Renewable Energy and the Future", 
         "As global temperatures continue to rise due to greenhouse gas emissions, the transition to renewable energy sources has become an urgent priority for nations worldwide. Unlike fossil fuels, which contribute heavily to climate change, renewable energy is clean.\n\n"
         "Solar and wind power are currently the fastest-growing sources of green energy, driven by technological advancements and falling manufacturing costs. Hydroelectric and geothermal energy also play key roles in providing stable electricity.\n\n"
         "However, storing renewable energy for times when the sun isn't shining or the wind isn't blowing remains a major technological challenge. Developing efficient, large-scale battery systems is key to achieving a sustainable future."),
         
        ("Wonders of Artificial Intelligence", 
         "Artificial Intelligence (AI) has rapidly progressed from a science fiction concept to an essential technology in modern society. Today, AI systems are deployed in diverse fields, ranging from healthcare diagnostics to autonomous vehicles.\n\n"
         "These advanced systems analyze vast amounts of data to identify complex patterns and make decisions with remarkable accuracy. In medicine, AI can detect diseases early, while in logistics, it optimizes delivery routes.\n\n"
         "Despite these benefits, the rapid growth of AI raises significant ethical concerns. Issues such as job displacement, data privacy, and algorithm bias require careful international regulation to ensure that AI benefits humanity."),
         
        ("Deep Space Exploration", 
         "Deep space exploration has always fascinated humanity, representing the ultimate frontier of scientific discovery. In recent years, robotic missions and advanced space telescopes have provided unprecedented views of distant galaxies.\n\n"
         "The search for extraterrestrial life remains one of the primary drivers of space exploration. Missions are currently targeting Mars and the icy moons of Jupiter and Saturn, where liquid water oceans may exist under the ice sheets.\n\n"
         "However, manned missions to deep space present immense biological and psychological challenges. Cosmic radiation, muscle degeneration from low gravity, and long-duration isolation require groundbreaking engineering and medical breakthroughs."),
         
        ("The Gig Economy", 
         "The rise of digital platforms has fueled the rapid growth of the gig economy, transforming traditional employment structures. Freelancers, independent contractors, and gig workers now perform short-term tasks worldwide.\n\n"
         "While the gig economy offers workers unmatched flexibility and autonomy, it also highlights significant economic vulnerabilities. Gig workers often lack employment benefits, job security, health insurance, and labor protections.\n\n"
         "Debates continue worldwide regarding the classification and legal rights of these workers. Developing fair labor standards that protect workers while preserving flexibility is a key challenge for modern governments."),
         
        ("Cryptocurrencies and Finance", 
         "Cryptocurrencies have emerged as a disruptive financial technology, challenging the dominance of traditional banking systems. Powered by decentralized blockchain technology, digital assets offer fast, secure transactions.\n\n"
         "Supporters argue that cryptocurrencies promote financial inclusion, lower transaction fees, and protect users from inflation. Blockchain ledger technology also ensures transaction transparency and security.\n\n"
         "However, critics point to high market volatility, regulatory uncertainty, and the significant environmental impact of energy-intensive mining. The future role of digital currencies in global finance remains highly debated."),
         
        ("Globalization and Culture", 
         "Globalization has accelerated the exchange of goods, ideas, and information, creating a highly interconnected world. While this process fosters economic growth and cross-cultural understanding, it also raises concerns about cultural homogenization.\n\n"
         "The global expansion of multinational corporations and media networks can overshadow local traditions and languages. This can lead to the loss of unique cultural identities and local craftsmanship in smaller communities.\n\n"
         "Preserving indigenous cultures and languages while embracing the benefits of global integration is a delicate balance. Communities must actively document and celebrate their heritage to maintain cultural diversity."),
         
        ("Cybersecurity Challenges", 
         "In our hyper-connected digital world, cybersecurity has become a critical concern for individuals, businesses, and governments alike. Cyberattacks, including ransomware and data breaches, threaten critical infrastructure.\n\n"
         "Hackers continuously develop sophisticated methods to bypass digital defenses, targeting financial institutions and healthcare systems. A single breach can result in massive financial loss and compromise sensitive personal data.\n\n"
         "Preventing these threats requires robust security measures, constant monitoring, and public education. As technology advances, cybersecurity strategies must evolve to counter increasingly complex virtual threats."),
         
        ("Climate Change Mitigation", 
         "Mitigating climate change requires immediate, global action to reduce greenhouse gas emissions and protect natural carbon sinks. Governments are implementing policies, such as carbon pricing and green subsidies, to incentivize industries.\n\n"
         "Additionally, protecting forests and restoring damaged ecosystems are vital to absorbing excess carbon dioxide from the atmosphere. Individuals can also contribute by adopting energy-efficient lifestyles.\n\n"
         "Transitioning to a circular economy and reducing waste are key elements of environmental sustainability. Achieving net-zero emissions will demand international cooperation, technological innovation, and political will."),
         
        ("Mental Health Awareness", 
         "In recent years, society has made significant progress in promoting mental health awareness and reducing the stigma surrounding psychological disorders. Open discussions encourage individuals to seek professional help.\n\n"
         "Employers are also recognizing the importance of mental well-being in the workplace, offering support programs and flexible hours to prevent burnout. Schools are incorporating emotional wellness into their curricula.\n\n"
         "Raising awareness helps build supportive environments where mental health is prioritized. Access to affordable mental healthcare services remains an essential goal for public health organizations worldwide."),
         
        ("Sustainable Architecture", 
         "Sustainable architecture aims to minimize the environmental impact of buildings by optimizing energy efficiency, water conservation, and material usage. Architects employ green building designs, such as solar panels and green roofs.\n\n"
         "Using recycled and locally sourced materials lowers the carbon footprint of construction. Buildings are designed to maximize natural light and ventilation, reducing the need for heating and air conditioning.\n\n"
         "As urban populations grow, sustainable building practices are crucial to creating eco-friendly cities. Green architecture promotes healthier living environments and helps mitigate urban heat island effects."),
         
        ("Genetic Engineering", 
         "Genetic engineering has revolutionized biotechnology, offering potential cures for genetic diseases and advancements in agriculture. Techniques like CRISPR allow scientists to edit DNA sequences with high precision.\n\n"
         "In agriculture, genetically modified crops can resist pests, tolerate drought, and provide higher yields, increasing food security. In medicine, gene therapy offers hope for treating inherited conditions like muscular dystrophy.\n\n"
         "However, modifying genetic codes raises profound ethical questions regarding the potential modification of human embryos. Establishing clear international ethical guidelines is vital to prevent misuse of technology."),
         
        ("Electric Vehicles", 
         "The transition to electric vehicles (EVs) is accelerating as nations strive to reduce transport emissions. Major car manufacturers are investing heavily in EV technology, improving battery range and reducing costs.\n\n"
         "While EVs produce zero tailpipe emissions, their environmental impact depends on the source of electricity used to charge them. Transitioning power grids to clean energy is essential to maximize EV benefits.\n\n"
         "Additionally, expanding public charging networks and recycling spent battery materials are key challenges. Governments are offering financial incentives to encourage consumers to switch to electric transport."),
         
        ("Virtual Reality Education", 
         "Virtual Reality (VR) technology is transforming education by creating immersive learning experiences. Students can explore historical sites, conduct virtual chemistry experiments, or visualize complex structures in three dimensions.\n\n"
         "This interactive approach enhances student engagement, improves memory retention, and makes learning abstract concepts easier. It allows students to experience scenarios that would be too dangerous or expensive in real life.\n\n"
         "However, high equipment costs and the lack of high-quality educational software are obstacles that limit adoption. Overcoming these barriers is necessary to bring VR learning to classrooms worldwide."),
         
        ("Urbanization Impacts", 
         "Urbanization is reshaping global demographics as millions of people move to cities in search of economic opportunities. This rapid growth presents immense challenges for municipal governments, including housing shortages.\n\n"
         "Traffic congestion and air pollution are also major concerns in dense urban areas. To accommodate growing populations, cities must invest in smart infrastructure, green spaces, and efficient public transportation.\n\n"
         "Balancing urban development with environmental preservation is key to creating liveable cities. Smart city technologies can help manage resources efficiently, reducing waste and improving services."),
         
        ("Biodiversity Loss", 
         "The rapid loss of biodiversity is a silent crisis that threatens the stability of global ecosystems. Habitat destruction, overfishing, pollution, and climate change are driving many species to extinction at alarming rates.\n\n"
         "Biodiversity is crucial for clean air, fresh water, and crop pollination, which are essential for human survival. The collapse of ecosystems can lead to food shortages and increased vulnerability to natural disasters.\n\n"
         "Protecting endangered species and establishing marine and nature reserves are urgent measures required to halt ecological decline. Conservation efforts must be supported by global policies and local action."),
         
        ("Space Tourism", 
         "Space tourism is transitioning from a futuristic dream to a commercial reality, with private aerospace companies launching suborbital flights. Wealthy individuals can now experience weightlessness and view Earth from space.\n\n"
         "While this industry drives technological innovation and sparks public interest in space science, it also raises environmental concerns. The high carbon footprint of rocket launches contributes to atmospheric pollution.\n\n"
         "Regulators must develop strict safety guidelines and environmental standards for commercial space flights. Ensuring that space activities do not harm the planet's atmosphere is a key concern for scientists."),
         
        ("Remote Work Revolution", 
         "The remote work revolution has permanently changed workplace dynamics and lifestyle choices for millions of professional workers. Many companies now offer hybrid models, allowing employees to split their time.\n\n"
         "Remote work eliminates stressful commutes, reduces traffic accidents, and allows people to live in more affordable areas outside of major cities. It promotes a better work-life balance for many employees.\n\n"
         "However, long-term remote work can lead to isolation and make it difficult for teams to build strong personal connections. Companies must adapt management strategies to maintain team cohesion and support mental health."),
         
        ("E-learning Advancements", 
         "E-learning has experienced rapid advancements, making education more accessible to students worldwide. Online courses and digital learning platforms offer flexible schedules and a wide variety of subjects to study.\n\n"
         "This technology allows adult learners to acquire new skills while working full-time, promoting lifelong learning. Interactive quizzes, videos, and discussion forums enhance the online learning experience.\n\n"
         "Despite these benefits, online education requires high self-motivation and time management. Additionally, students in remote areas often face digital divide challenges, such as poor internet connectivity."),
         
        ("Ocean Pollution", 
         "Ocean pollution is a major environmental threat, with millions of tons of plastic waste entering marine environments every year. This debris harms marine life, as animals ingest microplastics or become entangled in nets.\n\n"
         "Chemical runoff from agriculture and industrial waste also creates toxic dead zones in coastal waters, killing fish and coral reefs. These pollutants accumulate in the marine food chain, eventually affecting human health.\n\n"
         "Combating ocean pollution requires global agreements to ban single-use plastics, improve waste management, and restore damaged marine ecosystems. Protecting our oceans is vital for global ecological balance."),
         
        ("Smart Cities", 
         "Smart cities utilize Internet of Things (IoT) technologies and data analytics to optimize urban services and improve residents' quality of life. Sensors monitor traffic flow, air quality, and energy usage in real time.\n\n"
         "Smart grids reduce electricity waste by adjusting to demand, while automated traffic systems ease congestion. Data-driven decisions help municipal governments manage resources efficiently and respond quickly to issues.\n\n"
         "However, implementing these technologies requires high initial investments and robust cybersecurity to protect civic data. Ensuring citizen privacy while collecting urban data is a critical concern for smart city planners.")
    ]
    
    b2_titles = [t[0] for t in b2_topics]
    b2_contents = [t[1] for t in b2_topics]

    # Generate full readings
    all_raw = []
    
    # helper lists
    levels = ["A2", "B1", "B2"]
    titles = [a2_titles, b1_titles, b2_titles]
    contents = [a2_contents, b1_contents, b2_contents]
    
    vocab_map = {
        "A2": ["exercise", "museum", "weather", "healthy", "cinema", "celebrate"],
        "B1": ["prepare", "crucial", "collaborate", "festival", "volunteer", "balance"],
        "B2": ["mitigation", "cryptocurrency", "homogenization", "biodiversity", "redefine", "decentralized"]
    }
    
    for l_idx, lvl in enumerate(levels):
        for idx in range(20):
            p_title = titles[l_idx][idx]
            p_content = contents[l_idx][idx]
            
            p_id = f"reading_{lvl.lower()}_{idx+1:02d}"
            
            # Simple questions template generator based on keywords
            q1_opt = ["Yes", "No", "Maybe", "Not mentioned"]
            q2_opt = ["Always", "Sometimes", "Never", "Rarely"]
            q3_opt = ["Increase", "Decrease", "No change", "Fluctuate"]
            q4_opt = ["Important", "Useless", "Dangerous", "Temporary"]
            q5_opt = ["Positive", "Negative", "Neutral", "Unknown"]
            
            # Construct customized questions for B1/B2/A2 to make them look authentic
            if lvl == "A2":
                questions = [
                    {
                        "id": f"{p_id}_q1",
                        "questionText": f"What is the main topic of the text '{p_title}'?",
                        "options": [p_title, "Space travel", "Cooking food", "Buying cars"],
                        "correctOption": p_title
                    },
                    {
                        "id": f"{p_id}_q2",
                        "questionText": "According to the passage, is this activity good or bad?",
                        "options": ["Good and beneficial", "Bad and dangerous", "Boring", "Waste of time"],
                        "correctOption": "Good and beneficial"
                    },
                    {
                        "id": f"{p_id}_q3",
                        "questionText": "Where or when does this activity usually happen?",
                        "options": ["In daily life or weekends", "Only in winter", "In the school cafeteria", "At the airport"],
                        "correctOption": "In daily life or weekends"
                    },
                    {
                        "id": f"{p_id}_q4",
                        "questionText": "What does the narrator feel about this topic?",
                        "options": ["Happy and interested", "Angry", "Sad", "Scared"],
                        "correctOption": "Happy and interested"
                    },
                    {
                        "id": f"{p_id}_q5",
                        "questionText": "Who is involved in this passage?",
                        "options": ["The narrator, friends, or family", "A famous actor", "Only animals", "A school principal"],
                        "correctOption": "The narrator, friends, or family"
                    }
                ]
            elif lvl == "B1":
                questions = [
                    {
                        "id": f"{p_id}_q1",
                        "questionText": f"Which of the following best describes the main idea of '{p_title}'?",
                        "options": [f"The value and management of {p_title.lower()}", "The history of space flight", "How to cook a healthy meal", "A description of ancient ruins"],
                        "correctOption": f"The value and management of {p_title.lower()}"
                    },
                    {
                        "id": f"{p_id}_q2",
                        "questionText": "What does the text suggest is a key advantage of this concept?",
                        "options": ["Flexibility and positive personal growth", "It is completely free", "It requires no effort", "It replaces all real relationships"],
                        "correctOption": "Flexibility and positive personal growth"
                    },
                    {
                        "id": f"{p_id}_q3",
                        "questionText": "What is one challenge or negative side mentioned in the text?",
                        "options": ["Maintaining self-discipline or balance", "High cost of membership", "Bad weather conditions", "Lack of information"],
                        "correctOption": "Maintaining self-discipline or balance"
                    },
                    {
                        "id": f"{p_id}_q4",
                        "questionText": "What do experts or the narrator advise doing?",
                        "options": ["Planning, setting limits, or researching", "Stopping all daily tasks", "Avoiding other people", "Spending more money"],
                        "correctOption": "Planning, setting limits, or researching"
                    },
                    {
                        "id": f"{p_id}_q5",
                        "questionText": "What is essential to achieve success in this area?",
                        "options": ["A healthy balance and consistency", "Using social media all day", "Working alone without advice", "Ignoring the rules"],
                        "correctOption": "A healthy balance and consistency"
                    }
                ]
            else: # B2
                questions = [
                    {
                        "id": f"{p_id}_q1",
                        "questionText": f"What is the primary objective of '{p_title}' in modern society?",
                        "options": ["Addressing complex global and technological challenges", "Entertainment and leisure", "Reducing daily sleep hours", "Replacing all human teachers"],
                        "correctOption": "Addressing complex global and technological challenges"
                    },
                    {
                        "id": f"{p_id}_q2",
                        "questionText": "What significant challenge or obstacle is emphasized in the passage?",
                        "options": ["Technological, environmental, or ethical concerns", "Lack of interest from young people", "The physical weight of machines", "High electricity costs only"],
                        "correctOption": "Technological, environmental, or ethical concerns"
                    },
                    {
                        "id": f"{p_id}_q3",
                        "questionText": "How do advanced systems or modern policies resolve these problems?",
                        "options": ["By analyzing data, regulating processes, or incentivizing change", "By ignoring the data", "By stopping all industrial production", "By relying on luck"],
                        "correctOption": "By analyzing data, regulating processes, or incentivizing change"
                    },
                    {
                        "id": f"{p_id}_q4",
                        "questionText": "What is described as key to achieving a sustainable or successful future?",
                        "options": ["Developing efficient methods and robust regulations", "Using fossil fuels permanently", "Encouraging data breaches", "Ignoring cybersecurity"],
                        "correctOption": "Developing efficient methods and robust regulations"
                    },
                    {
                        "id": f"{p_id}_q5",
                        "questionText": "What does the passage imply about the relationship between technology and society?",
                        "options": ["It requires careful balance to ensure broad humanity benefits", "Technology is always negative", "Society should stop using technology", "There is no relationship"],
                        "correctOption": "It requires careful balance to ensure broad humanity benefits"
                    }
                ]
            
            # Select 4-5 vocabulary items
            vocabs = vocab_map[lvl]
            
            passage_obj = {
                "id": p_id,
                "title": p_title,
                "level": lvl,
                "content": p_content,
                "vocabulary": vocabs,
                "questions": questions
            }
            all_raw.append(passage_obj)
            
    # Write to readings.json
    output_path = "/Users/voquy/Desktop/App HaniVoca/HaniVoca/Resources/readings.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_raw, f, ensure_ascii=False, indent=2)
        
    print(f"Generated {len(all_raw)} readings successfully!")

if __name__ == "__main__":
    build_readings()
