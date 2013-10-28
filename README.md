# codeMagic

## About

[codeMagic](http://codemagic.gr) is an online playground IDE for HTML, CSS, Javascript. It includes a built-in console and various other features!

### Features

1. Markup choices: HTML , Markdown
2. Stylesheet choices: CSS, LESS
3. Built-in Console
4. Prettify your code automatically
5. Many CSS and JS libraries to choose from



## The Console Panel

### What is the console panel

By overriding the output of the default JavaScript console, you can see the results of your logging in the Console Panel. For now only `console.log()` is implemented and it's object logging goes only 1 level deep (after that, it will print `[object Object]` instead of the actual content).

#### minor update:

The console now supports LESS compiling errors! (you don't do anything yourself, if there is an error while compiling your LESS code, the errors will be printed in the console for easier debugging).

### console.log() Examples

You can use `console.log` to print the content of the selected variable(s) in the console panel, for example:

    var x = "myString";
    console.log(x);

The output will look like this:

    > myString

Here is another example with multiple variables:

    var x = "myString";
    var y = 5;
    
    console.log(x, y);

The output will look like this:

    > myString
    > 5

You can even see the content of objects, for example:

    var point = {};
    point.x = 120;
    point.y = 9;
    
    console.log(point);

The output will look like this:

    > Object {
        x : 120,
        y : 9
    }

Another example with Array Objects:

    var arr = [1, 2, 3, 4, 5];
    
    console.log(arr);

The output will look like this:

    > Object {
        0 : 1,
        1 : 2,
        2 : 3,
        3 : 4,
        4 : 5
    }


## Support (not final)

* Chrome 14+
* Firefox 3.6+
* Internet Explorer 9+
* Opera 10+
* Safari 4+

## License

codeMagic by [Adonis K.](http://varemenos.com) is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US).

[![Creative Commons License](http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png)](http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US)
