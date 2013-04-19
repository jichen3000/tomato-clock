var colinM = colinM || {};
colinM.commons = (function () {
    var stringProto = String.prototype,
        self = colinM.commons || {};
    // This function copy from functional.js 
    Function.prototype.rcurry = function() {
        var slice = Array.prototype.slice;
        var fun = this;
        var args = slice.call(arguments);
        return function() {
            return fun.apply(this, slice.call(arguments).concat(args));
        };
    };
    self.parseInt10 = parseInt.rcurry(10);

    // These functions even could work outside colinM.tomatoClock.
    // "Ruby".rjust( 10 );       // "      Ruby"
    // "Ruby".ljust( 10 );       // "Ruby      "
    // "Ruby".center( 10, "+" ); // "+++Ruby+++"
    stringProto.repeat = function( num ) {
        for( var i = 0, buf = ""; i < num; i++ ) buf += this;
        return buf;
    }; 
    stringProto.ljust = function( width, padding ) {
        padding = padding || " ";
        padding = padding.substr( 0, 1 );
        if( this.length < width )
            return this + padding.repeat( width - this.length );
        else
            return this;
    };
    stringProto.rjust = function( width, padding ) {
        padding = padding || " ";
        padding = padding.substr( 0, 1 );
        if( this.length < width )
            return padding.repeat( width - this.length ) + this;
        else
            return this;
    };
    stringProto.center = function( width, padding ) {
        padding = padding || " ";
        padding = padding.substr( 0, 1 );
        if( this.length < width ) {
            var len     = width - this.length;
            var remain  = ( len % 2 == 0 ) ? "" : padding;
            var pads    = padding.repeat( parseInt10( len / 2 ) );
            return pads + this + pads + remain;
        }
        else
            return this;
    };
    return self;    
}());

colinM.littleAop = (function () {
    var self = {},
        aopFunNames = ['after', 'before', 'round'];
    var isSelfFuntion = function (obj, funName) {
        return obj.hasOwnProperty(funName) && (typeof obj[funName]) === 'function';
    };
    var isNotAopFunction = function (funName) {
        return aopFunNames.indexOf(funName) < 0;
    };
    self.after = function (funName, func) {
        if ( isSelfFuntion(this, funName) && isNotAopFunction(funName) ){
            var original = this[funName];
            this[funName] = function () {
                result = original.apply(this, arguments);
                func.apply(this, arguments);
                return result;
            };
            return this[funName];
        };
        return false;
    };
    return self;
}());


colinM.tomatoClock = {};
colinM.tomatoClock.timeString = (function () {
    var self = colinM.tomatoClock.timeString || {},
        parseInt10 = colinM.commons.parseInt10;
    self.ljust4 = function (timeStr) {
        return timeStr.ljust(4,"0");
    };
    self.getMinutesOnly = function (timeStr) {
        return timeStr.substr(0,2);
    };
    self.getSecondsOnly = function (timeStr) {
        return timeStr.substr(2,2);
    };
    self.toSeconds = function (timeStr) {
        return parseInt10(this.getMinutesOnly(timeStr))*60+parseInt10(this.getSecondsOnly(timeStr));
    };
    self.fromSeconds = function (seconds) {
        var parseSeconds = seconds % 60;
        var parseMinutes = (seconds - parseSeconds) / 60;
        return parseMinutes.toString().rjust(2,"0") + parseSeconds.toString().rjust(2,"0");
    };
    self.computerLeftTimeStr = function (timeStr,seconds) {
        var parseSeconds = seconds % 60;
        var parseMinutes = (seconds - parseSeconds) / 60;
        var leftSeconds = parseInt10(this.getSecondsOnly(timeStr))-parseSeconds;
        var leftMinutes = parseInt10(this.getMinutesOnly(timeStr))-parseMinutes;
        if (leftSeconds < 0) {
            leftSeconds = 60 + leftSeconds;
            leftMinutes = leftMinutes - 1;
        };
        return leftMinutes.toString().rjust(2,"0") + leftSeconds.toString().rjust(2,"0");
    };


    return self; 
}());

