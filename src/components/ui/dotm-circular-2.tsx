"use client";

import type { CSSProperties } from "react";

import { DotMatrixBase } from "@/components/ui/dotmatrix-core";
import { useDotMatrixPhases } from "@/components/ui/dotmatrix-hooks";
import { isWithinCircularMask } from "@/components/ui/dotmatrix-core";
import { rowMajorIndex } from "@/components/ui/dotmatrix-core";
import { usePrefersReducedMotion } from "@/components/ui/dotmatrix-hooks";
import type { DotAnimationResolver, DotMatrixCommonProps } from "@/components/ui/dotmatrix-core";

export type DotmCircular2Props = DotMatrixCommonProps;

const RING_PATH: readonly number[] = [
  rowMajorIndex(0, 1),
  rowMajorIndex(0, 2),
  rowMajorIndex(0, 3),
  rowMajorIndex(1, 4),
  rowMajorIndex(2, 4),
  rowMajorIndex(3, 4),
  rowMajorIndex(4, 3),
  rowMajorIndex(4, 2),
  rowMajorIndex(4, 1),
  rowMajorIndex(3, 0),
  rowMajorIndex(2, 0),
  rowMajorIndex(1, 0)
];

const LOOP_LEN = RING_PATH.length;
const BASE_OPACITY = 0.08;

export function DotmCircular2({
  size = 108,
  dotSize = 13.5,
  speed = 1.8,
  pattern = "full",
  dotShape = "square",
  color = "#53c653",
  animated = true,
  hoverAnimated = false,
  muted = false,
  bloom = false,
  halo = 0,
  opacityBase = 0,
  opacityMid = 0.07,
  opacityPeak = 1,
  cellPadding = 0.5,
  boxSize = 0,
  minSize = 0,
  ...rest
}: DotmCircular2Props) {
  const reducedMotion = usePrefersReducedMotion();
  const { phase: matrixPhase, onMouseEnter, onMouseLeave } = useDotMatrixPhases({
    animated: Boolean(animated && !reducedMotion),
    hoverAnimated: Boolean(hoverAnimated && !reducedMotion),
    speed
  });
  const resolver: DotAnimationResolver = ({ index, row, col, phase }) => {
    if (!isWithinCircularMask(row, col)) {
      return { className: "dmx-inactive" };
    }

    const onRing = RING_PATH.indexOf(index);
    if (onRing === -1) {
      return { style: { opacity: row === 2 && col === 2 ? 0.18 : (opacityBase ?? BASE_OPACITY) } };
    }

    if (reducedMotion || phase === "idle") {
      return { style: { opacity: 0.28 + (onRing / (LOOP_LEN - 1)) * 0.58 } };
    }

    return {
      className: "dmx-circular2-ring",
      style: { "--dmx-ring-order": onRing } as CSSProperties
    };
  };

  return (
    <DotMatrixBase
      {...rest}
      size={size}
      dotSize={dotSize}
      speed={speed}
      pattern={pattern}
      dotShape={dotShape}
      color={color}
      animated={animated}
      hoverAnimated={hoverAnimated}
      muted={muted}
      bloom={bloom}
      halo={halo}
      opacityBase={opacityBase}
      opacityMid={opacityMid}
      opacityPeak={opacityPeak}
      cellPadding={cellPadding}
      boxSize={boxSize}
      minSize={minSize}
      phase={matrixPhase}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      reducedMotion={reducedMotion}
      animationResolver={resolver}
    />
  );
}
