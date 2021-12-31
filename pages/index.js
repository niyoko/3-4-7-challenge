import * as React from "react";
import {
  Container,
  Box,
  Stack,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { some } from "lodash-es";
import dynamic from "next/dynamic";
import gcd from "compute-gcd";
import { useDebounce } from "react-use";
const Canvas = dynamic(() => import("../src/MainCanvas"), { ssr: false });

const MAX = 50;
const MIN = 3;

const isCoprime = (a, b) => gcd(a, b) === 1;
const hasCoprime = (a) => {
  for (let i = MIN; i <= MAX; i++) {
    if (isCoprime(a, i)) return true;
  }

  return false;
};

const getAMarks = () => {
  const marks = [];
  for (let i = MIN; i <= MAX; i++) {
    if (hasCoprime(i)) marks.push({ value: i });
  }

  return marks;
};

const getMarks = (a) => {
  const marks = [];
  for (let i = 2; i <= a; i++) {
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
  const [a, setA] = React.useState(7);
  const [b, setB] = React.useState(3);
  const [props, setProps] = React.useState();

  const aMarks = React.useMemo(() => getAMarks(), []);
  const bMarks = React.useMemo(() => getMarks(a), [a]);

  useDebounce(() => setProps({ a, b, showStar }), 250, [a, b, showStar]);

  useIsomorphicLayoutEffect(() => {
    if (!some(bMarks, (bm) => bm.value === b)) {
      setB(bMarks[0].value);
    }
  }, [bMarks, b]);

  const setASlider = React.useCallback((e, value) => setA(value), []);
  const setBSlider = React.useCallback((e, value) => setB(value), []);

  const isNumberCoprime = React.useMemo(() => isCoprime(a, b), [a, b]);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Stack spacing={2}>
          <Slider
            step={null}
            marks={aMarks}
            value={a}
            min={3}
            max={MAX}
            onChange={setASlider}
          />
          <Slider
            step={null}
            marks={bMarks}
            value={b}
            min={2}
            max={MAX}
            onChange={setBSlider}
          />
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
          </FormGroup>
          <Typography
            color={isCoprime ? undefined : "error"}
          >{`Label: {${a}/${b}} ${
            isNumberCoprime ? "" : "Pair is not coprime"
          }`}</Typography>
          <Canvas {...props} />
        </Stack>
      </Box>
    </Container>
  );
}
