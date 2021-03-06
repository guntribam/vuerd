import { Command } from "../Command";
import { Store } from "../Store";
import { Logger } from "../Logger";
import {
  ShowKey,
  Database,
  CanvasType,
  Language,
  NameCase,
  ColumnType,
} from "../store/Canvas";
import { relationshipSort } from "../helper/RelationshipHelper";

export interface MoveCanvas {
  scrollTop: number;
  scrollLeft: number;
}
export function moveCanvas(
  scrollTop: number,
  scrollLeft: number
): Command<"canvas.move"> {
  return {
    type: "canvas.move",
    data: {
      scrollTop,
      scrollLeft,
    },
  };
}
export function executeMoveCanvas(store: Store, data: MoveCanvas) {
  Logger.debug("executeMoveCanvas");
  const { canvasState } = store;
  canvasState.scrollTop = data.scrollTop;
  canvasState.scrollLeft = data.scrollLeft;
}

export interface ResizeCanvas {
  width: number;
  height: number;
}
export function resizeCanvas(
  width: number,
  height: number
): Command<"canvas.resize"> {
  return {
    type: "canvas.resize",
    data: {
      width,
      height,
    },
  };
}
export function executeResizeCanvas(store: Store, data: ResizeCanvas) {
  Logger.debug("executeResizeCanvas");
  const { canvasState } = store;
  canvasState.width = data.width;
  canvasState.height = data.height;
}

export interface ChangeCanvasShow {
  showKey: ShowKey;
  value: boolean;
}
export function changeCanvasShow(
  store: Store,
  showKey: ShowKey
): Command<"canvas.changeShow"> {
  const { show } = store.canvasState;
  return {
    type: "canvas.changeShow",
    data: {
      showKey,
      value: !show[showKey],
    },
  };
}
export function executeChangeCanvasShow(store: Store, data: ChangeCanvasShow) {
  Logger.debug("executeChangeCanvasShow");
  const { tables } = store.tableState;
  const { relationships } = store.relationshipState;
  const { show } = store.canvasState;
  show[data.showKey] = data.value;
  relationshipSort(tables, relationships);
}

export interface ChangeDatabase {
  database: Database;
}
export function changeDatabase(
  database: Database
): Command<"canvas.changeDatabase"> {
  return {
    type: "canvas.changeDatabase",
    data: {
      database,
    },
  };
}
export function executeChangeDatabase(store: Store, data: ChangeDatabase) {
  Logger.debug("executeChangeDatabase");
  store.canvasState.database = data.database;
}

export interface ChangeDatabaseName {
  value: string;
}
export function changeDatabaseName(
  value: string
): Command<"canvas.changeDatabaseName"> {
  return {
    type: "canvas.changeDatabaseName",
    data: {
      value,
    },
  };
}
export function executeChangeDatabaseName(
  store: Store,
  data: ChangeDatabaseName
) {
  Logger.debug("executeChangeDatabaseName");
  store.canvasState.databaseName = data.value;
}

export interface ChangeCanvasType {
  canvasType: CanvasType;
}
export function changeCanvasType(
  canvasType: CanvasType
): Command<"canvas.changeCanvasType"> {
  return {
    type: "canvas.changeCanvasType",
    data: {
      canvasType,
    },
  };
}
export function executeChangeCanvasType(store: Store, data: ChangeCanvasType) {
  Logger.debug("executeChangeCanvasType");
  store.canvasState.canvasType = data.canvasType;
}

export interface ChangeLanguage {
  language: Language;
}
export function changeLanguage(
  language: Language
): Command<"canvas.changeLanguage"> {
  return {
    type: "canvas.changeLanguage",
    data: {
      language,
    },
  };
}
export function executeChangeLanguage(store: Store, data: ChangeLanguage) {
  Logger.debug("executeChangeLanguage");
  store.canvasState.language = data.language;
}

export interface ChangeNameCase {
  nameCase: NameCase;
}

export function changeTableCase(
  nameCase: NameCase
): Command<"canvas.changeTableCase"> {
  return {
    type: "canvas.changeTableCase",
    data: {
      nameCase,
    },
  };
}
export function executeChangeTableCase(store: Store, data: ChangeNameCase) {
  Logger.debug("executeChangeTableCase");
  store.canvasState.tableCase = data.nameCase;
}

export function changeColumnCase(
  nameCase: NameCase
): Command<"canvas.changeColumnCase"> {
  return {
    type: "canvas.changeColumnCase",
    data: {
      nameCase,
    },
  };
}
export function executeChangeColumnCase(store: Store, data: ChangeNameCase) {
  Logger.debug("executeChangeColumnCase");
  store.canvasState.columnCase = data.nameCase;
}

export interface ChangeRelationshipDataTypeSync {
  value: boolean;
}
export function changeRelationshipDataTypeSync(
  value: boolean
): Command<"canvas.changeRelationshipDataTypeSync"> {
  return {
    type: "canvas.changeRelationshipDataTypeSync",
    data: {
      value,
    },
  };
}
export function executeChangeRelationshipDataTypeSync(
  store: Store,
  data: ChangeRelationshipDataTypeSync
) {
  Logger.debug("executeChangeRelationshipDataTypeSync");
  store.canvasState.setting.relationshipDataTypeSync = data.value;
}

export interface MoveColumnOrder {
  columnType: ColumnType;
  targetColumnType: ColumnType;
}
export function moveColumnOrder(
  columnType: ColumnType,
  targetColumnType: ColumnType
): Command<"canvas.moveColumnOrder"> {
  return {
    type: "canvas.moveColumnOrder",
    data: {
      columnType,
      targetColumnType,
    },
  };
}
export function executeMoveColumnOrder(store: Store, data: MoveColumnOrder) {
  Logger.debug("executeMoveColumnOrder");
  const { columnOrder } = store.canvasState.setting;
  if (data.columnType !== data.targetColumnType) {
    const targetIndex = columnOrder.indexOf(data.targetColumnType);
    const currentIndex = columnOrder.indexOf(data.columnType);
    if (targetIndex !== -1 && currentIndex !== -1) {
      columnOrder.splice(currentIndex, 1);
      columnOrder.splice(targetIndex, 0, data.columnType);
    }
  }
}
