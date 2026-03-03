const features = require('./psegmentizer_features');

// -------------------------
// -- Segment information --
// -------------------------

const SYLLABIC_CONSONANTS = new Set(['ɹ̩', 'ʋ̩', 'ɹ̪̰̩', 'ɹ̪̩'])

module.exports = function segment_info(segment) {
    // vowels
    if (segment.syllabic !== '-' && segment.consonantal === '-') {
        // diphthongs
        if ([segment.front, segment.back, segment.high, segment.low, segment.tense].some(x => x && x.indexOf(',') > -1)) return vowel_info(segment, true); 
        // syllabic consonants that aren't +consonantal
        if (SYLLABIC_CONSONANTS.has(segment.phoneme)) return consonant_info(segment, true);
        // monophthongs
        return vowel_info(segment);
    }
    // fricated vowels
    if (segment.syllabic === '+' && segment.consonantal === '+' && segment.phoneme.indexOf('\u0353') > -1) return vowel_info(segment);
    // erroneous diphthongs (aj, aw, etc.)
    if (segment.syllabic && segment.syllabic.indexOf(',') > -1) return vowel_info(segment, true);
    // weird notation for fricated vowels in SPA inventories
    if (segment.syllabic === '+' && segment.phoneme.indexOf('z̞̩') > -1) return vowel_info(segment);
    // syllabic consonants
    if (segment.syllabic === '+' && segment.consonantal === '+') return consonant_info(segment, true);

    // tones
    if (segment.tone === '+') return tone_info(segment);

    // click consonants
    if (segment.click && segment.click.indexOf('+') > -1) return click_info(segment);
            
    // errata that can't be handled anywhere else yet - eventually should use segment_class instead of guessing from features. TODO
    // these are apical vowels
    if (segment.phoneme === 'ɹ̪̹̩' || segment.phoneme === 'ɻ̹̩') {
        return {
            phoneme: segment.phoneme
        ,   klass: 'vowel'
        ,   height: get_by_name('height', 'high')
        ,   frontness: get_by_name('frontness', 'central')
        ,   roundness: get_by_name('roundness', 'unrounded')
        ,   length: get_by_name('duration', 'normal')
        ,   nasality: get_by_name('nasality', 'oral')
        }    
    }

    if (segment.phoneme === 'ʈɽ̥' || segment.phoneme === 'ʈɽ̥ʰ' || segment.phoneme === 'ɖɽ') {
        let tmp = consonant_info(segment);
        tmp.manner = get_by_name('manner', 'affricate');
        return tmp;
    }

    // For consistency, these should be treated as affricates, the way kˡ etc. are
    // But it can wait until featuralization 2.0
    // Currently I don't think they're distinguishable from velarized dentals!
    if (segment.phoneme === 'kʵ' || segment.phoneme === 'kʵʰ' || segment.phoneme === 'xʵ') {
        let tmp = consonant_info(segment);
        tmp.place = get_by_name('place', 'velar');
        return tmp;
    }
    // And for consistency...
    if (segment.phoneme === 'pʵʰ' || segment.phoneme === 'pʵ' ||
        segment.phoneme === 'm̥ʵ'  || segment.phoneme === 'mʵ') {
        let tmp = consonant_info(segment);
        tmp.place = get_by_name('place', 'labial');
        return tmp;
    }

    // I have no idea, so let's just round off.
    if (segment.phoneme === 'ⁿtʑ') {
        return {
            phoneme: segment.phoneme
        ,   klass: 'consonant'
        ,   place: get_by_name('place', 'palatoalveolar')
        ,   pharyngeal_configuration: get_by_name('pharyngeal_configuration', 'plain')
        ,   manner: get_by_name('manner', 'affricate')
        ,   voicing: get_by_name('voicing', 'voiced')
        ,   airstream_mechanism: get_by_name('airstream_mechanism', 'modal')
        ,   duration: get_by_name('duration', 'normal')
        ,   strength: get_by_name('strength', 'normal')
        }
    }

    if (segment.phoneme === 'qʲ' || segment.phoneme === 'qʲʼ' || 
        segment.phoneme === 'χʲ' || segment.phoneme === 'ʁʲ') {
        let tmp = consonant_info(segment);
        tmp.place = get_by_name('place', 'palatalized uvular');
        return tmp;
    }

    // if (consonant_info(segment).place.name === 'undefined') {
    //     console.log(segment);
    // }
    return consonant_info(segment);
}

