import React , { Component } from 'react';
import Vex from 'vexflow';

export default class Staff extends Component {
  componentDidMount() {
    this.vf = new Vex.Flow.Factory({renderer: {elementId: 'staff'}});
    this.score = this.vf.EasyScore();
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.container.querySelector('svg').querySelectorAll('*').forEach(i => i.remove());

    this.system = this.vf.System();
    this.system.addStave({
      voices: [this.score.voice(this.score.notes(`${nextProps.note.scientific}/w`))],
    }).addClef('treble');

    this.vf.draw();
    this.container.querySelector('svg').setAttribute('viewBox', '65 20 100 100');
    this.container.querySelector('svg').setAttribute('height', '250');
  }

  render() {
    return (
      <div className="staff" id="staff" ref={r => { this.container = r; }} />
    );
  }
}
