import {
  useCallback,
} from "react";


const listeners =
  {};


export default function useEventBus() {

  const emit =
    useCallback(
      (
        event,
        payload
      ) => {

        if (
          listeners[
            event
          ]
        ) {

          listeners[
            event
          ].forEach(
            (
              callback
            ) =>
              callback(
                payload
              )
          );
        }
      },
      []
    );


  const subscribe =
    useCallback(
      (
        event,
        callback
      ) => {

        if (
          !listeners[
            event
          ]
        ) {

          listeners[
            event
          ] = [];
        }

        listeners[
          event
        ].push(
          callback
        );
      },
      []
    );


  return {
    emit,
    subscribe,
  };
}