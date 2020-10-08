import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { scaleLinear, scaleTime } from "d3-scale";
import * as shape from "d3-shape";
import Cursor from "./Cursor";

const { width } = Dimensions.get("window");
const CHART_HEIGHT = 200;
const VERTICAL_PADDING = 5;
const CURSOR_RADIUS = 8;
const STROKE_WIDTH = CURSOR_RADIUS / 2;

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

const line = shape
  .line<{ x: Date; y: number }>()
  .x((d) => scaleX(d.x)!)
  .y((d) => scaleY(d.y)!)
  .curve(shape.curveBasis)(data) as string;

export default function App() {
  return (
    <View style={styles.container}>
      <Svg style={[StyleSheet.absoluteFill]}>
        <Defs>
          <LinearGradient id="gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#cee3f9" />
            <Stop offset="80%" stopColor="#ddedfa" />
            <Stop offset="100%" stopColor="#feffff" />
          </LinearGradient>
        </Defs>
        <Path
          d={`${line}L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT}`}
          fill="url(#gradient)"
        />
        <Path
          fill="transparent"
          stroke="#3977e3"
          d={line}
          strokeWidth={STROKE_WIDTH}
        />
      </Svg>
      <Cursor
        r={CURSOR_RADIUS}
        borderWidth={STROKE_WIDTH}
        borderColor="#3977e3"
        {...{ line }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: CHART_HEIGHT,
    marginTop: 60,
  },
});
