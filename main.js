/* ═══════════════════════════════════════════
   MemeGPT Pro v11 — Main Script
   80+ Templates | Filters | History | Share
   ═══════════════════════════════════════════ */

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const promptEl      = document.getElementById('prompt');
const topTextEl     = document.getElementById('topText');
const bottomTextEl  = document.getElementById('bottomText');
const templateEl    = document.getElementById('template');
const styleEl       = document.getElementById('style');
const generateBtn   = document.getElementById('generateBtn');
const gptThinkBtn   = document.getElementById('gptThinkBtn');
const canvas        = document.getElementById('memeCanvas');
const ctx           = canvas.getContext('2d');
const memeImg       = document.getElementById('memeImg');  // direct img for template memes
const resultArea    = document.getElementById('result-area');
const emptyState    = document.getElementById('emptyState');
const progressInner = document.getElementById('progressInner');
const progressPct   = document.getElementById('progressPct');
const statusText    = document.getElementById('statusText');
const statusIcon    = document.getElementById('statusIcon');
const statusOverlay = document.getElementById('statusOverlay');
const memeCountEl   = document.getElementById('memeCount');
const selectedNameEl = document.getElementById('selectedTemplateName');


// ─── State ─────────────────────────────────────────────────────────────────────
let currentDataUrl  = '';
let currentFilter   = 'none';
let currentFont     = 'Impact';
let currentFontSize = 80;
let currentColor    = 'white';
let selectedTemplate = 'custom';
// Safe localStorage loader — auto-heals if quota is exceeded
let memeHistory = (() => {
    try {
        const data = JSON.parse(localStorage.getItem('memeHistory') || '[]');
        // If stored thumbnails are bloated, trim immediately
        if (data.length > 8) { data.splice(8); localStorage.setItem('memeHistory', JSON.stringify(data)); }
        return data;
    } catch { localStorage.removeItem('memeHistory'); return []; }
})();
let totalMemes  = parseInt(localStorage.getItem('totalMemes') || '0');
let isGenerating = false;

// ─── ALL 80+ TEMPLATES ────────────────────────────────────────────────────────
const TEMPLATES = {
    // ── 🔥 Viral ─────────────────────────────────────────────────────────────
    drake:              { name: 'Drake',               emoji: '🕺', cat: 'viral', lines: 2 },
    db:                 { name: 'Distracted BF',       emoji: '👀', cat: 'viral', lines: 3 },
    'woman-cat':        { name: 'Woman Yelling at Cat',emoji: '😠', cat: 'viral', lines: 2 },
    fine:               { name: 'This is Fine 🔥',     emoji: '🐶', cat: 'viral', lines: 2 },
    gru:                { name: "Gru's Plan",           emoji: '🤯', cat: 'viral', lines: 4 },
    buzz:               { name: 'Buzz (X Everywhere)', emoji: '🚀', cat: 'viral', lines: 2 },
    doge:               { name: 'Doge',                emoji: '🐕', cat: 'viral', lines: 2 },
    pigeon:             { name: 'Is This a Pigeon?',   emoji: '🐦', cat: 'viral', lines: 3 },
    pooh:               { name: 'Tuxedo Pooh',         emoji: '🐻', cat: 'viral', lines: 2 },
    stonks:             { name: 'Stonks',              emoji: '📈', cat: 'viral', lines: 2 },
    'panik-kalm-panik': { name: 'Panik Kalm Panik',   emoji: '😱', cat: 'viral', lines: 3 },
    slap:               { name: 'Will Smith Slap',     emoji: '👋', cat: 'viral', lines: 2 },
    spongebob:          { name: 'Mocking SpongeBob',   emoji: '🟡', cat: 'viral', lines: 2 },
    exit:               { name: 'Left Exit Ramp',      emoji: '🚗', cat: 'viral', lines: 3 },
    spiderman:          { name: 'Spider-Man Pointing', emoji: '🕷️', cat: 'viral', lines: 2 },
    astronaut:          { name: 'Always Has Been',     emoji: '🌍', cat: 'viral', lines: 2 },
    blb:                { name: 'Bad Luck Brian',      emoji: '😬', cat: 'viral', lines: 2 },
    rollsafe:           { name: 'Roll Safe',           emoji: '🤔', cat: 'viral', lines: 2 },
    // ── 😂 Reaction ─────────────────────────────────────────────────────────
    fry:                { name: 'Futurama Fry',        emoji: '🤨', cat: 'reaction', lines: 2 },
    morpheus:           { name: 'Matrix Morpheus',     emoji: '😎', cat: 'reaction', lines: 2 },
    wonka:              { name: 'Cond. Wonka',         emoji: '🎩', cat: 'reaction', lines: 2 },
    harold:             { name: 'Hide the Pain Harold',emoji: '😅', cat: 'reaction', lines: 2 },
    grumpycat:          { name: 'Grumpy Cat',          emoji: '😾', cat: 'reaction', lines: 2 },
    success:            { name: 'Success Kid',         emoji: '✊', cat: 'reaction', lines: 2 },
    facepalm:           { name: 'Facepalm',            emoji: '🤦', cat: 'reaction', lines: 2 },
    sadfrog:            { name: 'Feels Bad Man',       emoji: '🐸', cat: 'reaction', lines: 2 },
    kombucha:           { name: 'Kombucha Girl',       emoji: '😬', cat: 'reaction', lines: 2 },
    'michael-scott':    { name: 'Michael Scott',       emoji: '😱', cat: 'reaction', lines: 2 },
    confused:           { name: 'Confused Nick Young', emoji: '❓', cat: 'reaction', lines: 2 },
    tuxedowinnie:       { name: 'Elegant Winnie',      emoji: '🎩', cat: 'reaction', lines: 2 },
    'hide-pain-harold': { name: 'Harold Alternatives', emoji: '🥲', cat: 'reaction', lines: 2 },
    reactionguy:        { name: 'Reaction Guy',        emoji: '😮', cat: 'reaction', lines: 2 },
    regret:             { name: 'I Regret This',       emoji: '😰', cat: 'reaction', lines: 2 },
    salt:               { name: 'Salt Bae',            emoji: '🧂', cat: 'reaction', lines: 2 },
    // ── 🎭 Multi-Panel ──────────────────────────────────────────────────────
    vince:              { name: 'Vince McMahon',       emoji: '😏', cat: 'multi', lines: 3 },
    handshake:          { name: 'Epic Handshake',      emoji: '🤝', cat: 'multi', lines: 3 },
    gb:                 { name: 'Galaxy Brain',        emoji: '🧠', cat: 'multi', lines: 4 },
    chair:              { name: 'American Chopper',    emoji: '😤', cat: 'multi', lines: 4 },
    elmo:               { name: 'Elmo Choosing',       emoji: '🔴', cat: 'multi', lines: 4 },
    grave:              { name: 'Grave',               emoji: '⚰️', cat: 'multi', lines: 3 },
    friends:            { name: 'Are You Two Friends', emoji: '🤝', cat: 'multi', lines: 3 },
    right:              { name: 'Anakin/Padmé',        emoji: '⭐', cat: 'multi', lines: 4 },
    bus:                { name: 'Two Guys on Bus',     emoji: '🚌', cat: 'multi', lines: 2 },
    ds:                 { name: 'Daily Struggle',      emoji: '😫', cat: 'multi', lines: 3 },
    midwit:             { name: 'Midwit',              emoji: '📉', cat: 'multi', lines: 3 },
    reveal:             { name: 'Scooby-Doo Reveal',   emoji: '🐕', cat: 'multi', lines: 4 },
    pool:               { name: 'Mom Ignoring Kid',    emoji: '🏊', cat: 'multi', lines: 3 },
    made:               { name: 'I Made This',         emoji: '👆', cat: 'multi', lines: 4 },
    // ── 🎬 Pop Culture ──────────────────────────────────────────────────────
    mordor:             { name: 'One Does Not Simply', emoji: '💍', cat: 'popculture', lines: 2 },
    joker:              { name: 'Kill the Batman',     emoji: '🃏', cat: 'popculture', lines: 2 },
    cmm:                { name: 'Change My Mind',      emoji: '☕', cat: 'popculture', lines: 1 },
    chosen:             { name: 'You Were Chosen One', emoji: '⚡', cat: 'popculture', lines: 2 },
    older:              { name: "It's an Older One",   emoji: '👴', cat: 'popculture', lines: 2 },
    wddth:              { name: "We Don't Do That",    emoji: '🦁', cat: 'popculture', lines: 2 },
    sparta:             { name: 'This is Sparta!',     emoji: '⚔️', cat: 'popculture', lines: 2 },
    gandalf:            { name: 'Confused Gandalf',    emoji: '🧙', cat: 'popculture', lines: 2 },
    hagrid:             { name: 'Should Not Said That',emoji: '🦉', cat: 'popculture', lines: 2 },
    inigo:              { name: 'Inigo Montoya',       emoji: '🗡️', cat: 'popculture', lines: 2 },
    joker2:             { name: 'Joker (Laughing)',    emoji: '😈', cat: 'popculture', lines: 2 },
    tony:               { name: 'Tony Stark I Am IronMan', emoji: '🦾', cat: 'popculture', lines: 2 },
    // ── 🌐 Internet Classics ────────────────────────────────────────────────
    kermit:             { name: "None of My Business", emoji: '🐸', cat: 'classic', lines: 2 },
    interesting:        { name: 'Most Interesting Man',emoji: '🍺', cat: 'classic', lines: 2 },
    keanu:              { name: 'Conspiracy Keanu',    emoji: '🤔', cat: 'classic', lines: 2 },
    philosoraptor:      { name: 'Philosoraptor',       emoji: '🦕', cat: 'classic', lines: 2 },
    'khaby-lame':       { name: 'Khaby Lame Shrug',   emoji: '🤷', cat: 'classic', lines: 2 },
    dwight:             { name: 'Schrute Facts',       emoji: '🌱', cat: 'classic', lines: 2 },
    oag:                { name: 'Overly Attached GF',  emoji: '😍', cat: 'classic', lines: 2 },
    disastergirl:       { name: 'Disaster Girl',       emoji: '🔥', cat: 'classic', lines: 2 },
    money:              { name: 'Shut Up & Take $',    emoji: '💸', cat: 'classic', lines: 2 },
    confused2:          { name: 'Confusing Grandma',   emoji: '👵', cat: 'classic', lines: 2 },
    yuno:               { name: 'Y U NO Guy',          emoji: '😤', cat: 'classic', lines: 2 },
    jd:                 { name: 'Joseph Ducreux',      emoji: '🎭', cat: 'classic', lines: 2 },
    bi:                 { name: 'But Thats None',      emoji: '☕', cat: 'classic', lines: 2 },
    boat:               { name: 'I Should Buy a Boat', emoji: '⛵', cat: 'classic', lines: 2 },
    fa:                 { name: 'Forever Alone',       emoji: '😢', cat: 'classic', lines: 2 },
    cb:                 { name: 'Confession Bear',     emoji: '🐻', cat: 'classic', lines: 2 },
    ggg:                { name: 'Good Guy Greg',       emoji: '😊', cat: 'classic', lines: 2 },
    ss:                 { name: 'Scumbag Steve',       emoji: '😤', cat: 'classic', lines: 2 },
    icanhas:            { name: 'I Can Has Cheezburger',emoji: '🍔', cat: 'classic', lines: 2 },
};

