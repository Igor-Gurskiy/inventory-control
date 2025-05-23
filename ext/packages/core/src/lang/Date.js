/* eslint-disable max-len */
/**
 * @class Ext.Date
 * This class defines some basic methods for handling dates.
 *
 * The date parsing and formatting syntax contains a subset of
 * [PHP's `date()` function](http://www.php.net/date), and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 *
 *      Format      Description                                                               Example returned values
 *      ------      -----------------------------------------------------------------------   -----------------------
 *        d         Day of the month, 2 digits with leading zeros                             01 to 31
 *        D         A short textual representation of the day of the week                     Mon to Sun
 *        j         Day of the month without leading zeros                                    1 to 31
 *        l         A full textual representation of the day of the week                      Sunday to Saturday
 *        N         ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
 *        S         English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
 *        w         Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
 *        z         The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
 *        W         ISO-8601 week number of year, weeks starting on Monday                    01 to 53
 *        F         A full textual representation of a month, such as January or March        January to December
 *        m         Numeric representation of a month, with leading zeros                     01 to 12
 *        M         A short textual representation of a month                                 Jan to Dec
 *        n         Numeric representation of a month, without leading zeros                  1 to 12
 *        t         Number of days in the given month                                         28 to 31
 *        L         Whether it&#39;s a leap year                                                  1 if it is a leap year, 0 otherwise.
 *        o         ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
 *                  belongs to the previous or next year, that year is used instead)
 *        Y         A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
 *        y         A two digit representation of a year                                      Examples: 99 or 03
 *        a         Lowercase Ante meridiem and Post meridiem                                 am or pm
 *        A         Uppercase Ante meridiem and Post meridiem                                 AM or PM
 *        g         12-hour format of an hour without leading zeros                           1 to 12
 *        G         24-hour format of an hour without leading zeros                           0 to 23
 *        h         12-hour format of an hour with leading zeros                              01 to 12
 *        H         24-hour format of an hour with leading zeros                              00 to 23
 *        i         Minutes, with leading zeros                                               00 to 59
 *        s         Seconds, with leading zeros                                               00 to 59
 *        u         Decimal fraction of a second                                              Examples:
 *                  (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
 *                                                                                            100 (i.e. 0.100s) or
 *                                                                                            999 (i.e. 0.999s) or
 *                                                                                            999876543210 (i.e. 0.999876543210s)
 *        O         Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
 *        P         Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
 *        T         Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
 *        Z         Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
 *        c         ISO 8601 date represented as the local time with an offset to UTC appended.
 *                  Notes:                                                                    Examples:
 *                  1) If unspecified, the month / day defaults to the current month / day,   1991 or
 *                     the time defaults to midnight, while the timezone defaults to the      1992-10 or
 *                     browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
 *                     and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
 *                     are optional.                                                          1995-07-18T17:21:28-02:00 or
 *                  2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
 *                     least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
 *                     of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
 *                  Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
 *                  date-time granularity which are supported, or see                         2000-02-13T21:25:33
 *                  http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
 *        C         An ISO date string as implemented by the native Date object's             1962-06-17T09:21:34.125Z
 *                  [Date.toISOString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
 *                  method. This outputs the numeric part with *UTC* hour and minute
 *                  values, and indicates this by appending the `'Z'` timezone
 *                  identifier.
 *        U         Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
 *        MS        Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
 *                                                                                            \/Date(1238606590509+0800)\/
 *        time      A javascript millisecond timestamp                                        1350024476440
 *        timestamp A UNIX timestamp (same as U)                                              1350024866
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 *
 *     // Sample date:
 *     // 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'
 *
 *     var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
 *     console.log(Ext.Date.format(dt, 'Y-m-d'));                          // 2007-01-10
 *     console.log(Ext.Date.format(dt, 'F j, Y, g:i a'));                  // January 10, 2007, 3:05 pm
 *     console.log(Ext.Date.format(dt, 'l, \\t\\he jS \\of F Y h:i:s A')); // Wednesday, the 10th of January 2007 03:05:01 PM
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of Ext.Date, but to use them you can simply copy this
 * block of code into any script that is included after Ext.Date and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 *
 *     Ext.Date.patterns = {
 *         ISO8601Long:"Y-m-d H:i:s",
 *         ISO8601Short:"Y-m-d",
 *         ShortDate: "n/j/Y",
 *         LongDate: "l, F d, Y",
 *         FullDateTime: "l, F d, Y g:i:s A",
 *         MonthDay: "F d",
 *         ShortTime: "g:i A",
 *         LongTime: "g:i:s A",
 *         SortableDateTime: "Y-m-d\\TH:i:s",
 *         UniversalSortableDateTime: "Y-m-d H:i:sO",
 *         YearMonth: "F, Y"
 *     };
 *
 * Example usage:
 *
 *     var dt = new Date();
 *     console.log(Ext.Date.format(dt, Ext.Date.patterns.ShortDate));
 *
 * Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.
 * @singleton
 */
