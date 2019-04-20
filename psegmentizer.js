const utils = require('./utils');
const segment_info = require('./psegment_info');

module.exports = function (segments) {
    var mapped = segments.map(x => segment_info(x));

    var consonants = [];
    var clicks = []; // Yes, these are consonants, but they need a separate table. Like lanthanides and actinides.
    var vowels = [];
    var tones = [];
    var syllabic_consonants = [];
    var diphthongs = [];
    var unknowns = [];

    mapped.forEach(x => {
        if (x && x.klass === 'consonant') {
            consonants.push(x)
        } else if (x && x.klass === 'click') {
            clicks.push(x)
        } else if (x && x.klass === 'vowel') {
            vowels.push(x)
        } else if (x && x.klass === 'tone') {
            tones.push(x);
        } else if (x && x.klass === 'syllabic_consonant') {
            syllabic_consonants.push(x);
        } else if (x && x.klass === 'diphthong') {
            diphthongs.push(x);
        } else {
            unknowns.push(x);
        }
    });
    return { 
        'consonants': new PhonemeMatrix(consonants, 'consonant').to_json(),
        'clicks': new PhonemeMatrix(clicks, 'click').to_json(),
        'syllabic_consonants': new PhonemeArray(syllabic_consonants).to_json(),
        'vowels': new PhonemeMatrix(vowels, 'vowel').to_json(),
        'diphthongs': new PhonemeMatrix(diphthongs, 'vowel').to_json(),
        'tones': new PhonemeArray(tones).to_json(),
        'unknowns': new PhonemeArray(unknowns).to_json()
    }
}

// ------------------------------------
// -- PhonemeMatrix and PhonemeArray --
// ------------------------------------

function get_name(x) { return x.name };

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
            this.map.get(y).set(x, []); 
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

// We want tones to also have a to_html, so we'll make a one-dimensional array too.
function PhonemeArray (phonemes) {
    this.phonemes = phonemes;
}
PhonemeArray.prototype.to_json = function () {
    return {'size': this.phonemes.length, 'contents': this.phonemes.map(i => i.phoneme).sort(lexicographic_order)}
}
PhonemeArray.prototype.size = function () {
    return this.phonemes.length;
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