colinM.tomatoClock = (function () {
    var timedown = colinM.timedown,
        timeString = colinM.tomatoClock.timeString,
        parseInt10 = colinM.commons.parseInt10,
        alarmAudio=new Audio("exclamation.mp3"),
        NONE = "none",
        alarmSeconds = 2,
        alarmAnimationEL = $("div#clock"),
        stopTime = "0001",
        miliSecondsEL = $('div.mili-second'),
        startEl = $("button#start"),
        pauseEl = $("button#pause"),
        stopEl = $("button#stop"),
        continueEl = $("button#continue"),
        setTimeGroupEl = $("div#set-time-group"),
        shortKeysEl = $("div#short-keys"),
        self = colinM.tomatoClock || {};

    var pl = function (str) {
        console.log(str);
    };
    self.p = function (msg){
      $("p#messages").text(msg);
    };    
    self.test = function () {
        pl("test".repeat(5));  
    };
    var showButtonsInRunning = function () {
        startEl.hide();
        pauseEl.show();
        stopEl.hide();
        continueEl.hide();

        setTimeGroupEl.hide();
        shortKeysEl.hide();
    };
    var ShowButtonsInStopped = function () {
        startEl.show();
        pauseEl.hide();
        stopEl.hide();
        continueEl.hide();

        setTimeGroupEl.show();
        shortKeysEl.show();
    };
    var showButtonsInPaused = function () {
        startEl.hide();
        pauseEl.hide();
        stopEl.show();
        continueEl.show();

        setTimeGroupEl.hide();
        shortKeysEl.hide();
    };
    var playAlarmAudio = function () { 
        alarmAudio.loop=true;
        alarmAudio.play(); 
    };
    var stopAlarmAudio = function () {
        alarmAudio.pause();
    };
    var playAlarmAnimation = function () {
        alarmAnimationEL.css("webkitAnimation","change-color 1s steps(10, end) "+alarmSeconds);
    };
    var stopAlarmAnimation = function () {
        alarmAnimationEL.css("webkitAnimation",NONE);   
    };
    var playAlarmEvents = function (playSeconds) {
        playAlarmAudio();
        playAlarmAnimation();
        setTimeout(function () {
            stopAlarmEvents();
        },playSeconds*1000);
    };
    var stopAlarmEvents = function () {
        stopAlarmAudio();
        stopAlarmAnimation();
    };
    var getStopTimeFromURL = function () {
        if(window.location.hash !== ""){
            return timeString.ljust4(getValidatedTime(window.location.hash.substring(1)));
        };
        return NONE;
    };
    var showStopTime = function (timeStr) {
        $("div.ten-minutes").text(timeString.getMinutesOnly(timeStr)[0]);
        $("div.minutes").text(timeString.getMinutesOnly(timeStr)[1]);
        $("div.ten-seconds").text(timeString.getSecondsOnly(timeStr)[0]);
        $("div.seconds").text(timeString.getSecondsOnly(timeStr)[1]);
    };
    var setMilliSecondsAnimationPlayState = function (state) {
        miliSecondsEL.css("webkitAnimationPlayState",state);
    };
    var setMiliSecondsElIerationCount = function (seconds) {
        miliSecondsEL.css("webkitAnimation","moveten 1s steps(10, end) " +
            seconds);
        miliSecondsEL.css("webkitAnimationPlayState","paused");
    };
    var refreshStopTimeAndStatus = function (timeStr) {
        stopTime = timeStr;
        miliSecondsEL.css('webkitAnimation', NONE);
        showStopTime(timeStr);
        self.p("refreshStopTimeAndStatus:"+timeString.toSeconds(timeStr));
    };
    self.endEvent = function () {
        setMilliSecondsAnimationPlayState("paused");
        ShowButtonsInStopped();
        playAlarmEvents(alarmSeconds);
        refreshStopTimeAndStatus(stopTime);
        self.p("end! seconds:"+timedown.getPassedSeconds());
    };
    self.stopEvent = function () {
        stopAlarmEvents();
        timedown.stop();
        refreshStopTimeAndStatus(stopTime);
        ShowButtonsInStopped();
    };
    window.onfocus = function () {
        if(timedown.isInRunning()){
            showStopTime(timeString.fromSeconds(timedown.getRemainedOneSeconds()));
        };
    };
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        showStopTime(timeString.fromSeconds(timedown.getRemainedOneSeconds()));
        // for test
        self.p("passedSeconds:"+timedown.getPassedSeconds());
    });
    startEl.click(function () {
        stopAlarmEvents();
        var seconds = timeString.toSeconds(stopTime);
        setMiliSecondsElIerationCount(seconds);
        timedown.start(seconds, self.endEvent);
        showStopTime(timeString.fromSeconds(timedown.getRemainedOneSeconds()));
        setMilliSecondsAnimationPlayState("running");
        showButtonsInRunning();
    });
    continueEl.click(function () {
        stopAlarmEvents();
        timedown.continue();
        showStopTime(timeString.fromSeconds(timedown.getRemainedOneSeconds()));
        setMilliSecondsAnimationPlayState("running");
        showButtonsInRunning();
    });
    pauseEl.click(function () {
        timedown.pause();
        setMilliSecondsAnimationPlayState("paused");
        showButtonsInPaused();
    });
    stopEl.click(function () {
        self.stopEvent();
    });
    var getValidatedTime = function (timeStr) {
        var timeInt = parseInt10(timeStr);
        if ( isNaN(timeInt) || timeInt <= 0) {
            return '0001';
        }else if (timeInt > 9959){
            return '9959';
        }
        return timeStr;
    };
    var changeURL = function (timeStr) {
        window.location.hash="#"+timeStr;
    };
    var setStopTimeAndStatusAndURL = function (timeValue) {
        refreshStopTimeAndStatus(getValidatedTime(timeValue));
        changeURL(stopTime);
    };
    $('button#set').click(function(){
        setStopTimeAndStatusAndURL($('input#stop-minutes').val());
    });
    $('button.short-key').click(function(){
        setStopTimeAndStatusAndURL($(this).val());
    });
    $('button#test').click(function(){
        urlPath = "file://localhost/Users/Colin/work/notes/codes/js/stopwatch/count_down.html#0100";
        curUrl = "file://localhost/Users/Colin/work/notes/codes/js/stopwatch/count_down.html#0010";
        window.history.pushState({"html":curUrl,"pageTitle":"123"},"", urlPath);
    });
    if ("onhashchange" in window) { // does the browser support the hashchange event?
        window.onhashchange = function () {
            self.main();
        }
    }
    self.main = function () {
        if (getStopTimeFromURL()!=NONE) {
            stopTime=getStopTimeFromURL();
        };
        refreshStopTimeAndStatus(stopTime);
        ShowButtonsInStopped();
    }
    return self;
}());
// colinM.tomatoClock.test();