// Template ID alias map (for wrong IDs that still work)
const TEMPLATE_ALIASES  = {
    confused:   'nfy',
    confused2:  'buzz',
    tuxedowinnie: 'pooh',
    'hide-pain-harold': 'harold',
    reactionguy: 'fry',
    salt:       'saltbae',
    joker2:     'joker',
    tony:       'mordor',
    bi:         'kermit',
    confused:   'fry',
};

function resolveId(id) {
    return TEMPLATE_ALIASES[id] || id;
}

// ─── GPT ENGINE ─────────────────────────────────────────────────────────────
const gptEngine = {
    hooks: [
        (t) => `A cinematic 8K meme of ${t}, hyperrealistic, viral lighting`,
        (t) => `Animated dank chaotic ${t}, deep-fried neon aesthetic, trending`,
        (t) => `Epic fantasy scene: ${t} but make it a meme, dramatic lighting`,
        (t) => `Surreal absurdist humor: ${t}, vaporwave dimension, glitch art`,
        (t) => `Studio Ghibli style: ${t} meme, soft colors, whimsical feel`,
        (t) => `Retro 90s VHS aesthetic: ${t}, nostalgia, grain, dated colors`,
    ],
    optimize(input) {
        const pick = this.hooks[Math.floor(Math.random() * this.hooks.length)];
        return pick(input.trim() || 'hilarious viral internet meme');
    }
};

// ─── MOOD STATE ─────────────────────────────────────────────────────────────
let currentMood = 'funny';

