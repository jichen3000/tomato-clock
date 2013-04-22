var colinM = colinM || {};


colinM.tomatoClock = {};
colinM.tomatoClock.timeString = (function () {
    var self = colinM.tomatoClock.timeString || {},
        parseInt10 = colinM.commons.parseInt10;
    self.toFullTimeStr = function (timeStr) {
        if(timeStr.length === 1){
            return "0"+timeStr+"00";
        };
        return timeStr.ljust(4,"0"); 
    };
    self.toMinutePart = function (timeStr) {
        return timeStr.substr(0,2);
    };
    self.toSecondPart = function (timeStr) {
        var result = timeStr.substr(2,2);
        return result==="" ? "0" : result;
    };
    self.toSeconds = function (timeStr) {
        return parseInt10(this.toMinutePart(timeStr))*60+parseInt10(this.toSecondPart(timeStr));
    };
    self.toMinSecHash = function (seconds) {
        var secPart = seconds % 60;
        return {min: (seconds - secPart) / 60,
                sec : secPart};
    };
    self.fromSeconds = function (seconds) {
        var minSec = self.toMinSecHash(seconds);
        return minSec.min.toString().rjust(2,"0") + minSec.sec.toString().rjust(2,"0");
    };
    self.ToHumanMinSecs = function (seconds) {
        var minSec = self.toMinSecHash(seconds);
        var result = minSec.min.toString() + "m"
        if(minSec.sec > 0){
          result += minSec.sec+"s";
        };
        return result;
    };
    self.isSameLocalDay = function (date1, date2) {
        return date1.toLocaleDateString() === date2.toLocaleDateString();
    };
    self.toHumanDateWithoutTime = function (aDate) {
      // not change now
      var now = new Date();
      if(self.isSameLocalDay(aDate, now)){
        return "Today";
      };
      var yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if(self.isSameLocalDay(aDate, yesterday)){
        return "Yesterday";
      };
      return aDate.toString().slice(4,15);
    }
    self.toHumanDateWithTime = function (timeInt) {
      var aDate = new Date(timeInt);
      return self.toHumanDateWithoutTime(aDate) +" "+ aDate.toTimeString().slice(0,5);
    };
    self.getValidatedTime = function (timeStr) {
        var timeInt = parseInt10(timeStr);
        if ( isNaN(timeInt) || timeInt <= 0) {
            return '0001';
        }else if (timeInt > 9959){
            return '9959';
        }
        return timeStr;
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
            return timeString.toFullTimeStr(timeString.getValidatedTime(window.location.hash.substring(1)));
        };
        return NONE;
    };
    var showStopTime = function (timeStr) {
        $("div.ten-minutes").text(timeString.toMinutePart(timeStr)[0]);
        $("div.minutes").text(timeString.toMinutePart(timeStr)[1]);
        $("div.ten-seconds").text(timeString.toSecondPart(timeStr)[0]);
        $("div.seconds").text(timeString.toSecondPart(timeStr)[1]);
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
        // stopTime = timeStr;
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
    var changeURL = function (timeStr) {
        window.location.hash="#"+timeStr;
    };
    var setStopTimeAndStatusAndURLSE = function (timeValue) {
        var validTimeStr = timeString.getValidatedTime(timeValue);
        stopTime = timeString.toFullTimeStr(validTimeStr);
        refreshStopTimeAndStatus(stopTime);
        changeURL(validTimeStr);
    };
    $('button#set').click(function(){
        // stopTime = timeString.toFullTimeStr();
        setStopTimeAndStatusAndURLSE($('input#stop-minutes').val());
    });
    $('button.short-key').click(function(){
        // stopTime = timeString.toFullTimeStr($(this).val());
        setStopTimeAndStatusAndURLSE($(this).val());
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
    var tomatoClock = _.extend(colinM.tomatoClock, colinM.littleAop),
        timeString = colinM.tomatoClock.timeString,
        self = {};
    var ME = 'ME',
        TABLE_NAME = 'TC',
        ROW_TEMPLATE = _.template(
            "<tr class=#{styleHuman}  style='display: none;'><td>#{ID}</td><td>#{passedTimeHuman}</td>"+
            "<td><time class='human-read' timeInt='#{ID}'>#{endTimeHuman}</time></td><td>#{finishedHuman}</td></tr>"),
        NAME_SPERATE = '-';
    var renderOneTc = function (obj, insertFunName) {
        var renderTc = generateRenderTc(obj)
        var newRow = $(ROW_TEMPLATE(renderTc));
        var insertFunName = insertFunName || 'append';
        $('table#tomato-clock-records > tbody')[insertFunName](newRow);
        newRow.show('slow');
        return renderTc;
    };
    var generateRenderTc = function (obj){
        var renderTc = _.extend({},obj);
        renderTc['finishedHuman'] = obj['originalSeconds'] ? 'NO' : 'YES';
        renderTc['styleHuman'] = obj['originalSeconds'] ? 'error' : 'success';
        renderTc['endTimeHuman'] = timeString.toHumanDateWithTime(parseInt10(obj['ID']));
        renderTc['passedTimeHuman'] = timeString.ToHumanMinSecs(obj['passedSeconds']);
        return renderTc;
    };
    var keepFixTcCount = function (tcCount, insertFunName) {
        var allTc = $('table#tomato-clock-records > tbody > tr');
        var insertFunName = insertFunName || 'append';
        var lastOrFirst = {'prepend':':last',
                          'append':':first'}[insertFunName];
        if(allTc.size() > tcCount){
          var removeTc = allTc.filter(lastOrFirst);
          removeTc.remove();
          return removeTc;
        };
        return 0;
    };
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
        var curId = getNowInt();
        localStorage[generateTcKey(curId, "updateTimeInt")] = curId;
        localStorage[generateTcKey(curId, "passedSeconds")] = passedSeconds;
        originalSeconds && (localStorage[generateTcKey(curId, "originalSeconds")] = originalSeconds);

        var newTc = {ID : curId, "passedSeconds" : passedSeconds, "updateTimeInt" : curId};
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
    self.getTcListLatest = function (listNumber) {
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
    // tc:
    // {
    //     ID: "1366421945220",
    //     passedSeconds: "1500",
    //     updateTimeInt: "1366431014979",
    //     originalSeconds: "1800"
    // }
    self.deleteTc = function (tcObj) {
        var fields = _.filter(Object.keys(tcObj), function (curKey) {
            return curKey !== 'ID';
        });
        _.map(fields, function (curField) {
            delete localStorage[generateTcKey(tcObj['ID'], curField)];
        });
        return tcObj;
    };
    var refreshHumanReadTime = function () {
      $("time.human-read").each(function (index) {
        this.innerText = timeString.toHumanDateWithTime(parseInt($(this).attr("timeInt")));
      });
    };
    tomatoClock.after('endEvent', function () {
        var curTc = saveOneTc(colinM.timedown.getPassedSeconds());
        renderOneTc(curTc, 'prepend');
        keepFixTcCount(5, 'prepend');
    });
    tomatoClock.after('stopEvent', function () {
        var curTc = saveOneTc(colinM.timedown.getPassedSeconds(),colinM.timedown.getTotalSeconds());
        renderOneTc(curTc, 'prepend');
        keepFixTcCount(5, 'prepend');
    });
    self.main = function () {
        var all = self.getTcListLatest(5);
        _.map(all, function (curTc) {
            renderOneTc(curTc);
        });
        console.log("all:");
        console.log(all);
    };
    return self;
}());
colinM.tomatoClock.clientDb.changes = (function () {
    var self = {},
        getTcListLatest = colinM.tomatoClock.clientDb.getTcListLatest,
        deleteTc = colinM.tomatoClock.clientDb.deleteTc,
        generateTcKey = colinM.tomatoClock.clientDb.generateTcKey
        parseInt10 = colinM.commons.parseInt10;

    self.deleteLittleSpan = function (spanThresholdSeconds) {
        var deleteList = _.map(getTcListLatest(), function (curTc) {
            if(parseInt10(curTc['passedSeconds']) < spanThresholdSeconds){
                return deleteTc(curTc);
            };
            return false;
        });
        return _.filter(deleteList, function (item) {
            return item;
        });
    };

    return self;
}());
var deleteLittleSpan = colinM.tomatoClock.clientDb.changes.deleteLittleSpan;

$(function(){
    colinM.tomatoClock.main();
    colinM.tomatoClock.clientDb.main();

});
