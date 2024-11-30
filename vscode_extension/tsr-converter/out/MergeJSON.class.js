class MergeJSON {
  static merge(base, obj) {
    for(const key in base) {
      const temp = {};
      for(const lang in obj) {
        temp[lang] = obj[lang][key];
      }
      if(base[key] === null) {
        base[key] = temp;
        continue;
      }
      this.merge(base[key], temp);
    }
    return base;
  }
}

module.exports = MergeJSON;