var colinM = colinM || {};
colinM.tc = (function () {
    var $m = $, // just for statement
        stringProto = String.prototype,
        alarmAudio=new Audio("exclamation.mp3"),
        NONE = "none",
        alarmSeconds = 2,
        alarmAnimationEL = $("div#clock"),
        stopTime = "0010",
        miliSecondsEL = $('div.mili-second'),
        status = NONE,
        passedSeconds = 0,
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
            var pads    = padding.repeat( parseInt( len / 2 ) );
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
        return parseInt(getMinutes(timeStr))*60+parseInt(getSeconds(timeStr));
    };
    var inRunning = function () {
        $("button#start").hide();
        $("button#pause").show();
        $("button#clear").hide();
        $("button#continue").hide();

        $("div#set-time-group").hide();
        $("div#short-keys").hide();
    };
    var inStop = function () {
        $("button#start").show();
        $("button#pause").hide();
        $("button#clear").hide();
        $("button#continue").hide();

        $("div#set-time-group").show();
        $("div#short-keys").show();
    };
    var inPause = function () {
        $("button#start").hide();
        $("button#pause").hide();
        $("button#clear").show();
        $("button#continue").show();

        $("div#set-time-group").hide();
        $("div#short-keys").hide();
    };
    var computerLeftTimeStr = function (timeStr,seconds) {
        var parseSeconds = seconds % 60;
        var parseMinutes = (seconds - parseSeconds) / 60;
        var leftSeconds = parseInt(getSeconds(timeStr))-parseSeconds;
        var leftMinutes = parseInt(getMinutes(timeStr))-parseMinutes;
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
            return getFullStopTime(window.location.hash.substring(1));
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
            showStopTime(computerLeftTimeStr(timeStr, passedSeconds));
        };
        setAnimationPlayState("running");
    }
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        self.p("passedSeconds:"+ passedSeconds++);
        showStopTime(computerLeftTimeStr(stopTime, passedSeconds));
    });
    miliSecondsEL.on('webkitAnimationEnd', function(e) {
        endOneTime(e);
    });
    $("button#start").click(function(){
        startCoundDown(stopTime);
        inRunning();
    });
    $("button#continue").click(function(){
        startCoundDown(stopTime);
        inRunning();
    });
    $("button#pause").click(function(){
        setAnimationPlayState("paused");
        inPause();
    });
    $("button#clear").click(function(){
        stopAlarmEvents();
        refreshStopTimeAndStatus(stopTime);
        inStop();
    });
    var changeURL = function (timeStr) {
        window.location.hash="#"+timeStr;
    }
    var setStopTimeAndStatusAndURL = function (timeValue) {
        refreshStopTimeAndStatus(timeValue);
        changeURL(stopTime);
    }
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
colinM.tc.test();
 

$(function(){
    colinM.tc.main();
});
