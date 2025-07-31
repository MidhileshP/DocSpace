import React, { createContext, useState, useContext } from 'react';

const DocumentContext = createContext();

export const useDocument = () => {
  return useContext(DocumentContext);
};

export const DocumentProvider = ({ children }) => {
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const value = {
    activeDocumentId,
    setActiveDocumentId,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}; 