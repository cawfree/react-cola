import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import * as cola from 'webcola';

const Layout = ({
  nodes,
  links,
  groups,
  linkDistance,
  avoidOverlaps,
  handleDisconnected,
  constraints,
  width,
  height,
  onStart,
  onTick,
  onEnd,
  renderLayout,
  ...extraProps
}) => {
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    throw new Error(
      `Expected valid [width, height], encountered [${width}, ${height}].`,
    );
  }
  const [ diagram, setDiagram ] = useState(null);
  const [ ReactColaLayout ] = useState(
    () => class ReactColaLayout extends cola.Layout {
      kick() {
        requestAnimationFrame(
          () => !this.tick() && this.kick(),
        );
      }
    }
  );
  const [ layout ] = useState(
    () => new ReactColaLayout()
      .nodes(nodes)
      .links(links)
      .groups(groups)
      .linkDistance(linkDistance)
      .avoidOverlaps(avoidOverlaps)
      .handleDisconnected(handleDisconnected)
      .constraints(constraints)
      .size([width, height])
      .on(cola.EventType.start, onStart)
      .on(
        cola.EventType.tick,
        (e) => {
          setDiagram(cloneDeep(layout));
          return onTick(e);
        },
      )
      .on(cola.EventType.end, onEnd),
  );
  useEffect(
    () => layout.start() && undefined,
    [layout],
  );
  return (
    <React.Fragment
    >
      {(!!diagram) && renderLayout(diagram)}
    </React.Fragment>
  );
};

Layout.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape(
      {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        Component: PropTypes.elementType,
      },
    ),
  ),
  links: PropTypes.arrayOf(
    PropTypes.shape(
      {
        source: PropTypes.number.isRequired,
        target: PropTypes.number.isRequired,
      },
    ),
  ),
  groups: PropTypes.arrayOf(
    PropTypes.shape(
      {
        leaves: PropTypes.arrayOf(PropTypes.number),
        groups: PropTypes.arrayOf(PropTypes.number),
      },
    ),
  ),
  linkDistance: PropTypes.number,
  avoidOverlaps: PropTypes.bool,
  handleDisconnected: PropTypes.bool,
  constraints: PropTypes.arrayOf(
    PropTypes.shape({}),
  ),
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onStart: PropTypes.func,
  onTick: PropTypes.func,
  onEnd: PropTypes.func,
  renderLayout: PropTypes.func.isRequired,
};

Layout.defaultProps = {
  nodes: [],
  links: [],
  groups: [],
  linkDistance: 100,
  avoidOverlaps: true,
  handleDisconnected: false,
  constraints: [],
  onStart: e => null,
  onTick: e => null,
  onEnd: e => null,
};

export default Layout;
