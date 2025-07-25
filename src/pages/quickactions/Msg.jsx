import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  RiSearchLine, 
  RiMoreLine, 
  RiPhoneLine, 
  RiVideoLine, 
  RiSortDesc, 
  RiCheckDoubleLine, 
  RiSendPlaneLine 
} from 'react-icons/ri';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';

const Msg = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  // Dummy conversations data
  const conversations = [
    {
      id: 1,
      name: "John Smith",
      avatar: "https://ui-avatars.com/api/?name=John+Smith",
      lastMessage: "Is the property still available?",
      time: "2m ago",
      unread: 2,
      isOnline: true,
      messages: [
        { id: 1, text: "Hi, I'm interested in the property", sender: "them", time: "10:30 AM" },
        { id: 2, text: "Which property are you referring to?", sender: "me", time: "10:32 AM" },
        { id: 3, text: "The one in Makati City", sender: "them", time: "10:33 AM" },
        { id: 4, text: "Is the property still available?", sender: "them", time: "10:33 AM" },
      ]
    },
    // Add more conversations as needed
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add message handling logic here
    setMessage('');
  };

  return (
    <div className="flex">
      <DashboardNavbar userRole="buyer" isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="flex h-screen">
          {/* Left Section - Conversations List */}
          <div className="w-1/3 border-r border-base-200">
            {/* Header */}
            <div className="p-4 border-b border-base-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Messages</h2>
                <button className="btn btn-ghost btn-sm btn-circle">
                  <RiSortDesc className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search conversations..."
                  className="input input-bordered w-full pr-10"
                />
                <RiSearchLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-[calc(100vh-180px)]">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-4 hover:bg-base-200 cursor-pointer transition-colors
                    ${selectedChat?.id === chat.id ? 'bg-base-200' : ''}`}
                >
                  <div className="relative">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={chat.avatar} alt={chat.name} />
                      </div>
                    </div>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      <span className="text-xs text-base-content/70">{chat.time}</span>
                    </div>
                    <p className="text-sm text-base-content/70 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="badge badge-primary badge-sm">{chat.unread}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-base-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={selectedChat.avatar} alt={selectedChat.name} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedChat.name}</h3>
                      {selectedChat.isOnline && (
                        <span className="text-xs text-success">Online</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-ghost btn-sm btn-circle">
                      <RiPhoneLine className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle">
                      <RiVideoLine className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-sm btn-circle">
                      <RiMoreLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        msg.sender === 'me' 
                          ? 'bg-primary text-primary-content' 
                          : 'bg-base-200'
                        } rounded-lg px-4 py-2`}
                      >
                        <p>{msg.text}</p>
                        <span className="text-xs opacity-70 mt-1 block">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-base-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input input-bordered flex-1"
                    />
                    <button type="submit" className="btn btn-primary btn-circle">
                      <RiSendPlaneLine className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-base-content/50">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Msg;