function vowel_info(segment, is_diphthong = false) {
    let height = get('height', segment);
    let frontness = get('frontness', segment);
    let roundness = get('roundness', segment);

    // Errata
    const seg = segment.phoneme;
    if (seg.indexOf('ɯ̞') > -1) height = get_by_name('height', 'high-mid');
    if (seg.indexOf('z̞̩') > -1) { // treat 'apical vowels' as high central
        height = get_by_name('height', 'high');
        frontness = get_by_name('frontness', 'central')
    }
    if (seg.indexOf('ə') === 0) { // schwa is typically considered a mid vowel; here it's conflated with 3
        height = get_by_name('height', 'mid');
    }

    // TODO more features? (phonation, etc.)

    return {
        phoneme: segment.phoneme
    ,   klass: is_diphthong ? 'diphthong' : 'vowel'
    ,   height: height
    ,   frontness: frontness
    ,   roundness: get('roundness', segment)
    ,   length: get('duration', segment)
    ,   nasality: get('nasality', segment)
    }
}

function tone_info(segment) {
    return {
        phoneme: segment.phoneme
    ,   klass: 'tone'
    }
}

function consonant_info(segment, is_syllabic = false) {
    return {
        phoneme: segment.phoneme
    ,   klass: is_syllabic ? 'syllabic_consonant' : 'consonant'
    ,   place: get_place(segment)
    ,   pharyngeal_configuration: get('pharyngeal_configuration', segment)
    ,   manner: get('manner', segment)
    ,   voicing: get('voicing', segment)
    ,   airstream_mechanism: get('airstream_mechanism', segment)
    ,   duration: get('duration', segment) // probably shouldn't call this "length"
    ,   strength: get('strength', segment)
    }
}

// ----------------
// -- Click info --
// ----------------

// Don't waste time recomputing these, but also don't compute them on load.
// If you compute them on load, the order of your script tags matters, and that'll be confusing!
var places = undefined;
var precomponents = undefined;
var effluxes = undefined;

var click_characters = 'ǃǀǁǂ‼ʘ';
var split_regex = new RegExp(`([^${click_characters}]*)([${click_characters}])([^${click_characters}]*)`)
function compute_places() {
    return {
        'ǃ': get_by_name('place', 'alveolar')
    ,   'ǀ': get_by_name('place', 'dental')
    ,   'ǁ': get_by_name('place', 'alveolopalatal') // cheap hack - these are lateral, but the ordering works out
    ,   'ǂ': get_by_name('place', 'palatal')
    ,   '‼': get_by_name('place', 'retroflex')
    ,   'ʘ': get_by_name('place', 'labial')
    }
}
function compute_precomponents() {
    var res = {};
    for (let i of features.click_precomponent) {
        res[i.meta.string] = i.meta;
    }
    return res;
}
function compute_effluxes() {
    var res = {};
    for (let i of features.click_efflux) {
        res[i.meta.string] = i.meta;
    }    
    return res;
}

