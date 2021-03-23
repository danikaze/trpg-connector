import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware, {
  ThunkDispatch as ReduxThunkDispatch,
} from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reduxInmutableStateInvariant from 'redux-immutable-state-invariant';
import { Action } from './actions';
import { State } from './model';
import { reducer } from './reducer';
import { storeStateMiddleware } from '@utils/settings';

export type ThunkDispatch<A extends Action> = ReduxThunkDispatch<
  State,
  null,
  A
>;
// tslint:disable-next-line: no-any
export type ActionCreator<A extends Action> = (...args: any[]) => A;
// tslint:disable-next-line: no-any
export type ThunkActionCreator<A extends Action, T extends any[] = any[]> = (
  ...args: T
) => (dispatch: ThunkDispatch<A>, getState: () => State) => void;

export const store = makeStore() as Store<State, Action>;

function makeStore() {
  const middleware = [thunkMiddleware, promiseMiddleware, storeStateMiddleware];

  if (!IS_PRODUCTION) {
    middleware.unshift(reduxInmutableStateInvariant());
  }

  return createStore(
    reducer,
    composeWithDevTools(applyMiddleware(...middleware))
  );
}
