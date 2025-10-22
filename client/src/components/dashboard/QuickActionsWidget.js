// client/src/components/dashboard/QuickActionsWidget.js
import React from 'react';
import styled from 'styled-components';
// --- FIX: Import useNavigate to handle navigation after checking ---
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// --- FIX: Import the useDashboard hook to get subscription status ---
import { useDashboard } from '../layout/DashboardLayout';

const WidgetContainer = styled.div`
  grid-column: span 1;
  background-color: #33333d;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// --- FIX: Changed ActionButton from a Link to a 'div' (or 'button') ---
// We will handle navigation manually with onClick.
const ActionButton = styled.div`
  padding: 1rem;
  background-color: #03d9c5;
  color: white;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  cursor: pointer; // Add cursor pointer since it's not an 'a' tag anymore

  &:hover {
    background-color: #02b3a3;
  }
`;

const QuickActionsWidget = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // --- FIX: Get the subscription status and modal trigger ---
  const { isSubscribed, handleRenewRequest } = useDashboard();

  // --- FIX: Create a handler function just like in Sidebar.js ---
  const handleActionClick = (path) => {
    if (!isSubscribed) {
      // If not subscribed, stop and show the modal
      handleRenewRequest();
    } else {
      // If subscribed, proceed to the page
      navigate(path);
    }
  };

  return (
    <WidgetContainer>
      {/* --- FIX: Use onClick to call our new handler function --- */}
      <ActionButton onClick={() => handleActionClick('/generate-course')}>
        {t('dashboard.quick_actions_widget.generate_new_course')}
      </ActionButton>
      
      {/* --- FIX: Use onClick for the second button as well --- */}
      <ActionButton onClick={() => handleActionClick('/pre-generated')}>
        {t('dashboard.quick_actions_widget.browse_pre_generated')}
      </ActionButton>
    </WidgetContainer>
  );
};

export default QuickActionsWidget;