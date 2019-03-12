var features = [];

// Note 'lateralis' instead of 'lateral' - 'lateral' is reserved in Postgres.

features.unknown = {
    meta: {
        name: 'undefined', // eh, why not
        order: 99999
    }, features: [{'syllabic': 'you should never see this'}]
}

features.place_and_secondary_articulation = [
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
            ,   'back':        '+' 
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        }]
    }, {
        meta: {
            name: 'rounded alveolar',
            order: 12
        }, features: [{
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '-'
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        ,   'back':        '+'
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
        }, { // ...except for tɕʷ! what in tarnation?!
            'labial':      '+'
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
        ,   'dorsal':      '+'
        ,   'front':       '+'
        ,   'back':        '-'
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
        ,   'back':        '+'
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
        }, { // ɥ
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
            'labial':      '-' // all velars except ɰ
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '-'
        }, { 
            'labial':      '-' // ɰ
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
            'labial':      '+' // w
        ,   'round':       '+'
        ,   'coronal':     '-'
        ,   'dorsal':      '+'
        ,   'high':        '+'
        ,   'low':         '-'
        ,   'front':       '-'
        ,   'back':        '+'
        }, {
            'labial':      '+' // w˞ 
        ,   'round':       '+'
        ,   'coronal':     '+'
        ,   'anterior':    '+'
        ,   'distributed': '+'
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

features.manner = [ // TODO: any more prenasalized consonants need fixed?
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
        }, { // n̤d̤ɮ̤
            'consonantal':     '+'
        ,   'sonorant':        '+,-'
        ,   'continuant':      '-'
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+,-'
        ,   'lateralis':         '+'
        }, { // dl
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
        ,   'lateralis':         '-'
        }, { // Prenasalized stops
            'consonantal':     '+'
        ,   'sonorant':        '+,-'
        ,   'continuant':      '-'
        ,   'delayed_release': '-'
        ,   'approximant':     '-'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '+,-'
        ,   'lateralis':         '-'
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
            'consonantal':     '+'
        ,   'sonorant':        '-'
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
            'consonantal':     '+' // r\`
        ,   'sonorant':        '+'
        ,   'continuant':      '+'
        ,   'approximant':     '+'
        ,   'tap':             '-'
        ,   'trill':           '-'
        ,   'nasal':           '-'
        ,   'lateralis':         '-'
        }, {
            'consonantal':     '-'
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
        ,   'delayed_release': '+'
        ,   'approximant':     '-'
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
        ,   string: 'ŋ̥'
        }, features: []
    }, {
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
    }, 
];

// These were all automatically generated, so there are no names for now. (TODO?)
// The diacritic   (COMBINING X BELOW), which marks frication, has been removed.
// No PHOIBLE doculect contrasts fricated and non-fricated clicks at the same POA.
features.click_efflux = [ 
    {
        meta: {
            name: ''
        ,   order: 1
        ,   string: ""
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 2
        ,   string: "ʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 4
        ,   string: "̠"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 5
        ,   string: "ʼ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 6
        ,   string: "ˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 7
        ,   string: "ʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 8
        ,   string: "x"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 9
        ,   string: "̠ʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 10
        ,   string: "̠ˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 11
        ,   string: "ˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 12
        ,   string: "xʼ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 13
        ,   string: "xˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 14
        ,   string: "ˠˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 15
        ,   string: "x"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 16
        ,   string: "ˡ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 17
        ,   string: "xˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 18
        ,   string: "ˡʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 19
        ,   string: "ˡx"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 20
        ,   string: "ˡxˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 21
        ,   string: "ˡˀ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 22
        ,   string: "xʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 23
        ,   string: "ˠʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 24
        ,   string: "̠xʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 25
        ,   string: "xʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 26
        ,   string: "̪"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 27
        ,   string: "ʷ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 28
        ,   string: "ʰʷ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 29
        ,   string: "qʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 30
        ,   string: "kxʼ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 31
        ,   string: "ʼʰ"
        }, features: {}
    }, {
        meta: {
            name: ''
        ,   order: 32
        ,   string: "ʰʼ"
        }, features: {}
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
        }]
    }, {
        meta: {name: 'mid', order: 2}, features: [{
            'high':  '-'
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