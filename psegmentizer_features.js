var features = [];

// Note 'lateralis' instead of 'lateral' - 'lateral' is reserved in Postgres.

features.unknown = {
    name: 'undefined', // eh, why not
    order: 99999
}

features.place = [
    {
        meta: {
            name: 'labial',
            order: 0
        }, features: [{
            'labial':      '+'
        ,   'round':       '-'
        ,   'labiodental': '-'
        ,   'coronal':     '-'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'palatalized labial',
            order: 1
        }, features: [{
            'labial':      '+'
        ,   'round':       '-'
        ,   'labiodental': '-'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0 
        }]
    }, {
        meta: {
            name: 'rounded labial',
            order: 2
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'labiodental': '-'
        ,   'coronal':     '-'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rhotacized labial',
            order: 2.5
        }, features: [{
            'labial':      '+'
        ,   'round':       '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        }]
    }, {
        meta: {
            name: 'labiodental',
            order: 3
        }, features: [{
            'round':       '-'
        ,   'labiodental': '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'palatalized labiodental',
            order: 3.5
        }, features: [{
            'round':       '-'
        ,   'labiodental': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'rounded labiodental',
            order: 4
        }, features: [{
            'round':       '+'
        ,   'labiodental': '+'
        }]
    }, {
        meta: {
            name: 'dental',
            order: 5
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rounded dental',
            order: 8
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '-'    
        }]
    }, {
        meta: {
            name: 'palatalized dental',
            order: 6
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'velarized dental',
            order: 7
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '-'
        ,   'back':        '-'
        }]
    }, {
        meta: {
            name: 'alveolar',
            order: 9
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
        ,   'dorsal':      '-'
        }, { // fixes 11 segments
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': null
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rounded alveolar', // changed in 2.0? don't check for 'distributed'. or 'labial', because tɬʷʰ
            order: 12
        }, features: [{
            'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'palatalized alveolar',
            order: 10
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'rounded palatalized alveolar',
            order: 12.5
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'velarized alveolar',
            order: 10
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
        ,   'dorsal':      '+'
        ,   'front':       '-'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'retroflex',
            order: 14
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '-'
        ,   'dorsal':      '-'
        }, { // fronted retroflexes? e.g. ɳ̟
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    null
        ,   'distributed': '-'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rounded retroflex',
            order: 16
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '-'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'palatalized retroflex',
            order: 15
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '-'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }] // no velarized or labiopalatalized retroflexes in PHOIBLE?
    }, {
        meta: {
            name: 'alveolopalatal',
            order: 17
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rounded alveolopalatal',
            order: 20
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'palatalized alveolopalatal',
            order: 18
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    },  {
        meta: {
            name: 'velarized alveolopalatal',
            order: 19
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '-'
        ,   'back':        '-'
        }]
    },  {
        meta: {
            name: 'palatoalveolar',
            order: 21
        }, features: [{ // only diff btwn these and palatalized dentals is these are -back. yeah, sure.
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-'
        }]
    },  {
        meta: {
            name: 'rounded palatoalveolar',
            order: 24
        }, features: [{ // and rounding makes palatoalveolars stop being +dorsal...
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '-'
        }]
    }, {
        meta: {
            name: 'rounded palatalized palatoalveolar',
            order: 22,
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-' // changed in 2.0
        }]
    }, {
        meta: {
            name: 'palatal',
            order: 25
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '-'
        }, { // These used to be "prevelars". /j/ and some bizarre SPA segments.
             // k̟ʰ k̟ ŋɡ̟ appear in five languages: Ket, Hakka, Irish Gaelic, French, and Lithuanian.
             // In Ket, Hakka, and French, these should be velars. In Irish and Lithuanian, palatals.
             // French will display as having no velars but /N/, but that's on them, not me.
             // There's also EWONDO (UPSID) i͓ if you search under +consonantal, 
             // but that's a fricated vowel, I think.
             //
             // That's about 1.0. Now it's 48 segments! What changed? TODO
            'labial':      '-' 
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '-'
        }]
    }, {
        meta: {
            name: 'rounded palatal',
            order: 26
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '-'
        }, { //  21 segments
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '-'
        }]
    }, { // The IPA made some very good decisions and now I have to put up with this.
        meta: {
            name: 'sje',
            order: 28
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '+'
        ,   'anterior':    '-'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '+'
        }]
    }, {
        meta: {
            name: 'palatalized velar',
            order: 28.5,
        }, features: [{
            'labial':      '-'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '+'
        }]
    }, {
        meta: {
            name: 'rounded palatalized velar',
            order: 28.7
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '+'
        ,   'back':        '+'
        }]
    }, {
        meta: {
            name: 'velar',
            order: 29
        }, features: [{
            'labial':      '-' 
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '-'
        }, { 
            'labial':      '-' // ɰ and 3 other segments
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '+'
        }]
    }, {
        meta: {
            name: 'rounded velar',
            order: 32
        }, features: [{
            'labial':      '+' // most rounded velars
        ,   'round':       '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '-'
        }, { 
            'labial':      '+' // 23 segments
        ,   'round':       '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '+'
        }]
    }, {
        meta: {
            name: 'labial-alveolar',
            order: 9.1
        }, features: [{
            'labial':      '+'
        ,   'round':       '-'
        ,   'labiodental': '-'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
        ,   'dorsal':      '+'
        }]
    }, { // labial-uvulars are AFAIK completely unattested
        meta: {
            name: 'labial-velar',
            order: 35
        }, features: [{
            'labial':      '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'round':       '-'
        }]
    }, {
        meta: {
            name: 'palatalized labial-velar',
            order: 35.5
        }, features: [{
            'labial': 'mu' // fake feature - we use string processing
        }]
    }, {
        meta: {
            name: 'rounded labial-velar',
            order: 35.7
        }, features: [{
            'labial': 'mu' // fake feature
        }]
    }, {
        meta: {
            name: 'uvular',
            order: 36
        }, features: [{
            'labial':      '-'
        ,   'dorsal':      '+'
        ,   'high':        '-'
        ,   'low':         '-'
        }]
    }, {
        meta: {
            name: 'rounded uvular',
            order: 37
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'dorsal':      '+'
        ,   'high':        '-'
        ,   'low':         '-'
        }]
    }, {
        meta: {
            name: 'pharyngeal',
            order: 38
        }, features: [{
            'labial':      '-'
        ,   'dorsal':      '+'
        ,   'high':        '-'
        ,   'low':         '+'
        }]
    }, {
        meta: {
            name: 'rounded pharyngeal',
            order: 39
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'dorsal':      '+'
        ,   'high':        '-'
        ,   'low':         '+'
        }]
    }, {
        meta: {
            name: 'epiglottal',
            order: 39.5
        }, features: [{
            'epilaryngeal_source': '+'
        }]
    }, {
        meta: {
            name: 'glottal',
            order: 40,
        }, features: [{ // No features - we get this with string processing, for reasons I forget.
            'round': 'mu' // But we need a fake one.
        }]
    }
],

