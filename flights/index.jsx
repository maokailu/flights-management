import React from 'react';
import ReactDOM from 'react-dom';
import {Table, Icon, Divider } from 'antd';
import request from '../utils/request';
import date from '../utils/date';
import TableApp from './table';
import AdvancedSearchForm from './search-box';
import CollectionsPage from './addUser';
import './style.css';

export default class FlightsUnit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  componentDidMount() {
    request.getPromise(`http://localhost:8080/getFlightsrsBySearch`, {departAirportCode:'SHA',departAirportCode:'PEK',classType: 0}).then(json => {
        if (json && json.length !== 0) {
            for(let i =0;i<json.length;i++){
                const dateStr = date.format(new Date(json[i]['birthday']), 'yyyy-MM-dd');
                json[i]['birthday'] = dateStr;
            }
            this.setState({
              data: json
            })
        }
    }, error => {
        console.error('出错了', error);
    });
  }
  updateData = data =>{
    this.setState({
      data: data
    })
  }
  render() {
    return (
      <div className="user">      
          <span className='add-btn'><CollectionsPage updateData={this.updateData}/></span>
          <AdvancedSearchForm updateData={this.updateData} />
          <div className="search-result-list">
            <TableApp data={this.state.data} updateData={this.updateData} />
          </div>
      </div>
    );
  }
}