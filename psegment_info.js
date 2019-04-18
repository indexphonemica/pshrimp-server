const features = require('./psegmentizer_features');

function get_name(x) { return x.name };

// ------------------------------------
// -- PhonemeMatrix and PhonemeArray --
// ------------------------------------

function PhonemeMatrix(phonemes, phoneme_klass) {
    var ys = new Set();
    var xs = new Set();

    this.phoneme_klass = phoneme_klass; // 'consonant', 'click', or 'vowel'

    for (let p of phonemes) {
        let [y, x] = this.get_y_x(p);
        ys.add(y);
        xs.add(x);
    }

    var comparem = (a, b) => a.order - b.order;
    xs = [...xs].sort(comparem).map(get_name);
    ys = [...ys].sort(comparem).map(get_name);

    this.map = new Map();
    this.y_headers = [];
    this.x_headers = [];
    this._size = 0;

    for (let y of ys) this.y_headers.push(y);
    for (let x of xs) this.x_headers.push(x);

    for (let y of ys) {
        this.map.set(y, new Map());
        for (let x of xs) {
            this.map.get(y).set(x, []); // TODO: should this be a set? Then we'd just sort them later.
        }
    }

    for (let p of phonemes) {
        let foo = this.get_y_x(p).map(get_name);
        this.push(foo[0], foo[1], p)
    }

    if (this.phoneme_klass === 'consonant') {
        // Compress the chart to avoid unneeded columns.
        // For now, this will just handle labiodental fricatives and /w/.
        // Eventually it should be generalized, to handle things like palatal /ʃ/ (Cham, MABA, Koalib, Krongo, Kanga (Kanga))
        // and dental plosives + alveolar everything else (Manange).
        // It also can't handle /j/ yet, and should be able to do that.
        // TODO

        // temp function for this big hairy if statement
        // later we'll iterate through everything probably
        let should_merge = (moa, poa_from, poa_into) => {
            return this.count_x(poa_from) > 0 &&
                   this.count_x(poa_into) > 0 &&
                   this.count_x(poa_from) === this.get_size(moa, poa_from) &&
                   this.get_size(moa, poa_into) === 0; 
        }

        if (should_merge('fricative', 'labiodental', 'labial')) {
            this.merge_x('labiodental', 'labial');
        }
        if (should_merge('resonant', 'rounded velar', 'velar')) {
            this.merge_x('rounded velar', 'velar');
        }
    }
}
PhonemeMatrix.prototype.get = function (y, x) {
    return this.map.get(y).get(x);
}
PhonemeMatrix.prototype.get_size = function (y, x) {
    if (!this.map.has(y)) return 0;
    if (!this.map.get(y).has(x)) return 0;
    return this.get(y, x).length;
}
PhonemeMatrix.prototype.push = function (y, x, foo) {
    this.get(y, x).push(foo);
    this._size += 1;
}
PhonemeMatrix.prototype.count_y = function (y) {
    // Return the number of distinct phonemes in a chart row.
    if (!this.map.has(y)) return 0;
    return [...this.map.get(y).entries()].reduce((acc, cur) => acc + cur[1].length, 0)
}
PhonemeMatrix.prototype.count_x = function (x) {
    // Return the number of distinct phonemes in a chart column.
    if (this.x_headers.indexOf(x) === -1) return 0;
    return [...this.map.entries()].reduce((acc, cur) => acc + cur[1].get(x).length, 0)
}
PhonemeMatrix.prototype.is_not_empty = function (y) {
    return this._size > 0;
}
PhonemeMatrix.prototype.merge_x = function (from, into) {
    // Merge `from` into `into`, and then delete `from`.
    for (var [y_key, x] of this.map) {
        x.set(into, x.get(into).concat(x.get(from)));
        x.delete(from);
    } 
    this.x_headers.splice(this.x_headers.indexOf(from));
}
PhonemeMatrix.prototype.size = function () { // Seems easier than tracking a size attr in PhonemeArray
    return this._size;
}
PhonemeMatrix.prototype.to_json = function () {
    var tmp = [];
    for (let y of this.map.entries()) {
        var [y_header, y_contents] = y;
        var row = [];
        for (let x of y_contents.entries()) {
            var [x_header, x_contents] = x;
            row.push(x_contents.sort(this.order.bind(this)).map(i => i.phoneme));
        }
        tmp.push(row);
    }
    return {
        'size': this._size
    ,   'contents': tmp
    }
}
PhonemeMatrix.prototype.get_y_x = function (p) {
    // Get whatever features are used for the y and x axes on this grid.
    if (this.phoneme_klass === 'consonant' || this.phoneme_klass === 'click') return [p.manner, p.place];
    if (this.phoneme_klass === 'vowel') return [p.height, p.frontness];
}
PhonemeMatrix.prototype.order = function (a, b) {
    if (this.phoneme_klass === 'consonant' || this.phoneme_klass === 'click') {
        return order_segments(a, b, [
                'voicing'
            ,   'pharyngeal_configuration'
            ,   'airstream_mechanism'
            ,   'duration'
            ,   'strength'
            ]);
    }
    if (this.phoneme_klass === 'vowel') {
        return order_segments(a, b, [
                'roundness'
            ,   'nasality'
            ,   'length'
            ]); // TODO   
    }
}

