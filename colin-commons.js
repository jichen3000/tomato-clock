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
        aopFunNames = ['after'];
        // aopFunNames = ['after', 'before', 'round'];
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

colinM.commons.regularRefresh = (function () {
    var intervalFun,
        funList = [],
        latestRefreshTime = new Date(),
        self = {};
    var invokeFunList = function () {
        var now = new Date();
        var that = this;
        _.each(funList, function (curFun) {
            return curFun.call(that, latestRefreshTime);
        });
        latestRefreshTime = now;
        return latestRefreshTime;
    };
    self.register = function (fun) {
        return funList.push(fun);
    };
    self.start = function (intervalSeconds) {
        // intervalFun = setInterval(invokeFunList, intervalSeconds*1000);
        intervalFun = colinM.timer.interval(invokeFunList, intervalSeconds*1000);
        return self;
    };
    self.stop = function () {
        clearInterval(intervalFun);
    };

    return self;
}());

