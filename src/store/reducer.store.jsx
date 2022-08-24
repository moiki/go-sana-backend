import {initialState} from "./context.store.jsx";
import actionsStore from "./actions.store.jsx";

export default function reducer (state = initialState, action) {
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