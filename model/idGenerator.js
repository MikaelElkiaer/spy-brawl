class IdGenerator {
  static generateId(crypto, seed, length) {
    if (!seed) seed = new Date().toString();
    var id = crypto.createHash('md5').update(seed).digest('hex');
    if (length) id = id.substring(0, length);

    return id;
  }
}

module.exports = IdGenerator;
