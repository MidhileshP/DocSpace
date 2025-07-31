
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import { BlockNoteView } from "@blocknote/mantine";
import { 
  useCreateBlockNote,
  

  SuggestionMenuController,
  getDefaultReactSlashMenuItems
} from "@blocknote/react";
import { 
  BlockNoteSchema, 
  defaultInlineContentSpecs,
  filterSuggestionItems
} from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import { 
  createReactInlineContentSpec
} from "@blocknote/react";
import {
  AIMenuController,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import "@blocknote/xl-ai/style.css";
import { createGroq } from "@ai-sdk/groq";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Share2, CheckCircle, Clock, Loader2, Users, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDocument } from '../contexts/DocumentContext';
import { YDocProvider, useYDoc, useYjsProvider } from "@y-sweet/react";
import {
  DefaultThreadStoreAuth,
  YjsThreadStore,
} from "@blocknote/core/comments";
import { getEnv } from "./getEnv.js";



export const generateUserColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// AI Configuration
const createAIModel = () => {
  try {
    // Use direct Groq API call
    const apiKey = getEnv("GROQ_API_KEY");
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      console.warn("No Groq API key found. AI features will be disabled.");
      return null;
    }
    
    return createGroq({
      apiKey: apiKey,
    })("llama3-70b-8192");
  } catch (error) {
    console.error("Failed to create AI model:", error);
    return null;
  }
};

// Mention inline content component
const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      user: {
        default: "Unknown",
      },
      userId: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <span className="bg-[#3b82f633] text-[#3b82f6] px-1 py-0.5 rounded font-medium">
        @{props.inlineContent.props.user}
      </span>
    ),
  },
);

// Enhanced schema with mentions only
const createEnhancedSchema = () => {
  return BlockNoteSchema.create({
    inlineContentSpecs: {
      ...defaultInlineContentSpecs,
      mention: Mention,
    },
  });
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// Centralized user resolution function using backend API
const resolveUsersFromBackend = async (userIds) => {
  try {
    if (!userIds || userIds.length === 0) return [];
    
    // Use the backend API to get user details from Firebase Auth
    const users = await documentApi.getUserDetails(userIds);
    return users;
    
  } catch (error) {
    console.error('Error resolving users:', error);
    // Return fallback data
    return userIds.map(userId => ({
      id: userId,
      name: `User ${userId.slice(-4)}`,
      email: ''
    }));
  }
};

const Editor = () => {
  const { activeDocumentId } = useDocument();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeDocumentId) {
      navigate('/dashboard');
    }
  }, [activeDocumentId, navigate]);

  if (!activeDocumentId) {
    return null; // or a loading spinner
  }

  return (
    <YDocProvider
      docId={activeDocumentId}
      authEndpoint="https://demos.y-sweet.dev/api/auth"
      showDebuggerLink={false}
    >
      <Document />
    </YDocProvider>
  );
};

