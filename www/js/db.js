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

function TimeWindow(id) {
    /* inherited data from Signature */
    this.id = id;

    /* own data */
    this.startTime = null;
    this.endTime = null;
    this.breakdur = moment.duration(0);
}

function ParentTask(id) {
    /* inherited data from Signature */
    this.id = id;

    /* inherit data from Task*/
    this.name = null;
    this.arrTimeWindow = new Array();
}

function Data() {
    /* inherited data from Signature */
    this.id = null;
    
    /* own data */
    this.arrTasks = new Array();
}

function DB() {
    this.root = new Object();
    this.load();
    
    if(this.root.data == undefined || this.root.data == null || this.root.data === "") {
        this.root.data = new Data();
        this.save();
    }
}

DB.prototype.addStartTime = function(idxTask) {
    var tw = new TimeWindow(this.root.data.arrTasks[idxTask].arrTimeWindow.length);
    tw.startTime = moment();
    this.root.data.arrTasks[idxTask].arrTimeWindow.push(tw);
    this.save();
}

DB.prototype.addPauseTime = function(idxTask) {
    /* find the running timer */
    var idxTW = this.root.data.arrTasks[idxTask].arrTimeWindow.findIndex( function(tw) {
        return (tw.startTime != null && tw.endTime == null);
    } );

    /* add end time */
    var arrTW = this.root.data.arrTasks[idxTask].arrTimeWindow;
    
    if( isDateMatching( arrTW[idxTW].startTime, moment() ) ) {
        arrTW[idxTW].endTime = moment(); 
    }
    else {
        var lastMoment = moment(arrTW[idxTW].startTime);
        lastMoment.set( { 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999 } );
        arrTW[idxTW].endTime = lastMoment;
    }
    
    this.save();
}

DB.prototype.addTask = function() {
    var task = new ParentTask(this.root.data.arrTasks.length);
    
    /* members inherited from Task */
    task.name = document.getElementById("textTaskName").value;
    
    /* own members */
    
    /* save */
    document.getElementById("modalAddEditTask").style.display = "none";
    this.root.data.arrTasks.push(task);
    this.save();
    
    /* show the new task */
    addTaskDiv(task.id); // todo move this call to onsubmitAddEditTask(). this file should only modify the DB
}

DB.prototype.addTW = function(idxTask, startTime, endTime, brk) {
    var tw = new TimeWindow(this.root.data.arrTasks[idxTask].arrTimeWindow.length);
    tw.startTime = startTime;
    tw.endTime = endTime;
    tw.breakdur = brk;
    this.root.data.arrTasks[idxTask].arrTimeWindow.push(tw);
    this.save();    
}

DB.prototype.editTW = function(idxTask, idxTW, startTime, endTime, brk) {
    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].startTime = startTime;
    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].endTime = endTime;
    this.root.data.arrTasks[idxTask].arrTimeWindow[idxTW].breakdur = brk;
    this.save();
}


/* save entire database to file */
DB.prototype.saveToFile = function () {
    /* go to the directory */
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
                                    function(dirEntry) {
        /* open the file */
        dirEntry.getFile("database.json", {create: true, exclusive: false}, function(fileEntry) {
            alert("saveToFile");
        }, function() {
            alert("Could not open file");
        });
    }, function() {
        alert("Could not open directory");
    });
}


/* load the database from local storage */
/* do not reorder this function */
DB.prototype.load = function () {
    var d = localStorage.getItem("db" + APP_NAME);
    if (d != null && d != undefined) {
        this.root = JSON.parse(d);
    }
}

/* save the database to local storage */
/* do not reorder this function */
DB.prototype.save = function () {
    localStorage.setItem("db" + APP_NAME, JSON.stringify(this.root));
}

