import React from 'react';

interface PageElement {
    id: string;
    type: string;
    content: string;
    styles: React.CSSProperties;
    position: { x: number; y: number };
}

interface AIAgentProps {
    selectedElements: string[];
    elements: PageElement[];
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ selectedElements, elements }) => {
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState<Message[]>([
        {
            role: 'ai',
            content: 'Hello! I\'m your AI assistant. I can help you edit elements, change colors, adjust layouts, and more. What would you like to do?'
        }
    ]);
    const [options, setOptions] = React.useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage: Message = { role: 'user', content: input };
        setMessages([...messages, userMessage]);

        // Get AI response
        const response = await getAIResponse(input);
        const aiMessage: Message = { role: 'ai', content: response };
        setMessages([...messages, userMessage, aiMessage]);
        
        // Generate 3 options for the user
        const generatedOptions = generateOptions(input);
        setOptions(generatedOptions);
        
        setInput('');
    };

    const getAIResponse = async (query: string): Promise<string> => {
        // Placeholder for AI response logic
        return new Promise((resolve) => {
            setTimeout(() => {
                const selectedCount = selectedElements.length;
                const selectedTypes = selectedElements.map(id => {
                    const elem = elements.find(e => e.id === id);
                    return elem?.type || 'unknown';
                }).join(', ');

                if (selectedCount === 0) {
                    resolve(`I understand you want to: "${query}". Please select an element first to make changes.`);
                } else if (selectedCount === 1) {
                    resolve(`I'll help you with the selected ${selectedTypes} element. Here are 3 options:`);
                } else {
                    resolve(`I'll help you with ${selectedCount} selected elements (${selectedTypes}). Here are 3 options:`);
                }
            }, 500);
        });
    };

    const generateOptions = (query: string): string[] => {
        // Generate 3 different solutions based on the query
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('color') || lowerQuery.includes('colour')) {
            return [
                'Option 1: Change to a bold, vibrant color scheme',
                'Option 2: Apply a subtle, professional color palette',
                'Option 3: Use a gradient with complementary colors'
            ];
        } else if (lowerQuery.includes('size') || lowerQuery.includes('bigger') || lowerQuery.includes('smaller')) {
            return [
                'Option 1: Increase size by 25%',
                'Option 2: Make it 50% larger',
                'Option 3: Double the current size'
            ];
        } else if (lowerQuery.includes('move') || lowerQuery.includes('position')) {
            return [
                'Option 1: Center align on the page',
                'Option 2: Move to the top-left corner',
                'Option 3: Align to the right side'
            ];
        } else if (lowerQuery.includes('text') || lowerQuery.includes('font')) {
            return [
                'Option 1: Modern sans-serif font (Arial, Helvetica)',
                'Option 2: Classic serif font (Georgia, Times)',
                'Option 3: Elegant display font with increased spacing'
            ];
        } else {
            return [
                'Option 1: Apply a modern, minimalist style',
                'Option 2: Use a bold, eye-catching design',
                'Option 3: Keep it simple and professional'
            ];
        }
    };

    const handleOptionClick = (option: string) => {
        const confirmMessage: Message = {
            role: 'ai',
            content: `Great choice! I'll apply "${option}". Would you like me to proceed?`
        };
        setMessages([...messages, confirmMessage]);
        setOptions([]);
    };

    return (
        <div className="ai-agent" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#f8f9fa',
            padding: '20px'
        }}>
            <div style={{
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>AI Assistant</h3>
                {selectedElements.length > 0 && (
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: '#e3f2fd',
                        padding: '8px',
                        borderRadius: '6px',
                        marginTop: '8px'
                    }}>
                        ✓ {selectedElements.length} element{selectedElements.length > 1 ? 's' : ''} selected
                    </div>
                )}
            </div>

            <div className="messages" style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: message.role === 'user' ? '#007bff' : 'white',
                            color: message.role === 'user' ? 'white' : '#333',
                            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        {message.content}
                    </div>
                ))}
                
                {options.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '8px',
                                    backgroundColor: 'white',
                                    border: '1px solid #007bff',
                                    borderRadius: '6px',
                                    color: '#007bff',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#007bff';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = '#007bff';
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Describe what you want to change..."
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default AIAgent;