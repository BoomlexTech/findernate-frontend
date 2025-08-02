// app/chats/page.tsx
'use client'
import { Suspense } from "react";
import MessagePanel from "@/components/MessagePanel";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AuthDialog } from "@/components/AuthDialog";
import { MessageCircle, Users, LogIn } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { requireAuth, showAuthDialog, closeAuthDialog, isAuthenticated } = useAuthGuard();

  const handleLoginClick = () => {
    requireAuth(() => {
      // This will trigger a re-render once user is authenticated
      console.log('User authenticated, chats will load');
    });
  };

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md w-full mx-4">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-yellow-600"/>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Chat</h2>
                <p className="text-gray-600 leading-relaxed">
                  Connect with friends, start conversations, and never miss a message. 
                  Sign in to access your chats.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Send and receive messages</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Connect with other users</span>
                </div>
              </div>
              
              <button
                onClick={handleLoginClick}
                className="w-full bg-button-gradient text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Start Chatting
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                New here? <Link href={"/signup"}><span className="text-yellow-600">Sign up</span></Link> to join the conversation!
              </p>
            </div>
          </div>
        </div>
        
        <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />
      </>
    );
  }

  // Show authenticated chats page
  return (
    <>
      <div className="flex">
        {/* LeftSidebar is assumed already rendered in layout */}
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your chats...</p>
            </div>
          </div>
        }>
          <MessagePanel />
        </Suspense>
      </div>
      
      <AuthDialog isOpen={showAuthDialog} onClose={closeAuthDialog} />
    </>
  );
}