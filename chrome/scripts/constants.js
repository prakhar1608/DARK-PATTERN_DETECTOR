/**
 * The object to access the API functions of the browser.
 * @constant
 * @type {{runtime: object, i18n: object}} BrowserAPI
 */
const brw = chrome;

/**
 * Configuration of the pattern detection functions.
 * The following attributes must be specified for each pattern.
 *  - `name`: The name of the pattern that will be displayed on the UI.
 *  - `className`: A valid CSS class name for the pattern (used only internally and not displayed).
 *  - `detectionFunctions`: An array of functions `f(node, nodeOld)` to detect the pattern.
 *      Parameters of the functions are the HTML node to be examined in current and previous state (in this order).
 *      The functions must return `true` if the pattern was detected and `false` if not.
 *  - `infoUrl`: The URL to the explanation of the pattern on the `dapde.de` website.
 *  - `info`: A brief explanation of the pattern.
 *  - `languages`: An array of ISO 639-1 codes of the languages supported by the detection functions..
 * @constant
 * @type {{
 *  patterns: Array.<{
 *      name: string,
 *      className: string,
 *      detectionFunctions: Array.<Function>,
 *      infoUrl: string,
 *      info: string,
 *      languages: Array.<string>
 *  }>
 * }}
 */
export const patternConfig = {
    patterns: [
        {
            /**
             * Countdown Pattern.
             * Countdown patterns induce (truthfully or falsely) the impression that a product or service is only available for a certain period of time.
             * This is illustrated through a running clock or a lapsing bar.
             * You can watch as the desired good slips away.
             */
            name: brw.i18n.getMessage("patternCountdown_name"),
            className: "countdown",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Ensure the node text is not empty
                    const currentText = node.innerText?.trim();
                    const oldText = nodeOld?.innerText?.trim();
                    if (!currentText || !oldText) return false;
            
                    /**
                     * Extended Regular Expression for Countdown Patterns:
                     * This regex covers formats such as:
                     * - "00:05:10" (HH:MM:SS)
                     * - "5:10" (MM:SS)
                     * - "2 days 10 hours left"
                     * - "Only 10 minutes remaining"
                     */
                    const countdownRegex = /(\d{1,2}:\d{1,2}(:\d{1,2})?)|(\d+\s*(days?|hours?|minutes?|seconds?|hrs?|mins?|secs?)\s*(left|remaining)?)/gi;
            
                    /**
                     * Extended Regular Expression for Invalid Countdown Formats:
                     * This regex ignores false positives, such as:
                     * - "23:59:58:10" (Invalid - more than 3 parts)
                     * - Text with random numbers like "Phone: 123-456"
                     */
                    const invalidCountdownRegex = /(\d{1,2}:\d{1,2}:\d{1,2}:\d{1,2})|(\d+\s*\w+\s*\d+\s*\w+)/gi;
            
                    // Remove invalid parts from the text and then look for real countdown matches
                    const filteredCurrentText = currentText.replace(invalidCountdownRegex, "");
                    const filteredOldText = oldText.replace(invalidCountdownRegex, "");
            
                    const currentMatches = filteredCurrentText.match(countdownRegex);
                    const oldMatches = filteredOldText.match(countdownRegex);
            
                    // If no valid countdown patterns are detected, return false
                    if (!currentMatches || !oldMatches || currentMatches.length !== oldMatches.length) {
                        return false;
                    }
            
                    // Iterate through all matched countdown strings
                    for (let i = 0; i < currentMatches.length; i++) {
                        const currentNumbers = currentMatches[i].match(/\d+/g);
                        const oldNumbers = oldMatches[i].match(/\d+/g);
            
                        // If the number of parts doesn't match, skip this pair
                        if (!currentNumbers || !oldNumbers || currentNumbers.length !== oldNumbers.length) {
                            continue;
                        }
            
                        let isCountingDown = false;
            
                        // Check if the numbers indicate a countdown (i.e., decrease over time)
                        for (let x = 0; x < currentNumbers.length; x++) {
                            const currentNum = parseInt(currentNumbers[x], 10);
                            const oldNum = parseInt(oldNumbers[x], 10);
            
                            // If any number in the current state is greater than the old state, it's not counting down
                            if (currentNum > oldNum) {
                                break;
                            }
            
                            // If at least one number decreases, mark it as a countdown
                            if (currentNum < oldNum) {
                                isCountingDown = true;
                                break;
                            }
                        }
            
                        // If a countdown is confirmed, return true
                        if (isCountingDown) {
                            return true;
                        }
                    }
            
                    // If no countdown was detected, return false
                    return false;
                }
            ]
            ,
            infoUrl: brw.i18n.getMessage("patternCountdown_infoUrl"),
            info: brw.i18n.getMessage("patternCountdown_info"),
            languages: [
                "en",
                "de"
            ]
        },
        {
            /**
             * Scarcity Pattern.
             * The Scarcity Pattern induces (truthfully or falsely) the impression that goods or services are only available in limited numbers.
             * The pattern suggests: Buy quickly, otherwise the beautiful product will be gone!
             * Scarcity Patterns are also used in versions where the alleged scarcity is simply invented or
             * where it is not made clear whether the limited availability relates to the product as a whole or only to the contingent of the portal visited.
             */
            name: brw.i18n.getMessage("patternScarcity_name"),
            className: "scarcity",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the scarcity pattern with English words.
                    // The regular expression checks whether a number is followed by one of several keywords
                    // or alternatively if the word group 'last/final article/item' is present.
                    // The previous state of the element is not used.
                    // Example: "10 pieces available"
                    //          "99% claimed"
                    return /\d+\s*(?:\%|pieces?|pcs\.?|pc\.?|ct\.?|items?)?\s*(?:available|sold|claimed|redeemed)|(?:last|final)\s*(?:article|item)/i.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the scarcity pattern with German words.
                    // The regular expression checks whether a number is followed by one of several keywords
                    // or alternatively if the word group 'last article' (`letzter\s*Artikel`) is present.
                    // The previous state of the element is not used.
                    // Example: "10 Stück verfügbar"
                    //          "99% eingelöst"
                    return /\d+\s*(?:\%|stücke?|stk\.?)?\s*(?:verfügbar|verkauft|eingelöst)|letzter\s*Artikel/i.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternScarcity_infoUrl"),
            info: brw.i18n.getMessage("patternScarcity_info"),
            languages: [
                "en",
                "de"
            ]
        },
        {
            /**
             * Social Proof Pattern.
             * Social Proof is another Dark Pattern of this category.
             * Positive product reviews or activity reports from other users are displayed directly.
             * Often, these reviews or reports are simply made up.
             * But authentic reviews or reports also influence the purchase decision through smart selection and placement.
             */
            name: brw.i18n.getMessage("patternSocialProof_name"),
            className: "social-proof",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the social proof pattern with English words.
                    // The regular expression checks whether a number is followed by a combination of different keywords.
                    // The previous state of the element is not used.
                    // Example: "5 other customers also bought this article"
                    //          "6 buyers have rated the following products [with 5 stars]"
                    return /\d+\s*(?:other)?\s*(?:customers?|clients?|buyers?|users?|shoppers?|purchasers?|people)\s*(?:have\s+)?\s*(?:(?:also\s*)?(?:bought|purchased|ordered)|(?:rated|reviewed))\s*(?:this|the\s*following)\s*(?:product|article|item)s?/i.test(node.innerText);
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using a regular expression for the social proof pattern with German words.
                    // The regular expression checks whether a number is followed by a combination of different keywords.
                    // The previous state of the element is not used.
                    // Example: "5 andere Kunden kauften auch diesen Artikel"
                    //          "6 Käufer*innen haben folgende Produkte [mit 5 Sternen bewertet]"
                    return /\d+\s*(?:andere)?\s*(?:Kunden?|Käufer|Besteller|Nutzer|Leute|Person(?:en)?)(?:(?:\s*\/\s*)?[_\-\*]?innen)?\s*(?:(?:kauften|bestellten|haben)\s*(?:auch|ebenfalls)?|(?:bewerteten|rezensierten))\s*(?:diese[ns]?|(?:den|die|das)?\s*folgenden?)\s*(?:Produkte?|Artikel)/i.test(node.innerText);
                }
            ],
            infoUrl: brw.i18n.getMessage("patternSocialProof_infoUrl"),
            info: brw.i18n.getMessage("patternSocialProof_info"),
            languages: [
                "en",
                "de"
            ]
        },
        {
            /**
             * Forced Continuity Pattern (adapted to German web pages).
             * The Forced Continuity pattern automatically renews free or low-cost trial subscriptions - but for a fee or at a higher price.
             * The design trick is that the order form visually suggests that there is no charge and conceals the (automatic) follow-up costs.
             */
            name: brw.i18n.getMessage("patternForcedContinuity_name"),
            className: "forced-continuity",
            detectionFunctions: [
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for the forced proof continuity with English words.
                    // The regular expressions check if one of three combinations of a price specification
                    // in Euro, Dollar or Pound and the specification of a month is present.
                    // The previous state of the element is not used.
                    if (/(?:(?:€|EUR|GBP|£|\$|USD)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:euros?|€|EUR|GBP|£|pounds?(?:\s*sterling)?|\$|USD|dollars?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)\s*(?:after|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "$10.99/month after"
                        //          "11 GBP a month from month 4"
                        return true;
                    }
                    if (/(?:(?:€|EUR|GBP|£|\$|USD)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:euros?|€|EUR|GBP|£|pounds?(?:\s*sterling)?|\$|USD|dollars?))\s*(?:after\s*(?:the)?\s*\d+(?:th|nd|rd|th)?\s*(?:months?|days?)|from\s*(?:month|day)\s*\d+)/i.test(node.innerText)) {
                        // Example: "$10.99 after 12 months"
                        //          "11 GBP from month 4"
                        return true;
                    }
                    if (/(?:after\s*that|then|afterwards|subsequently)\s*(?:(?:€|EUR|GBP|£|\$|USD)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:euros?|€|EUR|GBP|£|pounds?(?:\s*sterling)?|\$|USD|dollars?))\s*(?:(?:(?:per|\/|a)\s*month)|(?:p|\/)m)/i.test(node.innerText)) {
                        // Example: "after that $23.99 per month"
                        //          "then GBP 10pm"
                        return true;
                    }
                    if (/after\s*(?:the)?\s*\d+(?:th|nd|rd|th)?\s*months?\s*(?:only|just)?\s*(?:(?:€|EUR|GBP|£|\$|USD)\s*\d+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:euros?|€|EUR|GBP|£|pounds?(?:\s*sterling)?|\$|USD|dollars?))/i.test(node.innerText)) {
                        // Example: "after the 24th months only €23.99"
                        //          "after 6 months $10"
                        return true;
                    }
                    // Return `false` if no regular expression matches.
                    return false;
                },
                function (node, nodeOld) {
                    // Return true if a match is found in the current text of the element,
                    // using multiple regular expressions for the forced proof continuity with German words.
                    // The regular expressions check if one of three combinations of a price specification
                    // in Euro and the specification of a month is present.
                    // The previous state of the element is not used.
                    if (/\d+(?:,\d{2})?\s*(?:Euro|€)\s*(?:(?:pro|im|\/)\s*Monat)?\s*(?:ab\s*(?:dem)?\s*\d+\.\s*Monat|nach\s*\d+\s*(?:Monaten|Tagen)|nach\s*(?:einem|1)\s*Monat)/i.test(node.innerText)) {
                        // Example: "10,99 Euro pro Monat ab dem 12. Monat"
                        //          "11€ nach 30 Tagen"
                        return true;
                    }
                    if (/(?:anschließend|danach)\s*\d+(?:,\d{2})?\s*(?:Euro|€)\s*(?:pro|im|\/)\s*Monat/i.test(node.innerText)) {
                        // Example: "anschließend 23,99€ pro Monat"
                        //          "danach 10 Euro/Monat"
                        return true;
                    }
                    if (/\d+(?:,\d{2})?\s*(?:Euro|€)\s*(?:pro|im|\/)\s*Monat\s*(?:anschließend|danach)/i.test(node.innerText)) {
                        // Example: "23,99€ pro Monat anschließend"
                        //          "10 Euro/Monat danach"
                        return true;
                    }
                    if (/ab(?:\s*dem)?\s*\d+\.\s*Monat(?:\s*nur)?\s*\d+(?:,\d{2})?\s*(?:Euro|€)/i.test(node.innerText)) {
                        // Example: "ab dem 24. Monat nur 23,99 Euro"
                        //          "ab 6. Monat 9,99€"
                        return true;
                    }
                    // Return `false` if no regular expression matches.
                    return false;
                }
            ],
            infoUrl: brw.i18n.getMessage("patternForcedContinuity_infoUrl"),
            info: brw.i18n.getMessage("patternForcedContinuity_info"),
            languages: [
                "en",
                "de"
            ]
        }
    ]
}