// ─── MOOD CONFIG ─────────────────────────────────────────────────────────────
const MOOD_CONFIG = {
    funny:     { label: '😂 Funny',     color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
    angry:     { label: '😤 Angry',     color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
    sad:       { label: '😢 Sad',       color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
    happy:     { label: '😊 Happy',     color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
    sarcastic: { label: '😏 Sarcastic', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
    dank:      { label: '🤪 Dank',      color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
    wholesome: { label: '🥰 Wholesome', color: '#14B8A6', bg: 'rgba(20,184,166,0.15)' },
    relatable: { label: '💀 Relatable', color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
};

// ─── CAPTION DATABASE ────────────────────────────────────────────────────────
// Structure: CAPTION_DB[templateId][mood] = [ [top, bottom], ... ]
// Falls back to CAPTION_DB['_default'][mood] for any template not listed
const CAPTION_DB = {

    // ── Drake ──────────────────────────────────────────────────────────────
    drake: {
        funny:     [ ['SLEEP', 'MORE MEMES AT 3AM'], ['HEALTHY DIET', 'PIZZA AT MIDNIGHT'], ['REPLYING TO EMAILS', 'ADDING MORE BROWSER TABS'] ],
        angry:     [ ['MY PATIENCE LEFT', 'THIS NONSENSE STAYED'], ['BEING REASONABLE', 'GOING ABSOLUTELY NUCLEAR'], ['CALM DISCUSSION', 'UNHINGED RANT'] ],
        sad:       [ ['HAVING FRIENDS', 'CRYING ALONE AT HOME'], ['GOING OUTSIDE', 'RE-WATCHING THE SAME SHOW'], ['HOPE', 'REALITY CHECKING IN'] ],
        happy:     [ ['MONDAY', 'FRIDAY AFTERNOON'], ['BUGS IN CODE', 'IT FINALLY WORKS!'], ['STRESS', 'WEEKEND ENERGY'] ],
        sarcastic: [ ['DOING THE OBVIOUS THING', 'THE COMPLICATED WAY THAT BREAKS'], ['READING THE DOCS', 'WINGING IT'], ['COMMON SENSE', 'THIS DECISION'] ],
        dank:      [ ['TOUCHING GRASS', 'PIXEL FARMING SIMULATOR'], ['SLEEP SCHEDULE', 'CHAOS DEMON MODE'], ['NORMAL THOUGHTS', 'GALAXY BRAIN TAKES'] ],
        wholesome: [ ['NEGATIVITY', 'CHOOSING KINDNESS TODAY'], ['GIVING UP', 'ONE MORE TRY'], ['SELF DOUBT', 'BELIEVING IN YOURSELF'] ],
        relatable: [ ['WAKING UP EARLY', 'ONE MORE EPISODE'], ['SAVING MONEY', 'BUYING THAT THING'], ['STUDYING', 'PRODUCTIVE PROCRASTINATION'] ],
    },

    // ── Distracted BF (db) ────────────────────────────────────────────────
    db: {
        funny:     [ ['MY WORK TASK', 'LITERALLY ANYTHING ELSE', 'ME'], ['SLEEP', 'DOOMSCROLLING', 'MY BRAIN'], ['DIET PLAN', 'MIDNIGHT SNACK', 'ME'] ],
        angry:     [ ['MY MENTAL PEACE', 'THIS ONE THING', 'MY BRAIN'], ['STABILITY', 'CHAOS', 'MY LIFE'], ['WHAT I ASKED FOR', 'SOMETHING WORSE', 'FATE'] ],
        sad:       [ ['HAPPINESS', 'MELANCHOLY', 'ME'], ['GOOD SLEEP', 'SAD SONGS AT 2AM', 'ME'], ['MOVING ON', 'THE PAST', 'MY BRAIN'] ],
        happy:     [ ['OLD PROBLEMS', 'NEW OPPORTUNITIES', 'ME'], ['STRESS', 'GOOD VIBES', 'WEEKEND'], ['WORRY', 'VACATION MODE', 'ME'] ],
        sarcastic: [ ['THE CORRECT SOLUTION', 'OVERENGINEERED MESS', 'TEAM'], ['READING INSTRUCTIONS', 'IMPROVISING', 'ME'], ['SIMPLE CODE', '10 NEW DEPENDENCIES', 'DEVS'] ],
        dank:      [ ['NORMAL HOBBY', 'CURSED INTEREST', 'ME'], ['SLEEP', '5AM RABBIT HOLE', 'MY BRAIN'], ['LOGIC', 'VIBES', 'MY DECISIONS'] ],
        wholesome: [ ['NEGATIVITY', 'GOOD ENERGY', 'ME'], ['OLD HABITS', 'BETTER CHOICES', 'ME'], ['JUDGING', 'UNDERSTANDING', 'MY HEART'] ],
        relatable: [ ['DOING WHAT I PLANNED', 'SOMETHING RANDOM', 'ME'], ['THE GYM', 'THE COUCH', 'ME AT 6PM'], ['SAVING MONEY', 'ONLINE SHOPPING', 'ME'] ],
    },

    // ── This is Fine ──────────────────────────────────────────────────────
    fine: {
        funny:     [ ['EVERYTHING IS FINE', 'LITERALLY ON FIRE'], ['DEADLINE IN 1 HOUR', 'THIS IS FINE'], ['PRODUCTION IS DOWN', 'ITS COOL ITS COOL'] ],
        angry:     [ ['WATCHING THE WORLD BURN', 'THIS IS TOTALLY FINE'], ['STAYING CALM IN CHAOS', 'I AM DONE'], ['PRETENDING ITS OK', 'INTERNALLY SCREAMING'] ],
        sad:       [ ['CRYING INSIDE', 'SAYING IM FINE'], ['EVERYTHING HURTS', 'BUT TOTALLY FINE'], ['THE WORLD IS CHAOS', 'THIS IS FINE, I GUESS'] ],
        happy:     [ ['MONDAY MORNING', 'THIS IS FINE ACTUALLY'], ['COFFEE KICKING IN', 'SUDDENLY FINE'], ['WEEKEND STARTS', 'THIS IS MORE THAN FINE'] ],
        sarcastic: [ ['MY LIFE PLAN', 'THIS IS FINE'], ['THE CODE I WROTE', 'ERROR 404 FINE NOT FOUND'], ['EVERYTHING BREAKING', 'TOTALLY FINE'] ],
        dank:      [ ['5 ENERGY DRINKS DEEP', 'THIS IS FINE'], ['NO SLEEP FOR 3 DAYS', 'ITS FINE, IM FINE'], ['REALITY COLLAPSING', 'FINE FINE FINE'] ],
        wholesome: [ ['BAD DAY', 'BUT IM FINE, I PROMISE'], ['HARD TIMES', 'THIS WILL BE FINE'], ['FEELING LOST', 'BUT FINDING MY WAY'] ],
        relatable: [ ['FORGOT THE MEETING', 'THIS IS FINE'], ['BROKE AGAIN', 'TOTALLY FINE'], ['BAD WIFI', 'THIS IS FINE (ITS NOT)'] ],
    },

    // ── Woman Yelling at Cat ──────────────────────────────────────────────
    'woman-cat': {
        funny:     [ ['THE CODE REVIEW', 'MY PERFECTLY GOOD CODE'], ['MY ALARM CLOCK', 'ME AT 7AM'], ['EVERYONE TELLING ME TO SLEEP', 'ME WATCHING MEMES'] ],
        angry:     [ ['COMMON SENSE', 'WHAT PEOPLE ACTUALLY DO'], ['THE RULES', 'HOW PEOPLE IGNORE THEM'], ['MY EXPECTATIONS', 'REALITY'] ],
        sad:       [ ['EVERYONE HAVING FUN', 'ME WHO CANCELLED PLANS'], ['THE DEADLINE', 'MY MOTIVATION'], ['SOCIAL LIFE', 'INTROVERT ME'] ],
        happy:     [ ['ME AFTER COFFEE', 'SOMEONE QUESTIONING IT'], ['FRIDAY ENERGY', 'MONDAY TRYING TO STOP ME'], ['SUCCESS', 'SELF DOUBT'] ],
        sarcastic: [ ['THE "SIMPLE FIX"', 'THREE HOURS LATER'], ['"BEST PRACTICES"', 'WHAT WE ACTUALLY DO'], ['DOCUMENTATION', 'MY IMPROVISATION'] ],
        dank:      [ ['MY SLEEP SCHEDULE', '3AM ME'], ['MY DIET', 'THAT ONE SNACK'], ['LOGIC', 'MY DECISION MAKING'] ],
        wholesome: [ ['NEGATIVE THOUGHTS', 'MY SELF CARE ROUTINE'], ['THE BAD DAYS', 'THE GOOD ONES AHEAD'], ['SELF DOUBT', 'BELIEVING IN MYSELF'] ],
        relatable: [ ['MY BANK ACCOUNT', 'MY SPENDING HABITS'], ['PRODUCTIVITY PLAN', 'ACTUAL OUTPUT'], ['THE GOAL', 'DISTRACTIONS'] ],
    },

    // ── Gru's Plan ────────────────────────────────────────────────────────
    gru: {
        funny:     [ ['MAKE A PLAN', 'EXECUTE THE PLAN', 'PLAN GOES WRONG', 'PLAN GOES WRONG'] ],
        angry:     [ ['GET ANGRY', 'STAY CALM', 'GET ANGRIER', 'GET ANGRIER'] ],
        sad:       [ ['FEEL BETTER', 'GO OUTSIDE', 'STARE AT CEILING ANYWAY', 'STARE AT CEILING ANYWAY'] ],
        happy:     [ ['MAKE A PLAN', 'WORK HARD', 'SUCCESS!', 'SUCCESS!'] ],
        sarcastic: [ ['WRITE GOOD CODE', 'PUSH TO MAIN', 'BREAK PRODUCTION', 'BREAK PRODUCTION'] ],
        dank:      [ ['SLEEP EARLY', 'WATCH ONE VIDEO', '4AM SOMEHOW', '4AM SOMEHOW'] ],
        wholesome: [ ['HELP A FRIEND', 'BE THERE FOR THEM', 'FEEL GOOD', 'FEEL GOOD'] ],
        relatable: [ ['START DIET', 'HAVE ONE CHEAT MEAL', 'ENTIRE PIZZA', 'ENTIRE PIZZA'] ],
    },

    // ── Futurama Fry (Not Sure If) ────────────────────────────────────────
    fry: {
        funny:     [ ['NOT SURE IF SLEEPY', 'OR JUST BORED'], ['NOT SURE IF GENIUS', 'OR JUST LUCKY'], ['NOT SURE IF BUG', 'OR FEATURE'] ],
        angry:     [ ['NOT SURE IF INCOMPETENT', 'OR ACTIVELY TRYING TO ANNOY ME'], ['NOT SURE IF MISTAKE', 'OR PERSONAL ATTACK'], ['NOT SURE IF RUDE', 'OR JUST CLUELESS'] ],
        sad:       [ ['NOT SURE IF SAD', 'OR JUST TIRED'], ['NOT SURE IF CRYING', 'OR CUTTING ONIONS'], ['NOT SURE IF FINE', 'OR JUST NUMB'] ],
        happy:     [ ['NOT SURE IF HAPPY', 'OR COFFEE JUST HIT'], ['NOT SURE IF LUCKY', 'OR JUST SKILLED'], ['NOT SURE IF DREAM', 'OR IT ACTUALLY HAPPENED'] ],
        sarcastic: [ ['NOT SURE IF SMART', 'OR EVERYONE ELSE IS DUMBER'], ['NOT SURE IF RIGHT', 'OR JUST CONFIDENT'], ['NOT SURE IF DOCUMENTATION', 'OR ABSTRACT ART'] ],
        dank:      [ ['NOT SURE IF AWAKE', 'OR VERY VIVID DREAM'], ['NOT SURE IF WIFI IS DOWN', 'OR REALITY IS GLITCHING'], ['NOT SURE IF HUMAN', 'OR SLEEP DEPRIVED NPC'] ],
        wholesome: [ ['NOT SURE IF LUCKY', 'OR SURROUNDED BY GREAT PEOPLE'], ['NOT SURE IF GOOD AT THIS', 'OR THEY ARE JUST SUPPORTIVE'], ['NOT SURE IF PROUD', 'OR OVERWHELMED WITH JOY'] ],
        relatable: [ ['NOT SURE IF HUNGRY', 'OR JUST BORED'], ['NOT SURE IF PROCRASTINATING', 'OR THINKING REALLY HARD'], ['NOT SURE IF TALENTED', 'OR JUST FAKING IT WELL'] ],
    },

    // ── Panik Kalm Panik ──────────────────────────────────────────────────
    'panik-kalm-panik': {
        funny:     [ ['MISTAKE AT WORK', 'NO ONE NOTICED', 'THEY JUST NOTICED'], ['FORGOT HOMEWORK', 'TEACHER IS ABSENT', 'SUBSTITUTE WANTS IT'] ],
        angry:     [ ['THEY ARGUED BACK', 'I RAN OUT OF POINTS', 'THEY HAD A POINT'] ],
        sad:       [ ['DEADLINE TOMORROW', 'I CAN DO IT', 'I HAD ONE JOB'] ],
        happy:     [ ['IT IS FRIDAY', 'IT IS ACTUALLY FRIDAY', 'WAIT IT IS MONDAY'] ],
        sarcastic: [ ['CODE NOT WORKING', 'ADDED A CONSOLE.LOG', 'STILL NOT WORKING'] ],
        dank:      [ ['OUT OF COFFEE', 'FOUND ENERGY DRINK', 'IT EXPLODED'] ],
        wholesome: [ ['FEELING ALONE', 'A FRIEND TEXTED', 'THEY NEED A FAVOR'] ],
        relatable: [ ['OVERSLEPT', 'MADE IT ON TIME', 'FORGOT MY KEYS'] ],
    },

    // ── Doge ─────────────────────────────────────────────────────────────
    doge: {
        funny:     [ ['MUCH SLEEP NEEDED', 'SO MEME INSTEAD'], ['VERY PIZZA', 'SUCH LATE NIGHT'], ['WOW CODE', 'MUCH BUG'] ],
        angry:     [ ['VERY ANGRY', 'MUCH DISAPPOINTMENT'], ['SO RUDE', 'SUCH DISRESPECT'], ['WOW SERIOUSLY', 'MUCH DONE'] ],
        sad:       [ ['VERY SAD', 'SUCH LONELY'], ['MUCH RAIN', 'SO GLOOMY'], ['WOW FEELS', 'SUCH TEARS'] ],
        happy:     [ ['VERY EXCITE', 'MUCH HAPPY'], ['SUCH JOY', 'WOW FRIDAY'], ['MUCH LOVE', 'SO WHOLESOME'] ],
        sarcastic: [ ['VERY SMART DECISION', 'MUCH NOT'], ['WOW GREAT IDEA', 'SUCH DISASTER'], ['SO PLANNED', 'MUCH IMPROVISED'] ],
        dank:      [ ['VERY GALAXY BRAIN', 'MUCH CURSED THOUGHT'], ['WOW NO SLEEP', 'SUCH 4AM ENERGY'], ['SO CHAOS', 'MUCH DANK'] ],
        wholesome: [ ['VERY LOVE', 'SUCH SUPPORT'], ['MUCH PROUD', 'WOW YOU DID IT'], ['SO KIND', 'SUCH HEART'] ],
        relatable: [ ['VERY RELATE', 'SUCH ME'], ['MUCH STRUGGLE', 'WOW EVERY DAY'], ['SO TIRED', 'MUCH SAME'] ],
    },

    // ── Stonks ────────────────────────────────────────────────────────────
    stonks: {
        funny:     [ ['ACCIDENTALLY DELETES PROJECT', 'STONKS'], ['WRITES SPAGHETTI CODE', 'STONKS'], ['SAYS YES TO EVERYTHING', 'STONKS'] ],
        angry:     [ ['BEING REASONABLE', 'NOT STONKS'], ['FOLLOWING THE RULES', 'ALSO NOT STONKS'], ['TRYING TO BE PATIENT', 'STONKS GO DOWN'] ],
        sad:       [ ['MY MOOD ON MONDAY', 'NOT STONKS'], ['SLEEP SCHEDULE', 'ANTI-STONKS'], ['MY SOCIAL BATTERY', 'STONKS CRASHED'] ],
        happy:     [ ['FRIDAY 5PM', 'MEGA STONKS'], ['COFFEE KICKING IN', 'INSTANT STONKS'], ['PAY DAY', 'MAXIMUM STONKS'] ],
        sarcastic: [ ['BUYING HIGH SELLING LOW', 'STONKS'], ['IGNORING ALL ADVICE', 'STONKS'], ['YOLO INVESTMENT STRATEGY', 'DEFINITELY STONKS'] ],
        dank:      [ ['PRINTING MONEY IN MINECRAFT', 'STONKS'], ['SLEEPING AND WAKING UP RICH', 'STONKS'], ['TRADING POKÉMON CARDS', 'GIGA STONKS'] ],
        wholesome: [ ['INVESTING IN KINDNESS', 'STONKS'], ['HELPING OTHERS', 'EMOTIONAL STONKS'], ['BEING A GOOD FRIEND', 'HEART STONKS'] ],
        relatable: [ ['IMPULSE BUYING', 'STONKS (FOR THE STORE)'], ['SUBSCRIBING TO EVERYTHING', 'ANTI-STONKS'], ['FORGETTING SUBSCRIPTIONS', 'FINANCIAL STONKS'] ],
    },

    // ── Grumpy Cat ────────────────────────────────────────────────────────
    grumpycat: {
        funny:     [ ['HAS ONE GOOD THING HAPPENED?', 'NO'], ['DO YOU LOVE MONDAYS?', 'NO'], ['ARE YOU HAPPY IT IS FRIDAY?', 'NO'] ],
        angry:     [ ['DID THAT MAKE SENSE?', 'NO'], ['SHOULD THEY HAVE DONE THAT?', 'ABSOLUTELY NOT'], ['IS THIS ACCEPTABLE?', 'NO'] ],
        sad:       [ ['DID IT GET BETTER?', 'NO'], ['WAS HOPE WAS FOUND?', 'NO'], ['DOES IT MATTER?', 'NO'] ],
        happy:     [ ['IS TODAY BAD?', 'NO, ACTUALLY GOOD!'], ['DID IT WORK OUT?', 'YES. SHOCKINGLY'], ['WAS I WRONG TO WORRY?', 'PROBABLY'] ],
        sarcastic: [ ['GREAT IDEA?', 'NO'], ['DOES THE CODE WORK?', 'ABSOLUTELY NOT'], ['IS PRODUCTION STABLE?', 'NO'] ],
        dank:      [ ['IS THIS REAL LIFE?', 'NO'], ['AM I AWAKE?', 'DEBATABLE'], ['DOES ANY OF THIS MAKE SENSE?', 'NO'] ],
        wholesome: [ ['BAD DAY?', 'NO, YOU GOT THIS'], ['ALONE?', 'I AM HERE'], ['GIVING UP?', 'NO, NOT TODAY'] ],
        relatable: [ ['ADULTING HARD?', 'YES. NO. HELP.'], ['TIRED?', 'PERMANENTLY'], ['DOING OK?', 'NO BUT THANKS FOR ASKING'] ],
    },

    // ── Success Kid ───────────────────────────────────────────────────────
    success: {
        funny:     [ ['FOUND A MEME', 'SHOWED EVERYONE IMMEDIATELY'], ['REMEMBERED THE PASSWORD', 'ON FIRST TRY'], ['CODE WORKED', 'NO IDEA WHY'] ],
        angry:     [ ['THEY TRIED TO STOP ME', 'THEY COULD NOT'], ['DOUBTED AT EVERY STEP', 'STILL SUCCEEDED'], ['EVERYONE SAID NO', 'DID IT ANYWAY'] ],
        sad:       [ ['BARELY SURVIVED THE WEEK', 'BUT SURVIVED IT'], ['CRIED A LITTLE', 'BUT GOT BACK UP'], ['FELT ALONE', 'REMEMBERED I AM AWESOME'] ],
        happy:     [ ['WOKE UP ON TIME', 'FIRST TRY, NO ALARM'], ['FINISHED EARLY', 'TIME TO SPARE'], ['NO MEETINGS TODAY', 'SUCCESS'] ],
        sarcastic: [ ['FOLLOWED EVERY RULE', 'SOMEHOW STILL WRONG'], ['DID EXACTLY WHAT THEY SAID', 'THEY CHANGED IT AGAIN'], ['READ THE DOCS', 'DOCS WERE WRONG'] ],
        dank:      [ ['STAYED UP ALL NIGHT', 'AND WON'], ['ATE CEREAL AT 3AM', 'PEAK PERFORMANCE'], ['CHAOS ENERGY ACTIVATED', 'SURPRISINGLY WORKED'] ],
        wholesome: [ ['TRIED MY BEST', 'AND IT WAS ENOUGH'], ['BELIEVED IN MYSELF', 'IT PAID OFF'], ['HELPED SOMEONE TODAY', 'BEST FEELING'] ],
        relatable: [ ['SENT EMAIL', 'WITHOUT A TYPO'], ['PARALLEL PARKED', 'FIRST TRY'], ['REMEMBERED A DREAM', 'WROTE IT DOWN'] ],
    },

    // ── Morpheus ──────────────────────────────────────────────────────────
    morpheus: {
        funny:     [ ['WHAT IF I TOLD YOU', 'PIZZA IS A VEGETABLE'], ['WHAT IF I TOLD YOU', 'THE MEETING COULD HAVE BEEN AN EMAIL'], ['WHAT IF I TOLD YOU', 'THE BUG WAS YOUR CODE'] ],
        angry:     [ ['WHAT IF I TOLD YOU', 'YOU WERE THE PROBLEM ALL ALONG'], ['WHAT IF I TOLD YOU', 'NOBODY LIKES THIS POLICY'], ['WHAT IF I TOLD YOU', 'WE WARNED YOU'] ],
        sad:       [ ['WHAT IF I TOLD YOU', 'IT GETS BETTER EVENTUALLY'], ['WHAT IF I TOLD YOU', 'YOUR FEELINGS ARE VALID'], ['WHAT IF I TOLD YOU', 'YOU ARE NOT ALONE'] ],
        happy:     [ ['WHAT IF I TOLD YOU', 'TODAY IS GOING TO BE GREAT'], ['WHAT IF I TOLD YOU', 'YOU ALREADY HAVE WHAT YOU NEED'], ['WHAT IF I TOLD YOU', 'THIS IS YOUR MOMENT'] ],
        sarcastic: [ ['WHAT IF I TOLD YOU', 'THE DEADLINE WAS FAKE'], ['WHAT IF I TOLD YOU', 'NOBODY READ THE REPORT'], ['WHAT IF I TOLD YOU', 'THAT WAS NEVER THE PLAN'] ],
        dank:      [ ['WHAT IF I TOLD YOU', 'THE MATRIX IS JUST JAVASCRIPT'], ['WHAT IF I TOLD YOU', 'YOU ARE AN NPC'], ['WHAT IF I TOLD YOU', 'REALITY IS BUFFERING'] ],
        wholesome: [ ['WHAT IF I TOLD YOU', 'SOMEONE IS PROUD OF YOU'], ['WHAT IF I TOLD YOU', 'YOU MADE A DIFFERENCE TODAY'], ['WHAT IF I TOLD YOU', 'YOU ARE STRONGER THAN YOU THINK'] ],
        relatable: [ ['WHAT IF I TOLD YOU', 'YOU HAVE BEEN ON YOUR PHONE FOR 4 HOURS'], ['WHAT IF I TOLD YOU', 'THE SNOOZE BUTTON IS YOUR ENEMY'], ['WHAT IF I TOLD YOU', 'IT IS ALREADY WEDNESDAY'] ],
    },

    // ── Philosoraptor ─────────────────────────────────────────────────────
    philosoraptor: {
        funny:     [ ['IF YOU TRIP IN A DREAM', 'DO YOU STUB YOUR SOUL?'], ['IF TOMATOES ARE FRUIT', 'IS KETCHUP A SMOOTHIE?'], ['IF NOTHING IS IMPOSSIBLE', 'CAN I MAKE AN INFINITE LOOP THAT ENDS?'] ],
        angry:     [ ['IF RULES EXIST FOR EVERYONE', 'WHY DO SOME PEOPLE SKIP THEM?'], ['IF THEY HEARD YOU THE FIRST TIME', 'WHY DO YOU HAVE TO REPEAT IT?'], ['IF COMMON SENSE IS SO COMMON', 'WHERE DID IT ALL GO?'] ],
        sad:       [ ['IF TOMORROW IS ANOTHER DAY', 'WHY DOES TODAY HURT SO MUCH?'], ['IF TIME HEALS ALL WOUNDS', 'DOES IT REMEMBER WHERE IT PUT THEM?'], ['IF YOU ARE FINE', 'WHY DO YOUR EYES SAY OTHERWISE?'] ],
        happy:     [ ['IF LIFE IS SHORT', 'WHY DO WE WAIT?'], ['IF EVERY DAY IS A GIFT', 'CAN I RETURN MONDAYS?'], ['IF JOY IS FREE', 'WHY DO WE FORGET TO TAKE IT?'] ],
        sarcastic: [ ['IF THE ESTIMATE IS 2 WEEKS', 'WHEN IS THE REAL DEADLINE?'], ['IF AGILE MEANS FLEXIBLE', 'WHY IS NOTHING EVER FLEXIBLE?'], ['IF IT IS BEST PRACTICE', 'WHY IS IT NEVER PRACTICED?'] ],
        dank:      [ ['IF TIME IS A FLAT CIRCLE', 'AM I GOING IN CIRCLES?'], ['IF THE UNIVERSE IS INFINITE', 'WHERE DO I PARK?'], ['IF WE ARE MADE OF STARDUST', 'ARE WE SENTIENT ASTEROIDS?'] ],
        wholesome: [ ['IF EVERYONE IS FIGHTING A BATTLE', 'WHY NOT BE KIND?'], ['IF LOVE IS FROM THE HEART', 'HOW BIG IS YOURS?'], ['IF SMALL ACTS MATTER', 'WHICH SMALL ACT WILL YOU DO TODAY?'] ],
        relatable: [ ['IF YOU SET 10 ALARMS', 'WHY DO YOU STILL OVERSLEEP?'], ['IF EATING IS OPTIONAL', 'WHY DO I DO IT EVERY 20 MINUTES?'], ['IF REST IS IMPORTANT', 'WHY IS RESTING SO HARD?'] ],
    },

    // ── Distressed Kermit (sadfrog) ───────────────────────────────────────
    sadfrog: {
        funny:     [ ['SENDS MEME TO WRONG PERSON', 'IT HURTS TO LIVE'], ['SAYS SOMETHING FUNNY', 'NOBODY LAUGHS'], ['TRIP IN PUBLIC', 'FEELS BAD MAN'] ],
        angry:     [ ['THEY DID IT AGAIN', 'FEELS BAD MAN'], ['GOT IGNORED AGAIN', 'FEELS VERY BAD MAN'], ['ASKED POLITELY', 'STILL IGNORED. FEELS BAD'] ],
        sad:       [ ['FEELS BAD MAN', 'GENUINELY JUST TIRED TODAY'], ['SCROLLED TOO FAR', 'NOW JUST FEELS BAD'], ['REMEMBERED A MEMORY', 'FEELS BAD. GNITE'] ],
        happy:     [ ['ORDERED FOOD', 'FEELS GOOD MAN'], ['GOT A REST DAY', 'FEELS GOOD MAN'], ['SOMEONE REPLIED', 'FEELS REALLY GOOD MAN'] ],
        sarcastic: [ ['CODE SAYS IT WORKS', 'IT DOES NOT. FEELS BAD MAN'], ['THEY SAID QUICK FIX', 'THREE DAYS LATER. FEELS BAD'], ['DOCUMENTATION SAID EASY', 'FEELS BAD MAN'] ],
        dank:      [ ['BRAIN AT 3AM', 'FEELS BAD MAN'], ['ENERGY DRINK NUMBER FOUR', 'STILL FEELS BAD'], ['OPENED TWITTER', 'IMMEDIATELY FELT BAD'] ],
        wholesome: [ ['TODAY WAS HARD', 'TOMORROW MIGHT FEEL GOOD MAN'], ['CRIED IT OUT', 'FEELS A LITTLE BETTER'], ['TALKED TO A FRIEND', 'FEELS MUCH BETTER MAN'] ],
        relatable: [ ['CHECKED MY BANK ACCOUNT', 'FEELS BAD MAN'], ['LOOKED IN THE MIRROR MONDAY AM', 'FEELS BAD MAN'], ['READ OLD TEXTS', 'FEELS BAD MAN'] ],
    },

    // ── Wonka ─────────────────────────────────────────────────────────────
    wonka: {
        funny:     [ ['OH YOU SLEEP 8 HOURS?', 'TELL ME MORE ABOUT YOUR EXOTIC LIFESTYLE'], ['OH YOU EAT BREAKFAST?', 'HOW DELIGHTFULLY CIVILIZED'], ['OH YOU HAVE A ROUTINE?', 'HOW ABSOLUTELY GROUNDBREAKING'] ],
        angry:     [ ['OH YOU THINK THAT IS ACCEPTABLE?', 'DO TELL'], ['OH YOU HAVE AN EXCUSE?', 'FASCINATING. TRULY.'], ['OH YOU ARE SURPRISED?', 'WE ALL SAW THIS COMING'] ],
        sad:       [ ['OH YOU ARE FINE?', 'THAT IS ADORABLE'], ['OH IT DOES NOT BOTHER YOU?', 'SURE IT DOES NOT'], ['OH YOU MOVED ON?', 'MUST BE NICE'] ],
        happy:     [ ['OH YOU ACTUALLY DID IT?', 'HOW REFRESHINGLY SURPRISING'], ['OH YOU SUCCEEDED?', 'GOOD FOR YOU'], ['OH YOU ARE HAPPY?', 'WELL THAT IS WONDERFUL'] ],
        sarcastic: [ ['OH YOU PUSHED TO PRODUCTION?', 'ON A FRIDAY. BOLD.'], ['OH YOU DID NOT TEST IT?', 'WHAT COULD GO WRONG'], ['OH YOU SKIPPED THE REVIEW?', 'VERY PROFESSIONAL'] ],
        dank:      [ ['OH YOU SLEPT?', 'HOW EXTRAORDINARY'], ['OH YOU ATE A MEAL?', 'LIKE A REAL HUMAN PERSON'], ['OH YOU TOUCHED GRASS?', 'REMARKABLE'] ],
        wholesome: [ ['OH YOU ARE BEING KIND?', 'I RESPECT THAT DEEPLY'], ['OH YOU HELPED SOMEONE?', 'TRULY ADMIRABLE'], ['OH YOU TOOK A BREAK?', 'AS YOU SHOULD'] ],
        relatable: [ ['OH YOU STARTED SOMETHING?', 'GOOD LUCK FINISHING IT'], ['OH YOU SET AN ALARM?', 'HOW OPTIMISTIC'], ['OH YOU MADE A LIST?', 'AND THEN WHAT, IGNORED IT?'] ],
    },

    // ── Disaster Girl ─────────────────────────────────────────────────────
    disastergirl: {
        funny:     [ ['WHEN YOU ACCIDENTALLY', 'CREATE CHAOS AND SMILE'], ['DELETES THE DATABASE', 'NO REGRETS'], ['BREAKS PROD ON FRIDAY', 'HAVE A GREAT WEEKEND!'] ],
        angry:     [ ['THEY MADE ME DO IT', 'AND I ENJOYED IT'], ['THEY UNDERESTIMATED ME', 'MISTAKE'], ['SAID IT COULD NOT BE DONE', 'I FOUND A WAY'] ],
        sad:       [ ['BURNT IT ALL DOWN', 'BUT IT WAS ALREADY FALLING'], ['WATCHED IT COLLAPSE', 'I HELPED A LITTLE'], ['EVERYTHING BROKE', 'I DID NOT START THE FIRE... MUCH'] ],
        happy:     [ ['FOUND THE BUG', 'AND SQUASHED IT GLORIOUSLY'], ['FIXED THE ISSUE', 'BURNED IT DOWN FIRST'], ['COMPLETED THE PROJECT', 'WITH CONTROLLED CHAOS'] ],
        sarcastic: [ ['THEY CALLED IT A DISASTER', 'I CALL IT PROGRESS'], ['EVERYONE IS UPSET', 'CANNOT IMAGINE WHY'], ['SOMETHING WENT WRONG', 'WHAT A SURPRISE'] ],
        dank:      [ ['CHAOS?', 'MY NATURAL STATE'], ['3AM PROJECT DECISIONS', 'NO RAGRETS'], ['TOTAL SYSTEM FAILURE', 'NICE'] ],
        wholesome: [ ['YES IT IS MESSY', 'BUT IT IS MINE'], ['BURNED THE OLD TO BUILD NEW', 'THAT IS GROWTH'], ['MADE MISTAKES', 'LEARNED EVERYTHING'] ],
        relatable: [ ['SENT THE WRONG FILE', 'SMILE THROUGH IT'], ['FORGOT THE ATTACHMENT', 'TWICE'], ['REPLIED ALL', 'TOO LATE TO STOP IT'] ],
    },

    // ── Change My Mind ────────────────────────────────────────────────────
    cmm: {
        funny:     [ ['CEREAL BEFORE MILK IS CORRECT', ''], ['PINEAPPLE ON PIZZA IS VALID', ''], ['DARK MODE IS THE ONLY MODE', ''] ],
        angry:     [ ['THIS POLICY IS OBJECTIVELY WRONG', ''], ['THAT DECISION MAKES ZERO SENSE', ''], ['THIS NEEDS TO CHANGE. NOW.', ''] ],
        sad:       [ ['IT NEVER GETS EASIER, ONLY MORE BEARABLE', ''], ['MOVING ON IS HARD. NOBODY TALKS ABOUT THAT.', ''], ['HEALING IS NOT LINEAR', ''] ],
        happy:     [ ['TODAY IS ACTUALLY A GREAT DAY', ''], ['KINDNESS CHANGES EVERYTHING', ''], ['SMALL WINS MATTER MORE THAN PEOPLE THINK', ''] ],
        sarcastic: [ ['THE DOCUMENTATION IS TOTALLY HELPFUL', ''], ['MEETINGS SOLVE EVERYTHING', ''], ['MICROMANAGING IMPROVES RESULTS', ''] ],
        dank:      [ ['SLEEP IS OPTIONAL IF YOU HAVE ENOUGH MEMES', ''], ['THE INTERNET IS REAL LIFE NOW', ''], ['WE ARE ALL JUST NPCS IN SOMEONE ELSE\'S RUN', ''] ],
        wholesome: [ ['SAYING THANK YOU IS UNDERRATED', ''], ['YOU DESERVE KINDNESS TOO', ''], ['IT IS OKAY TO ASK FOR HELP', ''] ],
        relatable: [ ['SNOOZING IS A FORM OF SELF CARE', ''], ['PROCRASTINATION IS JUST DELAYED EXECUTION', ''], ['BUYING THINGS COUNTS AS EXERCISE', ''] ],
    },

    // ── One Does Not Simply (Mordor) ──────────────────────────────────────
    mordor: {
        funny:     [ ['ONE DOES NOT SIMPLY', 'CLOSE ALL BROWSER TABS'], ['ONE DOES NOT SIMPLY', 'EAT JUST ONE CHIP'], ['ONE DOES NOT SIMPLY', 'REPLY ALL AND SURVIVE'] ],
        angry:     [ ['ONE DOES NOT SIMPLY', 'IGNORE THIS AND MOVE ON'], ['ONE DOES NOT SIMPLY', 'EXPECT THIS LEVEL OF NONSENSE'], ['ONE DOES NOT SIMPLY', 'LET THIS SLIDE'] ],
        sad:       [ ['ONE DOES NOT SIMPLY', 'STOP FEELING THIS WAY'], ['ONE DOES NOT SIMPLY', 'JUST GET OVER IT'], ['ONE DOES NOT SIMPLY', 'MOVE ON EASILY'] ],
        happy:     [ ['ONE DOES NOT SIMPLY', 'HAVE A BETTER FRIDAY'], ['ONE DOES NOT SIMPLY', 'HAVE THIS MUCH FUN'], ['ONE DOES NOT SIMPLY', 'WIN THIS HARD'] ],
        sarcastic: [ ['ONE DOES NOT SIMPLY', 'PUSH CODE WITHOUT TESTING'], ['ONE DOES NOT SIMPLY', 'CALL IT DONE ON FRIDAY'], ['ONE DOES NOT SIMPLY', 'READ THE FULL REQUIREMENTS'] ],
        dank:      [ ['ONE DOES NOT SIMPLY', 'WALK INTO MORDOR ON 2 HOURS OF SLEEP'], ['ONE DOES NOT SIMPLY', 'STOP THE MEME SCROLL'], ['ONE DOES NOT SIMPLY', 'RESIST THE CHAOS'] ],
        wholesome: [ ['ONE DOES NOT SIMPLY', 'FORGET A FRIEND LIKE YOU'], ['ONE DOES NOT SIMPLY', 'MOVE FORWARD ALONE'], ['ONE DOES NOT SIMPLY', 'UNDERESTIMATE YOUR WORTH'] ],
        relatable: [ ['ONE DOES NOT SIMPLY', 'LOG OFF AT 5PM'], ['ONE DOES NOT SIMPLY', 'HAVE ONE COFFEE AND STOP'], ['ONE DOES NOT SIMPLY', 'GO TO BED BEFORE MIDNIGHT'] ],
    },

    // ── DEFAULT FALLBACK ──────────────────────────────────────────────────
    _default: {
        funny:     [ ['WHEN YOU REALIZE', 'IT WAS FUNNY THOUGH'], ['ME: I WILL SLEEP EARLY', 'ALSO ME AT 3AM'], ['EXPECTATION', 'HILARIOUS REALITY'] ],
        angry:     [ ['THEY REALLY DID THAT', 'UNBELIEVABLE'], ['I ASKED NICELY', 'THREE TIMES. THREE.'], ['DONE WITH THIS', 'ENTIRELY DONE'] ],
        sad:       [ ['IT IS OKAY', 'IT IS NOT, BUT OKAY'], ['TRYING TO BE FINE', 'NOT QUITE FINE YET'], ['FEELING THE FEELINGS', 'ALL OF THEM AT ONCE'] ],
        happy:     [ ['BEST DAY EVER', 'UNPROMPTED'], ['LIFE IS GOOD', 'RIGHT NOW, IT REALLY IS'], ['GRATEFUL FOR', 'ALL OF THIS'] ],
        sarcastic: [ ['OH WOW', 'GREAT. WONDERFUL. SURE.'], ['IMPRESSIVE', 'TRULY. JUST IMPRESSIVE.'], ['THAT WENT WELL', 'SHOCKING. WHO COULD HAVE KNOWN.'] ],
        dank:      [ ['GALAXY BRAIN ACTIVATED', 'CANNOT BE TURNED OFF'], ['BREAK THE SIMULATION', 'IT WAS ALREADY BROKEN'], ['PURE CHAOS ENERGY', 'SOURCE: TRUST ME BRO'] ],
        wholesome: [ ['YOU GOT THIS', 'GENUINELY, YOU DO'], ['PROUD OF YOU', 'KEEP GOING'], ['YOU MATTER', 'MORE THAN YOU KNOW'] ],
        relatable: [ ['EVERYONE ELSE', 'VS ME EVERY DAY'], ['PLANNED', 'VS WHAT HAPPENED'], ['IN MY HEAD', 'IN REAL LIFE'] ],
    },
};

// ─── CAPTION SYSTEM ──────────────────────────────────────────────────────────
function getCaptionsForTemplate(tmplId, mood) {
    const bank = CAPTION_DB[tmplId] || CAPTION_DB['_default'];
    const moodBank = bank[mood] || CAPTION_DB['_default'][mood] || CAPTION_DB['_default']['funny'];
    // Shuffle so we always get fresh picks
    return [...moodBank].sort(() => Math.random() - 0.5);
}

function renderSuggestions(tmplId, mood) {
    const container = document.getElementById('captionSuggestions');
    const pairs = getCaptionsForTemplate(tmplId, mood);
    const mc = MOOD_CONFIG[mood] || MOOD_CONFIG.funny;

    if (!pairs.length) {
        container.innerHTML = '<div class="suggestions-placeholder"><span>No captions available for this combination</span></div>';
        return;
    }

    container.innerHTML = pairs.map((pair, i) => {
        const top    = pair[0] || '';
        const bottom = pair[1] || '';
        return `
            <div class="suggestion-card" data-top="${top}" data-bottom="${bottom}"
                 style="--mood-accent:${mc.color};--mood-accent-bg:${mc.bg};animation-delay:${i * 0.05}s">
                <div class="sugg-top">${top}</div>
                ${bottom ? `<div class="sugg-bottom">${bottom}</div>` : ''}
                <div class="sugg-meta">
                    <span class="sugg-mood-tag" style="background:${mc.bg};color:${mc.color}">${mc.label}</span>
                    <span class="sugg-apply-hint">👆 Click to apply</span>
                </div>
            </div>`;
    }).join('');

    // Wire click handlers
    container.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            topTextEl.value    = card.dataset.top;
            bottomTextEl.value = card.dataset.bottom;
            // Update mode tag
            const tag = document.getElementById('captionModeTag');
            tag.textContent = '✨ AI';
            tag.className = 'caption-mode-tag ai';
            showToast(`✨ ${mc.label} captions applied!`);
            // Flash the inputs
            [topTextEl, bottomTextEl].forEach(el => {
                el.style.borderColor = mc.color;
                el.style.boxShadow   = `0 0 0 3px ${mc.bg}`;
                setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 800);
            });
        });
    });
}

function generateAICaptions() {
    const btn = document.getElementById('aiCaptionBtn');
    const refreshBtn = document.getElementById('refreshCaptionsBtn');
    btn.classList.add('loading');
    refreshBtn.classList.add('spinning');
    // Simulate a brief AI "thinking" delay for UX
    setTimeout(() => {
        renderSuggestions(selectedTemplate, currentMood);
        btn.classList.remove('loading');
        refreshBtn.classList.remove('spinning');
        showToast(`🤖 ${MOOD_CONFIG[currentMood]?.label || 'AI'} captions generated!`);
    }, 400);
}

// ─── SHOW / HIDE HELPERS ────────────────────────────────────────────────────────────────
function showCanvasMode() {
    canvas.classList.remove('hide');
    memeImg.classList.add('hide');
}
function showImgMode(url) {
    memeImg.src = url;
    memeImg.classList.remove('hide');
    canvas.classList.add('hide');
    // For download: capture the img as dataURL via canvas off-screen
    memeImg.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width  = memeImg.naturalWidth;
        offCanvas.height = memeImg.naturalHeight;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(memeImg, 0, 0);
        try { currentDataUrl = offCanvas.toDataURL('image/jpeg', 0.92); } catch { currentDataUrl = url; }
    };
    // Fallback data URL for download if CORS fails
    currentDataUrl = url;
}

// ─── CAPTION ENCODING ────────────────────────────────────────────────────────
function encodeCaption(text) {
    if (!text || !text.trim()) return '_';
    return text.trim()
        .replace(/_/g,  '__')
        .replace(/ /g,  '_')
        .replace(/\?/g, '~q')
        .replace(/&/g,  '~a')
        .replace(/%/g,  '~p')
        .replace(/#/g,  '~h')
        .replace(/\//g, '~s')
        .replace(/\\/g, '~b')
        .replace(/</g,  '~l')
        .replace(/>/g,  '~g')
        .replace(/"/g,  "'");
}

function buildUrl(templateId, top, bottom) {
    const id = resolveId(templateId);
    const t = encodeCaption(top);
    const b = encodeCaption(bottom);
    // Standardizing on 600x939 as requested for perfect ratio across web/mobile
    return `https://api.memegen.link/images/${id}/${t}/${b}.jpg?width=600&height=939`;
}


// ─── IMAGE LOADER ─────────────────────────────────────────────────────────────
async function loadImage(url) {
    const tryLoad = (src, timeoutMs = 20000) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const tid = setTimeout(() => reject(new Error('timeout')), timeoutMs);
        img.onload  = () => { clearTimeout(tid); resolve(img); };
        img.onerror = () => { clearTimeout(tid); reject(new Error(`failed: ${src.slice(0, 60)}`)); };
        img.src = src;
    });

    // Proxy chain
    const weserv    = (u) => `https://images.weserv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ''))}`;
    const corsproxy = (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`;
    const allorigins = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

    const sources = [url, weserv(url), corsproxy(url), allorigins(url)];
    for (const src of sources) {
        try {
            const img = await tryLoad(src);
            console.log(`✅ Loaded via ${src.slice(0,60)}`);
            return img;
        } catch (e) {
            console.warn(`⚠️ ${e.message}`);
        }
    }
    throw new Error('All image sources failed');
}

// ─── CANVAS FALLBACK MEME (works offline / when all APIs fail) ────────────────
function drawFallbackMeme(top, bottom, prompt = '') {
    const W = 1000, H = 1000;
    canvas.width = W; canvas.height = H;
    showCanvasMode();

    // Beautiful gradient backgrounds (cycle deterministically)
    const gradients = [
        ['#0f0c29', '#302b63', '#24243e'],
        ['#141E30', '#243B55'],
        ['#200122', '#6f0000'],
        ['#0f2027', '#203a43', '#2c5364'],
        ['#1a1a2e', '#16213e', '#0f3460'],
        ['#232526', '#414345'],
        ['#4b134f', '#c94b4b'],
        ['#000000', '#434343'],
        ['#3a1c71', '#d76d77', '#ffaf7b'],
        ['#0575e6', '#021b79'],
    ];
    const g = gradients[Math.floor(Date.now() / 1000) % gradients.length];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    g.forEach((c, i) => grad.addColorStop(i / (g.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Noise texture overlay for depth
    for (let i = 0; i < 8000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
        ctx.fillRect(Math.random()*W, Math.random()*H, 2, 2);
    }

    // Subtle geometric accent
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let r = 100; r < 600; r += 120) {
        ctx.beginPath();
        ctx.arc(W/2, H/2, r, 0, Math.PI*2);
        ctx.stroke();
    }
    ctx.restore();

    // Draw captions
    if (top)    drawCaption(top,    W / 2, 120);
    if (bottom) drawCaption(bottom, W / 2, 900);

    // AI label watermark
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'right';
    ctx.fillText('MemeGPT AI • Offline Mode', W - 20, H - 20);

    currentDataUrl = canvas.toDataURL('image/png');
    return { isAI: true, usedFallback: true };
}

// ─── DRAW MEME (canvas mode — AI / custom / filters only) ────────────────────
function drawMeme(img, top, bottom, isAI = false) {
    // Standard target resolution: 600x939
    const W = 600;
    const H = 939;
    canvas.width  = W;
    canvas.height = H;
    showCanvasMode();

    ctx.filter = getCanvasFilter(currentFilter);
    ctx.fillStyle = '#0a0a0f'; // Match background
    ctx.fillRect(0, 0, W, H);

    // Calculate scaling to fill 600x939 correctly (letterbox if needed)
    const scale = Math.min(W / img.width, H / img.height);
    const x = (W - img.width * scale) / 2;
    const y = (H - img.height * scale) / 2;
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.filter = 'none';

    if (currentFilter === 'vhs') drawVHSEffect();

    // Overlay captions for AI images (templated already have them in JPG if coming from memegen)
    if (isAI && (top || bottom)) {
        const captionY = 90;
        const bottomY  = 880;
        if (top)    drawCaption(top,    W / 2, captionY);
        if (bottom) drawCaption(bottom, W / 2, bottomY);
    }

    currentDataUrl = canvas.toDataURL('image/jpeg', 0.92);
}



function getCanvasFilter(f) {
    switch (f) {
        case 'dank':      return 'contrast(175%) saturate(190%) brightness(115%)';
        case 'grayscale': return 'grayscale(100%)';
        case 'vintage':   return 'sepia(60%) contrast(110%) brightness(95%)';
        case 'neon':      return 'contrast(130%) saturate(250%) hue-rotate(20deg) brightness(110%)';
        default:          return 'none';
    }
}

function drawVHSEffect() {
    // Scanlines
    for (let i = 0; i < 1000; i += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, i, 1000, 2);
    }
    // Chromatic shift
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255,0,0,0.04)';
    ctx.fillRect(-5, 0, 1000, 1000);
    ctx.globalCompositeOperation = 'source-over';
}

function drawCaption(text, x, y) {
    if (!text) return;
    const fs = Math.min(currentFontSize, 100);
    ctx.font = `900 ${fs}px ${currentFont}, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    // Auto-shrink text to fit
    while (ctx.measureText(text.toUpperCase()).width > 940 && fs > 28) {
        ctx.font = `900 ${fs - 2}px ${currentFont}, Impact, sans-serif`;
    }

    ctx.lineWidth = Math.max(fs * 0.18, 8);
    ctx.strokeStyle = 'black';
    ctx.strokeText(text.toUpperCase(), x, y);
    ctx.fillStyle = currentColor;
    ctx.fillText(text.toUpperCase(), x, y);
}

// ─── STATUS HELPERS ─────────────────────────────────────────────────────────
function setStatus(pct, text, icon = '⚡') {
    progressInner.style.width = `${pct}%`;
    progressPct.textContent   = `${pct}%`;
    statusText.textContent    = text;
    statusIcon.textContent    = icon;
}

function showOverlay() {
    statusOverlay.style.opacity = '1';
    statusOverlay.style.pointerEvents = 'auto';
}
function hideOverlay() {
    statusOverlay.style.opacity = '0';
    statusOverlay.style.pointerEvents = 'none';
}

// ─── MAIN GENERATION ─────────────────────────────────────────────────────────
async function startGeneration() {
    if (isGenerating) return;
    isGenerating = true;

    const top    = topTextEl.value.trim();
    const bottom = bottomTextEl.value.trim();
    const tmpl   = selectedTemplate;

    // Show result, hide empty state
    emptyState.classList.add('hide');
    resultArea.classList.remove('hide');
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').textContent = 'Generating...';
    generateBtn.querySelector('.btn-loader').classList.remove('hide');
    showOverlay();

    try {
        let url, isAI = false;

        if (tmpl === 'custom') {
            isAI = true;
            const rawPrompt = promptEl.value.trim() || 'viral funny meme';
            const prompt = gptEngine.optimize(rawPrompt);

            // Try multiple AI image providers in order (Using target size 600x939)
            const seed = Date.now();
            const aiSources = [
                `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=939&nologo=true&seed=${seed}`,
                `https://picsum.photos/seed/${seed}/600/939`,
                `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=600&height=939&seed=${seed + 1}`,
            ];


            setStatus(20, '🤖 Asking AI to paint your meme...', '🤖');

            let loaded = false;
            for (const aiUrl of aiSources) {
                try {
                    setStatus(35, `📡 Trying AI source...`, '⌛');
                    const img = await loadImage(aiUrl);
                    drawMeme(img, top, bottom, true);
                    loaded = true;
                    break;
                } catch (e) {
                    console.warn('⚠️ AI source failed:', e.message);
                }
            }

            if (!loaded) {
                // All APIs failed — use canvas gradient fallback
                setStatus(60, '🎨 Generating gradient meme (offline mode)...', '🎨');
                drawFallbackMeme(top || 'AI GENERATED', bottom || 'MEMEGPT PRO', prompt);
                showToast('🎨 AI APIs unavailable — used offline canvas mode!');
            }

            setStatus(100, '✅ Meme ready!', '✅');
            saveToHistory(currentDataUrl, 'Custom AI');
            updateMemeCount();
            setTimeout(hideOverlay, 2000);
            return; // exit early, already handled

        } else {
            // ── TEMPLATE MEME: display directly as <img> (no canvas distortion) ──
            const url = buildUrl(tmpl, top, bottom);
            setStatus(20, `📡 Fetching "${TEMPLATES[tmpl]?.name || tmpl}"...`, '📡');

            // Verify image loads (try proxy if needed)
            setStatus(50, '🔄 Loading meme image...', '⏳');
            try {
                await loadImage(url);  // Just to check it loads; we show via img src
            } catch {
                showToast('⚠️ Image slow to load — showing anyway');
            }

            setStatus(85, '🎨 Rendering meme...', '🎨');
            showImgMode(url);

            setStatus(100, '✅ Meme generated!', '✅');

            // For history thumbnail — save URL, makeThumb will handle it
            saveToHistory(url, TEMPLATES[tmpl]?.name || tmpl);
            updateMemeCount();
            setTimeout(hideOverlay, 2000);
            return;
        }

    } catch (err) {
        console.error(err);
        setStatus(0, `❌ ${err.message}`, '❌');
        const isNetwork = err.message.includes('fail') || err.message.includes('timeout') || err.message.includes('source');
        if (isNetwork) {
            showToast(`⚠️ Network error — retrying in 3s...`);
            setTimeout(() => { isGenerating = false; startGeneration(); }, 3000);
            return;
        } else {
            showToast(`❌ ${err.message}`);
            setTimeout(hideOverlay, 3000);
        }
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector('.btn-text').textContent = 'GENERATE MEME';
        generateBtn.querySelector('.btn-loader').classList.add('hide');
        isGenerating = false;
    }
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
function makeThumb(dataUrl, size = 200) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            c.getContext('2d').drawImage(img, 0, 0, size, size);
            resolve(c.toDataURL('image/jpeg', 0.72));
        };
        img.src = dataUrl;
    });
}