Ext.Date = (function() {
/* eslint-disable indent */
// @define Ext.lang.Date
// @define Ext.Date
// @require Ext
// @require Ext.lang.String
  var utilDate,
      nativeDate = Date,
      stripEscapeRe = /(\\.)/g,
      hourInfoRe = /([gGhHisucUOPZ]|MS)/,
      dateInfoRe = /([djzmnYycU]|MS)/,
      slashRe = /\\/gi,
      numberTokenRe = /\{(\d+)\}/g,
      MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
      datePartsRe = /^(?:(\d{1,4})|(\w{3,}))[/\-.\\\s](?:(\d{1,2})|(\w{3,}))[/\-.\\\s](\d{1,4})$/,
      pad = Ext.String.leftPad,

      dayInfo = {
          d: true,
          j: true
      },

      monthInfo = {
          F: true,
          m: true,
          M: true,
          n: true
      },

      yearInfo = {
          o: true,
          Y: true,
          y: true
      },

      // Most of the date-formatting functions below are the excellent work of Baron Schwartz.
      // (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
      // They generate precompiled functions from format patterns instead of parsing and
      // processing each pattern every time a date is formatted.
      code = [
        // date calculations (note: the code below creates a dependency on Ext.Number.from())
        "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday, daysInMonth, dayMatched,",
            "def = me.defaults,",
            "from = Ext.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = me.clearTime(new Date);",

                "y = from(y, from(def.y, dt.getFullYear()));",
                "m = from(m, from(def.m - 1, dt.getMonth()));",
                "dayMatched = d !== undefined;",
                "d = from(d, from(def.d, dt.getDate()));",

                // Attempt to validate the day. Since it defaults to today, it may go out
                // of range, for example parsing m/Y where the value is 02/2000 on the 31st of May.
                // It will attempt to parse 2000/02/31, which will overflow to March and end up
                // returning 03/2000. We only do this when we default the day. If an invalid day value
                // was set to be parsed by the user, continue on and either let it overflow or return null
                // depending on the strict value. This will be in line with the normal Date behaviour.

                "if (!dayMatched) {",
                    "dt.setDate(1);",
                    "dt.setMonth(m);",
                    "dt.setFullYear(y);",

                    "daysInMonth = me.getDaysInMonth(dt);",
                    "if (d > daysInMonth) {",
                        "d = daysInMonth;",
                    "}",
                "}",

                "h  = from(h, from(def.h, dt.getHours()));",
                "i  = from(i, from(def.i, dt.getMinutes()));",
                "s  = from(s, from(def.s, dt.getSeconds()));",
                "ms = from(ms, from(def.ms, dt.getMilliseconds()));",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    // handle years < 100 appropriately
                    "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
                "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    "if (W) {", // support ISO-8601
                        // http://en.wikipedia.org/wiki/ISO_week_date
                        //
                        // Mutually equivalent definitions for week 01 are:
                        // a. the week starting with the Monday which is nearest in time to 1 January
                        // b. the week with 4 January in it
                        // ... there are many others ...
                        //
                        // We'll use letter b above to determine the first week of the year.
                        //
                        // So, first get a Date object for January 4th of whatever calendar year is desired.
                        //
                        // Then, the first Monday of the year can easily be determined by (operating on this Date):
                        // 1. Getting the day of the week.
                        // 2. Subtracting that by one.
                        // 3. Multiplying that by 86400000 (one day in ms).
                        // 4. Subtracting this number of days (in ms) from the January 4 date (represented in ms).
                        //
                        // Example #1 ...
                        //
                        //       January 2012
                        //   Su Mo Tu We Th Fr Sa
                        //    1  2  3  4  5  6  7
                        //    8  9 10 11 12 13 14
                        //   15 16 17 18 19 20 21
                        //   22 23 24 25 26 27 28
                        //   29 30 31
                        //
                        // 1. January 4th is a Wednesday.
                        // 2. Its day number is 3.
                        // 3. Simply substract 2 days from Wednesday.
                        // 4. The first week of the year begins on Monday, January 2. Simple!
                        //
                        // Example #2 ...
                        //       January 1992
                        //   Su Mo Tu We Th Fr Sa
                        //             1  2  3  4
                        //    5  6  7  8  9 10 11
                        //   12 13 14 15 16 17 18
                        //   19 20 21 22 23 24 25
                        //   26 27 28 29 30 31
                        //
                        // 1. January 4th is a Saturday.
                        // 2. Its day number is 6.
                        // 3. Simply subtract 5 days from Saturday.
                        // 4. The first week of the year begins on Monday, December 30. Simple!
                        //
                        // v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000 + 43200000)));
                        // (This is essentially doing the same thing as above but for the week rather than the day)
                        "year = y || (new Date()).getFullYear();",
                        "jan4 = new Date(year, 0, 4, 0, 0, 0);",
                        "d = jan4.getDay();",
                        // If the 1st is a Thursday, then the 4th will be a Sunday, so we need the appropriate
                        // day number here, which is why we use the day === checks.
                        "week1monday = new Date(jan4.getTime() - ((d === 0 ? 6 : d - 1) * 86400000));",
                        // The reason for adding 43200000 (12 hours) is to avoid any complication with daylight saving
                        // switch overs. For example,  if the clock is rolled back, an hour will repeat, so adding 7 days
                        // will leave us 1 hour short (Sun <date> 23:00:00). By setting is to 12:00, subtraction
                        // or addition of an hour won't make any difference.
                        "v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000 + 43200000)));",
                    "} else {",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",
        "}",

        "if(v){",
            // Check if the date string has a 'Z' or timezone offset (+/-).
            // These indicate a UTC date value that needs adjustment.
            "if(zz != null){",
                // 'Z' found - create a UTC date and adjust for century if the year is < 100.
                "v = me.add(new Date(Date.UTC(y < 100 ? 100 : y, m, d, h, i, s, ms)), me.YEAR, y < 100 ? y - 100 : 0);",
            "}else if(o){",
                // Timezone offset found - create a UTC date and adjust for the offset.
                "v = me.add(new Date(Date.UTC(y < 100 ? 100 : y, m, d, h, i, s, ms)),  me.MINUTE, (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return (v != null) ? v : null;"
      ].join('\n');

    // Polyfill Date's toISOString instance method where not implemented.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
    // TODO: Remove this when IE8 retires.
    if (!Date.prototype.toISOString) {
        Date.prototype.toISOString = function() {
            var me = this;

            return pad(me.getUTCFullYear(), 4, '0') + '-' +
                   pad(me.getUTCMonth() + 1, 2, '0') + '-' +
                   pad(me.getUTCDate(), 2, '0') + 'T' +
                   pad(me.getUTCHours(), 2, '0') + ':' +
                   pad(me.getUTCMinutes(), 2, '0') + ':' +
                   pad(me.getUTCSeconds(), 2, '0') + '.' +
                   pad(me.getUTCMilliseconds(), 3, '0') + 'Z';
       };
    }

    /**
     * @method xf
     * @private
     * @param format
     * Create private copy of Ext JS's `Ext.util.Format.format()` method
     * + to remove unnecessary dependency
     * + to resolve namespace conflict with MS-Ajax's implementation
     */
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);

        return format.replace(numberTokenRe, function(m, i) {
            return args[i];
        });
    }

/* eslint-enable indent, max-len */
utilDate = {
    /** @ignore */
    now: nativeDate.now, // always available due to polyfill in Ext.js

    /**
     * @private
     */
    toString: function(date) {
        if (!date) {
            date = new nativeDate();
        }

        return date.getFullYear() + "-" +
               pad(date.getMonth() + 1, 2, '0') + "-" +
               pad(date.getDate(), 2, '0') + "T" +
               pad(date.getHours(), 2, '0') + ":" +
               pad(date.getMinutes(), 2, '0') + ":" +
               pad(date.getSeconds(), 2, '0');
    },

    /**
     * Returns the number of milliseconds between two dates.
     * @param {Date} dateA The first date.
     * @param {Date} [dateB=new Date()] (optional) The second date.
     * @return {Number} The difference in milliseconds
     */
    getElapsed: function(dateA, dateB) {
        return Math.abs(dateA - (dateB || utilDate.now()));
    },

    /**
     * Global flag which determines if strict date parsing should be used.
     * Strict date parsing will not roll-over invalid dates, which is the
     * default behavior of JavaScript Date objects.
     * (see {@link #parse} for more information)
     * @type Boolean
    */
    useStrict: false,

    /**
     * @private
     */
    formatCodeToRegex: function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for 
        // Ext.Date.parseCodes below)
        var p = utilDate.parseCodes[character];

        if (p) {
            p = typeof p === 'function' ? p() : p;

            // reassign function result to prevent repeated execution
            utilDate.parseCodes[character] = p;
        }

        return p
            ? Ext.applyIf({
                c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
            }, p)
            : {
                g: 0,
                c: null,
                s: Ext.String.escapeRegex(character) // treat unrecognized characters as literals
            };
    },

    /**
     * An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.
     *
     * This object is automatically populated with date parsing functions as
     * date formats are requested for Ext standard formatting strings.
     *
     * Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parse}.
     *
     * Example:
     *
     *     Ext.Date.parseFunctions['x-date-format'] = myDateParser;
     *
     *  A parsing function should return a Date object, and is passed the following parameters:
     *
     * - `date`: {@link String} - The date string to parse.
     * - `strict`: {@link Boolean} - `true` to validate date strings while parsing
     * (i.e. prevent JavaScript Date "rollover"). __The default must be `false`.__
     * Invalid date strings should return `null` when parsed.
     *
     * To enable Dates to also be _formatted_ according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @type Object
     */
    parseFunctions: {
        "MS": function(input, strict) {
            // note: the timezone offset is ignored since the MS Ajax server sends
            // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
            var r = (input || '').match(MSFormatRe);

            return r ? new nativeDate(((r[1] || '') + r[2]) * 1) : null;
        },
        "time": function(input, strict) {
            var num = parseInt(input, 10);

            if (num || num === 0) {
                return new nativeDate(num);
            }

            return null;
        },
        "timestamp": function(input, strict) {
            var num = parseInt(input, 10);

            if (num || num === 0) {
                return new nativeDate(num * 1000);
            }

            return null;
        }
    },
    parseRegexes: [],

    /**
     * An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.
     *
     * This object is automatically populated with date formatting functions as
     * date formats are requested for Ext standard formatting strings.
     *
     * Custom formatting functions may be inserted into this object, keyed by a name which
     * from then on may be used as a format string to {@link #format}.
     *
     * Example:
     *
     *     Ext.Date.formatFunctions['x-date-format'] = myDateFormatter;
     *
     * A formatting function should return a string representation of the Date object which
     * is the scope (this) of the function.
     *
     * To enable date strings to also be _parsed_ according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @type Object
     */
    formatFunctions: {
        "MS": function() {
            // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
            return '\\/Date(' + this.getTime() + ')\\/';
        },
        "time": function() {
            return this.getTime().toString();
        },
        "timestamp": function() {
            return utilDate.format(this, 'U');
        }
    },

    y2kYear: 50,

    /**
     * Date interval constant.
     * @type String
     */
    MILLI: "ms",

    /**
     * Date interval constant.
     * @type String
     */
    SECOND: "s",

    /**
     * Date interval constant.
     * @type String
     */
    MINUTE: "mi",

    /**
     * Date interval constant.
     * @type String
     */
    HOUR: "h",

    /**
     * Date interval constant.
     * @type String
     */
    DAY: "d",

    /**
     * Date interval constant.
     * @type String
     */
    WEEK: "w",

    /**
     * Date interval constant.
     * @type String
     */
    MONTH: "mo",

    /**
     * Date interval constant.
     * @type String
     */
    YEAR: "y",

    /**
     * The number of days in a week.
     * @type Number
     */
    DAYS_IN_WEEK: 7,

    /**
     * The number of months in a year.
     * @type Number
     */
    MONTHS_IN_YEAR: 12,

    /**
     * The maximum number of days in a month.
     * @type {Number}
     */
    MAX_DAYS_IN_MONTH: 31,

    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,

    /**
     * An object hash containing default date values used during date parsing.
     *
     * The following properties are available:
     *
     * - `y`: {@link Number} - The default year value. Defaults to `undefined`.
     * - `m`: {@link Number} - The default 1-based month value. Defaults to `undefined`.
     * - `d`: {@link Number} - The default day value. Defaults to `undefined`.
     * - `h`: {@link Number} - The default hour value. Defaults to `undefined`.
     * - `i`: {@link Number} - The default minute value. Defaults to `undefined`.
     * - `s`: {@link Number} - The default second value. Defaults to `undefined`.
     * - `ms`: {@link Number} - The default millisecond value. Defaults to `undefined`.
     * 
     * Override these properties to customize the default date values used by the {@link #parse}
     * method.
     * 
     * __Note:__ In countries which experience Daylight Saving Time (i.e. DST), the `h`, `i`, `s`
     * and `ms` properties may coincide with the exact time in which DST takes effect.
     * It is the responsibility of the developer to account for this.
     *
     * Example Usage:
     *
     *     // set default day value to the first day of the month
     *     Ext.Date.defaults.d = 1;
     *
     *     // parse a February date string containing only year and month values.
     *     // setting the default day value to 1 prevents weird date rollover issues
     *     // when attempting to parse the following date string on, for example, March 31st 2009
     *     Ext.Date.parse('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
     *
     * @property defaults
     * @type Object
     */
    defaults: {},

    /**
     * @property {String[]} dayNames
     * An array of textual day names.
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.dayNames = [
     *         'SundayInYourLang',
     *         'MondayInYourLang'
     *         // ...
     *     ];
     * @locale
     */
    dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],

    /**
     * @property {String[]} monthNames
     * An array of textual month names.
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.monthNames = [
     *         'JanInYourLang',
     *         'FebInYourLang'
     *         // ...
     *     ];
     * @locale
     */
    monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],

    /**
     * @property {Object} monthNumbers
     * An object hash of zero-based JavaScript month numbers (with short month names as keys).
     *
     * __Note:__ keys are case-sensitive.
     *
     * Override these values for international dates.
     *
     * Example:
     *
     *     Ext.Date.monthNumbers = {
     *         'LongJanNameInYourLang': 0,
     *         'ShortJanNameInYourLang':0,
     *         'LongFebNameInYourLang':1,
     *         'ShortFebNameInYourLang':1
     *         // ...
     *     };
     * @locale
     */
    monthNumbers: {
        January: 0,
        Jan: 0,
        February: 1,
        Feb: 1,
        March: 2,
        Mar: 2,
        April: 3,
        Apr: 3,
        May: 4,
        June: 5,
        Jun: 5,
        July: 6,
        Jul: 6,
        August: 7,
        Aug: 7,
        September: 8,
        Sep: 8,
        October: 9,
        Oct: 9,
        November: 10,
        Nov: 10,
        December: 11,
        Dec: 11
    },

    /**
     * @property {String} defaultFormat
     * The date format string that the {@link Ext.util.Format#dateRenderer}
     * and {@link Ext.util.Format#date} functions use.  See {@link Ext.Date} for details.
     *
     * This is the format that {@link #method!flexParse} uses to disambiguate all-numeric
     * input dates.
     *
     * This may be overridden in a locale file.
     * @locale
     */
    defaultFormat: 'm/d/Y',

    /**
     * @property {String} defaultTimeFormat
     * The default time format.
     *
     * This may be overridden in a locale file.
     * @locale
     */
    defaultTimeFormat: 'h:i A',

    /**
     * @property {Number} firstDayOfWeek
     * The day on which the week starts. `0` being Sunday, through `6` being Saturday.
     *
     * This may be overridden in a locale file.
     * @locale
     */
    firstDayOfWeek: 0,

    /**
     * @property {Number[]} weekendDays
     * The days on which weekend falls. `0` being Sunday, through `6` being Saturday.
     *
     * This may be overridden in a locale file.
     * @locale
     */
    weekendDays: [0, 6],

    /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based JavaScript month number.
     * @return {String} The short month name.
     * @locale
     */
    getShortMonthName: function(month) {
        return utilDate.monthNames[month].substring(0, 3);
    },

    /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based JavaScript day number.
     * @return {String} The short day name.
     * @locale
     */
    getShortDayName: function(day) {
        return utilDate.dayNames[day].substring(0, 3);
    },

    /**
     * Get the zero-based JavaScript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based JavaScript month number.
     * @locale
     */
    getMonthNumber: function(name) {
        // handle camel casing for English month names (since the keys for 
        // the Ext.Date.monthNumbers hash are case sensitive)
        return utilDate.monthNumbers[name.substring(0, 1).toUpperCase() +
               name.substring(1, 3).toLowerCase()];
    },

    /**
     * Checks if the specified format contains hour information
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains hour information
     * @method
     */
    formatContainsHourInfo: function(format) {
        return hourInfoRe.test(format.replace(stripEscapeRe, ''));
    },

    /**
     * Checks if the specified format contains information about
     * anything other than the time.
     * @param {String} format The format to check
     * @return {Boolean} True if the format contains information about
     * date/day information.
     * @method
     */
    formatContainsDateInfo: function(format) {
        return dateInfoRe.test(format.replace(stripEscapeRe, ''));
    },

    /**
     * @private
     * Checks if the specified format contains only month information.
     *
     * @param {String} format Format to check
     *
     * @return {Boolean}
     */
    isMonthFormat: function(format) {
        return !!monthInfo[format];
    },

    /**
     * @private
     * Checks if the specified format contains only year information.
     *
     * @param {String} format Format to check.
     *
     * @return {Boolean}
     */
    isYearFormat: function(format) {
        return !!yearInfo[format];
    },

    /**
     * Removes all escaping for a date format string. In date formats,
     * using a '\' can be used to escape special characters.
     * @param {String} format The format to unescape
     * @return {String} The unescaped format
     * @method
     */
    unescapeFormat: function(format) {
        // Escape the format, since \ can be used to escape special
        // characters in a date format. For example, in a Spanish
        // locale the format may be: 'd \\de F \\de Y'
        return format.replace(slashRe, '');
    },

    /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     *
     * __Note:__ `Ext.Date.format()` treats characters as literals if an appropriate mapping
     * cannot be found.
     *
     * Example:
     *
     *     Ext.Date.formatCodes.x = "Ext.util.Format.leftPad(this.getDate(), 2, '0')";
     *     console.log(Ext.Date.format(new Date(), 'X'); // returns the current day of the month
     * @type Object
     */
    formatCodes: {
        /* eslint-disable max-len */
        d: "Ext.String.leftPad(m.getDate(), 2, '0')",
        D: "Ext.Date.getShortDayName(m.getDay())", // get localized short day name
        j: "m.getDate()",
        l: "Ext.Date.dayNames[m.getDay()]",
        N: "(m.getDay() ? m.getDay() : 7)",
        S: "Ext.Date.getSuffix(m)",
        w: "m.getDay()",
        z: "Ext.Date.getDayOfYear(m)",
        W: "Ext.String.leftPad(Ext.Date.getWeekOfYear(m), 2, '0')",
        F: "Ext.Date.monthNames[m.getMonth()]",
        m: "Ext.String.leftPad(m.getMonth() + 1, 2, '0')",
        M: "Ext.Date.getShortMonthName(m.getMonth())", // get localized short month name
        n: "(m.getMonth() + 1)",
        t: "Ext.Date.getDaysInMonth(m)",
        L: "(Ext.Date.isLeapYear(m) ? 1 : 0)",
        o: "(m.getFullYear() + (Ext.Date.getWeekOfYear(m) == 1 && m.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(m) >= 52 && m.getMonth() < 11 ? -1 : 0)))",
        Y: "Ext.String.leftPad(m.getFullYear(), 4, '0')",
        y: "('' + m.getFullYear()).substring(2, 4)",
        a: "(m.getHours() < 12 ? 'am' : 'pm')",
        A: "(m.getHours() < 12 ? 'AM' : 'PM')",
        g: "((m.getHours() % 12) ? m.getHours() % 12 : 12)",
        G: "m.getHours()",
        h: "Ext.String.leftPad((m.getHours() % 12) ? m.getHours() % 12 : 12, 2, '0')",
        H: "Ext.String.leftPad(m.getHours(), 2, '0')",
        i: "Ext.String.leftPad(m.getMinutes(), 2, '0')",
        s: "Ext.String.leftPad(m.getSeconds(), 2, '0')",
        u: "Ext.String.leftPad(m.getMilliseconds(), 3, '0')",
        O: "Ext.Date.getGMTOffset(m)",
        P: "Ext.Date.getGMTOffset(m, true)",
        T: "Ext.Date.getTimezone(m)",
        Z: "(m.getTimezoneOffset() * -60)",
        /* eslint-enable max-len */

        c: function() { // ISO-8601 -- GMT format
            var c = "Y-m-dTH:i:sP",
                code = [],
                l = c.length,
                i, e;

            for (i = 0; i < l; ++i) {
                e = c.charAt(i);
                // treat T as a character literal
                code.push(e === "T" ? "'T'" : utilDate.getFormatCode(e));
            }

            return code.join(" + ");
        },

        C: function() { // ISO-1601 -- browser format. UTC numerics with the 'Z' TZ id.
            return 'm.toISOString()';
        },

        U: "Math.round(m.getTime() / 1000)"
    },

    /**
     * Checks if the passed Date parameters will cause a JavaScript Date "rollover".
     * @param {Number} year 4-digit year.
     * @param {Number} month 1-based month-of-year.
     * @param {Number} day Day of month.
     * @param {Number} hour (optional) Hour.
     * @param {Number} minute (optional) Minute.
     * @param {Number} second (optional) Second.
     * @param {Number} millisecond (optional) Millisecond.
     * @return {Boolean} `true` if the passed parameters do not cause a Date "rollover",
     * `false` otherwise.
     */
    isValid: function(year, month, day, hour, minute, second, millisecond) {
        var dt;

        // setup defaults
        hour = hour || 0;
        minute = minute || 0;
        second = second || 0;
        millisecond = millisecond || 0;

        // Special handling for year < 100
        /* eslint-disable-next-line max-len */
        dt = utilDate.add(new nativeDate(year < 100 ? 100 : year, month - 1, day, hour, minute, second, millisecond), utilDate.YEAR, year < 100 ? year - 100 : 0);

        return year === dt.getFullYear() &&
               month === dt.getMonth() + 1 &&
               day === dt.getDate() &&
               hour === dt.getHours() &&
               minute === dt.getMinutes() &&
               second === dt.getSeconds() &&
               millisecond === dt.getMilliseconds();
    },

    /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based
     * (i.e. 1 = January). The {@link #defaults} hash will be used for any date value (i.e. year,
     * month, day, hour, minute, second or millisecond) which cannot be found in the passed string.
     * If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used
     * instead. Keep in mind that the input date string must precisely match the specified format
     * string in order for the parse operation to be successful (failed parse operations return a 
     * `null` value).
     *
     * Example:
     *
     *     //dt = Fri May 25 2007 (current date)
     *     var dt = new Date();
     *
     *     //dt = Thu May 25 2006 (today&#39;s month/day in 2006)
     *     dt = Ext.Date.parse("2006", "Y");
     *
     *     //dt = Sun Jan 15 2006 (all date parts specified)
     *     dt = Ext.Date.parse("2006-01-15", "Y-m-d");
     *
     *     //dt = Sun Jan 15 2006 15:20:01
     *     dt = Ext.Date.parse("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");
     *
     *     // attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
     *     dt = Ext.Date.parse("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
     *
     * ## Heuristic Parsing
     * When no `format` is specified, this method parses the date in a flexible way allowing
     * for different delimiters and textual month names to infer the position of the other
     * parts.
     *
     * Supported inferred date orders when alphabetic month names are used are:
     *
     *     - `D,M,Y`
     *     - `M,D,Y`
     *     - `Y,M,D`
     *
     * If the passed in date consists of all numeric tokens then the relative magnitude of
     * the first two tokens is used to make an inference about the user's intention.
     * If one token is less than 13 and the other is greater than 12, then the user's
     * intention is known.
     *
     * Failing this, the {@link #defaultFormat} is used to determine the input order for
     * the current locale.
     *
     * Part delimiters may be any of these:
     *
     *     - `'/'`
     *     - `'-'`
     *     - `'.'`
     *     - `'\'`
     *     - `' '` (space)
     *
     * For example, the inputs `"Jun 1 62"` and `"1 Jun 62"` would be understood as the
     * first of June, 1962 in all English locales regardless of the locale's default date
     * ordering.
     *
     * If `"25/1/62"` was passed in, it's obvious that the user means the twenty fifth
     * of January.
     *
     * If, however, `"1/6/62"` was passed in, the {@link #defaultFormat} would be consulted
     * to disambiguate the meaning of those first two tokens.
     *
     * @param {String} input The date string to parse.
     * @param {String} [format] The expected date string format. If not passed, the date
     * string will be parsed heuristically as described above.
     * @param {Boolean} [strict=false] Pass `true` to validate date strings while parsing
     * (i.e. prevents JavaScript Date "rollover"). Invalid date strings will return `null`
     * when parsed.
     * @return {Date} The parsed Date, or `null` if an invalid date string.
     */
    parse: function(input, format, strict) {
        var p;

        if (!format) {
            return utilDate.flexParse(input);
        }

        p = utilDate.parseFunctions;

        if (p[format] == null) {
            utilDate.createParser(format);
        }

        return p[format].call(utilDate, input, Ext.isDefined(strict) ? strict : utilDate.useStrict);
    },

    // Backwards compat
    parseDate: function(input, format, strict) {
        return utilDate.parse(input, format, strict);
    },

    /**
     * @private
     */
    getFormatCode: function(character) {
        var f = utilDate.formatCodes[character];

        if (f) {
            f = typeof f === 'function' ? f() : f;

            // reassign function result to prevent repeated execution
            utilDate.formatCodes[character] = f;
        }

        // note: unknown characters are treated as literals
        return f || ("'" + Ext.String.escape(character) + "'");
    },

    /**
     * @private
     */
    createFormat: function(format) {
        var code = [],
            special = false,
            ch = '',
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);

            if (!special && ch === "\\") {
                special = true;
            }
            else if (special) {
                special = false;
                code.push("'" + Ext.String.escape(ch) + "'");
            }
            else {
                if (ch === '\n') {
                    code.push("'\\n'");
                }
                else {
                    code.push(utilDate.getFormatCode(ch));
                }
            }
        }

        utilDate.formatFunctions[format] = Ext.functionFactory(
            "var m = this; return " + code.join('+')
        );
    },

    /**
     * @private
     */
    createParser: function(format) {
        var regexNum = utilDate.parseRegexes.length,
            currentGroup = 1,
            calc = [],
            regex = [],
            special = false,
            ch = "",
            i = 0,
            len = format.length,
            atEnd = [],
            obj;

        for (; i < len; ++i) {
            ch = format.charAt(i);

            if (!special && ch === "\\") {
                special = true;
            }
            else if (special) {
                special = false;
                regex.push(Ext.String.escape(ch));
            }
            else {
                obj = utilDate.formatCodeToRegex(ch, currentGroup);
                currentGroup += obj.g;
                regex.push(obj.s);

                if (obj.g && obj.c) {
                    if (obj.calcAtEnd) {
                        atEnd.push(obj.c);
                    }
                    else {
                        calc.push(obj.c);
                    }
                }
            }
        }

        calc = calc.concat(atEnd);

        utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
        utilDate.parseFunctions[format] = Ext.functionFactory(
            "input", "strict", xf(code, regexNum, calc.join(''))
        );
    },

    /**
     * @private
     */
    parseCodes: {
        // Notes:
        // g = {Number} calculation group (0 or 1. only group 1 contributes to
        // date calculations.)
        // c = {String} calculation method (required for group 1. null for group 0.
        // {0} = currentGroup - position in regex result array)
        // s = {String} regex pattern. all matches are stored in results[], and are
        // accessible by the calculation mapped to 'c'
        d: {
            g: 1,
            c: "d = parseInt(results[{0}], 10);\n",
            s: "(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
        },
        j: {
            g: 1,
            c: "d = parseInt(results[{0}], 10);\n",
            s: "(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
        },
        D: function() {
            var a = [],
                i;

            // get localised short day names
            for (i = 0; i < 7; i++) {
                a.push(utilDate.getShortDayName(i));
            }

            return {
                g: 0,
                c: null,
                s: "(?:" + a.join("|") + ")"
            };
        },
        l: function() {
            return {
                g: 0,
                c: null,
                s: "(?:" + utilDate.dayNames.join("|") + ")"
            };
        },
        N: {
            g: 0,
            c: null,
            s: "[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
        },
        //<locale type="object" property="parseCodes">
        S: {
            g: 0,
            c: null,
            s: "(?:st|nd|rd|th)"
        },
        //</locale>
        w: {
            g: 0,
            c: null,
            s: "[0-6]" // JavaScript day number (0 (sunday) - 6 (saturday))
        },
        z: {
            g: 1,
            c: "z = parseInt(results[{0}], 10);\n",
            s: "(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
        },
        W: {
            g: 1,
            c: "W = parseInt(results[{0}], 10);\n",
            s: "(\\d{2})" // ISO-8601 week number (with leading zero)
        },
        F: function() {
            return {
                g: 1,
                c: "m = parseInt(me.getMonthNumber(results[{0}]), 10);\n",
                s: "(" + utilDate.monthNames.join("|") + ")"
            };
        },
        M: function() {
            var a = [],
                i;

            // get localised short month names
            for (i = 0; i < 12; i++) {
                a.push(utilDate.getShortMonthName(i));
            }

            return Ext.applyIf({
                s: "(" + a.join("|") + ")"
            }, utilDate.formatCodeToRegex("F"));
        },
        m: {
            g: 1,
            c: "m = parseInt(results[{0}], 10) - 1;\n",
            s: "(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
        },
        n: {
            g: 1,
            c: "m = parseInt(results[{0}], 10) - 1;\n",
            s: "(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
        },
        t: {
            g: 0,
            c: null,
            s: "(?:\\d{2})" // no. of days in the month (28 - 31)
        },
        L: {
            g: 0,
            c: null,
            s: "(?:1|0)"
        },
        o: {
            g: 1,
            c: "y = parseInt(results[{0}], 10);\n",
            s: "(\\d{4})" // ISO-8601 year number (with leading zero)

        },
        Y: {
            g: 1,
            c: "y = parseInt(results[{0}], 10);\n",
            s: "(\\d{4})" // 4-digit year
        },
        y: {
            g: 1,
            c: "var ty = parseInt(results[{0}], 10);\n" +
               "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
            s: "(\\d{2})"
        },

        // In the am/pm parsing routines, we allow both upper and lower case
        // even though it doesn't exactly match the spec. It gives much more flexibility
        // in being able to specify case insensitive regexes.

        /* eslint-disable indent */
        //<locale type="object" property="parseCodes">
        a: {
            g: 1,
            c: "if (/(am)/i.test(results[{0}])) {\n" +
                    "if (!h || h == 12) { h = 0; }\n" +
                    "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s: "(am|pm|AM|PM)",
            calcAtEnd: true
        },
        //</locale>
        //<locale type="object" property="parseCodes">
        A: {
            g: 1,
            c: "if (/(am)/i.test(results[{0}])) {\n" +
                    "if (!h || h == 12) { h = 0; }\n" +
                    "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s: "(AM|PM|am|pm)",
            calcAtEnd: true
        },
        //</locale>
        g: {
            g: 1,
            c: "h = parseInt(results[{0}], 10);\n",
            s: "(1[0-2]|[1-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
        },
        G: {
            g: 1,
            c: "h = parseInt(results[{0}], 10);\n",
            s: "(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
        },
        h: {
            g: 1,
            c: "h = parseInt(results[{0}], 10);\n",
            s: "(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
        },
        H: {
            g: 1,
            c: "h = parseInt(results[{0}], 10);\n",
            s: "(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
        },
        i: {
            g: 1,
            c: "i = parseInt(results[{0}], 10);\n",
            s: "([0-5][0-9])" // minutes with leading zeros (00 - 59)
        },
        s: {
            g: 1,
            c: "s = parseInt(results[{0}], 10);\n",
            s: "([0-5][0-9])" // seconds with leading zeros (00 - 59)
        },
        u: {
            g: 1,
            c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
            s: "(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
        },
        /* eslint-disable max-len */
        O: {
            g: 1,
            c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(3,5) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{4})" // GMT offset in hrs and mins
        },
        P: {
            g: 1,
            c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),", // get + / - sign
                    "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
                    "mn = o.substring(4,6) % 60;", // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
            ].join("\n"),
            s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
        },
        T: {
            g: 0,
            c: null,
            s: "[A-Z]{1,5}" // timezone abbrev. may be between 1 - 5 chars
        },
        Z: {
            g: 1,
            c: "zz = results[{0}] * 1;\n" + // -43200 <= UTC offset <= 50400
               "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
            s: "([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
        },
        c: function() {
            var calc = [],
                arr = [
                    utilDate.formatCodeToRegex("Y", 1), // year
                    utilDate.formatCodeToRegex("m", 2), // month
                    utilDate.formatCodeToRegex("d", 3), // day
                    utilDate.formatCodeToRegex("H", 4), // hour
                    utilDate.formatCodeToRegex("i", 5), // minute
                    utilDate.formatCodeToRegex("s", 6), // second
                    { c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n" }, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                    { c: [ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                        "if (results[8]) {", // timezone specified
                            "if (results[8] == 'Z') {",
                                "zz = 0;", // UTC
                            "}",
                            "else if (results[8].indexOf(':') > -1) {",
                                utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
                            "}",
                            "else {",
                                utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
                            "}",
                        "}"
                    ].join('\n') }
                ],
                i, l;

            for (i = 0, l = arr.length; i < l; ++i) {
                calc.push(arr[i].c);
            }

            return {
                g: 1,
                c: calc.join(""),
                s: [
                    arr[0].s, // year (required)
                    "(?:", "-", arr[1].s, // month (optional)
                        "(?:", "-", arr[2].s, // day (optional)
                            "(?:",
                                "(?:T| )?", // time delimiter -- either a "T" or a single blank space
                                arr[3].s, ":", arr[4].s, // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                                "(?::", arr[5].s, ")?", // seconds (optional)
                                "(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                                "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                            ")?",
                        ")?",
                    ")?"
                ].join("")
            };
        },
        U: {
            g: 1,
            c: "u = parseInt(results[{0}], 10);\n",
            s: "(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
        }
    },
    /* eslint-enable indent, max-len */

    compare: function(d1, d2, includeTime) {
        var s1, s2;

        if (typeof d1 === 'string') {
            d1 = Ext.Date.parse(d1);
        }

        if (typeof d2 === 'string') {
            d2 = Ext.Date.parse(d2);
        }

        s1 = Ext.Date.format(d1, 'C');
        s2 = Ext.Date.format(d2, 'C');

        if (!includeTime) {
            s1 = s1.substr(0, 10); // "YYYY-MM-DD".length === 10
            s2 = s2.substr(0, 10);
        }

        return (s1 < s2) ? -1 : ((s2 < s1) ? 1 : 0);
    },

    // Old Ext.Date prototype methods.
    /**
     * @private
     */
    dateFormat: function(date, format) {
        return utilDate.format(date, format);
    },

    /**
     * Compares if two dates are equal by comparing their values.
     * @param {Date} date1
     * @param {Date} date2
     * @return {Boolean} `true` if the date values are equal
     */
    isEqual: function(date1, date2) {
        // check we have 2 date objects
        if (date1 && date2) {
            return +date1 === +date2;
        }

        // one or both isn't a date, only equal if both are falsy
        return !(date1 || date2);
    },

    /**
     * Formats a date given the supplied format string.
     * @param {Date} date The date to format
     * @param {String} format The format string
     * @return {String} The formatted date or an empty string if date parameter is not
     * a JavaScript Date object
     */
    format: function(date, format) {
        var formatFunctions = utilDate.formatFunctions;

        if (!Ext.isDate(date)) {
            return '';
        }

        if (formatFunctions[format] == null) {
            utilDate.createFormat(format);
        }

        return formatFunctions[format].call(date) + '';
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * __Note:__ The date string returned by the JavaScript Date object's `toString()` method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in
     * America). For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula
     * Standard Time)", `getTimezone()` first tries to get the timezone abbreviation from between
     * a pair of parentheses (which may or may not be present), failing which it proceeds to get
     * the timezone abbreviation from the GMT offset portion of the date string.
     * 
     *     var dt = new Date('9/17/2011');
     *     console.log(Ext.Date.getTimezone(dt));
     *
     * @param {Date} date The date
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone: function(date) {
        /* eslint-disable max-len, no-useless-escape */
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
        /* eslint-enable max-len, no-useless-escape */
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     *
     *     var dt = new Date('9/17/2011');
     *     console.log(Ext.Date.getGMTOffset(dt));
     *
     * @param {Date} date The date
     * @param {Boolean} [colon=false] `true` to separate the hours and minutes with a colon.
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset: function(date, colon) {
        var offset = date.getTimezoneOffset();

        return (offset > 0 ? "-" : "+") +
               Ext.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0") +
               (colon ? ":" : "") +
               Ext.String.leftPad(Math.abs(offset % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     *
     *     var dt = new Date('9/17/2011');
     *     console.log(Ext.Date.getDayOfYear(dt)); // 259
     *
     * @param {Date} date The date
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function(date) {
        var num = 0,
            d = utilDate.clone(date),
            m = date.getMonth(),
            i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += utilDate.getDaysInMonth(d);
        }

        return num + date.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     *
     *     var dt = new Date('9/17/2011');
     *     console.log(Ext.Date.getWeekOfYear(dt)); // 37
     *
     * @param {Date} date The date.
     * @return {Number} 1 to 53.
     * @method
     */
    getWeekOfYear: (function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5, // milliseconds in a day
            ms7d = 7 * ms1d; // milliseconds in a week

        return function(date) { // return a closure so constants get calculated only once
            /* eslint-disable-next-line max-len */
            var DC3 = nativeDate.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
                AWN = Math.floor(DC3 / 7), // an Absolute Week Number
                Wyr = new nativeDate(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(nativeDate.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }()),

    /**
     * Checks if the current date falls within a leap year.
     *
     *     var dt = new Date('1/10/2011');
     *     console.log(Ext.Date.isLeapYear(dt)); // false
     *
     * @param {Date} date The date
     * @return {Boolean} `true` if the current date falls within a leap year, `false` otherwise.
     */
    isLeapYear: function(date) {
        var year = date.getFullYear();

        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     *
     *     var dt = new Date('1/10/2007'),
     *         firstDay = Ext.Date.getFirstDayOfMonth(dt);
     *
     *     console.log(Ext.Date.dayNames[firstDay]); // output: 'Monday'
     *
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth: function(date) {
        var day = (date.getDay() - (date.getDate() - 1)) % 7;

        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     *
     *     var dt = new Date('1/10/2007'),
     *         lastDay = Ext.Date.getLastDayOfMonth(dt);
     *
     *     console.log(Ext.Date.dayNames[lastDay]); // output: 'Wednesday'
     *
     * @param {Date} date The date
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth: function(date) {
        return utilDate.getLastDateOfMonth(date).getDay();
    },

    /**
     * Get the date of the first day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getFirstDateOfMonth: function(date) {
        return new nativeDate(date.getFullYear(), date.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @param {Date} date The date
     * @return {Date}
     */
    getLastDateOfMonth: function(date) {
        return new nativeDate(date.getFullYear(), date.getMonth(), utilDate.getDaysInMonth(date));
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @param {Date} date The date
     * @return {Number} The number of days in the month.
     * @method
     */
    getDaysInMonth: (function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function(date) { // return a closure for efficiency
            var m = date.getMonth();

            return m === 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
        };
    }()),

    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @param {Date} date The date
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     * @locale
     */
    getSuffix: function(date) {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th";
        }
    },

    /**
     * Creates and returns a new Date instance with the exact same date value as the called
     * instance. Dates are copied and passed by reference, so if a copied date variable is modified
     * later, the original variable will also be changed.  When the intention is to create a new
     * variable that will not modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     *
     *     //wrong way:
     *     var orig = new Date('10/1/2006');
     *     var copy = orig;
     *     copy.setDate(5);
     *     console.log(orig);  // returns 'Thu Oct 05 2006'!
     *
     *     //correct way:
     *     var orig = new Date('10/1/2006'),
     *         copy = Ext.Date.clone(orig);
     *     copy.setDate(5);
     *     console.log(orig);  // returns 'Thu Oct 01 2006'
     *
     * @param {Date} date The date.
     * @return {Date} The new Date instance.
     */
    clone: function(date) {
        return new nativeDate(date.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @param {Date} date The date
     * @return {Boolean} `true` if the current date is affected by DST.
     */
    isDST: function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        /* eslint-disable-next-line max-len */
        return new nativeDate(date.getFullYear(), 0, 1).getTimezoneOffset() !== date.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight
     * of the same day, automatically adjusting for Daylight Saving Time (DST) where applicable.
     *
     * __Note:__ DST timezone information for the browser's host operating system is assumed to be
     * up-to-date.
     * @param {Date} date The date
     * @param {Boolean} [clone=false] `true` to create a clone of this date, clear the time and
     * return it.
     * @return {Date} this or the clone.
     */
    clearTime: function(date, clone) {
        var d, hr, c;

        // handles invalid dates preventing the browser from crashing.
        if (isNaN(date.getTime())) {
            return date;
        }

        if (clone) {
            return utilDate.clearTime(utilDate.clone(date));
        }

        // get current date before clearing time
        d = date.getDate();

        // clear time
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        // account for DST (i.e. day of month changed when setting hour = 0)
        if (date.getDate() !== d) {
            // note: DST adjustments are assumed to occur in multiples of 1 hour
            // (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions
            // to this rule

            // increment hour until cloned date == current date
            /* eslint-disable-next-line max-len, curly, nonblock-statement-body-position */
            for (hr = 1, c = utilDate.add(date, utilDate.HOUR, hr); c.getDate() !== d; hr++, c = utilDate.add(date, utilDate.HOUR, hr));

            date.setDate(d);
            date.setHours(c.getHours());
        }

        return date;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     *
     *     // Basic usage:
     *     var dt = Ext.Date.add(new Date('10/29/2006'), Ext.Date.DAY, 5);
     *     console.log(dt); // returns 'Fri Nov 03 2006 00:00:00'
     *
     *     // Negative values will be subtracted:
     *     var dt2 = Ext.Date.add(new Date('10/1/2006'), Ext.Date.DAY, -5);
     *     console.log(dt2); // returns 'Tue Sep 26 2006 00:00:00'
     *
     *      // Decimal values can be used:
     *     var dt3 = Ext.Date.add(new Date('10/1/2006'), Ext.Date.DAY, 1.25);
     *     console.log(dt3); // returns 'Mon Oct 02 2006 06:00:00'
     *
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @param {Boolean} [preventDstAdjust=false] `true` to prevent adjustments when crossing
     * daylight savings boundaries.
     * @return {Date} The new Date instance.
     */
    add: function(date, interval, value, preventDstAdjust) {
        var d = utilDate.clone(date),
            base = 0,
            day, decimalValue;

        if (!interval || value === 0) {
            return d;
        }

        decimalValue = value - parseInt(value, 10);
        value = parseInt(value, 10);

        if (value) {
            switch (interval.toLowerCase()) {
                // See EXTJSIV-7418. We use setTime() here to deal with issues related to
                // the switchover that occurs when changing to daylight savings and vice
                // versa. setTime() handles this correctly where setHour/Minute/Second/Millisecond
                // do not. Let's assume the DST change occurs at 2am and we're incrementing using
                // add for 15 minutes at time. When entering DST, we should see:
                // 01:30am
                // 01:45am
                // 03:00am // skip 2am because the hour does not exist
                // ...
                // Similarly, leaving DST, we should see:
                // 01:30am
                // 01:45am
                // 01:00am // repeat 1am because that's the change over
                // 01:30am
                // 01:45am
                // 02:00am
                // ....
                //
                case utilDate.MILLI:
                    if (preventDstAdjust) {
                        d.setMilliseconds(d.getMilliseconds() + value);
                    }
                    else {
                        d.setTime(d.getTime() + value);
                    }

                    break;

                case utilDate.SECOND:
                    if (preventDstAdjust) {
                        d.setSeconds(d.getSeconds() + value);
                    }
                    else {
                        d.setTime(d.getTime() + value * 1000);
                    }

                    break;

                case utilDate.MINUTE:
                    if (preventDstAdjust) {
                        d.setMinutes(d.getMinutes() + value);
                    }
                    else {
                        d.setTime(d.getTime() + value * 60 * 1000);
                    }

                    break;

                case utilDate.HOUR:
                    if (preventDstAdjust) {
                        d.setHours(d.getHours() + value);
                    }
                    else {
                        d.setTime(d.getTime() + value * 60 * 60 * 1000);
                    }

                    break;

                case utilDate.DAY:
                    if (preventDstAdjust === false) {
                        d.setTime(d.getTime() + value * 24 * 60 * 60 * 1000);
                    }
                    else {
                        d.setDate(d.getDate() + value);
                    }

                    break;

                case utilDate.MONTH:
                    day = date.getDate();

                    if (day > 28) {
                        /* eslint-disable-next-line max-len */
                        day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.MONTH, value)).getDate());
                    }

                    d.setDate(day);
                    d.setMonth(date.getMonth() + value);

                    break;

                case utilDate.YEAR:
                    day = date.getDate();

                    if (day > 28) {
                        /* eslint-disable-next-line max-len */
                        day = Math.min(day, utilDate.getLastDateOfMonth(utilDate.add(utilDate.getFirstDateOfMonth(date), utilDate.YEAR, value)).getDate());
                    }

                    d.setDate(day);
                    d.setFullYear(date.getFullYear() + value);

                    break;
            }
        }

        if (decimalValue) {
            switch (interval.toLowerCase()) {
                /* eslint-disable no-multi-spaces */
                case utilDate.MILLI:    base = 1;                   break;
                case utilDate.SECOND:   base = 1000;                break;
                case utilDate.MINUTE:   base = 1000 * 60;           break;
                case utilDate.HOUR:     base = 1000 * 60 * 60;      break;
                case utilDate.DAY:      base = 1000 * 60 * 60 * 24; break;
                /* eslint-enable no-multi-spaces */

                case utilDate.MONTH:
                    day = utilDate.getDaysInMonth(d);
                    base = 1000 * 60 * 60 * 24 * day;
                    break;

                case utilDate.YEAR:
                    day = (utilDate.isLeapYear(d) ? 366 : 365);
                    base = 1000 * 60 * 60 * 24 * day;
                    break;
            }

            if (base) {
                d.setTime(d.getTime() + base * decimalValue);
            }
        }

        return d;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     *
     *     // Basic usage:
     *     var dt = Ext.Date.subtract(new Date('10/29/2006'), Ext.Date.DAY, 5);
     *     console.log(dt); // returns 'Tue Oct 24 2006 00:00:00'
     *
     *     // Negative values will be added:
     *     var dt2 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, -5);
     *     console.log(dt2); // returns 'Fri Oct 6 2006 00:00:00'
     *
     *      // Decimal values can be used:
     *     var dt3 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, 1.25);
     *     console.log(dt3); // returns 'Fri Sep 29 2006 06:00:00'
     *
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to subtract from the current date.
     * @param {Boolean} [preventDstAdjust=false] `true` to prevent adjustments when crossing
     * daylight savings boundaries.
     * @return {Date} The new Date instance.
     */
    subtract: function(date, interval, value, preventDstAdjust) {
        return utilDate.add(date, interval, -value, preventDstAdjust);
    },

    /**
     * Checks if a date falls on or between the given start and end dates.
     * @param {Date} date The date to check
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} `true` if this date falls on or between the given start and end dates.
     */
    between: function(date, start, end) {
        var t = date.getTime();

        return start.getTime() <= t && t <= end.getTime();
    },

    /**
     * Checks if the date is a weekend day. Uses {@link #weekendDays}.
     * @param {Date} date The date.
     * @return {Boolean} `true` if the day falls on a weekend.
     *
     * @since 6.2.0
     */
    isWeekend: function(date) {
        return Ext.Array.indexOf(this.weekendDays, date.getDay()) > -1;
    },

    /**
     * Converts the passed UTC date into a local date.
     * For example, if the passed date is:
     * `Wed Jun 01 2016 00:10:00 GMT+1000 (AUS Eastern Standard Time)`, then
     * the returned date will be `Wed Jun 01 2016 00:00:00 GMT+1000 (AUS Eastern Standard Time)`.
     * @param {Date} d The date to convert.
     * @return {Date} The date as a local. Does not modify the passed date.
     *
     * @since 6.2.0
     */
    utcToLocal: function(d) {
        return new Date(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            d.getUTCHours(),
            d.getUTCMinutes(),
            d.getUTCSeconds(),
            d.getUTCMilliseconds()
        );
    },

    /**
     * Converts the passed local date into a UTC date.
     * For example, if the passed date is:
     * `Wed Jun 01 2016 00:00:00 GMT+1000 (AUS Eastern Standard Time)`, then
     * the returned date will be `Wed Jun 01 2016 10:00:00 GMT+1000 (AUS Eastern Standard Time)`.
     * @param {Date} d The date to convert.
     * @return {Date} The date as UTC. Does not modify the passed date.
     *
     * @since 6.2.0
     */
    localToUtc: function(d) {
        return utilDate.utc(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds(),
            d.getMilliseconds()
        );
    },

    /**
     * Create a UTC date.
     * @param {Number} year The year.
     * @param {Number} month The month.
     * @param {Number} day The day.
     * @param {Number} [hour=0] The hour.
     * @param {Number} [min=0] The minutes.
     * @param {Number} [s=0] The seconds.
     * @param {Number} [ms=0] The milliseconds.
     * @return {Date} The UTC date.
     *
     * @since 6.2.0
     */
    utc: function(year, month, day, hour, min, s, ms) {
        return new Date(Date.UTC(year, month, day, hour || 0, min || 0, s || 0, ms || 0));
    },

    // Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var p,
            /* eslint-disable max-len */
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            /* eslint-enable max-len */
            sLen = statics.length,
            pLen = proto.length,
            stat, prot, s;

        // Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        // Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];

            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);

                args.unshift(this);

                return utilDate[prot].apply(utilDate, args);
            };
        }
    },

    /**
     * Calculate how many units are there between two time.
     * @param {Date} min The first time.
     * @param {Date} max The second time.
     * @param {String} unit The unit. This unit is compatible with the date interval constants.
     * @return {Number} The maximum number n of units that min + n * unit <= max.
     */
    diff: function(min, max, unit) {
        var diff = +max - min,
            // Calculate timezone differences, including daylight savings adjustments
            timezoneOffsetAdjustment = (min.getTimezoneOffset() - max.getTimezoneOffset()) * 60000,
            // Apply the timezone adjustment to the date difference
            adjustedDiff = diff + timezoneOffsetAdjustment,
            est;

        switch (unit) {
            case utilDate.MILLI:
                return diff;

            case utilDate.SECOND:
                return Math.floor(diff / 1000);

            case utilDate.MINUTE:
                return Math.floor(diff / 60000);

            case utilDate.HOUR:
                return Math.floor(diff / 3600000);

            case utilDate.DAY:
                return Math.floor(adjustedDiff / 86400000);

            case utilDate.WEEK:
                return Math.floor(adjustedDiff / 604800000);

            case utilDate.MONTH:
                est = (max.getFullYear() * 12 + max.getMonth()) -
                       (min.getFullYear() * 12 + min.getMonth());

                if (utilDate.add(min, unit, est) > max) {
                    return est - 1;
                }

                return est;

            case utilDate.YEAR:
                est = max.getFullYear() - min.getFullYear();

                if (utilDate.add(min, unit, est) > max) {
                    return est - 1;
                }
                else {
                    return est;
                }
        }
    },

    /**
     * Align the date to `unit`.
     * @param {Date} date The date to be aligned.
     * @param {String} unit The unit. This unit is compatible with the date interval constants.
     * @param {Number} step
     * @return {Date} The aligned date.
     */
    align: function(date, unit, step) {
        var num = new Date(date);

        switch (unit.toLowerCase()) {
            case utilDate.MILLI:
                return num;

            case utilDate.SECOND:
                num.setSeconds(Math.floor(num.getSeconds() / step) * step);
                num.setMilliseconds(0);

                return num;

            case utilDate.MINUTE:
                num.setMinutes(Math.floor(num.getMinutes() / step) * step);
                num.setSeconds(0);
                num.setMilliseconds(0);

                return num;

            case utilDate.HOUR:
                num.setHours(Math.floor(num.getHours() / step) * step);
                num.setMinutes(0);
                num.setSeconds(0);
                num.setMilliseconds(0);

                return num;

            case utilDate.DAY:
                num.setDate(Math.max(Math.floor(num.getDate() / step) * step, 1));
                num.setHours(0);
                num.setMinutes(0);
                num.setSeconds(0);
                num.setMilliseconds(0);

                return num;

            case utilDate.MONTH:
                num.setMonth(Math.floor(num.getMonth() / step) * step);
                num.setDate(1);
                num.setHours(0);
                num.setMinutes(0);
                num.setSeconds(0);
                num.setMilliseconds(0);

                return num;

            case utilDate.YEAR:
                return new Date(Math.floor(num.getFullYear() / step) * step, 0, 1, 0, 0, 0, 0);
        }
    },

    flexParse: function(inDate, defaultFormat) {
        var parts = datePartsRe.exec(inDate),
            firstFormatToken, day, month, year, result;

        // Regex couldn't parse; invalid date.
        if (!parts) {
            return Ext.Date.parse(inDate, 'C'); // handle "YYYY-MM-DDThh:mm:ssZ"
        }

        // Use this format string to work out what is the desired date order, d/m/y|m/d/y|y/m/d
        if (!defaultFormat) {
            defaultFormat = Ext.Date.defaultFormat;
        }

        // Now the parts array will be:
        // [0] - the full string
        // [1] - The first token if numeric
        // [2] - The first token if alphabetic
        // [3] - The second token if numeric
        // [4] - The second token if alphabetic
        // [5] - The third token.
        // If they've used all numeric parts, we have to use locale order
        // to decide what the parts are. We have three valid choices:
        // d/m/y
        // m/d/y
        // y/m/d
        if (!(parts[2] || parts[4])) {
            firstFormatToken = defaultFormat[0];

            // Not in a y/m/d locale and (first character is a day token, or first
            // token is definitely a day) - it's d/m/y
            if (!yearInfo[firstFormatToken] && (dayInfo[firstFormatToken] ||
                    (parts[1] > 12 && parts[3] < 13))) {
                day = parseInt(parts[1]);
                month = parseInt(parts[3]) - 1;
                year = parseInt(parts[5]);
            }
            else if (!yearInfo[firstFormatToken] && (monthInfo[firstFormatToken] ||
                     (parts[3] > 12 && parts[1] < 13))) {
                // Not in a y/m/d locale and (first charecter is a month token, or
                // first token is definitely a month) - it's m/d/y
                month = parseInt(parts[1]) - 1;
                day = parseInt(parts[3]);
                year = parseInt(parts[5]);
            }
            else {
                // y/m/d is the only other valid format
                year = parseInt(parts[1]);
                month = parseInt(parts[3]) - 1;
                day = parseInt(parts[5]);
            }
        }
        else {
            // They've used an alphabetic month
            // Two alphabetic tokens - not valid.
            if (parts[2] && parts[4]) {
                return null;
            }

            // m/d/y
            if (parts[2]) {
                month = utilDate.monthNumbers[Ext.String.capitalize(parts[2].substr(0, 3))];
                day = parseInt(parts[3]);
                year = parseInt(parts[5]);
            }
            else { // d/m/y
                day = parseInt(parts[1]);
                month = utilDate.monthNumbers[Ext.String.capitalize(parts[4].substr(0, 3))];
                year = parseInt(parts[5]);
            }
        }

        // Alphabetic month couldn't be found, or numeric one out of range.
        if (isNaN(month) || (month < 0 || month > 11)) {
            return null;
        }

        // Short years must be upgraded according to the y2kYear setting
        if (year < utilDate.y2kYear) {
            year += 2000;
        }

        // Create the first of the month so that we can check the validity of the day
        result = new Date(year, month, 1, 0, 0, 0);

        // Validate the day of month.
        if (day < 1 || day > Ext.Date.getDaysInMonth(result)) {
            return null;
        }

        result.setDate(day);

        return result;
    }
};

utilDate.parseCodes.C = utilDate.parseCodes.c;

return utilDate;
}());
