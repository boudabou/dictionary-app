import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";
import EditColumnClassTable from "./components/table";

var numTables = 1;

document.getElementById("addTableButton").onclick = addEntry;

function addEntry() {
  numTables += 1;
  var cell = document.createElement("div");
  cell.className = "grid-item";
  cell.id = numTables;
  document.getElementById("grid").appendChild(cell);
  ReactDOM.render(
    <div>
      <div className="button-div">
        <button
          type="button"
          className="btn btn-default btn-xs"
          onClick={() => {
            var element = document.getElementById(cell.id);
            element.parentNode.removeChild(element);
          }}
        >
          &#x274C;
        </button>
      </div>
      <div>
        <EditColumnClassTable />
      </div>
    </div>,
    document.getElementById(numTables)
  );
}

serviceWorker.unregister();