async function saveToHistory(dataUrl, name) {
    try {
        const thumb = await makeThumb(dataUrl, 200);
        memeHistory.unshift({ dataUrl: thumb, fullUrl: dataUrl, name, time: Date.now() });
        if (memeHistory.length > 16) memeHistory.pop();
        localStorage.setItem('memeHistory', JSON.stringify(memeHistory));
    } catch (e) {
        console.warn('History save skipped (storage full):', e.message);
    }
    renderHistory();
}

function renderHistory() {
    const grid = document.getElementById('historyGrid');
    if (!memeHistory.length) {
        grid.innerHTML = '<div class="history-empty">No memes yet. Generate some! 🎭</div>';
        return;
    }
    grid.innerHTML = memeHistory.map((item, i) => `
        <div class="history-item" data-idx="${i}" title="${item.name}">
            <img src="${item.dataUrl}" alt="${item.name}" loading="lazy">
            <button class="history-dl-btn" data-idx="${i}" title="Download">📥</button>
            <div class="history-item-overlay">${item.name}</div>
        </div>
    `).join('');

    grid.querySelectorAll('.history-dl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.dataset.idx);
            downloadDataUrl(memeHistory[idx].dataUrl, `meme-${idx+1}.png`);
        });
    });
    grid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.idx);
            // Load this meme back onto canvas
            const img = new Image();
            img.onload = () => {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                currentDataUrl = memeHistory[idx].dataUrl;
                emptyState.classList.add('hide');
                resultArea.classList.remove('hide');
            };
            img.src = memeHistory[idx].dataUrl;
        });
    });
}

