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

