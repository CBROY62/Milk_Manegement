import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './QuestionsManagement.css';

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', ''],
    correctAnswer: 0,
    category: 'general',
    difficulty: 'medium',
    explanation: '',
    tags: [],
    isActive: true
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/questions?${params.toString()}`);
      if (response.data.success) {
        setQuestions(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error(error.response?.data?.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterCategory, filterDifficulty]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({
        ...formData,
        options: [...formData.options, '']
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const newCorrectAnswer = formData.correctAnswer >= newOptions.length 
        ? newOptions.length - 1 
        : formData.correctAnswer;
      setFormData({
        ...formData,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleEdit = (question) => {
    setEditingQuestion(question._id);
    setFormData({
      questionText: question.questionText || '',
      options: question.options || ['', ''],
      correctAnswer: question.correctAnswer || 0,
      category: question.category || 'general',
      difficulty: question.difficulty || 'medium',
      explanation: question.explanation || '',
      tags: question.tags || [],
      isActive: question.isActive !== undefined ? question.isActive : true
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      options: ['', ''],
      correctAnswer: 0,
      category: 'general',
      difficulty: 'medium',
      explanation: '',
      tags: [],
      isActive: true
    });
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    
    if (formData.options.filter(opt => opt.trim()).length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    if (formData.correctAnswer < 0 || formData.correctAnswer >= formData.options.length) {
      toast.error('Invalid correct answer selection');
      return;
    }

    try {
      const questionData = {
        ...formData,
        options: formData.options.filter(opt => opt.trim())
      };

      if (editingQuestion) {
        const response = await api.put(`/questions/${editingQuestion}`, questionData);
        if (response.data.success) {
          toast.success('Question updated successfully');
          handleCancel();
          fetchQuestions();
        }
      } else {
        const response = await api.post('/questions', questionData);
        if (response.data.success) {
          toast.success('Question created successfully');
          handleCancel();
          fetchQuestions();
        }
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/questions/${questionId}`);
      if (response.data.success) {
        toast.success('Question deleted successfully');
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleToggleStatus = async (questionId, currentStatus) => {
    try {
      const response = await api.put(`/questions/${questionId}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        toast.success(`Question ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error updating question status:', error);
      toast.error(error.response?.data?.message || 'Failed to update question status');
    }
  };

  const filteredQuestions = questions.filter(question => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        question.questionText?.toLowerCase().includes(searchLower) ||
        question.explanation?.toLowerCase().includes(searchLower) ||
        question.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="questions-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="loading-text">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-management-container">
      <div className="questions-management-header">
        <h1>Questions Management</h1>
        <div className="questions-stats">
          <span>Total Questions: {questions.length}</span>
          <span>Active: {questions.filter(q => q.isActive !== false).length}</span>
          <button 
            className="btn-add-question"
            onClick={() => setShowForm(true)}
          >
            + Add Question
          </button>
        </div>
      </div>

      <div className="questions-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="milk_products">Milk Products</option>
            <option value="nutrition">Nutrition</option>
            <option value="health">Health</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="filter-box">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="question-form-modal">
          <div className="question-form-content">
            <div className="form-header">
              <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button className="btn-close" onClick={handleCancel}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  className="form-input"
                  placeholder="Enter the question..."
                />
              </div>

              <div className="form-group">
                <label>Options *</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData({ ...formData, correctAnswer: index })}
                      className="correct-answer-radio"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="form-input option-input"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn-remove-option"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="btn-add-option"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="general">General</option>
                    <option value="milk_products">Milk Products</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="health">Health</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Explanation</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  rows={2}
                  className="form-input"
                  placeholder="Optional explanation for the answer..."
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input-container">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-add-tag"
                  >
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="questions-list">
        {filteredQuestions.length === 0 ? (
          <div className="no-data">No questions found</div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question._id} className="question-card">
              <div className="question-header">
                <div className="question-meta">
                  <span className={`category-badge category-${question.category}`}>
                    {question.category}
                  </span>
                  <span className={`difficulty-badge difficulty-${question.difficulty}`}>
                    {question.difficulty}
                  </span>
                  <span className={`status-badge ${question.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                    {question.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="question-actions">
                  <button
                    onClick={() => handleToggleStatus(question._id, question.isActive !== false)}
                    className={`btn-toggle-status ${question.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                  >
                    {question.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(question)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="question-content">
                <h3 className="question-text">{question.questionText}</h3>
                <div className="question-options">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`option-item ${index === question.correctAnswer ? 'correct-answer' : ''}`}
                    >
                      {index === question.correctAnswer && <span className="correct-indicator">✓</span>}
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="question-explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
                {question.tags && question.tags.length > 0 && (
                  <div className="question-tags">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag-display">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionsManagement;

