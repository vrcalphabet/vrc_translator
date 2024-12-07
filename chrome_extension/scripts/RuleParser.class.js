class RuleParser {
  static parseRules(content) {
    const result = [];
  
    function deep(keyStack, obj) {
      const { values, ...keys } = obj;
      
      for(const value of values) {
        result.push({
          key: keyStack.join('/'),
          ...value
        });
      }
      
      for(const key in keys) {
        deep(keyStack.concat(key), keys[key]);
      }
    }
    
    deep([], JSON.parse(content));
    return result;
  }
  
  static parseTranslation(content) {
    const result = [];

    function deep(keyStack, obj) {
      if(obj.data === true) {
        const { data, ...temp } = obj;
        const name = keyStack.pop();
        
        result.push({
          key: keyStack.join('/'),
          name, ...temp
        });
        
        return;
      }
      
      for(const key in obj) {
        deep(keyStack.concat(key), obj[key]);
      }
    }

    deep([], JSON.parse(content));
    return result;
  }
}

export default RuleParser;