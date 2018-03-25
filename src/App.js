import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

import db from './config';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
    this.handleChange = this.handleChange.bind(this)
    this.handleClickAdd = this.handleClickAdd.bind(this)
    this.handleClickRemove = this.handleClickRemove.bind(this)
  }

  getInitialState() {
    return {
      description: "",
      date: (new Date).toISOString().substr(0, 10),
      amount: "0",
      paidBy: "maxence",
      refunded: "false",
    }
  }

  componentDidMount() {
    db.collection('users').onSnapshot(querySnapshot => {
      console.log('snapshot user!')
      this.setState({
        users: querySnapshot.docs,
      })
    });
    db.collection('expenses').where('display', '==', true).onSnapshot(querySnapshot => {
      console.log('snapshot expenses!')
      let expenses = querySnapshot.docs.slice()
      expenses.sort((a,b) => {
        return a.data().date < b.data().date ? -1 : 1
      })
      this.setState({
        expenses: expenses
      })
    });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
    console.log("handleChange", e.target.name)
  }

  handleClickAdd() {
    db.collection("expenses").add({
      description: this.state.description,
      date: new Date(this.state.date),
      amount: Number(this.state.amount),
      paidBy: this.state.paidBy,
      refunded: this.state.refunded == "true",
      display: true
    })
    .then(() => {
      console.log("Document successfully written!");
      this.setState(this.getInitialState());
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  }

  handleClickRemove(expenseId) {
    console.log("Remove ", expenseId)
    db.collection("expenses").doc(expenseId).set({
      display: false
    }, { merge: true })
    .then(function() {
      console.log("Document successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
  }

  getTotalAmountPaid() {
    if (!this.state.users)
      return 0;
    return this.state.users.reduce((acc, snap) => acc + (snap.data().amountPaid || 0), 0);
  }

  getTotalAmountExpenses() {
    if (!this.state.expenses)
      return 0;
    return this.state.expenses.reduce((acc, snap) => acc + (snap.data().amount || 0), 0);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="https://console.firebase.google.com/u/1/project/fireroom-money/database/firestore/data">
            <img src={logo} className="App-logo" alt="logo" />
          </a>
          <h1 className="App-title">Welcome to Fireroom Money Tracker</h1>
        </header>
        <div className="App-intro container">
          <table className="table table-sm mt-5">
            <thead className="thead-dark">
              <tr>
                <th>Expense description</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Paid by</th>
                <th>Refunded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.expenses && this.state.expenses.map(snap => (
                <tr key={snap.id} className={snap.data().refunded ? "" : "table-warning"}>
                  <td>{snap.data().description}</td>
                  <td>{snap.data().date && snap.data().date.toISOString().substr(0, 10)}</td>
                  <td>{snap.data().amount && snap.data().amount.toFixed(2)}€</td>
                  <td>{snap.data().paidBy}</td>
                  <td>{snap.data().refunded ? "Yes" : "No"}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => this.handleClickRemove(snap.id)}>Remove</button></td>
                </tr>
              ))}
              <tr>
                <td><input className="form-control" type="text" name="description" value={this.state.description} onChange={this.handleChange} /></td>
                <td><input className="form-control" type="text" placeholder="YYYYY-MM-DD" name="date" value={this.state.date} onChange={this.handleChange} /></td>
                <td><input className="form-control" type="number" name="amount" value={this.state.amount} onChange={this.handleChange} /></td>
                <td>
                  <select name="paidBy" className="form-control" value={this.state.paidBy} onChange={this.handleChange}>
                    {this.state.users && this.state.users.map(snap => (
                      <option key={snap.id} value={snap.id}>{snap.data().name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select name="refunded" className="form-control" value={this.state.refunded} onChange={this.handleChange}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </td>
                <td><button className="btn btn-sm btn-success" onClick={this.handleClickAdd}>Add</button></td>
              </tr>
              <tr className="bg-primary">
                <th>Remaining</th>
                <th></th>
                <th>{(this.getTotalAmountPaid() - this.getTotalAmountExpenses()).toFixed(2)}€</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </tbody>
          </table>

          <table className="table table-sm my-5">
            <thead className="thead-dark">
              <tr>
                <th>User</th>
                <th>Amount Paid</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users && this.state.users.map(snap => (
                <tr key={snap.id}>
                  <td>{snap.data().name}</td>
                  <td>{snap.data().amountPaid !== undefined && snap.data().amountPaid + "€"}</td>
                  <td>{snap.data().amountPaid !== undefined && "✓"}</td>
                </tr>
              ))}
              <tr className="bg-primary">
                <th>Total</th>
                <th>{this.getTotalAmountPaid()}€</th>
                <th></th>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    );
  }
}

export default App;
