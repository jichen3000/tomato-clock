var colinM = colinM || {};
colinM.timedown = (function () {
    var totalSeconds = 0,
        startTimeList = [],
        pauseTimeList = [],
        stopFun,
        timeout,
        status = "none",
        self = colinM.timedown || {};
    var nowTime = function () {
      return new Date().getTime();
    };
    self.init = function (seconds, fun) {
        var that = this;
        totalSeconds = seconds;
        stopFun = function () {
            that.stop();
            fun.call(this);
        };
        startTimeList = [];
        pauseTimeList = [];
        timeout = undefined;
        return this;
    };
    self.getTotalMilliSeconds = function  () {
        return totalSeconds * 1000;
    };
    self.getTotalSeconds = function () {
        return totalSeconds;
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
        return Math.round(this.getPassedMilliSeconds()/1000);
    };
    self.getReasonablePassedSeconds = function () {
        if(status==="stopped"){
            return totalSeconds;
        };
        return this.getPassedSeconds();
    }
    self.getRemainedMilliSeconds = function () {
        return this.getTotalMilliSeconds() - this.getPassedMilliSeconds();
    };
    self.getRemainedSeconds = function () {
        return Math.round(this.getRemainedMilliSeconds()/1000);
    };
    self.getRemainedOneSeconds = function () {
        // notice, this will use math ceil, it is reveres with the getPassedSeconds
        // return this.getTotalSeconds() - this.getPassedSeconds()-1;
        return Math.ceil(this.getRemainedMilliSeconds()/1000)-1;
    };
    self.getStatus = function () {
        return status;
    };
    self.isInRunning = function () {
        return status === "running";
    };
    self.start = function () {
        if(arguments.length === 2){
            this.init(arguments[0],arguments[1]);
        };
        startTimeList.push(nowTime());
        // timeout = setTimeout(stopFun, this.getTotalMilliSeconds());
        timeout = colinM.timer.timeout(stopFun, this.getTotalMilliSeconds());
        status = "running";
        return this;
    };
    self.pause = function () {
        pauseTimeList.push(nowTime());
        // clearTimeout(timeout);
        timeout.clear();
        status = "paused";
        return this;
    };
    self.continue = function () {
        startTimeList.push(nowTime());
        // timeout = setTimeout(stopFun, this.getRemainedMilliSeconds());
        timeout = colinM.timer.timeout(stopFun, this.getRemainedMilliSeconds());
        status = "running";
        return this;
    };
    self.stop = function () {
        this.pause();
        status = "stopped";
        return this;
    };
    self.toString = function () {
        return " status: "+ status + 
              " totalSeconds: "+ this.getTotalSeconds() +
              " getPassedSeconds: "+ this.getPassedSeconds() +
              " getRemainedSeconds: "+ this.getRemainedSeconds() +
              " getRemainedOneSeconds: "+ this.getRemainedOneSeconds() +
              " startTimeList: "+ startTimeList +
              " pauseTimeList: "+ pauseTimeList;
    };
    return self;
}());