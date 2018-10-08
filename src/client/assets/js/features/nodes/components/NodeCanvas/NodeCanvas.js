import React, { Component, PropTypes } from 'react';
import { DragLayer } from 'react-dnd';
import { connect } from 'react-redux';
import Node from '../svg/Node';
import Link from '../svg/Link';
import Badge from '../svg/Badge';

import { createSelector } from 'reselect'
import { actionCreators as nodeActions } from '../../actions';
import { actionCreators as mouseActions } from 'features/mouse';
import { DropTarget } from 'react-dnd';
//import * as NodeMouseActions from '../actions/NodeMouseActions';
//import * as MouseActions from '../actions/MouseActions';


import { bindActionCreators } from 'redux';

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };

}

const canvasTarget = {
  drop(props, monitor) {
    const item = monitor.getItem();
    const { x, y } = monitor.getSourceClientOffset()
    item.handleDrop(x, y);
  }
};

const ItemTypes = {
  NODE: 'node'
};


class NodeCanvas extends Component {

  static contextTypes = {
    store: React.PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = { mousePressed: false };
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this.mouseMove = bindActionCreators(mouseActions.mouseMove, this.props.dispatch);
    this.mouseDown = bindActionCreators(mouseActions.mouseDown, this.props.dispatch);
    this.mouseUp = bindActionCreators(mouseActions.mouseUp, this.props.dispatch);



    /*this.scroll = bindActionCreators(MouseActions.scroll, this.props.dispatch);
  	this.linkSelected = bindActionCreators(linkSelected, this.props.dispatch);*/
  }

  render() {

    console.log("in render node canvas");
    const { nodes, configs, links, connectDropTarget, w, h } = this.props;
    const { store } = this.context;

    const _nodes = nodes.map((id) => {
      return <Node key={id} id={id} />
    })

    const _configs = configs.map((config, i) => {
      const elementprops = {
        store,
        id: config.id,
      }


      return <div key={i}>
        {React.createElement(config.fn, { ...elementprops })}
      </div>
    })
    const _links = links.map((id) => {
      return <Link key={id} id={id} />
    })

    const _badges = links.map((id) => {
      return <Badge key={id} id={id} />
    })

    const chartstyle = {
      overflow: "hidden",
      width: w,
      height: h,
    }

    return connectDropTarget(<div id="chart" onMouseMove={this._onMouseMove} onMouseUp={this._onMouseUp} onMouseDown={this._onMouseDown} style={chartstyle}>
      <svg id="svgchart" width={w} height={h}>
        {_links}
        {_nodes}
        {_badges}
      </svg>
      {_configs}
    </div>);
  }

  _onScroll(e) {
    this.scroll(e.target.scrollTop);
  }

  _onMouseMove(e) {
    const { clientX, clientY } = e;
    //only ever interested in the mouse move event if dragging!
    if (this.state.mousePressed) {
      this.mouseMove(clientX, clientY);
    }
  }


  //maybe check on mouse out??

  _onMouseDown(e) {
    this.setState({ mousePressed: true });
    this.mouseDown(e);
  }

  _onMouseUp(e) {
    this.setState({ mousePressed: false });
    this.mouseUp(e);
  }
}

const getTab = (state) => state.workspace.current;
//const getNodes = (state) => state.nodes.nodesById;
const getLinks = (state) => state.ports.links;

/*const getVisibleNodes = createSelector(
	[getTab, getNodes],
	(tab, nodes)=>{
		return Object.keys(nodes).reduce((acc,key)=>{
        const node = nodes[key]; 
    		return tab ? tab.id === node.z : false
    	},[]);
	}
);*/

const getVisibleLinks = createSelector(
  [getTab, getLinks],
  (tab, links) => {
    return links.filter((link) => {
      return tab ? tab.id === link.source.z : false
    });
  }
);

function select(state) {
  const tabId = state.workspace.currentId;
  //TODO: - hacky - this needs to be in secltors of corresponding reducers
  return {
    configs: Object.keys(state.nodes.nodesById).reduce((acc, key) => {
      const n = state.nodes.nodesById[key];
      if (n.z === tabId) {
        acc.push(state.nodes.configsById[n.id]);
      }
      return acc;
    }, []),
    nodes: Object.keys(state.nodes.nodesById).reduce((acc, key) => {
      const n = state.nodes.nodesById[key];
      if (n.z === tabId) {
        acc.push(n.id);
      }
      return acc;
    }, []),
    links: Object.keys(state.ports.linksById).reduce((acc, key) => {
      const l = state.ports.linksById[key];
      if (l.source.z === tabId) {
        acc.push(l.id);
      }
      return acc;
    }, []),
    w: state.editor.screen.w,
    h: state.editor.screen.h,
  };
}

export default connect(select)(DropTarget(ItemTypes.NODE, canvasTarget, collect)(NodeCanvas));
//export default connect(mapStateToProps)(DragLayer(collect)(NodeCanvas))