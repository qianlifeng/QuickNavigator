py = function(){
  // 拼音词库。
  // 加载压缩合并的数据(118KB)。
  function buildPinyinCache(dict_combo){
    var hans;
    var uncomboed = {};
    for(var py in dict_combo){
      hans = dict_combo[py];
      for(var i=0,han,l=hans.length; i<l; i++){
        han = hans.charAt(i);
        if(!uncomboed.hasOwnProperty(han)){
          uncomboed[han] = py;
        }else{
          uncomboed[han] += ","+py;
        }
      }
    }
    return uncomboed;
  }

  var DICT = buildPinyinCache(pinyinDict);
  dict_combo = null;
  delete dict_combo;

  // 加载未压缩的数据(334KB)。
  //var DICT = require("./pinyin-dict");

  // 声母表。
  var INITIALS = "zh,ch,sh,b,p,m,f,d,t,n,l,g,k,h,j,q,x,r,z,c,s,yu,y,w".split(",");
  // 韵母表。
  var FINALS = "ang,eng,ing,ong,an,en,in,un,er,ai,ei,ui,ao,ou,iu,ie,ve,a,o,e,i,u,v".split(",");
  var PINYIN_STYLE =  {
    NORMAL: 0,  // 普通风格，不带音标。
    TONE: 1,    // 标准风格，音标在韵母的第一个字母上。
    TONE2: 2,   // 声调中拼音之后，使用数字 1~4 标识。
    INITIALS: 3,// 仅需要声母部分。
    FIRST_LETTER: 4 // 仅保留首字母。
  };
  // 带音标字符。
  var PHONETIC_SYMBOL = {
    "ā": "a1",
    "á": "a2",
    "ǎ": "a3",
    "à": "a4",
    "ē": "e1",
    "é": "e2",
    "ě": "e3",
    "è": "e4",
    "ō": "o1",
    "ó": "o2",
    "ǒ": "o3",
    "ò": "o4",
    "ī": "i1",
    "í": "i2",
    "ǐ": "i3",
    "ì": "i4",
    "ū": "u1",
    "ú": "u2",
    "ǔ": "u3",
    "ù": "u4",
    "ü": "v0",
    "ǘ": "v2",
    "ǚ": "v3",
    "ǜ": "v4",
    "ń": "n2",
    "ň": "n3",
    "": "m2"
  };
  var re_phonetic_symbol_source = "";
  for(var k in PHONETIC_SYMBOL){
      re_phonetic_symbol_source += k;
  }
  var RE_PHONETIC_SYMBOL = new RegExp('(['+re_phonetic_symbol_source+'])', 'g');
  var RE_TONE2 = /([aeoiuvnm])([0-4])$/;
  var DEFAULT_OPTIONS = {
    style: PINYIN_STYLE.TONE, // 风格
    heteronym: false // 多音字
  };

  function extend(origin, more){
    if(!more){return origin;}
    var obj = {};
    for(var k in origin){
      if(more.hasOwnProperty(k)){
        obj[k] = more[k]
      }else{
        obj[k] = origin[k]
      }
    }
    return obj;
  }

  /**
   * 修改拼音词库表中的格式。
   * @param {String} pinyin, 单个拼音。
   * @param {PINYIN_STYLE} style, 拼音风格。
   * @return {String}
   */
  function toFixed(pinyin, style){
    var handle;
    var tone = ""; // 声调，默认无声调。
    switch(style){
    case PINYIN_STYLE.INITIALS:
      return initials(pinyin);
    case PINYIN_STYLE.FIRST_LETTER:
      handle = function($0, $1){
        return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
      };
      //return pinyin.charAt(0);
    case PINYIN_STYLE.NORMAL:
      handle = function($0, $1){
        return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
      }
      break;
    case PINYIN_STYLE.TONE2:
      handle = function($0, $1){
        if(!PHONETIC_SYMBOL.hasOwnProperty($1)){
          return $1;
        }
        tone = PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$2");
        return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
      }
      break;
    case PINYIN_STYLE.TONE:
    default:
      handle = function($0, $1){
        return $1;
      }
      break;
    }
    var py = pinyin.replace(RE_PHONETIC_SYMBOL, handle);
    switch(style){
    case PINYIN_STYLE.TONE2:
      py += tone;
      break;
    case PINYIN_STYLE.FIRST_LETTER:
      py = py.charAt(0);
      break;
    default:
    }
    return py;
  }

  /**
   * 单字拼音转换。
   * @param {String} han, 单个汉字
   * @return {Array} 返回拼音列表，多音字会有多个拼音项。
   */
  function single_pinyin(han, options){
    if("string" !== typeof han){return [];}
    options = extend(DEFAULT_OPTIONS, options);
    if(han.length !== 1){
      return single_pinyin(han.charAt(0), options);
    }
    if(!DICT.hasOwnProperty(han)){return [han];}
    var pys = DICT[han].split(",");
    if(!options.heteronym){
      return [toFixed(pys[0], options.style)];
    }
    // 临时存储已存在的拼音，避免重复。
    var py_cached = {};
    var pinyins = [];
    for(var i=0,py,l=pys.length; i<l; i++){
      py = toFixed(pys[i], options.style);
      if(py_cached.hasOwnProperty(py)){continue;}
      py_cached[py] = py;

      pinyins.push(py);
    }
    return pinyins;
  }
  /**
   * @param {String} hans 要转为拼音的目标字符串（汉字）。
   * @param {Object} options, 可选，用于指定拼音风格，是否启用多音字。
   * @return {Array} 返回的拼音列表。
   */
  function pinyin(hans, options){
    if("string" !== typeof hans){return [];}
    options = extend(DEFAULT_OPTIONS, options);
    var len = hans.length;
    var py = [];
    for(var i=0,l=len; i<l; i++){
      py.push(single_pinyin(hans[i], options));
    }
    return py;
  }


  /**
   * 声母(Initials)、韵母(Finals)。
   * @param {String/Number/RegExp/Date/Function/Array/Object}
   * @return {String/Number/RegExp/Date/Function/Array/Object}
   */
  function initials(pinyin){
    for(var i=0,l=INITIALS.length; i<l; i++){
      if(pinyin.indexOf(INITIALS[i]) === 0){
        return INITIALS[i];
      }
    }
    return "";
  }

  function contains(s){
     return /.*[\u4e00-\u9fa5]+.*$/.test(s);
  }

  function getSpecifiedHans(source,words){
    //fist check if source has han
    if(contains(source)){ 
        var pinyinArrary =convertHans(source);
        var matchResult = [];
        for(var i = 0;i < pinyinArrary.length; i++){
            splitWordAndMatch(pinyinArrary,i,words,matchResult); 
            if(matchResult.length > 0) return matchResult;
        }
    } 
    return null;
  }

    function splitWordAndMatch(pinyinArrary,startMatchIndex,words,matchResult){
        var currentItem = pinyinArrary[startMatchIndex][0];
        //hans must has two letters at least. this operation will filter the enligh letter
        if(currentItem.length <= 1) return;

        //if the lenght of words we want match less than the currentItem, that means
        //1. words is not long enough to be a whole word. for this, we will not start match
        //2. the front of words has been matched, the rest of the words(only the last word) allow fuzzy match
        if(words.length < currentItem.length){
           if(currentItem.indexOf(words) == 0 && matchResult.length > 0){
                matchResult.push(startMatchIndex) 
           } 
           else{
               for(var i = 0; i< matchResult.length;i++)
               {
                    matchResult.pop();
               }
           }
           return;
        }

        if(words.indexOf(currentItem) == 0){
            matchResult.push(startMatchIndex)

            var splitWord = words.substr(currentItem.length);
            if(splitWord.length > 0 && startMatchIndex+1 <= pinyinArrary.length -1)
            {
               splitWordAndMatch(pinyinArrary,startMatchIndex+1,splitWord,matchResult); 
            }
        } 
    }

    function convertHans(s){
         return pinyin(s,{
          style:PINYIN_STYLE.NORMAL,
          heteronym:false 
        });      
    }

  return{
    convert:function(s){
       return pinyin(s,{
          style:PINYIN_STYLE.NORMAL,
          heteronym:false 
        });  
    },
    containHans:function(s){
        return contains(s);            
    },
    //从source中得到hans的位置
    getHans:function(source,hans){
        return getSpecifiedHans(source,hans); 
    }

  };

}();
