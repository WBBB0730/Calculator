/** Array.at */
if (!Array.prototype.at) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.at = function (index) {
        if (index < 0)
            index += this.length
        return index >= 0 && index < this.length ? this[index] : undefined
    }
}

/** String.at */
if (!String.prototype.at) {
    // eslint-disable-next-line no-extend-native
    String.prototype.at = function (index) {
        if (index < 0)
            index += this.length
        return index >= 0 && index < this.length ? this[index] : undefined
    }
}
