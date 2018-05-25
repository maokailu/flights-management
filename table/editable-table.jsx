import { Table, Input, InputNumber, Popconfirm, Form } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
const data = [];
const FormItem = Form.Item;
const EditableContext = React.createContext();
import request from '../utils/request';
import './style.css';

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };
  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: `Please Input ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

export default class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data, editingKey: '' };
    this.columns = [
      {
        title: '用户编号',
        dataIndex: 'userId',
        width: '10%',
        editable: true
      },
      {
        title: '用户名',
        dataIndex: 'userName',
        width: '10%',
        editable: true
      },
      {
        title: 'idCardNumber',
        dataIndex: 'idCardNumber',
        width: '20%',
        editable: true
      },
      {
        title: 'password',
        dataIndex: 'password',
        width: '10%',
        editable: true
      },
      {
        title: 'gender',
        dataIndex: 'gender',
        width: '10%',
        editable: true
      },
      {
        title: 'birthday',
        dataIndex: 'birthday',
        width: '10%',
        editable: true
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        rowKey: 'operation',
        render: (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <a
                        href="javascript:;"
                        onClick={() => this.validate(form, record.key)}
                        style={{ marginRight: 8 }}
                      >
                        Save
                      </a>
                    )}
                  </EditableContext.Consumer>
                  <Popconfirm
                    title="Sure to cancel?"
                    onConfirm={() => this.cancel(record.key)}
                  >
                    <a>Cancel</a>
                  </Popconfirm>
                </span>
              ) : (
                <a onClick={() => this.edit(record.key)}>Edit</a>
              )}
              <a className="delete-btn" href="javascript:;" onClick={()=>this.removeUser(record.userId)}>删除</a>
            </div>
          );
        },
      },
    ];
  }
  componentDidMount() {
    request.getPromise(`http://localhost:8080/getUsers?`, null).then(json => {
        if (json && json.length !== 0) {
            this.setState({
              data: json
            })
        }
    }, error => {
        console.error('出错了', error);
    });
  }
  removeUser = key => {
    const userId = `userId=${key}`
    request.getPromise(`http://localhost:8080/deleteUser?${userId}`).then(json => {   
      const newData = [...this.state.data];
      const data = newData.filter((user, index) => {
        return (user.userId !== key)}
      );
      this.setState({
        data: data
      })
    }, error => {
        console.error('出错了', error);
    });
  }
  isEditing = (record) => {
    return record.key === this.state.editingKey;
  };
  edit(key) {
    this.setState({ editingKey: key });
  }
  validate(form, key) {
    const hasNotSave = false;
    if(hasNotSave) {
      return;
    }
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      this.updateUser(form, key, row);
    });
  }  
  updateUser = (form, key, row) => {
    request.getPromise(`http://localhost:8080/updateUser?`, row).then(json => {
        this.save(form, key, row);
    }, error => {
        console.error('出错了', error);
    });
  }
  save = (form, key, row) => {
    const newData = [...this.state.data];
    const index = newData.findIndex(item => key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      this.setState({ data: newData, editingKey: '' });
    } else {
      newData.push(data);
      this.setState({ data: newData, editingKey: '' });
    }
  }
  cancel = () => {
    this.setState({ editingKey: '' });
  };
  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <Table
        components={components}
        bordered
        dataSource={this.state.data}
        columns={columns}
        rowClassName="editable-row"
      />
    );
  }
}