function click_info(segment) {
    // This is all string processing. PHOIBLE's featural model doesn't handle clicks very well.

    // First, compute the above objects if we need to.
    if (places === undefined) places = compute_places();
    if (precomponents === undefined) precomponents = compute_precomponents();
    if (effluxes === undefined) effluxes = compute_effluxes();

    var seg = segment.phoneme.replace(/ǃǃ/,'‼'); // Make this a single character so the regex is simpler.
    seg = seg.replace(/ǃ̠/,'‼'); // This looks like a POA.
    seg = seg.replace(/[\u0353]/,''); // Discard frication diacritic - it's not contrastive, and this simplifies things.
    seg = seg.replace('ǂˡ','ǁ') // Alternate notation for the lateral click in !Xu.
    seg = seg.replace('ʼʰ', 'ʰʼ') // Fix !Xun
    var [_, precomponent, influx, efflux] = split_regex.exec(seg);

    // We want a nice Cartesian chart, so mash the influxes and effluxes together.
    var precomponent_order = precomponents[precomponent].order;
    var efflux_order = effluxes[efflux].order;
    var manner_order = precomponent_order * 100 + efflux_order;

    var res = {
        phoneme: segment.phoneme
    ,   klass: 'click'
    ,   place: places[influx]
    ,   manner: {name: manner_order, order: manner_order}
    }
    return res
}

// ----------------------
// -- Helper functions --
// ----------------------

const ERRATA = {
    'place': {
        'p̪':   'labiodental'
    ,   'm̪':   'labiodental'
    ,   'p̼':   'labiodental'
    ,   'b̪':   'labiodental'
    ,   'm̼':   'labiodental'
    ,   'ˀt̪ɬ': 'dental'
    ,   'ɹ':   'alveolar'
    ,   'ɹ':   'alveolar'
    ,   'ɹˤ':  'alveolar'
    ,   'ɹ̰ˤ':  'alveolar'
    ,   'ɹ̝':   'alveolar'
    ,   'ɹ̥':   'alveolar'
    ,   'tˠʰ': 'alveolar'
    ,   'dzʲ': 'palatalized alveolar'
    ,   'ndzʲ':'palatalized alveolar'
    ,   'rˠ':  'velarized alveolar'
    ,   'ɫ':   'velarized alveolar'
    ,   'ʷʰʂʰ':'rounded retroflex'
    ,   'ʷʰʈ': 'rounded retroflex'
    ,   'ʰtɕ': 'palatoalveolar'
    ,   'ⁿtɕʰ':'palatoalveolar'
    ,   'ʱdʑ': 'palatoalveolar'
    ,   'ⁿdʑ': 'palatoalveolar'
    ,   'ʷʰɕʰ':'rounded palatoalveolar'
    ,   'ʷʰtɕ':'rounded palatoalveolar'
    ,   'ʰtɕʰ':'rounded palatoalveolar'
    ,   'nɟ':  'palatal'
    ,   'ɟʲ':  'palatal'
    ,   'ɲcʲ': 'palatal'
    ,   'j̟':   'palatal'
    ,   'ẅ':   'rounded palatal'
    ,   'w̜ʲ':  'rounded palatal'
    ,   'nɡ':  'velar'
    ,   'w̜':   'rounded velar' // only appears in Khalkha, and it sounds rounded to me
    ,   'w˞':   'rounded velar'
    ,   'ʷʰk': 'rounded velar'
    ,   'ŋm':  'labial-velar'
    ,   'ɠɓ':  'labial-velar'
    ,   'ŋmkpɾ': 'labial-velar'
    ,   'ɡbr': 'labial-velar'
    ,   'kpr': 'labial-velar'
    ,   'kpʲ': 'palatalized labial-velar'
    ,   'ɡbʲ': 'palatalized labial-velar'
    ,   'ŋmʲ': 'palatalized labial-velar'
    ,   'kpʷ': 'rounded labial-velar'
    ,   'ɡbʷ': 'rounded labial-velar'
    ,   'ŋmʷ': 'rounded labial-velar'
    ,   'N':   'glottal'

    ,   'p̻':   'labial' // These and /d̻/ are "checked consonants" in Savara -
                        // "such checked consonants appear at the end of a word and are almost inaudible"
    ,   'b̻':   'labial' 
    ,   'j̻':   'palatal'
    ,   'k̻':   'velar'  

    ,   'l̠˞':   'retroflex' // Apparently a "Retroflex voiced fricationless lateral continuant" from RA,
                           // contrasting with a "Retroflex voiced unaspirated lateral consonant".
                           // Appears in Tamil (RA) and Malayalam (RA). Dunno.
    },
    'manner': {
        't̠ʃɾ': 'plosive'
    ,   'n̠t̠ʃɾ':'plosive'
    ,   'd̠ʒɾ': 'plosive'
    ,   'kpɾ': 'plosive'
    ,   'kpr': 'plosive'
    ,   'ɡbɾ': 'plosive'
    ,   'ɡbr': 'plosive'
    ,   'ⁿɖɽ': 'affricate' // Ersu subapical retroflex affricates with trilled release
    ,   'ⁿʈɽʰ':'affricate'
    ,   'ˀt̪ɬ': 'affricate'
    ,   'ɡˡ':  'affricate'
    ,   'ʰtɕ': 'affricate'
    ,   'ⁿtɕʰ':'affricate'
    ,   'ʷʰtɕ':'affricate'
    ,   'ʰtɕʰ':'affricate'
    ,   'ʱdʑ': 'affricate'
    ,   'ⁿdʑ': 'affricate'
    ,   'ɟʝ̞':  'affricate'
    ,   'ʃ̞':   'fricative' // EE suggests from the textual description in the source that this is just sje
    ,   'ʃ̞ʼ':  'fricative'
    ,   'ɸ̞':   'resonant' // I guess? TODO

    ,   'ɾ̞':   'tap' // for Aragonese - "frequently weakened"
    ,   'R':   'trill' // assuming nothing with "/R/" also has an explicit tap or trill, tap and trill are equivalent here
    ,   'Rʲ':  'trill'
    ,   'R̥':   'trill'
    ,   'R̪':   'trill'
    ,   'R̰':   'trill'
    },
    'height': {
        'ɯ̽': 'high'     // Tuvan /1/
    ,   'ɯ̰̽ː':'high'
    ,   'ɪ̞': 'high-mid'
    ,   'i̽': 'high-mid' // Kumzari /I/
    ,   'ʊ̽': 'high-mid'
    ,   'ʊ̞': 'high-mid'
    ,   'ɯ̽ː':'high-mid'
    ,   'ɪ̞̈': 'high-mid'
    ,   'ʊ̞̈': 'high-mid'
    }, 
    'roundness': { // what in tarnation?
        'i̜': 'unrounded'
    ,   'ɨ̜': 'unrounded'
    },
    'voicing': {
        'ⁿtɕʰ': 'unvoiced'
    ,   'ⁿʈɽʰ': 'unvoiced'
    }
}

