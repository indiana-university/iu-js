# IU JS Style Guide - Model Layer
> a.k.a. state management

- ES6 classes <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes>
  - All members private, except getters and setters
  - Only define getters where external access is required
  - Only define setters where external modificaiton is expected
  - Only use public methods for access to instaces of child objects

- Initialize null, false, and empty values

```javascript
class {
  #aRequiredValue
  #aThing = null
  #aDate = null
  #aBool = false
  #aString = ''
  #anArray = []
  #anObject = {}

  constructor (aRequiredValue) {
    this.#aRequiredValue = aRequiredValue
  }
}
```

- Define a stream

```javascript
class {
  #stream = new iu.EventStream()
  get stream () { return this.#stream }
}
```

- Subscribe to external streams in constructor

```javascript
class {
  constructor() {
    iu.environment.subscribe(a => {
      if (a.appliesToMe) {
        this.#doStuffWith(a)
        this.#stream.next(this)
      }
    }
  }
}
```

- Setters enforce type and publish changes

```javascript
class {
  set aThing (aThing) { // i.e. aString, anArray, anObject
    if (aThing !== this.#aThing && // is changed
        (aThing === null || // is explicitly null, not undefined, false, etc
          typeof aThing === 'thing' // or is the expected type
          // non-primitives use (aThing instanceof Thing)
        ) {
      this.#aThing = aThing
      this.#stream.next(this)
    }
  }

  set aDate (aDate) {
    if (typeof aDate === 'string' || // ISO-8601 or epoch  millis
        typeof aDate === 'number') aDate = new Date(aDate)
    if (aDate !== this.#aDate && (aDate === null || aDate instanceof Date)) {
      this.#aDate = aDate
      this.#stream.next(this)
    }
  }

  set aBool (aBool) { // ignores non-boolean values, i.e. null or undefined
    if (typeof aBool === 'boolean' && aBool !== this.#aBool) {
      this.#aBool = aBool
      this.#stream.next(this)
    }
  }
}
```

- Use getters for calculated values

```javascript
class {
  constructor () {
    iu.environment.subscribe(a => {
      if (a.appliesToMe) {
        // ...
        this.#aCalculatedValue = null
        this.#stream.next(this)  
      }
    })
  }

  get aCalculatedValue () {
    if (!this.#aCalculatedValue) {
      this.#aCalculatedValue = calculateWith(this.#aValueToDeriveFrom)
    }
    return this.#aCalculatedValue
  }
}
```

- Pass source stream to constructor for publishing generic updates

```javascript
class A {
  constructor (source$) {
    source$.subscribe(a => {
      this.#update(a)
    })
  }
}

class {
  #a$
  #a

  constructor () {
    this.#a$ = new iu.EventStream()
    this.#a = new A(this.#a$)
    iu.environment.subscribe(a => {
      if (a.appliesToA) this.#a$.next(a)
    })
  }
}
```

- Complete child object streams to release resources

```javascript
class A {
  #env$
  #stream = iu.EventStream()

  constructor () {
    this.#env$ = iu.environment.subscribe(a => {
      if (a.appliesToMe) this.#doSomethingWith(a)
    })
    this.#stream.subscribe({ complete: () => this.#env$.unsubscribe() })
  }

  get stream () { return this.#stream }
}

// i.e. in componentDidMount()
this.#a = new A()
// i.e. in componentWillUnmount()
this.#a.stream.complete()
```

