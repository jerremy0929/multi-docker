import React, { Component } from 'react'
import axios from 'axios'

export class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  async fetchValues() {
    const { data: values } = await axios.get('/api/values/current')
    this.setState({ values })
  }

  async fetchIndexes() {
    const { data: seenIndexes } = await axios.get('/api/values/all')
    this.setState({ seenIndexes })
  }

  handleSubmit = async evt => {
    evt.preventDefault()

    await axios.post('/api/values', {
      index: this.state.index,
    })
    this.setState({ index: '' })
  }

  render() {
    const { seenIndexes, values, index } = this.state

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            type="text"
            value={index}
            onChange={evt => this.setState({ index: evt.target.value })}
          />
          <button type="submit">Submit </button>
        </form>

        <h3>Indexes I have seen:</h3>
        {seenIndexes.map(({ number }) => number).join(', ')}

        <h3>Calculated Values:</h3>
        {Object.keys(values).map(key => (
          <div key={key}>
            For index {key} calculated {values[key]}
          </div>
        ))}
      </div>
    )
  }
}

export default Fib
