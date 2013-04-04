var colinM = colinM || {};
colinM.tomatoClock = (function () {
    var stringProto = String.prototype,
        timedown = colinM.timedown,
        alarmAudio=new Audio("exclamation.mp3"),
        NONE = "none",
        alarmSeconds = 2,
        alarmAnimationEL = $("div#clock"),
        stopTime = "0010",
        miliSecondsEL = $('div.mili-second'),
        status = NONE,
        passedSeconds = 0,
        // subtractedPassedSeconds = 0,
        startEl = $("button#start"),
        pauseEl = $("button#pause"),
        clearEl = $("button#clear"),
        continueEl = $("button#continue"),
        setTimeGroupEl = $("div#set-time-group"),
        shortKeysEl = $("div#short-keys"),
        // startTime,
        endTimeout,
        // stopSeconds = 0,
        timeList = [],
        self = colinM.tomatoClock || {};

    timedown.getShowPassedSeconds = function () {
        return timedown.getPassedSeconds()+1;
    };
    var pl = function (str) {
        console.log(str);
    };
    self.p = function (msg){
      $("p#messages").text(msg);
    };    
    self.test = function () {
        pl("test".repeat(5));  
    };
    // This function copy from functional.js 
    Function.prototype.rcurry = function() {
        var slice = Array.prototype.slice;
        var fun = this;
        var args = slice.call(arguments);
        return function() {
            return fun.apply(this, slice.call(arguments).concat(args));
        };
    };
    var parseInt10 = parseInt.rcurry(10);

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
    var getFullStopTime = function (time) {
        return time.toString().ljust(4,"0");
    };
    var getSingleMinutes = function (timeStr) {
        return timeStr.substr(0,2);
    };
    var getSingleSeconds = function (timeStr) {
        return timeStr.substr(2,2);
    };
    var toSeconds = function (timeStr) {
        return parseInt10(getSingleMinutes(timeStr))*60+parseInt10(getSingleSeconds(timeStr));
    };
    var inRunning = function () {
        startEl.hide();
        pauseEl.show();
        clearEl.hide();
        continueEl.hide();

        setTimeGroupEl.hide();
        shortKeysEl.hide();
    };
    var inStop = function () {
        startEl.show();
        pauseEl.hide();
        clearEl.hide();
        continueEl.hide();

        setTimeGroupEl.show();
        shortKeysEl.show();
    };
    var inPause = function () {
        startEl.hide();
        pauseEl.hide();
        clearEl.show();
        continueEl.show();

        setTimeGroupEl.hide();
        shortKeysEl.hide();
    };
    var computerLeftTimeStr = function (timeStr,seconds) {
        var parseSeconds = seconds % 60;
        var parseMinutes = (seconds - parseSeconds) / 60;
        var leftSeconds = parseInt10(getSingleSeconds(timeStr))-parseSeconds;
        var leftMinutes = parseInt10(getSingleMinutes(timeStr))-parseMinutes;
        if (leftSeconds < 0) {
            leftSeconds = 60 + leftSeconds;
            leftMinutes = leftMinutes - 1;
        };
        return leftMinutes.toString().rjust(2,"0") + leftSeconds.toString().rjust(2,"0");
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
            return getFullStopTime(getValidatedTime(window.location.hash.substring(1)));
        };
        return NONE;
    };
    var showStopTime = function (timeStr) {
        $("div.ten-minutes").text(getSingleMinutes(timeStr)[0]);
        $("div.minutes").text(getSingleMinutes(timeStr)[1]);
        $("div.ten-seconds").text(getSingleSeconds(timeStr)[0]);
        $("div.seconds").text(getSingleSeconds(timeStr)[1]);
    };
    var setAnimationPlayState = function (state) {
        status = state;
        miliSecondsEL.css("webkitAnimationPlayState",state);
    };
    var setMiliSecondElIerationCount = function (seconds) {
        miliSecondsEL.css("webkitAnimation","moveten 1s steps(10, end) " +
            seconds);
        miliSecondsEL.css("webkitAnimationPlayState","paused");
    };
    var refreshStopTimeAndStatus = function (timeStr) {
        stopTime = getFullStopTime(timeStr);
        miliSecondsEL.css('webkitAnimation', NONE);
        status = NONE;
        showStopTime(stopTime);
        self.p("refreshStopTimeAndStatus:"+toSeconds(stopTime));
    };
    // miliSecondsEL.on('webkitAnimationEnd', function(e) {
    //     endEvent(e);
    // });
    var endEvent = function (e) {
        setAnimationPlayState("paused");
        inStop();
        playAlarmEvents(alarmSeconds);
        refreshStopTimeAndStatus(stopTime);
        self.p("end! seconds:"+timedown.getPassedSeconds());
    };
    var startCoundDown = function (timeStr) {
        stopAlarmEvents();
        var seconds = toSeconds(timeStr);
        setMiliSecondElIerationCount(seconds);
        passedSeconds = 1;
        timedown.start(seconds, endEvent);
        // endTimeout = setTimeout(endEvent, seconds*1000);
        // subtractedPassedSeconds = 1;
        // stopSeconds = 0;
        // for test
        startTime = (new Date()).getTime();
        showStopTime(computerLeftTimeStr(timeStr, timedown.getShowPassedSeconds()));
        setAnimationPlayState("running");
    };
    // var computerTotalSubtractedPassedSeconds = function  (startTime) {
    //     return Math.floor(((new Date()).getTime() - startTime) / 1000)+1;
    // }
    var continueCoundDown = function (timeStr) {
        stopAlarmEvents();
        // var seconds = toSeconds(timeStr) - subtractedPassedSeconds-stopSeconds;
        // stopSeconds = computerTotalSubtractedPassedSeconds(startTime) - subtractedPassedSeconds;
        // endTimeout = setTimeout(endEvent, seconds*1000);
        timedown.resume();
        showStopTime(computerLeftTimeStr(timeStr, timedown.getShowPassedSeconds()));
        // showStopTime(computerLeftTimeStr(timeStr, subtractedPassedSeconds));
        setAnimationPlayState("running");
    };
    window.onfocus = function () {
        showStopTime(computerLeftTimeStr(stopTime, timedown.getShowPassedSeconds()));
    };
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        passedSeconds += 1;
        // for test
        // var tmpPassedSeconds = computerTotalSubtractedPassedSeconds(startTime)-stopSeconds;
        self.p("passedSeconds:"+ passedSeconds+" other:"+(timedown.getShowPassedSeconds()));
        showStopTime(computerLeftTimeStr(stopTime, timedown.getShowPassedSeconds()));
    });
    startEl.click(function(){
        startCoundDown(stopTime);
        inRunning();
    });
    continueEl.click(function(){
        continueCoundDown(stopTime);
        inRunning();
    });
    pauseEl.click(function(){
        // subtractedPassedSeconds = computerTotalSubtractedPassedSeconds(startTime)-stopSeconds;
        // clearTimeout(endTimeout);
        timedown.pause();
        setAnimationPlayState("paused");
        inPause();
    });
    clearEl.click(function(){
        stopAlarmEvents();
        timedown.end();
        refreshStopTimeAndStatus(stopTime);
        inStop();
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
            stopTime=getFullStopTime(getStopTimeFromURL());
        };
        refreshStopTimeAndStatus(stopTime);
        inStop();
    }
    return self;
}());
// colinM.tomatoClock.test();
 

$(function(){
    colinM.tomatoClock.main();
});
