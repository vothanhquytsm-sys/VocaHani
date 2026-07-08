"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pull = pull;
exports.push = push;
const database_1 = __importDefault(require("../config/database"));
async function pull(req, res) {
    const userId = req.user?.id;
    if (!userId)
        return res.status(400).json({ error: 'Mã người dùng không hợp lệ.' });
    try {
        // 1. Fetch user progress record
        const progressQuery = database_1.default.prepare('SELECT * FROM user_progress WHERE user_id = ?');
        let progress = progressQuery.get(userId);
        if (!progress) {
            // Initialize progress row on first access
            const now = new Date().toISOString();
            const insertProgress = database_1.default.prepare(`
        INSERT INTO user_progress (user_id, learned_word_ids, favorite_word_ids, favorite_phrase_ids, passed_lessons, completed_readings, srs_map, albums, updated_at)
        VALUES (?, '[]', '[]', '[]', '[]', '{}', '{}', '[]', ?)
      `);
            insertProgress.run(userId, now);
            progress = {
                learned_word_ids: '[]',
                favorite_word_ids: '[]',
                favorite_phrase_ids: '[]',
                passed_lessons: '[]',
                completed_readings: '{}',
                srs_map: '{}',
                albums: '[]',
                ielts_progress: '{}',
                updated_at: now
            };
        }
        // 2. Fetch user custom words list
        const customWordsQuery = database_1.default.prepare('SELECT * FROM user_custom_words WHERE user_id = ?');
        const customWordsRaw = customWordsQuery.all(userId);
        const customWords = customWordsRaw.map(w => ({
            id: w.id,
            word: w.word,
            ipa: w.ipa,
            vietnameseMeaning: w.vietnamese_meaning,
            exampleEnglish: w.example_english || '',
            exampleVietnamese: w.example_vietnamese || '',
            topic: w.topic || 'Từ của tôi',
            level: w.level || 'A1',
            symbolName: w.symbol_name || 'pencil.circle.fill',
            isCustom: true,
            isLearned: false,
            isFavorite: false
        }));
        return res.json({
            learnedWordIds: JSON.parse(progress.learned_word_ids || '[]'),
            favoriteWordIds: JSON.parse(progress.favorite_word_ids || '[]'),
            favoritePhraseIds: JSON.parse(progress.favorite_phrase_ids || '[]'),
            passedLessons: JSON.parse(progress.passed_lessons || '[]'),
            completedReadings: JSON.parse(progress.completed_readings || '{}'),
            srsMap: JSON.parse(progress.srs_map || '{}'),
            albums: JSON.parse(progress.albums || '[]'),
            ieltsProgress: JSON.parse(progress.ielts_progress || '{}'),
            customWords,
            updatedAt: progress.updated_at
        });
    }
    catch (error) {
        console.error('Pull error:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ khi tải tiến độ học.' });
    }
}
async function push(req, res) {
    const userId = req.user?.id;
    if (!userId)
        return res.status(400).json({ error: 'Mã người dùng không hợp lệ.' });
    const { learnedWordIds, favoriteWordIds, favoritePhraseIds, passedLessons, completedReadings, srsMap, albums, ieltsProgress, customWords } = req.body;
    try {
        const now = new Date().toISOString();
        // Use SQL transactions to bundle database modifications
        const syncTransaction = database_1.default.transaction(() => {
            // Update progress variables
            const updateProgress = database_1.default.prepare(`
        INSERT INTO user_progress (user_id, learned_word_ids, favorite_word_ids, favorite_phrase_ids, passed_lessons, completed_readings, srs_map, albums, ielts_progress, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          learned_word_ids = excluded.learned_word_ids,
          favorite_word_ids = excluded.favorite_word_ids,
          favorite_phrase_ids = excluded.favorite_phrase_ids,
          passed_lessons = excluded.passed_lessons,
          completed_readings = excluded.completed_readings,
          srs_map = excluded.srs_map,
          albums = excluded.albums,
          ielts_progress = excluded.ielts_progress,
          updated_at = excluded.updated_at
      `);
            updateProgress.run(userId, JSON.stringify(learnedWordIds || []), JSON.stringify(favoriteWordIds || []), JSON.stringify(favoritePhraseIds || []), JSON.stringify(passedLessons || []), JSON.stringify(completedReadings || {}), JSON.stringify(srsMap || {}), JSON.stringify(albums || []), JSON.stringify(ieltsProgress || {}), now);
            // Clean old custom words and write the synchronized list
            const deleteCustom = database_1.default.prepare('DELETE FROM user_custom_words WHERE user_id = ?');
            deleteCustom.run(userId);
            if (customWords && Array.isArray(customWords)) {
                const insertCustom = database_1.default.prepare(`
          INSERT INTO user_custom_words (id, user_id, word, ipa, vietnamese_meaning, example_english, example_vietnamese, topic, level, symbol_name, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
                for (const w of customWords) {
                    insertCustom.run(w.id, userId, w.word, w.ipa || '/.../', w.vietnameseMeaning, w.exampleEnglish || '', w.exampleVietnamese || '', w.topic || 'Từ của tôi', w.level || 'A1', w.symbolName || 'pencil.circle.fill', now);
                }
            }
        });
        syncTransaction();
        return res.json({ success: true, updatedAt: now });
    }
    catch (error) {
        console.error('Push error:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ khi đồng bộ tiến độ.' });
    }
}
