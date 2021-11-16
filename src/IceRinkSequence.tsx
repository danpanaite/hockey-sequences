import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DefaultNode, Graph } from '@visx/network';

import {
  CircleSubject, Connector, EditableAnnotation, Label,
} from '@visx/annotation';
import { Box } from '@mui/material';
import { Play } from './services/dataService';
import useScale from './hooks/useScale';
import { ReactComponent as IceRink } from './ht-ice-rink.svg';

type IceRinkProps = {
  plays: Play[];
  selectedPlay: Play | null;
  onPlaySelected: (play: Play) => void;
  dimensions: any;
};

type CustomNode = {
  play: Play;
  x: number;
  y: number;
  color?: string;
  // title: string;
  // subtitle: string;
};

type CustomLink = {
  source: CustomNode;
  target: CustomNode;
  dashed?: boolean;
  color: string;
};

type CustomGraph = {
  nodes: CustomNode[],
  links: CustomLink[],
};

type EventColors = {
  [event: string]: string
};

const EVENT_COLORS: EventColors = {
  Play: '#27ae60',
  'Incomplete Play': '#c0392b',
  'Puck Recovery': '#2980b9',
  'Zone Entry': '#95a5a6',
  Shot: '#3498db',
  Goal: '#f39c12',
};

export default function IceRinkSequence({
  plays, selectedPlay, onPlaySelected, dimensions,
}: IceRinkProps) {
  const aspectRatio = 200 / 85;
  const aspectWidth = dimensions.height * aspectRatio;
  const aspectHeight = dimensions.width / aspectRatio;
  const xScale = Math.min(aspectWidth, dimensions.width) / 200;
  const yScale = Math.min(aspectHeight, dimensions.height) / 85;

  const graph = plays.reduce<CustomGraph>((currentGraph, play, currentIndex) => {
    const playerNode: CustomNode = {
      play,
      x: play.x_coord * xScale,
      y: play.y_coord * yScale,
      color: EVENT_COLORS[play.event],
    };

    if (currentIndex > 0) {
      const pastLink: CustomLink = {
        source: currentGraph.nodes[currentGraph.nodes.length - 1],
        target: playerNode,
        color: 'grey',
      };

      currentGraph.links.push(pastLink);
    }

    currentGraph.nodes.push(playerNode);

    if (play.event === 'Play' || play.event === 'Incomplete Play') {
      const receiverNode: CustomNode = {
        play,
        x: play.x_coord_2 * xScale,
        y: play.y_coord_2 * yScale,
        color: EVENT_COLORS[play.event],
      };

      const passLink: CustomLink = {
        source: playerNode,
        target: receiverNode,
        dashed: play.detail_1 === 'Indirect',
        color: EVENT_COLORS[play.event],
      };

      currentGraph.nodes.push(receiverNode);
      currentGraph.links.push(passLink);
    }

    return currentGraph;
  }, {
    nodes: [],
    links: [],
  } as CustomGraph);

  const annotationNode = graph.nodes.find((node) => node.play === selectedPlay);

  const nodeComponent = ({ node }: any) => (
    <DefaultNode
      r={8}
      fill={node.color ?? 'grey'}
      onClick={() => {
        onPlaySelected(node.play);
      }}
    />
  );

  const linkComponent = ({
    link: {
      source, target, dashed, color,
    },
  }: any) => (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={4}
      stroke={color}
      strokeOpacity={0.6}
      strokeDasharray={dashed ? '8,4' : undefined}
      markerEnd={source.x === target.x ? '' : 'url(#arrow)'}
    />
  );

  // const graph = {
  //   nodes,
  //   links,
  // };

  // const handleMouseMove = useCallback(
  //   (event: React.MouseEvent | React.TouchEvent) => {
  //     if (tooltipTimeout) clearTimeout(tooltipTimeout);
  //     if (!svgRef.current) return;

  //     // find the nearest polygon to the current mouse position
  //     const point = localPoint(svgRef.current, event);
  //     if (!point) return;
  //     const neighborRadius = 100;
  //     const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
  //     if (closest) {
  //       showTooltip({
  //         tooltipLeft: xScale(x(closest.data)),
  //         tooltipTop: yScale(y(closest.data)),
  //         tooltipData: closest.data,
  //       });
  //     }
  //   },
  //   [xScale, yScale, showTooltip, voronoiLayout],
  // );

  // const handleMouseLeave = useCallback(() => {
  //   tooltipTimeout = window.setTimeout(() => {
  //     hideTooltip();
  //   }, 300);
  // }, [hideTooltip]);

  return (
    <svg width={200 * xScale} height={85 * yScale} overflow="visible">
      <IceRink y={-2} />
      {graph && annotationNode && (
        <>
          <Graph<CustomLink, CustomNode>
            graph={graph}
            nodeComponent={nodeComponent}
            linkComponent={linkComponent}
          />
          {/* {circles} */}
          <EditableAnnotation
            width={10}
            height={10}
            x={annotationNode.x}
            y={annotationNode.y}
            dx={20} // x offset of label from subject
            dy={20} // y offset of label from subject
            canEditLabel={false}
            canEditSubject={false}
          >
            {/* <Connector /> */}
            <CircleSubject strokeWidth={2} />
            {/* <Label title={annotationNode.title} subtitle={annotationNode.subtitle} /> */}
          </EditableAnnotation>
          <defs>
            <marker
              id="arrow"
              viewBox="0 -5 10 10"
              refX="15"
              refY="0"
              orient="auto"
              fill="grey"
            >
              <path d="M0,-5L10,0L0,5" />
            </marker>
          </defs>
        </>
      )}
    </svg>
  );
}
