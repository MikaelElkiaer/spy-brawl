"use strict";

class IdGenerator {
  constructor(crypto) {
    this._crypto = crypto;
  }

  generate(seed, length) {
    if (!seed) seed = new Date().toString();
    var id = this._crypto.createHash('md5').update(seed).digest('hex');
    if (length) id = id.substring(0, length);

    return id;
  }
}

module.exports = IdGenerator;
