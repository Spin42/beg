beg
===

A fast and simple node HTTP request module


# Usage

        var beg = require("beg");
        beg.get(options, parseJson, function (err, body){
          console.log(body);
        });

Where options is a standard options hash like the one of http.request

Additionnally, the option ```secure``` provide the ability to emit secure (HTTPS) requests

When setted to true the optional ```parseJson``` argument force beg to parse the JSON response