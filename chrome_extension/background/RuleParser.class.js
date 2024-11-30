class RuleParser {
  static parseXPR(content) {
    const result = [];
  
    function deep(path, obj) {
      const { values, ...keys } = obj;
      
      for(const value of values) {
        result.push({
          path, ...value
        });
      }
      
      for(const key in keys) {
        deep(path.concat(key), keys[key]);
      }
    }
    
    deep([], content);
    return result;
  }
  
  static parseTranslation(content) {
    const result = [];

    function deep(path, obj) {
      if(obj.data === true) {
        const { data, ...temp } = obj;
        const name = path.pop();
        
        result.push({
          path, name, ...temp
        });
        
        return;
      }
      
      for(const key in obj) {
        deep(path.concat(key), obj[key]);
      }
    }

    deep([], content);
    return result;
  }
}

export default RuleParser;