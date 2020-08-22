int = /^(?:[-+]?(?:0|(?:0[xX])?[0-9]*))$/

module.exports = (str)->str isnt '' and int.test(str)

