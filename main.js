var colinM = colinM || {};
colinM.tc = (function () {
    var stringProto = String.prototype,
        alarmAudio=new Audio("exclamation.mp3"),
        NONE = "none",
        alarmSeconds = 2,
        alarmAnimationEL = $("div#clock"),
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
    self.getFullStopTime = function (time) {
        return time.toString().ljust(4,"0");
    };
    self.getMinutes = function (timeStr) {
        return timeStr.substr(0,2);
    };
    self.getSeconds = function (timeStr) {
        return timeStr.substr(2,2);
    };
    self.computerSeconds = function (timeStr) {
        return parseInt(self.getMinutes(timeStr))*60+parseInt(self.getSeconds(timeStr));
    };
    self.inRunning = function () {
        $("button#start").hide();
        $("button#pause").show();
        $("button#clear").hide();
        $("button#continue").hide();

        $("div#set-time-group").hide();
        $("div#short-keys").hide();
    };
    self.inStop = function () {
        $("button#start").show();
        $("button#pause").hide();
        $("button#clear").hide();
        $("button#continue").hide();

        $("div#set-time-group").show();
        $("div#short-keys").show();
    };
    self.inPause = function () {
        $("button#start").hide();
        $("button#pause").hide();
        $("button#clear").show();
        $("button#continue").show();

        $("div#set-time-group").hide();
        $("div#short-keys").hide();
    };
    self.computerLeftTimeStr = function (timeStr,seconds) {
        var parseSeconds = seconds % 60;
        var parseMinutes = (seconds - parseSeconds) / 60;
        var leftSeconds = parseInt(self.getSeconds(timeStr))-parseSeconds;
        var leftMinutes = parseInt(self.getMinutes(timeStr))-parseMinutes;
        if (leftSeconds < 0) {
            leftSeconds = 60 + leftSeconds;
            leftMinutes = leftMinutes - 1;
        };
        return leftMinutes.toString().rjust(2,"0") + leftSeconds.toString().rjust(2,"0");
    };
    self.playAlarmAudio = function () { 
        alarmAudio.loop=true;
        alarmAudio.play(); 
    };
    self.stopAlarmAudio = function () {
        alarmAudio.pause();
    };
    self.playAlarmAnimation = function () {
        alarmAnimationEL.css("webkitAnimation","change-color 1s steps(10, end) "+alarmSeconds);
    };
    self.stopAlarmAnimation = function () {
        alarmAnimationEL.css("webkitAnimation",NONE);   
    };
    self.playAlarmEvents = function (playSeconds) {
        self.playAlarmAudio();
        self.playAlarmAnimation();
        setTimeout(function () {
            self.stopAlarmEvents();
        },playSeconds*1000);
    };
    self.stopAlarmEvents = function () {
        self.stopAlarmAudio();
        self.stopAlarmAnimation();
    };
    self.getStopTimeFromURL = function () {
        if(window.location.hash!=""){
            return self.getFullStopTime(window.location.hash.substring(1));
        };
        return NONE;
    };
    self.showStopTime = function (timeStr) {
        $("div.ten-minutes").text(self.getMinutes(timeStr)[0]);
        $("div.minutes").text(self.getMinutes(timeStr)[1]);
        $("div.ten-seconds").text(self.getSeconds(timeStr)[0]);
        $("div.seconds").text(self.getSeconds(timeStr)[1]);
    };
    return self;
}());
colinM.tc.test();
 

$(function(){
    var NONE = "none";
    var stopTime = "0010";
    var miliSecondsEL = $('div.mili-second');
    var status = NONE;
    var passedSeconds = 0;
    var alarmSeconds = 2;
    function endOneTime (e) {
        colinM.tc.p("end! seconds:"+passedSeconds);
        setAnimationPlayState("paused");
        colinM.tc.inStop();
        colinM.tc.playAlarmEvents(alarmSeconds);
        refreshStopTimeAndStatus(stopTime);
    }
    function setAnimationPlayState (state) {
        status = state;
        miliSecondsEL.css("webkitAnimationPlayState",state);
    }
    function setIerationCount () {
        miliSecondsEL.css("webkitAnimation","moveten 1s steps(10, end) " +
            colinM.tc.computerSeconds(stopTime));
        miliSecondsEL.css("webkitAnimationPlayState","paused");
    }
    function refreshStopTimeAndStatus (timeStr) {
        stopTime = colinM.tc.getFullStopTime(timeStr);
        miliSecondsEL.css('webkitAnimation', NONE);
        status = NONE;
        colinM.tc.showStopTime(stopTime);
        colinM.tc.p("refreshStopTimeAndStatus:"+colinM.tc.computerSeconds(stopTime));
    }
    function startCoundDown (timeStr) {
        colinM.tc.stopAlarmEvents();
        if(status==NONE){
            setIerationCount();
            passedSeconds = 1;
            colinM.tc.showStopTime(colinM.tc.computerLeftTimeStr(timeStr, passedSeconds));
        };
        setAnimationPlayState("running");
    }
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        colinM.tc.p("passedSeconds:"+ passedSeconds++);
        colinM.tc.showStopTime(colinM.tc.computerLeftTimeStr(stopTime, passedSeconds));
    });
    miliSecondsEL.on('webkitAnimationEnd', function(e) {
        endOneTime(e);
    });
    $("button#start").click(function(){
        startCoundDown(stopTime);
        colinM.tc.inRunning();
    });
    $("button#continue").click(function(){
        startCoundDown(stopTime);
        colinM.tc.inRunning();
    });
    $("button#pause").click(function(){
        setAnimationPlayState("paused");
        colinM.tc.inPause();
    });
    $("button#clear").click(function(){
        colinM.tc.stopAlarmEvents();
        refreshStopTimeAndStatus(stopTime);
        colinM.tc.inStop();
    });
    function changeURL (timeStr) {
        window.location.hash="#"+timeStr;
    }
    function setStopTimeAndStatusAndURL (timeValue) {
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
            main();
        }
    }
    function main () {
        if (colinM.tc.getStopTimeFromURL()!=NONE) {
            stopTime=colinM.tc.getFullStopTime(colinM.tc.getStopTimeFromURL());
        };
        refreshStopTimeAndStatus(stopTime);
        colinM.tc.inStop();
    }
    main();
});
