try {
    module.exports = _promise
  } catch (e) {}


function _promise(fn) {
    const self = this
    self.status = 'pending'
    self.value = undefined
    self.reason = undefined
    self.onFulfilledCallback = []
    self.onRejectedCallback = []
    self.onFinallyCallback = []
    function resolve(value) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'fulfilled'
                self.value = value
                self.onFulfilledCallback.forEach(v => v(value));
                finallyCallback()
            }
        }, 0);
    }
    function reject(reason) {
        setTimeout(() => {
            if (self.status === 'pending') {
                self.status = 'rejected'
                self.reason = reason
                self.onRejectedCallback.forEach(v => v(reason))
                finallyCallback()
            }
        }, 0);
    }
    function finallyCallback(){
        for(let i = 0; i < self.onFinallyCallback.length; i++){
            self.onFinallyCallback[i]()
        }
    }
    try {
        fn(resolve, reject)
    } catch (error) {
        reject(error)
    }
}
function resolvePromise(_promise2, x, r, j) {
    let called = false
    if (_promise2 === x) {
        j(new TypeError('不可重复使用相同的promose'))
        return
    }
    if (x instanceof _promise) { // 如果是promise直接处理
        if (x.status === 'pending') {
            x.then(r, j)
        } else {
            x.then(r, j)
        }
        return
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) { // 该段代码只是为了兼容promise规范出现前，模拟promise的库
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, resolveY => {
                    if (called) {
                        return
                    }
                    called = true
                    resolvePromise(_promise2, resolveY, r, j)
                }, rejectY => {
                    if (called) {
                        return
                    }
                    called = true
                    j(rejectY)
                })
            } else {
                r(x)
            }
        } catch (error) {
            j(error)
        }
    } else {
        r(x)
    }


}

_promise.prototype.then = function (onFulfilled, onRejected) {
    const self = this
    const onFulfilledFn = typeof onFulfilled === 'function' ? onFulfilled : function (resolve) { return resolve }
    const onRejectedFn = typeof onRejected === 'function' ? onRejected : function (reject) { throw reject }
    let _promise2
    return _promise2 = new _promise((r, j) => {
        switch (self.status) {
            case 'pending':
                self.onFulfilledCallback.push((value) => {
                    try {
                        let x = onFulfilledFn(value)
                        resolvePromise(_promise2, x, r, j)
                    } catch (error) {
                        j(error)
                    }
                })
                self.onRejectedCallback.push((reason) => {
                    try {
                        let x = onRejectedFn(reason)
                        resolvePromise(_promise2, x, r, j)
                    } catch (error) {
                        j(error)
                    }
                })
                break
            case 'fulfilled':
                try {
                    let x = onFulfilledFn(self.value)
                    resolvePromise(_promise2, x, r, j)
                } catch (error) {
                    j(error)
                }
                break
            case 'rejected':
                try {
                    let x = onFulfilledFn(self.reason)
                    resolvePromise(_promise2, x, r, j)
                } catch (error) {
                    j(error)
                }
                break
        }
    })
}
_promise.prototype.catch = function (err) {
    return this.then(undefined, err)
}
_promise.prototype.finally = function (fn) {
    if(this.status === 'pending'){
        this.onFinallyCallback.push(fn)
    } else {
        try {
            fn()
        } catch (error) {
            throw error
        }
    }
}
_promise.all = function (arr) {
    return new _promise((r, j) => {
        let resList = new Array(arr.length)
        let resListNum = 0
        let status = 'fulfilled'
        function setPromise() {
            resListNum++
            if (resListNum == arr.length) {
                r(resList)
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] instanceof _promise) {
                arr[i].then(res => {
                    resList[i] = res
                    setPromise()
                }).catch(err => {
                    j(err)
                    status = 'rejected'
                })
                if (status === 'rejected') {
                    break
                }
            } else {
                resList[i] = arr[i]
                setPromise()
                continue
            }
        }
    })

}
_promise.allSettled = function (arr) {
    return new _promise((r, j) => {
        let resList = new Array(arr.length)
        let resListNum = 0
        function setPromise() {
            resListNum++
            if (resListNum == arr.length) {
                r(resList)
            }
        }
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] instanceof _promise) {
                arr[i].then(res => {
                    resList[i] = {
                        value: res,
                        status: "fulfilled"
                    }
                    setPromise()
                }).catch(err => {
                    resList[i] = {
                        reason: err,
                        status: "rejected"
                    }
                    setPromise()
                })
            } else {
                resList[i] = {
                    value: arr[i],
                    status: "fulfilled"
                }
                setPromise()
                continue
            }
        }
    })

}
_promise.race = function (arr) {
    return new _promise((r, j) => {
        let result = null
        let reason = null
        function setPromise() {
            if(reason){
                j(reason)
                return
            }
            if(result){
                r(result)
                return
            }
            
        }
        let i = 0
        while(!result && !reason && i < arr.length){
            if(arr[i] instanceof _promise){
                arr[i].then(res => {
                    result = res
                    setPromise()
                }, err => {
                    reason = err
                    setPromise()
                })
                
            } else {
                result = arr[i]
                setPromise()
            }  
            i++ 
        }
    })
}
_promise.deferred = _promise.defer = function () {
    var dfd = {}
    dfd.promise = new _promise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}