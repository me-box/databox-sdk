import React from 'react';
import { render } from 'react-dom';
import {actionConstants as nodeActionTypes} from "./constants";
import { NODE_WIDTH, MOUSE_X_OFFSET, MOUSE_Y_OFFSET} from 'constants/ViewConstants';
import {getID, addViewProperties, lookup} from 'utils/nodeUtils';
import {calculateTextWidth, toggleItem} from 'utils/utils';
import {scopeify} from 'utils/scopeify';
import {register,unregister,unregisterAll} from 'app/store/configureStore';


function loadNode({component,node,reducer}){
  return function(dispatch, getState){
      
     

      const _node = Object.assign({},node, {schema: _schema(node), description:_description(node._def)});
      

      addViewProperties(_node);
    
    
      if (reducer){
        register(_node.id, scopeify(_node.id, reducer));
      }

      dispatch({type: nodeActionTypes.NODE_DROPPED, node:_node, config:{id: _node.id, fn:component}});
  };
}

function _schema(node){
  
   if (node._def.schemakey && (typeof node._def.schemakey !== "undefined")){
      if (node._def.schemafn){
        return node._def.schemafn(node[node._def.schemakey], node.id);
      }
   }
   console.log("in scahme with node", node)

   return _defaultschema(node._def, node.id);
}

function _defaultschema(def,id){  
 console.log("in default schema!", id);
  if (def.schemakey){
      
      const key = def.defaults[def.schemakey];

      if (key && (typeof key.value !== "undefined")){
          if (def.schemafn){
            return def.schemafn(key.value,id);
          }
      }
  }
  return def.schemafn ? def.schemafn() : {}
}

function _description(def){

  if (def.nodetype==="dbfunction"){
    JSON.stringify(def.defaults, null, 4);

  }

  if (def.schemakey){
      const key = def.defaults[def.schemakey];
      if (key && key.value){
          if (def.descriptionfn){
              return def.descriptionfn(key.value);
          }
      }
  }
  return def.descriptionfn ? def.descriptionfn() : {}
}

function dropNode({component, nt, def, reducer}, x0, y0){
  
  
  return function(dispatch, getState){


    //adjust x and y for offsets
    const x = x0 + MOUSE_X_OFFSET + NODE_WIDTH/2;
    const y = y0 + MOUSE_Y_OFFSET + getState().mouse.top + NODE_WIDTH/2;
   

    if (x < 0){
      return;
    }

    let _def = Object.assign({},def);
    const id = getID();

    const node = {
      id,
      type: nt,
      _def: _def,
      _: (id)=>{return id},
      inputs: _def.inputs || 0,
      outputs: _def.outputs,
      schema: _defaultschema(_def,id),
      description: _description(_def),
      changed: true,
      selected: true,
      dirty: true,
      x: x, 
      y: y, 
      z: getState().workspace.currentId,
    }
 
    //so old nodes that are loaded won't necessarily have the new defaults!
    for (var d in node._def.defaults) {
      if (node._def.defaults.hasOwnProperty(d)) {
        node[d] = node._def.defaults[d].value;
      }
    }

    addViewProperties(node);
    
    //might need to make this a separate action?
    //register this reducer and force nodeid to be passed in when state changes.  scopeify will ignore any actions that do not have this node's id as a parameter
    //this means that instances of the same node can transparently make use of the same action constants without a clash!.
    if (reducer){
      register(node.id, scopeify(node.id, reducer));
    }

      
    dispatch({type: nodeActionTypes.NODE_DROPPED, node, config:{id: node.id, fn:component}});
    
    //console.log("create element");
    //console.log(element);
    //const root = document.getElementById('main-container');
     
    //  root.appendChild(g);

    //const g = document.createElement('div');
    //g.id = `config-${node.id}`;
    //root.appendChild(g);
    //document.body.appendChild(g);
    //render(element, document.getElementById(`config-${node.id}`));
    //dispatch(editorActions.closeAll());
  }
}

function initNodeKeys(keys){
  return {
    type: nodeActionTypes.NODE_INIT_VALUES,
    keys
  }
}

function updateNode(property, value){
 
  return {
    type: nodeActionTypes.NODE_UPDATE_VALUE,
    property,
    value,
  }
}

function updateNodeValueKey(property, key, value){

  return {
    type: nodeActionTypes.NODE_UPDATE_VALUE_KEY,
    property,
    key,
    value,
  }
}

function incrementNodeValueKey(property, key, amount, min, max){
  return {
    type: nodeActionTypes.NODE_INCREMENT_VALUE_KEY,
    property,
    key,
    amount,
    min,
    max,
  }
}

function updateSchema(id, schema){
  return {
    type: nodeActionTypes.NODE_UPDATE_SCHEMA,
    id,
    schema,
  }
}

function updateDescription(id, description){
  return {
    type: nodeActionTypes.NODE_UPDATE_DESCRIPTION,
    id,
    description,
  }
}


function nodeMouseDown(id){
     
  return function(dispatch, getState){
 
    dispatch ({
        type: nodeActionTypes.NODE_MOUSE_DOWN,
        id
    })
  }
} 

function nodeDoubleClicked(id){

  //TODO: WHY TWO EVENTS HERE?
  return function(dispatch, getState) {

    dispatch({
      type: nodeActionTypes.NODE_DOUBLE_CLICKED,
      id,
    });
    
    dispatch({
      type: nodeActionTypes.NODE_CONFIGURE,
      id
    });

  }
} 

function nodeConfigureOk(){
    
    return {
      type: nodeActionTypes.NODE_CONFIGURE_OK,
    }
} 

function nodeConfigureCancel(){
    return {
      type: nodeActionTypes.NODE_CONFIGURE_CANCEL,
    }
}

function nodeDelete(){
    //TODO; delete registration!
    return ((dispatch, getState)=>{
      unregister(getState().nodes.selectedId);
      dispatch({type: nodeActionTypes.NODE_DELETE});
    });
}

function clearNodes(){
  unregisterAll();
  return {
      type: nodeActionTypes.NODE_CLEAR_ALL,
  }
}

function nodeDeselected(){
  return {
      type: nodeActionTypes.NODE_DESELECTED,
  }
}


function deleteTab(id){
    return {
        type: nodeActionTypes.TAB_DELETE,
        id
    }
}

function mouseMove(x,y){
  
  return {
     type: nodeActionTypes.MOUSE_MOVE,
     x,
     y,
  }
}

function nodeMouseUp(){
 
    return {
      type:nodeActionTypes.MOUSE_UP,
    }
}



function receiveFlows(nodes){
  
  return ((dispatch, getState)=>{
    
      const lookuptype = lookup.bind(null,getState().palette.types)
      const _nodes = nodes.map((node)=>{
         const {component,reducer} = lookuptype(node.type)
         dispatch(loadNode({component, node, reducer}));
      });
  });
 
  return {
      type: nodeActionTypes.RECEIVE_FLOWS,
      nodes,
  }
}


export const actionCreators = {
  dropNode,
  initNodeKeys,
  updateNode,
  clearNodes,
  updateNodeValueKey,
  incrementNodeValueKey,
  updateSchema,
  updateDescription,
  nodeMouseDown,
  nodeMouseUp,
  nodeDoubleClicked,
  nodeConfigureOk,
  nodeConfigureCancel,
  deleteTab,
  mouseMove,
  //mouseUp,
  nodeDelete,
  nodeDeselected,
  receiveFlows,
}