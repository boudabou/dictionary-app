import React, { Component } from "react";

class Counter extends Component {
  state = {
    value: this.props.value
  };

  render() {
    console.log(this.props);
    return (
      <div>
        <span className={this.getBadgeClasses()}>{this.formatCount()}</span>
        <button
          onClick={this.handleIncrement}
          className="btn btn-secondary btn-sm"
        >
          Increment
        </button>
      </div>
    );
  }

  handleIncrement = () => {
    this.setState({ value: this.state.value + 1 });
  };

  getBadgeClasses() {
    let classes = "badge m-2 badge-";
    classes += this.state.value === 0 ? "warning" : "primary";
    return classes;
  }

  formatCount() {
    return this.state.value === 0 ? "Zero" : this.state.value;
  }
}
/*renderTags() {
    if (this.state.tags.length === 0) return <p> there is no elements </p>;
    else
      return (
        <ul>
          {this.state.tags.map(tag => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      );
  }*/

export default Counter;
