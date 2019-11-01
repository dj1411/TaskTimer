/*******************************************************************************
 * MIT License
 * 
 * Copyright (c) 2018 Jayanta Debnath
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *******************************************************************************/

/* session storage is only to put simple data */
/* only data can be stored in ss, not any references or objects */

var ss = {};

function ssInit() {
    "use strict";
    
    var s = sessionStorage.getItem(getStorName("ss"));
    if (s !== null && s !== undefined) {
        ss = JSON.parse(s);
    }
}

/* it will overwrite any existing data */
function ssSet(key, val) {
    "use strict";
    
    ss[key] = val;
    sessionStorage.setItem(getStorName("ss"), JSON.stringify(ss));
}

function ssGet(key) {
    "use strict";
    
    if (ss[key] === null || ss[key] === undefined || ss[key] === "") {
        alert("ssGet: could not find " + key);
        return null;
    } else {
        return ss[key];
    }
}

function ssReset(key) {
    "use strict";
    
    delete ss[key];
    sessionStorage.setItem(getStorName("ss"), JSON.stringify(ss));
}