/**
 * Checks if the `patternConfig` is valid.
 * @returns {boolean} `true` if the `patternConfig` is valid, `false` otherwise.
 */
function validatePatternConfig() {
    // Create an array with the names of the configured patterns.
    let names = patternConfig.patterns.map(p => p.name);
    // Check if there are duplicate names.
    if ((new Set(names)).size !== names.length) {
        // If there are duplicate names, the configuration is invalid.
        return false;
    }
    // Check every single configured pattern for validity.
    for (let pattern of patternConfig.patterns) {
        // Ensure that the name is a non-empty string.
        if (!pattern.name || typeof pattern.name !== "string") {
            return false;
        }
        // Ensure that the class name is a non-empty string.
        if (!pattern.className || typeof pattern.className !== "string") {
            return false;
        }
        // Ensure that the detection functions are a non-empty array.
        if (!Array.isArray(pattern.detectionFunctions) || pattern.detectionFunctions.length <= 0) {
            return false;
        }
        // Check every single configured detection function for validity.
        for (let detectionFunc of pattern.detectionFunctions) {
            // Ensure that the detection function is a function with two arguments.
            if (typeof detectionFunc !== "function" || detectionFunc.length !== 2) {
                return false;
            }
        }
        // Ensure that the info URL is a non-empty string.
        if (!pattern.infoUrl || typeof pattern.infoUrl !== "string") {
            return false;
        }
        // Ensure that the info/explanation is a non-empty string.
        if (!pattern.info || typeof pattern.info !== "string") {
            return false;
        }
        // Ensure that the languages are a non-empty array.
        if (!Array.isArray(pattern.languages) || pattern.languages.length <= 0) {
            return false;
        }
        // Check every single language for being a non-empty string.
        for (let language of pattern.languages) {
            // Ensure that the language is a non-empty string.
            if (!language || typeof language !== "string") {
                return false;
            }
        }
    }
    // If all checks have been passed successfully, the configuration is valid and `true` is returned.
    return true;
}

/**
 * @type {boolean} `true` if the `patternConfig` is valid, `false` otherwise.
 */
export const patternConfigIsValid = validatePatternConfig();

/**
 * Prefix for all CSS classes that are added to elements on websites by the extension.
 * @constant
 */
export const extensionClassPrefix = "__ph__";

/**
 * The class that is added to elements detected as patterns.
 * Elements with this class get a black border from the CSS styles.
 * @constant
 */
export const patternDetectedClassName = extensionClassPrefix + "pattern-detected";

/**
 * A class for the elements created as shadows for pattern elements
 * for displaying individual elements using the popup.
 */
export const currentPatternClassName = extensionClassPrefix + "current-pattern";

/**
 * A list of HTML tags that should be ignored during pattern detection.
 * The elements with these tags are removed from the DOM copy.
 */
export const tagBlacklist = ["script", "style", "noscript", "audio", "video"];
