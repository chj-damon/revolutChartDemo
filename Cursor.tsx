import React, { FC } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  decay,
  parsePath,
  getPointAtLength,
} from "react-native-redash/lib/module/v1";

interface CursorProps {
  line: string;
  r: number;
  borderWidth: number;
  borderColor: string;
}

const { sub, interpolate, useValue, event } = Animated;
const TOUCH_SIZE = 100;
const { width } = Dimensions.get("window");

const Cursor: FC<CursorProps> = ({ line, r, borderWidth, borderColor }) => {
  const radius = r + borderWidth / 2;
  const translationX = useValue(0);
  const velocityX = useValue(0);
  const state = useValue(State.UNDETERMINED);
  const onGestureEvent = event([
    {
      nativeEvent: {
        translationX,
        velocityX,
        state,
      },
    },
  ]);
  const cx = decay(translationX, state, velocityX);
  const path = parsePath(line);
  const length = interpolate(cx, {
    inputRange: [0, width],
    outputRange: [0, path.totalLength],
  });
  const { y, x } = getPointAtLength(path, length);
  const translateX: any = sub(x, TOUCH_SIZE / 2);
  const translateY: any = sub(y, TOUCH_SIZE / 2);

  return (
    <View style={StyleSheet.absoluteFill}>
      <PanGestureHandler
        onHandlerStateChange={onGestureEvent}
        {...{ onGestureEvent }}
      >
        <Animated.View
          style={{
            transform: [{ translateX }, { translateY }],
            width: TOUCH_SIZE,
            height: TOUCH_SIZE,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: radius * 2,
              height: radius * 2,
              borderRadius: radius,
              borderColor,
              borderWidth,
              backgroundColor: "white",
            }}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default Cursor;
