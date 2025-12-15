import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    isB2B: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load users';
      toast.error(errorMessage);
      // Set empty array on error to prevent crashes
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      isB2B: user.isB2B || false
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      isB2B: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdate = async (userId) => {
    try {
      const response = await api.put(`/users/${userId}`, formData);
      if (response.data.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find(u => u._id === userId);
    if (!userToDelete) return;

    if (currentUser?._id === userId) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${userToDelete.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    if (currentUser?._id === userId) {
      toast.error('You cannot deactivate your own account');
      return;
    }

    const isCurrentlyActive = user.isActive !== false;
    const action = isCurrentlyActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      return;
    }

    try {
      const response = await api.put(`/users/${userId}/status`, {
        isActive: !isCurrentlyActive
      });
      if (response.data.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive !== false) ||
      (filterStatus === 'inactive' && user.isActive === false);
    
    let matchesDate = true;
    if (filterDateFrom || filterDateTo) {
      const userDate = new Date(user.createdAt);
      if (filterDateFrom && userDate < new Date(filterDateFrom)) matchesDate = false;
      if (filterDateTo && userDate > new Date(filterDateTo)) matchesDate = false;
    }
    
    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
      setSelectAll(true);
    } else {
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      if (selectedUsers.length + 1 === filteredUsers.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      if (action === 'delete') {
        await Promise.all(selectedUsers.map(userId => api.delete(`/users/${userId}`)));
        toast.success(`${selectedUsers.length} user(s) deleted successfully`);
      } else {
        const isActive = action === 'activate';
        await Promise.all(selectedUsers.map(userId => 
          api.put(`/users/${userId}/status`, { isActive })
        ));
        toast.success(`${selectedUsers.length} user(s) ${actionText}d successfully`);
      }
      setSelectedUsers([]);
      setSelectAll(false);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${actionText}ing users:`, error);
      toast.error(`Failed to ${actionText} users`);
    }
  };

  const handleExport = () => {
    const csvData = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'B2B', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A',
        user.role || 'customer',
        user.isActive !== false ? 'Active' : 'Inactive',
        user.isB2B ? 'Yes' : 'No',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users exported successfully');
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>User Management</h1>
        <div className="user-stats">
          <span>Total Users: {users.length}</span>
          <span>Active: {users.filter(u => u.isActive !== false).length}</span>
          <span>Inactive: {users.filter(u => u.isActive === false).length}</span>
        </div>
      </div>

      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="mediator">Mediator</option>
            <option value="delivery_boy">Delivery Boy</option>
          </select>
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="filter-box">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="filter-select"
            placeholder="From Date"
          />
        </div>
        <div className="filter-box">
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="filter-select"
            placeholder="To Date"
          />
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedUsers.length} user(s) selected</span>
          <div className="bulk-actions-buttons">
            <button onClick={() => handleBulkAction('activate')} className="btn-bulk-activate">
              Activate Selected
            </button>
            <button onClick={() => handleBulkAction('deactivate')} className="btn-bulk-deactivate">
              Deactivate Selected
            </button>
            <button onClick={() => handleBulkAction('delete')} className="btn-bulk-delete">
              Delete Selected
            </button>
            <button onClick={() => { setSelectedUsers([]); setSelectAll(false); }} className="btn-clear-selection">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="user-actions-bar">
        <button onClick={handleExport} className="btn-export">
          Export to CSV
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="select-checkbox"
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>B2B</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="select-checkbox"
                      disabled={currentUser?._id === user._id}
                    />
                  </td>
                  {editingUser === user._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="edit-select"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="mediator">Mediator</option>
                          <option value="delivery_boy">Delivery Boy</option>
                        </select>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          name="isB2B"
                          checked={formData.isB2B}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleUpdate(user._id)}
                            className="btn-save"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.isB2B ? 'Yes' : 'No'}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className={user.isActive !== false ? 'btn-deactivate' : 'btn-activate'}
                            disabled={currentUser?._id === user._id}
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn-delete"
                            disabled={currentUser?._id === user._id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

