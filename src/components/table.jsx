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
    tab_id: null,
    button_group_id: null,
    error_id: null,
    error_div_id: null,
    button_check_prefix: null,
    low_opacity: 0.5,
    high_opacity: 1,
    data: [],
    conflicts: { chains: [], duplicates: [] }
  };

  getDomainRangeForId(id) {
    var entry = this.state.data[this.state.data.findIndex(a => a.id === id)];
    return [entry.domain, entry.range];
  }

  onAfterDeleteRow(rowKeys) {
    var newData = [];
    var newDuplicates = [];
    for (var entry in this.state.data) {
      let idx = rowKeys.indexOf(this.state.data[entry].id);
      if (idx === -1) {
        newData.push(this.state.data[entry]);
      } else {
        var element = document.getElementById(
          this.state.button_check_prefix + this.state.data[entry].id
        );
        element.parentNode.removeChild(element);
      }
    }
    for (var dup in this.state.conflicts.duplicates) {
      var dup_ = this.state.conflicts.duplicates[dup];
      dup_ = dup_.filter(function(value, index, arr) {
        return rowKeys.indexOf(value) === -1;
      });
      if (dup_.length > 0) newDuplicates.push(dup_);
    }
    let newState = this.state;
    newState.data = newData;
    newState.conflicts.duplicates = newDuplicates;
    this.computeChains();
    this.setState(newState);
    setTimeout(() => {
      this.resetButtons();
    }, 200);
  }

  onAfterInsertRow(row) {
    let newState = this.state;
    newState.data.push(row);
    this.updateConflicts(row);
    this.setState(newState);
    this.computeChains();
    this.addButton(row.id);
  }

  computeChains() {
    var chains = [];
    for (var entry in this.state.data) {
      var left = this.state.data[entry];
      for (var entry2 in this.state.data) {
        var right = this.state.data[entry2];
        if (left.id === right.id) continue;
        if (left.range === right.domain) {
          chains.push([left.id, right.id]);
        }
      }
    }
    let test = true;

    while (test) {
      var newChains = [];
      var inspectedIndices = [];
      test = false;
      for (var chain1 in chains) {
        if (inspectedIndices.includes(chain1)) continue;
        for (var chain2 in chains) {
          if (chain2 <= chain1 || inspectedIndices.includes(chain2)) continue;
          var chain1_ = chains[chain1];
          var chain2_ = chains[chain2];
          if (chain1_[0] === chain2_[chain2_.length - 1]) {
            var left = chain2_[0];
            var right = chain1_[chain1_.length - 1];
            chain1_.shift();
            newChains.push(chain2_.concat(chain1_));
            test = true;
            inspectedIndices = inspectedIndices.concat([chain1, chain2]);
            continue;
          }

          if (chain1_[chain1_.length - 1] === chain2_[0]) {
            chain2_.shift();
            newChains.push(chain1_.concat(chain2_));
            test = true;
            inspectedIndices = inspectedIndices.concat([chain1, chain2]);
            continue;
          }
        }
      }
      for (var chain in chains) {
        if (!inspectedIndices.includes(chain)) {
          newChains.push(chains[chain]);
        }
      }
      chains = newChains;
    }

    var chainsToProcess = chains;
    newChains = [];

    var i = 0;
    while (chainsToProcess.length > 0 && i < 10) {
      i += 1;
      chain = chainsToProcess.pop();
      if (chain[0] === chain[chain.length - 1]) {
        newChains.push(chain);
        continue;
      }
      var containsLoop = false;

      for (var idx in chain) {
        var node = chain[idx];
        var idx2 = chain.slice(idx + 1, chain.length).indexOf(node);
        if (idx2 > 0) {
          idx2 = parseInt(idx2) + parseInt(idx) + 1;
          var subchain1 = chain.slice(0, idx + 1);
          if (subchain1.length > 1) chainsToProcess.push(subchain1);
          var subchain2 = chain.slice(idx, idx2 + 1);
          if (subchain2.length > 1) chainsToProcess.push(subchain2);
          var subchain3 = chain.slice(idx2, chain.length);
          if (subchain3.length > 1) chainsToProcess.push(subchain3);
          containsLoop = true;
          break;
        }
      }
      if (!containsLoop) newChains.push(chain);
    }

    //this.state.conflicts.loops = loops;
    this.state.conflicts.chains = newChains;
    this.setState(this.state);
  }

  rangeValidator(value, row) {
    const index = this.state.data.findIndex(a => a.id === row.id);
    if (index > -1) {
      setTimeout(() => {
        this.computeChains();
        this.resetButtons();
      }, 200);
    }
    return {
      isValid: true,
      notification: { type: "success", msg: "", title: "", importance: 0 },
      conflicts: []
    };
  }

  domainValidator(value, row) {
    let index = this.state.data.findIndex(a => a.id === row.id);
    if (index > -1) {
      // This is an edit of the domain
      var newDuplicates = [];
      for (var dup in this.state.conflicts.duplicates) {
        var dup_ = this.state.conflicts.duplicates[dup];
        index = dup_.indexOf(row.id);
        if (index > -1) {
          dup_.splice(index, 1);
        }
        if (dup_.length > 0) newDuplicates.push(dup_);
      }
      this.state.conflicts.duplicates = newDuplicates;

      setTimeout(() => {
        this.updateConflicts(row);
        this.computeChains();
        this.resetButtons();
      }, 200);
    }
    return {
      isValid: true,
      notification: { type: "success", msg: "", title: "", importance: 0 },
      conflicts: []
    };
  }

  updateConflicts(row) {
    var domain = row.domain;
    let currentDomain = null;
    let test = true;
    for (var dup in this.state.conflicts.duplicates) {
      var dup_ = this.state.conflicts.duplicates[dup];
      currentDomain = this.state.data[
        this.state.data.findIndex(a => a.id === dup_[0])
      ].domain;
      if (domain === currentDomain) {
        dup_.push(row.id);
        test = false;
        break;
      }
    }
    if (test) {
      this.state.conflicts.duplicates.push([row.id]);
    }
  }

  getConflicts(id) {
    //get conflicts for an id
    let duplicates = [];
    let chains = [];
    for (var dup in this.state.conflicts.duplicates) {
      var dup_ = this.state.conflicts.duplicates[dup];
      if (dup_.indexOf(id) > -1) {
        duplicates = dup_;
        break;
      }
    }
    for (var chain in this.state.conflicts.chains) {
      var dup_ = this.state.conflicts.chains[chain];
      if (dup_.indexOf(id) > -1) {
        chains = dup_;
        break;
      }
    }
    return { id: id, duplicates: duplicates, chains: chains };
  }

  validateButtons(id) {
    //on hover show all conflicts
    var conflicts = this.getConflicts(id);
    var dup = false;
    var chain = false;
    if (conflicts.duplicates.length > 1) {
      dup = true;
      conflicts.duplicates.forEach(id => {
        var elem = document.getElementById(this.state.button_check_prefix + id);
        if (elem) {
          elem.className = "check warning";
          elem.innerHTML = "×";
          elem.style.opacity = this.state.high_opacity;
        }
      });
    }

    if (conflicts.chains.length > 1) {
      chain = true;
      conflicts.chains.forEach(id => {
        var elem = document.getElementById(this.state.button_check_prefix + id);
        if (elem) {
          elem.className = "check error";
          elem.innerHTML = "×";
          elem.style.opacity = this.state.high_opacity;
        }
      });
    }

    if (chain) {
      const reducer = (accumulator, currentValue) =>
        accumulator + " id(" + currentValue + ") =>";
      var chainString = conflicts.chains.reduce(reducer, "");
      var typeProblem = "Chain";
      var suffix = "";
      if (
        conflicts.chains[0] === conflicts.chains[conflicts.chains.length - 1]
      ) {
        typeProblem = "Loop";
        suffix = "...";
      }
      document.getElementById(this.state.error_div_id).className =
        "alert alert-danger";
      document.getElementById(this.state.error_id).innerHTML =
        typeProblem +
        " error: " +
        chainString.substring(0, chainString.length - 3) +
        suffix;
      return ["check error", "×"];
    } else {
      if (dup) {
        document.getElementById(this.state.error_div_id).className =
          "alert alert-warning";
        document.getElementById(this.state.error_id).innerHTML =
          "Duplicated Domain: " +
          this.state.data[this.state.data.findIndex(a => a.id === id)].domain;
        return ["check warning", "×"];
      } else {
        var elem = document.getElementById(this.state.button_check_prefix + id);
        if (elem) elem.style.opacity = this.state.high_opacity;
        document.getElementById(this.state.error_div_id).className =
          "alert alert-success";
        document.getElementById(this.state.error_id).innerHTML = "Valid entry";
        return ["check valid", "✓"];
      }
    }
  }

  resetButtons() {
    //read all the data and update the current state of buttons
    var numWarnings = this.state.conflicts.duplicates.filter(x => x.length > 1)
      .length;
    var numErrors = this.state.conflicts.chains.length;
    if (numWarnings === 0 && numErrors === 0) {
      document.getElementById(this.state.error_div_id).className =
        "alert alert-success";
      document.getElementById(this.state.error_id).innerHTML =
        "Conflicts free dictionary";
    } else {
      if (numErrors === 0) {
        document.getElementById(this.state.error_div_id).className =
          "alert alert-warning";
        document.getElementById(this.state.error_id).innerHTML =
          numWarnings + " duplicated domains in this dictionary";
      } else {
        document.getElementById(this.state.error_div_id).className =
          "alert alert-danger";
        document.getElementById(this.state.error_id).innerHTML =
          numErrors +
          " error" +
          (numErrors > 1 ? "s" : "") +
          " in this dictionary";
      }
    }
    for (var entry in this.state.data) {
      var id_button =
        this.state.button_check_prefix + this.state.data[entry].id;
      var elem = document.getElementById(id_button);
      var test = true;
      for (var dup in this.state.conflicts.duplicates) {
        var dup_ = this.state.conflicts.duplicates[dup];
        if (dup_.indexOf(this.state.data[entry].id) > -1 && dup_.length > 1) {
          elem.className = "check warning";
          elem.innerHTML = "×";
          elem.style.opacity = this.state.low_opacity;
          test = false;
          break;
        }
      }

      for (var chain in this.state.conflicts.chains) {
        var chain_ = this.state.conflicts.chains[chain];
        if (chain_.indexOf(this.state.data[entry].id) > -1) {
          elem.className = "check error";
          elem.innerHTML = "×";
          elem.style.opacity = this.state.low_opacity;
          test = false;
          break;
        }
      }

      if (test) {
        elem.className = "check valid";
        elem.innerHTML = "✓";
        elem.style.opacity = this.state.low_opacity;
      }
    }
  }

  addButton(id) {
    // add a new button to the button group
    var validation = this.validateButtons(id);
    var cell = document.createElement("button");
    cell.id = this.state.button_check_prefix + id;
    cell.className = validation[0];
    cell.innerHTML = validation[1];
    cell.type = "button";
    cell.addEventListener("mouseover", () => this.validateButtons(id));
    cell.addEventListener("mouseout", () => this.resetButtons());
    document.getElementById(this.state.button_group_id).appendChild(cell);
    document.getElementById(
      this.state.error_div_id
    ).style.opacity = this.state.high_opacity;
  }

  constructor() {
    super();
    this.onAfterDeleteRow = this.onAfterDeleteRow.bind(this);
    this.onAfterInsertRow = this.onAfterInsertRow.bind(this);
    this.domainValidator = this.domainValidator.bind(this);
    this.rangeValidator = this.rangeValidator.bind(this);
    this.addButton = this.addButton.bind(this);
    this.validateButtons = this.validateButtons.bind(this);
    this.getConflicts = this.getConflicts.bind(this);
    this.resetButtons = this.resetButtons.bind(this);
    this.updateConflicts = this.updateConflicts.bind(this);
    this.getDomainRangeForId = this.getDomainRangeForId.bind(this);
  }

  render() {
    this.state.button_group_id = "button-group-" + this.props.tab_id;
    this.state.tab_id = this.props.tab_id;
    this.state.error_div_id = "error-div-" + this.props.tab_id;
    this.state.error_id = "error-" + this.props.tab_id;
    this.state.button_check_prefix = this.props.tab_id + "-check-";
    return (
      <div>
        <div class="button-wrapper">
          <div
            id={this.state.button_group_id}
            class="btn-group-vertical mr-2-lg"
          />
        </div>
        <div class="table-wrapper">
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
            exportCSV={true}
          >
            <TableHeaderColumn
              dataField="id"
              isKey
              dataFormat={this.idFormatter}
            >
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
        </div>
      </div>
    );
  }
}

export default EditColumnClassTable;
