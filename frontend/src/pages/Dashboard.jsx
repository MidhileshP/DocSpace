import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import { auth } from '../config/firebase';
import { Plus, FileText, Calendar, Trash2, Edit, Shield, User, Eye, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { useDocument } from '../contexts/DocumentContext';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null); // For confirmation state
  const navigate = useNavigate();
  const { setActiveDocumentId } = useDocument();

  useEffect(() => {
    // Set up an observer to get the current user
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        loadDocuments();
      } else {
        // Handle user not being logged in
        setLoading(false);
        setError("Please log in to view your documents.");
      }
    });

    return () => unsubscribe(); // Cleanup observer on component unmount
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const docs = await documentApi.getAll();
      setDocuments(docs);
    } catch (error) {
      setError(error.message || 'Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const newDoc = await documentApi.create({ title: 'Untitled Document' });
      setActiveDocumentId(newDoc.id);
      navigate(`/editor`);
    } catch (error) {
      setError(error.message || 'Failed to create document');
      console.error('Error creating document:', error);
    }
  };

  const handleOpenDocument = (docId) => {
    setActiveDocumentId(docId);
    navigate('/editor');
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await documentApi.delete(docToDelete.id);
      setDocuments(documents.filter(doc => doc.id !== docToDelete.id));
      setDocToDelete(null); // Close confirmation
    } catch (error) {
      setError(error.message || 'Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin': return { text: 'Admin', icon: <Shield className="h-3 w-3" />, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case 'editor': return { text: 'Editor', icon: <Edit className="h-3 w-3" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'viewer': return { text: 'Viewer', icon: <Eye className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
      default: return { text: 'Unknown', icon: <User className="h-3 w-3" />, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">My Documents</h1>
            <p className="text-secondary-600 dark:text-primary-200 mt-1">Create and manage your documents</p>
          </div>
          <button onClick={handleCreateDocument} className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md p-4 mb-6">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {docToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900 dark:text-white">Delete Document</h3>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-600 dark:text-primary-200">
                      Are you sure you want to delete "<strong>{docToDelete.title}</strong>"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button onClick={handleDeleteDocument} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                  Delete
                </button>
                <button onClick={() => setDocToDelete(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-secondary-600 shadow-sm px-4 py-2 bg-white dark:bg-secondary-700 text-base font-medium text-gray-700 dark:text-primary-100 hover:bg-gray-50 dark:hover:bg-secondary-600 sm:mt-0 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document List or Empty State */}
        {documents.length === 0 && !loading ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents yet</h3>
            <p className="text-secondary-600 dark:text-primary-200 mb-6">Create your first document to get started</p>
            <button onClick={handleCreateDocument} className="bg-secondary-700 text-white px-6 py-2 rounded-lg hover:bg-secondary-800 transition-colors">
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const userRole = currentUser ? doc.roles?.[currentUser.uid] : null;
              const roleInfo = getRoleInfo(userRole);
              const canEdit = userRole === 'admin' || userRole === 'editor';
              const canDelete = userRole === 'admin';

              return (
                <div key={doc.id} className="bg-white dark:bg-secondary-800 rounded-lg shadow-md border border-primary-200 dark:border-secondary-700 flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white truncate pr-2 flex-1 cursor-pointer" onClick={() => handleOpenDocument(doc.id)}>
                        {doc.title}
                      </h3>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {canDelete && (
                           <button onClick={() => setDocToDelete(doc)} className="text-secondary-500 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete document">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-secondary-500 dark:text-primary-300 mb-4">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Updated {formatDate(doc.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-secondary-900/50 px-6 py-3 rounded-b-lg border-t border-primary-200 dark:border-secondary-700">
                     <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${roleInfo.color}`}>
                        {roleInfo.icon}
                        Your Role: {roleInfo.text}
                      </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