function updateMemeCount() {
    totalMemes++;
    localStorage.setItem('totalMemes', totalMemes);
    memeCountEl.textContent = `🎭 ${totalMemes} meme${totalMemes !== 1 ? 's' : ''} made`;
}

// ─── CHAOS ENGINE ────────────────────────────────────────────────────────────
const chaosSubjects = [
    'A glitchy robot','A 4D-chess cat','A crying developer','A golden hamster CEO',
    'An alien influencer','A floating pizza slice','A Victorian scientist','A neon shiba inu',
    'A sentient cloud','A time-traveling potato','A sleep-deprived programmer','A chaotic pigeon',
    'A caffeinated coder','A quantum raccoon','A philosophical duck','A drama llama'
];
const chaosActions = [
    'fixing a reality bug','explaining memes to a rock','launching a rocket to a donut planet',
    'winning a lawsuit against time','finding a missing semicolon in space','ordering 1000 GPUs',
    'deploying to production on Friday','debugging at 3 AM','refusing to write documentation',
    'running tests in production','yeet-ing the entire codebase','forgetting to git commit'
];
const chaosTwists = [
    'in a vaporwave dimension','styled as 1920s cartoons','but everything is pixelated',
    'with dramatic cinematic lighting','surrounded by laser-eyed pigeons',
    'in a holographic cyberpunk city','with cosmic horror vibes','but make it lofi aesthetic',
    'in glorious 8-bit retro pixels','with an anime plot twist ending'
];
const chaosQuotes = [
    'I HAVE SEEN THE END','IT WAS A SEMICOLON','THE CLOUD IS ON FIRE',
    'ERROR 404: REALITY NOT FOUND','DEBUGGING INTENSIFIES','NOT MY JOB',
    'IT WORKS ON MY MACHINE','POWERED BY CHAOS','ABSOLUTE UNIT',
    'WHO DID THIS?','GLITCH IN THE MATRIX','HAVE YOU TRIED TURNING IT OFF?',
    'SEND HELP','ONE DOES NOT SIMPLY','THIS IS FINE','TASK FAILED SUCCESSFULLY',
    'YEET','CANNOT REPRODUCE','WORKS IN DEV','I AM SPEED'
];