colinM.tomatoClock.clientDb = (function () {
    _.templateSettings = {
        interpolate : /\#\{(.+?)\}/g
    };
    var tomatoClock = _.extend(colinM.tomatoClock, colinM.littleAop)
        self = {};
    var ME = 'ME',
        TABLE_NAME = 'TC',
        ROW_TEMPLATE = _.template(
            "<tr><td>#{ID}</td><td>#{passedSeconds}</td><td>#{updateTimeInt}</td><td>#{isInterrupted}</td></tr>"),
        NAME_SPERATE = '-';
    var getNowInt = function () {
        return new Date().getTime();
    };
    var generateTcKey = function (nowInt,fieldName) {
        return [TABLE_NAME, ME, nowInt, fieldName].join(NAME_SPERATE);
    };
    var isTcKey = function (keyFields) {
        return (keyFields[0] === TABLE_NAME && 
            keyFields[1] === ME);  
    };
    var getTcId = function (keyFields) {
        return keyFields[2];
    };
    var getTcFieldName = function (keyFields) {
        return keyFields[3];
    };
    var saveOneTc = function (passedSeconds, originalSeconds) {
        var nowInt = getNowInt();
        localStorage[generateTcKey(nowInt, "updateTimeInt")] = nowInt;
        localStorage[generateTcKey(nowInt, "passedSeconds")] = passedSeconds;
        originalSeconds && (localStorage[generateTcKey(nowInt, "originalSeconds")] = originalSeconds);

        var newTc = {ID : nowInt, "passedSeconds" : passedSeconds, "updateTimeInt" : nowInt};
        originalSeconds && (newTc["originalSeconds"] = originalSeconds);
        return newTc;
    };
    var getAllTcHash = function () {
        return _.foldl(Object.keys(localStorage), function (memo, key) {
            var keyFields = key.split(NAME_SPERATE);
            if (isTcKey(keyFields)) {
                var tcId = getTcId(keyFields);
                var fieldName = getTcFieldName(keyFields);
                memo[tcId] = memo[tcId] || {ID : tcId};
                memo[tcId][fieldName] = localStorage[key];
            };
            return memo;
        }, {});
    };
    var getTcListLatest = function (listNumber) {
        allHash = getAllTcHash();
        allListLatest =  _.map(Object.keys(allHash).sort(function (a, b) {
            return b - a;
        }), function (key) {
            return allHash[key];
        });
        if(listNumber){
            return allListLatest.slice(0, listNumber);
        };
        return allListLatest;
    };
    var renderOneTc = function (obj, insertFunName) {
        var tmpObj = _.extend({},obj);
        tmpObj['isInterrupted'] = tmpObj['originalSeconds'] ? 'yes' : 'No';
        var rowStr = ROW_TEMPLATE(tmpObj);
        var insertFunName = insertFunName || 'append';
        $('table#tomato-clock-records > tbody')[insertFunName](rowStr);
        return tmpObj;
    };
    tomatoClock.after('endEvent', function () {
        var curTc = saveOneTc(colinM.timedown.getPassedSeconds());
        renderOneTc(curTc, 'prepend');
        console.log(colinM.timedown.getPassedSeconds());
    });
    tomatoClock.after('stopEvent', function () {
        var curTc = saveOneTc(colinM.timedown.getPassedSeconds(),colinM.timedown.getTotalSeconds());
        renderOneTc(curTc, 'prepend');
        console.log(colinM.timedown.getPassedSeconds());
    });
    self.main = function () {
        var all = getTcListLatest(5);
        _.map(all, function (curTc) {
            renderOneTc(curTc);
        });
        console.log("all:");
        console.log(all);
    };
    return self;
}());

$(function(){
    colinM.tomatoClock.main();
    colinM.tomatoClock.clientDb.main();

});
