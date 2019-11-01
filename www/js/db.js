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

/* This file is not allowed to rely on any external data */
/* Nor is it meant to call any js api outside this file. */
/* this is purely for setter apis */
/* it is allowed to do some calculations */
/* The apis here are not strictly sorted alphabetically. rather similar apis are 
 * clubbed together whenevre possible */


function TimeWindow(id) {
    "use strict";

    /* inherited data from Signature */
    this.id = id;

    /* own data */
    this.startTime = null;
    this.endTime = null;
    this.breakdur = moment.duration(0);
}


function ParentTask(idTask) {
    "use strict";

    /* inherited data from Signature */
    this.id = idTask;

    /* inherit data from Task*/
    this.name = null;
    this.arrTimeWindow = [];
}


function Data() {
    "use strict";

    /* inherited data from Signature */
    this.id = null;

    /* own data */
    this.arrTasks = [];
}


function DB() {
    "use strict";

    this.root = {};
    this.load();

    if (this.root.data === undefined || this.root.data === null || this.root.data === "") {
        this.root.data = new Data();
        this.save();
    }
}


DB.prototype.addStartTime = function (idxTask) {
    "use strict";

    var tw = new TimeWindow(this.root.data.arrTasks[idxTask].arrTimeWindow.length);
    tw.startTime = moment();
    this.root.data.arrTasks[idxTask].arrTimeWindow.push(tw);
    this.save();
};


DB.prototype.addPauseTime = function (idxTask) {
    "use strict";

    /* find the running timer */
    var idxTW = this.root.data.arrTasks[idxTask].arrTimeWindow.findIndex(function (tw) {
        return (tw.startTime !== null && tw.endTime === null);
    });

    /* add end time */
    var arrTW = this.root.data.arrTasks[idxTask].arrTimeWindow;

    if (isDateMatching(arrTW[idxTW].startTime, moment())) {
        arrTW[idxTW].endTime = moment();
    } else {
        var lastMoment = moment(arrTW[idxTW].startTime);
        lastMoment.set({
            'hour': 23,
            'minute': 59,
            'second': 59,
            'millisecond': 999
        });
        arrTW[idxTW].endTime = lastMoment;
    }

    this.save();
};


DB.prototype.addTask = function (idTask, name) {
    "use strict";

    /* filling the data structure */
    var task = new ParentTask(idTask);
    task.name = name;

    /* save */
    this.root.data.arrTasks.push(task);
    this.save();
};


DB.prototype.addTW = function (idxTask, startTime, endTime, brk) {
    "use strict";

    var tw = new TimeWindow(this.root.data.arrTasks[idxTask].arrTimeWindow.length);
    tw.startTime = startTime;
    tw.endTime = endTime;
    tw.breakdur = brk;
    this.root.data.arrTasks[idxTask].arrTimeWindow.push(tw);
    this.save();
};


DB.prototype.editTW = function (idxTask, idxTW, startTime, endTime, brk) {
    "use strict";

    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].startTime = startTime;
    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].endTime = endTime;
    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].breakdur = brk;
    this.save();
};


/* save entire database to file */
DB.prototype.saveToFile = function () {
    "use strict";

    /* This feature is available in Android only */
    /* todo: in future extend to iOS also */
    if (navigator.userAgent.indexOf("Android") >= 0) {
        var content = new Blob([JSON.stringify(this.root)], {
            type: "text/json"
        });

        /* go to the directory */
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
            function (dirEntry) {
                /* open the file */
                dirEntry.getFile("database.json", {
                    create: true,
                    exclusive: false
                },
                    function (fileEntry) {

                        /* write contents to the file */
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onerror = function (err) {
                                alert("error writing to file: " + err.toString());
                            };

                            fileWriter.write(content);
                        });

                    },
                    function () {
                        alert("Could not open file");
                    });
            },
            function () {
                alert("Could not open directory");
            });
    }
};


/* overwrite database with the contents of file */
DB.prototype.loadFromFile = function () {
    "use strict";

        /* This feature is available in Android only */
    /* todo: in future extend to iOS also */
    if (navigator.userAgent.indexOf("Android") >= 0) {

        /* go to the directory */
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
            function (dirEntry) {
                /* open the file */
                dirEntry.getFile("database.json", {
                    create: false,
                    exclusive: false
                },
                    function (fileEntry) {

                        /* read the file into a json object */
                        fileEntry.file(function (file) {
                            var reader = new FileReader();

                            reader.onerror = function (err) {
                                alert("error reading from file: " + err.toString());
                            };

                            reader.onloadend = function () {
                                /* I would have really liked to avoid using db. */
                                /* But could not find a way to write to 'this' with so
                                 * many nested anonymous callbacks */
                                db.root = JSON.parse(this.result);
                                db.save();
                            };

                            reader.readAsText(file);
                        });

                    },
                    function () {
                        alert("Could not open file");
                    });

            },
            function () {
                alert("Could not open directory");
            });
    }
};


/* load the database from local storage */
/* do not reorder this function */
DB.prototype.load = function () {
    "use strict";

    var d = localStorage.getItem("db" + APP_NAME);
    if (d !== null && d !== undefined) {
        this.root = JSON.parse(d);
    }
};


/* save the database to local storage */
/* do not reorder this function */
DB.prototype.save = function () {
    "use strict";
    
    var name = "db" + APP_NAME;
    name = name.replace(" ", "");
    
    localStorage.setItem(name, JSON.stringify(this.root));
};