const allTemplateKeys = ['custom', ...Object.keys(TEMPLATES)];

function generateAutoChaos() {
    // Random template
    const rndTemplate = allTemplateKeys[Math.floor(Math.random() * allTemplateKeys.length)];
    selectTemplate(rndTemplate);

    // Random prompt
    const s = chaosSubjects[Math.floor(Math.random() * chaosSubjects.length)];
    const a = chaosActions[Math.floor(Math.random() * chaosActions.length)];
    const t = chaosTwists[Math.floor(Math.random() * chaosTwists.length)];
    promptEl.value = `${s} ${a} ${t}`;

    // Random captions
    topTextEl.value    = chaosQuotes[Math.floor(Math.random() * chaosQuotes.length)];
    bottomTextEl.value = chaosQuotes[Math.floor(Math.random() * chaosQuotes.length)];

    // Random filter
    const filters = ['none','dank','grayscale','vintage','neon'];
    setFilter(filters[Math.floor(Math.random() * filters.length)]);

    console.log('🔥 CHAOS MODE: ', { template: rndTemplate, prompt: promptEl.value });
    startGeneration();
}

// ─── TEMPLATE GRID ───────────────────────────────────────────────────────────
function buildTemplateGrid(filter = 'all', search = '') {
    const grid = document.getElementById('templateGrid');
    const searchQ = search.toLowerCase();

    // Custom AI tile first
    let html = '';
    const showCustom = (filter === 'all') && (!searchQ || 'custom ai'.includes(searchQ));
    if (showCustom) {
        html += `
            <div class="tmpl-card ${selectedTemplate === 'custom' ? 'selected' : ''}" data-id="custom">
                <div class="tmpl-selected-check">✓</div>
                <span class="tmpl-emoji">🤖</span>
                <span class="tmpl-name">Custom AI</span>
            </div>`;
    }

    for (const [id, t] of Object.entries(TEMPLATES)) {
        if (filter !== 'all' && t.cat !== filter) continue;
        if (searchQ && !t.name.toLowerCase().includes(searchQ) && !id.includes(searchQ)) continue;
        const isSelected = selectedTemplate === id;
        const previewUrl = `https://api.memegen.link/images/${resolveId(id)}.jpg?width=120&height=120`;
        html += `
            <div class="tmpl-card ${isSelected ? 'selected' : ''}" data-id="${id}" title="${t.name}">
                <div class="tmpl-selected-check">✓</div>
                <img src="${previewUrl}" alt="${t.name}" loading="lazy"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
                >
                <span class="tmpl-emoji" style="display:none">${t.emoji}</span>
                <span class="tmpl-name">${t.name}</span>
            </div>`;
    }

    grid.innerHTML = html || '<p style="color:var(--text-3);text-align:center;padding:1rem;grid-column:1/-1">No templates found</p>';

    grid.querySelectorAll('.tmpl-card').forEach(card => {
        card.addEventListener('click', () => {
            selectTemplate(card.dataset.id);
            // Switch to AI tab to show prompt if custom, else remain
        });
    });
}

