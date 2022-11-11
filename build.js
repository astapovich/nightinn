const StyleDictionaryPackage = require('style-dictionary');

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED

StyleDictionaryPackage.registerFormat({
    name: 'css/variables',
    formatter: function (dictionary, config) {
      return `${this.selector} {
        ${dictionary.allProperties.map(prop => `  --${prop.name}: ${prop.value};`).join('\n')}
      }`
    }
  });  

StyleDictionaryPackage.registerTransform({
    name: 'sizes/px',
    type: 'value',
    matcher: function(prop) {
        // You can be more specific here if you only want 'em' units for font sizes    
        return ["fontSizes", "spacing", "borderRadius", "borderWidth", "sizing", "lineHeights","letterSpacing"].includes(prop.type);
    },
    transformer: function(prop) {
        // You can also modify the value here if you want to convert pixels to ems
        if (prop.value === 0) {return '0';}
        else {return parseFloat(prop.original.value) + 'px';}
    }
    });

StyleDictionaryPackage.registerTransform({
  name: 'shadow/css',
  type: 'value',
    matcher: function(prop) {
    return prop.type === 'boxShadow';
  },
  transformer: function(prop) {
    const shadow = Object.values(prop.value);
    const [x, y, blur, spread, color] = shadow.map((s) => s.toString());
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }
});

StyleDictionaryPackage.registerTransform({
  name: 'innershadow/css',
  type: 'value',
    matcher: function(prop) {
    return prop.attributes.type === "innershadow";
  },
  transformer: function(prop) {
    return 'inset ' + prop.value;
  }
});

StyleDictionaryPackage.registerFilter({
  name: 'isAlias',
  matcher: function(prop) {
    return (!(prop.attributes.category === "alias" || prop.alias));
  }
})

StyleDictionaryPackage.registerFilter({
  name: 'isColor',
  matcher: function(prop) {
    return (!(prop.attributes.category === "alias" || prop.alias)) && prop.type === 'color';
  }
})

StyleDictionaryPackage.registerFilter({
  name: 'isShadow',
  matcher: function(prop) {
    return (!(prop.attributes.category === "alias" || prop.alias)) && prop.type === 'boxShadow';
  }
})

StyleDictionaryPackage.registerFilter({
  name: 'isComponent',
  matcher: function(prop) {
    return prop.attributes.category === 'component';
  }
})


function getStyleDictionaryConfig(theme) {
  return {
    "source": [
      `tokens/${theme}.json`,
    ],
    "platforms": {
      "web": {
        "transforms": ["attribute/cti", "name/cti/kebab", "sizes/px", "shadow/css", "innershadow/css", "color/rgb"],
        "buildPath": `output/`,
        "files": [{
            "destination": `${theme}.css`,
            "format": "css/variables",
            "filter": "isAlias",
            "selector": `:root`
          }]
      }
    }
  };
}

console.log('Build started...');

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS

['global', 'dark', 'light'].map(function (theme) {

    console.log('\n==============================================');
    console.log(`\nProcessing: [${theme}]`);

    const StyleDictionary = StyleDictionaryPackage.extend(getStyleDictionaryConfig(theme));

    StyleDictionary.buildPlatform('web');

    console.log('\nEnd processing');
})

console.log('\n==============================================');
console.log('\nBuild completed!');
