/**
 * @class Ext.feature
 * @singleton
 *
 * A simple class to verify if a browser feature exists or not on the current device.
 *
 *     if (Ext.feature.has.Canvas) {
 *         // do some cool things with canvas here
 *     }
 *
 * See the {@link #has} property/method for details of the features that can be detected.
 *
 */
/* eslint-disable vars-on-top */
Ext.feature = {
// @define Ext.env.Feature
// @define Ext.feature
// @define Ext.supports
// @require Ext.String
// @require Ext.env.Browser
// @require Ext.env.OS

    /**
     * @method has
     * @member Ext.feature
     * Verifies if a browser feature exists or not on the current device.
     *
     * A "hybrid" property, can be either accessed as a method call, i.e:
     *
     *     if (Ext.feature.has('Canvas')) {
     *         // ...
     *     }
     *
     * or as an object with boolean properties, i.e:
     *
     *     if (Ext.feature.has.Canvas) {
     *         // ...
     *     }
     *
     * For possible properties/parameter values see `Ext.supports`.
     *
     * @param {String} name The feature name to check.
     * @return {Boolean}
     */
    has: function(name) {
        return !!this.has[name];
    },

    testElements: {},

    getTestElement: function(tag, createNew) {
        if (tag === undefined) {
            tag = 'div';
        }
        else if (typeof tag !== 'string') {
            return tag;
        }

        if (createNew) {
            return document.createElement(tag);
        }

        if (!this.testElements[tag]) {
            this.testElements[tag] = document.createElement(tag);
        }

        return this.testElements[tag];
    },

    isStyleSupported: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style,
            cName = Ext.String.capitalize(name);

        if (typeof elementStyle[name] !== 'undefined' ||
            typeof elementStyle[Ext.browser.getStylePrefix(name) + cName] !== 'undefined') {
            return true;
        }

        return false;
    },

    isStyleSupportedWithoutPrefix: function(name, tag) {
        var elementStyle = this.getTestElement(tag).style;

        if (typeof elementStyle[name] !== 'undefined') {
            return true;
        }

        return false;
    },

    isEventSupported: function(name, tag) {
        if (tag === undefined) {
            tag = window;
        }

        var element = this.getTestElement(tag),
            eventName = 'on' + name.toLowerCase(),
            isSupported = (eventName in element);

        if (!isSupported) {
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';

                if (typeof element[eventName] !== 'undefined') {
                    element[eventName] = undefined;
                }

                element.removeAttribute(eventName);
            }
        }

        return isSupported;
    },

    // This is a local copy of certain logic from Element.getStyle
    // to break a dependancy between the supports mechanism and Element
    // use this instead of element references to check for styling info
    getStyle: function(element, styleName) {
        var view = element.ownerDocument.defaultView,
            style = (view ? view.getComputedStyle(element, null) : element.currentStyle);

        return (style || element.style)[styleName];
    },

    getSupportedPropertyName: function(object, name) {
        var vendorName = Ext.browser.getVendorProperyName(name);

        if (vendorName in object) {
            return vendorName;
        }
        else if (name in object) {
            return name;
        }

        return null;
    },

    /**
     * Runs feature detection routines and sets the various flags. This is called when
     * the scripts loads (very early) and again at {@link Ext#onReady}. Some detections
     * can be run immediately. Others that require the document body will not run until
     * domready (these have the `ready` flag set).
     *
     * Each test is run only once, so calling this method from an onReady function is safe
     * and ensures that all flags have been set.
     * @private
     */
    detect: function(isReady) {
        var me = this,
            doc = document,
            toRun = me.toRun || me.tests,
            n = toRun.length,
            div = doc.createElement('div'),
            notRun = [],
            supports = Ext.supports,
            has = me.has,
            name, names, test, vector, value;

        //<feature legacyBrowser>
        // Only the legacy browser tests use this div so clip this out if we don't need
        // to use it.
        div.innerHTML =
            '<div style="height:30px;width:50px;">' +
                '<div style="height:20px;width:20px;"></div>' +
            '</div>' +
            '<div style="width: 200px; height: 200px; position: relative; padding: 5px;">' +
                '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>' + // eslint-disable-line max-len
            '</div>' +
            '<div style="position: absolute; left: 10%; top: 10%;"></div>' +
            '<div style="float:left; background-color:transparent;"></div>';

        if (isReady) {
            doc.body.appendChild(div);
        }
        //</feature>

        vector = me.preDetected[Ext.browser.identity] || [];

        while (n--) {
            test = toRun[n];
            value = vector[n];
            name = test.name;
            names = test.names;

            if (value === undefined) {
                if (!isReady && test.ready) {
                    // test requires domready state
                    notRun.push(test);
                    continue;
                }

                value = test.fn.call(me, doc, div);
            }

            // Store test results on Ext.supports and Ext.feature.has
            if (name) {
                supports[name] = has[name] = value;
            }
            else if (names) {
                while (names.length) {
                    name = names.pop();
                    supports[name] = has[name] = value;
                }
            }
        }

        if (isReady) {
            doc.body.removeChild(div);
        }

        me.toRun = notRun;
    },

    //</debug>
    report: function() {
        var values = [],
            len = this.tests.length,
            i;

        for (i = 0; i < len; ++i) {
            values.push(this.has[this.tests[i].name] ? 1 : 0);
        }

        Ext.log(Ext.browser.identity + ': [' + values.join(',') + ']');
    },
    //</debug>

    preDetected: {
        // TODO
    },

    /**
     * @class Ext.supports
     *
     * Contains information about features supported in the current environment as well
     * as bugs detected.
     *
     * @singleton
     */
    tests: [{
        /**
         * @property CloneNodeCopiesExpando `true` if the native DOM cloneNode method copies
         * expando properties to the newly cloned node.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'CloneNodeCopiesExpando',
        fn: function() {
            var el = document.createElement('div');

            el.expandoProp = {};

            return el.cloneNode().expandoProp === el.expandoProp;
        }
    }, {
        /**
         * @property CSSPointerEvents `true` if document environment supports the CSS3
         * pointer-events style.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'CSSPointerEvents',
        fn: function(doc) {
            return 'pointerEvents' in doc.documentElement.style;
        }
    }, {
        /**
         * @property CSS3BoxShadow `true` if document environment supports the CSS3
         * box-shadow style.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'CSS3BoxShadow',
        fn: function(doc) {
            return 'boxShadow' in doc.documentElement.style ||
                   'WebkitBoxShadow' in doc.documentElement.style ||
                   'MozBoxShadow' in doc.documentElement.style;
        }
    }, {
        name: 'CSS3NegationSelector',
        fn: function(doc) {
            try {
                doc.querySelectorAll("foo:not(bar)");
            }
            catch (e) {
                return false;
            }

            return true;
        }
    }, {
        /**
         * @property ClassList `true` if document environment supports the HTML5
         * classList API.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'ClassList',
        fn: function(doc) {
            return !!doc.documentElement.classList;
        }
    }, {
        /**
         * @property Canvas `true` if the device supports Canvas.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'Canvas',
        fn: function() {
            var element = this.getTestElement('canvas');

            return !!(element && element.getContext && element.getContext('2d'));
        }
    }, {
        /**
         * @property Svg `true` if the device supports SVG.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'Svg',
        fn: function(doc) {
            /* eslint-disable-next-line max-len */
            return !!(doc.createElementNS && !!doc.createElementNS("http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect);
        }
    }, {
        /**
         * @property Vml `true` if the device supports VML.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Vml',
        fn: function() {
            var element = this.getTestElement(),
                ret = false;

            element.innerHTML = "<!--[if vml]><br><![endif]-->";
            ret = (element.childNodes.length === 1);
            element.innerHTML = "";

            return ret;
        }
    }, {
        /**
         * @property {Boolean} Touch `true` if the browser supports touch input.
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Touch',
        fn: function() {
            // IE10 uses a vendor-prefixed maxTouchPoints property
            var maxTouchPoints = navigator.msMaxTouchPoints || navigator.maxTouchPoints;

            // if the browser has touch events we can be reasonably sure the device has
            // a touch screen
            // browsers that use pointer event have maxTouchPoints > 1 if the
            // device supports touch input
            // Chrome Desktop < 39 reports maxTouchPoints === 1 even if there is no
            // touch support on the device
            // http://www.w3.org/TR/pointerevents/#widl-Navigator-maxTouchPoints
            // Chrome Desktop > 39 properly reports maxTouchPoints === 0 and
            // Chrome Desktop Device Emulation mode reports maxTouchPoints === 1
            if (Ext.browser.is.Chrome && Ext.browser.version.isLessThanOrEqual(39)) {
                return (Ext.supports.TouchEvents && maxTouchPoints !== 1) || maxTouchPoints > 1;
            }
            else {
                return Ext.supports.TouchEvents || maxTouchPoints > 0;
            }
        }
    }, {
        /**
         * @property {Boolean} PointerEvents
         * @type {Boolean}
         * @private
         *
         * `true` If the event system should use [pointer events](https://www.w3.org/TR/pointerevents/).
         * Currently only set to true if the browser supports pointer events and does not
         * also support touch events.  Touch events are preferred since they allow run-time
         * cancellation of browser default behavior such as scrolling by invoking
         * `e.preventDefault()` whereas pointer events require such intentions to be declared
         * in advance via CSS [touch-action](https://www.w3.org/TR/pointerevents/#h3_the-touch-action-css-property).
         * This means that when pointer events are used, certain interactions are not possible
         * such as long-press to drag within a scrollable element.
         */
        name: 'PointerEvents',
        fn: function() {
            var pointerEvent = window.PointerEvent,
                nav = window.navigator,
                pointerEnabled = !!(pointerEvent && (nav.pointerEnabled || !Ext.isIE));

            return pointerEnabled && !Ext.supports.TouchEvents;
        }
    }, {
        /**
         * @property {Boolean} MSPointerEvents
         * @private
         */
        name: 'MSPointerEvents',
        fn: function() {
            return Ext.isIE10;
        }
    }, {
        /**
         * @property {Boolean} TouchEvents
         *
         * `true` if the device supports touch events (`touchstart`, `touchmove`, `touchend`).
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'TouchEvents',
        fn: function() {
            return this.isEventSupported('touchend');
        }
    }, {
        /**
         * @property {Boolean} TouchAction
         * @private
         *
         * A bit flag representing which property values the browser recognizes as valid
         * values of the CSS `touch-action` property.
         *
         *     panX            1  "00000001"
         *     panY            2  "00000010"
         *     pinchZoom       4  "00000100"
         *     doubleTapZoom   8  "00001000"
         */
        name: 'TouchAction',
        ready: true,
        fn: function(doc, div) {
            if (!window.getComputedStyle) {
                return 0;
            }

            var values = ['pan-x', 'pan-y', 'pinch-zoom', 'double-tap-zoom'],
                flags = [1, 2, 4, 8],
                ln = values.length,
                flag = 0,
                i, value;

            for (i = 0; i < ln; i++) {
                value = values[i];
                div.style.touchAction = value;

                if (getComputedStyle(div).touchAction === value) {
                    flag |= flags[i];
                }
            }

            return flag;
        }
    }, {
        /**
         * @property Orientation `true` if the device supports different orientations.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Orientation',
        fn: function() {
            return ('orientation' in window) && this.isEventSupported('orientationchange');
        }
    }, {
        /**
         * @property OrientationChange `true` if the device supports the `orientationchange`
         * event.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'OrientationChange',
        fn: function() {
            return this.isEventSupported('orientationchange');
        }
    }, {
        /**
         * @property DeviceMotion `true` if the device supports device motion (acceleration
         * and rotation rate).
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'DeviceMotion',
        fn: function() {
            return this.isEventSupported('devicemotion');
        }
    }, {
        /**
         * @property Geolocation `true` if the device supports GeoLocation.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        /**
         * @property GeoLocation `true` if the device supports Geo-location.
         * @type {Boolean}
         * @deprecated 5.0.0 Use `Geolocation` instead (notice the lower-casing of 'L').
         */
        names: [ 'Geolocation', 'GeoLocation' ],
        fn: function() {
            return 'geolocation' in window.navigator;
        }
    }, {
        name: 'SqlDatabase',
        fn: function() {
            return 'openDatabase' in window;
        }
    }, {
        name: 'WebSockets',
        fn: function() {
            return 'WebSocket' in window;
        }
    }, {
        /**
         * @property Range `true` if browser support document.createRange native method.
         * See https://developer.mozilla.org/en/DOM/range.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'Range',
        fn: function() {
            return !!document.createRange;
        }
    }, {
        /**
         * @property CreateContextualFragment `true` if browser support CreateContextualFragment
         * range native methods.
         * See https://developer.mozilla.org/en/DOM/range.createContextualFragment
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'CreateContextualFragment',
        fn: function() {
            var range = !!document.createRange ? document.createRange() : false;

            return range && !!range.createContextualFragment;
        }
    }, {
        /**
         * @property History `true` if the device supports HTML5 history. See
         * https://developer.mozilla.org/en/DOM/Manipulating_the_browser_history
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'History',
        fn: function() {
            return ('history' in window && 'pushState' in window.history);
        }
    }, {
        /**
         * @property Css3DTransforms `true` if the device supports CSS3DTransform.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Css3dTransforms',
        fn: function() {
            // See https://sencha.jira.com/browse/TOUCH-1544

            return this.has('CssTransforms') && this.isStyleSupported('perspective');

            // TODO - double check vs Ext JS flavor:
            /* eslint-disable-next-line max-len */
            // return (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'));
        }
    }, {
        // Important that this goes after Css3dTransforms, since tests are run in reverse order
        name: 'CssTransforms',
        fn: function() {
            return this.isStyleSupported('transform');
        }
    }, {
        name: 'CssTransformNoPrefix',
        fn: function() {
            return this.isStyleSupportedWithoutPrefix('transform');
        }
    }, {
        name: 'CssAnimations',
        fn: function() {
            return this.isStyleSupported('animationName');
        }
    }, {
        /**
         * @property Transitions `true` if the device supports CSS3 Transitions.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        names: [ 'CssTransitions', 'Transitions' ],
        fn: function() {
            return this.isStyleSupported('transitionProperty');
        }
    }, {
        /**
         * @property Audio `true` if the device supports the HTML5 `audio` tag.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        /**
         * @property AudioTag `true` if the device supports the HTML5 `audio` tag.
         * @type {Boolean}
         * @deprecated 5.0.0 Use `Audio` instead.
         */
        names: [ 'Audio', 'AudioTag' ],
        fn: function() {
            return !!this.getTestElement('audio').canPlayType;
        }
    }, {
        /**
         * @property Video `true` if the device supports the HTML5 `video` tag.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'Video',
        fn: function() {
            return !!this.getTestElement('video').canPlayType;
        }
    }, {
        /**
         * @property LocalStorage `true` if localStorage is supported.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'LocalStorage',
        fn: function() {
            try {
                // IE10/Win8 throws "Access Denied" accessing window.localStorage, so
                // this test needs to have a try/catch
                /* eslint-disable-next-line dot-notation */
                if ('localStorage' in window && window['localStorage'] !== null) {
                    // this should throw an error in private browsing mode in iOS as well
                    localStorage.setItem('sencha-localstorage-test', 'test success');

                    // clean up if setItem worked
                    localStorage.removeItem('sencha-localstorage-test');

                    return true;
                }
            }
            catch (e) {
                // ignore
            }

            return false;
        }
    }, {
        /**
         * @property {Boolean} XmlQuerySelector `true` if the browsers supports querySelector
         * and querySelectorAll methods on XML nodes.
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'XmlQuerySelector',
        fn: function() {
            var xmlString = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><root></root>',
                xmlDoc;

            // IE10 doesn't create IXMLDOMDocument via DOMParser
            if (window.ActiveXObject) {
                xmlDoc = new ActiveXObject("Microsoft.xmlDOM"); // eslint-disable-line no-undef
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);
            }
            else if (window.DOMParser) {
                var parser = new DOMParser();

                xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            }

            return xmlDoc ? !!xmlDoc.lastChild.querySelector : false;
        }
    }, {
        /**
         * @property XHR2 `true` if the browser supports XMLHttpRequest
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'XHR2',
        fn: function() {
            return window.ProgressEvent && window.FormData && window.XMLHttpRequest &&
              ('withCredentials' in new XMLHttpRequest());
        }
    }, {
        /**
         * @property XHRUploadProgress `true` if the browser supports XMLHttpRequest
         * upload progress info
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'XHRUploadProgress',
        fn: function() {
            var xhr;

            if (window.XMLHttpRequest && !Ext.browser.is.AndroidStock) {
                xhr = new XMLHttpRequest();

                return xhr && ('upload' in xhr) && ('onprogress' in xhr.upload);
            }

            return false;
        }
    }, {
        /**
         * @property NumericInputPlaceHolder `true` if the browser supports placeholders
         * on numeric input fields
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'NumericInputPlaceHolder',
        fn: function() {
            return !(Ext.browser.is.AndroidStock4 && Ext.os.version.getMinor() < 2);
        }
    }, {
        /**
         * @property {String} matchesSelector
         * The method name which matches an element against a selector if implemented in this
         * environment.
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'matchesSelector',
        fn: function() {
            var el = document.documentElement,
                w3 = 'matches',
                wk = 'webkitMatchesSelector',
                ms = 'msMatchesSelector',
                mz = 'mozMatchesSelector';

            return el[w3] ? w3 : el[wk] ? wk : el[ms] ? ms : el[mz] ? mz : null;
        }
    }, {
        //<feature legacyBrowser>
        /**
         * @property RightMargin `true` if the device supports right margin.
         * See https://bugs.webkit.org/show_bug.cgi?id=13343 for why this is needed.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @type {Boolean}
         */
        name: 'RightMargin',
        ready: true,
        fn: function(doc, div) {
            var view = doc.defaultView;

            /* eslint-disable-next-line max-len */
            return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight !== '0px');
        }
    }, {
        /**
         * @property DisplayChangeInputSelectionBug `true` if INPUT elements lose their
         * selection when their display style is changed. Essentially, if a text input
         * has focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Safari 4.0.4 and older, and appears to be fixed
         * in Safari 5. It's not clear if Safari 4.1 has the bug, but it has the same WebKit
         * version number as Safari 5 (according to http://unixpapa.com/js/gecko.html).
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'DisplayChangeInputSelectionBug',
        fn: function() {
            var webKitVersion = Ext.webKitVersion;

            // WebKit but older than Safari 5 or Chrome 6:
            return 0 < webKitVersion && webKitVersion < 533;
        }
    }, {
        /**
         * @property DisplayChangeTextAreaSelectionBug `true` if TEXTAREA elements lose their
         * selection when their display style is changed. Essentially, if a text area has
         * focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Chrome 10 and Safari 5 and older, and appears to
         * be fixed in Chrome 11.
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'DisplayChangeTextAreaSelectionBug',
        fn: function() {
            var webKitVersion = Ext.webKitVersion;

            /*
            Has bug w/textarea:

            (Chrome) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US)
                        AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.127
                        Safari/534.16
            (Safari) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us)
                        AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5
                        Safari/533.21.1

            No bug:

            (Chrome) Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7)
                        AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57
                        Safari/534.24
            */
            return 0 < webKitVersion && webKitVersion < 534.24;
        }
    }, {
        /**
         * @property TransparentColor `true` if the device supports transparent color.
         * @type {Boolean}
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'TransparentColor',
        ready: true,
        fn: function(doc, div, view) {
            view = doc.defaultView;

            /* eslint-disable-next-line max-len */
            return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor !== 'transparent');
        }
    }, {
        /**
         * @property ComputedStyle `true` if the browser supports
         * document.defaultView.getComputedStyle().
         * @type {Boolean}
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'ComputedStyle',
        ready: true,
        fn: function(doc, div, view) {
            view = doc.defaultView;

            return !!(view && view.getComputedStyle);
        }
    }, {
        /**
         * @property Float `true` if the device supports CSS float.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Float',
        fn: function(doc) {
            return 'cssFloat' in doc.documentElement.style;
        }
    }, {
        /**
         * @property CSS3BorderRadius `true` if the device supports CSS3 border radius.
         * @type {Boolean}
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'CSS3BorderRadius',
        ready: true,
        fn: function(doc) {
            var domPrefixes = ['borderRadius', 'BorderRadius', 'MozBorderRadius',
                               'WebkitBorderRadius', 'OBorderRadius', 'KhtmlBorderRadius'],
                pass = false,
                i;

            for (i = 0; i < domPrefixes.length; i++) {
                if (doc.documentElement.style[domPrefixes[i]] !== undefined) {
                    pass = true;
                }
            }

            return pass && !Ext.isIE9;
        }
    }, {
        /**
         * @property CSS3LinearGradient `true` if the device supports CSS3 linear gradients.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'CSS3LinearGradient',
        fn: function(doc, div) {
            var property = 'background-image:',
                webkit = '-webkit-gradient(linear, left top, right bottom, from(black), to(white))',
                w3c = 'linear-gradient(left top, black, white)',
                moz = '-moz-' + w3c,
                ms = '-ms-' + w3c,
                opera = '-o-' + w3c,
                options = [property + webkit, property + w3c, property + moz, property + ms,
                           property + opera];

            div.style.cssText = options.join(';');

            return (("" + div.style.backgroundImage).indexOf('gradient') !== -1) && !Ext.isIE9;
        }
    }, {
        /**
         * @property MouseEnterLeave `true` if the browser supports mouseenter and mouseleave events
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'MouseEnterLeave',
        fn: function(doc) {
            return ('onmouseenter' in doc.documentElement && 'onmouseleave' in doc.documentElement);
        }
    }, {
        /**
         * @property MouseWheel `true` if the browser supports the mousewheel event
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'MouseWheel',
        fn: function(doc) {
            return ('onmousewheel' in doc.documentElement);
        }
    }, {
        /**
         * @property Opacity `true` if the browser supports normal css opacity
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Opacity',
        fn: function(doc, div) {
            // Not a strict equal comparison in case opacity can be converted to a number.
            if (Ext.isIE8) {
                return false;
            }

            div.firstChild.style.cssText = 'opacity:0.73';

            return div.firstChild.style.opacity == '0.73'; // eslint-disable-line eqeqeq
        }
    }, {
        /**
         * @property Placeholder `true` if the browser supports the HTML5 placeholder attribute
         * on inputs
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'Placeholder',
        fn: function(doc) {
            return 'placeholder' in doc.createElement('input');
        }
    }, {
        /**
         * @property Direct2DBug `true` if when asking for an element's dimension via offsetWidth
         * or offsetHeight, getBoundingClientRect, etc. the browser returns the subpixel width
         * rounded to the nearest pixel.
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        name: 'Direct2DBug',
        fn: function(doc) {
            return Ext.isString(doc.documentElement.style.msTransformOrigin) && Ext.isIE9m;
        }
    }, {
        /**
         * @property BoundingClientRect `true` if the browser supports the getBoundingClientRect
         * method on elements
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'BoundingClientRect',
        fn: function(doc) {
            return 'getBoundingClientRect' in doc.documentElement;
        }
    }, {
        /**
         * @property RotatedBoundingClientRect `true` if the BoundingClientRect is
         * rotated when the element is rotated using a CSS transform.
         * @type {Boolean}
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'RotatedBoundingClientRect',
        ready: true,
        fn: function(doc) {
            var body = doc.body,
                supports = false,
                el = doc.createElement('div'),
                style = el.style;

            if (el.getBoundingClientRect) {
                // If the document body already has child nodes (text nodes etc) we can end
                // up with subpixel rounding errors in IE11 when measuring the height.
                // Absolute positioning prevents this.
                style.position = 'absolute';
                style.top = "0";
                style.WebkitTransform = style.MozTransform = style.msTransform =
                    style.OTransform = style.transform = 'rotate(90deg)';
                style.width = '100px';
                style.height = '30px';
                body.appendChild(el);

                supports = Math.round(el.getBoundingClientRect().height) !== 100;
                body.removeChild(el);
            }

            return supports;
        }
    }, {
        /**
         * @property ChildContentClearedWhenSettingInnerHTML `true` if created child elements
         * lose their innerHTML when modifying the innerHTML of the parent element.
         * @type {Boolean}
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'ChildContentClearedWhenSettingInnerHTML',
        ready: true,
        fn: function() {
            var el = this.getTestElement(),
                child;

            el.innerHTML = '<div>a</div>';
            child = el.firstChild;
            el.innerHTML = '<div>b</div>';

            return child.innerHTML !== 'a';
        }
    }, {
        name: 'IncludePaddingInWidthCalculation',
        ready: true,
        fn: function(doc, div) {
            return div.childNodes[1].firstChild.offsetWidth === 210;
        }
    }, {
        name: 'IncludePaddingInHeightCalculation',
        ready: true,
        fn: function(doc, div) {
            return div.childNodes[1].firstChild.offsetHeight === 210;
        }
    }, {
        /**
         * @property TextAreaMaxLength `true` if the browser supports maxlength on textareas.
         * @type {Boolean}
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'TextAreaMaxLength',
        fn: function(doc) {
            return ('maxlength' in doc.createElement('textarea'));
        }
    }, {
        /**
         * @property GetPositionPercentage `true` if the browser will return the
         * left/top/right/bottom position as a percentage when explicitly set as a percentage value.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @type {Boolean}
         */
        // Related bug: https://bugzilla.mozilla.org/show_bug.cgi?id=707691#c7
        name: 'GetPositionPercentage',
        ready: true,
        fn: function(doc, div) {
            return Ext.feature.getStyle(div.childNodes[2], 'left') === '10%';
        }
    }, {
        /**
         * @property {Boolean} PercentageHeightOverflowBug
         * In some browsers (IE quirks, IE6, IE7, IE9, chrome, safari and opera at the time
         * of this writing) a percentage-height element ignores the horizontal scrollbar
         * of its parent element.  This method returns true if the browser is affected
         * by this bug.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @private
         */
        name: 'PercentageHeightOverflowBug',
        ready: true,
        fn: function(doc) {
            var hasBug = false,
                style, el;

            if (Ext.getScrollbarSize().height) {
                // must have space-consuming scrollbars for bug to be possible
                el = this.getTestElement('div', true);
                style = el.style;
                style.height = '50px';
                style.width = '50px';
                style.overflow = 'auto';
                style.position = 'absolute';

                /* eslint-disable indent */
                el.innerHTML = [
                    '<div style="display:table;height:100%;">',
                        // The element that causes the horizontal overflow must be 
                        // a child of the element with the 100% height, otherwise
                        // horizontal overflow is not triggered in webkit quirks mode
                        '<div style="width:51px;"></div>',
                    '</div>'
                ].join('');
                /* eslint-enable indent */

                doc.body.appendChild(el);

                if (el.firstChild.offsetHeight === 50) {
                    hasBug = true;
                }

                doc.body.removeChild(el);
            }

            return hasBug;
        }
    }, {
        /**
         * @property {Boolean} xOriginBug
         * In Chrome 24.0, an RTL element which has vertical overflow positions its right X origin
         * incorrectly. It skips a non-existent scrollbar which has been moved to the left edge
         * due to the RTL setting.
         *
         * http://code.google.com/p/chromium/issues/detail?id=174656
         *
         * This method returns true if the browser is affected by this bug.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @private
         */
        name: 'xOriginBug',
        ready: true,
        fn: function(doc, div) {
            /* eslint-disable max-len */
            div.innerHTML = '<div id="b1" style="height:100px;width:100px;direction:rtl;position:relative;overflow:scroll">' +
                '<div id="b2" style="position:relative;width:100%;height:20px;"></div>' +
                '<div id="b3" style="position:absolute;width:20px;height:20px;top:0px;right:0px"></div>' +
            '</div>';
            /* eslint-enable max-len */

            var outerBox = document.getElementById('b1').getBoundingClientRect(),
                b2 = document.getElementById('b2').getBoundingClientRect(),
                b3 = document.getElementById('b3').getBoundingClientRect();

            return (b2.left !== outerBox.left && b3.right !== outerBox.right);
        }
    }, {
        /**
         * @property {Boolean} ScrollWidthInlinePaddingBug
         * In some browsers the right padding of an overflowing element is not accounted
         * for in its scrollWidth.  The result can vary depending on whether or not
         * The element contains block-level children.  This method tests the effect
         * of padding on scrollWidth when there are no block-level children inside the
         * overflowing element.
         *
         * This method returns true if the browser is affected by this bug.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'ScrollWidthInlinePaddingBug',
        ready: true,
        fn: function(doc) {
            var hasBug = false,
                style, el;

            el = doc.createElement('div');
            style = el.style;
            style.height = '50px';
            style.width = '50px';
            style.padding = '10px';
            style.overflow = 'hidden';
            style.position = 'absolute';

            el.innerHTML =
                '<span style="display:inline-block;zoom:1;height:60px;width:60px;"></span>';

            doc.body.appendChild(el);

            if (el.scrollWidth === 70) {
                hasBug = true;
            }

            doc.body.removeChild(el);

            return hasBug;
        }
    }, {
        /**
         * @property {Boolean} rtlVertScrollbarOnRight
         * Safari, in RTL mode keeps the scrollbar at the right side.
         * This means that when two elements must keep their left/right positions synched, if one
         * has no vert scrollbar, it must have some extra padding.
         * See https://sencha.jira.com/browse/EXTJSIV-11245
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @private
         */
        name: 'rtlVertScrollbarOnRight',
        ready: true,
        fn: function(doc, div) {
            div.innerHTML = '<div style="height:100px;width:100px;direction:rtl;overflow:scroll">' +
                '<div style="width:20px;height:200px;"></div>' +
            '</div>';

            var outerBox = div.firstChild,
                innerBox = outerBox.firstChild;

            /* eslint-disable-next-line max-len */
            return (innerBox.offsetLeft + innerBox.offsetWidth !== outerBox.offsetLeft + outerBox.offsetWidth);
        }
    }, {
        /**
         * @property {Boolean} rtlVertScrollbarOverflowBug
         * In Chrome, in RTL mode, horizontal overflow only into the vertical scrollbar does NOT
         * trigger horizontal scrollability.
         * See https://code.google.com/p/chromium/issues/detail?id=179332
         * We need to detect this for when a grid header needs to have exactly the same horizontal
         * scrolling range as its table view. See {@link Ext.grid.ColumnLayout#publishInnerCtSize}
         * TODO: Remove this when all supported Chrome versions are fixed.
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         * @private
         */
        name: 'rtlVertScrollbarOverflowBug',
        ready: true,
        fn: function(doc, div) {
            div.innerHTML = '<div style="height:100px;width:100px;direction:rtl;overflow:auto">' +
                '<div style="width:95px;height:200px;"></div>' +
            '</div>';

            // If the bug is present, the 95 pixel wide inner div, encroaches into the
            // vertical scrollbar, but does NOT trigger horizontal overflow, so the clientHeight
            // remains equal to the offset height.
            var outerBox = div.firstChild,
                style = div.style,
                pos = style.position;

            // This issue seems to require a repaint to measure correctly
            style.position = 'absolute';
            // eslint-disable-next-line no-unused-expressions
            outerBox.offsetHeight;
            style.position = pos;

            return outerBox.clientHeight === outerBox.offsetHeight;
        }
    }, {
        identity: 'defineProperty',
        fn: function() {
            if (Ext.isIE8m) {
                Ext.Object.defineProperty = Ext.emptyFn;

                return false;
            }

            return true;
        }
    }, {
        identify: 'nativeXhr',
        fn: function() {
            if (typeof XMLHttpRequest !== 'undefined') {
                return true;
            }

            // Apply a polyfill:

            XMLHttpRequest = function() { // eslint-disable-line no-global-assign
                try {
                    // eslint-disable-next-line no-undef
                    return new ActiveXObject('MSXML2.XMLHTTP.3.0');
                }
                catch (ex) {
                    return null;
                }
            };

            return false;
        }
    }, {
        /**
         * @property {Boolean} SpecialKeyDownRepeat
         * True if the browser fires the keydown event on specialkey autorepeat
         *
         * note 1: IE fires ONLY the keydown event on specialkey autorepeat
         * note 2: Safari < 3.1, Gecko (Mac/Linux) & Opera fire only the keypress event on
         * specialkey autorepeat (research done by Jan Wolter at
         * http://unixpapa.com/js/key.html)
         * note 3: Opera 12 behaves like other modern browsers so this workaround does not
         * work anymore
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'SpecialKeyDownRepeat',
        fn: function() {
            return Ext.isWebKit
                ? parseInt(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1], 10) >= 525
                : !(!(Ext.isGecko || Ext.isIE || Ext.isEdge) || (Ext.isOpera && Ext.operaVersion < 12)); // eslint-disable-line max-len
        }
    }, {
        /**
         * @property {Boolean} EmulatedMouseOver
         * True if the browser emulates a mouseover event on tap (mobile safari)
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'EmulatedMouseOver',
        fn: function() {
            // TODO: is it possible to feature detect this?
            return Ext.os.is.iOS;
        }
    }, {
        /**
         * @property Hashchange True if the user agent supports the hashchange event
         *
         * This property is available at application boot time, before document ready.
         * @type {Boolean}
         */
        // support Vector 12
        name: 'Hashchange',
        fn: function() {
            // Note that IE8 in IE7 compatibility mode reports true for 'onhashchange' in window,
            // so also test documentMode
            var docMode = document.documentMode;

            return 'onhashchange' in window && (docMode === undefined || docMode > 7);
        }
    }, {
        /**
         * @property FixedTableWidthBug
         * @private
         * @type {Boolean}
         * `true` if the browser has this bug: https://bugs.webkit.org/show_bug.cgi?id=130239
         *
         * This property is *NOT* available at application boot time. Only after the document
         * ready event.
         */
        name: 'FixedTableWidthBug',
        ready: true,
        fn: function() {
            if (Ext.isIE8) {
                // IE8 incorrectly detects that we have this bug.
                return false;
            }

            var outer = document.createElement('div'),
                inner = document.createElement('div'),
                width;

            outer.setAttribute('style', 'display:table;table-layout:fixed;');
            inner.setAttribute('style', 'display:table-cell;min-width:50px;');

            outer.appendChild(inner);
            document.body.appendChild(outer);

            // must poke offsetWidth to trigger a reflow before setting width
            // eslint-disable-next-line no-unused-expressions
            outer.offsetWidth;

            outer.style.width = '25px';

            width = outer.offsetWidth;

            document.body.removeChild(outer);

            return width === 50;
        }
    }, {
        /**
         * @property FocusinFocusoutEvents
         * @private
         * @type {Boolean}
         * `true` if the browser supports focusin and focusout events:
         * https://developer.mozilla.org/en-US/docs/Web/Events/focusin
         * At this point, only Firefox does not, see this bug:
         * https://bugzilla.mozilla.org/show_bug.cgi?id=687787
         *
         * This property is available at application boot time, before document ready.
         */
        name: 'FocusinFocusoutEvents',
        fn: function() {
            // There is no reliable way to feature detect focusin/focusout event support.
            // window.onfocusin will return undefined both in Chrome (where it is supported)
            // and in Firefox (where it is not supported); adding an element and trying to
            // focus it will fail when the browser window itself is not focused.
            return !(Ext.isGecko && Ext.firefoxVersion < 52);
        }
    }, {
        /**
         * @property {Boolean} AsyncFocusEvents
         * `true` if the browser fires focus events (focus, blur, focusin, focusout)
         * asynchronously, i.e. in a separate event loop invocation. This is only true
         * for all versions Internet Explorer; Microsoft Edge and other browsers fire
         * focus events synchronously.
         */
        name: 'AsyncFocusEvents',
        fn: function() {
            // The sad part is that we can't feature detect this because the focus
            // event won't be fired when the browser window itself is not focused.

            // Private shortcut for brevity
            return Ext.asyncFocus = !!Ext.isIE;
        }
    }, {
    //</feature>
        /**
         * @property {Object} accessibility Accessibility features.
         *
         * @property {Boolean} accessibility.Images `true` if the browser is configured
         * to display images.
         *
         * @property {Boolean} accessibility.BackgroundImages `true` if the browser
         * is configured to display background images.
         *
         * @property {Boolean} accessibility.BorderColors `true` if the browser
         * is configured to honor CSS styling for border colors.
         *
         * @property {Boolean} accessibility.LightOnDark `true` if the browser
         * is currently using reverse colors in light-on-dark accessibility mode.
         */
        name: 'accessibility',
        ready: true,
        fn: function(doc) {
            var body = doc.body,
                div, img, style, supports, bgImg;

            function getColor(colorTxt) {
                var values = [],
                    colorValue = 0,
                    regex, match;

                if (colorTxt.indexOf('rgb(') !== -1) {
                    values = colorTxt.replace('rgb(', '').replace(')', '').split(', ');
                }
                else if (colorTxt.indexOf('#') !== -1) {
                    regex = colorTxt.length === 7 ? /^#(\S\S)(\S\S)(\S\S)$/ : /^#(\S)(\S)(\S)$/;
                    match = colorTxt.match(regex);

                    if (match) {
                        values = ['0x' + match[1], '0x' + match[2], '0x' + match[3]];
                    }
                }

                for (var i = 0; i < values.length; i++) {
                    colorValue += parseInt(values[i]);
                }

                return colorValue;
            }

            div = doc.createElement('div');
            img = doc.createElement('img');

            style = div.style;

            Ext.apply(style, {
                width: '2px',
                position: 'absolute',
                clip: 'rect(1px,1px,1px,1px)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderTopTolor: '#f00',
                borderRightColor: '#ff0',
                backgroundColor: '#fff',
                backgroundImage: 'url(' + Ext.BLANK_IMAGE_URL + ')'
            });

            img.alt = '';
            img.src = Ext.BLANK_IMAGE_URL;

            div.appendChild(img);
            body.appendChild(div);

            // Now check if the styles were indeed honored
            style = div.currentStyle || div.style;
            bgImg = style.backgroundImage;

            supports = {
                // In IE it is possible to untick "Show pictures" option in Advanced
                // settings; this will result in img element reporting its readyState
                // as 'uninitialized'.
                // See http://www.paciellogroup.com/blog/2011/10/detecting-if-images-are-disabled-in-browsers/
                Images: img.offsetWidth === 1 && img.readyState !== 'uninitialized',
                BackgroundImages: !(bgImg !== null &&
                                   (bgImg === "none" || bgImg === "url(invalid-url:)")),
                BorderColors: style.borderTopColor !== style.borderRightColor,
                LightOnDark: getColor(style.color) - getColor(style.backgroundColor) > 0
            };

            Ext.supports.HighContrastMode = !supports.BackgroundImages;

            body.removeChild(div);
            div = img = null;

            return supports;
        }
    }, {
        /**
         * @property ViewportUnits `true` if the device supports ViewportUnits.
         * @type {Boolean}
         *
         */
        name: 'ViewportUnits',
        ready: true,
        fn: function(doc) {
            //<feature legacyBrowser>
            // Even attempting to detect the feature throws a fatal error on IE8
            if (Ext.isIE8) {
                return false;
            }
            //</feature>

            var body = doc.body,
                div = document.createElement('div'),
                style = div.currentStyle || div.style,
                width, divWidth;

            body.appendChild(div);

            Ext.apply(style, { width: '50vw' });

            width = parseInt(window.innerWidth / 2, 10);

            // eslint-disable-next-line max-len
            divWidth = parseInt((window.getComputedStyle ? getComputedStyle(div, null) : div.currentStyle).width, 10);

            body.removeChild(div);
            div = null;

            return width === divWidth;
        }
    }, {
        name: 'CSSVariables',
        ready: false,
        fn: function() {
            //<feature legacyBrowser>
            // Legacy browsers do not have this method.
            if (!window.getComputedStyle) {
                return false;
            }
            //</feature>

            return window.CSS && window.CSS.supports && window.CSS.supports('--test-var', 0);
        }
    }, {
        /**
         * @property Selectors2 `true` if the browser supports the CSS selector API level 2.
         * https://dev.w3.org/2006/webapi/selectors-api2/
         * @type {Boolean}
         *
         */
        name: 'Selectors2',
        ready: false,
        fn: function(doc) {
            try {
                return !!doc.querySelectorAll(':scope');
            }
            catch (e) {
                return false;
            }
        }
    }, {
        /**
         * @property CSSScrollSnap
         * @private
         * @type {Boolean}
         */
        name: 'CSSScrollSnap',
        ready: false,
        fn: function(doc) {
            var style = doc.documentElement.style;

            return 'scrollSnapType' in style || 'webkitScrollSnapType' in style ||
                   'msScrollSnapType' in style;
        }
    }, {
        /**
         * @property TranslateYCausesHorizontalScroll
         * @private
         * @type {Boolean}
         *
         * Bug for Edge logged here: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9743268/
         */
        name: 'TranslateYCausesHorizontalScroll',
        ready: true,
        fn: function(doc, div) {
            div.innerHTML = '<div style="position: relative; overflow: auto; height: 200px; width: 200px;">' + // eslint-disable-line max-len
                             '<div>' +
                               '<div style="transform: translateY(260px); width: 50px;">a</div>' +
                             '</div>' +
                           '</div>';

            return div.firstChild.scrollWidth > div.firstChild.clientWidth;
        }
    }, {
        /**
         * @property FlexBoxBasisBug
         * @private
         * @type {Boolean}
         * Allows align: stretch to align items to the height of the tallest item
         * in an auto-heighted hbox layout.
         * can't use flex-basis: auto everywhere because it breaks percentage-sized children
         * https://bugs.chromium.org/p/chromium/issues/detail?id=680484
         */
        name: 'FlexBoxBasisBug',
        ready: true,
        fn: function() {
            if (Ext.isIE11 ||
                (Ext.os.is.iOS && Ext.os.version.major <= 10) ||
                (Ext.isSafari && Ext.browser.version.isLessThan(11)) ||
                (Ext.os.is.Android && Ext.os.version.isLessThan(6))
            ) {
                return true;
            }

            return false;
        }
    }, {
        /**
         * @property PercentageSizeFlexBug
         * @private
         * @type {Boolean}
         *
         * Detects https://bugs.webkit.org/show_bug.cgi?id=137730
         */
        name: 'PercentageSizeFlexBug',
        ready: true,
        fn: function(doc, div) {
            if (Ext.isIE9m) {
                return false;
            }

            var style = div.style;

            style.display = 'flex';
            style.flexDirection = 'column';
            style.height = style.width = '100px';

            div.innerHTML = '<div style="flex: 1 1;"><div style="height:50%"></div></div>';

            return div.firstChild.firstChild.offsetHeight !== 50;
        }
    }, {
        /**
         * @property CannotScrollExactHeight
         * @type {Boolean}
         *
         * Feature detect the support of browsers that are unable to scroll elements that are
         * the same height as the native scrollbar height.
         */
        name: 'CannotScrollExactHeight',
        fn: function() {
            return Ext.isIE10p;
        }
    }, {
        /**
         * @property WebKitTextInputMarginBug
         * @private
         * @type {Boolean}
         *
         * Detects the following bug:
         * https://bugs.webkit.org/show_bug.cgi?id=137693
         *
         * Feb 22, 2017: This bug used to affect chrome as well, but appears to be fixed in
         * Chrome 56. The issue still exists in safari 10
         */
        name: 'WebKitInputTableBoxModelBug',
        ready: true,
        fn: function(doc, div) {
            var table = document.createElement('div'),
                cell = document.createElement('div'),
                input = document.createElement('input'),
                tableStyle = table.style,
                cellStyle = cell.style,
                inputStyle = input.style,
                body = doc.body,
                hasBug;

            input.type = 'text';

            tableStyle.display = 'table';
            tableStyle.height = '100px';
            cellStyle.display = 'table-cell';
            inputStyle.border = '0';
            inputStyle.padding = '10px';
            inputStyle.boxSizing = 'border-box';
            inputStyle.height = '100%';

            cell.appendChild(input);
            table.appendChild(cell);
            body.appendChild(table);

            hasBug = input.offsetHeight === 80;

            body.removeChild(table);

            return hasBug;
        }
    }, {
        /**
         * @property PassiveEventListener
         * @private
         * @type {Boolean}
         *
         * Detects support for the "passive" event listener option
         */
        name: 'PassiveEventListener',
        fn: function(doc, div) {
            var supportsPassive = false,
                options;

            try {
                options = Object.defineProperty({}, 'passive', {
                    get: function() { // eslint-disable-line getter-return
                        supportsPassive = true;
                    }
                });
                window.addEventListener('e', null, options);
                window.removeEventListener('e', null, options);
            }
            catch (e) {
                // ignore
            }

            return supportsPassive;
        }
    }, {
        /**
         * @property MinContent
         * @private
         * @type {Boolean}
         *
         * Detects support for CSS "min-content"
         */
        name: 'CSSMinContent',
        ready: true,
        fn: function(doc, div) {
            // As of 3/24/2017 IE/Edge have no min-content support, and firefox has
            // partial/buggy support: https://bugzilla.mozilla.org/show_bug.cgi?id=135015
            // This feature detector is designed to return false if there is not "full" support.
            // eslint-disable-next-line max-len
            div.innerHTML = '<div style="height:4px;width:4px;min-height:-webkit-min-content;min-height:-moz-min-content;min-height:min-content"><div style="height:8px;width:8px"></div></div>';

            return div.firstChild.offsetHeight === 8;
        }
    }, {
        name: 'ComputedSizeIncludesPadding',
        ready: true,
        fn: function(doc, div) {
            var ret = false,
                bd = document.body,
                el, w;

            if (window.getComputedStyle) {
                el = document.createElement('div');
                el.style.cssText = 'width:10px;padding:2px;' +
                  '-webkit-box-sizing:border-box;box-sizing:border-box;';
                bd.appendChild(el);

                w = window.getComputedStyle(el, null).width;
                ret = w === '10px';

                bd.removeChild(el);
            }

            return ret;
        }
    }, {
        name: 'inputEventData',
        ready: false,
        fn: function() {
            return !!(window.InputEvent && 'data' in new InputEvent('input'));
        }
    },

/* eslint-disable indent */
    // placeholder so legacy browser detectors can come/go cleanly
    0
] };

/* eslint-enable indent */
Ext.feature.tests.pop(); // remove the placeholder

Ext.supports = {};

Ext.feature.detect();
