import {initialState} from "./context.store.js";
import actionsStore from "./actions.store.js";

export default function reducer (state = initialState, action) {
    // console.log(action.type, action.payload)
    switch (action.type) {
        case actionsStore.SET_INITIAL_STATE: {
            return initialState
        }
        case actionsStore.SET_LOGGED_USER: {
            return {
                ...state,
                user: action.payload
            }
        }
        case actionsStore.SET_HISTORY: {
            return {
                ...state,
                history: action.payload
            }
        }
        default: {
            return state
        }
    }
}