function Document() {
  const { activeDocumentId: id } = useDocument();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Core State
  const [document, setDocument] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]); 
  const [activeUser, setActiveUser] = useState(null);
  const [title, setTitle] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [userCache, setUserCache] = useState(new Map()); // Cache for resolved users

  // UI & Save State
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Yjs providers
  const provider = useYjsProvider();
  const ydoc = useYDoc();

  // Store initial data for comparison
  const [initialData, setInitialData] = useState({
    title: '',
    content: [{ type: "paragraph", content: [{ type: "text", text: "Start writing..." }] }]
  });

  // Debounce title to trigger auto-save
  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(editorContent, 2000);

  // Enhanced schema
  const schema = useMemo(() => createEnhancedSchema(), []);

  // AI Model
  const aiModel = useMemo(() => createAIModel(), []);

  // Enhanced resolveUsers function that uses cache
  const resolveUsersWithCache = useCallback(async (userIds) => {
    if (!userIds || userIds.length === 0) return [];
    
    const uncachedIds = userIds.filter(id => !userCache.has(id));
    
    if (uncachedIds.length > 0) {
      const newUsers = await resolveUsersFromBackend(uncachedIds);
      const newCache = new Map(userCache);
      newUsers.forEach(userData => {
        newCache.set(userData.id, userData);
      });
      setUserCache(newCache);
    }
    
    return userIds.map(id => userCache.get(id) || {
      id,
      name: `User ${id.slice(-4)}`,
      email: ''
    });
  }, [userCache]);

  // Function to get mention menu items
  const getMentionMenuItems = useCallback((editor) => {    
    return documentUsers
      .filter(docUser => docUser && docUser.id && docUser.name)
      .map((docUser) => ({
        title: docUser.name,
        subtext: docUser.email || '',
        onItemClick: () => {
          // Insert the mention inline content
          editor.insertInlineContent([
            {
              type: "mention",
              props: {
                user: docUser.name,
                userId: docUser.id,
              },
            },
            " ", // add a space after the mention
          ]);
        },
      }));
  }, [documentUsers]);

  // Track active users and title collaboration using Y-Sweet's awareness
  useEffect(() => {
    if (!provider || !user) return;

    const awareness = provider.awareness;
    
    // Set current user's awareness state
    awareness.setLocalStateField('user', {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
      email: user.email,
      color: generateUserColor(user.uid)
    });

    // Listen for awareness changes
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values());
      setActiveUsers(states);
    };

    awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [provider, user, ydoc]);


  // Load document and users
  useEffect(() => {
    const fetchDocumentAndUsers = async () => {
      if (user && id) {
        try {
          setLoading(true);
          
          // Load document from API to get permissions and metadata
          const doc = await documentApi.getById(id);
          const userRole = doc.roles?.[user.uid] || null;
          const canEdit = userRole === 'admin' || userRole === 'editor';
          
          setIsEditable(canEdit);
          setTitle(doc.title);
          setDocument({ ...doc, role: userRole });
          setLastSaved(doc.updatedAt ? new Date(doc.updatedAt) : null);
          setInitialData({ title: doc.title });

          // Load users for collaboration and mentions
          const userIds = doc.members || [];
          
          if (userIds.length > 0) {
            // Use the centralized resolveUsersFromBackend function
            const resolvedUsers = await resolveUsersFromBackend(userIds);
            
            // Update cache
            const newCache = new Map();
            resolvedUsers.forEach(userData => {
              newCache.set(userData.id, userData);
            });
            setUserCache(newCache);
            
            // Set document users for mentions
            setDocumentUsers(resolvedUsers);
            
            // Set active user
            const currentUserData = resolvedUsers.find(u => u.id === user.uid) || {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
              email: user.email || ''
            };
            
            setActiveUser({ ...currentUserData, role: userRole || 'viewer' });
          } else {
            // Handle case where no members are found
            const currentUserData = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
              email: user.email || ''
            };
            
            setDocumentUsers([currentUserData]);
            setActiveUser({ ...currentUserData, role: userRole || 'viewer' });
          }
          
        } catch (error) {
          console.error('Load document error:', error);
          setError('Failed to load document.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDocumentAndUsers();
  }, [id, user]);

  // Auto-save title changes
  useEffect(() => {
    if (!isEditable || !document || loading || !activeUser) return;

    const hasTitleChanged = debouncedTitle !== initialData.title;
    if (hasTitleChanged && debouncedTitle.trim()) {
      handleSave({ title: debouncedTitle });
    }
  }, [debouncedTitle, initialData.title, isEditable, document, loading, activeUser]);

  // Auto-save content changes
  useEffect(() => {
    if (!isEditable || !document || loading || !activeUser || !debouncedContent) return;

    if (hasUnsavedChanges) {
      handleSave({ content: debouncedContent });
    }
  }, [debouncedContent, isEditable, document, loading, activeUser, hasUnsavedChanges]);
  
  // Thread store for comments
  const threadStore = useMemo(() => {
    if (!activeUser || !ydoc) return null;
    return new YjsThreadStore(
      activeUser.id,
      ydoc.getMap("threads"),
      new DefaultThreadStoreAuth(activeUser.id, activeUser.role === 'viewer' ? 'comment' : 'editor'),
    );
  }, [ydoc, activeUser?.id, activeUser?.role]);

  // BlockNote editor with collaboration and enhanced features
  const editor = useCreateBlockNote(
    {
      dictionary: {
        ...en,
        ai: aiEn, // add default translations for the AI extension
      },
      schema,
      resolveUsers: resolveUsersWithCache,
      comments: threadStore ? { threadStore } : undefined,
      // Register the AI extension if model is available
      extensions: aiModel ? [
        createAIExtension({
          model: aiModel,
        }),
      ] : [],
      collaboration: provider && activeUser ? {
        provider,
        fragment: ydoc.getXmlFragment("blocknote"),
        user: { 
          color: generateUserColor(activeUser.id), 
          name: activeUser.name 
        },
        showCursorLabels: "activity",
        // Add error handling for Yjs conflicts
        onError: (error) => {
          console.warn('Collaboration error:', error);
          // Don't throw the error, just log it
        }
      } : undefined
    },
    [activeUser?.id, activeUser?.name, threadStore, provider, ydoc, schema, resolveUsersWithCache, aiModel],
  );

  
  // Slash menu with AI options
  const SuggestionMenuWithAI = ({ editor }) => {
    return (
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            [
              ...getDefaultReactSlashMenuItems(editor),
              // add the default AI slash menu items if model is available
              ...(aiModel ? getAISlashMenuItems(editor) : []),
            ],
            query,
          )
        }
      />
    );
  };

  // Handle editor content changes for auto-save
  useEffect(() => {
    if (!editor || !isEditable) return;

    const handleChange = () => {
      try {
        const content = editor.document;
        setEditorContent(content);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.warn('Error getting editor content:', error);
      }
    };

    // Listen for document changes
    editor.onChange(handleChange);

    return () => {
      // Cleanup if needed
    };
  }, [editor, isEditable]);
  
  // Save function for title and content updates
  const handleSave = async (data = {}) => {
    if (status === 'saving' || !isEditable || !document) return;

    try {
      setStatus('saving');
      
      const updateData = {};
      
      // Handle title updates
      if (data.title !== undefined) {
        updateData.title = data.title;
        setInitialData(prev => ({ ...prev, title: data.title }));
      }
      
      // Handle content updates
      if (data.content !== undefined) {
        updateData.content = data.content;
        setHasUnsavedChanges(false);
      }
      
      // Only make API call if there's data to update
      if (Object.keys(updateData).length > 0) {
        await documentApi.update(id, updateData);
      }

      setLastSaved(new Date());
      setStatus('saved');

      setTimeout(() => setStatus('idle'), 2000);

    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save document');
      setStatus('idle');
    }
  };

  // Status indicator
  const getStatusIndicator = () => {
    if (!isEditable) {
      return (
        <>
          {lastSaved ? (
            <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          ) : (
            <div className="h-5 w-40" />
          )}
          <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg px-3 py-1 text-sm font-medium">
            <Crown className="h-4 w-4" />
            <span>{document.createdByName || 'GOD'}</span>
          </div>
        </>
      );
    }

    if (status === 'saving') {
      return (
        <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          Saving...
        </span>
      );
    }

    if (status === 'saved' || status === 'idle') {
      return (
        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Saved
        </span>
      );
    }

    return <div className="h-5 w-20" />;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </Layout>
    );
  }

  if (error && !document) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!activeUser || !document || !threadStore) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Fixed header that stays visible */}
      <div className="sticky top-0 z-20 bg-primary-100 dark:bg-gray-900 border-b border-primary-200 dark:border-secondary-700 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center space-x-2 text-secondary-600 dark:text-primary-300 hover:text-secondary-800 dark:hover:text-primary-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-4">
              {/* Active Users Display */}
              {activeUsers.length > 0 && (
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-secondary-800 rounded-lg px-3 py-2 shadow-sm border border-primary-200 dark:border-secondary-700">
                  <Users className="h-4 w-4 text-secondary-600 dark:text-primary-300" />
                  <span className="text-sm text-secondary-600 dark:text-primary-300">
                    {activeUsers.length} active
                  </span>
                  <div className="flex -space-x-2">
                    {activeUsers.slice(0, 3).map((activeUser, index) => {
                      const user = activeUser.user || {};
                      const name = user.name || 'User';
                      const color = user.color || '#888';
                      const id = user.id || index;

                      return (
                        <div
                          key={id}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: color }}
                          title={name}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      );
                    })}
                    {activeUsers.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 bg-secondary-400 flex items-center justify-center text-xs font-medium text-white">
                        +{activeUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {getStatusIndicator()}

              {/* Share Button */}
              {(document?.role === 'admin' || document?.role === 'editor') && (
                <button 
                  onClick={() => setShareModalOpen(true)} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>

          {/* Title input - MOVED TO HEADER AREA */}
          <div className="pb-4">
            <div className="relative">
              <input
                type="text"
                value={title}
                disabled={!isEditable}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-bold bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-default"
                style={{ lineHeight: '1.2' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with proper scrolling */}
      <div className="flex-1 bg-primary-100 dark:bg-gray-900 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Document Editor Container */}
          <div className="bg-primary-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Editor Content - Scrollable */}
            <div className="relative">
              <div className="p-6">
                {/* BlockNote Editor with proper container */}
                <div className="blocknote-container">
                  <BlockNoteView
                    className="comments-main-container"
                    editor={editor}
                    editable={isEditable}
                    theme={isDark ? "dark" : "light"}
                    onError={(error) => {
                      console.warn('BlockNote error:', error);
                    }}
                    style={{
                      minHeight: '60vh',
                      maxHeight: 'none', // Remove height restrictions
                      overflow: 'visible' // Ensure content is visible
                    }}
                  >
                    {/* Add the AI Command menu to the editor */}
                    {aiModel && <AIMenuController />}

                    {/* Custom slash menu with AI options */}
                    <SuggestionMenuWithAI editor={editor} />

                    {/* Mentions menu - opens with "@" key */}
                    <SuggestionMenuController
                      triggerCharacter={"@"}
                      getItems={async (query) =>
                        filterSuggestionItems(getMentionMenuItems(editor), query)
                      }
                    />
                  </BlockNoteView>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add some bottom padding to ensure content is never cut off */}
          <div className="h-20"></div>
        </div>
      </div>

      {/* Share Modal */}
      {document && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
          document={document} 
        />
      )}
    </Layout>
  );
}

export default Editor;