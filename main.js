String.prototype.repeat = function( num ) {
    for( var i = 0, buf = ""; i < num; i++ ) buf += this;
    return buf;
}
String.prototype.ljust = function( width, padding ) {
    padding = padding || " ";
    padding = padding.substr( 0, 1 );
    if( this.length < width )
        return this + padding.repeat( width - this.length );
    else
        return this;
}
String.prototype.rjust = function( width, padding ) {
    padding = padding || " ";
    padding = padding.substr( 0, 1 );
    if( this.length < width )
        return padding.repeat( width - this.length ) + this;
    else
        return this;
}
String.prototype.center = function( width, padding ) {
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
}
// alert( "Ruby".center( 10 ) );      // "   Ruby   "
// alert( "Ruby".rjust( 10 ) );       // "      Ruby"
// alert( "Ruby".ljust( 10 ) );       // "Ruby      "
// alert( "Ruby".center( 10, "+" ) ); // "+++Ruby+++"
   
function p(msg){
  $("p#messages").text(msg);
}    
function getFullStopTime(time){
    return time.toString().ljust(4,"0");
}
function getSeconds(timeStr){
    return timeStr.substr(2,2);
}
function getMinutes(timeStr){
    return timeStr.substr(0,2);
}
function computerSeconds(timeStr){
    return parseInt(getMinutes(timeStr))*60+parseInt(getSeconds(timeStr));
}
function inRunning () {
    $("button#start").hide();
    $("button#pause").show();
    $("button#clear").hide();
    $("button#continue").hide();

    $("div#set-time-group").hide();
    $("div#short-keys").hide();
}
function inStop () {
    $("button#start").show();
    $("button#pause").hide();
    $("button#clear").hide();
    $("button#continue").hide();

    $("div#set-time-group").show();
    $("div#short-keys").show();
}
function inPause () {
    $("button#start").hide();
    $("button#pause").hide();
    $("button#clear").show();
    $("button#continue").show();

    $("div#set-time-group").hide();
    $("div#short-keys").hide();
}
function computerLeftTimeStr (timeStr,seconds) {
    var parseSeconds = seconds % 60;
    var parseMinutes = (seconds - parseSeconds) / 60;
    var leftSeconds = parseInt(getSeconds(timeStr))-parseSeconds;
    var leftMinutes = parseInt(getMinutes(timeStr))-parseMinutes;
    if (leftSeconds < 0) {
        leftSeconds = 60 + leftSeconds;
        leftMinutes = leftMinutes - 1;
    };
    return leftMinutes.toString().rjust(2,"0") + leftSeconds.toString().rjust(2,"0");
}
$(function(){
    var NONE = "none";
    var stopTime = "0010";
    var miliSecondsEL = $('div.mili-second');
    var status = NONE;
    var passedSeconds = 0;
    var alarmAnimationEL = $("div#clock");
    var alarmAudio=new Audio("exclamation.mp3");
    var alarmSeconds = 2;
    function playAlarmAudio(){ 
        alarmAudio.loop=true;
        alarmAudio.play(); 
    } 
    function stopAlarmAudio () {
        alarmAudio.pause();
    }
    function playAlarmAnimation () {
        alarmAnimationEL.css("webkitAnimation","change-color 1s steps(10, end) "+alarmSeconds);
    }
    function stopAlarmAnimation () {
        alarmAnimationEL.css("webkitAnimation",NONE);   
    }
    function playAlarmEvents (playSeconds) {
        playAlarmAudio();
        playAlarmAnimation();
        setTimeout(function () {
            stopAlarmEvents();
        },playSeconds*1000);
    }
    function stopAlarmEvents () {
        stopAlarmAudio();
        stopAlarmAnimation();
    }
    function endOneTime (e) {
        p("end! seconds:"+passedSeconds);
        setAnimationPlayState("paused");
        inStop();
        playAlarmEvents(alarmSeconds);
        refreshStopTimeAndStatus(stopTime);
    }
    function getStopTimeFromURL () {
        if(window.location.hash!=""){
            return getFullStopTime(window.location.hash.substring(1));
        };
        return NONE;
    }
    function showStopTime (timeStr) {
        $("div.ten-minutes").text(getMinutes(timeStr)[0]);
        $("div.minutes").text(getMinutes(timeStr)[1]);
        $("div.ten-seconds").text(getSeconds(timeStr)[0]);
        $("div.seconds").text(getSeconds(timeStr)[1]);
    }
    function setAnimationPlayState (state) {
        status = state;
        miliSecondsEL.css("webkitAnimationPlayState",state);
    }
    function setIerationCount () {
        miliSecondsEL.css("webkitAnimation","moveten 1s steps(10, end) "+computerSeconds(stopTime));
        miliSecondsEL.css("webkitAnimationPlayState","paused");
        // $('div.mili-second')[0].style.webkitAnimation = "moveten 1s steps(10, end) "+getFullStopTime(stopTime);
    }
    function refreshStopTimeAndStatus (timeStr) {
        stopTime = getFullStopTime(timeStr);
        miliSecondsEL.css('webkitAnimation', NONE);
        status = NONE;
        showStopTime(stopTime);
        p("refreshStopTimeAndStatus:"+computerSeconds(stopTime));
    }
    function startCoundDown (timeStr) {
        stopAlarmEvents();
        if(status==NONE){
            setIerationCount();
            passedSeconds = 1;
            showStopTime(computerLeftTimeStr(timeStr, passedSeconds));
        };
        setAnimationPlayState("running");
    }
    miliSecondsEL.on('webkitAnimationIteration', function(e) {
        p("passedSeconds:"+ passedSeconds++);
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
    function changeURL (timeStr) {
        window.location.hash="#"+timeStr;
        // var sharp = "#";
        // var nextURL = document.URL;
        // if (nextURL.indexOf(sharp) >0 ) {
        //     nextURL = nextURL.substring(0,nextURL.indexOf(sharp));
        // };
        // nextURL += sharp+timeStr;
        // window.history.pushState({"html":document.URL,"pageTitle":document.pageTitle},"", nextURL);
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
        if (getStopTimeFromURL()!=NONE) {
            stopTime=getFullStopTime(getStopTimeFromURL());
        };
        refreshStopTimeAndStatus(stopTime);
        inStop();
    }
    main();
});
