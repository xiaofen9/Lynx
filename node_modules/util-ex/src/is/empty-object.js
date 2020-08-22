module.exports = function isEmptyObject(obj) {
    var k;
    for (k in obj) {
        return false;
    }
    return true;
}