features.pharyngeal_configuration = [
    {
        meta: {
            name: 'plain',
            order: 0
        }, features: [{
            'advanced_tongue_root': '-', 
            'retracted_tongue_root': '-'
        }, {
            'advanced_tongue_root': null, // changed in 2.0
            'retracted_tongue_root': null
        }]      
    }, {
        meta: {
            name: 'pharyngealized',
            order: 1
        }, features: [{
            'advanced_tongue_root': '-', 
            'retracted_tongue_root': '+'
        }]
    }, {
        meta: {
            name: 'ATR',
            order: 2
        }, features: [{
            'advanced_tongue_root': '+',
            'retracted_tongue_root': '-'
        }]
    }
];

features.manner = [
    { // need to move this up here for dl
        meta: {
            name: 'lateralis affricate',
            order: 2.5
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '-'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '+'
        }, { // dl - TODO: move this out, we're not special-casing stuff anymore
            'consonantal':     '+'
        ,   'sonorant':        '-,+'
        ,   'continuant':      '-,+'
        ,   'delayed_release': '-'
        ,   'approximant':     '-,+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-,+'
        }]
    }, {
        meta: {
            name: 'plosive',
            order: 0
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '-'
        ,   'delayed_release': '-'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':       '-'
        }, { // Prenasalized stops
            'consonantal':     '+'
        ,   'sonorant':        '+,-'
        ,   'continuant':      '-'
        ,   'delayed_release': '-'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+,-'
        ,   'lateralis':       '-'
        }]
    }, {
        meta: {
            name: 'nasalized plosive',
            order: 1
        }, features: [{ // PHOIBLE is wrong. These aren't nasalized. They nasalize following V.
            'consonantal':     '+' // Except for the nasalized clicks, which are nasalized.
        ,   'sonorant':        '-' 
        ,   'continuant':      '-'
        ,   'delayed_release': '-'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'affricate',
            order: 2
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '-'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }, { // prenasalized affricates
            'consonantal':     '+'
        ,   'sonorant':        '+,-'
        ,   'continuant':      '-'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+,-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasalized affricate',
            order: 3
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '-'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'fricative',
            order: 4
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }, { // prenasalized fricatives
            'consonantal':     '+'
        ,   'sonorant':        '+,-'
        ,   'continuant':      '-,+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasalized fricative',
            order: 5
        }, features: [{
            'sonorant':        '-'
        ,   'continuant':      '+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasal',
            order: 6
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '-'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'resonant',
            order: 7
        }, features: [{
            'consonantal':     '-'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }, {
            'consonantal':     '+' // 8 segments, including r\``
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }, {
            'consonantal':     '-' // 22 segments
        ,   'sonorant':        '-'
        ,   'continuant':      '+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasalized resonant',
            order: 8
        }, features: [{
            'consonantal':     '-'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'tap',
            order: 9
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '+'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasalized tap',
            order: 10
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '+'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: { 
            name: 'fricated tap',
            order: 11,
        }, features: [{ // ɾ͓
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '+'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'trill',
            order: 12
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '+'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'nasalized trill',
            order: 13
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '+'
        ,   'nasal':           '+'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: { 
            name: 'fricated trill',
            order: 14,
        }, features: [{ // r͓̪ - what? looks like this is UPSID =rF
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '+'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }]
    }, {
        meta: {
            name: 'lateralis resonant',
            order: 7.5
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '+'
        }]
    }, {
        meta: {
            name: 'nasalized lateralis resonant',
            order: 7.7
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+'
        ,   'lateralis':         '+'
        }]
    }, {
        meta: {
            name: 'lateralis fricative',
            order: 4.5
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '-'
        ,   'continuant':      '+'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '+'
        }]
    }, {
        meta: {
            name: 'lateralis tap',
            order: 9.5
        }, features: [{
            'consonantal':     '+'
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '+'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '+'
        }]
    }
];

features.voicing = [
    {
        meta: {
            name: 'breathy-voiced',
            order: 2
        }, features: [{
        'periodic_glottal_source': '+'
    ,   'spread_glottis':          '+'
        }]
    }, {
        meta: {
            name: 'voiced',
            order: 3
        }, features: [{
            'periodic_glottal_source': '+'
        ,   'spread_glottis':          '-'
        }]
    }, {
        meta: {
            name: 'aspirated',
            order: 0
        }, features: [{
            'periodic_glottal_source': '-'
        ,   'spread_glottis':          '+'
        }]
    }, {
        meta: {
            name: 'unvoiced',
            order: 1
        }, features: [{
            'periodic_glottal_source': '-'
        ,   'spread_glottis':          '-'
        }]
    }
];

features.airstream_mechanism = [
    {
        meta: {
            name: 'ejective',
            order: 2
        }, features: [{
            'ejective': '+'
        }]
    }, {
        meta: {
            name: 'implosive',
            order: 3
        }, features: [{
            'implosive': '+'
        ,   'constricted_glottis': '-'
        }]
    }, {
        meta: {
            name: 'glottalized',
            order: 1
        }, features: [{
            'ejective': '-'
        ,   'implosive': '-'
        ,   'constricted_glottis': '+'
        }]
    }, {
        meta: {
            name: 'glottalized implosive',
            order: 4,
        }, features: [{ // these vary in their ejective feature but that distinction seems fake
        'implosive': '+'
    ,   'constricted_glottis': '+'
        }]
    }, {
        meta: {
            name: 'modal',
            order: 0
        }, features: [{
            'ejective': '-'
        ,   'implosive': '-'
        ,   'constricted_glottis': '-'
        }]
    }
]

features.duration = [
    {
        meta: {
            name: 'normal',
            order: 1
        }, features: [{
            'short': '-'
        ,   'long':  '-'
        }]
    }, {
        meta: {
            name: 'short',
            order: 0
        }, features: [{
            'short': '+'
        ,   'long':  '-'
        }]
    }, {
        meta: {
            name: 'half-long',
            order: 2
        }, features: [{
            'short': '+'
        ,   'long':  '+'
        }]
    }, {
        meta: {
            name: 'long',
            order: 3
        }, features: [{
            'short': '-'
        ,   'long':  '+'
        }]
    }
];

features.strength = [
    {
        meta: {
            name: 'normal',
            order: 0
        }, features: [{
            'fortis': '-'
        }, {
            'fortis': null // changed in 2.0
        }]
    }, {
        meta: {
            name: 'fortis',
            order: 1
        }, features: [{
            'fortis': '+'
        }]
    }
]

// ------------
// -- Clicks --
// ------------

// This doesn't use features - PHOIBLE's featural decomposition of clicks is Not Good.
// So it's all string processing. Check psegmentizer.js.
features.click_precomponent = [
    {
        meta: {
            name: 'unvoiced'
        ,   order: 1
        ,   string: 'k'
        }, features: []
    }, {
        meta: {
            name: 'nasal'
        ,   order: 2
        ,   string: 'ŋ'
        }, features: []
    }, {
        meta: {
            name: 'voiced'
        ,   order: 3
        ,   string: 'ɡ'
        }, features: []
    }, {
        meta: {
            name: 'voiceless nasal'
        ,   order: 4
        ,   string: 'ŋ̊'
        }, features: []
    }, {
        meta: {
            name: 'voiceless nasal 2' // sigh. changed in 2.0. TODO should just normalize these.
        ,   order: 4.5
        ,   string: 'ŋ̥'
        }, features: []
    },{
        meta: {
            name: 'breathy-voiced'
        ,   order: 5
        ,   string: 'ɡ̤'
        }, features: []
    }, {
        meta: {
            name: 'breathy-voiced nasal'
        ,   order: 6
        ,   string: 'ŋ̤'
        }, features: []
    }, {
        meta: {
            name: 'creaky-voiced'
        ,   order: 7
        ,   string: 'ɡ̰'
        }, features: []
    }, {
        meta: {
            name: 'prenasalized'
        ,   order: 8
        ,   string: 'ŋ̤ɡ'
        }, features: []
    }, {
        meta: {
            name: 'voiced uvular'
        ,   order: 10
        ,   string: 'ɢ'
        }, features: []
    }, {
        meta: {
            name: 'unvoiced uvular'
        ,   order: 9
        ,   string: 'q'
        }, features: []
    }, {
        meta: {
            name: 'prenasalized uvular'
        ,   order: 11
        ,   string: 'ɴɢ'
        }, features: []
    }, {
        meta: {
            name: 'glottalized nasal' // or creaky-voiced?
        ,   order: 8.5
        ,   string: 'ʼŋ'
        }, features: []
    }, {
        meta: {
            name: 'glottalized nasal 2' // new in 2.0. should also be normalized. TODO
        ,   order: 8.6
        ,   string: 'ʔŋ'
        }, features: []
    } 
];

// These were all automatically generated.
// The diacritic   (COMBINING X BELOW), which marks frication, has been removed.
// No PHOIBLE doculect contrasts fricated and non-fricated clicks at the same POA.
features.click_efflux = [ 
    {
        meta: {
            name: ''
        ,   order: 1
        ,   string: ""
        }, features: []
    }, {
        meta: {
            name: 'aspirated'
        ,   order: 2
        ,   string: "ʰ"
        }, features: []
    }, {
        meta: {
            name: 'aspirated 2' // sigh, TODO
        ,   order: 2.5
        ,   string: "h"
        }, features: []
    }, {
        meta: {
            name: 'breathy-voiced'
        ,   order: 2.7
        ,   string: 'ʱ'
        }, features: []
    }, {
        meta: {
            name: 'retracted'
        ,   order: 3
        ,   string: "̠"
        }, features: []
    }, {
        meta: {
            name: 'ejective'
        ,   order: 4
        ,   string: "ʼ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized'
        ,   order: 5
        ,   string: "ˀ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized 2' // sigh, also TODO
        ,   order: 5.5
        ,   string: "ʔ"
        }
    }, {
        meta: {
            name: 'with velar fricative release'
        ,   order: 6
        ,   string: "x"
        }, features: []
    }, {
        meta: {
            name: 'retracted aspirated'
        ,   order: 7
        ,   string: "̠ʰ"
        }, features: []
    }, {
        meta: {
            name: 'retracted aspirated'
        ,   order: 8
        ,   string: "̠ˀ"
        }, features: []
    }, {
        meta: {
            name: 'ejective with velar fricative release'
        ,   order: 9
        ,   string: "xʼ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized with velar fricative release'
        ,   order: 10
        ,   string: "xˀ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized velarized'
        ,   order: 11
        ,   string: "ˠˀ"
        }, features: []
    }, {
        meta: {
            name: 'lateral'
        ,   order: 12
        ,   string: "ˡ"
        }, features: []
    }, {
        meta: {
            name: 'aspirated lateral'
        ,   order: 13
        ,   string: "ˡʰ"
        }, features: []
    }, {
        meta: {
            name: 'lateral with velar aspirate release'
        ,   order: 14
        ,   string: "ˡx"
        }, features: []
    }, {
        meta: {
            name: 'ejective lateral with velar aspirate release'
        ,   order: 15
        ,   string: "ˡxˀ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized lateral'
        ,   order: 16
        ,   string: "ˡˀ"
        }, features: []
    }, {
        meta: {
            name: 'aspirated with velar fricative release'
        ,   order: 17
        ,   string: "xʰ"
        }, features: []
    }, {
        meta: {
            name: 'velarized glottalized'
        ,   order: 18
        ,   string: "ˠʰ"
        }, features: []
    }, {
        meta: {
            name: 'retracted aspirated with velar fricative release'
        ,   order: 19
        ,   string: "̠xʰ"
        }, features: []
    }, {
        meta: {
            name: 'dental'
        ,   order: 20
        ,   string: "̪"
        }, features: []
    }, {
        meta: {
            name: 'rounded'
        ,   order: 21
        ,   string: "ʷ"
        }, features: []
    }, {
        meta: {
            name: 'rounded aspirated'
        ,   order: 22
        ,   string: "ʷʰ"
        }, features: []
    }, {
        meta: {
            name: 'with velar aspirate release'
        ,   order: 22.5
        ,   string: 'kʰ'
        }
    }, {
        meta: {
            name: 'aspirated with uvular plosive release'
        ,   order: 23
        ,   string: "qʰ"
        }, features: []
    }, {
        meta: {
            name: 'with velar ejective release'
        ,   order: 24
        ,   string: "kxʼ"
        }, features: []
    }, {
        meta: {
            name: 'glottalized aspirated' // wha?
        ,   order: 25
        ,   string: "ʼʰ"
        }, features: []
    }, {
        meta: {
            name: 'aspirated glottalized' // sigh
        ,   order: 26
        ,   string: "ʰʼ"
        }, features: []
    }
]

// ------------
// -- Vowels --
// ------------

features.height = [
    {
        meta: {name: 'high', order: 0}, features: [{
            'high':  '+'
        ,   'low':   '-'
        ,   'tense': '+'
        }]
    }, {
        meta: {name: 'high-mid', order: 1}, features: [{
            'high':  '+'
        ,   'low':   '-'
        ,   'tense': '-'
        }, { // 26 segments
            'high':  '+'
        ,   'low':   '-'
        ,   'tense': null
        }]
    }, {
        meta: {name: 'mid', order: 2}, features: [{
            'high':  '-'
        ,   'low':   '-'
        ,   'tense': '+'
        }, { // a *lot* of segments
            'high':  '-'
        ,   'low':   '-'
        ,   'tense': null 
        }, { // 3 segments - TODO delete this and special-case them
            'high':  null
        ,   'low':   '-'
        ,   'tense': '+'
        }]
    }, {
        meta: {name: 'low-mid', order: 3}, features: [{
            'high':  '-'
        ,   'low':   '-'
        ,   'tense': '-'
        }]
    }, {
        meta: {name: 'low', order: 4}, features: [{
            'high':  '-'
        ,   'low':   '+'
        }, { // 14 segments, but some of them this might not give great results for. TODO fix later
            'high':  '-'
        ,   'low':   null
        }]
    }
]

features.frontness = [
    {
        meta: {name: 'front', order: 0}, features: [{
            'front': '+'
        ,   'back':  '-'
        }]
    }, {
        meta: {name: 'central', order: 1}, features: [{
            'front': '-'
        ,   'back':  '-'
        }, { 
            'front': null // This and the next one are pretty common. Why? 
        ,   'back':  '-'
        }, {
            'front': '-'
        ,   'back':  null
        }]
    }, {
        meta: {name: 'back', order: 2}, features: [{
            'front': '-'
        ,   'back':  '+'
        }]
    }
]

features.roundness = [
    {
        meta: {name: 'unrounded', order: 0}, features: [{
            'labial': '-'
        }]
    }, {
        meta: {name: 'rounded', order: 1}, features: [{
            'labial': '+'
        ,   'round':  '+'
        }, { // rounded vowel + less rounded diacritic - I assume if they were *un*rounded they'd just use the unrounded letters
            'labial': '+'
        ,   'round':  null 
        }]
    }
]

features.nasality = [
    {
        meta: {name: 'oral', order: 0}, features: [{ 'nasal': '-' }]
    }, {
        meta: {name: 'nasal', order: 1}, features: [{ 'nasal': '+' }]
    }
]

module.exports = features;