import React from 'react';
import './DeliveryOrderTracking.css';

const DeliveryOrderTracking = ({ order }) => {
  if (!order) return null;

  // Map backend status to 3-step flow
  const getOrderStep = (status) => {
    if (['pending', 'confirmed'].includes(status)) return 'ordered';
    if (['processing', 'out_for_delivery'].includes(status)) return 'ongoing';
    if (status === 'delivered') return 'delivered';
    return 'ordered';
  };

  const currentStep = getOrderStep(order.status);

  const steps = [
    { 
      key: 'ordered', 
      label: 'Ordered',
      number: 1
    },
    { 
      key: 'ongoing', 
      label: 'On Going',
      number: 2
    },
    { 
      key: 'delivered', 
      label: 'Delivered Product',
      number: 3
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="delivery-order-tracking">
      <h4 className="tracking-title">Order Status</h4>
      
      <div className="progress-bar-container">
        <div className="progress-line"></div>
        <div className="progress-steps">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isInactive = index > currentStepIndex;

            return (
              <div key={step.key} className="progress-step">
                <div 
                  className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isInactive ? 'inactive' : ''}`}
                >
                  <span className="step-number">{step.number}</span>
                </div>
                <div className={`step-label ${isActive ? 'active' : ''}`}>
                  {step.label.split(' ').map((word, i, arr) => (
                    <span key={i}>
                      {word}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderTracking;

