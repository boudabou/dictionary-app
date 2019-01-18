import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

const selectRowProp = {
  mode: "checkbox"
};

const cellEditProps = {
  mode: "click",
  blurToSave: true
};

class EditColumnClassTable extends Component {
  state = {
    data: [
      /*{
        id: "0",
        domain: "d1",
        range: "r1"
      },
      { id: "1", domain: "d2", range: "r2" },
      { id: "2", domain: "d3", range: "r3" },
      { id: "3", domain: "d4", range: "r4" },
      { id: "4", domain: "d5", range: "r5" }*/
    ],
    conflicts: []
  };

  formatter(val, type) {
    if (type === "normal") {
      return (
        <div>
          <strong style={{ color: "grey", fontSize: 14 }}>{val}</strong>
        </div>
      );
    } else {
      let colour = "grey";
      if (type === "special1") colour = "#ffaa00";
      if (type === "special2") colour = "red";
      return (
        <div>
          <strong style={{ color: colour, fontSize: 20 }}>{val}</strong>
        </div>
      );
    }
  }

  domainFormatter(cell, row) {
    for (var conf in this.state.conflicts) {
      if (
        this.state.conflicts[conf].column === "domain" &&
        this.state.conflicts[conf].value === row.domain
      ) {
        return this.formatter(
          row.domain,
          "special" + this.state.conflicts[conf].importance
        );
      }
    }
    return this.formatter(row.domain, "normal");
  }

  rangeFormatter(cell, row) {
    for (var conf in this.state.conflicts) {
      if (
        this.state.conflicts[conf].column === "range" &&
        this.state.conflicts[conf].value === row.range
      ) {
        return this.formatter(
          row.range,
          "special" + this.state.conflicts[conf].importance
        );
      }
    }
    return this.formatter(row.range, "normal");
  }

  idFormatter(cell, row) {
    return this.formatter(row.id, "normal");
  }
  onAfterDeleteRow(rowKeys) {
    var newData = [];
    for (var entry in this.state.data) {
      let idx = rowKeys.indexOf(this.state.data[entry].id);
      if (idx === -1) {
        newData.push(this.state.data[entry]);
      }
    }
    let newState = this.state;
    newState.data = newData;
    this.setState(newState);
  }

  onAfterInsertRow(row) {
    let newState = this.state;
    newState.data.push(row);
    this.setState(newState);
  }

  rangeValidator(value, row) {
    const newState = this.state;
    newState.conflicts = [];
    this.setState(newState);

    const domains = [];
    const ranges = [];
    for (var entry in this.state.data) {
      if (!(row.id === this.state.data[entry].id)) {
        domains.push(this.state.data[entry].domain);
        ranges.push(this.state.data[entry].range);
      }
    }
    const response = {
      isValid: true,
      notification: { type: "success", msg: "", title: "", importance: 0 },
      conflicts: []
    };
    if (!value) {
      response.isValid = false;
      response.notification.type = "error";
      response.notification.msg = "Value must be inserted";
      response.notification.title = "Requested Value";
      response.notification.importance = 1;
    } else {
      const index = domains.indexOf(value);
      if (index > -1) {
        response.isValid = false;
        response.notification.type = "error";
        response.notification.msg =
          "The range " + value + " chains with an existing domain";
        response.notification.title = "Chain error";
        response.notification.importance = 2;
        this.state.conflicts.push({
          value: value,
          column: "domain",
          importance: response.notification.importance
        });
      }
    }
    this.setState(this.state);

    return response;
  }

  domainValidator(value, row) {
    const newState = this.state;
    newState.conflicts = [];
    this.setState(newState);

    const domains = [];
    const ranges = [];
    for (var entry in this.state.data) {
      if (!(row.id === this.state.data[entry].id)) {
        domains.push(this.state.data[entry].domain);
        ranges.push(this.state.data[entry].range);
      }
    }
    const response = {
      isValid: true,
      notification: { type: "success", msg: "", title: "", importance: 0 },
      conflicts: []
    };
    if (!value) {
      response.isValid = false;
      response.notification.type = "error";
      response.notification.msg = "Value must be inserted";
      response.notification.title = "Requested Value";
      response.notification.importance = 1;
    } else {
      const index = domains.indexOf(value);
      if (index > -1) {
        response.isValid = false;
        response.notification.type = "error";
        response.notification.msg = "The entred domain alreay exists";
        response.notification.title = "Duplicated domain " + value;
        response.notification.importance = 1;
        this.state.conflicts.push({
          value: value,
          column: "domain",
          importance: response.notification.importance
        });
      } else {
        let index = ranges.indexOf(value);
        if (index > -1) {
          response.isValid = false;
          response.notification.type = "error";
          response.notification.msg =
            "The domain " + value + " chains with an existing range";
          response.notification.title = "Chain error";
          response.notification.importance = 2;
          this.state.conflicts.push({
            value: value,
            column: "range",
            importance: response.notification.importance
          });
        }
      }
    }
    this.setState(this.state);

    return response;
  }

  constructor() {
    super();
    this.onAfterDeleteRow = this.onAfterDeleteRow.bind(this);
    this.onAfterInsertRow = this.onAfterInsertRow.bind(this);
    this.domainValidator = this.domainValidator.bind(this);
    this.rangeValidator = this.rangeValidator.bind(this);
    this.formatter = this.formatter.bind(this);
    this.domainFormatter = this.domainFormatter.bind(this);
    this.rangeFormatter = this.rangeFormatter.bind(this);
    this.idFormatter = this.idFormatter.bind(this);
  }

  render() {
    return (
      <React.Fragment>
        <BootstrapTable
          data={this.state.data}
          cellEdit={cellEditProps}
          insertRow={true}
          search={true}
          options={{
            afterInsertRow: this.onAfterInsertRow,
            afterDeleteRow: this.onAfterDeleteRow
          }}
          deleteRow={true}
          selectRow={selectRowProp}
        >
          <TableHeaderColumn dataField="id" isKey dataFormat={this.idFormatter}>
            ID
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="domain"
            dataFormat={this.domainFormatter}
            editable={{ validator: this.domainValidator }}
          >
            Domain
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="range"
            editable={{ validator: this.rangeValidator }}
            dataFormat={this.rangeFormatter}
          >
            Range
          </TableHeaderColumn>
        </BootstrapTable>
      </React.Fragment>
    );
  }
}

export default EditColumnClassTable;
