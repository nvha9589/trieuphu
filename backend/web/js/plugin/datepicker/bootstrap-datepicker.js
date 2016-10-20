
//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
     Constants
     ************************************/

    var moment,
        VERSION = '2.9.0',
    // the global-scope this is NOT the global object in Node.js
        globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

    // internal storage for locale config files
        locales = {},

    // extra moment internal properties (plugins register props here)
        momentProperties = [],

    // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module && module.exports),

    // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

    // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,

    // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123

    //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

    // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

    // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

    // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

    // format function strings
        formatFunctions = {},

    // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

    // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = this.utcOffset(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            x    : function () {
                return this.valueOf();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],

        updateInProgress = false;

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
        // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // thie is not supposed to happen
            return hour;
        }
    }

    /************************************
     Constructors
     ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            moment.updateOffset(this);
            updateInProgress = false;
        }
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
        seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
        weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
        quarters * 3 +
        years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
     Helpers
     ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
        (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                    m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                        m._a[HOUR] < 0 || m._a[HOUR] > 24 ||
                        (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||
                        m._a[SECOND] !== 0 ||
                        m._a[MILLISECOND] !== 0)) ? HOUR :
                            m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                                    m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                                        -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
            m._pf.overflow < 0 &&
            !m._pf.empty &&
            !m._pf.invalidMonth &&
            !m._pf.nullInput &&
            !m._pf.invalidFormat &&
            !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                m._pf.charsLeftOver === 0 &&
                m._pf.unusedTokens.length === 0 &&
                m._pf.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/utcOffset equivalent to
    // model.
    function makeAs(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (moment.isMoment(input) || isDate(input) ?
                +input : +moment(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            moment.updateOffset(res, false);
            return res;
        } else {
            return moment(input).local();
        }
    }

    /************************************
     Locale
     ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName, format, strict) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = moment.utc([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LTS : 'h:mm:ss A',
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },


        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom, now) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom, [now]) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',
        _ordinalParse : /\d{1,2}/,

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        firstDayOfWeek : function () {
            return this._week.dow;
        },

        firstDayOfYear : function () {
            return this._week.doy;
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
     Formatting
     ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
     Parsing
     ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
            case 'Q':
                return parseTokenOneDigit;
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
            /* falls through */
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
            /* falls through */
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
            /* falls through */
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return config._locale._meridiemParse;
            case 'x':
                return parseTokenOffsetMs;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            case 'Do':
                return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;
            default :
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
                return a;
        }
    }

    function utcOffsetFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
            // QUARTER
            case 'Q':
                if (input != null) {
                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
                }
                break;
            // MONTH
            case 'M' : // fall through to MM
            case 'MM' :
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM' : // fall through to MMMM
            case 'MMMM' :
                a = config._locale.monthsParse(input, token, config._strict);
                // if we didn't find a month name, mark the date as invalid.
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            // DAY OF MONTH
            case 'D' : // fall through to DD
            case 'DD' :
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            case 'Do' :
                if (input != null) {
                    datePartArray[DATE] = toInt(parseInt(
                        input.match(/\d{1,2}/)[0], 10));
                }
                break;
            // DAY OF YEAR
            case 'DDD' : // fall through to DDDD
            case 'DDDD' :
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }

                break;
            // YEAR
            case 'YY' :
                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
                break;
            case 'YYYY' :
            case 'YYYYY' :
            case 'YYYYYY' :
                datePartArray[YEAR] = toInt(input);
                break;
            // AM / PM
            case 'a' : // fall through to A
            case 'A' :
                config._meridiem = input;
                // config._isPm = config._locale.isPM(input);
                break;
            // HOUR
            case 'h' : // fall through to hh
            case 'hh' :
                config._pf.bigHour = true;
            /* falls through */
            case 'H' : // fall through to HH
            case 'HH' :
                datePartArray[HOUR] = toInt(input);
                break;
            // MINUTE
            case 'm' : // fall through to mm
            case 'mm' :
                datePartArray[MINUTE] = toInt(input);
                break;
            // SECOND
            case 's' : // fall through to ss
            case 'ss' :
                datePartArray[SECOND] = toInt(input);
                break;
            // MILLISECOND
            case 'S' :
            case 'SS' :
            case 'SSS' :
            case 'SSSS' :
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            // UNIX OFFSET (MILLISECONDS)
            case 'x':
                config._d = new Date(toInt(input));
                break;
            // UNIX TIMESTAMP WITH MS
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            // TIMEZONE
            case 'Z' : // fall through to ZZ
            case 'ZZ' :
                config._useUTC = true;
                config._tzm = utcOffsetFromString(input);
                break;
            // WEEKDAY - human
            case 'dd':
            case 'ddd':
            case 'dddd':
                a = config._locale.weekdaysParse(input);
                // if we didn't get a weekday name, mark the date as invalid
                if (a != null) {
                    config._w = config._w || {};
                    config._w['d'] = a;
                } else {
                    config._pf.invalidWeekday = input;
                }
                break;
            // WEEK, WEEK DAY - numeric
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
            /* falls through */
            case 'gggg':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = toInt(input);
                }
                break;
            case 'gg':
            case 'GG':
                config._w = config._w || {};
                config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day || normalizedInput.date,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {
            config._pf.bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR],
            config._meridiem);
        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
     Relative Time
     ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
     Week of Year
     ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
     Top Level Functions
     ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f,
            res;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        res = new Moment(config);
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
        // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    moment.isDate = isDate;

    /************************************
     Moment Prototype
     ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d - ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                if ('function' === typeof Date.prototype.toISOString) {
                    // native implementation is ~50x faster, use it when we can
                    return this.toDate().toISOString();
                } else {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(this._dateUtcOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (that.utcOffset() - this.utcOffset()) * 6e4,
                anchor, diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month' || units === 'quarter') {
                output = monthDiff(this, that);
                if (units === 'quarter') {
                    output = output / 3;
                } else if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = this - that;
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                        units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                            units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                                units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're locat/utc/offset
            // or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                        diff < 0 ? 'lastDay' :
                            diff < 1 ? 'sameDay' :
                                diff < 2 ? 'nextDay' :
                                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this, moment(now)));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                /* falls through */
                case 'hour':
                    this.minutes(0);
                /* falls through */
                case 'minute':
                    this.seconds(0);
                /* falls through */
                case 'second':
                    this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return inputMs < +this.clone().startOf(units);
            }
        },

        isBefore: function (input, units) {
            var inputMs;
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                inputMs = moment.isMoment(input) ? +input : +moment(input);
                return +this.clone().endOf(units) < inputMs;
            }
        },

        isBetween: function (from, to, units) {
            return this.isAfter(from, units) && this.isBefore(to, units);
        },

        isSame: function (input, units) {
            var inputMs;
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                inputMs = +moment(input);
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
            }
        },

        min: deprecate(
            'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
            function (other) {
                other = moment.apply(null, arguments);
                return other < this ? this : other;
            }
        ),

        max: deprecate(
            'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
            function (other) {
                other = moment.apply(null, arguments);
                return other > this ? this : other;
            }
        ),

        zone : deprecate(
            'moment().zone is deprecated, use moment().utcOffset instead. ' +
            'https://github.com/moment/moment/issues/1779',
            function (input, keepLocalTime) {
                if (input != null) {
                    if (typeof input !== 'string') {
                        input = -input;
                    }

                    this.utcOffset(input, keepLocalTime);

                    return this;
                } else {
                    return -this.utcOffset();
                }
            }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        utcOffset : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = utcOffsetFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateUtcOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                            moment.duration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }

                return this;
            } else {
                return this._isUTC ? offset : this._dateUtcOffset();
            }
        },

        isLocal : function () {
            return !this._isUTC;
        },

        isUtcOffset : function () {
            return this._isUTC;
        },

        isUtc : function () {
            return this._isUTC && this._offset === 0;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.utcOffset(this._tzm);
            } else if (typeof this._i === 'string') {
                this.utcOffset(utcOffsetFromString(this._i));
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).utcOffset();
            }

            return (this.utcOffset() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            var unit;
            if (typeof units === 'object') {
                for (unit in units) {
                    this.set(unit, units[unit]);
                }
            }
            else {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateUtcOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }

    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
            daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    // alias isUtc for dev-friendliness
    moment.fn.isUTC = moment.fn.isUtc;

    /************************************
     Duration Prototype
     ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(yearsToDays(this._months / 12));
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        },

        toJSON : function () {
            return this.toISOString();
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
     Default Locale
     ************************************/


        // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // moment.js locale configuration
    // locale : afrikaans (af)
    // author : Werner Mollentze : https://github.com/wernerm

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('af', {
            months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
            weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
            weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
            weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
            meridiemParse: /vm|nm/i,
            isPM : function (input) {
                return /^nm$/i.test(input);
            },
            meridiem : function (hours, minutes, isLower) {
                if (hours < 12) {
                    return isLower ? 'vm' : 'VM';
                } else {
                    return isLower ? 'nm' : 'NM';
                }
            },
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Vandag om] LT',
                nextDay : '[MĂ´re om] LT',
                nextWeek : 'dddd [om] LT',
                lastDay : '[Gister om] LT',
                lastWeek : '[Laas] dddd [om] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'oor %s',
                past : '%s gelede',
                s : '\'n paar sekondes',
                m : '\'n minuut',
                mm : '%d minute',
                h : '\'n uur',
                hh : '%d ure',
                d : '\'n dag',
                dd : '%d dae',
                M : '\'n maand',
                MM : '%d maande',
                y : '\'n jaar',
                yy : '%d jaar'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal : function (number) {
                return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris RĂ¶ling : https://github.com/jjupiter
            },
            week : {
                dow : 1, // Maandag is die eerste dag van die week.
                doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Moroccan Arabic (ar-ma)
    // author : ElFadili Yassine : https://github.com/ElFadiliY
    // author : Abdel Said : https://github.com/abdelsaid

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ar-ma', {
            months : 'ÙÙ†Ø§ÙØ±_ÙØ¨Ø±Ø§ÙØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙÙ„_Ù…Ø§Ù_ÙÙˆÙ†ÙÙˆ_ÙÙˆÙ„ÙÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±'.split('_'),
            monthsShort : 'ÙÙ†Ø§ÙØ±_ÙØ¨Ø±Ø§ÙØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙÙ„_Ù…Ø§Ù_ÙÙˆÙ†ÙÙˆ_ÙÙˆÙ„ÙÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±'.split('_'),
            weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥ØªÙ†ÙÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
            weekdaysShort : 'Ø§Ø­Ø¯_Ø§ØªÙ†ÙÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
            weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Ø§Ù„ÙÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'ÙÙ %s',
                past : 'Ù…Ù†Ø° %s',
                s : 'Ø«ÙˆØ§Ù†',
                m : 'Ø¯Ù‚ÙÙ‚Ø©',
                mm : '%d Ø¯Ù‚Ø§Ø¦Ù‚',
                h : 'Ø³Ø§Ø¹Ø©',
                hh : '%d Ø³Ø§Ø¹Ø§Øª',
                d : 'ÙÙˆÙ…',
                dd : '%d Ø£ÙØ§Ù…',
                M : 'Ø´Ù‡Ø±',
                MM : '%d Ø£Ø´Ù‡Ø±',
                y : 'Ø³Ù†Ø©',
                yy : '%d Ø³Ù†ÙˆØ§Øª'
            },
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Arabic Saudi Arabia (ar-sa)
    // author : Suhail Alkowaileet : https://github.com/xsoh

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
            '1': 'Ù¡',
            '2': 'Ù¢',
            '3': 'Ù£',
            '4': 'Ù¤',
            '5': 'Ù¥',
            '6': 'Ù¦',
            '7': 'Ù§',
            '8': 'Ù¨',
            '9': 'Ù©',
            '0': 'Ù '
        }, numberMap = {
            'Ù¡': '1',
            'Ù¢': '2',
            'Ù£': '3',
            'Ù¤': '4',
            'Ù¥': '5',
            'Ù¦': '6',
            'Ù§': '7',
            'Ù¨': '8',
            'Ù©': '9',
            'Ù ': '0'
        };

        return moment.defineLocale('ar-sa', {
            months : 'ÙÙ†Ø§ÙØ±_ÙØ¨Ø±Ø§ÙØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙÙ„_Ù…Ø§ÙÙˆ_ÙÙˆÙ†ÙÙˆ_ÙÙˆÙ„ÙÙˆ_Ø£ØºØ³Ø·Ø³_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙØ³Ù…Ø¨Ø±'.split('_'),
            monthsShort : 'ÙÙ†Ø§ÙØ±_ÙØ¨Ø±Ø§ÙØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙÙ„_Ù…Ø§ÙÙˆ_ÙÙˆÙ†ÙÙˆ_ÙÙˆÙ„ÙÙˆ_Ø£ØºØ³Ø·Ø³_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙØ³Ù…Ø¨Ø±'.split('_'),
            weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
            weekdaysShort : 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
            weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'HH:mm:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            meridiemParse: /Øµ|Ù…/,
            isPM : function (input) {
                return 'Ù…' === input;
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 12) {
                    return 'Øµ';
                } else {
                    return 'Ù…';
                }
            },
            calendar : {
                sameDay: '[Ø§Ù„ÙÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'ÙÙ %s',
                past : 'Ù…Ù†Ø° %s',
                s : 'Ø«ÙˆØ§Ù†',
                m : 'Ø¯Ù‚ÙÙ‚Ø©',
                mm : '%d Ø¯Ù‚Ø§Ø¦Ù‚',
                h : 'Ø³Ø§Ø¹Ø©',
                hh : '%d Ø³Ø§Ø¹Ø§Øª',
                d : 'ÙÙˆÙ…',
                dd : '%d Ø£ÙØ§Ù…',
                M : 'Ø´Ù‡Ø±',
                MM : '%d Ø£Ø´Ù‡Ø±',
                y : 'Ø³Ù†Ø©',
                yy : '%d Ø³Ù†ÙˆØ§Øª'
            },
            preparse: function (string) {
                return string.replace(/[Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ]/g, function (match) {
                    return numberMap[match];
                }).replace(/ØŒ/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                }).replace(/,/g, 'ØŒ');
            },
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale  : Tunisian Arabic (ar-tn)

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ar-tn', {
            months: 'Ø¬Ø§Ù†ÙÙ_ÙÙÙØ±Ù_Ù…Ø§Ø±Ø³_Ø£ÙØ±ÙÙ„_Ù…Ø§Ù_Ø¬ÙˆØ§Ù†_Ø¬ÙˆÙÙ„ÙØ©_Ø£ÙˆØª_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙØ³Ù…Ø¨Ø±'.split('_'),
            monthsShort: 'Ø¬Ø§Ù†ÙÙ_ÙÙÙØ±Ù_Ù…Ø§Ø±Ø³_Ø£ÙØ±ÙÙ„_Ù…Ø§Ù_Ø¬ÙˆØ§Ù†_Ø¬ÙˆÙÙ„ÙØ©_Ø£ÙˆØª_Ø³Ø¨ØªÙ…Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙÙ…Ø¨Ø±_Ø¯ÙØ³Ù…Ø¨Ø±'.split('_'),
            weekdays: 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
            weekdaysShort: 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
            weekdaysMin: 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'LT:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY LT',
                LLLL: 'dddd D MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[Ø§Ù„ÙÙˆÙ… Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextDay: '[ØºØ¯Ø§ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastDay: '[Ø£Ù…Ø³ Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastWeek: 'dddd [Ø¹Ù„Ù‰ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'ÙÙ %s',
                past: 'Ù…Ù†Ø° %s',
                s: 'Ø«ÙˆØ§Ù†',
                m: 'Ø¯Ù‚ÙÙ‚Ø©',
                mm: '%d Ø¯Ù‚Ø§Ø¦Ù‚',
                h: 'Ø³Ø§Ø¹Ø©',
                hh: '%d Ø³Ø§Ø¹Ø§Øª',
                d: 'ÙÙˆÙ…',
                dd: '%d Ø£ÙØ§Ù…',
                M: 'Ø´Ù‡Ø±',
                MM: '%d Ø£Ø´Ù‡Ø±',
                y: 'Ø³Ù†Ø©',
                yy: '%d Ø³Ù†ÙˆØ§Øª'
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4 // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // Locale: Arabic (ar)
    // Author: Abdel Said: https://github.com/abdelsaid
    // Changes in months, weekdays: Ahmed Elkhatib
    // Native plural forms: forabi https://github.com/forabi

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
            '1': 'Ù¡',
            '2': 'Ù¢',
            '3': 'Ù£',
            '4': 'Ù¤',
            '5': 'Ù¥',
            '6': 'Ù¦',
            '7': 'Ù§',
            '8': 'Ù¨',
            '9': 'Ù©',
            '0': 'Ù '
        }, numberMap = {
            'Ù¡': '1',
            'Ù¢': '2',
            'Ù£': '3',
            'Ù¤': '4',
            'Ù¥': '5',
            'Ù¦': '6',
            'Ù§': '7',
            'Ù¨': '8',
            'Ù©': '9',
            'Ù ': '0'
        }, pluralForm = function (n) {
            return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
        }, plurals = {
            s : ['Ø£Ù‚Ù„ Ù…Ù† Ø«Ø§Ù†ÙØ©', 'Ø«Ø§Ù†ÙØ© ÙˆØ§Ø­Ø¯Ø©', ['Ø«Ø§Ù†ÙØªØ§Ù†', 'Ø«Ø§Ù†ÙØªÙÙ†'], '%d Ø«ÙˆØ§Ù†', '%d Ø«Ø§Ù†ÙØ©', '%d Ø«Ø§Ù†ÙØ©'],
            m : ['Ø£Ù‚Ù„ Ù…Ù† Ø¯Ù‚ÙÙ‚Ø©', 'Ø¯Ù‚ÙÙ‚Ø© ÙˆØ§Ø­Ø¯Ø©', ['Ø¯Ù‚ÙÙ‚ØªØ§Ù†', 'Ø¯Ù‚ÙÙ‚ØªÙÙ†'], '%d Ø¯Ù‚Ø§Ø¦Ù‚', '%d Ø¯Ù‚ÙÙ‚Ø©', '%d Ø¯Ù‚ÙÙ‚Ø©'],
            h : ['Ø£Ù‚Ù„ Ù…Ù† Ø³Ø§Ø¹Ø©', 'Ø³Ø§Ø¹Ø© ÙˆØ§Ø­Ø¯Ø©', ['Ø³Ø§Ø¹ØªØ§Ù†', 'Ø³Ø§Ø¹ØªÙÙ†'], '%d Ø³Ø§Ø¹Ø§Øª', '%d Ø³Ø§Ø¹Ø©', '%d Ø³Ø§Ø¹Ø©'],
            d : ['Ø£Ù‚Ù„ Ù…Ù† ÙÙˆÙ…', 'ÙÙˆÙ… ÙˆØ§Ø­Ø¯', ['ÙÙˆÙ…Ø§Ù†', 'ÙÙˆÙ…ÙÙ†'], '%d Ø£ÙØ§Ù…', '%d ÙÙˆÙ…Ù‹Ø§', '%d ÙÙˆÙ…'],
            M : ['Ø£Ù‚Ù„ Ù…Ù† Ø´Ù‡Ø±', 'Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯', ['Ø´Ù‡Ø±Ø§Ù†', 'Ø´Ù‡Ø±ÙÙ†'], '%d Ø£Ø´Ù‡Ø±', '%d Ø´Ù‡Ø±Ø§', '%d Ø´Ù‡Ø±'],
            y : ['Ø£Ù‚Ù„ Ù…Ù† Ø¹Ø§Ù…', 'Ø¹Ø§Ù… ÙˆØ§Ø­Ø¯', ['Ø¹Ø§Ù…Ø§Ù†', 'Ø¹Ø§Ù…ÙÙ†'], '%d Ø£Ø¹ÙˆØ§Ù…', '%d Ø¹Ø§Ù…Ù‹Ø§', '%d Ø¹Ø§Ù…']
        }, pluralize = function (u) {
            return function (number, withoutSuffix, string, isFuture) {
                var f = pluralForm(number),
                    str = plurals[u][pluralForm(number)];
                if (f === 2) {
                    str = str[withoutSuffix ? 0 : 1];
                }
                return str.replace(/%d/i, number);
            };
        }, months = [
            'ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†Ù ÙÙ†Ø§ÙØ±',
            'Ø´Ø¨Ø§Ø· ÙØ¨Ø±Ø§ÙØ±',
            'Ø¢Ø°Ø§Ø± Ù…Ø§Ø±Ø³',
            'Ù†ÙØ³Ø§Ù† Ø£Ø¨Ø±ÙÙ„',
            'Ø£ÙØ§Ø± Ù…Ø§ÙÙˆ',
            'Ø­Ø²ÙØ±Ø§Ù† ÙÙˆÙ†ÙÙˆ',
            'ØªÙ…ÙˆØ² ÙÙˆÙ„ÙÙˆ',
            'Ø¢Ø¨ Ø£ØºØ³Ø·Ø³',
            'Ø£ÙÙ„ÙˆÙ„ Ø³Ø¨ØªÙ…Ø¨Ø±',
            'ØªØ´Ø±ÙÙ† Ø§Ù„Ø£ÙˆÙ„ Ø£ÙƒØªÙˆØ¨Ø±',
            'ØªØ´Ø±ÙÙ† Ø§Ù„Ø«Ø§Ù†Ù Ù†ÙˆÙÙ…Ø¨Ø±',
            'ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„ Ø¯ÙØ³Ù…Ø¨Ø±'
        ];

        return moment.defineLocale('ar', {
            months : months,
            monthsShort : months,
            weekdays : 'Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª'.split('_'),
            weekdaysShort : 'Ø£Ø­Ø¯_Ø¥Ø«Ù†ÙÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª'.split('_'),
            weekdaysMin : 'Ø­_Ù†_Ø«_Ø±_Ø®_Ø¬_Ø³'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'HH:mm:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            meridiemParse: /Øµ|Ù…/,
            isPM : function (input) {
                return 'Ù…' === input;
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 12) {
                    return 'Øµ';
                } else {
                    return 'Ù…';
                }
            },
            calendar : {
                sameDay: '[Ø§Ù„ÙÙˆÙ… Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextDay: '[ØºØ¯Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                nextWeek: 'dddd [Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastDay: '[Ø£Ù…Ø³ Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                lastWeek: 'dddd [Ø¹Ù†Ø¯ Ø§Ù„Ø³Ø§Ø¹Ø©] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'Ø¨Ø¹Ø¯ %s',
                past : 'Ù…Ù†Ø° %s',
                s : pluralize('s'),
                m : pluralize('m'),
                mm : pluralize('m'),
                h : pluralize('h'),
                hh : pluralize('h'),
                d : pluralize('d'),
                dd : pluralize('d'),
                M : pluralize('M'),
                MM : pluralize('M'),
                y : pluralize('y'),
                yy : pluralize('y')
            },
            preparse: function (string) {
                return string.replace(/[Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©Ù ]/g, function (match) {
                    return numberMap[match];
                }).replace(/ØŒ/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                }).replace(/,/g, 'ØŒ');
            },
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : azerbaijani (az)
    // author : topchiyev : https://github.com/topchiyev

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var suffixes = {
            1: '-inci',
            5: '-inci',
            8: '-inci',
            70: '-inci',
            80: '-inci',

            2: '-nci',
            7: '-nci',
            20: '-nci',
            50: '-nci',

            3: '-Ă¼ncĂ¼',
            4: '-Ă¼ncĂ¼',
            100: '-Ă¼ncĂ¼',

            6: '-ncÄ±',

            9: '-uncu',
            10: '-uncu',
            30: '-uncu',

            60: '-Ä±ncÄ±',
            90: '-Ä±ncÄ±'
        };
        return moment.defineLocale('az', {
            months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
            monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
            weekdays : 'Bazar_Bazar ertÉ™si_Ă‡É™rÅŸÉ™nbÉ™ axÅŸamÄ±_Ă‡É™rÅŸÉ™nbÉ™_CĂ¼mÉ™ axÅŸamÄ±_CĂ¼mÉ™_ÅÉ™nbÉ™'.split('_'),
            weekdaysShort : 'Baz_BzE_Ă‡Ax_Ă‡É™r_CAx_CĂ¼m_ÅÉ™n'.split('_'),
            weekdaysMin : 'Bz_BE_Ă‡A_Ă‡É™_CA_CĂ¼_ÅÉ™'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[bugĂ¼n saat] LT',
                nextDay : '[sabah saat] LT',
                nextWeek : '[gÉ™lÉ™n hÉ™ftÉ™] dddd [saat] LT',
                lastDay : '[dĂ¼nÉ™n] LT',
                lastWeek : '[keĂ§É™n hÉ™ftÉ™] dddd [saat] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s sonra',
                past : '%s É™vvÉ™l',
                s : 'birneĂ§É™ saniyyÉ™',
                m : 'bir dÉ™qiqÉ™',
                mm : '%d dÉ™qiqÉ™',
                h : 'bir saat',
                hh : '%d saat',
                d : 'bir gĂ¼n',
                dd : '%d gĂ¼n',
                M : 'bir ay',
                MM : '%d ay',
                y : 'bir il',
                yy : '%d il'
            },
            meridiemParse: /gecÉ™|sÉ™hÉ™r|gĂ¼ndĂ¼z|axÅŸam/,
            isPM : function (input) {
                return /^(gĂ¼ndĂ¼z|axÅŸam)$/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'gecÉ™';
                } else if (hour < 12) {
                    return 'sÉ™hÉ™r';
                } else if (hour < 17) {
                    return 'gĂ¼ndĂ¼z';
                } else {
                    return 'axÅŸam';
                }
            },
            ordinalParse: /\d{1,2}-(Ä±ncÄ±|inci|nci|Ă¼ncĂ¼|ncÄ±|uncu)/,
            ordinal : function (number) {
                if (number === 0) {  // special case for zero
                    return number + '-Ä±ncÄ±';
                }
                var a = number % 10,
                    b = number % 100 - a,
                    c = number >= 100 ? 100 : null;

                return number + (suffixes[a] || suffixes[b] || suffixes[c]);
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : belarusian (be)
    // author : Dmitry Demidov : https://github.com/demidov91
    // author: Praleska: http://praleska.pro/
    // Author : Menelion ElensĂºle : https://github.com/Oire

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function plural(word, num) {
            var forms = word.split('_');
            return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
        }

        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                'mm': withoutSuffix ? 'Ñ…Đ²Ñ–Đ»Ñ–Đ½Đ°_Ñ…Đ²Ñ–Đ»Ñ–Đ½Ñ‹_Ñ…Đ²Ñ–Đ»Ñ–Đ½' : 'Ñ…Đ²Ñ–Đ»Ñ–Đ½Ñƒ_Ñ…Đ²Ñ–Đ»Ñ–Đ½Ñ‹_Ñ…Đ²Ñ–Đ»Ñ–Đ½',
                'hh': withoutSuffix ? 'Đ³Đ°Đ´Đ·Ñ–Đ½Đ°_Đ³Đ°Đ´Đ·Ñ–Đ½Ñ‹_Đ³Đ°Đ´Đ·Ñ–Đ½' : 'Đ³Đ°Đ´Đ·Ñ–Đ½Ñƒ_Đ³Đ°Đ´Đ·Ñ–Đ½Ñ‹_Đ³Đ°Đ´Đ·Ñ–Đ½',
                'dd': 'Đ´Đ·ĐµĐ½ÑŒ_Đ´Đ½Ñ–_Đ´Đ·Ñ‘Đ½',
                'MM': 'Đ¼ĐµÑÑÑ†_Đ¼ĐµÑÑÑ†Ñ‹_Đ¼ĐµÑÑÑ†Đ°Ñ',
                'yy': 'Đ³Đ¾Đ´_Đ³Đ°Đ´Ñ‹_Đ³Đ°Đ´Đ¾Ñ'
            };
            if (key === 'm') {
                return withoutSuffix ? 'Ñ…Đ²Ñ–Đ»Ñ–Đ½Đ°' : 'Ñ…Đ²Ñ–Đ»Ñ–Đ½Ñƒ';
            }
            else if (key === 'h') {
                return withoutSuffix ? 'Đ³Đ°Đ´Đ·Ñ–Đ½Đ°' : 'Đ³Đ°Đ´Đ·Ñ–Đ½Ñƒ';
            }
            else {
                return number + ' ' + plural(format[key], +number);
            }
        }

        function monthsCaseReplace(m, format) {
            var months = {
                    'nominative': 'ÑÑ‚ÑƒĐ´Đ·ĐµĐ½ÑŒ_Đ»ÑÑ‚Ñ‹_ÑĐ°ĐºĐ°Đ²Ñ–Đº_ĐºÑ€Đ°ÑĐ°Đ²Ñ–Đº_Ñ‚Ñ€Đ°Đ²ĐµĐ½ÑŒ_Ñ‡ÑÑ€Đ²ĐµĐ½ÑŒ_Đ»Ñ–Đ¿ĐµĐ½ÑŒ_Đ¶Đ½Ñ–Đ²ĐµĐ½ÑŒ_Đ²ĐµÑ€Đ°ÑĐµĐ½ÑŒ_ĐºĐ°ÑÑ‚Ñ€Ñ‹Ñ‡Đ½Ñ–Đº_Đ»Ñ–ÑÑ‚Đ°Đ¿Đ°Đ´_ÑĐ½ĐµĐ¶Đ°Đ½ÑŒ'.split('_'),
                    'accusative': 'ÑÑ‚ÑƒĐ´Đ·ĐµĐ½Ñ_Đ»ÑÑ‚Đ°Đ³Đ°_ÑĐ°ĐºĐ°Đ²Ñ–ĐºĐ°_ĐºÑ€Đ°ÑĐ°Đ²Ñ–ĐºĐ°_Ñ‚Ñ€Đ°ÑĐ½Ñ_Ñ‡ÑÑ€Đ²ĐµĐ½Ñ_Đ»Ñ–Đ¿ĐµĐ½Ñ_Đ¶Đ½Ñ–ÑĐ½Ñ_Đ²ĐµÑ€Đ°ÑĐ½Ñ_ĐºĐ°ÑÑ‚Ñ€Ñ‹Ñ‡Đ½Ñ–ĐºĐ°_Đ»Ñ–ÑÑ‚Đ°Đ¿Đ°Đ´Đ°_ÑĐ½ĐµĐ¶Đ½Ñ'.split('_')
                },

                nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return months[nounCase][m.month()];
        }

        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                    'nominative': 'Đ½ÑĐ´Đ·ĐµĐ»Ñ_Đ¿Đ°Đ½ÑĐ´Đ·ĐµĐ»Đ°Đº_Đ°ÑÑ‚Đ¾Ñ€Đ°Đº_ÑĐµÑ€Đ°Đ´Đ°_Ñ‡Đ°Ñ†Đ²ĐµÑ€_Đ¿ÑÑ‚Đ½Ñ–Ñ†Đ°_ÑÑƒĐ±Đ¾Ñ‚Đ°'.split('_'),
                    'accusative': 'Đ½ÑĐ´Đ·ĐµĐ»Ñ_Đ¿Đ°Đ½ÑĐ´Đ·ĐµĐ»Đ°Đº_Đ°ÑÑ‚Đ¾Ñ€Đ°Đº_ÑĐµÑ€Đ°Đ´Ñƒ_Ñ‡Đ°Ñ†Đ²ĐµÑ€_Đ¿ÑÑ‚Đ½Ñ–Ñ†Ñƒ_ÑÑƒĐ±Đ¾Ñ‚Ñƒ'.split('_')
                },

                nounCase = (/\[ ?[Đ’Đ²] ?(?:Đ¼Ñ–Đ½ÑƒĐ»ÑƒÑ|Đ½Đ°ÑÑ‚ÑƒĐ¿Đ½ÑƒÑ)? ?\] ?dddd/).test(format) ?
                    'accusative' :
                    'nominative';

            return weekdays[nounCase][m.day()];
        }

        return moment.defineLocale('be', {
            months : monthsCaseReplace,
            monthsShort : 'ÑÑ‚ÑƒĐ´_Đ»ÑÑ‚_ÑĐ°Đº_ĐºÑ€Đ°Ñ_Ñ‚Ñ€Đ°Đ²_Ñ‡ÑÑ€Đ²_Đ»Ñ–Đ¿_Đ¶Đ½Ñ–Đ²_Đ²ĐµÑ€_ĐºĐ°ÑÑ‚_Đ»Ñ–ÑÑ‚_ÑĐ½ĐµĐ¶'.split('_'),
            weekdays : weekdaysCaseReplace,
            weekdaysShort : 'Đ½Đ´_Đ¿Đ½_Đ°Ñ‚_ÑÑ€_Ñ‡Ñ†_Đ¿Ñ‚_ÑĐ±'.split('_'),
            weekdaysMin : 'Đ½Đ´_Đ¿Đ½_Đ°Ñ‚_ÑÑ€_Ñ‡Ñ†_Đ¿Ñ‚_ÑĐ±'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY Đ³.',
                LLL : 'D MMMM YYYY Đ³., LT',
                LLLL : 'dddd, D MMMM YYYY Đ³., LT'
            },
            calendar : {
                sameDay: '[Đ¡Ñ‘Đ½Đ½Ñ Ñ] LT',
                nextDay: '[Đ—Đ°ÑÑ‚Ñ€Đ° Ñ] LT',
                lastDay: '[Đ£Ñ‡Đ¾Ñ€Đ° Ñ] LT',
                nextWeek: function () {
                    return '[Đ£] dddd [Ñ] LT';
                },
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 5:
                        case 6:
                            return '[Đ£ Đ¼Ñ–Đ½ÑƒĐ»ÑƒÑ] dddd [Ñ] LT';
                        case 1:
                        case 2:
                        case 4:
                            return '[Đ£ Đ¼Ñ–Đ½ÑƒĐ»Ñ‹] dddd [Ñ] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'Đ¿Ñ€Đ°Đ· %s',
                past : '%s Ñ‚Đ°Đ¼Ñƒ',
                s : 'Đ½ĐµĐºĐ°Đ»ÑŒĐºÑ– ÑĐµĐºÑƒĐ½Đ´',
                m : relativeTimeWithPlural,
                mm : relativeTimeWithPlural,
                h : relativeTimeWithPlural,
                hh : relativeTimeWithPlural,
                d : 'Đ´Đ·ĐµĐ½ÑŒ',
                dd : relativeTimeWithPlural,
                M : 'Đ¼ĐµÑÑÑ†',
                MM : relativeTimeWithPlural,
                y : 'Đ³Đ¾Đ´',
                yy : relativeTimeWithPlural
            },
            meridiemParse: /Đ½Đ¾Ñ‡Ñ‹|Ñ€Đ°Đ½Ñ–Ñ†Ñ‹|Đ´Đ½Ñ|Đ²ĐµÑ‡Đ°Ñ€Đ°/,
            isPM : function (input) {
                return /^(Đ´Đ½Ñ|Đ²ĐµÑ‡Đ°Ñ€Đ°)$/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'Đ½Đ¾Ñ‡Ñ‹';
                } else if (hour < 12) {
                    return 'Ñ€Đ°Đ½Ñ–Ñ†Ñ‹';
                } else if (hour < 17) {
                    return 'Đ´Đ½Ñ';
                } else {
                    return 'Đ²ĐµÑ‡Đ°Ñ€Đ°';
                }
            },

            ordinalParse: /\d{1,2}-(Ñ–|Ñ‹|Đ³Đ°)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                    case 'w':
                    case 'W':
                        return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-Ñ–' : number + '-Ñ‹';
                    case 'D':
                        return number + '-Đ³Đ°';
                    default:
                        return number;
                }
            },

            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : bulgarian (bg)
    // author : Krasen Borisov : https://github.com/kraz

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('bg', {
            months : 'ÑĐ½ÑƒĐ°Ñ€Đ¸_Ñ„ĐµĐ²Ñ€ÑƒĐ°Ñ€Đ¸_Đ¼Đ°Ñ€Ñ‚_Đ°Đ¿Ñ€Đ¸Đ»_Đ¼Đ°Đ¹_ÑĐ½Đ¸_ÑĐ»Đ¸_Đ°Đ²Đ³ÑƒÑÑ‚_ÑĐµĐ¿Ñ‚ĐµĐ¼Đ²Ñ€Đ¸_Đ¾ĐºÑ‚Đ¾Đ¼Đ²Ñ€Đ¸_Đ½Đ¾ĐµĐ¼Đ²Ñ€Đ¸_Đ´ĐµĐºĐµĐ¼Đ²Ñ€Đ¸'.split('_'),
            monthsShort : 'ÑĐ½Ñ€_Ñ„ĐµĐ²_Đ¼Đ°Ñ€_Đ°Đ¿Ñ€_Đ¼Đ°Đ¹_ÑĐ½Đ¸_ÑĐ»Đ¸_Đ°Đ²Đ³_ÑĐµĐ¿_Đ¾ĐºÑ‚_Đ½Đ¾Đµ_Đ´ĐµĐº'.split('_'),
            weekdays : 'Đ½ĐµĐ´ĐµĐ»Ñ_Đ¿Đ¾Đ½ĐµĐ´ĐµĐ»Đ½Đ¸Đº_Đ²Ñ‚Đ¾Ñ€Đ½Đ¸Đº_ÑÑ€ÑĐ´Đ°_Ñ‡ĐµÑ‚Đ²ÑÑ€Ñ‚ÑĐº_Đ¿ĐµÑ‚ÑĐº_ÑÑĐ±Đ¾Ñ‚Đ°'.split('_'),
            weekdaysShort : 'Đ½ĐµĐ´_Đ¿Đ¾Đ½_Đ²Ñ‚Đ¾_ÑÑ€Ñ_Ñ‡ĐµÑ‚_Đ¿ĐµÑ‚_ÑÑĐ±'.split('_'),
            weekdaysMin : 'Đ½Đ´_Đ¿Đ½_Đ²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Đ¿Ñ‚_ÑĐ±'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'D.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Đ”Đ½ĐµÑ Đ²] LT',
                nextDay : '[Đ£Ñ‚Ñ€Đµ Đ²] LT',
                nextWeek : 'dddd [Đ²] LT',
                lastDay : '[Đ’Ñ‡ĐµÑ€Đ° Đ²] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 6:
                            return '[Đ’ Đ¸Đ·Đ¼Đ¸Đ½Đ°Đ»Đ°Ñ‚Đ°] dddd [Đ²] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[Đ’ Đ¸Đ·Đ¼Đ¸Đ½Đ°Đ»Đ¸Ñ] dddd [Đ²] LT';
                    }
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'ÑĐ»ĐµĐ´ %s',
                past : 'Đ¿Ñ€ĐµĐ´Đ¸ %s',
                s : 'Đ½ÑĐºĐ¾Đ»ĐºĐ¾ ÑĐµĐºÑƒĐ½Đ´Đ¸',
                m : 'Đ¼Đ¸Đ½ÑƒÑ‚Đ°',
                mm : '%d Đ¼Đ¸Đ½ÑƒÑ‚Đ¸',
                h : 'Ñ‡Đ°Ñ',
                hh : '%d Ñ‡Đ°ÑĐ°',
                d : 'Đ´ĐµĐ½',
                dd : '%d Đ´Đ½Đ¸',
                M : 'Đ¼ĐµÑĐµÑ†',
                MM : '%d Đ¼ĐµÑĐµÑ†Đ°',
                y : 'Đ³Đ¾Đ´Đ¸Đ½Đ°',
                yy : '%d Đ³Đ¾Đ´Đ¸Đ½Đ¸'
            },
            ordinalParse: /\d{1,2}-(ĐµĐ²|ĐµĐ½|Ñ‚Đ¸|Đ²Đ¸|Ñ€Đ¸|Đ¼Đ¸)/,
            ordinal : function (number) {
                var lastDigit = number % 10,
                    last2Digits = number % 100;
                if (number === 0) {
                    return number + '-ĐµĐ²';
                } else if (last2Digits === 0) {
                    return number + '-ĐµĐ½';
                } else if (last2Digits > 10 && last2Digits < 20) {
                    return number + '-Ñ‚Đ¸';
                } else if (lastDigit === 1) {
                    return number + '-Đ²Đ¸';
                } else if (lastDigit === 2) {
                    return number + '-Ñ€Đ¸';
                } else if (lastDigit === 7 || lastDigit === 8) {
                    return number + '-Đ¼Đ¸';
                } else {
                    return number + '-Ñ‚Đ¸';
                }
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Bengali (bn)
    // author : Kaushik Gandhi : https://github.com/kaushikgandhi

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
                '1': 'à§§',
                '2': 'à§¨',
                '3': 'à§©',
                '4': 'à§ª',
                '5': 'à§«',
                '6': 'à§¬',
                '7': 'à§­',
                '8': 'à§®',
                '9': 'à§¯',
                '0': 'à§¦'
            },
            numberMap = {
                'à§§': '1',
                'à§¨': '2',
                'à§©': '3',
                'à§ª': '4',
                'à§«': '5',
                'à§¬': '6',
                'à§­': '7',
                'à§®': '8',
                'à§¯': '9',
                'à§¦': '0'
            };

        return moment.defineLocale('bn', {
            months : 'à¦œà¦¾à¦¨à§à§Ÿà¦¾à¦°à§€_à¦«à§‡à¦¬à§à§Ÿà¦¾à¦°à§€_à¦®à¦¾à¦°à§à¦_à¦à¦ªà§à¦°à¦¿à¦²_à¦®à§‡_à¦œà§à¦¨_à¦œà§à¦²à¦¾à¦‡_à¦…à¦—à¦¾à¦¸à§à¦Ÿ_à¦¸à§‡à¦ªà§à¦Ÿà§‡à¦®à§à¦¬à¦°_à¦…à¦•à§à¦Ÿà§‹à¦¬à¦°_à¦¨à¦­à§‡à¦®à§à¦¬à¦°_à¦¡à¦¿à¦¸à§‡à¦®à§à¦¬à¦°'.split('_'),
            monthsShort : 'à¦œà¦¾à¦¨à§_à¦«à§‡à¦¬_à¦®à¦¾à¦°à§à¦_à¦à¦ªà¦°_à¦®à§‡_à¦œà§à¦¨_à¦œà§à¦²_à¦…à¦—_à¦¸à§‡à¦ªà§à¦Ÿ_à¦…à¦•à§à¦Ÿà§‹_à¦¨à¦­_à¦¡à¦¿à¦¸à§‡à¦®à§'.split('_'),
            weekdays : 'à¦°à¦¬à¦¿à¦¬à¦¾à¦°_à¦¸à§‹à¦®à¦¬à¦¾à¦°_à¦®à¦™à§à¦—à¦²à¦¬à¦¾à¦°_à¦¬à§à¦§à¦¬à¦¾à¦°_à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à§à¦¤à¦¿à¦¬à¦¾à¦°_à¦¶à§à¦•à§à¦°à§à¦¬à¦¾à¦°_à¦¶à¦¨à¦¿à¦¬à¦¾à¦°'.split('_'),
            weekdaysShort : 'à¦°à¦¬à¦¿_à¦¸à§‹à¦®_à¦®à¦™à§à¦—à¦²_à¦¬à§à¦§_à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à§à¦¤à¦¿_à¦¶à§à¦•à§à¦°à§_à¦¶à¦¨à¦¿'.split('_'),
            weekdaysMin : 'à¦°à¦¬_à¦¸à¦®_à¦®à¦™à§à¦—_à¦¬à§_à¦¬à§à¦°à¦¿à¦¹_à¦¶à§_à¦¶à¦¨à¦¿'.split('_'),
            longDateFormat : {
                LT : 'A h:mm à¦¸à¦®à§Ÿ',
                LTS : 'A h:mm:ss à¦¸à¦®à§Ÿ',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à¦†à¦œ] LT',
                nextDay : '[à¦†à¦—à¦¾à¦®à§€à¦•à¦¾à¦²] LT',
                nextWeek : 'dddd, LT',
                lastDay : '[à¦—à¦¤à¦•à¦¾à¦²] LT',
                lastWeek : '[à¦—à¦¤] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à¦ªà¦°à§‡',
                past : '%s à¦†à¦—à§‡',
                s : 'à¦•à¦à¦• à¦¸à§‡à¦•à§‡à¦¨à§à¦¡',
                m : 'à¦à¦• à¦®à¦¿à¦¨à¦¿à¦Ÿ',
                mm : '%d à¦®à¦¿à¦¨à¦¿à¦Ÿ',
                h : 'à¦à¦• à¦˜à¦¨à§à¦Ÿà¦¾',
                hh : '%d à¦˜à¦¨à§à¦Ÿà¦¾',
                d : 'à¦à¦• à¦¦à¦¿à¦¨',
                dd : '%d à¦¦à¦¿à¦¨',
                M : 'à¦à¦• à¦®à¦¾à¦¸',
                MM : '%d à¦®à¦¾à¦¸',
                y : 'à¦à¦• à¦¬à¦›à¦°',
                yy : '%d à¦¬à¦›à¦°'
            },
            preparse: function (string) {
                return string.replace(/[à§§à§¨à§©à§ªà§«à§¬à§­à§®à§¯à§¦]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            meridiemParse: /à¦°à¦¾à¦¤|à¦¶à¦•à¦¾à¦²|à¦¦à§à¦ªà§à¦°|à¦¬à¦¿à¦•à§‡à¦²|à¦°à¦¾à¦¤/,
            isPM: function (input) {
                return /^(à¦¦à§à¦ªà§à¦°|à¦¬à¦¿à¦•à§‡à¦²|à¦°à¦¾à¦¤)$/.test(input);
            },
            //Bengali is a vast language its spoken
            //in different forms in various parts of the world.
            //I have just generalized with most common one used
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'à¦°à¦¾à¦¤';
                } else if (hour < 10) {
                    return 'à¦¶à¦•à¦¾à¦²';
                } else if (hour < 17) {
                    return 'à¦¦à§à¦ªà§à¦°';
                } else if (hour < 20) {
                    return 'à¦¬à¦¿à¦•à§‡à¦²';
                } else {
                    return 'à¦°à¦¾à¦¤';
                }
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : tibetan (bo)
    // author : Thupten N. Chakrishar : https://github.com/vajradog

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
                '1': 'à¼¡',
                '2': 'à¼¢',
                '3': 'à¼£',
                '4': 'à¼¤',
                '5': 'à¼¥',
                '6': 'à¼¦',
                '7': 'à¼§',
                '8': 'à¼¨',
                '9': 'à¼©',
                '0': 'à¼ '
            },
            numberMap = {
                'à¼¡': '1',
                'à¼¢': '2',
                'à¼£': '3',
                'à¼¤': '4',
                'à¼¥': '5',
                'à¼¦': '6',
                'à¼§': '7',
                'à¼¨': '8',
                'à¼©': '9',
                'à¼ ': '0'
            };

        return moment.defineLocale('bo', {
            months : 'à½Ÿà¾³à¼‹à½–à¼‹à½‘à½„à¼‹à½”à½¼_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½‰à½²à½¦à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½¦à½´à½˜à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½à½²à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½£à¾”à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à¾²à½´à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½‘à½´à½“à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½¢à¾’à¾±à½‘à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à½‚à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½…à½²à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½‰à½²à½¦à¼‹à½”'.split('_'),
            monthsShort : 'à½Ÿà¾³à¼‹à½–à¼‹à½‘à½„à¼‹à½”à½¼_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½‰à½²à½¦à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‚à½¦à½´à½˜à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½à½²à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½£à¾”à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à¾²à½´à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½‘à½´à½“à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½¢à¾’à¾±à½‘à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½‘à½‚à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½…à½²à½‚à¼‹à½”_à½Ÿà¾³à¼‹à½–à¼‹à½–à½…à½´à¼‹à½‚à½‰à½²à½¦à¼‹à½”'.split('_'),
            weekdays : 'à½‚à½Ÿà½ à¼‹à½‰à½²à¼‹à½˜à¼‹_à½‚à½Ÿà½ à¼‹à½Ÿà¾³à¼‹à½–à¼‹_à½‚à½Ÿà½ à¼‹à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½‚à½Ÿà½ à¼‹à½£à¾·à½‚à¼‹à½”à¼‹_à½‚à½Ÿà½ à¼‹à½•à½´à½¢à¼‹à½–à½´_à½‚à½Ÿà½ à¼‹à½”à¼‹à½¦à½„à½¦à¼‹_à½‚à½Ÿà½ à¼‹à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
            weekdaysShort : 'à½‰à½²à¼‹à½˜à¼‹_à½Ÿà¾³à¼‹à½–à¼‹_à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½£à¾·à½‚à¼‹à½”à¼‹_à½•à½´à½¢à¼‹à½–à½´_à½”à¼‹à½¦à½„à½¦à¼‹_à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
            weekdaysMin : 'à½‰à½²à¼‹à½˜à¼‹_à½Ÿà¾³à¼‹à½–à¼‹_à½˜à½²à½‚à¼‹à½‘à½˜à½¢à¼‹_à½£à¾·à½‚à¼‹à½”à¼‹_à½•à½´à½¢à¼‹à½–à½´_à½”à¼‹à½¦à½„à½¦à¼‹_à½¦à¾¤à½ºà½“à¼‹à½”à¼‹'.split('_'),
            longDateFormat : {
                LT : 'A h:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à½‘à½²à¼‹à½¢à½²à½„] LT',
                nextDay : '[à½¦à½„à¼‹à½‰à½²à½“] LT',
                nextWeek : '[à½–à½‘à½´à½“à¼‹à½•à¾²à½‚à¼‹à½¢à¾—à½ºà½¦à¼‹à½˜], LT',
                lastDay : '[à½à¼‹à½¦à½„] LT',
                lastWeek : '[à½–à½‘à½´à½“à¼‹à½•à¾²à½‚à¼‹à½˜à½à½ à¼‹à½˜] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à½£à¼‹',
                past : '%s à½¦à¾”à½“à¼‹à½£',
                s : 'à½£à½˜à¼‹à½¦à½„',
                m : 'à½¦à¾à½¢à¼‹à½˜à¼‹à½‚à½…à½²à½‚',
                mm : '%d à½¦à¾à½¢à¼‹à½˜',
                h : 'à½†à½´à¼‹à½à½¼à½‘à¼‹à½‚à½…à½²à½‚',
                hh : '%d à½†à½´à¼‹à½à½¼à½‘',
                d : 'à½‰à½²à½“à¼‹à½‚à½…à½²à½‚',
                dd : '%d à½‰à½²à½“à¼‹',
                M : 'à½Ÿà¾³à¼‹à½–à¼‹à½‚à½…à½²à½‚',
                MM : '%d à½Ÿà¾³à¼‹à½–',
                y : 'à½£à½¼à¼‹à½‚à½…à½²à½‚',
                yy : '%d à½£à½¼'
            },
            preparse: function (string) {
                return string.replace(/[à¼¡à¼¢à¼£à¼¤à¼¥à¼¦à¼§à¼¨à¼©à¼ ]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            meridiemParse: /à½˜à½à½“à¼‹à½˜à½¼|à½à½¼à½‚à½¦à¼‹à½€à½¦|à½‰à½²à½“à¼‹à½‚à½´à½„|à½‘à½‚à½¼à½„à¼‹à½‘à½‚|à½˜à½à½“à¼‹à½˜à½¼/,
            isPM: function (input) {
                return /^(à½‰à½²à½“à¼‹à½‚à½´à½„|à½‘à½‚à½¼à½„à¼‹à½‘à½‚|à½˜à½à½“à¼‹à½˜à½¼)$/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'à½˜à½à½“à¼‹à½˜à½¼';
                } else if (hour < 10) {
                    return 'à½à½¼à½‚à½¦à¼‹à½€à½¦';
                } else if (hour < 17) {
                    return 'à½‰à½²à½“à¼‹à½‚à½´à½„';
                } else if (hour < 20) {
                    return 'à½‘à½‚à½¼à½„à¼‹à½‘à½‚';
                } else {
                    return 'à½˜à½à½“à¼‹à½˜à½¼';
                }
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : breton (br)
    // author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function relativeTimeWithMutation(number, withoutSuffix, key) {
            var format = {
                'mm': 'munutenn',
                'MM': 'miz',
                'dd': 'devezh'
            };
            return number + ' ' + mutation(format[key], number);
        }

        function specialMutationForYears(number) {
            switch (lastNumber(number)) {
                case 1:
                case 3:
                case 4:
                case 5:
                case 9:
                    return number + ' bloaz';
                default:
                    return number + ' vloaz';
            }
        }

        function lastNumber(number) {
            if (number > 9) {
                return lastNumber(number % 10);
            }
            return number;
        }

        function mutation(text, number) {
            if (number === 2) {
                return softMutation(text);
            }
            return text;
        }

        function softMutation(text) {
            var mutationTable = {
                'm': 'v',
                'b': 'v',
                'd': 'z'
            };
            if (mutationTable[text.charAt(0)] === undefined) {
                return text;
            }
            return mutationTable[text.charAt(0)] + text.substring(1);
        }

        return moment.defineLocale('br', {
            months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
            monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
            weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
            weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
            weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
            longDateFormat : {
                LT : 'h[e]mm A',
                LTS : 'h[e]mm:ss A',
                L : 'DD/MM/YYYY',
                LL : 'D [a viz] MMMM YYYY',
                LLL : 'D [a viz] MMMM YYYY LT',
                LLLL : 'dddd, D [a viz] MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Hiziv da] LT',
                nextDay : '[Warc\'hoazh da] LT',
                nextWeek : 'dddd [da] LT',
                lastDay : '[Dec\'h da] LT',
                lastWeek : 'dddd [paset da] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'a-benn %s',
                past : '%s \'zo',
                s : 'un nebeud segondennoĂ¹',
                m : 'ur vunutenn',
                mm : relativeTimeWithMutation,
                h : 'un eur',
                hh : '%d eur',
                d : 'un devezh',
                dd : relativeTimeWithMutation,
                M : 'ur miz',
                MM : relativeTimeWithMutation,
                y : 'ur bloaz',
                yy : specialMutationForYears
            },
            ordinalParse: /\d{1,2}(aĂ±|vet)/,
            ordinal : function (number) {
                var output = (number === 1) ? 'aĂ±' : 'vet';
                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : bosnian (bs)
    // author : Nedim Cholich : https://github.com/frontyard
    // based on (hr) translation by Bojan MarkoviÄ‡

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + ' ';
            switch (key) {
                case 'm':
                    return withoutSuffix ? 'jedna minuta' : 'jedne minute';
                case 'mm':
                    if (number === 1) {
                        result += 'minuta';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'minute';
                    } else {
                        result += 'minuta';
                    }
                    return result;
                case 'h':
                    return withoutSuffix ? 'jedan sat' : 'jednog sata';
                case 'hh':
                    if (number === 1) {
                        result += 'sat';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'sata';
                    } else {
                        result += 'sati';
                    }
                    return result;
                case 'dd':
                    if (number === 1) {
                        result += 'dan';
                    } else {
                        result += 'dana';
                    }
                    return result;
                case 'MM':
                    if (number === 1) {
                        result += 'mjesec';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'mjeseca';
                    } else {
                        result += 'mjeseci';
                    }
                    return result;
                case 'yy':
                    if (number === 1) {
                        result += 'godina';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'godine';
                    } else {
                        result += 'godina';
                    }
                    return result;
            }
        }

        return moment.defineLocale('bs', {
            months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
            monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
            weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
            weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
            weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD. MM. YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay  : '[danas u] LT',
                nextDay  : '[sutra u] LT',

                nextWeek : function () {
                    switch (this.day()) {
                        case 0:
                            return '[u] [nedjelju] [u] LT';
                        case 3:
                            return '[u] [srijedu] [u] LT';
                        case 6:
                            return '[u] [subotu] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[u] dddd [u] LT';
                    }
                },
                lastDay  : '[juÄer u] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                            return '[proÅ¡lu] dddd [u] LT';
                        case 6:
                            return '[proÅ¡le] [subote] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[proÅ¡li] dddd [u] LT';
                    }
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'za %s',
                past   : 'prije %s',
                s      : 'par sekundi',
                m      : translate,
                mm     : translate,
                h      : translate,
                hh     : translate,
                d      : 'dan',
                dd     : translate,
                M      : 'mjesec',
                MM     : translate,
                y      : 'godinu',
                yy     : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : catalan (ca)
    // author : Juan G. Hurtado : https://github.com/juanghurtado

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ca', {
            months : 'gener_febrer_marĂ§_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
            monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
            weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
            weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
            weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay : function () {
                    return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
                },
                nextDay : function () {
                    return '[demĂ  a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
                },
                nextWeek : function () {
                    return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
                },
                lastDay : function () {
                    return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
                },
                lastWeek : function () {
                    return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'en %s',
                past : 'fa %s',
                s : 'uns segons',
                m : 'un minut',
                mm : '%d minuts',
                h : 'una hora',
                hh : '%d hores',
                d : 'un dia',
                dd : '%d dies',
                M : 'un mes',
                MM : '%d mesos',
                y : 'un any',
                yy : '%d anys'
            },
            ordinalParse: /\d{1,2}(r|n|t|Ă¨|a)/,
            ordinal : function (number, period) {
                var output = (number === 1) ? 'r' :
                    (number === 2) ? 'n' :
                        (number === 3) ? 'r' :
                            (number === 4) ? 't' : 'Ă¨';
                if (period === 'w' || period === 'W') {
                    output = 'a';
                }
                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : czech (cs)
    // author : petrbela : https://github.com/petrbela

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var months = 'leden_Ăºnor_bÅ™ezen_duben_kvÄ›ten_Äerven_Äervenec_srpen_zĂ¡Å™Ă­_Å™Ă­jen_listopad_prosinec'.split('_'),
            monthsShort = 'led_Ăºno_bÅ™e_dub_kvÄ›_Ävn_Ävc_srp_zĂ¡Å™_Å™Ă­j_lis_pro'.split('_');

        function plural(n) {
            return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
        }

        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + ' ';
            switch (key) {
                case 's':  // a few seconds / in a few seconds / a few seconds ago
                    return (withoutSuffix || isFuture) ? 'pĂ¡r sekund' : 'pĂ¡r sekundami';
                case 'm':  // a minute / in a minute / a minute ago
                    return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
                case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'minuty' : 'minut');
                    } else {
                        return result + 'minutami';
                    }
                    break;
                case 'h':  // an hour / in an hour / an hour ago
                    return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
                case 'hh': // 9 hours / in 9 hours / 9 hours ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'hodiny' : 'hodin');
                    } else {
                        return result + 'hodinami';
                    }
                    break;
                case 'd':  // a day / in a day / a day ago
                    return (withoutSuffix || isFuture) ? 'den' : 'dnem';
                case 'dd': // 9 days / in 9 days / 9 days ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'dny' : 'dnĂ­');
                    } else {
                        return result + 'dny';
                    }
                    break;
                case 'M':  // a month / in a month / a month ago
                    return (withoutSuffix || isFuture) ? 'mÄ›sĂ­c' : 'mÄ›sĂ­cem';
                case 'MM': // 9 months / in 9 months / 9 months ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'mÄ›sĂ­ce' : 'mÄ›sĂ­cÅ¯');
                    } else {
                        return result + 'mÄ›sĂ­ci';
                    }
                    break;
                case 'y':  // a year / in a year / a year ago
                    return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
                case 'yy': // 9 years / in 9 years / 9 years ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'roky' : 'let');
                    } else {
                        return result + 'lety';
                    }
                    break;
            }
        }

        return moment.defineLocale('cs', {
            months : months,
            monthsShort : monthsShort,
            monthsParse : (function (months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) {
                    // use custom parser to solve problem with July (Äervenec)
                    _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
                }
                return _monthsParse;
            }(months, monthsShort)),
            weekdays : 'nedÄ›le_pondÄ›lĂ­_ĂºterĂ½_stÅ™eda_Ätvrtek_pĂ¡tek_sobota'.split('_'),
            weekdaysShort : 'ne_po_Ăºt_st_Ät_pĂ¡_so'.split('_'),
            weekdaysMin : 'ne_po_Ăºt_st_Ät_pĂ¡_so'.split('_'),
            longDateFormat : {
                LT: 'H:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd D. MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[dnes v] LT',
                nextDay: '[zĂ­tra v] LT',
                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[v nedÄ›li v] LT';
                        case 1:
                        case 2:
                            return '[v] dddd [v] LT';
                        case 3:
                            return '[ve stÅ™edu v] LT';
                        case 4:
                            return '[ve Ätvrtek v] LT';
                        case 5:
                            return '[v pĂ¡tek v] LT';
                        case 6:
                            return '[v sobotu v] LT';
                    }
                },
                lastDay: '[vÄera v] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[minulou nedÄ›li v] LT';
                        case 1:
                        case 2:
                            return '[minulĂ©] dddd [v] LT';
                        case 3:
                            return '[minulou stÅ™edu v] LT';
                        case 4:
                        case 5:
                            return '[minulĂ½] dddd [v] LT';
                        case 6:
                            return '[minulou sobotu v] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'za %s',
                past : 'pÅ™ed %s',
                s : translate,
                m : translate,
                mm : translate,
                h : translate,
                hh : translate,
                d : translate,
                dd : translate,
                M : translate,
                MM : translate,
                y : translate,
                yy : translate
            },
            ordinalParse : /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : chuvash (cv)
    // author : Anatoly Mironov : https://github.com/mirontoli

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('cv', {
            months : 'ĐºÄƒÑ€Đ»Đ°Ñ‡_Đ½Đ°Ñ€ÄƒÑ_Đ¿ÑƒÑˆ_Đ°ĐºĐ°_Đ¼Đ°Đ¹_Ă§Ä•Ñ€Ñ‚Đ¼Đµ_ÑƒÑ‚Äƒ_Ă§ÑƒÑ€Đ»Đ°_Đ°Đ²ÄƒĐ½_ÑĐ¿Đ°_Ñ‡Ó³Đº_Ñ€Đ°ÑˆÑ‚Đ°Đ²'.split('_'),
            monthsShort : 'ĐºÄƒÑ€_Đ½Đ°Ñ€_Đ¿ÑƒÑˆ_Đ°ĐºĐ°_Đ¼Đ°Đ¹_Ă§Ä•Ñ€_ÑƒÑ‚Äƒ_Ă§ÑƒÑ€_Đ°Đ²_ÑĐ¿Đ°_Ñ‡Ó³Đº_Ñ€Đ°Ñˆ'.split('_'),
            weekdays : 'Đ²Ñ‹Ñ€ÑĐ°Ñ€Đ½Đ¸ĐºÑƒĐ½_Ñ‚ÑƒĐ½Ñ‚Đ¸ĐºÑƒĐ½_Ñ‹Ñ‚Đ»Đ°Ñ€Đ¸ĐºÑƒĐ½_ÑĐ½ĐºÑƒĐ½_ĐºÄ•Ă§Đ½ĐµÑ€Đ½Đ¸ĐºÑƒĐ½_ÑÑ€Đ½ĐµĐºÑƒĐ½_ÑˆÄƒĐ¼Đ°Ñ‚ĐºÑƒĐ½'.split('_'),
            weekdaysShort : 'Đ²Ñ‹Ñ€_Ñ‚ÑƒĐ½_Ñ‹Ñ‚Đ»_ÑĐ½_ĐºÄ•Ă§_ÑÑ€Đ½_ÑˆÄƒĐ¼'.split('_'),
            weekdaysMin : 'Đ²Ñ€_Ñ‚Đ½_Ñ‹Ñ‚_ÑĐ½_ĐºĂ§_ÑÑ€_ÑˆĐ¼'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD-MM-YYYY',
                LL : 'YYYY [Ă§ÑƒĐ»Ñ…Đ¸] MMMM [ÑƒĐ¹ÄƒÑ…Ä•Đ½] D[-Đ¼Ä•ÑˆÄ•]',
                LLL : 'YYYY [Ă§ÑƒĐ»Ñ…Đ¸] MMMM [ÑƒĐ¹ÄƒÑ…Ä•Đ½] D[-Đ¼Ä•ÑˆÄ•], LT',
                LLLL : 'dddd, YYYY [Ă§ÑƒĐ»Ñ…Đ¸] MMMM [ÑƒĐ¹ÄƒÑ…Ä•Đ½] D[-Đ¼Ä•ÑˆÄ•], LT'
            },
            calendar : {
                sameDay: '[ĐŸĐ°ÑĐ½] LT [ÑĐµÑ…ĐµÑ‚Ñ€Đµ]',
                nextDay: '[Đ«Ñ€Đ°Đ½] LT [ÑĐµÑ…ĐµÑ‚Ñ€Đµ]',
                lastDay: '[Ä”Đ½ĐµÑ€] LT [ÑĐµÑ…ĐµÑ‚Ñ€Đµ]',
                nextWeek: '[Ă‡Đ¸Ñ‚ĐµÑ] dddd LT [ÑĐµÑ…ĐµÑ‚Ñ€Đµ]',
                lastWeek: '[Đ˜Ñ€Ñ‚Đ½Ä•] dddd LT [ÑĐµÑ…ĐµÑ‚Ñ€Đµ]',
                sameElse: 'L'
            },
            relativeTime : {
                future : function (output) {
                    var affix = /ÑĐµÑ…ĐµÑ‚$/i.exec(output) ? 'Ñ€ĐµĐ½' : /Ă§ÑƒĐ»$/i.exec(output) ? 'Ñ‚Đ°Đ½' : 'Ñ€Đ°Đ½';
                    return output + affix;
                },
                past : '%s ĐºĐ°ÑĐ»Đ»Đ°',
                s : 'Đ¿Ä•Ñ€-Đ¸Đº Ă§ĐµĐºĐºÑƒĐ½Ñ‚',
                m : 'Đ¿Ä•Ñ€ Đ¼Đ¸Đ½ÑƒÑ‚',
                mm : '%d Đ¼Đ¸Đ½ÑƒÑ‚',
                h : 'Đ¿Ä•Ñ€ ÑĐµÑ…ĐµÑ‚',
                hh : '%d ÑĐµÑ…ĐµÑ‚',
                d : 'Đ¿Ä•Ñ€ ĐºÑƒĐ½',
                dd : '%d ĐºÑƒĐ½',
                M : 'Đ¿Ä•Ñ€ ÑƒĐ¹ÄƒÑ…',
                MM : '%d ÑƒĐ¹ÄƒÑ…',
                y : 'Đ¿Ä•Ñ€ Ă§ÑƒĐ»',
                yy : '%d Ă§ÑƒĐ»'
            },
            ordinalParse: /\d{1,2}-Đ¼Ä•Ñˆ/,
            ordinal : '%d-Đ¼Ä•Ñˆ',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Welsh (cy)
    // author : Robert Allen

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('cy', {
            months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
            monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
            weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
            weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
            weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
            // time formats are the same as en-gb
            longDateFormat: {
                LT: 'HH:mm',
                LTS : 'LT:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY LT',
                LLLL: 'dddd, D MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[Heddiw am] LT',
                nextDay: '[Yfory am] LT',
                nextWeek: 'dddd [am] LT',
                lastDay: '[Ddoe am] LT',
                lastWeek: 'dddd [diwethaf am] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'mewn %s',
                past: '%s yn Ă´l',
                s: 'ychydig eiliadau',
                m: 'munud',
                mm: '%d munud',
                h: 'awr',
                hh: '%d awr',
                d: 'diwrnod',
                dd: '%d diwrnod',
                M: 'mis',
                MM: '%d mis',
                y: 'blwyddyn',
                yy: '%d flynedd'
            },
            ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
            // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
            ordinal: function (number) {
                var b = number,
                    output = '',
                    lookup = [
                        '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
                        'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
                    ];

                if (b > 20) {
                    if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                        output = 'fed'; // not 30ain, 70ain or 90ain
                    } else {
                        output = 'ain';
                    }
                } else if (b > 0) {
                    output = lookup[b];
                }

                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : danish (da)
    // author : Ulrik Nielsen : https://github.com/mrbase

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('da', {
            months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
            monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays : 'sĂ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lĂ¸rdag'.split('_'),
            weekdaysShort : 'sĂ¸n_man_tir_ons_tor_fre_lĂ¸r'.split('_'),
            weekdaysMin : 'sĂ¸_ma_ti_on_to_fr_lĂ¸'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd [d.] D. MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[I dag kl.] LT',
                nextDay : '[I morgen kl.] LT',
                nextWeek : 'dddd [kl.] LT',
                lastDay : '[I gĂ¥r kl.] LT',
                lastWeek : '[sidste] dddd [kl] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'om %s',
                past : '%s siden',
                s : 'fĂ¥ sekunder',
                m : 'et minut',
                mm : '%d minutter',
                h : 'en time',
                hh : '%d timer',
                d : 'en dag',
                dd : '%d dage',
                M : 'en mĂ¥ned',
                MM : '%d mĂ¥neder',
                y : 'et Ă¥r',
                yy : '%d Ă¥r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : austrian german (de-at)
    // author : lluchs : https://github.com/lluchs
    // author: Menelion ElensĂºle: https://github.com/Oire
    // author : Martin Groller : https://github.com/MadMG

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                'm': ['eine Minute', 'einer Minute'],
                'h': ['eine Stunde', 'einer Stunde'],
                'd': ['ein Tag', 'einem Tag'],
                'dd': [number + ' Tage', number + ' Tagen'],
                'M': ['ein Monat', 'einem Monat'],
                'MM': [number + ' Monate', number + ' Monaten'],
                'y': ['ein Jahr', 'einem Jahr'],
                'yy': [number + ' Jahre', number + ' Jahren']
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }

        return moment.defineLocale('de-at', {
            months : 'JĂ¤nner_Februar_MĂ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort : 'JĂ¤n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
            weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            longDateFormat : {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[Morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[Gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]'
            },
            relativeTime : {
                future : 'in %s',
                past : 'vor %s',
                s : 'ein paar Sekunden',
                m : processRelativeTime,
                mm : '%d Minuten',
                h : processRelativeTime,
                hh : '%d Stunden',
                d : processRelativeTime,
                dd : processRelativeTime,
                M : processRelativeTime,
                MM : processRelativeTime,
                y : processRelativeTime,
                yy : processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : german (de)
    // author : lluchs : https://github.com/lluchs
    // author: Menelion ElensĂºle: https://github.com/Oire

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                'm': ['eine Minute', 'einer Minute'],
                'h': ['eine Stunde', 'einer Stunde'],
                'd': ['ein Tag', 'einem Tag'],
                'dd': [number + ' Tage', number + ' Tagen'],
                'M': ['ein Monat', 'einem Monat'],
                'MM': [number + ' Monate', number + ' Monaten'],
                'y': ['ein Jahr', 'einem Jahr'],
                'yy': [number + ' Jahre', number + ' Jahren']
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }

        return moment.defineLocale('de', {
            months : 'Januar_Februar_MĂ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
            weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            longDateFormat : {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[Morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[Gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]'
            },
            relativeTime : {
                future : 'in %s',
                past : 'vor %s',
                s : 'ein paar Sekunden',
                m : processRelativeTime,
                mm : '%d Minuten',
                h : processRelativeTime,
                hh : '%d Stunden',
                d : processRelativeTime,
                dd : processRelativeTime,
                M : processRelativeTime,
                MM : processRelativeTime,
                y : processRelativeTime,
                yy : processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : modern greek (el)
    // author : Aggelos Karalias : https://github.com/mehiel

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('el', {
            monthsNominativeEl : 'Î™Î±Î½Î¿Ï…Î¬ÏÎ¹Î¿Ï‚_Î¦ÎµÎ²ÏÎ¿Ï…Î¬ÏÎ¹Î¿Ï‚_ÎœÎ¬ÏÏ„Î¹Î¿Ï‚_Î‘Ï€ÏÎ¯Î»Î¹Î¿Ï‚_ÎœÎ¬Î¹Î¿Ï‚_Î™Î¿ÏÎ½Î¹Î¿Ï‚_Î™Î¿ÏÎ»Î¹Î¿Ï‚_Î‘ÏÎ³Î¿Ï…ÏƒÏ„Î¿Ï‚_Î£ÎµÏ€Ï„Î­Î¼Î²ÏÎ¹Î¿Ï‚_ÎŸÎºÏ„ÏÎ²ÏÎ¹Î¿Ï‚_ÎÎ¿Î­Î¼Î²ÏÎ¹Î¿Ï‚_Î”ÎµÎºÎ­Î¼Î²ÏÎ¹Î¿Ï‚'.split('_'),
            monthsGenitiveEl : 'Î™Î±Î½Î¿Ï…Î±ÏÎ¯Î¿Ï…_Î¦ÎµÎ²ÏÎ¿Ï…Î±ÏÎ¯Î¿Ï…_ÎœÎ±ÏÏ„Î¯Î¿Ï…_Î‘Ï€ÏÎ¹Î»Î¯Î¿Ï…_ÎœÎ±ÎÎ¿Ï…_Î™Î¿Ï…Î½Î¯Î¿Ï…_Î™Î¿Ï…Î»Î¯Î¿Ï…_Î‘Ï…Î³Î¿ÏÏƒÏ„Î¿Ï…_Î£ÎµÏ€Ï„ÎµÎ¼Î²ÏÎ¯Î¿Ï…_ÎŸÎºÏ„Ï‰Î²ÏÎ¯Î¿Ï…_ÎÎ¿ÎµÎ¼Î²ÏÎ¯Î¿Ï…_Î”ÎµÎºÎµÎ¼Î²ÏÎ¯Î¿Ï…'.split('_'),
            months : function (momentToFormat, format) {
                if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
                    return this._monthsGenitiveEl[momentToFormat.month()];
                } else {
                    return this._monthsNominativeEl[momentToFormat.month()];
                }
            },
            monthsShort : 'Î™Î±Î½_Î¦ÎµÎ²_ÎœÎ±Ï_Î‘Ï€Ï_ÎœÎ±Ï_Î™Î¿Ï…Î½_Î™Î¿Ï…Î»_Î‘Ï…Î³_Î£ÎµÏ€_ÎŸÎºÏ„_ÎÎ¿Îµ_Î”ÎµÎº'.split('_'),
            weekdays : 'ÎÏ…ÏÎ¹Î±ÎºÎ®_Î”ÎµÏ…Ï„Î­ÏÎ±_Î¤ÏÎ¯Ï„Î·_Î¤ÎµÏ„Î¬ÏÏ„Î·_Î Î­Î¼Ï€Ï„Î·_Î Î±ÏÎ±ÏƒÎºÎµÏ…Î®_Î£Î¬Î²Î²Î±Ï„Î¿'.split('_'),
            weekdaysShort : 'ÎÏ…Ï_Î”ÎµÏ…_Î¤ÏÎ¹_Î¤ÎµÏ„_Î ÎµÎ¼_Î Î±Ï_Î£Î±Î²'.split('_'),
            weekdaysMin : 'ÎÏ…_Î”Îµ_Î¤Ï_Î¤Îµ_Î Îµ_Î Î±_Î£Î±'.split('_'),
            meridiem : function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'Î¼Î¼' : 'ÎœÎœ';
                } else {
                    return isLower ? 'Ï€Î¼' : 'Î Îœ';
                }
            },
            isPM : function (input) {
                return ((input + '').toLowerCase()[0] === 'Î¼');
            },
            meridiemParse : /[Î Îœ]\.?Îœ?\.?/i,
            longDateFormat : {
                LT : 'h:mm A',
                LTS : 'h:mm:ss A',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendarEl : {
                sameDay : '[Î£Î®Î¼ÎµÏÎ± {}] LT',
                nextDay : '[Î‘ÏÏÎ¹Î¿ {}] LT',
                nextWeek : 'dddd [{}] LT',
                lastDay : '[Î§Î¸ÎµÏ‚ {}] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 6:
                            return '[Ï„Î¿ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î¿] dddd [{}] LT';
                        default:
                            return '[Ï„Î·Î½ Ï€ÏÎ¿Î·Î³Î¿ÏÎ¼ÎµÎ½Î·] dddd [{}] LT';
                    }
                },
                sameElse : 'L'
            },
            calendar : function (key, mom) {
                var output = this._calendarEl[key],
                    hours = mom && mom.hours();

                if (typeof output === 'function') {
                    output = output.apply(mom);
                }

                return output.replace('{}', (hours % 12 === 1 ? 'ÏƒÏ„Î·' : 'ÏƒÏ„Î¹Ï‚'));
            },
            relativeTime : {
                future : 'ÏƒÎµ %s',
                past : '%s Ï€ÏÎ¹Î½',
                s : 'Î»Î¯Î³Î± Î´ÎµÏ…Ï„ÎµÏÏŒÎ»ÎµÏ€Ï„Î±',
                m : 'Î­Î½Î± Î»ÎµÏ€Ï„ÏŒ',
                mm : '%d Î»ÎµÏ€Ï„Î¬',
                h : 'Î¼Î¯Î± ÏÏÎ±',
                hh : '%d ÏÏÎµÏ‚',
                d : 'Î¼Î¯Î± Î¼Î­ÏÎ±',
                dd : '%d Î¼Î­ÏÎµÏ‚',
                M : 'Î­Î½Î±Ï‚ Î¼Î®Î½Î±Ï‚',
                MM : '%d Î¼Î®Î½ÎµÏ‚',
                y : 'Î­Î½Î±Ï‚ Ï‡ÏÏŒÎ½Î¿Ï‚',
                yy : '%d Ï‡ÏÏŒÎ½Î¹Î±'
            },
            ordinalParse: /\d{1,2}Î·/,
            ordinal: '%dÎ·',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : australian english (en-au)

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('en-au', {
            months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat : {
                LT : 'h:mm A',
                LTS : 'h:mm:ss A',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Today at] LT',
                nextDay : '[Tomorrow at] LT',
                nextWeek : 'dddd [at] LT',
                lastDay : '[Yesterday at] LT',
                lastWeek : '[Last] dddd [at] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'in %s',
                past : '%s ago',
                s : 'a few seconds',
                m : 'a minute',
                mm : '%d minutes',
                h : 'an hour',
                hh : '%d hours',
                d : 'a day',
                dd : '%d days',
                M : 'a month',
                MM : '%d months',
                y : 'a year',
                yy : '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal : function (number) {
                var b = number % 10,
                    output = (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : canadian english (en-ca)
    // author : Jonathan Abourbih : https://github.com/jonbca

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('en-ca', {
            months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat : {
                LT : 'h:mm A',
                LTS : 'h:mm:ss A',
                L : 'YYYY-MM-DD',
                LL : 'D MMMM, YYYY',
                LLL : 'D MMMM, YYYY LT',
                LLLL : 'dddd, D MMMM, YYYY LT'
            },
            calendar : {
                sameDay : '[Today at] LT',
                nextDay : '[Tomorrow at] LT',
                nextWeek : 'dddd [at] LT',
                lastDay : '[Yesterday at] LT',
                lastWeek : '[Last] dddd [at] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'in %s',
                past : '%s ago',
                s : 'a few seconds',
                m : 'a minute',
                mm : '%d minutes',
                h : 'an hour',
                hh : '%d hours',
                d : 'a day',
                dd : '%d days',
                M : 'a month',
                MM : '%d months',
                y : 'a year',
                yy : '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal : function (number) {
                var b = number % 10,
                    output = (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                return number + output;
            }
        });
    }));
    // moment.js locale configuration
    // locale : great britain english (en-gb)
    // author : Chris Gedrim : https://github.com/chrisgedrim

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('en-gb', {
            months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'HH:mm:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Today at] LT',
                nextDay : '[Tomorrow at] LT',
                nextWeek : 'dddd [at] LT',
                lastDay : '[Yesterday at] LT',
                lastWeek : '[Last] dddd [at] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'in %s',
                past : '%s ago',
                s : 'a few seconds',
                m : 'a minute',
                mm : '%d minutes',
                h : 'an hour',
                hh : '%d hours',
                d : 'a day',
                dd : '%d days',
                M : 'a month',
                MM : '%d months',
                y : 'a year',
                yy : '%d years'
            },
            ordinalParse: /\d{1,2}(st|nd|rd|th)/,
            ordinal : function (number) {
                var b = number % 10,
                    output = (~~(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : esperanto (eo)
    // author : Colin Dean : https://github.com/colindean
    // komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
    //          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('eo', {
            months : 'januaro_februaro_marto_aprilo_majo_junio_julio_aÅ­gusto_septembro_oktobro_novembro_decembro'.split('_'),
            monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aÅ­g_sep_okt_nov_dec'.split('_'),
            weekdays : 'DimanÄ‰o_Lundo_Mardo_Merkredo_Ä´aÅ­do_Vendredo_Sabato'.split('_'),
            weekdaysShort : 'Dim_Lun_Mard_Merk_Ä´aÅ­_Ven_Sab'.split('_'),
            weekdaysMin : 'Di_Lu_Ma_Me_Ä´a_Ve_Sa'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'YYYY-MM-DD',
                LL : 'D[-an de] MMMM, YYYY',
                LLL : 'D[-an de] MMMM, YYYY LT',
                LLLL : 'dddd, [la] D[-an de] MMMM, YYYY LT'
            },
            meridiemParse: /[ap]\.t\.m/i,
            isPM: function (input) {
                return input.charAt(0).toLowerCase() === 'p';
            },
            meridiem : function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'p.t.m.' : 'P.T.M.';
                } else {
                    return isLower ? 'a.t.m.' : 'A.T.M.';
                }
            },
            calendar : {
                sameDay : '[HodiaÅ­ je] LT',
                nextDay : '[MorgaÅ­ je] LT',
                nextWeek : 'dddd [je] LT',
                lastDay : '[HieraÅ­ je] LT',
                lastWeek : '[pasinta] dddd [je] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'je %s',
                past : 'antaÅ­ %s',
                s : 'sekundoj',
                m : 'minuto',
                mm : '%d minutoj',
                h : 'horo',
                hh : '%d horoj',
                d : 'tago',//ne 'diurno', Ä‰ar estas uzita por proksimumo
                dd : '%d tagoj',
                M : 'monato',
                MM : '%d monatoj',
                y : 'jaro',
                yy : '%d jaroj'
            },
            ordinalParse: /\d{1,2}a/,
            ordinal : '%da',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : spanish (es)
    // author : Julio NapurĂ­ : https://github.com/julionc

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'),
            monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');

        return moment.defineLocale('es', {
            months : 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
            monthsShort : function (m, format) {
                if (/-MMM-/.test(format)) {
                    return monthsShort[m.month()];
                } else {
                    return monthsShortDot[m.month()];
                }
            },
            weekdays : 'domingo_lunes_martes_miĂ©rcoles_jueves_viernes_sĂ¡bado'.split('_'),
            weekdaysShort : 'dom._lun._mar._miĂ©._jue._vie._sĂ¡b.'.split('_'),
            weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_SĂ¡'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D [de] MMMM [de] YYYY',
                LLL : 'D [de] MMMM [de] YYYY LT',
                LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
            },
            calendar : {
                sameDay : function () {
                    return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
                },
                nextDay : function () {
                    return '[maĂ±ana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
                },
                nextWeek : function () {
                    return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
                },
                lastDay : function () {
                    return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
                },
                lastWeek : function () {
                    return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'en %s',
                past : 'hace %s',
                s : 'unos segundos',
                m : 'un minuto',
                mm : '%d minutos',
                h : 'una hora',
                hh : '%d horas',
                d : 'un dĂ­a',
                dd : '%d dĂ­as',
                M : 'un mes',
                MM : '%d meses',
                y : 'un aĂ±o',
                yy : '%d aĂ±os'
            },
            ordinalParse : /\d{1,2}Âº/,
            ordinal : '%dÂº',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : estonian (et)
    // author : Henry Kehlmann : https://github.com/madhenry
    // improvements : Illimar Tambek : https://github.com/ragulka

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                's' : ['mĂµne sekundi', 'mĂµni sekund', 'paar sekundit'],
                'm' : ['Ă¼he minuti', 'Ă¼ks minut'],
                'mm': [number + ' minuti', number + ' minutit'],
                'h' : ['Ă¼he tunni', 'tund aega', 'Ă¼ks tund'],
                'hh': [number + ' tunni', number + ' tundi'],
                'd' : ['Ă¼he pĂ¤eva', 'Ă¼ks pĂ¤ev'],
                'M' : ['kuu aja', 'kuu aega', 'Ă¼ks kuu'],
                'MM': [number + ' kuu', number + ' kuud'],
                'y' : ['Ă¼he aasta', 'aasta', 'Ă¼ks aasta'],
                'yy': [number + ' aasta', number + ' aastat']
            };
            if (withoutSuffix) {
                return format[key][2] ? format[key][2] : format[key][1];
            }
            return isFuture ? format[key][0] : format[key][1];
        }

        return moment.defineLocale('et', {
            months        : 'jaanuar_veebruar_mĂ¤rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
            monthsShort   : 'jaan_veebr_mĂ¤rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
            weekdays      : 'pĂ¼hapĂ¤ev_esmaspĂ¤ev_teisipĂ¤ev_kolmapĂ¤ev_neljapĂ¤ev_reede_laupĂ¤ev'.split('_'),
            weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
            weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
            longDateFormat : {
                LT   : 'H:mm',
                LTS : 'LT:ss',
                L    : 'DD.MM.YYYY',
                LL   : 'D. MMMM YYYY',
                LLL  : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay  : '[TĂ¤na,] LT',
                nextDay  : '[Homme,] LT',
                nextWeek : '[JĂ¤rgmine] dddd LT',
                lastDay  : '[Eile,] LT',
                lastWeek : '[Eelmine] dddd LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s pĂ¤rast',
                past   : '%s tagasi',
                s      : processRelativeTime,
                m      : processRelativeTime,
                mm     : processRelativeTime,
                h      : processRelativeTime,
                hh     : processRelativeTime,
                d      : processRelativeTime,
                dd     : '%d pĂ¤eva',
                M      : processRelativeTime,
                MM     : processRelativeTime,
                y      : processRelativeTime,
                yy     : processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : euskara (eu)
    // author : Eneko Illarramendi : https://github.com/eillarra

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('eu', {
            months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
            monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
            weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
            weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
            weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'YYYY-MM-DD',
                LL : 'YYYY[ko] MMMM[ren] D[a]',
                LLL : 'YYYY[ko] MMMM[ren] D[a] LT',
                LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
                l : 'YYYY-M-D',
                ll : 'YYYY[ko] MMM D[a]',
                lll : 'YYYY[ko] MMM D[a] LT',
                llll : 'ddd, YYYY[ko] MMM D[a] LT'
            },
            calendar : {
                sameDay : '[gaur] LT[etan]',
                nextDay : '[bihar] LT[etan]',
                nextWeek : 'dddd LT[etan]',
                lastDay : '[atzo] LT[etan]',
                lastWeek : '[aurreko] dddd LT[etan]',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s barru',
                past : 'duela %s',
                s : 'segundo batzuk',
                m : 'minutu bat',
                mm : '%d minutu',
                h : 'ordu bat',
                hh : '%d ordu',
                d : 'egun bat',
                dd : '%d egun',
                M : 'hilabete bat',
                MM : '%d hilabete',
                y : 'urte bat',
                yy : '%d urte'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Persian (fa)
    // author : Ebrahim Byagowi : https://github.com/ebraminio

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
            '1': 'Û±',
            '2': 'Û²',
            '3': 'Û³',
            '4': 'Û´',
            '5': 'Ûµ',
            '6': 'Û¶',
            '7': 'Û·',
            '8': 'Û¸',
            '9': 'Û¹',
            '0': 'Û°'
        }, numberMap = {
            'Û±': '1',
            'Û²': '2',
            'Û³': '3',
            'Û´': '4',
            'Ûµ': '5',
            'Û¶': '6',
            'Û·': '7',
            'Û¸': '8',
            'Û¹': '9',
            'Û°': '0'
        };

        return moment.defineLocale('fa', {
            months : 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
            monthsShort : 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
            weekdays : 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
            weekdaysShort : 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
            weekdaysMin : 'ÛŒ_Ø¯_Ø³_Ú†_Ù¾_Ø¬_Ø´'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            meridiemParse: /Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±|Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±/,
            isPM: function (input) {
                return /Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 12) {
                    return 'Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±';
                } else {
                    return 'Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±';
                }
            },
            calendar : {
                sameDay : '[Ø§Ù…Ø±ÙˆØ² Ø³Ø§Ø¹Øª] LT',
                nextDay : '[ÙØ±Ø¯Ø§ Ø³Ø§Ø¹Øª] LT',
                nextWeek : 'dddd [Ø³Ø§Ø¹Øª] LT',
                lastDay : '[Ø¯ÛŒØ±ÙˆØ² Ø³Ø§Ø¹Øª] LT',
                lastWeek : 'dddd [Ù¾ÛŒØ´] [Ø³Ø§Ø¹Øª] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'Ø¯Ø± %s',
                past : '%s Ù¾ÛŒØ´',
                s : 'Ú†Ù†Ø¯ÛŒÙ† Ø«Ø§Ù†ÛŒÙ‡',
                m : 'ÛŒÚ© Ø¯Ù‚ÛŒÙ‚Ù‡',
                mm : '%d Ø¯Ù‚ÛŒÙ‚Ù‡',
                h : 'ÛŒÚ© Ø³Ø§Ø¹Øª',
                hh : '%d Ø³Ø§Ø¹Øª',
                d : 'ÛŒÚ© Ø±ÙˆØ²',
                dd : '%d Ø±ÙˆØ²',
                M : 'ÛŒÚ© Ù…Ø§Ù‡',
                MM : '%d Ù…Ø§Ù‡',
                y : 'ÛŒÚ© Ø³Ø§Ù„',
                yy : '%d Ø³Ø§Ù„'
            },
            preparse: function (string) {
                return string.replace(/[Û°-Û¹]/g, function (match) {
                    return numberMap[match];
                }).replace(/ØŒ/g, ',');
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                }).replace(/,/g, 'ØŒ');
            },
            ordinalParse: /\d{1,2}Ù…/,
            ordinal : '%dÙ…',
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12 // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : finnish (fi)
    // author : Tarmo Aidantausta : https://github.com/bleadof

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var numbersPast = 'nolla yksi kaksi kolme neljĂ¤ viisi kuusi seitsemĂ¤n kahdeksan yhdeksĂ¤n'.split(' '),
            numbersFuture = [
                'nolla', 'yhden', 'kahden', 'kolmen', 'neljĂ¤n', 'viiden', 'kuuden',
                numbersPast[7], numbersPast[8], numbersPast[9]
            ];

        function translate(number, withoutSuffix, key, isFuture) {
            var result = '';
            switch (key) {
                case 's':
                    return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
                case 'm':
                    return isFuture ? 'minuutin' : 'minuutti';
                case 'mm':
                    result = isFuture ? 'minuutin' : 'minuuttia';
                    break;
                case 'h':
                    return isFuture ? 'tunnin' : 'tunti';
                case 'hh':
                    result = isFuture ? 'tunnin' : 'tuntia';
                    break;
                case 'd':
                    return isFuture ? 'pĂ¤ivĂ¤n' : 'pĂ¤ivĂ¤';
                case 'dd':
                    result = isFuture ? 'pĂ¤ivĂ¤n' : 'pĂ¤ivĂ¤Ă¤';
                    break;
                case 'M':
                    return isFuture ? 'kuukauden' : 'kuukausi';
                case 'MM':
                    result = isFuture ? 'kuukauden' : 'kuukautta';
                    break;
                case 'y':
                    return isFuture ? 'vuoden' : 'vuosi';
                case 'yy':
                    result = isFuture ? 'vuoden' : 'vuotta';
                    break;
            }
            result = verbalNumber(number, isFuture) + ' ' + result;
            return result;
        }

        function verbalNumber(number, isFuture) {
            return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
        }

        return moment.defineLocale('fi', {
            months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesĂ¤kuu_heinĂ¤kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
            monthsShort : 'tammi_helmi_maalis_huhti_touko_kesĂ¤_heinĂ¤_elo_syys_loka_marras_joulu'.split('_'),
            weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
            weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
            weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
            longDateFormat : {
                LT : 'HH.mm',
                LTS : 'HH.mm.ss',
                L : 'DD.MM.YYYY',
                LL : 'Do MMMM[ta] YYYY',
                LLL : 'Do MMMM[ta] YYYY, [klo] LT',
                LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] LT',
                l : 'D.M.YYYY',
                ll : 'Do MMM YYYY',
                lll : 'Do MMM YYYY, [klo] LT',
                llll : 'ddd, Do MMM YYYY, [klo] LT'
            },
            calendar : {
                sameDay : '[tĂ¤nĂ¤Ă¤n] [klo] LT',
                nextDay : '[huomenna] [klo] LT',
                nextWeek : 'dddd [klo] LT',
                lastDay : '[eilen] [klo] LT',
                lastWeek : '[viime] dddd[na] [klo] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s pĂ¤Ă¤stĂ¤',
                past : '%s sitten',
                s : translate,
                m : translate,
                mm : translate,
                h : translate,
                hh : translate,
                d : translate,
                dd : translate,
                M : translate,
                MM : translate,
                y : translate,
                yy : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : faroese (fo)
    // author : Ragnar Johannesen : https://github.com/ragnar123

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('fo', {
            months : 'januar_februar_mars_aprĂ­l_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays : 'sunnudagur_mĂ¡nadagur_tĂ½sdagur_mikudagur_hĂ³sdagur_frĂ­ggjadagur_leygardagur'.split('_'),
            weekdaysShort : 'sun_mĂ¡n_tĂ½s_mik_hĂ³s_frĂ­_ley'.split('_'),
            weekdaysMin : 'su_mĂ¡_tĂ½_mi_hĂ³_fr_le'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D. MMMM, YYYY LT'
            },
            calendar : {
                sameDay : '[Ă dag kl.] LT',
                nextDay : '[Ă morgin kl.] LT',
                nextWeek : 'dddd [kl.] LT',
                lastDay : '[Ă gjĂ¡r kl.] LT',
                lastWeek : '[sĂ­Ă°stu] dddd [kl] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'um %s',
                past : '%s sĂ­Ă°ani',
                s : 'fĂ¡ sekund',
                m : 'ein minutt',
                mm : '%d minuttir',
                h : 'ein tĂ­mi',
                hh : '%d tĂ­mar',
                d : 'ein dagur',
                dd : '%d dagar',
                M : 'ein mĂ¡naĂ°i',
                MM : '%d mĂ¡naĂ°ir',
                y : 'eitt Ă¡r',
                yy : '%d Ă¡r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : canadian french (fr-ca)
    // author : Jonathan Abourbih : https://github.com/jonbca

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('fr-ca', {
            months : 'janvier_fĂ©vrier_mars_avril_mai_juin_juillet_aoĂ»t_septembre_octobre_novembre_dĂ©cembre'.split('_'),
            monthsShort : 'janv._fĂ©vr._mars_avr._mai_juin_juil._aoĂ»t_sept._oct._nov._dĂ©c.'.split('_'),
            weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
            weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'YYYY-MM-DD',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Aujourd\'hui Ă ] LT',
                nextDay: '[Demain Ă ] LT',
                nextWeek: 'dddd [Ă ] LT',
                lastDay: '[Hier Ă ] LT',
                lastWeek: 'dddd [dernier Ă ] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'dans %s',
                past : 'il y a %s',
                s : 'quelques secondes',
                m : 'une minute',
                mm : '%d minutes',
                h : 'une heure',
                hh : '%d heures',
                d : 'un jour',
                dd : '%d jours',
                M : 'un mois',
                MM : '%d mois',
                y : 'un an',
                yy : '%d ans'
            },
            ordinalParse: /\d{1,2}(er|)/,
            ordinal : function (number) {
                return number + (number === 1 ? 'er' : '');
            }
        });
    }));
    // moment.js locale configuration
    // locale : french (fr)
    // author : John Fischer : https://github.com/jfroffice

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('fr', {
            months : 'janvier_fĂ©vrier_mars_avril_mai_juin_juillet_aoĂ»t_septembre_octobre_novembre_dĂ©cembre'.split('_'),
            monthsShort : 'janv._fĂ©vr._mars_avr._mai_juin_juil._aoĂ»t_sept._oct._nov._dĂ©c.'.split('_'),
            weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
            weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Aujourd\'hui Ă ] LT',
                nextDay: '[Demain Ă ] LT',
                nextWeek: 'dddd [Ă ] LT',
                lastDay: '[Hier Ă ] LT',
                lastWeek: 'dddd [dernier Ă ] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'dans %s',
                past : 'il y a %s',
                s : 'quelques secondes',
                m : 'une minute',
                mm : '%d minutes',
                h : 'une heure',
                hh : '%d heures',
                d : 'un jour',
                dd : '%d jours',
                M : 'un mois',
                MM : '%d mois',
                y : 'un an',
                yy : '%d ans'
            },
            ordinalParse: /\d{1,2}(er|)/,
            ordinal : function (number) {
                return number + (number === 1 ? 'er' : '');
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : frisian (fy)
    // author : Robin van der Vliet : https://github.com/robin0van0der0v

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
            monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');

        return moment.defineLocale('fy', {
            months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
            monthsShort : function (m, format) {
                if (/-MMM-/.test(format)) {
                    return monthsShortWithoutDots[m.month()];
                } else {
                    return monthsShortWithDots[m.month()];
                }
            },
            weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
            weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
            weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD-MM-YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[hjoed om] LT',
                nextDay: '[moarn om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[juster om] LT',
                lastWeek: '[Ă´frĂ»ne] dddd [om] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'oer %s',
                past : '%s lyn',
                s : 'in pear sekonden',
                m : 'ien minĂºt',
                mm : '%d minuten',
                h : 'ien oere',
                hh : '%d oeren',
                d : 'ien dei',
                dd : '%d dagen',
                M : 'ien moanne',
                MM : '%d moannen',
                y : 'ien jier',
                yy : '%d jierren'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal : function (number) {
                return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : galician (gl)
    // author : Juan G. Hurtado : https://github.com/juanghurtado

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('gl', {
            months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_XuĂ±o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
            monthsShort : 'Xan._Feb._Mar._Abr._Mai._XuĂ±._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
            weekdays : 'Domingo_Luns_Martes_MĂ©rcores_Xoves_Venres_SĂ¡bado'.split('_'),
            weekdaysShort : 'Dom._Lun._Mar._MĂ©r._Xov._Ven._SĂ¡b.'.split('_'),
            weekdaysMin : 'Do_Lu_Ma_MĂ©_Xo_Ve_SĂ¡'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay : function () {
                    return '[hoxe ' + ((this.hours() !== 1) ? 'Ă¡s' : 'Ă¡') + '] LT';
                },
                nextDay : function () {
                    return '[maĂ±Ă¡ ' + ((this.hours() !== 1) ? 'Ă¡s' : 'Ă¡') + '] LT';
                },
                nextWeek : function () {
                    return 'dddd [' + ((this.hours() !== 1) ? 'Ă¡s' : 'a') + '] LT';
                },
                lastDay : function () {
                    return '[onte ' + ((this.hours() !== 1) ? 'Ă¡' : 'a') + '] LT';
                },
                lastWeek : function () {
                    return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'Ă¡s' : 'a') + '] LT';
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : function (str) {
                    if (str === 'uns segundos') {
                        return 'nuns segundos';
                    }
                    return 'en ' + str;
                },
                past : 'hai %s',
                s : 'uns segundos',
                m : 'un minuto',
                mm : '%d minutos',
                h : 'unha hora',
                hh : '%d horas',
                d : 'un dĂ­a',
                dd : '%d dĂ­as',
                M : 'un mes',
                MM : '%d meses',
                y : 'un ano',
                yy : '%d anos'
            },
            ordinalParse : /\d{1,2}Âº/,
            ordinal : '%dÂº',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Hebrew (he)
    // author : Tomer Cohen : https://github.com/tomer
    // author : Moshe Simantov : https://github.com/DevelopmentIL
    // author : Tal Ater : https://github.com/TalAter

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('he', {
            months : '×™× ×•××¨_×¤×‘×¨×•××¨_××¨×¥_××¤×¨×™×œ_×××™_×™×•× ×™_×™×•×œ×™_××•×’×•×¡×˜_×¡×¤×˜××‘×¨_××•×§×˜×•×‘×¨_× ×•×‘××‘×¨_×“×¦××‘×¨'.split('_'),
            monthsShort : '×™× ×•×³_×¤×‘×¨×³_××¨×¥_××¤×¨×³_×××™_×™×•× ×™_×™×•×œ×™_××•×’×³_×¡×¤×˜×³_××•×§×³_× ×•×‘×³_×“×¦××³'.split('_'),
            weekdays : '×¨××©×•×Ÿ_×©× ×™_×©×œ×™×©×™_×¨×‘×™×¢×™_×—××™×©×™_×©×™×©×™_×©×‘×ª'.split('_'),
            weekdaysShort : '××³_×‘×³_×’×³_×“×³_×”×³_×•×³_×©×³'.split('_'),
            weekdaysMin : '×_×‘_×’_×“_×”_×•_×©'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D [×‘]MMMM YYYY',
                LLL : 'D [×‘]MMMM YYYY LT',
                LLLL : 'dddd, D [×‘]MMMM YYYY LT',
                l : 'D/M/YYYY',
                ll : 'D MMM YYYY',
                lll : 'D MMM YYYY LT',
                llll : 'ddd, D MMM YYYY LT'
            },
            calendar : {
                sameDay : '[×”×™×•× ×‘Ö¾]LT',
                nextDay : '[××—×¨ ×‘Ö¾]LT',
                nextWeek : 'dddd [×‘×©×¢×”] LT',
                lastDay : '[××ª××•×œ ×‘Ö¾]LT',
                lastWeek : '[×‘×™×•×] dddd [×”××—×¨×•×Ÿ ×‘×©×¢×”] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '×‘×¢×•×“ %s',
                past : '×œ×¤× ×™ %s',
                s : '××¡×¤×¨ ×©× ×™×•×ª',
                m : '×“×§×”',
                mm : '%d ×“×§×•×ª',
                h : '×©×¢×”',
                hh : function (number) {
                    if (number === 2) {
                        return '×©×¢×ª×™×™×';
                    }
                    return number + ' ×©×¢×•×ª';
                },
                d : '×™×•×',
                dd : function (number) {
                    if (number === 2) {
                        return '×™×•××™×™×';
                    }
                    return number + ' ×™××™×';
                },
                M : '×—×•×“×©',
                MM : function (number) {
                    if (number === 2) {
                        return '×—×•×“×©×™×™×';
                    }
                    return number + ' ×—×•×“×©×™×';
                },
                y : '×©× ×”',
                yy : function (number) {
                    if (number === 2) {
                        return '×©× ×ª×™×™×';
                    } else if (number % 10 === 0 && number !== 10) {
                        return number + ' ×©× ×”';
                    }
                    return number + ' ×©× ×™×';
                }
            }
        });
    }));
    // moment.js locale configuration
    // locale : hindi (hi)
    // author : Mayank Singhal : https://github.com/mayanksinghal

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
                '1': 'à¥§',
                '2': 'à¥¨',
                '3': 'à¥©',
                '4': 'à¥ª',
                '5': 'à¥«',
                '6': 'à¥¬',
                '7': 'à¥­',
                '8': 'à¥®',
                '9': 'à¥¯',
                '0': 'à¥¦'
            },
            numberMap = {
                'à¥§': '1',
                'à¥¨': '2',
                'à¥©': '3',
                'à¥ª': '4',
                'à¥«': '5',
                'à¥¬': '6',
                'à¥­': '7',
                'à¥®': '8',
                'à¥¯': '9',
                'à¥¦': '0'
            };

        return moment.defineLocale('hi', {
            months : 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¤¼à¤°à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤_à¤…à¤ªà¥à¤°à¥ˆà¤²_à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤¸à¥à¤¤_à¤¸à¤¿à¤¤à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°_à¤¨à¤µà¤®à¥à¤¬à¤°_à¤¦à¤¿à¤¸à¤®à¥à¤¬à¤°'.split('_'),
            monthsShort : 'à¤œà¤¨._à¤«à¤¼à¤°._à¤®à¤¾à¤°à¥à¤_à¤…à¤ªà¥à¤°à¥ˆ._à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²._à¤…à¤—._à¤¸à¤¿à¤¤._à¤…à¤•à¥à¤Ÿà¥‚._à¤¨à¤µ._à¤¦à¤¿à¤¸.'.split('_'),
            weekdays : 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤²à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split('_'),
            weekdaysShort : 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤²_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split('_'),
            weekdaysMin : 'à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶'.split('_'),
            longDateFormat : {
                LT : 'A h:mm à¤¬à¤œà¥‡',
                LTS : 'A h:mm:ss à¤¬à¤œà¥‡',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à¤†à¤œ] LT',
                nextDay : '[à¤•à¤²] LT',
                nextWeek : 'dddd, LT',
                lastDay : '[à¤•à¤²] LT',
                lastWeek : '[à¤ªà¤¿à¤›à¤²à¥‡] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à¤®à¥‡à¤‚',
                past : '%s à¤ªà¤¹à¤²à¥‡',
                s : 'à¤•à¥à¤› à¤¹à¥€ à¤•à¥à¤·à¤£',
                m : 'à¤à¤• à¤®à¤¿à¤¨à¤Ÿ',
                mm : '%d à¤®à¤¿à¤¨à¤Ÿ',
                h : 'à¤à¤• à¤˜à¤‚à¤Ÿà¤¾',
                hh : '%d à¤˜à¤‚à¤Ÿà¥‡',
                d : 'à¤à¤• à¤¦à¤¿à¤¨',
                dd : '%d à¤¦à¤¿à¤¨',
                M : 'à¤à¤• à¤®à¤¹à¥€à¤¨à¥‡',
                MM : '%d à¤®à¤¹à¥€à¤¨à¥‡',
                y : 'à¤à¤• à¤µà¤°à¥à¤·',
                yy : '%d à¤µà¤°à¥à¤·'
            },
            preparse: function (string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            // Hindi notation for meridiems are quite fuzzy in practice. While there exists
            // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
            meridiemParse: /à¤°à¤¾à¤¤|à¤¸à¥à¤¬à¤¹|à¤¦à¥‹à¤ªà¤¹à¤°|à¤¶à¤¾à¤®/,
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'à¤°à¤¾à¤¤') {
                    return hour < 4 ? hour : hour + 12;
                } else if (meridiem === 'à¤¸à¥à¤¬à¤¹') {
                    return hour;
                } else if (meridiem === 'à¤¦à¥‹à¤ªà¤¹à¤°') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === 'à¤¶à¤¾à¤®') {
                    return hour + 12;
                }
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'à¤°à¤¾à¤¤';
                } else if (hour < 10) {
                    return 'à¤¸à¥à¤¬à¤¹';
                } else if (hour < 17) {
                    return 'à¤¦à¥‹à¤ªà¤¹à¤°';
                } else if (hour < 20) {
                    return 'à¤¶à¤¾à¤®';
                } else {
                    return 'à¤°à¤¾à¤¤';
                }
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : hrvatski (hr)
    // author : Bojan MarkoviÄ‡ : https://github.com/bmarkovic

    // based on (sl) translation by Robert SedovÅ¡ek

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + ' ';
            switch (key) {
                case 'm':
                    return withoutSuffix ? 'jedna minuta' : 'jedne minute';
                case 'mm':
                    if (number === 1) {
                        result += 'minuta';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'minute';
                    } else {
                        result += 'minuta';
                    }
                    return result;
                case 'h':
                    return withoutSuffix ? 'jedan sat' : 'jednog sata';
                case 'hh':
                    if (number === 1) {
                        result += 'sat';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'sata';
                    } else {
                        result += 'sati';
                    }
                    return result;
                case 'dd':
                    if (number === 1) {
                        result += 'dan';
                    } else {
                        result += 'dana';
                    }
                    return result;
                case 'MM':
                    if (number === 1) {
                        result += 'mjesec';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'mjeseca';
                    } else {
                        result += 'mjeseci';
                    }
                    return result;
                case 'yy':
                    if (number === 1) {
                        result += 'godina';
                    } else if (number === 2 || number === 3 || number === 4) {
                        result += 'godine';
                    } else {
                        result += 'godina';
                    }
                    return result;
            }
        }

        return moment.defineLocale('hr', {
            months : 'sjeÄanj_veljaÄa_oÅ¾ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
            monthsShort : 'sje._vel._oÅ¾u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
            weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota'.split('_'),
            weekdaysShort : 'ned._pon._uto._sri._Äet._pet._sub.'.split('_'),
            weekdaysMin : 'ne_po_ut_sr_Äe_pe_su'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD. MM. YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay  : '[danas u] LT',
                nextDay  : '[sutra u] LT',

                nextWeek : function () {
                    switch (this.day()) {
                        case 0:
                            return '[u] [nedjelju] [u] LT';
                        case 3:
                            return '[u] [srijedu] [u] LT';
                        case 6:
                            return '[u] [subotu] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[u] dddd [u] LT';
                    }
                },
                lastDay  : '[juÄer u] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                            return '[proÅ¡lu] dddd [u] LT';
                        case 6:
                            return '[proÅ¡le] [subote] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[proÅ¡li] dddd [u] LT';
                    }
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'za %s',
                past   : 'prije %s',
                s      : 'par sekundi',
                m      : translate,
                mm     : translate,
                h      : translate,
                hh     : translate,
                d      : 'dan',
                dd     : translate,
                M      : 'mjesec',
                MM     : translate,
                y      : 'godinu',
                yy     : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : hungarian (hu)
    // author : Adam Brunner : https://github.com/adambrunner

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var weekEndings = 'vasĂ¡rnap hĂ©tfÅ‘n kedden szerdĂ¡n csĂ¼tĂ¶rtĂ¶kĂ¶n pĂ©nteken szombaton'.split(' ');

        function translate(number, withoutSuffix, key, isFuture) {
            var num = number,
                suffix;

            switch (key) {
                case 's':
                    return (isFuture || withoutSuffix) ? 'nĂ©hĂ¡ny mĂ¡sodperc' : 'nĂ©hĂ¡ny mĂ¡sodperce';
                case 'm':
                    return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
                case 'mm':
                    return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
                case 'h':
                    return 'egy' + (isFuture || withoutSuffix ? ' Ă³ra' : ' Ă³rĂ¡ja');
                case 'hh':
                    return num + (isFuture || withoutSuffix ? ' Ă³ra' : ' Ă³rĂ¡ja');
                case 'd':
                    return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
                case 'dd':
                    return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
                case 'M':
                    return 'egy' + (isFuture || withoutSuffix ? ' hĂ³nap' : ' hĂ³napja');
                case 'MM':
                    return num + (isFuture || withoutSuffix ? ' hĂ³nap' : ' hĂ³napja');
                case 'y':
                    return 'egy' + (isFuture || withoutSuffix ? ' Ă©v' : ' Ă©ve');
                case 'yy':
                    return num + (isFuture || withoutSuffix ? ' Ă©v' : ' Ă©ve');
            }

            return '';
        }

        function week(isFuture) {
            return (isFuture ? '' : '[mĂºlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
        }

        return moment.defineLocale('hu', {
            months : 'januĂ¡r_februĂ¡r_mĂ¡rcius_Ă¡prilis_mĂ¡jus_jĂºnius_jĂºlius_augusztus_szeptember_oktĂ³ber_november_december'.split('_'),
            monthsShort : 'jan_feb_mĂ¡rc_Ă¡pr_mĂ¡j_jĂºn_jĂºl_aug_szept_okt_nov_dec'.split('_'),
            weekdays : 'vasĂ¡rnap_hĂ©tfÅ‘_kedd_szerda_csĂ¼tĂ¶rtĂ¶k_pĂ©ntek_szombat'.split('_'),
            weekdaysShort : 'vas_hĂ©t_kedd_sze_csĂ¼t_pĂ©n_szo'.split('_'),
            weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'YYYY.MM.DD.',
                LL : 'YYYY. MMMM D.',
                LLL : 'YYYY. MMMM D., LT',
                LLLL : 'YYYY. MMMM D., dddd LT'
            },
            meridiemParse: /de|du/i,
            isPM: function (input) {
                return input.charAt(1).toLowerCase() === 'u';
            },
            meridiem : function (hours, minutes, isLower) {
                if (hours < 12) {
                    return isLower === true ? 'de' : 'DE';
                } else {
                    return isLower === true ? 'du' : 'DU';
                }
            },
            calendar : {
                sameDay : '[ma] LT[-kor]',
                nextDay : '[holnap] LT[-kor]',
                nextWeek : function () {
                    return week.call(this, true);
                },
                lastDay : '[tegnap] LT[-kor]',
                lastWeek : function () {
                    return week.call(this, false);
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s mĂºlva',
                past : '%s',
                s : translate,
                m : translate,
                mm : translate,
                h : translate,
                hh : translate,
                d : translate,
                dd : translate,
                M : translate,
                MM : translate,
                y : translate,
                yy : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Armenian (hy-am)
    // author : Armendarabyan : https://github.com/armendarabyan

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function monthsCaseReplace(m, format) {
            var months = {
                    'nominative': 'Ơ°Ơ¸Ö‚Ơ¶Ơ¾Ơ¡Ö€_ÖƒƠ¥Ơ¿Ö€Ơ¾Ơ¡Ö€_Ơ´Ơ¡Ö€Ơ¿_Ơ¡ƠºÖ€Ơ«Ơ¬_Ơ´Ơ¡ƠµƠ«Ơ½_Ơ°Ơ¸Ö‚Ơ¶Ơ«Ơ½_Ơ°Ơ¸Ö‚Ơ¬Ơ«Ơ½_Ö…Ơ£Ơ¸Ơ½Ơ¿Ơ¸Ơ½_Ơ½Ơ¥ƠºƠ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€_Ơ°Ơ¸Ơ¯Ơ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€_Ơ¶Ơ¸ƠµƠ¥Ơ´Ơ¢Ơ¥Ö€_Ơ¤Ơ¥Ơ¯Ơ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€'.split('_'),
                    'accusative': 'Ơ°Ơ¸Ö‚Ơ¶Ơ¾Ơ¡Ö€Ơ«_ÖƒƠ¥Ơ¿Ö€Ơ¾Ơ¡Ö€Ơ«_Ơ´Ơ¡Ö€Ơ¿Ơ«_Ơ¡ƠºÖ€Ơ«Ơ¬Ơ«_Ơ´Ơ¡ƠµƠ«Ơ½Ơ«_Ơ°Ơ¸Ö‚Ơ¶Ơ«Ơ½Ơ«_Ơ°Ơ¸Ö‚Ơ¬Ơ«Ơ½Ơ«_Ö…Ơ£Ơ¸Ơ½Ơ¿Ơ¸Ơ½Ơ«_Ơ½Ơ¥ƠºƠ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€Ơ«_Ơ°Ơ¸Ơ¯Ơ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€Ơ«_Ơ¶Ơ¸ƠµƠ¥Ơ´Ơ¢Ơ¥Ö€Ơ«_Ơ¤Ơ¥Ơ¯Ơ¿Ơ¥Ơ´Ơ¢Ơ¥Ö€Ơ«'.split('_')
                },

                nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return months[nounCase][m.month()];
        }

        function monthsShortCaseReplace(m, format) {
            var monthsShort = 'Ơ°Ơ¶Ơ¾_ÖƒƠ¿Ö€_Ơ´Ö€Ơ¿_Ơ¡ƠºÖ€_Ơ´ƠµƠ½_Ơ°Ơ¶Ơ½_Ơ°Ơ¬Ơ½_Ö…Ơ£Ơ½_Ơ½ƠºƠ¿_Ơ°Ơ¯Ơ¿_Ơ¶Ơ´Ơ¢_Ơ¤Ơ¯Ơ¿'.split('_');

            return monthsShort[m.month()];
        }

        function weekdaysCaseReplace(m, format) {
            var weekdays = 'Ơ¯Ơ«Ö€Ơ¡Ơ¯Ơ«_Ơ¥Ö€Ơ¯Ơ¸Ö‚Ơ·Ơ¡Ơ¢Ơ©Ơ«_Ơ¥Ö€Ơ¥Ö„Ơ·Ơ¡Ơ¢Ơ©Ơ«_Ơ¹Ơ¸Ö€Ơ¥Ö„Ơ·Ơ¡Ơ¢Ơ©Ơ«_Ơ°Ơ«Ơ¶Ơ£Ơ·Ơ¡Ơ¢Ơ©Ơ«_Ơ¸Ö‚Ö€Ơ¢Ơ¡Ơ©_Ơ·Ơ¡Ơ¢Ơ¡Ơ©'.split('_');

            return weekdays[m.day()];
        }

        return moment.defineLocale('hy-am', {
            months : monthsCaseReplace,
            monthsShort : monthsShortCaseReplace,
            weekdays : weekdaysCaseReplace,
            weekdaysShort : 'Ơ¯Ö€Ơ¯_Ơ¥Ö€Ơ¯_Ơ¥Ö€Ö„_Ơ¹Ö€Ö„_Ơ°Ơ¶Ơ£_Ơ¸Ö‚Ö€Ơ¢_Ơ·Ơ¢Ơ©'.split('_'),
            weekdaysMin : 'Ơ¯Ö€Ơ¯_Ơ¥Ö€Ơ¯_Ơ¥Ö€Ö„_Ơ¹Ö€Ö„_Ơ°Ơ¶Ơ£_Ơ¸Ö‚Ö€Ơ¢_Ơ·Ơ¢Ơ©'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY Ơ©.',
                LLL : 'D MMMM YYYY Ơ©., LT',
                LLLL : 'dddd, D MMMM YYYY Ơ©., LT'
            },
            calendar : {
                sameDay: '[Ơ¡ƠµƠ½Ö…Ö€] LT',
                nextDay: '[Ơ¾Ơ¡Ơ²Ơ¨] LT',
                lastDay: '[Ơ¥Ö€Ơ¥Ơ¯] LT',
                nextWeek: function () {
                    return 'dddd [Ö…Ö€Ơ¨ ƠªƠ¡Ơ´Ơ¨] LT';
                },
                lastWeek: function () {
                    return '[Ơ¡Ơ¶ÖƠ¡Ơ®] dddd [Ö…Ö€Ơ¨ ƠªƠ¡Ơ´Ơ¨] LT';
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : '%s Ơ°Ơ¥Ơ¿Ơ¸',
                past : '%s Ơ¡Ơ¼Ơ¡Ơ»',
                s : 'Ơ´Ơ« Ö„Ơ¡Ơ¶Ơ« Ơ¾Ơ¡ƠµÖ€Ơ¯ƠµƠ¡Ơ¶',
                m : 'Ö€Ơ¸ƠºƠ¥',
                mm : '%d Ö€Ơ¸ƠºƠ¥',
                h : 'ƠªƠ¡Ơ´',
                hh : '%d ƠªƠ¡Ơ´',
                d : 'Ö…Ö€',
                dd : '%d Ö…Ö€',
                M : 'Ơ¡Ơ´Ơ«Ơ½',
                MM : '%d Ơ¡Ơ´Ơ«Ơ½',
                y : 'Ơ¿Ơ¡Ö€Ơ«',
                yy : '%d Ơ¿Ơ¡Ö€Ơ«'
            },

            meridiemParse: /Ơ£Ơ«Ơ·Ơ¥Ö€Ơ¾Ơ¡|Ơ¡Ơ¼Ơ¡Ơ¾Ơ¸Ơ¿Ơ¾Ơ¡|ÖƠ¥Ö€Ơ¥Ơ¯Ơ¾Ơ¡|Ơ¥Ö€Ơ¥Ơ¯Ơ¸ƠµƠ¡Ơ¶/,
            isPM: function (input) {
                return /^(ÖƠ¥Ö€Ơ¥Ơ¯Ơ¾Ơ¡|Ơ¥Ö€Ơ¥Ơ¯Ơ¸ƠµƠ¡Ơ¶)$/.test(input);
            },
            meridiem : function (hour) {
                if (hour < 4) {
                    return 'Ơ£Ơ«Ơ·Ơ¥Ö€Ơ¾Ơ¡';
                } else if (hour < 12) {
                    return 'Ơ¡Ơ¼Ơ¡Ơ¾Ơ¸Ơ¿Ơ¾Ơ¡';
                } else if (hour < 17) {
                    return 'ÖƠ¥Ö€Ơ¥Ơ¯Ơ¾Ơ¡';
                } else {
                    return 'Ơ¥Ö€Ơ¥Ơ¯Ơ¸ƠµƠ¡Ơ¶';
                }
            },

            ordinalParse: /\d{1,2}|\d{1,2}-(Ơ«Ơ¶|Ö€Ơ¤)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'DDD':
                    case 'w':
                    case 'W':
                    case 'DDDo':
                        if (number === 1) {
                            return number + '-Ơ«Ơ¶';
                        }
                        return number + '-Ö€Ơ¤';
                    default:
                        return number;
                }
            },

            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Bahasa Indonesia (id)
    // author : Mohammad Satrio Utomo : https://github.com/tyok
    // reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('id', {
            months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
            monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
            weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
            weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
            weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat : {
                LT : 'HH.mm',
                LTS : 'LT.ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY [pukul] LT',
                LLLL : 'dddd, D MMMM YYYY [pukul] LT'
            },
            meridiemParse: /pagi|siang|sore|malam/,
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'pagi') {
                    return hour;
                } else if (meridiem === 'siang') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'sore' || meridiem === 'malam') {
                    return hour + 12;
                }
            },
            meridiem : function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'pagi';
                } else if (hours < 15) {
                    return 'siang';
                } else if (hours < 19) {
                    return 'sore';
                } else {
                    return 'malam';
                }
            },
            calendar : {
                sameDay : '[Hari ini pukul] LT',
                nextDay : '[Besok pukul] LT',
                nextWeek : 'dddd [pukul] LT',
                lastDay : '[Kemarin pukul] LT',
                lastWeek : 'dddd [lalu pukul] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'dalam %s',
                past : '%s yang lalu',
                s : 'beberapa detik',
                m : 'semenit',
                mm : '%d menit',
                h : 'sejam',
                hh : '%d jam',
                d : 'sehari',
                dd : '%d hari',
                M : 'sebulan',
                MM : '%d bulan',
                y : 'setahun',
                yy : '%d tahun'
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : icelandic (is)
    // author : Hinrik Ă–rn SigurĂ°sson : https://github.com/hinrik

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function plural(n) {
            if (n % 100 === 11) {
                return true;
            } else if (n % 10 === 1) {
                return false;
            }
            return true;
        }

        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + ' ';
            switch (key) {
                case 's':
                    return withoutSuffix || isFuture ? 'nokkrar sekĂºndur' : 'nokkrum sekĂºndum';
                case 'm':
                    return withoutSuffix ? 'mĂ­nĂºta' : 'mĂ­nĂºtu';
                case 'mm':
                    if (plural(number)) {
                        return result + (withoutSuffix || isFuture ? 'mĂ­nĂºtur' : 'mĂ­nĂºtum');
                    } else if (withoutSuffix) {
                        return result + 'mĂ­nĂºta';
                    }
                    return result + 'mĂ­nĂºtu';
                case 'hh':
                    if (plural(number)) {
                        return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
                    }
                    return result + 'klukkustund';
                case 'd':
                    if (withoutSuffix) {
                        return 'dagur';
                    }
                    return isFuture ? 'dag' : 'degi';
                case 'dd':
                    if (plural(number)) {
                        if (withoutSuffix) {
                            return result + 'dagar';
                        }
                        return result + (isFuture ? 'daga' : 'dĂ¶gum');
                    } else if (withoutSuffix) {
                        return result + 'dagur';
                    }
                    return result + (isFuture ? 'dag' : 'degi');
                case 'M':
                    if (withoutSuffix) {
                        return 'mĂ¡nuĂ°ur';
                    }
                    return isFuture ? 'mĂ¡nuĂ°' : 'mĂ¡nuĂ°i';
                case 'MM':
                    if (plural(number)) {
                        if (withoutSuffix) {
                            return result + 'mĂ¡nuĂ°ir';
                        }
                        return result + (isFuture ? 'mĂ¡nuĂ°i' : 'mĂ¡nuĂ°um');
                    } else if (withoutSuffix) {
                        return result + 'mĂ¡nuĂ°ur';
                    }
                    return result + (isFuture ? 'mĂ¡nuĂ°' : 'mĂ¡nuĂ°i');
                case 'y':
                    return withoutSuffix || isFuture ? 'Ă¡r' : 'Ă¡ri';
                case 'yy':
                    if (plural(number)) {
                        return result + (withoutSuffix || isFuture ? 'Ă¡r' : 'Ă¡rum');
                    }
                    return result + (withoutSuffix || isFuture ? 'Ă¡r' : 'Ă¡ri');
            }
        }

        return moment.defineLocale('is', {
            months : 'janĂºar_febrĂºar_mars_aprĂ­l_maĂ­_jĂºnĂ­_jĂºlĂ­_Ă¡gĂºst_september_oktĂ³ber_nĂ³vember_desember'.split('_'),
            monthsShort : 'jan_feb_mar_apr_maĂ­_jĂºn_jĂºl_Ă¡gĂº_sep_okt_nĂ³v_des'.split('_'),
            weekdays : 'sunnudagur_mĂ¡nudagur_Ă¾riĂ°judagur_miĂ°vikudagur_fimmtudagur_fĂ¶studagur_laugardagur'.split('_'),
            weekdaysShort : 'sun_mĂ¡n_Ă¾ri_miĂ°_fim_fĂ¶s_lau'.split('_'),
            weekdaysMin : 'Su_MĂ¡_Ăr_Mi_Fi_FĂ¶_La'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY [kl.] LT',
                LLLL : 'dddd, D. MMMM YYYY [kl.] LT'
            },
            calendar : {
                sameDay : '[Ă­ dag kl.] LT',
                nextDay : '[Ă¡ morgun kl.] LT',
                nextWeek : 'dddd [kl.] LT',
                lastDay : '[Ă­ gĂ¦r kl.] LT',
                lastWeek : '[sĂ­Ă°asta] dddd [kl.] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'eftir %s',
                past : 'fyrir %s sĂ­Ă°an',
                s : translate,
                m : translate,
                mm : translate,
                h : 'klukkustund',
                hh : translate,
                d : translate,
                dd : translate,
                M : translate,
                MM : translate,
                y : translate,
                yy : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : italian (it)
    // author : Lorenzo : https://github.com/aliem
    // author: Mattia Larentis: https://github.com/nostalgiaz

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('it', {
            months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
            monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
            weekdays : 'Domenica_LunedĂ¬_MartedĂ¬_MercoledĂ¬_GiovedĂ¬_VenerdĂ¬_Sabato'.split('_'),
            weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
            weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Oggi alle] LT',
                nextDay: '[Domani alle] LT',
                nextWeek: 'dddd [alle] LT',
                lastDay: '[Ieri alle] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[la scorsa] dddd [alle] LT';
                        default:
                            return '[lo scorso] dddd [alle] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : function (s) {
                    return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
                },
                past : '%s fa',
                s : 'alcuni secondi',
                m : 'un minuto',
                mm : '%d minuti',
                h : 'un\'ora',
                hh : '%d ore',
                d : 'un giorno',
                dd : '%d giorni',
                M : 'un mese',
                MM : '%d mesi',
                y : 'un anno',
                yy : '%d anni'
            },
            ordinalParse : /\d{1,2}Âº/,
            ordinal: '%dÂº',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : japanese (ja)
    // author : LI Long : https://github.com/baryon

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ja', {
            months : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
            monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
            weekdays : 'æ—¥æ›œæ—¥_æœˆæ›œæ—¥_ç«æ›œæ—¥_æ°´æ›œæ—¥_æœ¨æ›œæ—¥_é‡‘æ›œæ—¥_åœŸæ›œæ—¥'.split('_'),
            weekdaysShort : 'æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ'.split('_'),
            weekdaysMin : 'æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ'.split('_'),
            longDateFormat : {
                LT : 'Ahæ™‚måˆ†',
                LTS : 'LTsç§’',
                L : 'YYYY/MM/DD',
                LL : 'YYYYå¹´MæœˆDæ—¥',
                LLL : 'YYYYå¹´MæœˆDæ—¥LT',
                LLLL : 'YYYYå¹´MæœˆDæ—¥LT dddd'
            },
            meridiemParse: /åˆå‰|åˆå¾Œ/i,
            isPM : function (input) {
                return input === 'åˆå¾Œ';
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 12) {
                    return 'åˆå‰';
                } else {
                    return 'åˆå¾Œ';
                }
            },
            calendar : {
                sameDay : '[ä»æ—¥] LT',
                nextDay : '[æ˜æ—¥] LT',
                nextWeek : '[æ¥é€±]dddd LT',
                lastDay : '[æ˜¨æ—¥] LT',
                lastWeek : '[å‰é€±]dddd LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%så¾Œ',
                past : '%så‰',
                s : 'æ•°ç§’',
                m : '1åˆ†',
                mm : '%dåˆ†',
                h : '1æ™‚é–“',
                hh : '%dæ™‚é–“',
                d : '1æ—¥',
                dd : '%dæ—¥',
                M : '1ăƒ¶æœˆ',
                MM : '%dăƒ¶æœˆ',
                y : '1å¹´',
                yy : '%då¹´'
            }
        });
    }));
    // moment.js locale configuration
    // locale : Georgian (ka)
    // author : Irakli Janiashvili : https://github.com/irakli-janiashvili

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function monthsCaseReplace(m, format) {
            var months = {
                    'nominative': 'áƒ˜áƒáƒœáƒ•áƒáƒ áƒ˜_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒáƒ˜_áƒ›áƒáƒ áƒ¢áƒ˜_áƒáƒáƒ áƒ˜áƒáƒ˜_áƒ›áƒáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒáƒ˜áƒ¡áƒ˜_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ˜_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜'.split('_'),
                    'accusative': 'áƒ˜áƒáƒœáƒ•áƒáƒ áƒ¡_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒáƒ¡_áƒ›áƒáƒ áƒ¢áƒ¡_áƒáƒáƒ áƒ˜áƒáƒ˜áƒ¡_áƒ›áƒáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ¡_áƒ˜áƒ•áƒáƒ˜áƒ¡áƒ¡_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ¡_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ¡_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ¡'.split('_')
                },

                nounCase = (/D[oD] *MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return months[nounCase][m.month()];
        }

        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                    'nominative': 'áƒ™áƒ•áƒ˜áƒ áƒ_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ˜_áƒ¨áƒáƒ‘áƒáƒ—áƒ˜'.split('_'),
                    'accusative': 'áƒ™áƒ•áƒ˜áƒ áƒáƒ¡_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ¡_áƒáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ¡_áƒ¨áƒáƒ‘áƒáƒ—áƒ¡'.split('_')
                },

                nounCase = (/(áƒ¬áƒ˜áƒœáƒ|áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’)/).test(format) ?
                    'accusative' :
                    'nominative';

            return weekdays[nounCase][m.day()];
        }

        return moment.defineLocale('ka', {
            months : monthsCaseReplace,
            monthsShort : 'áƒ˜áƒáƒœ_áƒ—áƒ”áƒ‘_áƒ›áƒáƒ _áƒáƒáƒ _áƒ›áƒáƒ˜_áƒ˜áƒ•áƒœ_áƒ˜áƒ•áƒ_áƒáƒ’áƒ•_áƒ¡áƒ”áƒ¥_áƒáƒ¥áƒ¢_áƒœáƒáƒ”_áƒ“áƒ”áƒ™'.split('_'),
            weekdays : weekdaysCaseReplace,
            weekdaysShort : 'áƒ™áƒ•áƒ˜_áƒáƒ áƒ¨_áƒ¡áƒáƒ›_áƒáƒ—áƒ®_áƒ®áƒ£áƒ—_áƒáƒáƒ _áƒ¨áƒáƒ‘'.split('_'),
            weekdaysMin : 'áƒ™áƒ•_áƒáƒ _áƒ¡áƒ_áƒáƒ—_áƒ®áƒ£_áƒáƒ_áƒ¨áƒ'.split('_'),
            longDateFormat : {
                LT : 'h:mm A',
                LTS : 'h:mm:ss A',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[áƒ“áƒ¦áƒ”áƒ¡] LT[-áƒ–áƒ”]',
                nextDay : '[áƒ®áƒ•áƒáƒ] LT[-áƒ–áƒ”]',
                lastDay : '[áƒ’áƒ£áƒ¨áƒ˜áƒœ] LT[-áƒ–áƒ”]',
                nextWeek : '[áƒ¨áƒ”áƒ›áƒ“áƒ”áƒ’] dddd LT[-áƒ–áƒ”]',
                lastWeek : '[áƒ¬áƒ˜áƒœáƒ] dddd LT-áƒ–áƒ”',
                sameElse : 'L'
            },
            relativeTime : {
                future : function (s) {
                    return (/(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ¬áƒ”áƒáƒ˜)/).test(s) ?
                        s.replace(/áƒ˜$/, 'áƒ¨áƒ˜') :
                    s + 'áƒ¨áƒ˜';
                },
                past : function (s) {
                    if ((/(áƒ¬áƒáƒ›áƒ˜|áƒ¬áƒ£áƒ—áƒ˜|áƒ¡áƒáƒáƒ—áƒ˜|áƒ“áƒ¦áƒ”|áƒ—áƒ•áƒ”)/).test(s)) {
                        return s.replace(/(áƒ˜|áƒ”)$/, 'áƒ˜áƒ¡ áƒ¬áƒ˜áƒœ');
                    }
                    if ((/áƒ¬áƒ”áƒáƒ˜/).test(s)) {
                        return s.replace(/áƒ¬áƒ”áƒáƒ˜$/, 'áƒ¬áƒáƒ˜áƒ¡ áƒ¬áƒ˜áƒœ');
                    }
                },
                s : 'áƒ áƒáƒ›áƒ“áƒ”áƒœáƒ˜áƒ›áƒ” áƒ¬áƒáƒ›áƒ˜',
                m : 'áƒ¬áƒ£áƒ—áƒ˜',
                mm : '%d áƒ¬áƒ£áƒ—áƒ˜',
                h : 'áƒ¡áƒáƒáƒ—áƒ˜',
                hh : '%d áƒ¡áƒáƒáƒ—áƒ˜',
                d : 'áƒ“áƒ¦áƒ”',
                dd : '%d áƒ“áƒ¦áƒ”',
                M : 'áƒ—áƒ•áƒ”',
                MM : '%d áƒ—áƒ•áƒ”',
                y : 'áƒ¬áƒ”áƒáƒ˜',
                yy : '%d áƒ¬áƒ”áƒáƒ˜'
            },
            ordinalParse: /0|1-áƒáƒ˜|áƒ›áƒ”-\d{1,2}|\d{1,2}-áƒ”/,
            ordinal : function (number) {
                if (number === 0) {
                    return number;
                }

                if (number === 1) {
                    return number + '-áƒáƒ˜';
                }

                if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
                    return 'áƒ›áƒ”-' + number;
                }

                return number + '-áƒ”';
            },
            week : {
                dow : 1,
                doy : 7
            }
        });
    }));
    // moment.js locale configuration
    // locale : khmer (km)
    // author : Kruy Vanna : https://github.com/kruyvanna

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('km', {
            months: 'á˜á€áá¶_á€á»á˜áŸ’á—áŸˆ_á˜á·á“á¶_á˜áŸáŸá¶_á§áŸá—á¶_á˜á·áá»á“á¶_á€á€áŸ’á€áá¶_áŸá¸á á¶_á€á‰áŸ’á‰á¶_áá»á›á¶_áœá·á…áŸ’á†á·á€á¶_á’áŸ’á“á¼'.split('_'),
            monthsShort: 'á˜á€áá¶_á€á»á˜áŸ’á—áŸˆ_á˜á·á“á¶_á˜áŸáŸá¶_á§áŸá—á¶_á˜á·áá»á“á¶_á€á€áŸ’á€áá¶_áŸá¸á á¶_á€á‰áŸ’á‰á¶_áá»á›á¶_áœá·á…áŸ’á†á·á€á¶_á’áŸ’á“á¼'.split('_'),
            weekdays: 'á¢á¶á‘á·ááŸ’á™_á…áŸá“áŸ’á‘_á¢á„áŸ’á‚á¶á_á–á»á’_á–áŸ’áá áŸáŸ’á”áá·áŸ_áŸá»á€áŸ’á_áŸáŸ…ááŸ'.split('_'),
            weekdaysShort: 'á¢á¶á‘á·ááŸ’á™_á…áŸá“áŸ’á‘_á¢á„áŸ’á‚á¶á_á–á»á’_á–áŸ’áá áŸáŸ’á”áá·áŸ_áŸá»á€áŸ’á_áŸáŸ…ááŸ'.split('_'),
            weekdaysMin: 'á¢á¶á‘á·ááŸ’á™_á…áŸá“áŸ’á‘_á¢á„áŸ’á‚á¶á_á–á»á’_á–áŸ’áá áŸáŸ’á”áá·áŸ_áŸá»á€áŸ’á_áŸáŸ…ááŸ'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS : 'LT:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY LT',
                LLLL: 'dddd, D MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[ááŸ’á„áŸƒá“áŸˆ á˜áŸ‰áŸ„á„] LT',
                nextDay: '[áŸáŸ’á¢áŸ‚á€ á˜áŸ‰áŸ„á„] LT',
                nextWeek: 'dddd [á˜áŸ‰áŸ„á„] LT',
                lastDay: '[á˜áŸ’áŸá·á›á˜á·á‰ á˜áŸ‰áŸ„á„] LT',
                lastWeek: 'dddd [áŸá”áŸ’áá¶á áŸá˜á»á“] [á˜áŸ‰áŸ„á„] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: '%sá‘áŸ€á',
                past: '%sá˜á»á“',
                s: 'á”áŸ‰á»á“áŸ’á˜á¶á“áœá·á“á¶á‘á¸',
                m: 'á˜á½á™á“á¶á‘á¸',
                mm: '%d á“á¶á‘á¸',
                h: 'á˜á½á™á˜áŸ‰áŸ„á„',
                hh: '%d á˜áŸ‰áŸ„á„',
                d: 'á˜á½á™ááŸ’á„áŸƒ',
                dd: '%d ááŸ’á„áŸƒ',
                M: 'á˜á½á™ááŸ‚',
                MM: '%d ááŸ‚',
                y: 'á˜á½á™á†áŸ’á“á¶áŸ†',
                yy: '%d á†áŸ’á“á¶áŸ†'
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4 // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : korean (ko)
    //
    // authors
    //
    // - Kyungwook, Park : https://github.com/kyungw00k
    // - Jeeeyul Lee <jeeeyul@gmail.com>
    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ko', {
            months : '1́›”_2́›”_3́›”_4́›”_5́›”_6́›”_7́›”_8́›”_9́›”_10́›”_11́›”_12́›”'.split('_'),
            monthsShort : '1́›”_2́›”_3́›”_4́›”_5́›”_6́›”_7́›”_8́›”_9́›”_10́›”_11́›”_12́›”'.split('_'),
            weekdays : '́¼́”́¼_́›”́”́¼_í™”́”́¼_́ˆ˜́”́¼_ëª©́”́¼_ê¸ˆ́”́¼_í† ́”́¼'.split('_'),
            weekdaysShort : '́¼_́›”_í™”_́ˆ˜_ëª©_ê¸ˆ_í† '.split('_'),
            weekdaysMin : '́¼_́›”_í™”_́ˆ˜_ëª©_ê¸ˆ_í† '.split('_'),
            longDateFormat : {
                LT : 'A h́‹œ më¶„',
                LTS : 'A h́‹œ më¶„ ś´ˆ',
                L : 'YYYY.MM.DD',
                LL : 'YYYYë…„ MMMM D́¼',
                LLL : 'YYYYë…„ MMMM D́¼ LT',
                LLLL : 'YYYYë…„ MMMM D́¼ dddd LT'
            },
            calendar : {
                sameDay : '́˜¤ë˜ LT',
                nextDay : 'ë‚´́¼ LT',
                nextWeek : 'dddd LT',
                lastDay : '́–´́ œ LT',
                lastWeek : '́§€ë‚œ́£¼ dddd LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s í›„',
                past : '%s ́ „',
                s : 'ëª‡́´ˆ',
                ss : '%d́´ˆ',
                m : '́¼ë¶„',
                mm : '%dë¶„',
                h : 'í•œ́‹œê°„',
                hh : '%d́‹œê°„',
                d : 'í•˜ë£¨',
                dd : '%d́¼',
                M : 'í•œë‹¬',
                MM : '%dë‹¬',
                y : '́¼ë…„',
                yy : '%dë…„'
            },
            ordinalParse : /\d{1,2}́¼/,
            ordinal : '%d́¼',
            meridiemParse : /́˜¤́ „|́˜¤í›„/,
            isPM : function (token) {
                return token === '́˜¤í›„';
            },
            meridiem : function (hour, minute, isUpper) {
                return hour < 12 ? '́˜¤́ „' : '́˜¤í›„';
            }
        });
    }));
    // moment.js locale configuration
    // locale : Luxembourgish (lb)
    // author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz

    // Note: Luxembourgish has a very particular phonological rule ('Eifeler Regel') that causes the
    // deletion of the final 'n' in certain contexts. That's what the 'eifelerRegelAppliesToWeekday'
    // and 'eifelerRegelAppliesToNumber' methods are meant for

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function processRelativeTime(number, withoutSuffix, key, isFuture) {
            var format = {
                'm': ['eng Minutt', 'enger Minutt'],
                'h': ['eng Stonn', 'enger Stonn'],
                'd': ['een Dag', 'engem Dag'],
                'M': ['ee Mount', 'engem Mount'],
                'y': ['ee Joer', 'engem Joer']
            };
            return withoutSuffix ? format[key][0] : format[key][1];
        }

        function processFutureTime(string) {
            var number = string.substr(0, string.indexOf(' '));
            if (eifelerRegelAppliesToNumber(number)) {
                return 'a ' + string;
            }
            return 'an ' + string;
        }

        function processPastTime(string) {
            var number = string.substr(0, string.indexOf(' '));
            if (eifelerRegelAppliesToNumber(number)) {
                return 'viru ' + string;
            }
            return 'virun ' + string;
        }

        /**
         * Returns true if the word before the given number loses the '-n' ending.
         * e.g. 'an 10 Deeg' but 'a 5 Deeg'
         *
         * @param number {integer}
         * @returns {boolean}
         */
        function eifelerRegelAppliesToNumber(number) {
            number = parseInt(number, 10);
            if (isNaN(number)) {
                return false;
            }
            if (number < 0) {
                // Negative Number --> always true
                return true;
            } else if (number < 10) {
                // Only 1 digit
                if (4 <= number && number <= 7) {
                    return true;
                }
                return false;
            } else if (number < 100) {
                // 2 digits
                var lastDigit = number % 10, firstDigit = number / 10;
                if (lastDigit === 0) {
                    return eifelerRegelAppliesToNumber(firstDigit);
                }
                return eifelerRegelAppliesToNumber(lastDigit);
            } else if (number < 10000) {
                // 3 or 4 digits --> recursively check first digit
                while (number >= 10) {
                    number = number / 10;
                }
                return eifelerRegelAppliesToNumber(number);
            } else {
                // Anything larger than 4 digits: recursively check first n-3 digits
                number = number / 1000;
                return eifelerRegelAppliesToNumber(number);
            }
        }

        return moment.defineLocale('lb', {
            months: 'Januar_Februar_MĂ¤erz_AbrĂ«ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays: 'Sonndeg_MĂ©indeg_DĂ«nschdeg_MĂ«ttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
            weekdaysShort: 'So._MĂ©._DĂ«._MĂ«._Do._Fr._Sa.'.split('_'),
            weekdaysMin: 'So_MĂ©_DĂ«_MĂ«_Do_Fr_Sa'.split('_'),
            longDateFormat: {
                LT: 'H:mm [Auer]',
                LTS: 'H:mm:ss [Auer]',
                L: 'DD.MM.YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY LT',
                LLLL: 'dddd, D. MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[Haut um] LT',
                sameElse: 'L',
                nextDay: '[Muer um] LT',
                nextWeek: 'dddd [um] LT',
                lastDay: '[GĂ«schter um] LT',
                lastWeek: function () {
                    // Different date string for 'DĂ«nschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
                    switch (this.day()) {
                        case 2:
                        case 4:
                            return '[Leschten] dddd [um] LT';
                        default:
                            return '[Leschte] dddd [um] LT';
                    }
                }
            },
            relativeTime : {
                future : processFutureTime,
                past : processPastTime,
                s : 'e puer Sekonnen',
                m : processRelativeTime,
                mm : '%d Minutten',
                h : processRelativeTime,
                hh : '%d Stonnen',
                d : processRelativeTime,
                dd : '%d Deeg',
                M : processRelativeTime,
                MM : '%d MĂ©int',
                y : processRelativeTime,
                yy : '%d Joer'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal: '%d.',
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Lithuanian (lt)
    // author : Mindaugas MozÅ«ras : https://github.com/mmozuras

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var units = {
                'm' : 'minutÄ—_minutÄ—s_minutÄ™',
                'mm': 'minutÄ—s_minuÄiÅ³_minutes',
                'h' : 'valanda_valandos_valandÄ…',
                'hh': 'valandos_valandÅ³_valandas',
                'd' : 'diena_dienos_dienÄ…',
                'dd': 'dienos_dienÅ³_dienas',
                'M' : 'mÄ—nuo_mÄ—nesio_mÄ—nesÄ¯',
                'MM': 'mÄ—nesiai_mÄ—nesiÅ³_mÄ—nesius',
                'y' : 'metai_metÅ³_metus',
                'yy': 'metai_metÅ³_metus'
            },
            weekDays = 'sekmadienis_pirmadienis_antradienis_treÄiadienis_ketvirtadienis_penktadienis_Å¡eÅ¡tadienis'.split('_');

        function translateSeconds(number, withoutSuffix, key, isFuture) {
            if (withoutSuffix) {
                return 'kelios sekundÄ—s';
            } else {
                return isFuture ? 'keliÅ³ sekundÅ¾iÅ³' : 'kelias sekundes';
            }
        }

        function translateSingular(number, withoutSuffix, key, isFuture) {
            return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
        }

        function special(number) {
            return number % 10 === 0 || (number > 10 && number < 20);
        }

        function forms(key) {
            return units[key].split('_');
        }

        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + ' ';
            if (number === 1) {
                return result + translateSingular(number, withoutSuffix, key[0], isFuture);
            } else if (withoutSuffix) {
                return result + (special(number) ? forms(key)[1] : forms(key)[0]);
            } else {
                if (isFuture) {
                    return result + forms(key)[1];
                } else {
                    return result + (special(number) ? forms(key)[1] : forms(key)[2]);
                }
            }
        }

        function relativeWeekDay(moment, format) {
            var nominative = format.indexOf('dddd HH:mm') === -1,
                weekDay = weekDays[moment.day()];

            return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + 'Ä¯';
        }

        return moment.defineLocale('lt', {
            months : 'sausio_vasario_kovo_balandÅ¾io_geguÅ¾Ä—s_birÅ¾elio_liepos_rugpjÅ«Äio_rugsÄ—jo_spalio_lapkriÄio_gruodÅ¾io'.split('_'),
            monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
            weekdays : relativeWeekDay,
            weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_Å eÅ¡'.split('_'),
            weekdaysMin : 'S_P_A_T_K_Pn_Å '.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'YYYY-MM-DD',
                LL : 'YYYY [m.] MMMM D [d.]',
                LLL : 'YYYY [m.] MMMM D [d.], LT [val.]',
                LLLL : 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
                l : 'YYYY-MM-DD',
                ll : 'YYYY [m.] MMMM D [d.]',
                lll : 'YYYY [m.] MMMM D [d.], LT [val.]',
                llll : 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
            },
            calendar : {
                sameDay : '[Å iandien] LT',
                nextDay : '[Rytoj] LT',
                nextWeek : 'dddd LT',
                lastDay : '[Vakar] LT',
                lastWeek : '[PraÄ—jusÄ¯] dddd LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'po %s',
                past : 'prieÅ¡ %s',
                s : translateSeconds,
                m : translateSingular,
                mm : translate,
                h : translateSingular,
                hh : translate,
                d : translateSingular,
                dd : translate,
                M : translateSingular,
                MM : translate,
                y : translateSingular,
                yy : translate
            },
            ordinalParse: /\d{1,2}-oji/,
            ordinal : function (number) {
                return number + '-oji';
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : latvian (lv)
    // author : Kristaps Karlsons : https://github.com/skakri

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var units = {
            'mm': 'minÅ«ti_minÅ«tes_minÅ«te_minÅ«tes',
            'hh': 'stundu_stundas_stunda_stundas',
            'dd': 'dienu_dienas_diena_dienas',
            'MM': 'mÄ“nesi_mÄ“neÅ¡us_mÄ“nesis_mÄ“neÅ¡i',
            'yy': 'gadu_gadus_gads_gadi'
        };

        function format(word, number, withoutSuffix) {
            var forms = word.split('_');
            if (withoutSuffix) {
                return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
            } else {
                return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
            }
        }

        function relativeTimeWithPlural(number, withoutSuffix, key) {
            return number + ' ' + format(units[key], number, withoutSuffix);
        }

        return moment.defineLocale('lv', {
            months : 'janvÄris_februÄris_marts_aprÄ«lis_maijs_jÅ«nijs_jÅ«lijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
            monthsShort : 'jan_feb_mar_apr_mai_jÅ«n_jÅ«l_aug_sep_okt_nov_dec'.split('_'),
            weekdays : 'svÄ“tdiena_pirmdiena_otrdiena_treÅ¡diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
            weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
            weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'YYYY. [gada] D. MMMM',
                LLL : 'YYYY. [gada] D. MMMM, LT',
                LLLL : 'YYYY. [gada] D. MMMM, dddd, LT'
            },
            calendar : {
                sameDay : '[Å odien pulksten] LT',
                nextDay : '[RÄ«t pulksten] LT',
                nextWeek : 'dddd [pulksten] LT',
                lastDay : '[Vakar pulksten] LT',
                lastWeek : '[PagÄjuÅ¡Ä] dddd [pulksten] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s vÄ“lÄk',
                past : '%s agrÄk',
                s : 'daÅ¾as sekundes',
                m : 'minÅ«ti',
                mm : relativeTimeWithPlural,
                h : 'stundu',
                hh : relativeTimeWithPlural,
                d : 'dienu',
                dd : relativeTimeWithPlural,
                M : 'mÄ“nesi',
                MM : relativeTimeWithPlural,
                y : 'gadu',
                yy : relativeTimeWithPlural
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : macedonian (mk)
    // author : Borislav Mickov : https://github.com/B0k0

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('mk', {
            months : 'Ñ˜Đ°Đ½ÑƒĐ°Ñ€Đ¸_Ñ„ĐµĐ²Ñ€ÑƒĐ°Ñ€Đ¸_Đ¼Đ°Ñ€Ñ‚_Đ°Đ¿Ñ€Đ¸Đ»_Đ¼Đ°Ñ˜_Ñ˜ÑƒĐ½Đ¸_Ñ˜ÑƒĐ»Đ¸_Đ°Đ²Đ³ÑƒÑÑ‚_ÑĐµĐ¿Ñ‚ĐµĐ¼Đ²Ñ€Đ¸_Đ¾ĐºÑ‚Đ¾Đ¼Đ²Ñ€Đ¸_Đ½Đ¾ĐµĐ¼Đ²Ñ€Đ¸_Đ´ĐµĐºĐµĐ¼Đ²Ñ€Đ¸'.split('_'),
            monthsShort : 'Ñ˜Đ°Đ½_Ñ„ĐµĐ²_Đ¼Đ°Ñ€_Đ°Đ¿Ñ€_Đ¼Đ°Ñ˜_Ñ˜ÑƒĐ½_Ñ˜ÑƒĐ»_Đ°Đ²Đ³_ÑĐµĐ¿_Đ¾ĐºÑ‚_Đ½Đ¾Đµ_Đ´ĐµĐº'.split('_'),
            weekdays : 'Đ½ĐµĐ´ĐµĐ»Đ°_Đ¿Đ¾Đ½ĐµĐ´ĐµĐ»Đ½Đ¸Đº_Đ²Ñ‚Đ¾Ñ€Đ½Đ¸Đº_ÑÑ€ĐµĐ´Đ°_Ñ‡ĐµÑ‚Đ²Ñ€Ñ‚Đ¾Đº_Đ¿ĐµÑ‚Đ¾Đº_ÑĐ°Đ±Đ¾Ñ‚Đ°'.split('_'),
            weekdaysShort : 'Đ½ĐµĐ´_Đ¿Đ¾Đ½_Đ²Ñ‚Đ¾_ÑÑ€Đµ_Ñ‡ĐµÑ‚_Đ¿ĐµÑ‚_ÑĐ°Đ±'.split('_'),
            weekdaysMin : 'Đ½e_Đ¿o_Đ²Ñ‚_ÑÑ€_Ñ‡Đµ_Đ¿Đµ_Ña'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'D.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Đ”ĐµĐ½ĐµÑ Đ²Đ¾] LT',
                nextDay : '[Đ£Ñ‚Ñ€Đµ Đ²Đ¾] LT',
                nextWeek : 'dddd [Đ²Đ¾] LT',
                lastDay : '[Đ’Ñ‡ĐµÑ€Đ° Đ²Đ¾] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 6:
                            return '[Đ’Đ¾ Đ¸Đ·Đ¼Đ¸Đ½Đ°Ñ‚Đ°Ñ‚Đ°] dddd [Đ²Đ¾] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[Đ’Đ¾ Đ¸Đ·Đ¼Đ¸Đ½Đ°Ñ‚Đ¸Đ¾Ñ‚] dddd [Đ²Đ¾] LT';
                    }
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'Đ¿Đ¾ÑĐ»Đµ %s',
                past : 'Đ¿Ñ€ĐµĐ´ %s',
                s : 'Đ½ĐµĐºĐ¾Đ»ĐºÑƒ ÑĐµĐºÑƒĐ½Đ´Đ¸',
                m : 'Đ¼Đ¸Đ½ÑƒÑ‚Đ°',
                mm : '%d Đ¼Đ¸Đ½ÑƒÑ‚Đ¸',
                h : 'Ñ‡Đ°Ñ',
                hh : '%d Ñ‡Đ°ÑĐ°',
                d : 'Đ´ĐµĐ½',
                dd : '%d Đ´ĐµĐ½Đ°',
                M : 'Đ¼ĐµÑĐµÑ†',
                MM : '%d Đ¼ĐµÑĐµÑ†Đ¸',
                y : 'Đ³Đ¾Đ´Đ¸Đ½Đ°',
                yy : '%d Đ³Đ¾Đ´Đ¸Đ½Đ¸'
            },
            ordinalParse: /\d{1,2}-(ĐµĐ²|ĐµĐ½|Ñ‚Đ¸|Đ²Đ¸|Ñ€Đ¸|Đ¼Đ¸)/,
            ordinal : function (number) {
                var lastDigit = number % 10,
                    last2Digits = number % 100;
                if (number === 0) {
                    return number + '-ĐµĐ²';
                } else if (last2Digits === 0) {
                    return number + '-ĐµĐ½';
                } else if (last2Digits > 10 && last2Digits < 20) {
                    return number + '-Ñ‚Đ¸';
                } else if (lastDigit === 1) {
                    return number + '-Đ²Đ¸';
                } else if (lastDigit === 2) {
                    return number + '-Ñ€Đ¸';
                } else if (lastDigit === 7 || lastDigit === 8) {
                    return number + '-Đ¼Đ¸';
                } else {
                    return number + '-Ñ‚Đ¸';
                }
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : malayalam (ml)
    // author : Floyd Pink : https://github.com/floydpink

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ml', {
            months : 'à´œà´¨àµà´µà´°à´¿_à´«àµ†à´¬àµà´°àµà´µà´°à´¿_à´®à´¾àµ¼à´àµà´àµ_à´à´ªàµà´°à´¿àµ½_à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ_à´“à´—à´¸àµà´±àµà´±àµ_à´¸àµ†à´ªàµà´±àµà´±à´‚à´¬àµ¼_à´’à´•àµà´Ÿàµ‹à´¬àµ¼_à´¨à´µà´‚à´¬àµ¼_à´¡à´¿à´¸à´‚à´¬àµ¼'.split('_'),
            monthsShort : 'à´œà´¨àµ._à´«àµ†à´¬àµà´°àµ._à´®à´¾àµ¼._à´à´ªàµà´°à´¿._à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ._à´“à´—._à´¸àµ†à´ªàµà´±àµà´±._à´’à´•àµà´Ÿàµ‹._à´¨à´µà´‚._à´¡à´¿à´¸à´‚.'.split('_'),
            weekdays : 'à´à´¾à´¯à´±à´¾à´´àµà´_à´¤à´¿à´™àµà´•à´³à´¾à´´àµà´_à´àµà´µàµà´µà´¾à´´àµà´_à´¬àµà´§à´¨à´¾à´´àµà´_à´µàµà´¯à´¾à´´à´¾à´´àµà´_à´µàµ†à´³àµà´³à´¿à´¯à´¾à´´àµà´_à´¶à´¨à´¿à´¯à´¾à´´àµà´'.split('_'),
            weekdaysShort : 'à´à´¾à´¯àµ¼_à´¤à´¿à´™àµà´•àµ¾_à´àµà´µàµà´µ_à´¬àµà´§àµ»_à´µàµà´¯à´¾à´´à´‚_à´µàµ†à´³àµà´³à´¿_à´¶à´¨à´¿'.split('_'),
            weekdaysMin : 'à´à´¾_à´¤à´¿_à´àµ_à´¬àµ_à´µàµà´¯à´¾_à´µàµ†_à´¶'.split('_'),
            longDateFormat : {
                LT : 'A h:mm -à´¨àµ',
                LTS : 'A h:mm:ss -à´¨àµ',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à´‡à´¨àµà´¨àµ] LT',
                nextDay : '[à´¨à´¾à´³àµ†] LT',
                nextWeek : 'dddd, LT',
                lastDay : '[à´‡à´¨àµà´¨à´²àµ†] LT',
                lastWeek : '[à´•à´´à´¿à´àµà´] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à´•à´´à´¿à´àµà´àµ',
                past : '%s à´®àµàµ»à´ªàµ',
                s : 'à´…àµ½à´ª à´¨à´¿à´®à´¿à´·à´™àµà´™àµ¾',
                m : 'à´’à´°àµ à´®à´¿à´¨à´¿à´±àµà´±àµ',
                mm : '%d à´®à´¿à´¨à´¿à´±àµà´±àµ',
                h : 'à´’à´°àµ à´®à´£à´¿à´•àµà´•àµ‚àµ¼',
                hh : '%d à´®à´£à´¿à´•àµà´•àµ‚àµ¼',
                d : 'à´’à´°àµ à´¦à´¿à´µà´¸à´‚',
                dd : '%d à´¦à´¿à´µà´¸à´‚',
                M : 'à´’à´°àµ à´®à´¾à´¸à´‚',
                MM : '%d à´®à´¾à´¸à´‚',
                y : 'à´’à´°àµ à´µàµ¼à´·à´‚',
                yy : '%d à´µàµ¼à´·à´‚'
            },
            meridiemParse: /à´°à´¾à´¤àµà´°à´¿|à´°à´¾à´µà´¿à´²àµ†|à´‰à´àµà´ à´•à´´à´¿à´àµà´àµ|à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚|à´°à´¾à´¤àµà´°à´¿/i,
            isPM : function (input) {
                return /^(à´‰à´àµà´ à´•à´´à´¿à´àµà´àµ|à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚|à´°à´¾à´¤àµà´°à´¿)$/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'à´°à´¾à´¤àµà´°à´¿';
                } else if (hour < 12) {
                    return 'à´°à´¾à´µà´¿à´²àµ†';
                } else if (hour < 17) {
                    return 'à´‰à´àµà´ à´•à´´à´¿à´àµà´àµ';
                } else if (hour < 20) {
                    return 'à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚';
                } else {
                    return 'à´°à´¾à´¤àµà´°à´¿';
                }
            }
        });
    }));
    // moment.js locale configuration
    // locale : Marathi (mr)
    // author : Harshad Kale : https://github.com/kalehv

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
                '1': 'à¥§',
                '2': 'à¥¨',
                '3': 'à¥©',
                '4': 'à¥ª',
                '5': 'à¥«',
                '6': 'à¥¬',
                '7': 'à¥­',
                '8': 'à¥®',
                '9': 'à¥¯',
                '0': 'à¥¦'
            },
            numberMap = {
                'à¥§': '1',
                'à¥¨': '2',
                'à¥©': '3',
                'à¥ª': '4',
                'à¥«': '5',
                'à¥¬': '6',
                'à¥­': '7',
                'à¥®': '8',
                'à¥¯': '9',
                'à¥¦': '0'
            };

        return moment.defineLocale('mr', {
            months : 'à¤œà¤¾à¤¨à¥‡à¤µà¤¾à¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤¾à¤°à¥€_à¤®à¤¾à¤°à¥à¤_à¤à¤ªà¥à¤°à¤¿à¤²_à¤®à¥‡_à¤œà¥‚à¤¨_à¤œà¥à¤²à¥ˆ_à¤‘à¤—à¤¸à¥à¤Ÿ_à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚à¤¬à¤°_à¤‘à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤‚à¤¬à¤°'.split('_'),
            monthsShort: 'à¤œà¤¾à¤¨à¥‡._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤._à¤à¤ªà¥à¤°à¤¿._à¤®à¥‡._à¤œà¥‚à¤¨._à¤œà¥à¤²à¥ˆ._à¤‘à¤—._à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚._à¤‘à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚._à¤¡à¤¿à¤¸à¥‡à¤‚.'.split('_'),
            weekdays : 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤³à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split('_'),
            weekdaysShort : 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤³_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split('_'),
            weekdaysMin : 'à¤°_à¤¸à¥‹_à¤®à¤‚_à¤¬à¥_à¤—à¥_à¤¶à¥_à¤¶'.split('_'),
            longDateFormat : {
                LT : 'A h:mm à¤µà¤¾à¤œà¤¤à¤¾',
                LTS : 'A h:mm:ss à¤µà¤¾à¤œà¤¤à¤¾',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à¤†à¤œ] LT',
                nextDay : '[à¤‰à¤¦à¥à¤¯à¤¾] LT',
                nextWeek : 'dddd, LT',
                lastDay : '[à¤•à¤¾à¤²] LT',
                lastWeek: '[à¤®à¤¾à¤—à¥€à¤²] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à¤¨à¤‚à¤¤à¤°',
                past : '%s à¤ªà¥‚à¤°à¥à¤µà¥€',
                s : 'à¤¸à¥‡à¤•à¤‚à¤¦',
                m: 'à¤à¤• à¤®à¤¿à¤¨à¤¿à¤Ÿ',
                mm: '%d à¤®à¤¿à¤¨à¤¿à¤Ÿà¥‡',
                h : 'à¤à¤• à¤¤à¤¾à¤¸',
                hh : '%d à¤¤à¤¾à¤¸',
                d : 'à¤à¤• à¤¦à¤¿à¤µà¤¸',
                dd : '%d à¤¦à¤¿à¤µà¤¸',
                M : 'à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾',
                MM : '%d à¤®à¤¹à¤¿à¤¨à¥‡',
                y : 'à¤à¤• à¤µà¤°à¥à¤·',
                yy : '%d à¤µà¤°à¥à¤·à¥‡'
            },
            preparse: function (string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            meridiemParse: /à¤°à¤¾à¤¤à¥à¤°à¥€|à¤¸à¤•à¤¾à¤³à¥€|à¤¦à¥à¤ªà¤¾à¤°à¥€|à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€/,
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'à¤°à¤¾à¤¤à¥à¤°à¥€') {
                    return hour < 4 ? hour : hour + 12;
                } else if (meridiem === 'à¤¸à¤•à¤¾à¤³à¥€') {
                    return hour;
                } else if (meridiem === 'à¤¦à¥à¤ªà¤¾à¤°à¥€') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === 'à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€') {
                    return hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower)
            {
                if (hour < 4) {
                    return 'à¤°à¤¾à¤¤à¥à¤°à¥€';
                } else if (hour < 10) {
                    return 'à¤¸à¤•à¤¾à¤³à¥€';
                } else if (hour < 17) {
                    return 'à¤¦à¥à¤ªà¤¾à¤°à¥€';
                } else if (hour < 20) {
                    return 'à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€';
                } else {
                    return 'à¤°à¤¾à¤¤à¥à¤°à¥€';
                }
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Bahasa Malaysia (ms-MY)
    // author : Weldan Jamili : https://github.com/weldan

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('ms-my', {
            months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
            monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
            weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
            weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
            weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
            longDateFormat : {
                LT : 'HH.mm',
                LTS : 'LT.ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY [pukul] LT',
                LLLL : 'dddd, D MMMM YYYY [pukul] LT'
            },
            meridiemParse: /pagi|tengahari|petang|malam/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'pagi') {
                    return hour;
                } else if (meridiem === 'tengahari') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'petang' || meridiem === 'malam') {
                    return hour + 12;
                }
            },
            meridiem : function (hours, minutes, isLower) {
                if (hours < 11) {
                    return 'pagi';
                } else if (hours < 15) {
                    return 'tengahari';
                } else if (hours < 19) {
                    return 'petang';
                } else {
                    return 'malam';
                }
            },
            calendar : {
                sameDay : '[Hari ini pukul] LT',
                nextDay : '[Esok pukul] LT',
                nextWeek : 'dddd [pukul] LT',
                lastDay : '[Kelmarin pukul] LT',
                lastWeek : 'dddd [lepas pukul] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'dalam %s',
                past : '%s yang lepas',
                s : 'beberapa saat',
                m : 'seminit',
                mm : '%d minit',
                h : 'sejam',
                hh : '%d jam',
                d : 'sehari',
                dd : '%d hari',
                M : 'sebulan',
                MM : '%d bulan',
                y : 'setahun',
                yy : '%d tahun'
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Burmese (my)
    // author : Squar team, mysquar.com

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
            '1': 'á',
            '2': 'á‚',
            '3': 'áƒ',
            '4': 'á„',
            '5': 'á…',
            '6': 'á†',
            '7': 'á‡',
            '8': 'áˆ',
            '9': 'á‰',
            '0': 'á€'
        }, numberMap = {
            'á': '1',
            'á‚': '2',
            'áƒ': '3',
            'á„': '4',
            'á…': '5',
            'á†': '6',
            'á‡': '7',
            'áˆ': '8',
            'á‰': '9',
            'á€': '0'
        };
        return moment.defineLocale('my', {
            months: 'á€‡á€”á€ºá€”á€á€«á€›á€®_á€–á€±á€–á€±á€¬á€ºá€á€«á€›á€®_á€™á€á€º_á€§á€•á€¼á€®_á€™á€±_á€‡á€½á€”á€º_á€‡á€°á€œá€­á€¯á€„á€º_á€á€¼á€‚á€¯á€á€º_á€…á€€á€ºá€á€„á€ºá€˜á€¬_á€¡á€±á€¬á€€á€ºá€á€­á€¯á€˜á€¬_á€”á€­á€¯á€á€„á€ºá€˜á€¬_á€’á€®á€‡á€„á€ºá€˜á€¬'.split('_'),
            monthsShort: 'á€‡á€”á€º_á€–á€±_á€™á€á€º_á€•á€¼á€®_á€™á€±_á€‡á€½á€”á€º_á€œá€­á€¯á€„á€º_á€á€¼_á€…á€€á€º_á€¡á€±á€¬á€€á€º_á€”á€­á€¯_á€’á€®'.split('_'),
            weekdays: 'á€á€”á€„á€ºá€¹á€‚á€”á€½á€±_á€á€”á€„á€ºá€¹á€œá€¬_á€¡á€„á€ºá€¹á€‚á€«_á€—á€¯á€’á€¹á€“á€Ÿá€°á€¸_á€€á€¼á€¬á€á€•á€á€±á€¸_á€á€±á€¬á€€á€¼á€¬_á€…á€”á€±'.split('_'),
            weekdaysShort: 'á€”á€½á€±_á€œá€¬_á€„á€ºá€¹á€‚á€«_á€Ÿá€°á€¸_á€€á€¼á€¬_á€á€±á€¬_á€”á€±'.split('_'),
            weekdaysMin: 'á€”á€½á€±_á€œá€¬_á€„á€ºá€¹á€‚á€«_á€Ÿá€°á€¸_á€€á€¼á€¬_á€á€±á€¬_á€”á€±'.split('_'),
            longDateFormat: {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L: 'DD/MM/YYYY',
                LL: 'D MMMM YYYY',
                LLL: 'D MMMM YYYY LT',
                LLLL: 'dddd D MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[á€á€”á€±.] LT [á€™á€¾á€¬]',
                nextDay: '[á€™á€”á€€á€ºá€–á€¼á€”á€º] LT [á€™á€¾á€¬]',
                nextWeek: 'dddd LT [á€™á€¾á€¬]',
                lastDay: '[á€™á€”á€±.á€€] LT [á€™á€¾á€¬]',
                lastWeek: '[á€•á€¼á€®á€¸á€á€²á€·á€á€±á€¬] dddd LT [á€™á€¾á€¬]',
                sameElse: 'L'
            },
            relativeTime: {
                future: 'á€œá€¬á€™á€á€ºá€· %s á€™á€¾á€¬',
                past: 'á€œá€½á€”á€ºá€á€²á€·á€á€±á€¬ %s á€€',
                s: 'á€…á€€á€¹á€€á€”á€º.á€¡á€”á€á€ºá€¸á€„á€á€º',
                m: 'á€á€…á€ºá€™á€­á€”á€…á€º',
                mm: '%d á€™á€­á€”á€…á€º',
                h: 'á€á€…á€ºá€”á€¬á€›á€®',
                hh: '%d á€”á€¬á€›á€®',
                d: 'á€á€…á€ºá€›á€€á€º',
                dd: '%d á€›á€€á€º',
                M: 'á€á€…á€ºá€œ',
                MM: '%d á€œ',
                y: 'á€á€…á€ºá€”á€¾á€…á€º',
                yy: '%d á€”á€¾á€…á€º'
            },
            preparse: function (string) {
                return string.replace(/[áá‚áƒá„á…á†á‡áˆá‰á€]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4 // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : norwegian bokmĂ¥l (nb)
    // authors : Espen Hovlandsdal : https://github.com/rexxars
    //           Sigurd Gartmann : https://github.com/sigurdga

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('nb', {
            months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays : 'sĂ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lĂ¸rdag'.split('_'),
            weekdaysShort : 'sĂ¸n_man_tirs_ons_tors_fre_lĂ¸r'.split('_'),
            weekdaysMin : 'sĂ¸_ma_ti_on_to_fr_lĂ¸'.split('_'),
            longDateFormat : {
                LT : 'H.mm',
                LTS : 'LT.ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY [kl.] LT',
                LLLL : 'dddd D. MMMM YYYY [kl.] LT'
            },
            calendar : {
                sameDay: '[i dag kl.] LT',
                nextDay: '[i morgen kl.] LT',
                nextWeek: 'dddd [kl.] LT',
                lastDay: '[i gĂ¥r kl.] LT',
                lastWeek: '[forrige] dddd [kl.] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'om %s',
                past : 'for %s siden',
                s : 'noen sekunder',
                m : 'ett minutt',
                mm : '%d minutter',
                h : 'en time',
                hh : '%d timer',
                d : 'en dag',
                dd : '%d dager',
                M : 'en mĂ¥ned',
                MM : '%d mĂ¥neder',
                y : 'ett Ă¥r',
                yy : '%d Ă¥r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : nepali/nepalese
    // author : suvash : https://github.com/suvash

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var symbolMap = {
                '1': 'à¥§',
                '2': 'à¥¨',
                '3': 'à¥©',
                '4': 'à¥ª',
                '5': 'à¥«',
                '6': 'à¥¬',
                '7': 'à¥­',
                '8': 'à¥®',
                '9': 'à¥¯',
                '0': 'à¥¦'
            },
            numberMap = {
                'à¥§': '1',
                'à¥¨': '2',
                'à¥©': '3',
                'à¥ª': '4',
                'à¥«': '5',
                'à¥¬': '6',
                'à¥­': '7',
                'à¥®': '8',
                'à¥¯': '9',
                'à¥¦': '0'
            };

        return moment.defineLocale('ne', {
            months : 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤_à¤…à¤ªà¥à¤°à¤¿à¤²_à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤·à¥à¤Ÿ_à¤¸à¥‡à¤ªà¥à¤Ÿà¥‡à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤­à¥‡à¤®à¥à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤®à¥à¤¬à¤°'.split('_'),
            monthsShort : 'à¤œà¤¨._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤_à¤…à¤ªà¥à¤°à¤¿._à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ._à¤…à¤—._à¤¸à¥‡à¤ªà¥à¤Ÿ._à¤…à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤­à¥‡._à¤¡à¤¿à¤¸à¥‡.'.split('_'),
            weekdays : 'à¤†à¤‡à¤¤à¤¬à¤¾à¤°_à¤¸à¥‹à¤®à¤¬à¤¾à¤°_à¤®à¤™à¥à¤—à¤²à¤¬à¤¾à¤°_à¤¬à¥à¤§à¤¬à¤¾à¤°_à¤¬à¤¿à¤¹à¤¿à¤¬à¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤¬à¤¾à¤°_à¤¶à¤¨à¤¿à¤¬à¤¾à¤°'.split('_'),
            weekdaysShort : 'à¤†à¤‡à¤¤._à¤¸à¥‹à¤®._à¤®à¤™à¥à¤—à¤²._à¤¬à¥à¤§._à¤¬à¤¿à¤¹à¤¿._à¤¶à¥à¤•à¥à¤°._à¤¶à¤¨à¤¿.'.split('_'),
            weekdaysMin : 'à¤†à¤‡._à¤¸à¥‹._à¤®à¤™à¥_à¤¬à¥._à¤¬à¤¿._à¤¶à¥._à¤¶.'.split('_'),
            longDateFormat : {
                LT : 'Aà¤•à¥‹ h:mm à¤¬à¤œà¥‡',
                LTS : 'Aà¤•à¥‹ h:mm:ss à¤¬à¤œà¥‡',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            preparse: function (string) {
                return string.replace(/[à¥§à¥¨à¥©à¥ªà¥«à¥¬à¥­à¥®à¥¯à¥¦]/g, function (match) {
                    return numberMap[match];
                });
            },
            postformat: function (string) {
                return string.replace(/\d/g, function (match) {
                    return symbolMap[match];
                });
            },
            meridiemParse: /à¤°à¤¾à¤¤à¥€|à¤¬à¤¿à¤¹à¤¾à¤¨|à¤¦à¤¿à¤‰à¤à¤¸à¥‹|à¤¬à¥‡à¤²à¥à¤•à¤¾|à¤¸à¤¾à¤à¤|à¤°à¤¾à¤¤à¥€/,
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'à¤°à¤¾à¤¤à¥€') {
                    return hour < 3 ? hour : hour + 12;
                } else if (meridiem === 'à¤¬à¤¿à¤¹à¤¾à¤¨') {
                    return hour;
                } else if (meridiem === 'à¤¦à¤¿à¤‰à¤à¤¸à¥‹') {
                    return hour >= 10 ? hour : hour + 12;
                } else if (meridiem === 'à¤¬à¥‡à¤²à¥à¤•à¤¾' || meridiem === 'à¤¸à¤¾à¤à¤') {
                    return hour + 12;
                }
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 3) {
                    return 'à¤°à¤¾à¤¤à¥€';
                } else if (hour < 10) {
                    return 'à¤¬à¤¿à¤¹à¤¾à¤¨';
                } else if (hour < 15) {
                    return 'à¤¦à¤¿à¤‰à¤à¤¸à¥‹';
                } else if (hour < 18) {
                    return 'à¤¬à¥‡à¤²à¥à¤•à¤¾';
                } else if (hour < 20) {
                    return 'à¤¸à¤¾à¤à¤';
                } else {
                    return 'à¤°à¤¾à¤¤à¥€';
                }
            },
            calendar : {
                sameDay : '[à¤†à¤œ] LT',
                nextDay : '[à¤­à¥‹à¤²à¥€] LT',
                nextWeek : '[à¤†à¤‰à¤à¤¦à¥‹] dddd[,] LT',
                lastDay : '[à¤¹à¤¿à¤œà¥‹] LT',
                lastWeek : '[à¤—à¤à¤•à¥‹] dddd[,] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%sà¤®à¤¾',
                past : '%s à¤…à¤—à¤¾à¤¡à¥€',
                s : 'à¤•à¥‡à¤¹à¥€ à¤¸à¤®à¤¯',
                m : 'à¤à¤• à¤®à¤¿à¤¨à¥‡à¤Ÿ',
                mm : '%d à¤®à¤¿à¤¨à¥‡à¤Ÿ',
                h : 'à¤à¤• à¤˜à¤£à¥à¤Ÿà¤¾',
                hh : '%d à¤˜à¤£à¥à¤Ÿà¤¾',
                d : 'à¤à¤• à¤¦à¤¿à¤¨',
                dd : '%d à¤¦à¤¿à¤¨',
                M : 'à¤à¤• à¤®à¤¹à¤¿à¤¨à¤¾',
                MM : '%d à¤®à¤¹à¤¿à¤¨à¤¾',
                y : 'à¤à¤• à¤¬à¤°à¥à¤·',
                yy : '%d à¤¬à¤°à¥à¤·'
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : dutch (nl)
    // author : Joris RĂ¶ling : https://github.com/jjupiter

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
            monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');

        return moment.defineLocale('nl', {
            months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
            monthsShort : function (m, format) {
                if (/-MMM-/.test(format)) {
                    return monthsShortWithoutDots[m.month()];
                } else {
                    return monthsShortWithDots[m.month()];
                }
            },
            weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
            weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
            weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD-MM-YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[vandaag om] LT',
                nextDay: '[morgen om] LT',
                nextWeek: 'dddd [om] LT',
                lastDay: '[gisteren om] LT',
                lastWeek: '[afgelopen] dddd [om] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'over %s',
                past : '%s geleden',
                s : 'een paar seconden',
                m : 'Ă©Ă©n minuut',
                mm : '%d minuten',
                h : 'Ă©Ă©n uur',
                hh : '%d uur',
                d : 'Ă©Ă©n dag',
                dd : '%d dagen',
                M : 'Ă©Ă©n maand',
                MM : '%d maanden',
                y : 'Ă©Ă©n jaar',
                yy : '%d jaar'
            },
            ordinalParse: /\d{1,2}(ste|de)/,
            ordinal : function (number) {
                return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : norwegian nynorsk (nn)
    // author : https://github.com/mechuwind

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('nn', {
            months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
            monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
            weekdays : 'sundag_mĂ¥ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
            weekdaysShort : 'sun_mĂ¥n_tys_ons_tor_fre_lau'.split('_'),
            weekdaysMin : 'su_mĂ¥_ty_on_to_fr_lĂ¸'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[I dag klokka] LT',
                nextDay: '[I morgon klokka] LT',
                nextWeek: 'dddd [klokka] LT',
                lastDay: '[I gĂ¥r klokka] LT',
                lastWeek: '[FĂ¸regĂ¥ande] dddd [klokka] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'om %s',
                past : 'for %s sidan',
                s : 'nokre sekund',
                m : 'eit minutt',
                mm : '%d minutt',
                h : 'ein time',
                hh : '%d timar',
                d : 'ein dag',
                dd : '%d dagar',
                M : 'ein mĂ¥nad',
                MM : '%d mĂ¥nader',
                y : 'eit Ă¥r',
                yy : '%d Ă¥r'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : polish (pl)
    // author : Rafal Hirsz : https://github.com/evoL

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var monthsNominative = 'styczeÅ„_luty_marzec_kwiecieÅ„_maj_czerwiec_lipiec_sierpieÅ„_wrzesieÅ„_paÅºdziernik_listopad_grudzieÅ„'.split('_'),
            monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrzeÅ›nia_paÅºdziernika_listopada_grudnia'.split('_');

        function plural(n) {
            return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
        }

        function translate(number, withoutSuffix, key) {
            var result = number + ' ';
            switch (key) {
                case 'm':
                    return withoutSuffix ? 'minuta' : 'minutÄ™';
                case 'mm':
                    return result + (plural(number) ? 'minuty' : 'minut');
                case 'h':
                    return withoutSuffix  ? 'godzina'  : 'godzinÄ™';
                case 'hh':
                    return result + (plural(number) ? 'godziny' : 'godzin');
                case 'MM':
                    return result + (plural(number) ? 'miesiÄ…ce' : 'miesiÄ™cy');
                case 'yy':
                    return result + (plural(number) ? 'lata' : 'lat');
            }
        }

        return moment.defineLocale('pl', {
            months : function (momentToFormat, format) {
                if (/D MMMM/.test(format)) {
                    return monthsSubjective[momentToFormat.month()];
                } else {
                    return monthsNominative[momentToFormat.month()];
                }
            },
            monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paÅº_lis_gru'.split('_'),
            weekdays : 'niedziela_poniedziaÅ‚ek_wtorek_Å›roda_czwartek_piÄ…tek_sobota'.split('_'),
            weekdaysShort : 'nie_pon_wt_Å›r_czw_pt_sb'.split('_'),
            weekdaysMin : 'N_Pn_Wt_År_Cz_Pt_So'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[DziÅ› o] LT',
                nextDay: '[Jutro o] LT',
                nextWeek: '[W] dddd [o] LT',
                lastDay: '[Wczoraj o] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[W zeszÅ‚Ä… niedzielÄ™ o] LT';
                        case 3:
                            return '[W zeszÅ‚Ä… Å›rodÄ™ o] LT';
                        case 6:
                            return '[W zeszÅ‚Ä… sobotÄ™ o] LT';
                        default:
                            return '[W zeszÅ‚y] dddd [o] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'za %s',
                past : '%s temu',
                s : 'kilka sekund',
                m : translate,
                mm : translate,
                h : translate,
                hh : translate,
                d : '1 dzieÅ„',
                dd : '%d dni',
                M : 'miesiÄ…c',
                MM : translate,
                y : 'rok',
                yy : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : brazilian portuguese (pt-br)
    // author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('pt-br', {
            months : 'janeiro_fevereiro_marĂ§o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
            monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
            weekdays : 'domingo_segunda-feira_terĂ§a-feira_quarta-feira_quinta-feira_sexta-feira_sĂ¡bado'.split('_'),
            weekdaysShort : 'dom_seg_ter_qua_qui_sex_sĂ¡b'.split('_'),
            weekdaysMin : 'dom_2Âª_3Âª_4Âª_5Âª_6Âª_sĂ¡b'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D [de] MMMM [de] YYYY',
                LLL : 'D [de] MMMM [de] YYYY [Ă s] LT',
                LLLL : 'dddd, D [de] MMMM [de] YYYY [Ă s] LT'
            },
            calendar : {
                sameDay: '[Hoje Ă s] LT',
                nextDay: '[AmanhĂ£ Ă s] LT',
                nextWeek: 'dddd [Ă s] LT',
                lastDay: '[Ontem Ă s] LT',
                lastWeek: function () {
                    return (this.day() === 0 || this.day() === 6) ?
                        '[Ăltimo] dddd [Ă s] LT' : // Saturday + Sunday
                        '[Ăltima] dddd [Ă s] LT'; // Monday - Friday
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'em %s',
                past : '%s atrĂ¡s',
                s : 'segundos',
                m : 'um minuto',
                mm : '%d minutos',
                h : 'uma hora',
                hh : '%d horas',
                d : 'um dia',
                dd : '%d dias',
                M : 'um mĂªs',
                MM : '%d meses',
                y : 'um ano',
                yy : '%d anos'
            },
            ordinalParse: /\d{1,2}Âº/,
            ordinal : '%dÂº'
        });
    }));
    // moment.js locale configuration
    // locale : portuguese (pt)
    // author : Jefferson : https://github.com/jalex79

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('pt', {
            months : 'janeiro_fevereiro_marĂ§o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
            monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
            weekdays : 'domingo_segunda-feira_terĂ§a-feira_quarta-feira_quinta-feira_sexta-feira_sĂ¡bado'.split('_'),
            weekdaysShort : 'dom_seg_ter_qua_qui_sex_sĂ¡b'.split('_'),
            weekdaysMin : 'dom_2Âª_3Âª_4Âª_5Âª_6Âª_sĂ¡b'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D [de] MMMM [de] YYYY',
                LLL : 'D [de] MMMM [de] YYYY LT',
                LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
            },
            calendar : {
                sameDay: '[Hoje Ă s] LT',
                nextDay: '[AmanhĂ£ Ă s] LT',
                nextWeek: 'dddd [Ă s] LT',
                lastDay: '[Ontem Ă s] LT',
                lastWeek: function () {
                    return (this.day() === 0 || this.day() === 6) ?
                        '[Ăltimo] dddd [Ă s] LT' : // Saturday + Sunday
                        '[Ăltima] dddd [Ă s] LT'; // Monday - Friday
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'em %s',
                past : 'hĂ¡ %s',
                s : 'segundos',
                m : 'um minuto',
                mm : '%d minutos',
                h : 'uma hora',
                hh : '%d horas',
                d : 'um dia',
                dd : '%d dias',
                M : 'um mĂªs',
                MM : '%d meses',
                y : 'um ano',
                yy : '%d anos'
            },
            ordinalParse: /\d{1,2}Âº/,
            ordinal : '%dÂº',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : romanian (ro)
    // author : Vlad Gurdiga : https://github.com/gurdiga
    // author : Valentin Agachi : https://github.com/avaly

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                    'mm': 'minute',
                    'hh': 'ore',
                    'dd': 'zile',
                    'MM': 'luni',
                    'yy': 'ani'
                },
                separator = ' ';
            if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
                separator = ' de ';
            }

            return number + separator + format[key];
        }

        return moment.defineLocale('ro', {
            months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
            monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
            weekdays : 'duminicÄƒ_luni_marÈ›i_miercuri_joi_vineri_sĂ¢mbÄƒtÄƒ'.split('_'),
            weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_SĂ¢m'.split('_'),
            weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_SĂ¢'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY H:mm',
                LLLL : 'dddd, D MMMM YYYY H:mm'
            },
            calendar : {
                sameDay: '[azi la] LT',
                nextDay: '[mĂ¢ine la] LT',
                nextWeek: 'dddd [la] LT',
                lastDay: '[ieri la] LT',
                lastWeek: '[fosta] dddd [la] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'peste %s',
                past : '%s Ă®n urmÄƒ',
                s : 'cĂ¢teva secunde',
                m : 'un minut',
                mm : relativeTimeWithPlural,
                h : 'o orÄƒ',
                hh : relativeTimeWithPlural,
                d : 'o zi',
                dd : relativeTimeWithPlural,
                M : 'o lunÄƒ',
                MM : relativeTimeWithPlural,
                y : 'un an',
                yy : relativeTimeWithPlural
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : russian (ru)
    // author : Viktorminator : https://github.com/Viktorminator
    // Author : Menelion ElensĂºle : https://github.com/Oire

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function plural(word, num) {
            var forms = word.split('_');
            return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
        }

        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                'mm': withoutSuffix ? 'Đ¼Đ¸Đ½ÑƒÑ‚Đ°_Đ¼Đ¸Đ½ÑƒÑ‚Ñ‹_Đ¼Đ¸Đ½ÑƒÑ‚' : 'Đ¼Đ¸Đ½ÑƒÑ‚Ñƒ_Đ¼Đ¸Đ½ÑƒÑ‚Ñ‹_Đ¼Đ¸Đ½ÑƒÑ‚',
                'hh': 'Ñ‡Đ°Ñ_Ñ‡Đ°ÑĐ°_Ñ‡Đ°ÑĐ¾Đ²',
                'dd': 'Đ´ĐµĐ½ÑŒ_Đ´Đ½Ñ_Đ´Đ½ĐµĐ¹',
                'MM': 'Đ¼ĐµÑÑÑ†_Đ¼ĐµÑÑÑ†Đ°_Đ¼ĐµÑÑÑ†ĐµĐ²',
                'yy': 'Đ³Đ¾Đ´_Đ³Đ¾Đ´Đ°_Đ»ĐµÑ‚'
            };
            if (key === 'm') {
                return withoutSuffix ? 'Đ¼Đ¸Đ½ÑƒÑ‚Đ°' : 'Đ¼Đ¸Đ½ÑƒÑ‚Ñƒ';
            }
            else {
                return number + ' ' + plural(format[key], +number);
            }
        }

        function monthsCaseReplace(m, format) {
            var months = {
                    'nominative': 'ÑĐ½Đ²Đ°Ñ€ÑŒ_Ñ„ĐµĐ²Ñ€Đ°Đ»ÑŒ_Đ¼Đ°Ñ€Ñ‚_Đ°Đ¿Ñ€ĐµĐ»ÑŒ_Đ¼Đ°Đ¹_Đ¸ÑĐ½ÑŒ_Đ¸ÑĐ»ÑŒ_Đ°Đ²Đ³ÑƒÑÑ‚_ÑĐµĐ½Ñ‚ÑĐ±Ñ€ÑŒ_Đ¾ĐºÑ‚ÑĐ±Ñ€ÑŒ_Đ½Đ¾ÑĐ±Ñ€ÑŒ_Đ´ĐµĐºĐ°Đ±Ñ€ÑŒ'.split('_'),
                    'accusative': 'ÑĐ½Đ²Đ°Ñ€Ñ_Ñ„ĐµĐ²Ñ€Đ°Đ»Ñ_Đ¼Đ°Ñ€Ñ‚Đ°_Đ°Đ¿Ñ€ĐµĐ»Ñ_Đ¼Đ°Ñ_Đ¸ÑĐ½Ñ_Đ¸ÑĐ»Ñ_Đ°Đ²Đ³ÑƒÑÑ‚Đ°_ÑĐµĐ½Ñ‚ÑĐ±Ñ€Ñ_Đ¾ĐºÑ‚ÑĐ±Ñ€Ñ_Đ½Đ¾ÑĐ±Ñ€Ñ_Đ´ĐµĐºĐ°Đ±Ñ€Ñ'.split('_')
                },

                nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return months[nounCase][m.month()];
        }

        function monthsShortCaseReplace(m, format) {
            var monthsShort = {
                    'nominative': 'ÑĐ½Đ²_Ñ„ĐµĐ²_Đ¼Đ°Ñ€Ñ‚_Đ°Đ¿Ñ€_Đ¼Đ°Đ¹_Đ¸ÑĐ½ÑŒ_Đ¸ÑĐ»ÑŒ_Đ°Đ²Đ³_ÑĐµĐ½_Đ¾ĐºÑ‚_Đ½Đ¾Ñ_Đ´ĐµĐº'.split('_'),
                    'accusative': 'ÑĐ½Đ²_Ñ„ĐµĐ²_Đ¼Đ°Ñ€_Đ°Đ¿Ñ€_Đ¼Đ°Ñ_Đ¸ÑĐ½Ñ_Đ¸ÑĐ»Ñ_Đ°Đ²Đ³_ÑĐµĐ½_Đ¾ĐºÑ‚_Đ½Đ¾Ñ_Đ´ĐµĐº'.split('_')
                },

                nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return monthsShort[nounCase][m.month()];
        }

        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                    'nominative': 'Đ²Đ¾ÑĐºÑ€ĐµÑĐµĐ½ÑŒĐµ_Đ¿Đ¾Đ½ĐµĐ´ĐµĐ»ÑŒĐ½Đ¸Đº_Đ²Ñ‚Đ¾Ñ€Đ½Đ¸Đº_ÑÑ€ĐµĐ´Đ°_Ñ‡ĐµÑ‚Đ²ĐµÑ€Đ³_Đ¿ÑÑ‚Đ½Đ¸Ñ†Đ°_ÑÑƒĐ±Đ±Đ¾Ñ‚Đ°'.split('_'),
                    'accusative': 'Đ²Đ¾ÑĐºÑ€ĐµÑĐµĐ½ÑŒĐµ_Đ¿Đ¾Đ½ĐµĐ´ĐµĐ»ÑŒĐ½Đ¸Đº_Đ²Ñ‚Đ¾Ñ€Đ½Đ¸Đº_ÑÑ€ĐµĐ´Ñƒ_Ñ‡ĐµÑ‚Đ²ĐµÑ€Đ³_Đ¿ÑÑ‚Đ½Đ¸Ñ†Ñƒ_ÑÑƒĐ±Đ±Đ¾Ñ‚Ñƒ'.split('_')
                },

                nounCase = (/\[ ?[Đ’Đ²] ?(?:Đ¿Ñ€Đ¾ÑˆĐ»ÑƒÑ|ÑĐ»ĐµĐ´ÑƒÑÑ‰ÑƒÑ|ÑÑ‚Ñƒ)? ?\] ?dddd/).test(format) ?
                    'accusative' :
                    'nominative';

            return weekdays[nounCase][m.day()];
        }

        return moment.defineLocale('ru', {
            months : monthsCaseReplace,
            monthsShort : monthsShortCaseReplace,
            weekdays : weekdaysCaseReplace,
            weekdaysShort : 'Đ²Ñ_Đ¿Đ½_Đ²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Đ¿Ñ‚_ÑĐ±'.split('_'),
            weekdaysMin : 'Đ²Ñ_Đ¿Đ½_Đ²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Đ¿Ñ‚_ÑĐ±'.split('_'),
            monthsParse : [/^ÑĐ½Đ²/i, /^Ñ„ĐµĐ²/i, /^Đ¼Đ°Ñ€/i, /^Đ°Đ¿Ñ€/i, /^Đ¼Đ°[Đ¹|Ñ]/i, /^Đ¸ÑĐ½/i, /^Đ¸ÑĐ»/i, /^Đ°Đ²Đ³/i, /^ÑĐµĐ½/i, /^Đ¾ĐºÑ‚/i, /^Đ½Đ¾Ñ/i, /^Đ´ĐµĐº/i],
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY Đ³.',
                LLL : 'D MMMM YYYY Đ³., LT',
                LLLL : 'dddd, D MMMM YYYY Đ³., LT'
            },
            calendar : {
                sameDay: '[Đ¡ĐµĐ³Đ¾Đ´Đ½Ñ Đ²] LT',
                nextDay: '[Đ—Đ°Đ²Ñ‚Ñ€Đ° Đ²] LT',
                lastDay: '[Đ’Ñ‡ĐµÑ€Đ° Đ²] LT',
                nextWeek: function () {
                    return this.day() === 2 ? '[Đ’Đ¾] dddd [Đ²] LT' : '[Đ’] dddd [Đ²] LT';
                },
                lastWeek: function (now) {
                    if (now.week() !== this.week()) {
                        switch (this.day()) {
                            case 0:
                                return '[Đ’ Đ¿Ñ€Đ¾ÑˆĐ»Đ¾Đµ] dddd [Đ²] LT';
                            case 1:
                            case 2:
                            case 4:
                                return '[Đ’ Đ¿Ñ€Đ¾ÑˆĐ»Ñ‹Đ¹] dddd [Đ²] LT';
                            case 3:
                            case 5:
                            case 6:
                                return '[Đ’ Đ¿Ñ€Đ¾ÑˆĐ»ÑƒÑ] dddd [Đ²] LT';
                        }
                    } else {
                        if (this.day() === 2) {
                            return '[Đ’Đ¾] dddd [Đ²] LT';
                        } else {
                            return '[Đ’] dddd [Đ²] LT';
                        }
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'Ñ‡ĐµÑ€ĐµĐ· %s',
                past : '%s Đ½Đ°Đ·Đ°Đ´',
                s : 'Đ½ĐµÑĐºĐ¾Đ»ÑŒĐºĐ¾ ÑĐµĐºÑƒĐ½Đ´',
                m : relativeTimeWithPlural,
                mm : relativeTimeWithPlural,
                h : 'Ñ‡Đ°Ñ',
                hh : relativeTimeWithPlural,
                d : 'Đ´ĐµĐ½ÑŒ',
                dd : relativeTimeWithPlural,
                M : 'Đ¼ĐµÑÑÑ†',
                MM : relativeTimeWithPlural,
                y : 'Đ³Đ¾Đ´',
                yy : relativeTimeWithPlural
            },

            meridiemParse: /Đ½Đ¾Ñ‡Đ¸|ÑƒÑ‚Ñ€Đ°|Đ´Đ½Ñ|Đ²ĐµÑ‡ĐµÑ€Đ°/i,
            isPM : function (input) {
                return /^(Đ´Đ½Ñ|Đ²ĐµÑ‡ĐµÑ€Đ°)$/.test(input);
            },

            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'Đ½Đ¾Ñ‡Đ¸';
                } else if (hour < 12) {
                    return 'ÑƒÑ‚Ñ€Đ°';
                } else if (hour < 17) {
                    return 'Đ´Đ½Ñ';
                } else {
                    return 'Đ²ĐµÑ‡ĐµÑ€Đ°';
                }
            },

            ordinalParse: /\d{1,2}-(Đ¹|Đ³Đ¾|Ñ)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                        return number + '-Đ¹';
                    case 'D':
                        return number + '-Đ³Đ¾';
                    case 'w':
                    case 'W':
                        return number + '-Ñ';
                    default:
                        return number;
                }
            },

            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : slovak (sk)
    // author : Martin Minka : https://github.com/k2s
    // based on work of petrbela : https://github.com/petrbela

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var months = 'januĂ¡r_februĂ¡r_marec_aprĂ­l_mĂ¡j_jĂºn_jĂºl_august_september_oktĂ³ber_november_december'.split('_'),
            monthsShort = 'jan_feb_mar_apr_mĂ¡j_jĂºn_jĂºl_aug_sep_okt_nov_dec'.split('_');

        function plural(n) {
            return (n > 1) && (n < 5);
        }

        function translate(number, withoutSuffix, key, isFuture) {
            var result = number + ' ';
            switch (key) {
                case 's':  // a few seconds / in a few seconds / a few seconds ago
                    return (withoutSuffix || isFuture) ? 'pĂ¡r sekĂºnd' : 'pĂ¡r sekundami';
                case 'm':  // a minute / in a minute / a minute ago
                    return withoutSuffix ? 'minĂºta' : (isFuture ? 'minĂºtu' : 'minĂºtou');
                case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'minĂºty' : 'minĂºt');
                    } else {
                        return result + 'minĂºtami';
                    }
                    break;
                case 'h':  // an hour / in an hour / an hour ago
                    return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
                case 'hh': // 9 hours / in 9 hours / 9 hours ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'hodiny' : 'hodĂ­n');
                    } else {
                        return result + 'hodinami';
                    }
                    break;
                case 'd':  // a day / in a day / a day ago
                    return (withoutSuffix || isFuture) ? 'deÅˆ' : 'dÅˆom';
                case 'dd': // 9 days / in 9 days / 9 days ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'dni' : 'dnĂ­');
                    } else {
                        return result + 'dÅˆami';
                    }
                    break;
                case 'M':  // a month / in a month / a month ago
                    return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
                case 'MM': // 9 months / in 9 months / 9 months ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'mesiace' : 'mesiacov');
                    } else {
                        return result + 'mesiacmi';
                    }
                    break;
                case 'y':  // a year / in a year / a year ago
                    return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
                case 'yy': // 9 years / in 9 years / 9 years ago
                    if (withoutSuffix || isFuture) {
                        return result + (plural(number) ? 'roky' : 'rokov');
                    } else {
                        return result + 'rokmi';
                    }
                    break;
            }
        }

        return moment.defineLocale('sk', {
            months : months,
            monthsShort : monthsShort,
            monthsParse : (function (months, monthsShort) {
                var i, _monthsParse = [];
                for (i = 0; i < 12; i++) {
                    // use custom parser to solve problem with July (Äervenec)
                    _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
                }
                return _monthsParse;
            }(months, monthsShort)),
            weekdays : 'nedeÄ¾a_pondelok_utorok_streda_Å¡tvrtok_piatok_sobota'.split('_'),
            weekdaysShort : 'ne_po_ut_st_Å¡t_pi_so'.split('_'),
            weekdaysMin : 'ne_po_ut_st_Å¡t_pi_so'.split('_'),
            longDateFormat : {
                LT: 'H:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd D. MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[dnes o] LT',
                nextDay: '[zajtra o] LT',
                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[v nedeÄ¾u o] LT';
                        case 1:
                        case 2:
                            return '[v] dddd [o] LT';
                        case 3:
                            return '[v stredu o] LT';
                        case 4:
                            return '[vo Å¡tvrtok o] LT';
                        case 5:
                            return '[v piatok o] LT';
                        case 6:
                            return '[v sobotu o] LT';
                    }
                },
                lastDay: '[vÄera o] LT',
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[minulĂº nedeÄ¾u o] LT';
                        case 1:
                        case 2:
                            return '[minulĂ½] dddd [o] LT';
                        case 3:
                            return '[minulĂº stredu o] LT';
                        case 4:
                        case 5:
                            return '[minulĂ½] dddd [o] LT';
                        case 6:
                            return '[minulĂº sobotu o] LT';
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'za %s',
                past : 'pred %s',
                s : translate,
                m : translate,
                mm : translate,
                h : translate,
                hh : translate,
                d : translate,
                dd : translate,
                M : translate,
                MM : translate,
                y : translate,
                yy : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : slovenian (sl)
    // author : Robert SedovÅ¡ek : https://github.com/sedovsek

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function translate(number, withoutSuffix, key) {
            var result = number + ' ';
            switch (key) {
                case 'm':
                    return withoutSuffix ? 'ena minuta' : 'eno minuto';
                case 'mm':
                    if (number === 1) {
                        result += 'minuta';
                    } else if (number === 2) {
                        result += 'minuti';
                    } else if (number === 3 || number === 4) {
                        result += 'minute';
                    } else {
                        result += 'minut';
                    }
                    return result;
                case 'h':
                    return withoutSuffix ? 'ena ura' : 'eno uro';
                case 'hh':
                    if (number === 1) {
                        result += 'ura';
                    } else if (number === 2) {
                        result += 'uri';
                    } else if (number === 3 || number === 4) {
                        result += 'ure';
                    } else {
                        result += 'ur';
                    }
                    return result;
                case 'dd':
                    if (number === 1) {
                        result += 'dan';
                    } else {
                        result += 'dni';
                    }
                    return result;
                case 'MM':
                    if (number === 1) {
                        result += 'mesec';
                    } else if (number === 2) {
                        result += 'meseca';
                    } else if (number === 3 || number === 4) {
                        result += 'mesece';
                    } else {
                        result += 'mesecev';
                    }
                    return result;
                case 'yy':
                    if (number === 1) {
                        result += 'leto';
                    } else if (number === 2) {
                        result += 'leti';
                    } else if (number === 3 || number === 4) {
                        result += 'leta';
                    } else {
                        result += 'let';
                    }
                    return result;
            }
        }

        return moment.defineLocale('sl', {
            months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
            monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
            weekdays : 'nedelja_ponedeljek_torek_sreda_Äetrtek_petek_sobota'.split('_'),
            weekdaysShort : 'ned._pon._tor._sre._Äet._pet._sob.'.split('_'),
            weekdaysMin : 'ne_po_to_sr_Äe_pe_so'.split('_'),
            longDateFormat : {
                LT : 'H:mm',
                LTS : 'LT:ss',
                L : 'DD. MM. YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY LT',
                LLLL : 'dddd, D. MMMM YYYY LT'
            },
            calendar : {
                sameDay  : '[danes ob] LT',
                nextDay  : '[jutri ob] LT',

                nextWeek : function () {
                    switch (this.day()) {
                        case 0:
                            return '[v] [nedeljo] [ob] LT';
                        case 3:
                            return '[v] [sredo] [ob] LT';
                        case 6:
                            return '[v] [soboto] [ob] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[v] dddd [ob] LT';
                    }
                },
                lastDay  : '[vÄeraj ob] LT',
                lastWeek : function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 6:
                            return '[prejÅ¡nja] dddd [ob] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[prejÅ¡nji] dddd [ob] LT';
                    }
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'Äez %s',
                past   : '%s nazaj',
                s      : 'nekaj sekund',
                m      : translate,
                mm     : translate,
                h      : translate,
                hh     : translate,
                d      : 'en dan',
                dd     : translate,
                M      : 'en mesec',
                MM     : translate,
                y      : 'eno leto',
                yy     : translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Albanian (sq)
    // author : FlakĂ«rim Ismani : https://github.com/flakerimi
    // author: Menelion ElensĂºle: https://github.com/Oire (tests)
    // author : Oerd Cukalla : https://github.com/oerd (fixes)

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('sq', {
            months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_NĂ«ntor_Dhjetor'.split('_'),
            monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_NĂ«n_Dhj'.split('_'),
            weekdays : 'E Diel_E HĂ«nĂ«_E MartĂ«_E MĂ«rkurĂ«_E Enjte_E Premte_E ShtunĂ«'.split('_'),
            weekdaysShort : 'Die_HĂ«n_Mar_MĂ«r_Enj_Pre_Sht'.split('_'),
            weekdaysMin : 'D_H_Ma_MĂ«_E_P_Sh'.split('_'),
            meridiemParse: /PD|MD/,
            isPM: function (input) {
                return input.charAt(0) === 'M';
            },
            meridiem : function (hours, minutes, isLower) {
                return hours < 12 ? 'PD' : 'MD';
            },
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[Sot nĂ«] LT',
                nextDay : '[NesĂ«r nĂ«] LT',
                nextWeek : 'dddd [nĂ«] LT',
                lastDay : '[Dje nĂ«] LT',
                lastWeek : 'dddd [e kaluar nĂ«] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'nĂ« %s',
                past : '%s mĂ« parĂ«',
                s : 'disa sekonda',
                m : 'njĂ« minutĂ«',
                mm : '%d minuta',
                h : 'njĂ« orĂ«',
                hh : '%d orĂ«',
                d : 'njĂ« ditĂ«',
                dd : '%d ditĂ«',
                M : 'njĂ« muaj',
                MM : '%d muaj',
                y : 'njĂ« vit',
                yy : '%d vite'
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Serbian-cyrillic (sr-cyrl)
    // author : Milan JanaÄkoviÄ‡<milanjanackovic@gmail.com> : https://github.com/milan-j

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var translator = {
            words: { //Different grammatical cases
                m: ['Ñ˜ĐµĐ´Đ°Đ½ Đ¼Đ¸Đ½ÑƒÑ‚', 'Ñ˜ĐµĐ´Đ½Đµ Đ¼Đ¸Đ½ÑƒÑ‚Đµ'],
                mm: ['Đ¼Đ¸Đ½ÑƒÑ‚', 'Đ¼Đ¸Đ½ÑƒÑ‚Đµ', 'Đ¼Đ¸Đ½ÑƒÑ‚Đ°'],
                h: ['Ñ˜ĐµĐ´Đ°Đ½ ÑĐ°Ñ‚', 'Ñ˜ĐµĐ´Đ½Đ¾Đ³ ÑĐ°Ñ‚Đ°'],
                hh: ['ÑĐ°Ñ‚', 'ÑĐ°Ñ‚Đ°', 'ÑĐ°Ñ‚Đ¸'],
                dd: ['Đ´Đ°Đ½', 'Đ´Đ°Đ½Đ°', 'Đ´Đ°Đ½Đ°'],
                MM: ['Đ¼ĐµÑĐµÑ†', 'Đ¼ĐµÑĐµÑ†Đ°', 'Đ¼ĐµÑĐµÑ†Đ¸'],
                yy: ['Đ³Đ¾Đ´Đ¸Đ½Đ°', 'Đ³Đ¾Đ´Đ¸Đ½Đµ', 'Đ³Đ¾Đ´Đ¸Đ½Đ°']
            },
            correctGrammaticalCase: function (number, wordKey) {
                return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
            },
            translate: function (number, withoutSuffix, key) {
                var wordKey = translator.words[key];
                if (key.length === 1) {
                    return withoutSuffix ? wordKey[0] : wordKey[1];
                } else {
                    return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
                }
            }
        };

        return moment.defineLocale('sr-cyrl', {
            months: ['Ñ˜Đ°Đ½ÑƒĐ°Ñ€', 'Ñ„ĐµĐ±Ñ€ÑƒĐ°Ñ€', 'Đ¼Đ°Ñ€Ñ‚', 'Đ°Đ¿Ñ€Đ¸Đ»', 'Đ¼Đ°Ñ˜', 'Ñ˜ÑƒĐ½', 'Ñ˜ÑƒĐ»', 'Đ°Đ²Đ³ÑƒÑÑ‚', 'ÑĐµĐ¿Ñ‚ĐµĐ¼Đ±Đ°Ñ€', 'Đ¾ĐºÑ‚Đ¾Đ±Đ°Ñ€', 'Đ½Đ¾Đ²ĐµĐ¼Đ±Đ°Ñ€', 'Đ´ĐµÑ†ĐµĐ¼Đ±Đ°Ñ€'],
            monthsShort: ['Ñ˜Đ°Đ½.', 'Ñ„ĐµĐ±.', 'Đ¼Đ°Ñ€.', 'Đ°Đ¿Ñ€.', 'Đ¼Đ°Ñ˜', 'Ñ˜ÑƒĐ½', 'Ñ˜ÑƒĐ»', 'Đ°Đ²Đ³.', 'ÑĐµĐ¿.', 'Đ¾ĐºÑ‚.', 'Đ½Đ¾Đ².', 'Đ´ĐµÑ†.'],
            weekdays: ['Đ½ĐµĐ´ĐµÑ™Đ°', 'Đ¿Đ¾Đ½ĐµĐ´ĐµÑ™Đ°Đº', 'ÑƒÑ‚Đ¾Ñ€Đ°Đº', 'ÑÑ€ĐµĐ´Đ°', 'Ñ‡ĐµÑ‚Đ²Ñ€Ñ‚Đ°Đº', 'Đ¿ĐµÑ‚Đ°Đº', 'ÑÑƒĐ±Đ¾Ñ‚Đ°'],
            weekdaysShort: ['Đ½ĐµĐ´.', 'Đ¿Đ¾Đ½.', 'ÑƒÑ‚Đ¾.', 'ÑÑ€Đµ.', 'Ñ‡ĐµÑ‚.', 'Đ¿ĐµÑ‚.', 'ÑÑƒĐ±.'],
            weekdaysMin: ['Đ½Đµ', 'Đ¿Đ¾', 'ÑƒÑ‚', 'ÑÑ€', 'Ñ‡Đµ', 'Đ¿Đµ', 'ÑÑƒ'],
            longDateFormat: {
                LT: 'H:mm',
                LTS : 'LT:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY LT',
                LLLL: 'dddd, D. MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[Đ´Đ°Đ½Đ°Ñ Ñƒ] LT',
                nextDay: '[ÑÑƒÑ‚Ñ€Đ° Ñƒ] LT',

                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[Ñƒ] [Đ½ĐµĐ´ĐµÑ™Ñƒ] [Ñƒ] LT';
                        case 3:
                            return '[Ñƒ] [ÑÑ€ĐµĐ´Ñƒ] [Ñƒ] LT';
                        case 6:
                            return '[Ñƒ] [ÑÑƒĐ±Đ¾Ñ‚Ñƒ] [Ñƒ] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[Ñƒ] dddd [Ñƒ] LT';
                    }
                },
                lastDay  : '[Ñ˜ÑƒÑ‡Đµ Ñƒ] LT',
                lastWeek : function () {
                    var lastWeekDays = [
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đµ] [Đ½ĐµĐ´ĐµÑ™Đµ] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đ¾Đ³] [Đ¿Đ¾Đ½ĐµĐ´ĐµÑ™ĐºĐ°] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đ¾Đ³] [ÑƒÑ‚Đ¾Ñ€ĐºĐ°] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đµ] [ÑÑ€ĐµĐ´Đµ] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đ¾Đ³] [Ñ‡ĐµÑ‚Đ²Ñ€Ñ‚ĐºĐ°] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đ¾Đ³] [Đ¿ĐµÑ‚ĐºĐ°] [Ñƒ] LT',
                        '[Đ¿Ñ€Đ¾ÑˆĐ»Đµ] [ÑÑƒĐ±Đ¾Ñ‚Đµ] [Ñƒ] LT'
                    ];
                    return lastWeekDays[this.day()];
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'Đ·Đ° %s',
                past   : 'Đ¿Ñ€Đµ %s',
                s      : 'Đ½ĐµĐºĐ¾Đ»Đ¸ĐºĐ¾ ÑĐµĐºÑƒĐ½Đ´Đ¸',
                m      : translator.translate,
                mm     : translator.translate,
                h      : translator.translate,
                hh     : translator.translate,
                d      : 'Đ´Đ°Đ½',
                dd     : translator.translate,
                M      : 'Đ¼ĐµÑĐµÑ†',
                MM     : translator.translate,
                y      : 'Đ³Đ¾Đ´Đ¸Đ½Ñƒ',
                yy     : translator.translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Serbian-latin (sr)
    // author : Milan JanaÄkoviÄ‡<milanjanackovic@gmail.com> : https://github.com/milan-j

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var translator = {
            words: { //Different grammatical cases
                m: ['jedan minut', 'jedne minute'],
                mm: ['minut', 'minute', 'minuta'],
                h: ['jedan sat', 'jednog sata'],
                hh: ['sat', 'sata', 'sati'],
                dd: ['dan', 'dana', 'dana'],
                MM: ['mesec', 'meseca', 'meseci'],
                yy: ['godina', 'godine', 'godina']
            },
            correctGrammaticalCase: function (number, wordKey) {
                return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
            },
            translate: function (number, withoutSuffix, key) {
                var wordKey = translator.words[key];
                if (key.length === 1) {
                    return withoutSuffix ? wordKey[0] : wordKey[1];
                } else {
                    return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
                }
            }
        };

        return moment.defineLocale('sr', {
            months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
            monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
            weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'Äetvrtak', 'petak', 'subota'],
            weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'Äet.', 'pet.', 'sub.'],
            weekdaysMin: ['ne', 'po', 'ut', 'sr', 'Äe', 'pe', 'su'],
            longDateFormat: {
                LT: 'H:mm',
                LTS : 'LT:ss',
                L: 'DD. MM. YYYY',
                LL: 'D. MMMM YYYY',
                LLL: 'D. MMMM YYYY LT',
                LLLL: 'dddd, D. MMMM YYYY LT'
            },
            calendar: {
                sameDay: '[danas u] LT',
                nextDay: '[sutra u] LT',

                nextWeek: function () {
                    switch (this.day()) {
                        case 0:
                            return '[u] [nedelju] [u] LT';
                        case 3:
                            return '[u] [sredu] [u] LT';
                        case 6:
                            return '[u] [subotu] [u] LT';
                        case 1:
                        case 2:
                        case 4:
                        case 5:
                            return '[u] dddd [u] LT';
                    }
                },
                lastDay  : '[juÄe u] LT',
                lastWeek : function () {
                    var lastWeekDays = [
                        '[proÅ¡le] [nedelje] [u] LT',
                        '[proÅ¡log] [ponedeljka] [u] LT',
                        '[proÅ¡log] [utorka] [u] LT',
                        '[proÅ¡le] [srede] [u] LT',
                        '[proÅ¡log] [Äetvrtka] [u] LT',
                        '[proÅ¡log] [petka] [u] LT',
                        '[proÅ¡le] [subote] [u] LT'
                    ];
                    return lastWeekDays[this.day()];
                },
                sameElse : 'L'
            },
            relativeTime : {
                future : 'za %s',
                past   : 'pre %s',
                s      : 'nekoliko sekundi',
                m      : translator.translate,
                mm     : translator.translate,
                h      : translator.translate,
                hh     : translator.translate,
                d      : 'dan',
                dd     : translator.translate,
                M      : 'mesec',
                MM     : translator.translate,
                y      : 'godinu',
                yy     : translator.translate
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : swedish (sv)
    // author : Jens Alm : https://github.com/ulmus

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('sv', {
            months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
            monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
            weekdays : 'sĂ¶ndag_mĂ¥ndag_tisdag_onsdag_torsdag_fredag_lĂ¶rdag'.split('_'),
            weekdaysShort : 'sĂ¶n_mĂ¥n_tis_ons_tor_fre_lĂ¶r'.split('_'),
            weekdaysMin : 'sĂ¶_mĂ¥_ti_on_to_fr_lĂ¶'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'YYYY-MM-DD',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[Idag] LT',
                nextDay: '[Imorgon] LT',
                lastDay: '[IgĂ¥r] LT',
                nextWeek: 'dddd LT',
                lastWeek: '[FĂ¶rra] dddd[en] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'om %s',
                past : 'fĂ¶r %s sedan',
                s : 'nĂ¥gra sekunder',
                m : 'en minut',
                mm : '%d minuter',
                h : 'en timme',
                hh : '%d timmar',
                d : 'en dag',
                dd : '%d dagar',
                M : 'en mĂ¥nad',
                MM : '%d mĂ¥nader',
                y : 'ett Ă¥r',
                yy : '%d Ă¥r'
            },
            ordinalParse: /\d{1,2}(e|a)/,
            ordinal : function (number) {
                var b = number % 10,
                    output = (~~(number % 100 / 10) === 1) ? 'e' :
                        (b === 1) ? 'a' :
                            (b === 2) ? 'a' :
                                (b === 3) ? 'e' : 'e';
                return number + output;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : tamil (ta)
    // author : Arjunkumar Krishnamoorthy : https://github.com/tk120404

    (function (factory) {
        factory(moment);
    }(function (moment) {
        /*var symbolMap = {
         '1': 'à¯§',
         '2': 'à¯¨',
         '3': 'à¯©',
         '4': 'à¯ª',
         '5': 'à¯«',
         '6': 'à¯¬',
         '7': 'à¯­',
         '8': 'à¯®',
         '9': 'à¯¯',
         '0': 'à¯¦'
         },
         numberMap = {
         'à¯§': '1',
         'à¯¨': '2',
         'à¯©': '3',
         'à¯ª': '4',
         'à¯«': '5',
         'à¯¬': '6',
         'à¯­': '7',
         'à¯®': '8',
         'à¯¯': '9',
         'à¯¦': '0'
         }; */

        return moment.defineLocale('ta', {
            months : 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®à¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®à¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®à®®à¯à®ªà®°à¯'.split('_'),
            monthsShort : 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®à¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®à¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®à®®à¯à®ªà®°à¯'.split('_'),
            weekdays : 'à®à®¾à®¯à®¿à®±à¯à®±à¯à®•à¯à®•à®¿à®´à®®à¯ˆ_à®¤à®¿à®™à¯à®•à®Ÿà¯à®•à®¿à®´à®®à¯ˆ_à®à¯†à®µà¯à®µà®¾à®¯à¯à®•à®¿à®´à®®à¯ˆ_à®ªà¯à®¤à®©à¯à®•à®¿à®´à®®à¯ˆ_à®µà®¿à®¯à®¾à®´à®•à¯à®•à®¿à®´à®®à¯ˆ_à®µà¯†à®³à¯à®³à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ_à®à®©à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ'.split('_'),
            weekdaysShort : 'à®à®¾à®¯à®¿à®±à¯_à®¤à®¿à®™à¯à®•à®³à¯_à®à¯†à®µà¯à®µà®¾à®¯à¯_à®ªà¯à®¤à®©à¯_à®µà®¿à®¯à®¾à®´à®©à¯_à®µà¯†à®³à¯à®³à®¿_à®à®©à®¿'.split('_'),
            weekdaysMin : 'à®à®¾_à®¤à®¿_à®à¯†_à®ªà¯_à®µà®¿_à®µà¯†_à®'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY, LT',
                LLLL : 'dddd, D MMMM YYYY, LT'
            },
            calendar : {
                sameDay : '[à®‡à®©à¯à®±à¯] LT',
                nextDay : '[à®¨à®¾à®³à¯ˆ] LT',
                nextWeek : 'dddd, LT',
                lastDay : '[à®¨à¯‡à®±à¯à®±à¯] LT',
                lastWeek : '[à®•à®Ÿà®¨à¯à®¤ à®µà®¾à®°à®®à¯] dddd, LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s à®‡à®²à¯',
                past : '%s à®®à¯à®©à¯',
                s : 'à®’à®°à¯ à®à®¿à®² à®µà®¿à®¨à®¾à®Ÿà®¿à®•à®³à¯',
                m : 'à®’à®°à¯ à®¨à®¿à®®à®¿à®Ÿà®®à¯',
                mm : '%d à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯',
                h : 'à®’à®°à¯ à®®à®£à®¿ à®¨à¯‡à®°à®®à¯',
                hh : '%d à®®à®£à®¿ à®¨à¯‡à®°à®®à¯',
                d : 'à®’à®°à¯ à®¨à®¾à®³à¯',
                dd : '%d à®¨à®¾à®Ÿà¯à®•à®³à¯',
                M : 'à®’à®°à¯ à®®à®¾à®¤à®®à¯',
                MM : '%d à®®à®¾à®¤à®™à¯à®•à®³à¯',
                y : 'à®’à®°à¯ à®µà®°à¯à®Ÿà®®à¯',
                yy : '%d à®†à®£à¯à®Ÿà¯à®•à®³à¯'
            },
            /*        preparse: function (string) {
             return string.replace(/[à¯§à¯¨à¯©à¯ªà¯«à¯¬à¯­à¯®à¯¯à¯¦]/g, function (match) {
             return numberMap[match];
             });
             },
             postformat: function (string) {
             return string.replace(/\d/g, function (match) {
             return symbolMap[match];
             });
             },*/
            ordinalParse: /\d{1,2}à®µà®¤à¯/,
            ordinal : function (number) {
                return number + 'à®µà®¤à¯';
            },


            // refer http://ta.wikipedia.org/s/1er1
            meridiemParse: /à®¯à®¾à®®à®®à¯|à®µà¯ˆà®•à®±à¯ˆ|à®•à®¾à®²à¯ˆ|à®¨à®£à¯à®ªà®•à®²à¯|à®à®±à¯à®ªà®¾à®Ÿà¯|à®®à®¾à®²à¯ˆ/,
            meridiem : function (hour, minute, isLower) {
                if (hour < 2) {
                    return ' à®¯à®¾à®®à®®à¯';
                } else if (hour < 6) {
                    return ' à®µà¯ˆà®•à®±à¯ˆ';  // à®µà¯ˆà®•à®±à¯ˆ
                } else if (hour < 10) {
                    return ' à®•à®¾à®²à¯ˆ'; // à®•à®¾à®²à¯ˆ
                } else if (hour < 14) {
                    return ' à®¨à®£à¯à®ªà®•à®²à¯'; // à®¨à®£à¯à®ªà®•à®²à¯
                } else if (hour < 18) {
                    return ' à®à®±à¯à®ªà®¾à®Ÿà¯'; // à®à®±à¯à®ªà®¾à®Ÿà¯
                } else if (hour < 22) {
                    return ' à®®à®¾à®²à¯ˆ'; // à®®à®¾à®²à¯ˆ
                } else {
                    return ' à®¯à®¾à®®à®®à¯';
                }
            },
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'à®¯à®¾à®®à®®à¯') {
                    return hour < 2 ? hour : hour + 12;
                } else if (meridiem === 'à®µà¯ˆà®•à®±à¯ˆ' || meridiem === 'à®•à®¾à®²à¯ˆ') {
                    return hour;
                } else if (meridiem === 'à®¨à®£à¯à®ªà®•à®²à¯') {
                    return hour >= 10 ? hour : hour + 12;
                } else {
                    return hour + 12;
                }
            },
            week : {
                dow : 0, // Sunday is the first day of the week.
                doy : 6  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : thai (th)
    // author : Kridsada Thanabulpong : https://github.com/sirn

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('th', {
            months : 'à¸¡à¸à¸£à¸²à¸„à¸¡_à¸à¸¸à¸¡à¸ à¸²à¸à¸±à¸™à¸˜à¹Œ_à¸¡à¸µà¸™à¸²à¸„à¸¡_à¹€à¸¡à¸©à¸²à¸¢à¸™_à¸à¸¤à¸©à¸ à¸²à¸„à¸¡_à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™_à¸à¸£à¸à¸à¸²à¸„à¸¡_à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡_à¸à¸±à¸™à¸¢à¸²à¸¢à¸™_à¸•à¸¸à¸¥à¸²à¸„à¸¡_à¸à¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™_à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡'.split('_'),
            monthsShort : 'à¸¡à¸à¸£à¸²_à¸à¸¸à¸¡à¸ à¸²_à¸¡à¸µà¸™à¸²_à¹€à¸¡à¸©à¸²_à¸à¸¤à¸©à¸ à¸²_à¸¡à¸´à¸–à¸¸à¸™à¸²_à¸à¸£à¸à¸à¸²_à¸ªà¸´à¸‡à¸«à¸²_à¸à¸±à¸™à¸¢à¸²_à¸•à¸¸à¸¥à¸²_à¸à¸¤à¸¨à¸ˆà¸´à¸à¸²_à¸˜à¸±à¸™à¸§à¸²'.split('_'),
            weekdays : 'à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸à¸¸à¸˜_à¸à¸¤à¸«à¸±à¸ªà¸à¸”à¸µ_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ'.split('_'),
            weekdaysShort : 'à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸à¸¸à¸˜_à¸à¸¤à¸«à¸±à¸ª_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ'.split('_'), // yes, three characters difference
            weekdaysMin : 'à¸­à¸²._à¸ˆ._à¸­._à¸._à¸à¸¤._à¸¨._à¸ª.'.split('_'),
            longDateFormat : {
                LT : 'H à¸™à¸²à¸¬à¸´à¸à¸² m à¸™à¸²à¸—à¸µ',
                LTS : 'LT s à¸§à¸´à¸™à¸²à¸—à¸µ',
                L : 'YYYY/MM/DD',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY à¹€à¸§à¸¥à¸² LT',
                LLLL : 'à¸§à¸±à¸™ddddà¸—à¸µà¹ˆ D MMMM YYYY à¹€à¸§à¸¥à¸² LT'
            },
            meridiemParse: /à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡|à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡/,
            isPM: function (input) {
                return input === 'à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 12) {
                    return 'à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
                } else {
                    return 'à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡';
                }
            },
            calendar : {
                sameDay : '[à¸§à¸±à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
                nextDay : '[à¸à¸£à¸¸à¹ˆà¸‡à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
                nextWeek : 'dddd[à¸«à¸™à¹‰à¸² à¹€à¸§à¸¥à¸²] LT',
                lastDay : '[à¹€à¸¡à¸·à¹ˆà¸­à¸§à¸²à¸™à¸™à¸µà¹‰ à¹€à¸§à¸¥à¸²] LT',
                lastWeek : '[à¸§à¸±à¸™]dddd[à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§ à¹€à¸§à¸¥à¸²] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'à¸­à¸µà¸ %s',
                past : '%sà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§',
                s : 'à¹„à¸¡à¹ˆà¸à¸µà¹ˆà¸§à¸´à¸™à¸²à¸—à¸µ',
                m : '1 à¸™à¸²à¸—à¸µ',
                mm : '%d à¸™à¸²à¸—à¸µ',
                h : '1 à¸à¸±à¹ˆà¸§à¹‚à¸¡à¸‡',
                hh : '%d à¸à¸±à¹ˆà¸§à¹‚à¸¡à¸‡',
                d : '1 à¸§à¸±à¸™',
                dd : '%d à¸§à¸±à¸™',
                M : '1 à¹€à¸”à¸·à¸­à¸™',
                MM : '%d à¹€à¸”à¸·à¸­à¸™',
                y : '1 à¸›à¸µ',
                yy : '%d à¸›à¸µ'
            }
        });
    }));
    // moment.js locale configuration
    // locale : Tagalog/Filipino (tl-ph)
    // author : Dan Hagman

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('tl-ph', {
            months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
            monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
            weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
            weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
            weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'MM/D/YYYY',
                LL : 'MMMM D, YYYY',
                LLL : 'MMMM D, YYYY LT',
                LLLL : 'dddd, MMMM DD, YYYY LT'
            },
            calendar : {
                sameDay: '[Ngayon sa] LT',
                nextDay: '[Bukas sa] LT',
                nextWeek: 'dddd [sa] LT',
                lastDay: '[Kahapon sa] LT',
                lastWeek: 'dddd [huling linggo] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'sa loob ng %s',
                past : '%s ang nakalipas',
                s : 'ilang segundo',
                m : 'isang minuto',
                mm : '%d minuto',
                h : 'isang oras',
                hh : '%d oras',
                d : 'isang araw',
                dd : '%d araw',
                M : 'isang buwan',
                MM : '%d buwan',
                y : 'isang taon',
                yy : '%d taon'
            },
            ordinalParse: /\d{1,2}/,
            ordinal : function (number) {
                return number;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : turkish (tr)
    // authors : Erhan Gundogan : https://github.com/erhangundogan,
    //           Burak YiÄŸit Kaya: https://github.com/BYK

    (function (factory) {
        factory(moment);
    }(function (moment) {
        var suffixes = {
            1: '\'inci',
            5: '\'inci',
            8: '\'inci',
            70: '\'inci',
            80: '\'inci',

            2: '\'nci',
            7: '\'nci',
            20: '\'nci',
            50: '\'nci',

            3: '\'Ă¼ncĂ¼',
            4: '\'Ă¼ncĂ¼',
            100: '\'Ă¼ncĂ¼',

            6: '\'ncÄ±',

            9: '\'uncu',
            10: '\'uncu',
            30: '\'uncu',

            60: '\'Ä±ncÄ±',
            90: '\'Ä±ncÄ±'
        };

        return moment.defineLocale('tr', {
            months : 'Ocak_Åubat_Mart_Nisan_MayÄ±s_Haziran_Temmuz_AÄŸustos_EylĂ¼l_Ekim_KasÄ±m_AralÄ±k'.split('_'),
            monthsShort : 'Oca_Åub_Mar_Nis_May_Haz_Tem_AÄŸu_Eyl_Eki_Kas_Ara'.split('_'),
            weekdays : 'Pazar_Pazartesi_SalÄ±_Ă‡arÅŸamba_PerÅŸembe_Cuma_Cumartesi'.split('_'),
            weekdaysShort : 'Paz_Pts_Sal_Ă‡ar_Per_Cum_Cts'.split('_'),
            weekdaysMin : 'Pz_Pt_Sa_Ă‡a_Pe_Cu_Ct'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd, D MMMM YYYY LT'
            },
            calendar : {
                sameDay : '[bugĂ¼n saat] LT',
                nextDay : '[yarÄ±n saat] LT',
                nextWeek : '[haftaya] dddd [saat] LT',
                lastDay : '[dĂ¼n] LT',
                lastWeek : '[geĂ§en hafta] dddd [saat] LT',
                sameElse : 'L'
            },
            relativeTime : {
                future : '%s sonra',
                past : '%s Ă¶nce',
                s : 'birkaĂ§ saniye',
                m : 'bir dakika',
                mm : '%d dakika',
                h : 'bir saat',
                hh : '%d saat',
                d : 'bir gĂ¼n',
                dd : '%d gĂ¼n',
                M : 'bir ay',
                MM : '%d ay',
                y : 'bir yÄ±l',
                yy : '%d yÄ±l'
            },
            ordinalParse: /\d{1,2}'(inci|nci|Ă¼ncĂ¼|ncÄ±|uncu|Ä±ncÄ±)/,
            ordinal : function (number) {
                if (number === 0) {  // special case for zero
                    return number + '\'Ä±ncÄ±';
                }
                var a = number % 10,
                    b = number % 100 - a,
                    c = number >= 100 ? 100 : null;

                return number + (suffixes[a] || suffixes[b] || suffixes[c]);
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Morocco Central Atlas TamaziÉ£t in Latin (tzm-latn)
    // author : Abdel Said : https://github.com/abdelsaid

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('tzm-latn', {
            months : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
            monthsShort : 'innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir'.split('_'),
            weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
            weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
            weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[asdkh g] LT',
                nextDay: '[aska g] LT',
                nextWeek: 'dddd [g] LT',
                lastDay: '[assant g] LT',
                lastWeek: 'dddd [g] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'dadkh s yan %s',
                past : 'yan %s',
                s : 'imik',
                m : 'minuá¸',
                mm : '%d minuá¸',
                h : 'saÉ›a',
                hh : '%d tassaÉ›in',
                d : 'ass',
                dd : '%d ossan',
                M : 'ayowr',
                MM : '%d iyyirn',
                y : 'asgas',
                yy : '%d isgasn'
            },
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : Morocco Central Atlas TamaziÉ£t (tzm)
    // author : Abdel Said : https://github.com/abdelsaid

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('tzm', {
            months : 'âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµâ´°âµ•âµ_âµ‰â´±âµ”âµ‰âµ”_âµâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµâµâ´±âµ‰âµ”'.split('_'),
            monthsShort : 'âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµâ´°âµ•âµ_âµ‰â´±âµ”âµ‰âµ”_âµâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµâµâ´±âµ‰âµ”'.split('_'),
            weekdays : 'â´°âµ™â´°âµâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
            weekdaysShort : 'â´°âµ™â´°âµâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
            weekdaysMin : 'â´°âµ™â´°âµâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS: 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'dddd D MMMM YYYY LT'
            },
            calendar : {
                sameDay: '[â´°âµ™â´·âµ… â´´] LT',
                nextDay: '[â´°âµ™â´½â´° â´´] LT',
                nextWeek: 'dddd [â´´] LT',
                lastDay: '[â´°âµâ´°âµâµœ â´´] LT',
                lastWeek: 'dddd [â´´] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : 'â´·â´°â´·âµ… âµ™ âµ¢â´°âµ %s',
                past : 'âµ¢â´°âµ %s',
                s : 'âµ‰âµâµ‰â´½',
                m : 'âµâµ‰âµâµ“â´º',
                mm : '%d âµâµ‰âµâµ“â´º',
                h : 'âµ™â´°âµ„â´°',
                hh : '%d âµœâ´°âµ™âµ™â´°âµ„âµ‰âµ',
                d : 'â´°âµ™âµ™',
                dd : '%d oâµ™âµ™â´°âµ',
                M : 'â´°âµ¢oâµ“âµ”',
                MM : '%d âµ‰âµ¢âµ¢âµ‰âµ”âµ',
                y : 'â´°âµ™â´³â´°âµ™',
                yy : '%d âµ‰âµ™â´³â´°âµ™âµ'
            },
            week : {
                dow : 6, // Saturday is the first day of the week.
                doy : 12  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : ukrainian (uk)
    // author : zemlanin : https://github.com/zemlanin
    // Author : Menelion ElensĂºle : https://github.com/Oire

    (function (factory) {
        factory(moment);
    }(function (moment) {
        function plural(word, num) {
            var forms = word.split('_');
            return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
        }

        function relativeTimeWithPlural(number, withoutSuffix, key) {
            var format = {
                'mm': 'Ñ…Đ²Đ¸Đ»Đ¸Đ½Đ°_Ñ…Đ²Đ¸Đ»Đ¸Đ½Đ¸_Ñ…Đ²Đ¸Đ»Đ¸Đ½',
                'hh': 'Đ³Đ¾Đ´Đ¸Đ½Đ°_Đ³Đ¾Đ´Đ¸Đ½Đ¸_Đ³Đ¾Đ´Đ¸Đ½',
                'dd': 'Đ´ĐµĐ½ÑŒ_Đ´Đ½Ñ–_Đ´Đ½Ñ–Đ²',
                'MM': 'Đ¼Ñ–ÑÑÑ†ÑŒ_Đ¼Ñ–ÑÑÑ†Ñ–_Đ¼Ñ–ÑÑÑ†Ñ–Đ²',
                'yy': 'Ñ€Ñ–Đº_Ñ€Đ¾ĐºĐ¸_Ñ€Đ¾ĐºÑ–Đ²'
            };
            if (key === 'm') {
                return withoutSuffix ? 'Ñ…Đ²Đ¸Đ»Đ¸Đ½Đ°' : 'Ñ…Đ²Đ¸Đ»Đ¸Đ½Ñƒ';
            }
            else if (key === 'h') {
                return withoutSuffix ? 'Đ³Đ¾Đ´Đ¸Đ½Đ°' : 'Đ³Đ¾Đ´Đ¸Đ½Ñƒ';
            }
            else {
                return number + ' ' + plural(format[key], +number);
            }
        }

        function monthsCaseReplace(m, format) {
            var months = {
                    'nominative': 'ÑÑ–Ñ‡ĐµĐ½ÑŒ_Đ»ÑÑ‚Đ¸Đ¹_Đ±ĐµÑ€ĐµĐ·ĐµĐ½ÑŒ_ĐºĐ²Ñ–Ñ‚ĐµĐ½ÑŒ_Ñ‚Ñ€Đ°Đ²ĐµĐ½ÑŒ_Ñ‡ĐµÑ€Đ²ĐµĐ½ÑŒ_Đ»Đ¸Đ¿ĐµĐ½ÑŒ_ÑĐµÑ€Đ¿ĐµĐ½ÑŒ_Đ²ĐµÑ€ĐµÑĐµĐ½ÑŒ_Đ¶Đ¾Đ²Ñ‚ĐµĐ½ÑŒ_Đ»Đ¸ÑÑ‚Đ¾Đ¿Đ°Đ´_Đ³Ñ€ÑƒĐ´ĐµĐ½ÑŒ'.split('_'),
                    'accusative': 'ÑÑ–Ñ‡Đ½Ñ_Đ»ÑÑ‚Đ¾Đ³Đ¾_Đ±ĐµÑ€ĐµĐ·Đ½Ñ_ĐºĐ²Ñ–Ñ‚Đ½Ñ_Ñ‚Ñ€Đ°Đ²Đ½Ñ_Ñ‡ĐµÑ€Đ²Đ½Ñ_Đ»Đ¸Đ¿Đ½Ñ_ÑĐµÑ€Đ¿Đ½Ñ_Đ²ĐµÑ€ĐµÑĐ½Ñ_Đ¶Đ¾Đ²Ñ‚Đ½Ñ_Đ»Đ¸ÑÑ‚Đ¾Đ¿Đ°Đ´Đ°_Đ³Ñ€ÑƒĐ´Đ½Ñ'.split('_')
                },

                nounCase = (/D[oD]? *MMMM?/).test(format) ?
                    'accusative' :
                    'nominative';

            return months[nounCase][m.month()];
        }

        function weekdaysCaseReplace(m, format) {
            var weekdays = {
                    'nominative': 'Đ½ĐµĐ´Ñ–Đ»Ñ_Đ¿Đ¾Đ½ĐµĐ´Ñ–Đ»Đ¾Đº_Đ²Ñ–Đ²Ñ‚Đ¾Ñ€Đ¾Đº_ÑĐµÑ€ĐµĐ´Đ°_Ñ‡ĐµÑ‚Đ²ĐµÑ€_Đ¿â€™ÑÑ‚Đ½Đ¸Ñ†Ñ_ÑÑƒĐ±Đ¾Ñ‚Đ°'.split('_'),
                    'accusative': 'Đ½ĐµĐ´Ñ–Đ»Ñ_Đ¿Đ¾Đ½ĐµĐ´Ñ–Đ»Đ¾Đº_Đ²Ñ–Đ²Ñ‚Đ¾Ñ€Đ¾Đº_ÑĐµÑ€ĐµĐ´Ñƒ_Ñ‡ĐµÑ‚Đ²ĐµÑ€_Đ¿â€™ÑÑ‚Đ½Đ¸Ñ†Ñ_ÑÑƒĐ±Đ¾Ñ‚Ñƒ'.split('_'),
                    'genitive': 'Đ½ĐµĐ´Ñ–Đ»Ñ–_Đ¿Đ¾Đ½ĐµĐ´Ñ–Đ»ĐºĐ°_Đ²Ñ–Đ²Ñ‚Đ¾Ñ€ĐºĐ°_ÑĐµÑ€ĐµĐ´Đ¸_Ñ‡ĐµÑ‚Đ²ĐµÑ€Đ³Đ°_Đ¿â€™ÑÑ‚Đ½Đ¸Ñ†Ñ–_ÑÑƒĐ±Đ¾Ñ‚Đ¸'.split('_')
                },

                nounCase = (/(\[[Đ’Đ²Đ£Ñƒ]\]) ?dddd/).test(format) ?
                    'accusative' :
                    ((/\[?(?:Đ¼Đ¸Đ½ÑƒĐ»Đ¾Ñ—|Đ½Đ°ÑÑ‚ÑƒĐ¿Đ½Đ¾Ñ—)? ?\] ?dddd/).test(format) ?
                        'genitive' :
                        'nominative');

            return weekdays[nounCase][m.day()];
        }

        function processHoursFunction(str) {
            return function () {
                return str + 'Đ¾' + (this.hours() === 11 ? 'Đ±' : '') + '] LT';
            };
        }

        return moment.defineLocale('uk', {
            months : monthsCaseReplace,
            monthsShort : 'ÑÑ–Ñ‡_Đ»ÑÑ‚_Đ±ĐµÑ€_ĐºĐ²Ñ–Ñ‚_Ñ‚Ñ€Đ°Đ²_Ñ‡ĐµÑ€Đ²_Đ»Đ¸Đ¿_ÑĐµÑ€Đ¿_Đ²ĐµÑ€_Đ¶Đ¾Đ²Ñ‚_Đ»Đ¸ÑÑ‚_Đ³Ñ€ÑƒĐ´'.split('_'),
            weekdays : weekdaysCaseReplace,
            weekdaysShort : 'Đ½Đ´_Đ¿Đ½_Đ²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Đ¿Ñ‚_ÑĐ±'.split('_'),
            weekdaysMin : 'Đ½Đ´_Đ¿Đ½_Đ²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Đ¿Ñ‚_ÑĐ±'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD.MM.YYYY',
                LL : 'D MMMM YYYY Ñ€.',
                LLL : 'D MMMM YYYY Ñ€., LT',
                LLLL : 'dddd, D MMMM YYYY Ñ€., LT'
            },
            calendar : {
                sameDay: processHoursFunction('[Đ¡ÑŒĐ¾Đ³Đ¾Đ´Đ½Ñ– '),
                nextDay: processHoursFunction('[Đ—Đ°Đ²Ñ‚Ñ€Đ° '),
                lastDay: processHoursFunction('[Đ’Ñ‡Đ¾Ñ€Đ° '),
                nextWeek: processHoursFunction('[Đ£] dddd ['),
                lastWeek: function () {
                    switch (this.day()) {
                        case 0:
                        case 3:
                        case 5:
                        case 6:
                            return processHoursFunction('[ĐœĐ¸Đ½ÑƒĐ»Đ¾Ñ—] dddd [').call(this);
                        case 1:
                        case 2:
                        case 4:
                            return processHoursFunction('[ĐœĐ¸Đ½ÑƒĐ»Đ¾Đ³Đ¾] dddd [').call(this);
                    }
                },
                sameElse: 'L'
            },
            relativeTime : {
                future : 'Đ·Đ° %s',
                past : '%s Ñ‚Đ¾Đ¼Ñƒ',
                s : 'Đ´ĐµĐºÑ–Đ»ÑŒĐºĐ° ÑĐµĐºÑƒĐ½Đ´',
                m : relativeTimeWithPlural,
                mm : relativeTimeWithPlural,
                h : 'Đ³Đ¾Đ´Đ¸Đ½Ñƒ',
                hh : relativeTimeWithPlural,
                d : 'Đ´ĐµĐ½ÑŒ',
                dd : relativeTimeWithPlural,
                M : 'Đ¼Ñ–ÑÑÑ†ÑŒ',
                MM : relativeTimeWithPlural,
                y : 'Ñ€Ñ–Đº',
                yy : relativeTimeWithPlural
            },

            // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason

            meridiemParse: /Đ½Đ¾Ñ‡Ñ–|Ñ€Đ°Đ½ĐºÑƒ|Đ´Đ½Ñ|Đ²ĐµÑ‡Đ¾Ñ€Đ°/,
            isPM: function (input) {
                return /^(Đ´Đ½Ñ|Đ²ĐµÑ‡Đ¾Ñ€Đ°)$/.test(input);
            },
            meridiem : function (hour, minute, isLower) {
                if (hour < 4) {
                    return 'Đ½Đ¾Ñ‡Ñ–';
                } else if (hour < 12) {
                    return 'Ñ€Đ°Đ½ĐºÑƒ';
                } else if (hour < 17) {
                    return 'Đ´Đ½Ñ';
                } else {
                    return 'Đ²ĐµÑ‡Đ¾Ñ€Đ°';
                }
            },

            ordinalParse: /\d{1,2}-(Đ¹|Đ³Đ¾)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'M':
                    case 'd':
                    case 'DDD':
                    case 'w':
                    case 'W':
                        return number + '-Đ¹';
                    case 'D':
                        return number + '-Đ³Đ¾';
                    default:
                        return number;
                }
            },

            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 1st is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : uzbek (uz)
    // author : Sardor Muminov : https://github.com/muminoff

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('uz', {
            months : 'ÑĐ½Đ²Đ°Ñ€ÑŒ_Ñ„ĐµĐ²Ñ€Đ°Đ»ÑŒ_Đ¼Đ°Ñ€Ñ‚_Đ°Đ¿Ñ€ĐµĐ»ÑŒ_Đ¼Đ°Đ¹_Đ¸ÑĐ½ÑŒ_Đ¸ÑĐ»ÑŒ_Đ°Đ²Đ³ÑƒÑÑ‚_ÑĐµĐ½Ñ‚ÑĐ±Ñ€ÑŒ_Đ¾ĐºÑ‚ÑĐ±Ñ€ÑŒ_Đ½Đ¾ÑĐ±Ñ€ÑŒ_Đ´ĐµĐºĐ°Đ±Ñ€ÑŒ'.split('_'),
            monthsShort : 'ÑĐ½Đ²_Ñ„ĐµĐ²_Đ¼Đ°Ñ€_Đ°Đ¿Ñ€_Đ¼Đ°Đ¹_Đ¸ÑĐ½_Đ¸ÑĐ»_Đ°Đ²Đ³_ÑĐµĐ½_Đ¾ĐºÑ‚_Đ½Đ¾Ñ_Đ´ĐµĐº'.split('_'),
            weekdays : 'Đ¯ĐºÑˆĐ°Đ½Đ±Đ°_Đ”ÑƒÑˆĐ°Đ½Đ±Đ°_Đ¡ĐµÑˆĐ°Đ½Đ±Đ°_Đ§Đ¾Ñ€ÑˆĐ°Đ½Đ±Đ°_ĐŸĐ°Đ¹ÑˆĐ°Đ½Đ±Đ°_Đ–ÑƒĐ¼Đ°_Đ¨Đ°Đ½Đ±Đ°'.split('_'),
            weekdaysShort : 'Đ¯ĐºÑˆ_Đ”ÑƒÑˆ_Đ¡ĐµÑˆ_Đ§Đ¾Ñ€_ĐŸĐ°Đ¹_Đ–ÑƒĐ¼_Đ¨Đ°Đ½'.split('_'),
            weekdaysMin : 'Đ¯Đº_Đ”Ñƒ_Đ¡Đµ_Đ§Đ¾_ĐŸĐ°_Đ–Ñƒ_Đ¨Đ°'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM YYYY',
                LLL : 'D MMMM YYYY LT',
                LLLL : 'D MMMM YYYY, dddd LT'
            },
            calendar : {
                sameDay : '[Đ‘ÑƒĐ³ÑƒĐ½ ÑĐ¾Đ°Ñ‚] LT [Đ´Đ°]',
                nextDay : '[Đ­Ñ€Ñ‚Đ°Đ³Đ°] LT [Đ´Đ°]',
                nextWeek : 'dddd [ĐºÑƒĐ½Đ¸ ÑĐ¾Đ°Ñ‚] LT [Đ´Đ°]',
                lastDay : '[ĐĐµÑ‡Đ° ÑĐ¾Đ°Ñ‚] LT [Đ´Đ°]',
                lastWeek : '[Đ£Ñ‚Đ³Đ°Đ½] dddd [ĐºÑƒĐ½Đ¸ ÑĐ¾Đ°Ñ‚] LT [Đ´Đ°]',
                sameElse : 'L'
            },
            relativeTime : {
                future : 'Đ¯ĐºĐ¸Đ½ %s Đ¸Ñ‡Đ¸Đ´Đ°',
                past : 'Đ‘Đ¸Ñ€ Đ½ĐµÑ‡Đ° %s Đ¾Đ»Đ´Đ¸Đ½',
                s : 'Ñ„ÑƒÑ€ÑĐ°Ñ‚',
                m : 'Đ±Đ¸Ñ€ Đ´Đ°ĐºĐ¸ĐºĐ°',
                mm : '%d Đ´Đ°ĐºĐ¸ĐºĐ°',
                h : 'Đ±Đ¸Ñ€ ÑĐ¾Đ°Ñ‚',
                hh : '%d ÑĐ¾Đ°Ñ‚',
                d : 'Đ±Đ¸Ñ€ ĐºÑƒĐ½',
                dd : '%d ĐºÑƒĐ½',
                M : 'Đ±Đ¸Ñ€ Đ¾Đ¹',
                MM : '%d Đ¾Đ¹',
                y : 'Đ±Đ¸Ñ€ Đ¹Đ¸Đ»',
                yy : '%d Đ¹Đ¸Đ»'
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 7  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : vietnamese (vi)
    // author : Bang Nguyen : https://github.com/bangnk

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('vi', {
            months : 'thĂ¡ng 1_thĂ¡ng 2_thĂ¡ng 3_thĂ¡ng 4_thĂ¡ng 5_thĂ¡ng 6_thĂ¡ng 7_thĂ¡ng 8_thĂ¡ng 9_thĂ¡ng 10_thĂ¡ng 11_thĂ¡ng 12'.split('_'),
            monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
            weekdays : 'chá»§ nháº­t_thá»© hai_thá»© ba_thá»© tÆ°_thá»© nÄƒm_thá»© sĂ¡u_thá»© báº£y'.split('_'),
            weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
            longDateFormat : {
                LT : 'HH:mm',
                LTS : 'LT:ss',
                L : 'DD/MM/YYYY',
                LL : 'D MMMM [nÄƒm] YYYY',
                LLL : 'D MMMM [nÄƒm] YYYY LT',
                LLLL : 'dddd, D MMMM [nÄƒm] YYYY LT',
                l : 'DD/M/YYYY',
                ll : 'D MMM YYYY',
                lll : 'D MMM YYYY LT',
                llll : 'ddd, D MMM YYYY LT'
            },
            calendar : {
                sameDay: '[HĂ´m nay lĂºc] LT',
                nextDay: '[NgĂ y mai lĂºc] LT',
                nextWeek: 'dddd [tuáº§n tá»›i lĂºc] LT',
                lastDay: '[HĂ´m qua lĂºc] LT',
                lastWeek: 'dddd [tuáº§n rá»“i lĂºc] LT',
                sameElse: 'L'
            },
            relativeTime : {
                future : '%s tá»›i',
                past : '%s trÆ°á»›c',
                s : 'vĂ i giĂ¢y',
                m : 'má»™t phĂºt',
                mm : '%d phĂºt',
                h : 'má»™t giá»',
                hh : '%d giá»',
                d : 'má»™t ngĂ y',
                dd : '%d ngĂ y',
                M : 'má»™t thĂ¡ng',
                MM : '%d thĂ¡ng',
                y : 'má»™t nÄƒm',
                yy : '%d nÄƒm'
            },
            ordinalParse: /\d{1,2}/,
            ordinal : function (number) {
                return number;
            },
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : chinese (zh-cn)
    // author : suupic : https://github.com/suupic
    // author : Zeno Zeng : https://github.com/zenozeng

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('zh-cn', {
            months : 'ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ'.split('_'),
            monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
            weekdays : 'æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­'.split('_'),
            weekdaysShort : 'å‘¨æ—¥_å‘¨ä¸€_å‘¨äºŒ_å‘¨ä¸‰_å‘¨å››_å‘¨äº”_å‘¨å…­'.split('_'),
            weekdaysMin : 'æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­'.split('_'),
            longDateFormat : {
                LT : 'Ahç‚¹mm',
                LTS : 'Ahç‚¹måˆ†sç§’',
                L : 'YYYY-MM-DD',
                LL : 'YYYYå¹´MMMDæ—¥',
                LLL : 'YYYYå¹´MMMDæ—¥LT',
                LLLL : 'YYYYå¹´MMMDæ—¥ddddLT',
                l : 'YYYY-MM-DD',
                ll : 'YYYYå¹´MMMDæ—¥',
                lll : 'YYYYå¹´MMMDæ—¥LT',
                llll : 'YYYYå¹´MMMDæ—¥ddddLT'
            },
            meridiemParse: /å‡Œæ™¨|æ—©ä¸|ä¸åˆ|ä¸­åˆ|ä¸‹åˆ|æ™ä¸/,
            meridiemHour: function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'å‡Œæ™¨' || meridiem === 'æ—©ä¸' ||
                    meridiem === 'ä¸åˆ') {
                    return hour;
                } else if (meridiem === 'ä¸‹åˆ' || meridiem === 'æ™ä¸') {
                    return hour + 12;
                } else {
                    // 'ä¸­åˆ'
                    return hour >= 11 ? hour : hour + 12;
                }
            },
            meridiem : function (hour, minute, isLower) {
                var hm = hour * 100 + minute;
                if (hm < 600) {
                    return 'å‡Œæ™¨';
                } else if (hm < 900) {
                    return 'æ—©ä¸';
                } else if (hm < 1130) {
                    return 'ä¸åˆ';
                } else if (hm < 1230) {
                    return 'ä¸­åˆ';
                } else if (hm < 1800) {
                    return 'ä¸‹åˆ';
                } else {
                    return 'æ™ä¸';
                }
            },
            calendar : {
                sameDay : function () {
                    return this.minutes() === 0 ? '[ä»å¤©]Ah[ç‚¹æ•´]' : '[ä»å¤©]LT';
                },
                nextDay : function () {
                    return this.minutes() === 0 ? '[æ˜å¤©]Ah[ç‚¹æ•´]' : '[æ˜å¤©]LT';
                },
                lastDay : function () {
                    return this.minutes() === 0 ? '[æ˜¨å¤©]Ah[ç‚¹æ•´]' : '[æ˜¨å¤©]LT';
                },
                nextWeek : function () {
                    var startOfWeek, prefix;
                    startOfWeek = moment().startOf('week');
                    prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[ä¸‹]' : '[æœ¬]';
                    return this.minutes() === 0 ? prefix + 'dddAhç‚¹æ•´' : prefix + 'dddAhç‚¹mm';
                },
                lastWeek : function () {
                    var startOfWeek, prefix;
                    startOfWeek = moment().startOf('week');
                    prefix = this.unix() < startOfWeek.unix()  ? '[ä¸]' : '[æœ¬]';
                    return this.minutes() === 0 ? prefix + 'dddAhç‚¹æ•´' : prefix + 'dddAhç‚¹mm';
                },
                sameElse : 'LL'
            },
            ordinalParse: /\d{1,2}(æ—¥|æœˆ|å‘¨)/,
            ordinal : function (number, period) {
                switch (period) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return number + 'æ—¥';
                    case 'M':
                        return number + 'æœˆ';
                    case 'w':
                    case 'W':
                        return number + 'å‘¨';
                    default:
                        return number;
                }
            },
            relativeTime : {
                future : '%så†…',
                past : '%så‰',
                s : 'å‡ ç§’',
                m : '1åˆ†é’Ÿ',
                mm : '%dåˆ†é’Ÿ',
                h : '1å°æ—¶',
                hh : '%då°æ—¶',
                d : '1å¤©',
                dd : '%då¤©',
                M : '1ä¸ªæœˆ',
                MM : '%dä¸ªæœˆ',
                y : '1å¹´',
                yy : '%då¹´'
            },
            week : {
                // GB/T 7408-1994ă€æ•°æ®å…ƒå’Œäº¤æ¢æ ¼å¼Â·ä¿¡æ¯äº¤æ¢Â·æ—¥æœŸå’Œæ—¶é—´è¡¨ç¤ºæ³•ă€‹ä¸ISO 8601:1988ç­‰æ•ˆ
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }));
    // moment.js locale configuration
    // locale : traditional chinese (zh-tw)
    // author : Ben : https://github.com/ben-lin

    (function (factory) {
        factory(moment);
    }(function (moment) {
        return moment.defineLocale('zh-tw', {
            months : 'ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ'.split('_'),
            monthsShort : '1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ'.split('_'),
            weekdays : 'æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­'.split('_'),
            weekdaysShort : 'é€±æ—¥_é€±ä¸€_é€±äºŒ_é€±ä¸‰_é€±å››_é€±äº”_é€±å…­'.split('_'),
            weekdaysMin : 'æ—¥_ä¸€_äºŒ_ä¸‰_å››_äº”_å…­'.split('_'),
            longDateFormat : {
                LT : 'Ahé»mm',
                LTS : 'Ahé»måˆ†sç§’',
                L : 'YYYYå¹´MMMDæ—¥',
                LL : 'YYYYå¹´MMMDæ—¥',
                LLL : 'YYYYå¹´MMMDæ—¥LT',
                LLLL : 'YYYYå¹´MMMDæ—¥ddddLT',
                l : 'YYYYå¹´MMMDæ—¥',
                ll : 'YYYYå¹´MMMDæ—¥',
                lll : 'YYYYå¹´MMMDæ—¥LT',
                llll : 'YYYYå¹´MMMDæ—¥ddddLT'
            },
            meridiemParse: /æ—©ä¸|ä¸åˆ|ä¸­åˆ|ä¸‹åˆ|æ™ä¸/,
            meridiemHour : function (hour, meridiem) {
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === 'æ—©ä¸' || meridiem === 'ä¸åˆ') {
                    return hour;
                } else if (meridiem === 'ä¸­åˆ') {
                    return hour >= 11 ? hour : hour + 12;
                } else if (meridiem === 'ä¸‹åˆ' || meridiem === 'æ™ä¸') {
                    return hour + 12;
                }
            },
            meridiem : function (hour, minute, isLower) {
                var hm = hour * 100 + minute;
                if (hm < 900) {
                    return 'æ—©ä¸';
                } else if (hm < 1130) {
                    return 'ä¸åˆ';
                } else if (hm < 1230) {
                    return 'ä¸­åˆ';
                } else if (hm < 1800) {
                    return 'ä¸‹åˆ';
                } else {
                    return 'æ™ä¸';
                }
            },
            calendar : {
                sameDay : '[ä»å¤©]LT',
                nextDay : '[æ˜å¤©]LT',
                nextWeek : '[ä¸‹]ddddLT',
                lastDay : '[æ˜¨å¤©]LT',
                lastWeek : '[ä¸]ddddLT',
                sameElse : 'L'
            },
            ordinalParse: /\d{1,2}(æ—¥|æœˆ|é€±)/,
            ordinal : function (number, period) {
                switch (period) {
                    case 'd' :
                    case 'D' :
                    case 'DDD' :
                        return number + 'æ—¥';
                    case 'M' :
                        return number + 'æœˆ';
                    case 'w' :
                    case 'W' :
                        return number + 'é€±';
                    default :
                        return number;
                }
            },
            relativeTime : {
                future : '%så…§',
                past : '%så‰',
                s : 'å¹¾ç§’',
                m : 'ä¸€åˆ†é˜',
                mm : '%dåˆ†é˜',
                h : 'ä¸€å°æ™‚',
                hh : '%då°æ™‚',
                d : 'ä¸€å¤©',
                dd : '%då¤©',
                M : 'ä¸€å€‹æœˆ',
                MM : '%då€‹æœˆ',
                y : 'ä¸€å¹´',
                yy : '%då¹´'
            }
        });
    }));

    moment.locale('en');


    /************************************
     Exposing Moment
     ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                'Accessing Moment through the global scope is ' +
                'deprecated, and will be removed in an upcoming ' +
                'release.',
                moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define(function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);
/*! version : 4.7.14
 =========================================================
 bootstrap-datetimejs
 https://github.com/Eonasdan/bootstrap-datetimepicker
 Copyright (c) 2015 Jonathan Peterson
 =========================================================
 */
/*
 The MIT License (MIT)

 Copyright (c) 2015 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/*global define:false */
/*global exports:false */
/*global require:false */
/*global jQuery:false */
/*global moment:false */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('moment'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        }
        if (typeof moment === 'undefined') {
            throw 'bootstrap-datetimepicker requires Moment.js to be loaded first';
        }
        factory(jQuery, moment);
    }
}(function ($, moment) {
    'use strict';
    if (!moment) {
        throw new Error('bootstrap-datetimepicker requires Moment.js to be loaded first');
    }

    var dateTimePicker = function (element, options) {
        var picker = {},
            date = moment().startOf('d'),
            viewDate = date.clone(),
            unset = true,
            input,
            component = false,
            widget = false,
            use24Hours,
            minViewModeNumber = 0,
            actualFormat,
            parseFormats,
            currentViewMode,
            datePickerModes = [
                {
                    clsName: 'days',
                    navFnc: 'M',
                    navStep: 1
                },
                {
                    clsName: 'months',
                    navFnc: 'y',
                    navStep: 1
                },
                {
                    clsName: 'years',
                    navFnc: 'y',
                    navStep: 10
                }
            ],
            viewModes = ['days', 'months', 'years'],
            verticalModes = ['top', 'bottom', 'auto'],
            horizontalModes = ['left', 'right', 'auto'],
            toolbarPlacements = ['default', 'top', 'bottom'],
            keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                'pageUp': 33,
                33: 'pageUp',
                'pageDown': 34,
                34: 'pageDown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                't': 84,
                84: 't',
                'delete': 46,
                46: 'delete'
            },
            keyState = {},

            /********************************************************************************
             *
             * Private functions
             *
             ********************************************************************************/
            isEnabled = function (granularity) {
                if (typeof granularity !== 'string' || granularity.length > 1) {
                    throw new TypeError('isEnabled expects a single character string parameter');
                }
                switch (granularity) {
                    case 'y':
                        return actualFormat.indexOf('Y') !== -1;
                    case 'M':
                        return actualFormat.indexOf('M') !== -1;
                    case 'd':
                        return actualFormat.toLowerCase().indexOf('d') !== -1;
                    case 'h':
                    case 'H':
                        return actualFormat.toLowerCase().indexOf('h') !== -1;
                    case 'm':
                        return actualFormat.indexOf('m') !== -1;
                    case 's':
                        return actualFormat.indexOf('s') !== -1;
                    default:
                        return false;
                }
            },

            hasTime = function () {
                return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
            },

            hasDate = function () {
                return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
            },

            getDatePickerTemplate = function () {
                var headTemplate = $('<thead>')
                        .append($('<tr>')
                            .append($('<th>').addClass('prev').attr('data-action', 'previous')
                                .append($('<span>').addClass(options.icons.previous))
                        )
                            .append($('<th>').addClass('picker-switch').attr('data-action', 'pickerSwitch').attr('colspan', (options.calendarWeeks ? '6' : '5')))
                            .append($('<th>').addClass('next').attr('data-action', 'next')
                                .append($('<span>').addClass(options.icons.next))
                        )
                    ),
                    contTemplate = $('<tbody>')
                        .append($('<tr>')
                            .append($('<td>').attr('colspan', (options.calendarWeeks ? '8' : '7')))
                    );

                return [
                    $('<div>').addClass('datepicker-days')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate)
                            .append($('<tbody>'))
                    ),
                    $('<div>').addClass('datepicker-months')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                    ),
                    $('<div>').addClass('datepicker-years')
                        .append($('<table>').addClass('table-condensed')
                            .append(headTemplate.clone())
                            .append(contTemplate.clone())
                    )
                ];
            },

            getTimePickerMainTemplate = function () {
                var topRow = $('<tr>'),
                    middleRow = $('<tr>'),
                    bottomRow = $('<tr>');

                if (isEnabled('h')) {
                    topRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'incrementHours')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-hour').attr('data-time-component', 'hours').attr('data-action', 'showHours')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'decrementHours')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('m')) {
                    if (isEnabled('h')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'incrementMinutes')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-minute').attr('data-time-component', 'minutes').attr('data-action', 'showMinutes')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'decrementMinutes')
                            .append($('<span>').addClass(options.icons.down))));
                }
                if (isEnabled('s')) {
                    if (isEnabled('m')) {
                        topRow.append($('<td>').addClass('separator'));
                        middleRow.append($('<td>').addClass('separator').html(':'));
                        bottomRow.append($('<td>').addClass('separator'));
                    }
                    topRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'incrementSeconds')
                            .append($('<span>').addClass(options.icons.up))));
                    middleRow.append($('<td>')
                        .append($('<span>').addClass('timepicker-second').attr('data-time-component', 'seconds').attr('data-action', 'showSeconds')));
                    bottomRow.append($('<td>')
                        .append($('<a>').attr({href: '#', tabindex: '-1'}).addClass('btn').attr('data-action', 'decrementSeconds')
                            .append($('<span>').addClass(options.icons.down))));
                }

                if (!use24Hours) {
                    topRow.append($('<td>').addClass('separator'));
                    middleRow.append($('<td>')
                        .append($('<button>').addClass('btn btn-primary').attr('data-action', 'togglePeriod')));
                    bottomRow.append($('<td>').addClass('separator'));
                }

                return $('<div>').addClass('timepicker-picker')
                    .append($('<table>').addClass('table-condensed')
                        .append([topRow, middleRow, bottomRow]));
            },

            getTimePickerTemplate = function () {
                var hoursView = $('<div>').addClass('timepicker-hours')
                        .append($('<table>').addClass('table-condensed')),
                    minutesView = $('<div>').addClass('timepicker-minutes')
                        .append($('<table>').addClass('table-condensed')),
                    secondsView = $('<div>').addClass('timepicker-seconds')
                        .append($('<table>').addClass('table-condensed')),
                    ret = [getTimePickerMainTemplate()];

                if (isEnabled('h')) {
                    ret.push(hoursView);
                }
                if (isEnabled('m')) {
                    ret.push(minutesView);
                }
                if (isEnabled('s')) {
                    ret.push(secondsView);
                }

                return ret;
            },

            getToolbar = function () {
                var row = [];
                if (options.showTodayButton) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'today').append($('<span>').addClass(options.icons.today))));
                }
                if (!options.sideBySide && hasDate() && hasTime()) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'togglePicker').append($('<span>').addClass(options.icons.time))));
                }
                if (options.showClear) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'clear').append($('<span>').addClass(options.icons.clear))));
                }
                if (options.showClose) {
                    row.push($('<td>').append($('<a>').attr('data-action', 'close').append($('<span>').addClass(options.icons.close))));
                }
                return $('<table>').addClass('table-condensed').append($('<tbody>').append($('<tr>').append(row)));
            },

            getTemplate = function () {
                var template = $('<div>').addClass('bootstrap-datetimepicker-widget dropdown-menu'),
                    dateView = $('<div>').addClass('datepicker').append(getDatePickerTemplate()),
                    timeView = $('<div>').addClass('timepicker').append(getTimePickerTemplate()),
                    content = $('<ul>').addClass('list-unstyled'),
                    toolbar = $('<li>').addClass('picker-switch' + (options.collapse ? ' accordion-toggle' : '')).append(getToolbar());

                if (options.inline) {
                    template.removeClass('dropdown-menu');
                }

                if (use24Hours) {
                    template.addClass('usetwentyfour');
                }
                if (options.sideBySide && hasDate() && hasTime()) {
                    template.addClass('timepicker-sbs');
                    template.append(
                        $('<div>').addClass('row')
                            .append(dateView.addClass('col-sm-6'))
                            .append(timeView.addClass('col-sm-6'))
                    );
                    template.append(toolbar);
                    return template;
                }

                if (options.toolbarPlacement === 'top') {
                    content.append(toolbar);
                }
                if (hasDate()) {
                    content.append($('<li>').addClass((options.collapse && hasTime() ? 'collapse in' : '')).append(dateView));
                }
                if (options.toolbarPlacement === 'default') {
                    content.append(toolbar);
                }
                if (hasTime()) {
                    content.append($('<li>').addClass((options.collapse && hasDate() ? 'collapse' : '')).append(timeView));
                }
                if (options.toolbarPlacement === 'bottom') {
                    content.append(toolbar);
                }
                return template.append(content);
            },

            dataToOptions = function () {
                var eData,
                    dataOptions = {};

                if (element.is('input') || options.inline) {
                    eData = element.data();
                } else {
                    eData = element.find('input').data();
                }

                if (eData.dateOptions && eData.dateOptions instanceof Object) {
                    dataOptions = $.extend(true, dataOptions, eData.dateOptions);
                }

                $.each(options, function (key) {
                    var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                    if (eData[attributeName] !== undefined) {
                        dataOptions[key] = eData[attributeName];
                    }
                });
                return dataOptions;
            },

            place = function () {
                var position = (component || element).position(),
                    offset = (component || element).offset(),
                    vertical = options.widgetPositioning.vertical,
                    horizontal = options.widgetPositioning.horizontal,
                    parent;

                if (options.widgetParent) {
                    parent = options.widgetParent.append(widget);
                } else if (element.is('input')) {
                    parent = element.parent().append(widget);
                } else if (options.inline) {
                    parent = element.append(widget);
                    return;
                } else {
                    parent = element;
                    element.children().first().after(widget);
                }

                // Top and bottom logic
                if (vertical === 'auto') {
                    if (offset.top + widget.height() * 1.5 >= $(window).height() + $(window).scrollTop() &&
                        widget.height() + element.outerHeight() < offset.top) {
                        vertical = 'top';
                    } else {
                        vertical = 'bottom';
                    }
                }

                // Left and right logic
                if (horizontal === 'auto') {
                    if (parent.width() < offset.left + widget.outerWidth() / 2 &&
                        offset.left + widget.outerWidth() > $(window).width()) {
                        horizontal = 'right';
                    } else {
                        horizontal = 'left';
                    }
                }

                if (vertical === 'top') {
                    widget.addClass('top').removeClass('bottom');
                } else {
                    widget.addClass('bottom').removeClass('top');
                }

                if (horizontal === 'right') {
                    widget.addClass('pull-right');
                } else {
                    widget.removeClass('pull-right');
                }

                // find the first parent element that has a relative css positioning
                if (parent.css('position') !== 'relative') {
                    parent = parent.parents().filter(function () {
                        return $(this).css('position') === 'relative';
                    }).first();
                }

                if (parent.length === 0) {
                    throw new Error('datetimepicker component should be placed within a relative positioned container');
                }

                widget.css({
                    top: vertical === 'top' ? 'auto' : position.top + element.outerHeight(),
                    bottom: vertical === 'top' ? position.top + element.outerHeight() : 'auto',
                    left: horizontal === 'left' ? parent.css('padding-left') : 'auto',
                    right: horizontal === 'left' ? 'auto' : parent.width() - element.outerWidth()
                });
            },

            notifyEvent = function (e) {
                if (e.type === 'dp.change' && ((e.date && e.date.isSame(e.oldDate)) || (!e.date && !e.oldDate))) {
                    return;
                }
                element.trigger(e);
            },

            showMode = function (dir) {
                if (!widget) {
                    return;
                }
                if (dir) {
                    currentViewMode = Math.max(minViewModeNumber, Math.min(2, currentViewMode + dir));
                }
                widget.find('.datepicker > div').hide().filter('.datepicker-' + datePickerModes[currentViewMode].clsName).show();
            },

            fillDow = function () {
                var row = $('<tr>'),
                    currentDate = viewDate.clone().startOf('w');

                if (options.calendarWeeks === true) {
                    row.append($('<th>').addClass('cw').text('#'));
                }

                while (currentDate.isBefore(viewDate.clone().endOf('w'))) {
                    row.append($('<th>').addClass('dow').text(currentDate.format('dd')));
                    currentDate.add(1, 'd');
                }
                widget.find('.datepicker-days thead').append(row);
            },

            isInDisabledDates = function (testDate) {
                return options.disabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isInEnabledDates = function (testDate) {
                return options.enabledDates[testDate.format('YYYY-MM-DD')] === true;
            },

            isValid = function (targetMoment, granularity) {
                if (!targetMoment.isValid()) {
                    return false;
                }
                if (options.disabledDates && isInDisabledDates(targetMoment) && granularity !== 'M') {
                    return false;
                }
                if (options.enabledDates && !isInEnabledDates(targetMoment) && granularity !== 'M') {
                    return false;
                }
                if (options.minDate && targetMoment.isBefore(options.minDate, granularity)) {
                    return false;
                }
                if (options.maxDate && targetMoment.isAfter(options.maxDate, granularity)) {
                    return false;
                }
                if (granularity === 'd' && options.daysOfWeekDisabled.indexOf(targetMoment.day()) !== -1) { //widget && widget.find('.datepicker-days').length > 0
                    return false;
                }
                return true;
            },

            fillMonths = function () {
                var spans = [],
                    monthsShort = viewDate.clone().startOf('y').hour(12); // hour is changed to avoid DST issues in some browsers
                while (monthsShort.isSame(viewDate, 'y')) {
                    spans.push($('<span>').attr('data-action', 'selectMonth').addClass('month').text(monthsShort.format('MMM')));
                    monthsShort.add(1, 'M');
                }
                widget.find('.datepicker-months td').empty().append(spans);
            },

            updateMonths = function () {
                var monthsView = widget.find('.datepicker-months'),
                    monthsViewHeader = monthsView.find('th'),
                    months = monthsView.find('tbody').find('span');

                monthsView.find('.disabled').removeClass('disabled');

                if (!isValid(viewDate.clone().subtract(1, 'y'), 'y')) {
                    monthsViewHeader.eq(0).addClass('disabled');
                }

                monthsViewHeader.eq(1).text(viewDate.year());

                if (!isValid(viewDate.clone().add(1, 'y'), 'y')) {
                    monthsViewHeader.eq(2).addClass('disabled');
                }

                months.removeClass('active');
                if (date.isSame(viewDate, 'y')) {
                    months.eq(date.month()).addClass('active');
                }

                months.each(function (index) {
                    if (!isValid(viewDate.clone().month(index), 'M')) {
                        $(this).addClass('disabled');
                    }
                });
            },

            updateYears = function () {
                var yearsView = widget.find('.datepicker-years'),
                    yearsViewHeader = yearsView.find('th'),
                    startYear = viewDate.clone().subtract(5, 'y'),
                    endYear = viewDate.clone().add(6, 'y'),
                    html = '';

                yearsView.find('.disabled').removeClass('disabled');

                if (options.minDate && options.minDate.isAfter(startYear, 'y')) {
                    yearsViewHeader.eq(0).addClass('disabled');
                }

                yearsViewHeader.eq(1).text(startYear.year() + '-' + endYear.year());

                if (options.maxDate && options.maxDate.isBefore(endYear, 'y')) {
                    yearsViewHeader.eq(2).addClass('disabled');
                }

                while (!startYear.isAfter(endYear, 'y')) {
                    html += '<span data-action="selectYear" class="year' + (startYear.isSame(date, 'y') ? ' active' : '') + (!isValid(startYear, 'y') ? ' disabled' : '') + '">' + startYear.year() + '</span>';
                    startYear.add(1, 'y');
                }

                yearsView.find('td').html(html);
            },

            fillDate = function () {
                var daysView = widget.find('.datepicker-days'),
                    daysViewHeader = daysView.find('th'),
                    currentDate,
                    html = [],
                    row,
                    clsName;

                if (!hasDate()) {
                    return;
                }

                daysView.find('.disabled').removeClass('disabled');
                daysViewHeader.eq(1).text(viewDate.format(options.dayViewHeaderFormat));

                if (!isValid(viewDate.clone().subtract(1, 'M'), 'M')) {
                    daysViewHeader.eq(0).addClass('disabled');
                }
                if (!isValid(viewDate.clone().add(1, 'M'), 'M')) {
                    daysViewHeader.eq(2).addClass('disabled');
                }

                currentDate = viewDate.clone().startOf('M').startOf('week');

                while (!viewDate.clone().endOf('M').endOf('w').isBefore(currentDate, 'd')) {
                    if (currentDate.weekday() === 0) {
                        row = $('<tr>');
                        if (options.calendarWeeks) {
                            row.append('<td class="cw">' + currentDate.week() + '</td>');
                        }
                        html.push(row);
                    }
                    clsName = '';
                    if (currentDate.isBefore(viewDate, 'M')) {
                        clsName += ' old';
                    }
                    if (currentDate.isAfter(viewDate, 'M')) {
                        clsName += ' new';
                    }
                    if (currentDate.isSame(date, 'd') && !unset) {
                        clsName += ' active';
                    }
                    if (!isValid(currentDate, 'd')) {
                        clsName += ' disabled';
                    }
                    if (currentDate.isSame(moment(), 'd')) {
                        clsName += ' today';
                    }
                    if (currentDate.day() === 0 || currentDate.day() === 6) {
                        clsName += ' weekend';
                    }
                    row.append('<td data-action="selectDay" class="day' + clsName + '">' + currentDate.date() + '</td>');
                    currentDate.add(1, 'd');
                }

                daysView.find('tbody').empty().append(html);

                updateMonths();

                updateYears();
            },

            fillHours = function () {
                var table = widget.find('.timepicker-hours table'),
                    currentHour = viewDate.clone().startOf('d'),
                    html = [],
                    row = $('<tr>');

                if (viewDate.hour() > 11 && !use24Hours) {
                    currentHour.hour(12);
                }
                while (currentHour.isSame(viewDate, 'd') && (use24Hours || (viewDate.hour() < 12 && currentHour.hour() < 12) || viewDate.hour() > 11)) {
                    if (currentHour.hour() % 4 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectHour" class="hour' + (!isValid(currentHour, 'h') ? ' disabled' : '') + '">' + currentHour.format(use24Hours ? 'HH' : 'hh') + '</td>');
                    currentHour.add(1, 'h');
                }
                table.empty().append(html);
            },

            fillMinutes = function () {
                var table = widget.find('.timepicker-minutes table'),
                    currentMinute = viewDate.clone().startOf('h'),
                    html = [],
                    row = $('<tr>'),
                    step = options.stepping === 1 ? 5 : options.stepping;

                while (viewDate.isSame(currentMinute, 'h')) {
                    if (currentMinute.minute() % (step * 4) === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectMinute" class="minute' + (!isValid(currentMinute, 'm') ? ' disabled' : '') + '">' + currentMinute.format('mm') + '</td>');
                    currentMinute.add(step, 'm');
                }
                table.empty().append(html);
            },

            fillSeconds = function () {
                var table = widget.find('.timepicker-seconds table'),
                    currentSecond = viewDate.clone().startOf('m'),
                    html = [],
                    row = $('<tr>');

                while (viewDate.isSame(currentSecond, 'm')) {
                    if (currentSecond.second() % 20 === 0) {
                        row = $('<tr>');
                        html.push(row);
                    }
                    row.append('<td data-action="selectSecond" class="second' + (!isValid(currentSecond, 's') ? ' disabled' : '') + '">' + currentSecond.format('ss') + '</td>');
                    currentSecond.add(5, 's');
                }

                table.empty().append(html);
            },

            fillTime = function () {
                var timeComponents = widget.find('.timepicker span[data-time-component]');
                if (!use24Hours) {
                    widget.find('.timepicker [data-action=togglePeriod]').text(date.format('A'));
                }
                timeComponents.filter('[data-time-component=hours]').text(date.format(use24Hours ? 'HH' : 'hh'));
                timeComponents.filter('[data-time-component=minutes]').text(date.format('mm'));
                timeComponents.filter('[data-time-component=seconds]').text(date.format('ss'));

                fillHours();
                fillMinutes();
                fillSeconds();
            },

            update = function () {
                if (!widget) {
                    return;
                }
                fillDate();
                fillTime();
            },

            setValue = function (targetMoment) {
                var oldDate = unset ? null : date;

                // case of calling setValue(null or false)
                if (!targetMoment) {
                    unset = true;
                    input.val('');
                    element.data('date', '');
                    notifyEvent({
                        type: 'dp.change',
                        date: null,
                        oldDate: oldDate
                    });
                    update();
                    return;
                }

                targetMoment = targetMoment.clone().locale(options.locale);

                if (options.stepping !== 1) {
                    targetMoment.minutes((Math.round(targetMoment.minutes() / options.stepping) * options.stepping) % 60).seconds(0);
                }

                if (isValid(targetMoment)) {
                    date = targetMoment;
                    viewDate = date.clone();
                    input.val(date.format(actualFormat));
                    element.data('date', date.format(actualFormat));
                    update();
                    unset = false;
                    notifyEvent({
                        type: 'dp.change',
                        date: date.clone(),
                        oldDate: oldDate
                    });
                } else {
                    if (!options.keepInvalid) {
                        input.val(unset ? '' : date.format(actualFormat));
                    }
                    notifyEvent({
                        type: 'dp.error',
                        date: targetMoment
                    });
                }
            },

            hide = function () {
                var transitioning = false;
                if (!widget) {
                    return picker;
                }
                // Ignore event if in the middle of a picker transition
                widget.find('.collapse').each(function () {
                    var collapseData = $(this).data('collapse');
                    if (collapseData && collapseData.transitioning) {
                        transitioning = true;
                        return false;
                    }
                    return true;
                });
                if (transitioning) {
                    return picker;
                }
                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.hide();

                $(window).off('resize', place);
                widget.off('click', '[data-action]');
                widget.off('mousedown', false);

                widget.remove();
                widget = false;

                notifyEvent({
                    type: 'dp.hide',
                    date: date.clone()
                });
                return picker;
            },

            clear = function () {
                setValue(null);
            },

            /********************************************************************************
             *
             * Widget UI interaction functions
             *
             ********************************************************************************/
            actions = {
                next: function () {
                    viewDate.add(datePickerModes[currentViewMode].navStep, datePickerModes[currentViewMode].navFnc);
                    fillDate();
                },

                previous: function () {
                    viewDate.subtract(datePickerModes[currentViewMode].navStep, datePickerModes[currentViewMode].navFnc);
                    fillDate();
                },

                pickerSwitch: function () {
                    showMode(1);
                },

                selectMonth: function (e) {
                    var month = $(e.target).closest('tbody').find('span').index($(e.target));
                    viewDate.month(month);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()).month(viewDate.month()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                },

                selectYear: function (e) {
                    var year = parseInt($(e.target).text(), 10) || 0;
                    viewDate.year(year);
                    if (currentViewMode === minViewModeNumber) {
                        setValue(date.clone().year(viewDate.year()));
                        if (!options.inline) {
                            hide();
                        }
                    } else {
                        showMode(-1);
                        fillDate();
                    }
                },

                selectDay: function (e) {
                    var day = viewDate.clone();
                    if ($(e.target).is('.old')) {
                        day.subtract(1, 'M');
                    }
                    if ($(e.target).is('.new')) {
                        day.add(1, 'M');
                    }
                    setValue(day.date(parseInt($(e.target).text(), 10)));
                    if (!hasTime() && !options.keepOpen && !options.inline) {
                        hide();
                    }
                },

                incrementHours: function () {
                    setValue(date.clone().add(1, 'h'));
                },

                incrementMinutes: function () {
                    setValue(date.clone().add(options.stepping, 'm'));
                },

                incrementSeconds: function () {
                    setValue(date.clone().add(1, 's'));
                },

                decrementHours: function () {
                    setValue(date.clone().subtract(1, 'h'));
                },

                decrementMinutes: function () {
                    setValue(date.clone().subtract(options.stepping, 'm'));
                },

                decrementSeconds: function () {
                    setValue(date.clone().subtract(1, 's'));
                },

                togglePeriod: function () {
                    setValue(date.clone().add((date.hours() >= 12) ? -12 : 12, 'h'));
                },

                togglePicker: function (e) {
                    var $this = $(e.target),
                        $parent = $this.closest('ul'),
                        expanded = $parent.find('.in'),
                        closed = $parent.find('.collapse:not(.in)'),
                        collapseData;

                    if (expanded && expanded.length) {
                        collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) {
                            return;
                        }
                        if (expanded.collapse) { // if collapse plugin is available through bootstrap.js then use it
                            expanded.collapse('hide');
                            closed.collapse('show');
                        } else { // otherwise just toggle in class on the two views
                            expanded.removeClass('in');
                            closed.addClass('in');
                        }
                        if ($this.is('span')) {
                            $this.toggleClass(options.icons.time + ' ' + options.icons.date);
                        } else {
                            $this.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        }

                        // NOTE: uncomment if toggled state will be restored in show()
                        //if (component) {
                        //    component.find('span').toggleClass(options.icons.time + ' ' + options.icons.date);
                        //}
                    }
                },

                showPicker: function () {
                    widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                    widget.find('.timepicker .timepicker-picker').show();
                },

                showHours: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-hours').show();
                },

                showMinutes: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-minutes').show();
                },

                showSeconds: function () {
                    widget.find('.timepicker .timepicker-picker').hide();
                    widget.find('.timepicker .timepicker-seconds').show();
                },

                selectHour: function (e) {
                    var hour = parseInt($(e.target).text(), 10);

                    if (!use24Hours) {
                        if (date.hours() >= 12) {
                            if (hour !== 12) {
                                hour += 12;
                            }
                        } else {
                            if (hour === 12) {
                                hour = 0;
                            }
                        }
                    }
                    setValue(date.clone().hours(hour));
                    actions.showPicker.call(picker);
                },

                selectMinute: function (e) {
                    setValue(date.clone().minutes(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                selectSecond: function (e) {
                    setValue(date.clone().seconds(parseInt($(e.target).text(), 10)));
                    actions.showPicker.call(picker);
                },

                clear: clear,

                today: function () {
                    setValue(moment());
                },

                close: hide
            },

            doAction = function (e) {
                if ($(e.currentTarget).is('.disabled')) {
                    return false;
                }
                actions[$(e.currentTarget).data('action')].apply(picker, arguments);
                return false;
            },

            show = function () {
                var currentMoment,
                    useCurrentGranularity = {
                        'year': function (m) {
                            return m.month(0).date(1).hours(0).seconds(0).minutes(0);
                        },
                        'month': function (m) {
                            return m.date(1).hours(0).seconds(0).minutes(0);
                        },
                        'day': function (m) {
                            return m.hours(0).seconds(0).minutes(0);
                        },
                        'hour': function (m) {
                            return m.seconds(0).minutes(0);
                        },
                        'minute': function (m) {
                            return m.seconds(0);
                        }
                    };

                if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly')) || widget) {
                    return picker;
                }
                if (options.useCurrent && unset && ((input.is('input') && input.val().trim().length === 0) || options.inline)) {
                    currentMoment = moment();
                    if (typeof options.useCurrent === 'string') {
                        currentMoment = useCurrentGranularity[options.useCurrent](currentMoment);
                    }
                    setValue(currentMoment);
                }

                widget = getTemplate();

                fillDow();
                fillMonths();

                widget.find('.timepicker-hours').hide();
                widget.find('.timepicker-minutes').hide();
                widget.find('.timepicker-seconds').hide();

                update();
                showMode();

                $(window).on('resize', place);
                widget.on('click', '[data-action]', doAction); // this handles clicks on the widget
                widget.on('mousedown', false);

                if (component && component.hasClass('btn')) {
                    component.toggleClass('active');
                }
                widget.show();
                place();

                if (!input.is(':focus')) {
                    input.focus();
                }

                notifyEvent({
                    type: 'dp.show'
                });
                return picker;
            },

            toggle = function () {
                return (widget ? hide() : show());
            },

            parseInputDate = function (inputDate) {
                if (moment.isMoment(inputDate) || inputDate instanceof Date) {
                    inputDate = moment(inputDate);
                } else {
                    inputDate = moment(inputDate, parseFormats, options.useStrict);
                }
                inputDate.locale(options.locale);
                return inputDate;
            },

            keydown = function (e) {
                //if (e.keyCode === 27 && widget) { // allow escape to hide picker
                //    hide();
                //    return false;
                //}
                //if (e.keyCode === 40 && !widget) { // allow down to show picker
                //    show();
                //    e.preventDefault();
                //}
                //return true;

                var handler = null,
                    index,
                    index2,
                    pressedKeys = [],
                    pressedModifiers = {},
                    currentKey = e.which,
                    keyBindKeys,
                    allModifiersPressed,
                    pressed = 'p';

                keyState[currentKey] = pressed;

                for (index in keyState) {
                    if (keyState.hasOwnProperty(index) && keyState[index] === pressed) {
                        pressedKeys.push(index);
                        if (parseInt(index, 10) !== currentKey) {
                            pressedModifiers[index] = true;
                        }
                    }
                }

                for (index in options.keyBinds) {
                    if (options.keyBinds.hasOwnProperty(index) && typeof (options.keyBinds[index]) === 'function') {
                        keyBindKeys = index.split(' ');
                        if (keyBindKeys.length === pressedKeys.length && keyMap[currentKey] === keyBindKeys[keyBindKeys.length - 1]) {
                            allModifiersPressed = true;
                            for (index2 = keyBindKeys.length - 2; index2 >= 0; index2--) {
                                if (!(keyMap[keyBindKeys[index2]] in pressedModifiers)) {
                                    allModifiersPressed = false;
                                    break;
                                }
                            }
                            if (allModifiersPressed) {
                                handler = options.keyBinds[index];
                                break;
                            }
                        }
                    }
                }

                if (handler) {
                    handler.call(picker, widget);
                    e.stopPropagation();
                    e.preventDefault();
                }
            },

            keyup = function (e) {
                keyState[e.which] = 'r';
                e.stopPropagation();
                e.preventDefault();
            },

            change = function (e) {
                var val = $(e.target).val().trim(),
                    parsedDate = val ? parseInputDate(val) : null;
                setValue(parsedDate);
                e.stopImmediatePropagation();
                return false;
            },

            attachDatePickerElementEvents = function () {
                input.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'keyup': keyup
                });

                if (element.is('input')) {
                    input.on({
                        'focus': show
                    });
                } else if (component) {
                    component.on('click', toggle);
                    component.on('mousedown', false);
                }
            },

            detachDatePickerElementEvents = function () {
                input.off({
                    'change': change,
                    'blur': hide,
                    'keydown': keydown,
                    'keyup': keyup
                });

                if (element.is('input')) {
                    input.off({
                        'focus': show
                    });
                } else if (component) {
                    component.off('click', toggle);
                    component.off('mousedown', false);
                }
            },

            indexGivenDates = function (givenDatesArray) {
                // Store given enabledDates and disabledDates as keys.
                // This way we can check their existence in O(1) time instead of looping through whole array.
                // (for example: options.enabledDates['2014-02-27'] === true)
                var givenDatesIndexed = {};
                $.each(givenDatesArray, function () {
                    var dDate = parseInputDate(this);
                    if (dDate.isValid()) {
                        givenDatesIndexed[dDate.format('YYYY-MM-DD')] = true;
                    }
                });
                return (Object.keys(givenDatesIndexed).length) ? givenDatesIndexed : false;
            },

            initFormatting = function () {
                var format = options.format || 'L LT';

                actualFormat = format.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput) {
                    var newinput = date.localeData().longDateFormat(formatInput) || formatInput;
                    return newinput.replace(/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, function (formatInput2) { //temp fix for #740
                        return date.localeData().longDateFormat(formatInput2) || formatInput2;
                    });
                });


                parseFormats = options.extraFormats ? options.extraFormats.slice() : [];
                if (parseFormats.indexOf(format) < 0 && parseFormats.indexOf(actualFormat) < 0) {
                    parseFormats.push(actualFormat);
                }

                use24Hours = (actualFormat.toLowerCase().indexOf('a') < 1 && actualFormat.indexOf('h') < 1);

                if (isEnabled('y')) {
                    minViewModeNumber = 2;
                }
                if (isEnabled('M')) {
                    minViewModeNumber = 1;
                }
                if (isEnabled('d')) {
                    minViewModeNumber = 0;
                }

                currentViewMode = Math.max(minViewModeNumber, currentViewMode);

                if (!unset) {
                    setValue(date);
                }
            };

        /********************************************************************************
         *
         * Public API functions
         * =====================
         *
         * Important: Do not expose direct references to private objects or the options
         * object to the outer world. Always return a clone when returning values or make
         * a clone when setting a private variable.
         *
         ********************************************************************************/
        picker.destroy = function () {
            hide();
            detachDatePickerElementEvents();
            element.removeData('DateTimePicker');
            element.removeData('date');
        };

        picker.toggle = toggle;

        picker.show = show;

        picker.hide = hide;

        picker.disable = function () {
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            input.prop('disabled', true);
            return picker;
        };

        picker.enable = function () {
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            input.prop('disabled', false);
            return picker;
        };

        picker.ignoreReadonly = function (ignoreReadonly) {
            if (arguments.length === 0) {
                return options.ignoreReadonly;
            }
            if (typeof ignoreReadonly !== 'boolean') {
                throw new TypeError('ignoreReadonly () expects a boolean parameter');
            }
            options.ignoreReadonly = ignoreReadonly;
            return picker;
        };

        picker.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (picker[key] !== undefined) {
                    picker[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return picker;
        };

        picker.date = function (newDate) {
            if (arguments.length === 0) {
                if (unset) {
                    return null;
                }
                return date.clone();
            }

            if (newDate !== null && typeof newDate !== 'string' && !moment.isMoment(newDate) && !(newDate instanceof Date)) {
                throw new TypeError('date() parameter must be one of [null, string, moment or Date]');
            }

            setValue(newDate === null ? null : parseInputDate(newDate));
            return picker;
        };

        picker.format = function (newFormat) {
            if (arguments.length === 0) {
                return options.format;
            }

            if ((typeof newFormat !== 'string') && ((typeof newFormat !== 'boolean') || (newFormat !== false))) {
                throw new TypeError('format() expects a sting or boolean:false parameter ' + newFormat);
            }

            options.format = newFormat;
            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.dayViewHeaderFormat = function (newFormat) {
            if (arguments.length === 0) {
                return options.dayViewHeaderFormat;
            }

            if (typeof newFormat !== 'string') {
                throw new TypeError('dayViewHeaderFormat() expects a string parameter');
            }

            options.dayViewHeaderFormat = newFormat;
            return picker;
        };

        picker.extraFormats = function (formats) {
            if (arguments.length === 0) {
                return options.extraFormats;
            }

            if (formats !== false && !(formats instanceof Array)) {
                throw new TypeError('extraFormats() expects an array or false parameter');
            }

            options.extraFormats = formats;
            if (parseFormats) {
                initFormatting(); // reinit formatting
            }
            return picker;
        };

        picker.disabledDates = function (dates) {
            if (arguments.length === 0) {
                return (options.disabledDates ? $.extend({}, options.disabledDates) : options.disabledDates);
            }

            if (!dates) {
                options.disabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('disabledDates() expects an array parameter');
            }
            options.disabledDates = indexGivenDates(dates);
            options.enabledDates = false;
            update();
            return picker;
        };

        picker.enabledDates = function (dates) {
            if (arguments.length === 0) {
                return (options.enabledDates ? $.extend({}, options.enabledDates) : options.enabledDates);
            }

            if (!dates) {
                options.enabledDates = false;
                update();
                return picker;
            }
            if (!(dates instanceof Array)) {
                throw new TypeError('enabledDates() expects an array parameter');
            }
            options.enabledDates = indexGivenDates(dates);
            options.disabledDates = false;
            update();
            return picker;
        };

        picker.daysOfWeekDisabled = function (daysOfWeekDisabled) {
            if (arguments.length === 0) {
                return options.daysOfWeekDisabled.splice(0);
            }

            if (!(daysOfWeekDisabled instanceof Array)) {
                throw new TypeError('daysOfWeekDisabled() expects an array parameter');
            }
            options.daysOfWeekDisabled = daysOfWeekDisabled.reduce(function (previousValue, currentValue) {
                currentValue = parseInt(currentValue, 10);
                if (currentValue > 6 || currentValue < 0 || isNaN(currentValue)) {
                    return previousValue;
                }
                if (previousValue.indexOf(currentValue) === -1) {
                    previousValue.push(currentValue);
                }
                return previousValue;
            }, []).sort();
            update();
            return picker;
        };

        picker.maxDate = function (maxDate) {
            if (arguments.length === 0) {
                return options.maxDate ? options.maxDate.clone() : options.maxDate;
            }

            if ((typeof maxDate === 'boolean') && maxDate === false) {
                options.maxDate = false;
                update();
                return picker;
            }

            if (typeof maxDate === 'string') {
                if (maxDate === 'now' || maxDate === 'moment') {
                    maxDate = moment();
                }
            }

            var parsedDate = parseInputDate(maxDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('maxDate() Could not parse date parameter: ' + maxDate);
            }
            if (options.minDate && parsedDate.isBefore(options.minDate)) {
                throw new TypeError('maxDate() date parameter is before options.minDate: ' + parsedDate.format(actualFormat));
            }
            options.maxDate = parsedDate;
            if (options.maxDate.isBefore(maxDate)) {
                setValue(options.maxDate);
            }
            if (viewDate.isAfter(parsedDate)) {
                viewDate = parsedDate.clone();
            }
            update();
            return picker;
        };

        picker.minDate = function (minDate) {
            if (arguments.length === 0) {
                return options.minDate ? options.minDate.clone() : options.minDate;
            }

            if ((typeof minDate === 'boolean') && minDate === false) {
                options.minDate = false;
                update();
                return picker;
            }

            if (typeof minDate === 'string') {
                if (minDate === 'now' || minDate === 'moment') {
                    minDate = moment();
                }
            }

            var parsedDate = parseInputDate(minDate);

            if (!parsedDate.isValid()) {
                throw new TypeError('minDate() Could not parse date parameter: ' + minDate);
            }
            if (options.maxDate && parsedDate.isAfter(options.maxDate)) {
                throw new TypeError('minDate() date parameter is after options.maxDate: ' + parsedDate.format(actualFormat));
            }
            options.minDate = parsedDate;
            if (options.minDate.isAfter(minDate)) {
                setValue(options.minDate);
            }
            if (viewDate.isBefore(parsedDate)) {
                viewDate = parsedDate.clone();
            }
            update();
            return picker;
        };

        picker.defaultDate = function (defaultDate) {
            if (arguments.length === 0) {
                return options.defaultDate ? options.defaultDate.clone() : options.defaultDate;
            }
            if (!defaultDate) {
                options.defaultDate = false;
                return picker;
            }

            if (typeof defaultDate === 'string') {
                if (defaultDate === 'now' || defaultDate === 'moment') {
                    defaultDate = moment();
                }
            }

            var parsedDate = parseInputDate(defaultDate);
            if (!parsedDate.isValid()) {
                throw new TypeError('defaultDate() Could not parse date parameter: ' + defaultDate);
            }
            if (!isValid(parsedDate)) {
                throw new TypeError('defaultDate() date passed is invalid according to component setup validations');
            }

            options.defaultDate = parsedDate;

            if (options.defaultDate && input.val().trim() === '' && input.attr('placeholder') === undefined) {
                setValue(options.defaultDate);
            }
            return picker;
        };

        picker.locale = function (locale) {
            if (arguments.length === 0) {
                return options.locale;
            }

            if (!moment.localeData(locale)) {
                throw new TypeError('locale() locale ' + locale + ' is not loaded from moment locales!');
            }

            options.locale = locale;
            date.locale(options.locale);
            viewDate.locale(options.locale);

            if (actualFormat) {
                initFormatting(); // reinit formatting
            }
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.stepping = function (stepping) {
            if (arguments.length === 0) {
                return options.stepping;
            }

            stepping = parseInt(stepping, 10);
            if (isNaN(stepping) || stepping < 1) {
                stepping = 1;
            }
            options.stepping = stepping;
            return picker;
        };

        picker.useCurrent = function (useCurrent) {
            var useCurrentOptions = ['year', 'month', 'day', 'hour', 'minute'];
            if (arguments.length === 0) {
                return options.useCurrent;
            }

            if ((typeof useCurrent !== 'boolean') && (typeof useCurrent !== 'string')) {
                throw new TypeError('useCurrent() expects a boolean or string parameter');
            }
            if (typeof useCurrent === 'string' && useCurrentOptions.indexOf(useCurrent.toLowerCase()) === -1) {
                throw new TypeError('useCurrent() expects a string parameter of ' + useCurrentOptions.join(', '));
            }
            options.useCurrent = useCurrent;
            return picker;
        };

        picker.collapse = function (collapse) {
            if (arguments.length === 0) {
                return options.collapse;
            }

            if (typeof collapse !== 'boolean') {
                throw new TypeError('collapse() expects a boolean parameter');
            }
            if (options.collapse === collapse) {
                return picker;
            }
            options.collapse = collapse;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.icons = function (icons) {
            if (arguments.length === 0) {
                return $.extend({}, options.icons);
            }

            if (!(icons instanceof Object)) {
                throw new TypeError('icons() expects parameter to be an Object');
            }
            $.extend(options.icons, icons);
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.useStrict = function (useStrict) {
            if (arguments.length === 0) {
                return options.useStrict;
            }

            if (typeof useStrict !== 'boolean') {
                throw new TypeError('useStrict() expects a boolean parameter');
            }
            options.useStrict = useStrict;
            return picker;
        };

        picker.sideBySide = function (sideBySide) {
            if (arguments.length === 0) {
                return options.sideBySide;
            }

            if (typeof sideBySide !== 'boolean') {
                throw new TypeError('sideBySide() expects a boolean parameter');
            }
            options.sideBySide = sideBySide;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.viewMode = function (viewMode) {
            if (arguments.length === 0) {
                return options.viewMode;
            }

            if (typeof viewMode !== 'string') {
                throw new TypeError('viewMode() expects a string parameter');
            }

            if (viewModes.indexOf(viewMode) === -1) {
                throw new TypeError('viewMode() parameter must be one of (' + viewModes.join(', ') + ') value');
            }

            options.viewMode = viewMode;
            currentViewMode = Math.max(viewModes.indexOf(viewMode), minViewModeNumber);

            showMode();
            return picker;
        };

        picker.toolbarPlacement = function (toolbarPlacement) {
            if (arguments.length === 0) {
                return options.toolbarPlacement;
            }

            if (typeof toolbarPlacement !== 'string') {
                throw new TypeError('toolbarPlacement() expects a string parameter');
            }
            if (toolbarPlacements.indexOf(toolbarPlacement) === -1) {
                throw new TypeError('toolbarPlacement() parameter must be one of (' + toolbarPlacements.join(', ') + ') value');
            }
            options.toolbarPlacement = toolbarPlacement;

            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetPositioning = function (widgetPositioning) {
            if (arguments.length === 0) {
                return $.extend({}, options.widgetPositioning);
            }

            if (({}).toString.call(widgetPositioning) !== '[object Object]') {
                throw new TypeError('widgetPositioning() expects an object variable');
            }
            if (widgetPositioning.horizontal) {
                if (typeof widgetPositioning.horizontal !== 'string') {
                    throw new TypeError('widgetPositioning() horizontal variable must be a string');
                }
                widgetPositioning.horizontal = widgetPositioning.horizontal.toLowerCase();
                if (horizontalModes.indexOf(widgetPositioning.horizontal) === -1) {
                    throw new TypeError('widgetPositioning() expects horizontal parameter to be one of (' + horizontalModes.join(', ') + ')');
                }
                options.widgetPositioning.horizontal = widgetPositioning.horizontal;
            }
            if (widgetPositioning.vertical) {
                if (typeof widgetPositioning.vertical !== 'string') {
                    throw new TypeError('widgetPositioning() vertical variable must be a string');
                }
                widgetPositioning.vertical = widgetPositioning.vertical.toLowerCase();
                if (verticalModes.indexOf(widgetPositioning.vertical) === -1) {
                    throw new TypeError('widgetPositioning() expects vertical parameter to be one of (' + verticalModes.join(', ') + ')');
                }
                options.widgetPositioning.vertical = widgetPositioning.vertical;
            }
            update();
            return picker;
        };

        picker.calendarWeeks = function (calendarWeeks) {
            if (arguments.length === 0) {
                return options.calendarWeeks;
            }

            if (typeof calendarWeeks !== 'boolean') {
                throw new TypeError('calendarWeeks() expects parameter to be a boolean value');
            }

            options.calendarWeeks = calendarWeeks;
            update();
            return picker;
        };

        picker.showTodayButton = function (showTodayButton) {
            if (arguments.length === 0) {
                return options.showTodayButton;
            }

            if (typeof showTodayButton !== 'boolean') {
                throw new TypeError('showTodayButton() expects a boolean parameter');
            }

            options.showTodayButton = showTodayButton;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.showClear = function (showClear) {
            if (arguments.length === 0) {
                return options.showClear;
            }

            if (typeof showClear !== 'boolean') {
                throw new TypeError('showClear() expects a boolean parameter');
            }

            options.showClear = showClear;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.widgetParent = function (widgetParent) {
            if (arguments.length === 0) {
                return options.widgetParent;
            }

            if (typeof widgetParent === 'string') {
                widgetParent = $(widgetParent);
            }

            if (widgetParent !== null && (typeof widgetParent !== 'string' && !(widgetParent instanceof $))) {
                throw new TypeError('widgetParent() expects a string or a jQuery object parameter');
            }

            options.widgetParent = widgetParent;
            if (widget) {
                hide();
                show();
            }
            return picker;
        };

        picker.keepOpen = function (keepOpen) {
            if (arguments.length === 0) {
                return options.keepOpen;
            }

            if (typeof keepOpen !== 'boolean') {
                throw new TypeError('keepOpen() expects a boolean parameter');
            }

            options.keepOpen = keepOpen;
            return picker;
        };

        picker.inline = function (inline) {
            if (arguments.length === 0) {
                return options.inline;
            }

            if (typeof inline !== 'boolean') {
                throw new TypeError('inline() expects a boolean parameter');
            }

            options.inline = inline;
            return picker;
        };

        picker.clear = function () {
            clear();
            return picker;
        };

        picker.keyBinds = function (keyBinds) {
            options.keyBinds = keyBinds;
            return picker;
        };

        picker.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }

            options.debug = debug;
            return picker;
        };

        picker.showClose = function (showClose) {
            if (arguments.length === 0) {
                return options.showClose;
            }

            if (typeof showClose !== 'boolean') {
                throw new TypeError('showClose() expects a boolean parameter');
            }

            options.showClose = showClose;
            return picker;
        };

        picker.keepInvalid = function (keepInvalid) {
            if (arguments.length === 0) {
                return options.keepInvalid;
            }

            if (typeof keepInvalid !== 'boolean') {
                throw new TypeError('keepInvalid() expects a boolean parameter');
            }
            options.keepInvalid = keepInvalid;
            return picker;
        };

        picker.datepickerInput = function (datepickerInput) {
            if (arguments.length === 0) {
                return options.datepickerInput;
            }

            if (typeof datepickerInput !== 'string') {
                throw new TypeError('datepickerInput() expects a string parameter');
            }

            options.datepickerInput = datepickerInput;
            return picker;
        };

        // initializing element and component attributes
        if (element.is('input')) {
            input = element;
        } else {
            input = element.find(options.datepickerInput);
            if (input.size() === 0) {
                input = element.find('input');
            } else if (!input.is('input')) {
                throw new Error('CSS class "' + options.datepickerInput + '" cannot be applied to non input element');
            }
        }

        if (element.hasClass('input-group')) {
            // in case there is more then one 'input-group-addon' Issue #48
            if (element.find('.datepickerbutton').size() === 0) {
                component = element.find('[class^="input-group-"]');
            } else {
                component = element.find('.datepickerbutton');
            }
        }

        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize DateTimePicker without an input element');
        }

        $.extend(true, options, dataToOptions());

        picker.options(options);

        initFormatting();

        attachDatePickerElementEvents();

        if (input.prop('disabled')) {
            picker.disable();
        }
        if (input.is('input') && input.val().trim().length !== 0) {
            setValue(parseInputDate(input.val().trim()));
        }
        else if (options.defaultDate && input.attr('placeholder') === undefined) {
            setValue(options.defaultDate);
        }
        if (options.inline) {
            show();
        }
        return picker;
    };

    /********************************************************************************
     *
     * jQuery plugin constructor and defaults object
     *
     ********************************************************************************/

    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('DateTimePicker')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.datetimepicker.defaults, options);
                $this.data('DateTimePicker', dateTimePicker($this, options));
            }
        });
    };

    $.fn.datetimepicker.defaults = {
        format: false,
        dayViewHeaderFormat: 'MMMM YYYY',
        extraFormats: false,
        stepping: 1,
        minDate: false,
        maxDate: false,
        useCurrent: true,
        collapse: true,
        locale: moment.locale(),
        defaultDate: false,
        disabledDates: false,
        enabledDates: false,
        icons: {
            time: 'glyphicon glyphicon-time',
            date: 'glyphicon glyphicon-calendar',
            up: 'glyphicon glyphicon-chevron-up',
            down: 'glyphicon glyphicon-chevron-down',
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right',
            today: 'glyphicon glyphicon-screenshot',
            clear: 'glyphicon glyphicon-trash',
            close: 'glyphicon glyphicon-remove'
        },
        useStrict: false,
        sideBySide: false,
        daysOfWeekDisabled: [],
        calendarWeeks: false,
        viewMode: 'days',
        toolbarPlacement: 'default',
        showTodayButton: false,
        showClear: false,
        showClose: false,
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'auto'
        },
        widgetParent: null,
        ignoreReadonly: false,
        keepOpen: false,
        inline: false,
        keepInvalid: false,
        datepickerInput: '.datepickerinput',
        keyBinds: {
            up: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(7, 'd'));
                } else {
                    this.date(d.clone().add(1, 'm'));
                }
            },
            down: function (widget) {
                if (!widget) {
                    this.show();
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(7, 'd'));
                } else {
                    this.date(d.clone().subtract(1, 'm'));
                }
            },
            'control up': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'y'));
                } else {
                    this.date(d.clone().add(1, 'h'));
                }
            },
            'control down': function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'y'));
                } else {
                    this.date(d.clone().subtract(1, 'h'));
                }
            },
            left: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'd'));
                }
            },
            right: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'd'));
                }
            },
            pageUp: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().subtract(1, 'M'));
                }
            },
            pageDown: function (widget) {
                if (!widget) {
                    return;
                }
                var d = this.date() || moment();
                if (widget.find('.datepicker').is(':visible')) {
                    this.date(d.clone().add(1, 'M'));
                }
            },
            enter: function () {
                this.hide();
            },
            escape: function () {
                this.hide();
            },
            //tab: function (widget) { //this break the flow of the form. disabling for now
            //    var toggle = widget.find('.picker-switch a[data-action="togglePicker"]');
            //    if(toggle.length > 0) toggle.click();
            //},
            'control space': function (widget) {
                if (widget.find('.timepicker').is(':visible')) {
                    widget.find('.btn[data-action="togglePeriod"]').click();
                }
            },
            t: function () {
                this.date(moment());
            },
            'delete': function () {
                this.clear();
            }
        },
        debug: false
    };
}));