function get_place(segment) {
    var seg = segment.phoneme;

    // Glottals are hard
    if (seg[0] === 'h' || seg[0] === 'ʔ' || seg[0] === 'ɦ' || seg === 'ⁿʔ') return get_by_name('place', 'glottal');

    // Handle errata
    if (ERRATA.place[seg]) return get_by_name('place', ERRATA.place[seg]);

    // you know, I don't think Irish has labial-velars
    if (seg.indexOf('ʷˠ') > -1) return get_by_name('place', 'rounded labial');

    return get('place', segment)
}

function get(form, segment) {
    if (ERRATA[form] && ERRATA[form][segment.phoneme]) return get_by_name(form, ERRATA[form][segment.phoneme])
    var res = features[form].find(x => test(segment, x));
    if (res === undefined) return features.unknown;
    return res.meta;
}

function get_by_name(form, name) {
    var res = features[form].find(x => x.meta.name === name);
    return res.meta;
}

function test(segment, foo_oa) {
    // Compares the beginning - beware time-variant features.
    for (let feature_bundle of foo_oa.features) {
        var matches = Object.keys(feature_bundle).every(function (x) {
            if (segment[x] === null && feature_bundle[x] === null) return true; // enable explicit checking for null features
            return !(segment[x] === undefined) && !(segment[x] === null) &&
                    segment[x].indexOf(feature_bundle[x]) === 0;
        });
        if (matches) return true;
    }
    return false;
}