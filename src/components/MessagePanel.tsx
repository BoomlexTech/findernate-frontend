"use client";
import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Bell, Phone, Video, MoreHorizontal, Search, Send, Paperclip, Smile } from "lucide-react";

const chats = [
  {
    id: 1,
    name: "Priya Sharma",
    message: "That sounds amazing! I've been loo...",
    time: "15m ago",
    badge: 1,
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    verified: true,
    type: "Business",
    chatHistory: [
      {
        sender: "me",
        text: "Hi Priya! I saw your latest saree collection. Would love to discuss a collaboration opportunity.",
        time: "04:50 pm",
      },
      {
        sender: "Priya",
        text: "Hello Rajesh! Thank you for reaching out. I would be interested to know more about the collaboration.",
        time: "04:55 pm",
      },
    ],
  },
  {
    id: 2,
    name: "Meera Patel",
    message: "Hi Meera! That sounds like a great idea. I'...",
    time: "1h ago",
    badge: 0,
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    verified: false,
    type: "Business",
    chatHistory: [
      {
        sender: "me",
        text: "Hi Arjun! I saw your fitness posts. Would you be interested in collaborating on a wellness retreat?",
        time: "10:40 am",
      },
      {
        sender: "Meera",
        text: "Hi Meera! That sounds like a great idea. I'd love to combine fitness training with your yoga sessions.",
        time: "11:10 am",
      },
    ],
  },
];

export default function MessagePanel() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const selected = chats.find((chat) => chat.id === selectedChat);

  return (
    <div className="flex w-full h-screen">
      {/* Left Panel */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">Connect with businesses and users</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">AVantika</p>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=AVantika&background=D4AF37&color=fff&size=150&bold=true" alt="AVantika" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400" />
            </div>
          </div>
        </div>

        <div className="px-6 pt-4">
          <button className="w-full bg-[#DBB42C] text-white py-2.5 rounded-lg font-medium shadow hover:bg-yellow-500 transition">
            + New Chat
          </button>
        </div>

        <div className="px-6 py-4 relative">
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
        </div>

        <div className="overflow-y-auto px-4 flex-1">
          {chats.map((chat) => (
            <div key={chat.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-yellow-50 transition ${selectedChat === chat.id ? "bg-yellow-50 border border-yellow-300" : ""}`} onClick={() => setSelectedChat(chat.id)}>
              <Image src={chat.avatar} alt={chat.name} width={48} height={48} className="rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black">{chat.name}</span>
                  {chat.verified && <span className="text-blue-500 text-xs font-bold">✔️</span>}
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{chat.type}</span>
                  <span className="ml-auto text-xs text-gray-400">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.message}</p>
              </div>
              {chat.badge > 0 && <div className="ml-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{chat.badge}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {selected ? (
          <div className="flex flex-col w-full h-full">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={selected.avatar} alt={selected.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                      {selected.verified && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">{selected.type}</div>
                    </div>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-500">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {selected.chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} mb-4`}>
                  <div className="max-w-md px-4 py-3 rounded-2xl bg-gray-100 text-gray-900">
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <input type="text" placeholder="Type a message..." className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-yellow-500" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button type="submit" className="p-3 bg-[#DBB42C] hover:bg-yellow-500 text-white rounded-full transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 w-10 h-10 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-800">Select a conversation</h3>
            <p className="text-gray-500 mt-1">Choose a conversation to start messaging</p>
            <button className="mt-4 bg-[#DBB42C] text-white px-4 py-2 rounded-lg hover:bg-yellow-500">
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}