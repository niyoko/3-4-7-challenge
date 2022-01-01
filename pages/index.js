import * as React from "react";
import {
  Container,
  Box,
  Stack,
  Grid,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  FormLabel,
  FormGroup,
  IconButton,
} from "@mui/material";
import { PlayCircle, PauseCircle } from "@mui/icons-material";
import { some } from "lodash-es";
import dynamic from "next/dynamic";
import gcd from "compute-gcd";
import { useDebounce } from "react-use";
const Canvas = dynamic(() => import("../src/MainCanvas"), { ssr: false });

const MAX = 30;
const MIN = 3;

const gonNames = [
  "",
  "monogon",
  "line",
  "triangle",
  "square",
  "pentagon",
  "hexagon",
  "heptagon",
  "octagon",
  "nonagon",
  "decagon",
  "hendecagon",
  "dodecagon",
  "tridecagon",
  "tetradecagon",
  "pentadecagon",
  "hexadecagon",
  "heptadecagon",
  "octadecagon",
  "enneadecagon",
  "icosagon",
];

const getGonName = (n) => {
  if (gonNames[n]) return gonNames[n] + "s";
  return `${n}-gons`;
};

const isCoprime = (a, b) => gcd(a, b) === 1;
const hasCoprime = (a) => {
  for (let i = MIN; i <= MAX; i++) {
    if (isCoprime(a, i)) return true;
  }

  return false;
};

const getMarks = (a) => {
  const marks = [];
  for (let i = 1; i <= a; i++) {
    if (isCoprime(a, i)) {
      marks.push({ value: i });
    }
  }
  return marks;
};

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

export default function Index() {
  const [showStar, setShowStar] = React.useState(true);
  const [showPoints, setShowPoints] = React.useState(true);
  const [showG1, setShowG1] = React.useState(false);
  const [showG2, setShowG2] = React.useState(false);

  const [isStopped, setIsStopped] = React.useState(false);
  const [animationSpeed, setAnimationSpeed] = React.useState(10);
  const [starRoundness, setStarRoundness] = React.useState(10);
  const [a, setA] = React.useState(7);
  const [b, setB] = React.useState(3);
  const [props, setProps] = React.useState();

  const bMarks = React.useMemo(() => getMarks(a), [a]);

  React.useEffect(() => {
    setProps({
      a,
      b,
      showStar,
      showPoints,
      showG1,
      showG2,
      animationSpeed: isStopped ? 0 : animationSpeed * 0.001,
      starRoundness: starRoundness,
    });
  }, [
    a,
    b,
    showStar,
    showPoints,
    showG1,
    showG2,
    animationSpeed,
    isStopped,
    starRoundness,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (!some(bMarks, (bm) => bm.value === b)) {
      setB(bMarks[0].value);
    }
  }, [bMarks, b]);

  const isNumberCoprime = React.useMemo(() => isCoprime(a, b), [a, b]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Stack spacing={3}>
          <Grid container columnSpacing={5} rowSpacing={3}>
            <Grid item xs={12} md={6}>
              <Stack>
                <FormLabel>First number: {a}</FormLabel>
                <Slider
                  step={1}
                  marks
                  value={a}
                  min={2}
                  max={MAX}
                  onChange={(e, value) => setA(value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack>
                <FormLabel>Second number: {b}</FormLabel>
                <Slider
                  step={null}
                  marks={bMarks}
                  value={b}
                  min={1}
                  max={MAX}
                  onChange={(e, value) => setB(value)}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack>
                <FormLabel>Animation speed: {animationSpeed}</FormLabel>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Slider
                    value={animationSpeed}
                    onChange={(e, value) => setAnimationSpeed(value)}
                  />
                  <IconButton onClick={() => setIsStopped((x) => !x)}>
                    {isStopped ? <PlayCircle /> : <PauseCircle />}
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack>
                <FormLabel>Star roundness: {starRoundness}</FormLabel>
                <Slider
                  value={starRoundness}
                  onChange={(e, value) => setStarRoundness(value)}
                />
              </Stack>
            </Grid>
          </Grid>

          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showStar}
                  onChange={(e) => setShowStar(e.target.checked)}
                />
              }
              label="Show star"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                />
              }
              label="Show points"
            />
            {b > 1 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showG1}
                    onChange={(e) => setShowG1(e.target.checked)}
                  />
                }
                label={`Show ${getGonName(b)}`}
              />
            )}
            {a - b > 1 && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showG2}
                    onChange={(e) => setShowG2(e.target.checked)}
                  />
                }
                label={`Show ${getGonName(a - b)}`}
              />
            )}
          </FormGroup>
          <Typography
            color={isCoprime ? undefined : "error"}
          >{`Star label: {${a}/${b}} ${
            isNumberCoprime ? "" : "Pair is not coprime"
          }`}</Typography>
          <Stack justifyContent="center" alignItems="center">
            <Canvas {...props} />
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
