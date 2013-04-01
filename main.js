var colinM = colinM || {};
colinM.tc = (function () {
    var stringProto = String.prototype,
        alarmAudio=new Audio("exclamation.mp3"),
        NONE = "none",
        alarmSeconds = 2,
        alarmAnimationEL = $("div#clock"),
        stopTime = "0010",
        miliSecondsEL = $('div.mili-second'),
        status = NONE,
        passedSeconds = 0,
        startEl = $("button#start"),
        pauseEl = $("button#pause"),
        clearEl = $("button#clear"),
        continueEl = $("button#continue"),
        setTimeGroupEl = $("div#set-time-group"),
        shortKeysEl = $("div#short-keys"),
        startTime,
        self = {};
    
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

    // These functions even could work outside colinM.tc.
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
    var getMinutes = function (timeStr) {
        return timeStr.substr(0,2);
    };
    var getSeconds = function (timeStr) {
        return timeStr.substr(2,2);
    };
    var computerSeconds = function (timeStr) {
        return parseInt10(getMinutes(timeStr))*60+parseInt10(getSeconds(timeStr));
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
        var leftSeconds = parseInt10(getSeconds(timeStr))-parseSeconds;
        var leftMinutes = parseInt10(getMinutes(timeStr))-parseMinutes;
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
        $("div.ten-minutes").text(getMinutes(timeStr)[0]);
        $("div.minutes").text(getMinutes(timeStr)[1]);
        $("div.ten-seconds").text(getSeconds(timeStr)[0]);
        $("div.seconds").text(getSeconds(timeStr)[1]);
    };
    var endOneTime = function (e) {
        self.p("end! seconds:"+passedSeconds);
        setAnimationPlayState("paused");
        inStop();
        playAlarmEvents(alarmSeconds);
        refreshStopTimeAndStatus(stopTime);
    }
    var setAnimationPlayState = function (state) {
        status = state;
        miliSecondsEL.css("webkitAnimationPlayState",state);
    }
    var setIerationCount = function () {
        miliSecondsEL.css("webkitAnimation","moveten 1s steps(10, end) " +
            computerSeconds(stopTime));
        miliSecondsEL.css("webkitAnimationPlayState","paused");
    }
    var refreshStopTimeAndStatus = function (timeStr) {
        stopTime = getFullStopTime(timeStr);
        miliSecondsEL.css('webkitAnimation', NONE);
        status = NONE;
        showStopTime(stopTime);
        self.p("refreshStopTimeAndStatus:"+computerSeconds(stopTime));
    }
    var startCoundDown = function (timeStr) {
        stopAlarmEvents();
        if(status === NONE){
            setIerationCount();
            passedSeconds = 1;
            // for test
            startTime = (new Date()).getTime();
            showStopTime(computerLeftTimeStr(timeStr, passedSeconds));
        };
        setAnimationPlayState("running");
    }
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        passedSeconds += 1;
        // for test
        var otherTime = Math.ceil(((new Date()).getTime() - startTime) / 1000);
        self.p("passedSeconds:"+ passedSeconds+" other:"+otherTime);
        showStopTime(computerLeftTimeStr(stopTime, passedSeconds));
    });
    miliSecondsEL.on('webkitAnimationEnd', function(e) {
        endOneTime(e);
    });
    startEl.click(function(){
        startCoundDown(stopTime);
        inRunning();
    });
    continueEl.click(function(){
        startCoundDown(stopTime);
        inRunning();
    });
    pauseEl.click(function(){
        setAnimationPlayState("paused");
        inPause();
    });
    clearEl.click(function(){
        stopAlarmEvents();
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
// colinM.tc.test();
 

$(function(){
    colinM.tc.main();
});
