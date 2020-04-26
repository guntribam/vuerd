import { Store } from "../Store";
import { Table, Column } from "../store/Table";
import { Relationship } from "../store/Relationship";
import { getData, uuid, autoName } from "../Helper";
import {
  formatNames,
  formatSize,
  formatSpace,
  primaryKey,
  primaryKeyColumns,
  unique,
  uniqueColumns,
  MaxLength,
  Name,
  KeyColumn,
} from "../helper/SQLHelper";
import { orderByNameASC } from "../helper/TableHelper";

export function createDDL(store: Store): string {
  const fkNames: Name[] = [];
  const stringBuffer: string[] = [""];
  const tables = orderByNameASC(store.tableState.tables);
  const relationships = store.relationshipState.relationships;

  tables.forEach((table) => {
    formatTable(table, stringBuffer);
    stringBuffer.push("");
    // unique
    if (unique(table.columns)) {
      const uqColumns = uniqueColumns(table.columns);
      uqColumns.forEach((column) => {
        stringBuffer.push(`ALTER TABLE ${table.name}`);
        stringBuffer.push(
          `  ADD CONSTRAINT UQ_${column.name} UNIQUE (${column.name})\nGO`
        );
        stringBuffer.push("");
      });
    }
    formatComment(table, stringBuffer);
  });
  relationships.forEach((relationship) => {
    formatRelation(tables, relationship, stringBuffer, fkNames);
    stringBuffer.push("");
  });

  return stringBuffer.join("\n");
}

function formatTable(table: Table, buffer: string[]) {
  buffer.push(`CREATE TABLE ${table.name}`);
  buffer.push(`(`);
  const pk = primaryKey(table.columns);
  const spaceSize = formatSize(table.columns);

  table.columns.forEach((column, i) => {
    if (pk) {
      formatColumn(column, true, spaceSize, buffer);
    } else {
      formatColumn(column, table.columns.length !== i + 1, spaceSize, buffer);
    }
  });
  // PK
  if (pk) {
    const pkColumns = primaryKeyColumns(table.columns);
    buffer.push(
      `  CONSTRAINT PK_${table.name} PRIMARY KEY (${formatNames(pkColumns)})`
    );
  }
  buffer.push(`)\nGO`);
}

function formatColumn(
  column: Column,
  isComma: boolean,
  spaceSize: MaxLength,
  buffer: string[]
) {
  const stringBuffer: string[] = [];
  stringBuffer.push(
    `  "${column.name}"` + formatSpace(spaceSize.name - column.name.length)
  );
  stringBuffer.push(
    `${column.dataType}` +
      formatSpace(spaceSize.dataType - column.dataType.length)
  );
  if (column.option.notNull) {
    stringBuffer.push(`NOT NULL`);
  }
  if (column.option.autoIncrement) {
    stringBuffer.push(`IDENTITY(1,1)`);
  } else {
    if (column.default.trim() !== "") {
      stringBuffer.push(`DEFAULT ${column.default}`);
    }
  }
  buffer.push(stringBuffer.join(" ") + `${isComma ? "," : ""}`);
}

function formatComment(table: Table, buffer: string[]) {
  if (table.comment.trim() !== "") {
    buffer.push(`EXECUTE sys.sp_addextendedproperty 'MS_Description',`);
    buffer.push(
      `  '${table.comment}', 'user', dbo, 'table', '${table.name}'\nGO`
    );
    buffer.push("");
  }
  table.columns.forEach((column) => {
    if (column.comment.trim() !== "") {
      buffer.push(`EXECUTE sp_addextendedproperty 'MS_Description',`);
      buffer.push(
        `  '${column.comment}', 'user', dbo, 'table', '${table.name}', 'column', '${table.name}'\nGO`
      );
      buffer.push("");
    }
  });
}

function formatRelation(
  tables: Table[],
  relationship: Relationship,
  buffer: string[],
  fkNames: Name[]
) {
  const startTable = getData(tables, relationship.start.tableId);
  const endTable = getData(tables, relationship.end.tableId);

  if (startTable && endTable) {
    buffer.push(`ALTER TABLE ${endTable.name}`);

    // FK
    let fkName = `FK_${startTable.name}_TO_${endTable.name}`;
    fkName = autoName(fkNames, "", fkName);
    fkNames.push({
      id: uuid(),
      name: fkName,
    });

    buffer.push(`  ADD CONSTRAINT ${fkName}`);

    // key
    const columns: KeyColumn = {
      start: [],
      end: [],
    };
    relationship.end.columnIds.forEach((columnId) => {
      const column = getData(endTable.columns, columnId);
      if (column) {
        columns.end.push(column);
      }
    });
    relationship.start.columnIds.forEach((columnId) => {
      const column = getData(startTable.columns, columnId);
      if (column) {
        columns.start.push(column);
      }
    });

    buffer.push(`    FOREIGN KEY (${formatNames(columns.end)})`);
    buffer.push(
      `    REFERENCES ${startTable.name} (${formatNames(columns.start)})\nGO`
    );
  }
}
