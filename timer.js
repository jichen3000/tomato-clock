var colinM = colinM || {};
colinM.timer = (function () {
  var self = colinM.timer || {};
  var dateNow=Date.now;
  var requestAnimation=window.requestAnimationFrame;
  var veryDelay = 2000;
  self.setVeryDelay = function(the_value){
    veryDelay = the_value;
  }
  self.timeout = function(callback,delay){
    // if (typeof window === 'undefined' || !window.requestAnimationFrame){
    //   console.log("Warning: cannot find the function window.requestAnimationFrame");
    //   return setTimeout(callback,delay);
    // }
    var start=dateNow();
    var stop;
    // putMsg(veryDelay);
    var timeoutFunc=function(){
      var isVeryDelay = (dateNow()-start) > (delay + veryDelay);
      dateNow()-start<delay?stop||requestAnimation(timeoutFunc):callback(isVeryDelay)
    };
    requestAnimation(timeoutFunc);
    return { clear:function(){stop=1} }
  }
  self.interval=function(callback,delay){
    var start=dateNow();
    var stop;
    var intervalFunc=function(){
      dateNow()-start<delay||(start+=delay,callback());
      stop||requestAnimation(intervalFunc)
    }
    requestAnimation(intervalFunc);
    return { clear:function(){stop=1} }
  }

  return self;
}());

