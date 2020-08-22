'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var patternParts = {
    value: '[-+]?(?:Infinity|[[0-9]*\\.?\\d*(?:[eE][-+]?\\d+)?)',
    leftBrace: '[\\(\\]\\[]',
    delimeter: ',',
    rightBrace: '[\\)\\]\\[]',
};
var PATTERN = new RegExp("(" + patternParts.leftBrace + ")" +
    ("(" + patternParts.value + ")?") +
    ("(" + patternParts.delimeter + ")?") +
    ("(" + patternParts.value + ")?") +
    ("(" + patternParts.rightBrace + ")"));
function execPattern(str) {
    var match = PATTERN.exec(str);
    if (!match) {
        return null;
    }
    var _ = match[0], leftBrace = match[1], fromValue = match[2], delimeter = match[3], toValue = match[4], rightBrace = match[5];
    return {
        leftBrace: leftBrace,
        fromValue: fromValue,
        delimeter: delimeter,
        toValue: toValue,
        rightBrace: rightBrace,
    };
}
function parse(str) {
    var match = execPattern(str);
    if (!match) {
        return null;
    }
    return {
        from: {
            value: match.fromValue !== undefined ?
                +match.fromValue :
                -Infinity,
            included: match.leftBrace === '['
        },
        to: {
            value: match.toValue !== undefined ?
                +match.toValue :
                (match.delimeter ?
                    +Infinity :
                    match.fromValue !== undefined ?
                        +match.fromValue :
                        NaN),
            included: match.rightBrace === ']'
        }
    };
}
function check(interval) {
    if (interval.from.value === interval.to.value) {
        return interval.from.included && interval.to.included;
    }
    return Math.min(interval.from.value, interval.to.value) === interval.from.value;
}
function entry(str) {
    var interval = parse(str);
    if (!interval || !check(interval)) {
        return null;
    }
    return interval;
}
exports.default = entry;
