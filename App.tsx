import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Animated,
  TextInput,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { scaleLinear, scaleTime } from "d3-scale";
import * as shape from "d3-shape";
import * as path from "svg-path-properties";
import { scaleQuantile } from "d3";

const { width } = Dimensions.get("window");
const CHART_HEIGHT = 200;
const VERTICAL_PADDING = 5;
const CURSOR_RADIUS = 10;
const LABEL_WIDTH = 100;

const data = [
  { x: new Date(2018, 9, 1), y: 0 },
  { x: new Date(2018, 9, 16), y: 0 },
  { x: new Date(2018, 9, 17), y: 100 },
  { x: new Date(2018, 10, 1), y: 200 },
  { x: new Date(2018, 10, 2), y: 250 },
  { x: new Date(2018, 10, 15), y: 300 },
  { x: new Date(2018, 10, 19), y: 330 },
  { x: new Date(2018, 11, 5), y: 390 },
  { x: new Date(2018, 11, 10), y: 390 },
];

const scaleX = scaleTime()
  .domain([data[0].x, data[data.length - 1].x])
  .range([0, width]);
const scaleY = scaleLinear()
  .domain([data[0].y, data[data.length - 1].y])
  .range([CHART_HEIGHT - VERTICAL_PADDING, VERTICAL_PADDING]);
const scaleLabel = scaleQuantile()
  .domain([data[0].y, data[data.length - 1].y])
  .range([...new Set(data.map((e) => e.y))]);

const line = shape
  .line<{ x: Date; y: number }>()
  .x((d) => scaleX(d.x)!)
  .y((d) => scaleY(d.y)!)
  .curve(shape.curveBasis)(data)!;

const properties = path.svgPathProperties(line);
const lineLength = properties.getTotalLength();

export default function App() {
  const [x] = useState(new Animated.Value(0));
  const cursor = useRef<View>(null);
  const label = useRef<TextInput>(null);

  useEffect(() => {
    moveCursor(0);
    x.addListener(({ value }) => moveCursor(value));

    return () => {
      x.removeAllListeners();
    };
  }, []);

  const moveCursor = (value: number) => {
    const { x, y } = properties.getPointAtLength(lineLength - value);
    cursor.current!.setNativeProps({
      top: y - CURSOR_RADIUS,
      left: x - CURSOR_RADIUS,
    });
    const labelText = scaleY.invert(y);
    label.current!.setNativeProps({ text: `${scaleLabel(labelText)}` });
  };

  const translateX = x.interpolate({
    inputRange: [0, lineLength],
    outputRange: [width - LABEL_WIDTH, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Svg width={width} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="gradient">
              <Stop stopColor="#cde3f8" offset="0%" />
              <Stop stopColor="#eef6fd" offset="80%" />
              <Stop stopColor="#feffff" offset="100%" />
            </LinearGradient>
          </Defs>
          <Path d={line} fill="transparent" stroke="#367be2" strokeWidth={5} />
          <Path
            d={`${line} L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT}`}
            fill="url(#gradient)"
          />
          <View style={styles.cursor} ref={cursor} />
        </Svg>
        <Animated.View style={[styles.label, { transform: [{ translateX }] }]}>
          <TextInput ref={label} />
        </Animated.View>
        <Animated.ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={{
            width: lineLength * 2,
          }}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x,
                  },
                },
              },
            ],
            {
              useNativeDriver: true,
            }
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    width,
    height: CHART_HEIGHT,
    marginTop: 60,
  },
  cursor: {
    width: CURSOR_RADIUS * 2,
    height: CURSOR_RADIUS * 2,
    borderRadius: CURSOR_RADIUS,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#367be2",
  },
  label: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: LABEL_WIDTH,
    position: "absolute",
    top: -60,
    left: 0,
  },
});
