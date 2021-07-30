
  
  function Promise(executor) {
  
    var self = this
  
    self.status = 'pending'
  
    self.onResolvedCallback = []
  
    self.onRejectedCallback = []
  
    function resolve(value) {
  
      if (value instanceof Promise) {
  
        return value.then(resolve, reject)
  
      }
  
      setTimeout(function() { // 异步执行所有的回调函数
  
        if (self.status === 'pending') {
  
          self.status = 'resolved'
  
          self.data = value
  
          for (var i = 0; i < self.onResolvedCallback.length; i++) {
  
            self.onResolvedCallback[i](value)
  
          }
  
        }
  
      })
  
    }
  
    function reject(reason) {
  
      setTimeout(function() { // 异步执行所有的回调函数
  
        if (self.status === 'pending') {
  
          self.status = 'rejected'
  
          self.data = reason
  
          for (var i = 0; i < self.onRejectedCallback.length; i++) {
            console.log(self.onRejectedCallback[i])
            self.onRejectedCallback[i](reason)
  
          }
  
        }
  
      })
  
    }
  
    try {
  
      executor(resolve, reject)
  
    } catch (reason) {
  
      reject(reason)
  
    }
  
  }
  
  function resolvePromise(promise2, x, resolve, reject) {
  
    var then
  
    var thenCalledOrThrow = false
  
    if (promise2 === x) {
        console.log(1)
  
      return reject(new TypeError('Chaining cycle detected for promise!'))
  
    }
  
    if (x instanceof Promise) {
        console.log(2)
      if (x.status === 'pending') { 
  
        x.then(function(v) {
  
          resolvePromise(promise2, v, resolve, reject)
  
        }, reject)
  
      } else {
  
        x.then(resolve, reject)
  
      }
  
      return
  
    }
  
    if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        console.log(3)
      try {
  
        then = x.then
        console.log(x,'x')
        if (typeof then === 'function') {
            console.log('x1')
          then.call(x, function rs(y) {
  
            if (thenCalledOrThrow) return
  
            thenCalledOrThrow = true
  
            return resolvePromise(promise2, y, resolve, reject)
  
          }, function rj(r) {
  
            if (thenCalledOrThrow) return
  
            thenCalledOrThrow = true
  
            return reject(r)
  
          })
  
        } else {
  
          resolve(x)
  
        }
  
      } catch (e) {
  
        if (thenCalledOrThrow) return
  
        thenCalledOrThrow = true
  
        return reject(e)
  
      }
  
    } else {
        console.log(4,x)
      resolve(x)
  
    }
  
  }
  
  Promise.prototype.then = function(onResolved, onRejected) {
  
    var self = this
  
    var promise2
  
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) {
  
      return v
  
    }
  
    onRejected = typeof onRejected === 'function' ? onRejected : function(r) {
  
      throw r
  
    }
  
    if (self.status === 'resolved') {
  
      return promise2 = new Promise(function(resolve, reject) {
  
        setTimeout(function() { // 异步执行onResolved
  
          try {
  
            var x = onResolved(self.data)
  
            resolvePromise(promise2, x, resolve, reject)
  
          } catch (reason) {
  
            reject(reason)
  
          }
  
        })
  
      })
  
    }
  
    if (self.status === 'rejected') {
  
      return promise2 = new Promise(function(resolve, reject) {
  
        setTimeout(function() { // 异步执行onRejected
  
          try {
  
            var x = onRejected(self.data)
  
            resolvePromise(promise2, x, resolve, reject)
  
          } catch (reason) {
  
            reject(reason)
  
          }
  
        })
  
      })
  
    }
  
    if (self.status === 'pending') {
  
      // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
  
      return promise2 = new Promise(function(resolve, reject) {
  
        self.onResolvedCallback.push(function(value) {
  
          try {
  
            var x = onResolved(value)
  
            resolvePromise(promise2, x, resolve, reject)
  
          } catch (r) {
  
            reject(r)
  
          }
  
        })
  
        self.onRejectedCallback.push(function(reason) {
  
            try {
  
              var x = onRejected(reason)
  
              resolvePromise(promise2, x, resolve, reject)
  
            } catch (r) {
  
              reject(r)
  
            }
  
          })
  
      })
  
    }
  
  }
  
  Promise.prototype.catch = function(onRejected) {
  
    return this.then(null, onRejected)
  
  }
  
  // 最后这个是测试用的，后面会说
  
  Promise.deferred = Promise.defer = function() {
  
    var dfd = {}
  
    dfd.promise = new Promise(function(resolve, reject) {
  
      dfd.resolve = resolve
  
      dfd.reject = reject
  
    })
  
    return dfd
  
  }
  