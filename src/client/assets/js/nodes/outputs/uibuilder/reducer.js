import { combineReducers } from 'redux';
import editor, {NAME as editorName} from './features/editor';
import canvas, {NAME as canvasName} from './features/canvas';
import palette, {NAME as paletteName} from './features/palette';

export default combineReducers({
  [editorName]: editor,
  [canvasName]: canvas,
  [paletteName]: palette,
});