import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const SavedCards = () => {
  const [cards, setCards] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const handleAddCard = () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      toast.error('Please fill all card details');
      return;
    }

    setCards([...cards, { ...cardData, id: Date.now() }]);
    setCardData({ number: '', name: '', expiry: '', cvv: '' });
    setIsAdding(false);
    toast.success('Card saved');
  };

  const maskCardNumber = (number) => {
    if (number.length < 4) return number;
    return '**** **** **** ' + number.slice(-4);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Saved Cards</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="profile-edit-link"
          >
            {isAdding ? 'Cancel' : 'Add Card'}
          </button>
        </div>

        {isAdding && (
          <div className="profile-section-form">
            <div className="profile-form-group">
              <label className="profile-label">Card Number</label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                placeholder="1234 5678 9012 3456"
                className="profile-input"
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-label">Cardholder Name</label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                placeholder="John Doe"
                className="profile-input"
              />
            </div>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label className="profile-label">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  placeholder="12/25"
                  maxLength="5"
                  className="profile-input"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-label">CVV</label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                  placeholder="123"
                  maxLength="3"
                  className="profile-input"
                />
              </div>
            </div>
            <div className="profile-section-actions">
              <button
                onClick={() => setIsAdding(false)}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="profile-btn profile-btn-primary"
              >
                Save Card
              </button>
            </div>
          </div>
        )}

        <div className="profile-section-content">
          {cards.length === 0 ? (
            <p>No cards saved. Add your card for faster checkout.</p>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="profile-info-row">
                <span className="profile-info-value">
                  {maskCardNumber(card.number)} - {card.name} - Expires {card.expiry}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedCards;
