const { Observable, BehaviorSubject } = require('rxjs');

let state = {
    count: 0
}

function reduceState(stateActionPair = { state: undefined }, [action, reducer]) {
    const { state } = stateActionPair
    return { state: reducer(state, action), action }
}

/** This function combines all the reducers into a single reducer function */
function combineReducers(reducer, initialState = {}) {
    return function combination(state = initialState, action) {
        return reducer(state, action)
    }
}
/** This holds the current reducer function */
class ReducerManager extends BehaviorSubject {
    constructor(reducer, initialState) {
        super(combineReducers(reducer, initialState))
    }
}

/** This holds the current action disatched to the reducer */
class ActionsSubject extends BehaviorSubject {
    constructor() {
        super({ type: 'INIT' })
    }
    dispatch(v) {
        super.next(v)
    }
}

/** This holds the current state of the store */
class State extends BehaviorSubject {
    constructor(initS, actions, reducer$) {
        super(initS)
        this.actions = actions
        this.reducer$ = reducer$
        this.actions
            .withLatestFrom(reducer$)
            .scan( /*(state, action) =>*/ reduceState /*(state, action)*/ , initS)
            .subscribe(
                /*(state) => { console.log('fgg');
                            super.next(state) }*/
                {
                    next: ({ state, action }) => {
                        this.next(state)
                    }
                })
    }
}

class Store extends Observable {
    constructor(initS) {
        super();
        this.actionOb = new ActionsSubject()
        this.reducer$ = new ReducerManager(reducer, initS)
        this.state = new State(initS, this.actionOb, this.reducer$)
        this.source = this.state
    }
    dispatch(action) {
        this.actionOb.dispatch(action)
    }
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD':
            return {
                count: 8
            }
        default:
            return state
    }
}

let store = new Store(state)
store.subscribe(s => console.log('s:', s))
store.dispatch({ type: 'ADD' })