// We want tones to also have a to_html, so we'll make a one-dimensional array too. TODO test this
function PhonemeArray (phonemes) {
    this.phonemes = phonemes;
}
PhonemeArray.prototype.to_json = function () {
    return {'size': this.phonemes.length, 'contents': this.phonemes.map(i => i.phoneme).sort(lexicographic_order)}
}
PhonemeArray.prototype.size = function () {
    return this.phonemes.length;
}

// -------------------------
// -- Segment information --
// -------------------------

module.exports = function segment_info(segment) {
    // vowels
    if (segment.syllabic !== '-' && segment.consonantal === '-') {
        // diphthongs
        if ([segment.front, segment.back, segment.high, segment.low, segment.tense].some(x => x && x.indexOf(',') > -1)) return vowel_info(segment, true); 
        // monophthongs
        return vowel_info(segment);
    }
    // fricated vowels
    if (segment.syllabic === '+' && segment.consonantal === '+' && segment.phoneme.indexOf('\u0353') > -1) return vowel_info(segment);
    // erroneous diphthongs (aj, aw, etc.)
    if (segment.syllabic && segment.syllabic.indexOf(',') > -1) return vowel_info(segment, true);
    // Weird notation for fricated vowels in SPA inventories
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

    // if it's not a vowel or a tone, it's a consonant
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
    ,   place: get_place_and_secondary_articulation(segment)
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
// TODO this is really dumb.
var places = undefined;
var precomponents = undefined;
var effluxes = undefined;

var click_characters = 'ǃǀǁǂ‼ʘ';
var split_regex = new RegExp(`([^${click_characters}]*)([${click_characters}])([^${click_characters}]*)`)
function compute_places() {
    return {
        'ǃ': get_by_name('place_and_secondary_articulation', 'alveolar')
    ,   'ǀ': get_by_name('place_and_secondary_articulation', 'dental')
    ,   'ǁ': get_by_name('place_and_secondary_articulation', 'alveolopalatal') // cheap hack - these are lateral, but the ordering works out
    ,   'ǂ': get_by_name('place_and_secondary_articulation', 'palatal')
    ,   '‼': get_by_name('place_and_secondary_articulation', 'retroflex')
    ,   'ʘ': get_by_name('place_and_secondary_articulation', 'labial')
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

function get_place_and_secondary_articulation(segment) {
    var seg = segment.phoneme;

    // Glottals are hard
    if (seg[0] === 'h' || seg[0] === 'ʔ' || seg[0] === 'ɦ') return get_by_name('place_and_secondary_articulation', 'glottal');

    // Errata
    if (seg === 'ŋm') return get_by_name('place_and_secondary_articulation', 'labial-velar'); // given as -,+labial - this should be +labial
    if (seg === 'ɠɓ') return get_by_name('place_and_secondary_articulation', 'labial-velar');
    if (seg === 'ɡbʲ' || seg === 'kpʲ' || seg === 'ŋmʲ') return get_by_name('place_and_secondary_articulation', 'palatalized labial-velar');
    if (seg === 'ɡbʷ' || seg === 'kpʷ' || seg === 'ŋmʷ') return get_by_name('place_and_secondary_articulation', 'rounded labial-velar');
    if (seg === 'nɡ') return get_by_name('place_and_secondary_articulation', 'velar');
    if (seg === 'nɟ' || seg === 'ɟʲ' || seg === 'ɲcʲ') return get_by_name('place_and_secondary_articulation', 'palatal');
    if (seg === 'ndzʲ') return get_by_name('place_and_secondary_articulation', 'palatalized alveolar'); // should be +back but isn't
    if (seg === 'ɹ' || seg === 'ɹ' || seg === 'ɹˤ' || seg === 'ɹ̰ˤ' || seg === 'ɹ̝') return get_by_name('place_and_secondary_articulation', 'alveolar') // given as alveolopalatal
    if (seg === 'ŋmkpɾ') return get_by_name('place_and_secondary_articulation', 'labial-velar');
    if (seg === 'nɡɾ') return get_by_name('place_and_secondary_articulation', 'velar');

    // you know, I don't think Irish has labial-velars
    if (seg.indexOf('ʷˠ') > -1) return get_by_name('place_and_secondary_articulation', 'rounded labial');

    return get('place_and_secondary_articulation', segment)
}

function get(form, segment) {
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

function order_segments(a, b, feature_order) {
    for (let f of feature_order) {
        if (!a.hasOwnProperty(f) || !b.hasOwnProperty(f) || !a[f].hasOwnProperty('order') 
            || !b[f].hasOwnProperty('order')) {continue};
        if (a[f].order < b[f].order) return -1;
        if (a[f].order > b[f].order) return 1;
    }

    return lexicographic_order(a.phoneme, b.phoneme);
}

function lexicographic_order(a, b) {
    return a.localeCompare(b);
}