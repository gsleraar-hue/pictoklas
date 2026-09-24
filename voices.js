// Male/female for system voices. chrome.tts doesn't report a voice's gender, so it is read from the
// voice name: explicit "Male"/"Female" (Google UK English), or the first name of known Microsoft voices
// (Windows and Edge online voices; Edge spells some names in the language's own script).
var PKVoices = globalThis.PKVoices || (function () {
  const MALE = new Set([
    // Dutch
    'frank', 'maarten', 'arnaud',
    // Arabic
    'naayf', 'hamdan', 'ali', 'ismael', 'shakir', 'bassel', 'taim', 'fahed', 'rami', 'omar', 'jamal', 'abdullah', 'moaz', 'hamed', 'laith', 'hedi', 'saleh',
    'حمدان', 'علي', 'إسماعيل', 'شاكر', 'باسل', 'تيم', 'فهد', 'رامي', 'أحمد', 'جمال', 'عبدالله', 'معاذ', 'حامد', 'ليث', 'الهادي', 'صالح', 'عمر',
    // Ukrainian, Russian, Bulgarian
    'ostap', 'остап', 'dmitry', 'дмитрий', 'pavel', 'павел', 'borislav', 'борислав', 'ivan',
    // Turkish, Polish, Romanian, Hungarian, Lithuanian, Greek, Albanian
    'ahmet', 'tolga', 'marek', 'adam', 'emil', 'andrei', 'tamas', 'tamás', 'leonas', 'nestoras', 'νέστορας', 'ilir', 'stefanos', 'stefan',
    // Persian, Pashto, Urdu, Hindi, Somali, Amharic
    'farid', 'فرید', 'gulnawaz', 'گل نواز', 'asad', 'اسد', 'salman', 'سلمان', 'madhur', 'मधुर', 'hemant', 'muuse', 'ameha', 'አመሀ',
    // Spanish, Portuguese, French, English, German, Italian, Chinese, Vietnamese
    'alvaro', 'álvaro', 'pablo', 'jorge', 'raul', 'raúl', 'antonio', 'duarte', 'helio', 'hélio', 'henri', 'paul', 'remy', 'rémy', 'guy', 'david', 'mark',
    'george', 'ryan', 'thomas', 'william', 'conrad', 'stefan', 'killian', 'diego', 'cosimo', 'giuseppe', 'yunxi', 'yunjian', 'yunyang', 'kangkang', 'namminh'
  ]);
  const FEMALE = new Set([
    // Dutch
    'colette', 'fenna', 'dena', 'hanna',
    // Arabic
    'hoda', 'fatima', 'laila', 'amina', 'salma', 'rana', 'sana', 'noura', 'layla', 'iman', 'mouna', 'aysha', 'amal', 'zariyah', 'amany', 'reem', 'maryam',
    'فاطمة', 'ليلى', 'أمينة', 'سلمى', 'رنا', 'سناء', 'نورا', 'إيمان', 'منى', 'عائشة', 'أمل', 'زارية', 'أماني', 'ريم', 'مريم', 'هدى',
    // Ukrainian, Russian, Bulgarian
    'polina', 'поліна', 'svetlana', 'светлана', 'irina', 'ирина', 'dariya', 'дария', 'kalina', 'калина', 'ekaterina',
    // Turkish, Polish, Romanian, Hungarian, Lithuanian, Greek, Albanian
    'emel', 'seda', 'zofia', 'paulina', 'agnieszka', 'alina', 'noemi', 'noémi', 'ona', 'athina', 'αθηνά', 'melina', 'anila',
    // Persian, Pashto, Urdu, Hindi, Somali, Amharic
    'dilara', 'دلارا', 'latifa', 'لطیفه', 'لطيفه', 'uzma', 'عظمیٰ', 'swara', 'स्वरा', 'kalpana', 'heera', 'ubax', 'mekdes', 'መቅደስ',
    // Spanish, Portuguese, French, English, German, Italian, Chinese, Vietnamese
    'elvira', 'helena', 'laura', 'sabina', 'dalia', 'francisca', 'raquel', 'fernanda', 'denise', 'julie', 'hortense', 'sylvie', 'eloise', 'vivienne',
    'zira', 'aria', 'jenny', 'michelle', 'sonia', 'libby', 'maisie', 'hazel', 'susan', 'katja', 'amala', 'hedda', 'elsa', 'isabella', 'xiaoxiao', 'xiaoyi', 'huihui', 'hoaimy'
  ]);

  // 'male' | 'female' | '' (unknown)
  function genderOf(voiceName) {
    const n = String(voiceName || '').toLowerCase();
    if (/\bfemale\b|\bvrouw\b/.test(n)) return 'female';
    if (/\bmale\b|\bman\b/.test(n)) return 'male';
    // "Microsoft Frank - Dutch (Netherlands)", "Microsoft فاطمة Online (Natural) - Arabic (...)"
    const m = n.match(/^microsoft\s+(.+?)(?:\s+online\b|\s+desktop\b|\s+-\s|\s*\(|$)/);
    if (m) {
      const first = m[1].trim();
      const word = first.split(/\s+/)[0];
      if (MALE.has(first) || MALE.has(word)) return 'male';
      if (FEMALE.has(first) || FEMALE.has(word)) return 'female';
      return '';
    }
    // Google's own voices ("Google Nederlands", "Google español") are female
    if (/^google\s/.test(n)) return 'female';
    return '';
  }

  return { genderOf };
})();
globalThis.PKVoices = PKVoices;
