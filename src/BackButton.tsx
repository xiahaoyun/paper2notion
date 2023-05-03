import React from 'react';
import { useNavigate} from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate ();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button className="back-button text-sm fixed top-1 left-1 bg-white" onClick={handleClick}>
      ⬅Back
    </button>
  );
};

export default BackButton;
