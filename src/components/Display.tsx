import React, { useRef, useEffect, FC, useState } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import theme from '../data/theme';
import Lowpoly from '../lib/Lowpoly';
import { SettingsState } from '../data/defaults';
import Loader from './Loader';
import { Buffer } from 'buffer';
let C2S = require('canvas2svg');

const StyledDisplay = styled.div`
  text-align: center;
  bottom: 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  @media screen and (min-width: 800px) {
    width: calc(100% - ${theme.controls.width});
  }
`;

const Canvas = styled.canvas`
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 2px 5px ${rgba('#000', 0.2)}, 0 5px 20px ${rgba('#000', 0.1)};
`;

const Display: FC<{
  settings: SettingsState;
  updateOutput: (bitmapUrl: string, svgUrl: string) => void;
}> = ({ settings, updateOutput }) => {
  const canvas = { bitmap: useRef(null), svg: useRef(null) };
  const lowpoly = useRef(null);
  const [loading, setLoading] = useState(false);

  /**
   * Draw the source gradient or image
   * @param {CanvasRenderingContext2D} context Canvas context
   * @param {HTMLCanvasElement} elem Canvas element
   */
  const drawCanvas = async () => {
    const { geometry, colour, image, useImage, seed } = settings;

    let output = await lowpoly.current.render({
      variance: geometry.variance,
      cellSize: geometry.cellSize,
      depth: geometry.depth,
      dither: geometry.dither,
      image,
      colours: colour,
      useImage,
      seed,
    });

    updateOutput(output.bitmap.toDataURL(), "data:image/svg+xml;base64," + Buffer.from(output.svg.getSerializedSvg(true)).toString('base64'));
  };

  useEffect(() => {
    lowpoly.current = new Lowpoly(canvas.bitmap.current, canvas.svg.current);
  }, []);

  useEffect(() => {
    const func = async () => {
      await drawCanvas();
      setLoading(false);
    };

    if (loading) {
      func();
    }
  }, [loading]);

  useEffect(() => {
    setLoading(true);
  }, [settings]);

  const { width, height } = settings.dimensions;

  canvas.svg.current = new C2S(width, height);

  return (
    <StyledDisplay>
      {loading ? <Loader /> : null}
      <Canvas ref={canvas.bitmap} width={width} height={height} />
    </StyledDisplay>
  );
};

export default Display;
