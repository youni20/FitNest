"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  MessageCircle,
  Users,
  Send,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "./auth-context";

interface User {
  id: number;
  name: string;
  email: string;
  level: string;
  fitness_goals: string[];
}

interface Friend {
  id: number;
  friend_id: number;
  friend_name: string;
  friend_level: string;
  status: "pending" | "accepted";
  created_at: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  message: string;
  sent_at: string;
  is_read: boolean;
}

interface Conversation {
  friend_id: number;
  friend_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function SocialHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"friends" | "search" | "messages">(
    "friends"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    fetchConversations();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/social/friends", {
        headers: { "x-auth-token": token || "" },
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/social/conversations",
        {
          headers: { "x-auth-token": token || "" },
        }
      );
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/social/search?q=${encodeURIComponent(
          searchTerm
        )}`,
        {
          headers: { "x-auth-token": token || "" },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/social/friend-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
          },
          body: JSON.stringify({ friend_id: userId }),
        }
      );

      if (response.ok) {
        alert("Friend request sent!");
        setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const respondToFriendRequest = async (
    friendshipId: number,
    accept: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/social/friend-request/${friendshipId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
          },
          body: JSON.stringify({ accept }),
        }
      );

      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error("Error responding to friend request:", error);
    }
  };

  const fetchMessages = async (friendId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/social/messages/${friendId}`,
        {
          headers: { "x-auth-token": token || "" },
        }
      );
      const data = await response.json();
      setMessages(data);
      setSelectedConversation(friendId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/social/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
        },
        body: JSON.stringify({
          receiver_id: selectedConversation,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedConversation);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const pendingRequests = friends.filter((f) => f.status === "pending");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Social Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with other fitness enthusiasts
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("friends")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "friends"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Friends ({acceptedFriends.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "search"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Find Friends
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "messages"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Messages
            {conversations.some((c) => c.unread_count > 0) && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Friend Requests
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {request.friend_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fitness Level: {request.friend_level}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToFriendRequest(request.id, true)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          respondToFriendRequest(request.id, false)
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Friends
              </h2>
            </div>

            {acceptedFriends.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">
                  No friends yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Search for users to add as friends!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {acceptedFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {friend.friend_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fitness Level: {friend.friend_level}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("messages");
                        fetchMessages(friend.friend_id);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={searchUsers}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search Results
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {searchUser.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fitness Level: {searchUser.level}
                      </p>
                      {searchUser.fitness_goals &&
                        searchUser.fitness_goals.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Goals: {searchUser.fitness_goals.join(", ")}
                          </p>
                        )}
                    </div>
                    <button
                      onClick={() => sendFriendRequest(searchUser.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="grid md:grid-cols-3 gap-6 h-96">
          {/* Conversations List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Conversations
              </h2>
            </div>
            <div className="overflow-y-auto h-80">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.friend_id}
                    onClick={() => fetchMessages(conv.friend_id)}
                    className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedConversation === conv.friend_id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {conv.friend_name}
                      </h3>
                      {conv.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.last_message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(conv.last_message_time).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {
                      conversations.find(
                        (c) => c.friend_id === selectedConversation
                      )?.friend_name
                    }
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
