var colinM = colinM || {};
colinM.timedown = (function () {
    var totalMilliSeconds = 0,
        startTimeList = [],
        pauseTimeList = [],
        endFun,
        timeout,
        status = "none",
        self = colinM.timedown || {};
    var nowTime = function () {
      return new Date().getTime();
    };
    var milliSecondsToSeconds = function (milliSeconds) {
        return Math.floor(milliSeconds/1000);
    };
    self.init = function (seconds, fun) {
        var that = this;
        totalMilliSeconds = seconds * 1000;
        endFun = function () {
            that.end();
            fun.call(this);
        };
        startTimeList = [];
        pauseTimeList = [];
        timeout = undefined;
        return this;
    };
    self.getTotalSeconds = function () {
        return milliSecondsToSeconds(totalMilliSeconds);
    };
    self.getPassedMilliSeconds = function () {
        var tmppauseTimeList = pauseTimeList.slice(0); 
        var result = 0;
        if(startTimeList.length>tmppauseTimeList.length){
            tmppauseTimeList.push(nowTime());
        };
        for (var i = startTimeList.length - 1; i >= 0; i--) {
            result += (tmppauseTimeList[i] - startTimeList[i]);
        };
        return result;
    };
    self.getPassedSeconds = function () {
        return milliSecondsToSeconds(this.getPassedMilliSeconds());
    };
    self.getRemainedMilliSeconds = function () {
        return totalMilliSeconds - this.getPassedMilliSeconds();
    };
    self.getRemainedSeconds = function () {
        return milliSecondsToSeconds(this.getRemainedMilliSeconds());
    };
    self.getStatus = function () {
        return status;
    };
    self.start = function () {
        if(arguments.length === 2){
            this.init(arguments[0],arguments[1]);
        };
        startTimeList.push(nowTime());
        timeout = setTimeout(endFun, totalMilliSeconds);
        status = "running";
        return this;
    };
    self.pause = function () {
        pauseTimeList.push(nowTime());
        clearTimeout(timeout);
        status = "paused";
        return this;
    };
    self.resume = function () {
        startTimeList.push(nowTime());
        timeout = setTimeout(endFun, this.getRemainedMilliSeconds());
        status = "running";
        return this;
    };
    self.end = function () {
        this.pause();
        status = "end";
        return this;
    };
    self.toString = function () {
        return " status: "+ status + 
              " totalSeconds: "+ this.getTotalSeconds() +
              " getPassedSeconds: "+ this.getPassedSeconds() +
              " startTimeList: "+ startTimeList +
              " pauseTimeList: "+ pauseTimeList;
    };
    return self;
}());
