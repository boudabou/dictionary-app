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
          className="close"
          onClick={() => {
            var element = document.getElementById(cell.id);
            element.parentNode.removeChild(element);
          }}
        >
          ×
        </button>
      </div>
      <div>
        <div id={"error-div-" + cell.id} className="empyt-error">
          <p id={"error-" + cell.id} />
        </div>
        <EditColumnClassTable tab_id={cell.id} />
      </div>
    </div>,
    document.getElementById(numTables)
  );
}

//ReactDOM.render(<Tooltip x={"ok"} />, document.getElementById("test"));
serviceWorker.unregister();