function selectTemplate(id) {
    selectedTemplate = id;
    templateEl.value = id;

    // Update selected card
    document.querySelectorAll('.tmpl-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.id === id);
    });

    // Update preview label
    if (id === 'custom') {
        selectedNameEl.textContent = '🤖 Custom AI (Unique)';
    } else {
        const t = TEMPLATES[id];
        selectedNameEl.textContent = t ? `${t.emoji} ${t.name}` : id;
    }
}

// ─── FILTERS & STYLE ─────────────────────────────────────────────────────────
function setFilter(f) {
    currentFilter = f;
    document.querySelectorAll('.style-card').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === f);
    });
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── DOWNLOAD ────────────────────────────────────────────────────────────────
function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
    showToast('📥 Download started!');
}

// ─── SHARE / COPY ────────────────────────────────────────────────────────────
async function copyImageToClipboard() {
    if (!currentDataUrl) { showToast('⚠️ Generate a meme first!'); return; }
    try {
        const res  = await fetch(currentDataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('✅ Meme copied to clipboard!');
    } catch {
        showToast('⚠️ Copy failed — try downloading instead');
    }
}

function copyLink() {
    const text = `🎭 Check out this meme I made with MemeGPT Pro!\n\nTemplate: ${selectedNameEl.textContent}\n\n#MemeGPT #AIArt`;
    navigator.clipboard.writeText(text)
        .then(() => showToast('🔗 Caption copied! Paste to share'))
        .catch(() => showToast('⚠️ Could not copy link'));
}

function tweetMeme() {
    const text = encodeURIComponent('😂 Just made this meme with MemeGPT Pro — AI-powered viral memes in seconds! ⚡\n\n#MemeGPT #AIArt #Memes');
    window.open(`https://twitter.com/intent/tweet?text=${text}`,'_blank');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
    // Build template grid
    buildTemplateGrid('all');

    // Restore count
    memeCountEl.textContent = `🎭 ${totalMemes} meme${totalMemes !== 1 ? 's' : ''} made`;

    // Restore history
    renderHistory();

    // ── Tabs ──────────────────────────────────────────────
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // ── Chaos Button ──────────────────────────────────────
    document.getElementById('autoChaosBtn').addEventListener('click', generateAutoChaos);

    // ── Generate ──────────────────────────────────────────
    generateBtn.addEventListener('click', startGeneration);

    // ── GPT Think ─────────────────────────────────────────
    gptThinkBtn.addEventListener('click', () => {
        const topic = promptEl.value.trim() || 'random viral meme';
        promptEl.value = gptEngine.optimize(topic);
        generateAICaptions();
        showToast('🤖 GPT optimized your prompt + generated captions!');
    });

    // ── Mood Picker ───────────────────────────────────────
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMood = btn.dataset.mood;
            // Auto-regenerate suggestions when mood changes
            generateAICaptions();
        });
    });

    // ── AI Caption Button ─────────────────────────────────
    document.getElementById('aiCaptionBtn').addEventListener('click', generateAICaptions);
    document.getElementById('refreshCaptionsBtn').addEventListener('click', generateAICaptions);

    // ── Dice Buttons (random single caption) ─────────────
    document.querySelectorAll('.caption-dice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pairs = getCaptionsForTemplate(selectedTemplate, currentMood);
            const pick  = pairs[Math.floor(Math.random() * pairs.length)];
            if (!pick) return;
            if (btn.dataset.target === 'top') {
                topTextEl.value = pick[0] || '';
            } else {
                bottomTextEl.value = pick[1] || pick[0] || '';
            }
            topTextEl.style.borderColor = '';
            bottomTextEl.style.borderColor = '';
            const mc = MOOD_CONFIG[currentMood];
            const el = btn.dataset.target === 'top' ? topTextEl : bottomTextEl;
            el.style.borderColor = mc.color;
            el.style.boxShadow = `0 0 0 3px ${mc.bg}`;
            setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 600);
        });
    });

    // Auto-load suggestions on init
    generateAICaptions();

    // ── Prompt Chips ──────────────────────────────────────
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            promptEl.value = chip.textContent.replace(/^[\s\S]{1,3}\s/, '').trim();
            promptEl.focus();
        });
    });

    // ── Download ──────────────────────────────────────────
    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!currentDataUrl) { showToast('⚠️ No meme to download yet!'); return; }
        downloadDataUrl(currentDataUrl, `memegpt-${Date.now()}.png`);
    });

    // ── Remix ─────────────────────────────────────────────
    document.getElementById('remixBtn').addEventListener('click', () => {
        startGeneration();
    });

    // ── Copy / Share ──────────────────────────────────────
    document.getElementById('copyImgBtn').addEventListener('click', copyImageToClipboard);
    document.getElementById('copyLinkBtn').addEventListener('click', copyLink);
    document.getElementById('copyEmojiBtn').addEventListener('click', () => {
        const quotes = ['😂😂😂', '💀 DEAD', '🔥🔥🔥', '😭😭', '🤣🤣🤣'];
        navigator.clipboard.writeText(quotes[Math.floor(Math.random() * quotes.length)])
            .then(() => showToast('😂 Emoji reaction copied!'));
    });
    document.getElementById('tweetBtn').addEventListener('click', tweetMeme);

    // ── Template Search & Filter ──────────────────────────
    let searchDebounce;
    document.getElementById('templateSearch').addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
            buildTemplateGrid(activeCat, e.target.value);
        }, 200);
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const search = document.getElementById('templateSearch').value;
            buildTemplateGrid(btn.dataset.cat, search);
        });
    });

    // ── Style Filters ─────────────────────────────────────
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', () => setFilter(card.dataset.filter));
    });

    // ── Font Picker ───────────────────────────────────────
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFont = btn.dataset.font;
        });
    });

    // ── Font Size ─────────────────────────────────────────
    document.getElementById('fontSize').addEventListener('input', (e) => {
        currentFontSize = parseInt(e.target.value);
        document.getElementById('fontSizeVal').textContent = currentFontSize;
    });

    // ── Color Picker ──────────────────────────────────────
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentColor = dot.dataset.color;
        });
    });

    // ── Theme Toggle ──────────────────────────────────────
    const themeBtn = document.getElementById('themeToggleBtn');
    themeBtn.addEventListener('click', () => {
        const isLight = document.body.getAttribute('data-theme') === 'light';
        document.body.setAttribute('data-theme', isLight ? '' : 'light');
        themeBtn.textContent = isLight ? '🌙' : '☀️';
        showToast(isLight ? '🌙 Dark mode' : '☀️ Light mode');
    });

    // ── History ───────────────────────────────────────────
    const historyPanel = document.getElementById('historyPanel');
    document.getElementById('historyToggleBtn').addEventListener('click', () => {
        historyPanel.classList.toggle('hide');
    });
    document.getElementById('historyCloseBtn').addEventListener('click', () => {
        historyPanel.classList.add('hide');
    });
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        memeHistory = [];
        localStorage.removeItem('memeHistory');
        renderHistory();
        showToast('🗑️ History cleared');
    });

    // ── Keyboard Shortcut ────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            startGeneration();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            generateAutoChaos();
        }
    });

    showToast('🚀 MemeGPT Pro v11 loaded — Ctrl+Enter to generate!', 4000);
    console.log('🚀 MemeGPT Pro v11 — 80+ Templates, Filters, History, Share. ONLINE.');
}

init();
