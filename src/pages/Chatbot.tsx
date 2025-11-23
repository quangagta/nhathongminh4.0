import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const Chatbot = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Trợ Lý AI"
          description="Chat với trợ lý thông minh của hệ thống"
          gradient="from-purple-400 to-pink-400"
        />
        
        <div className="mt-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <MessageSquare className="w-16 h-16 mx-auto text-purple-400" />
            <h2 className="text-2xl font-semibold text-foreground">
              Trợ Lý AI Nhà Thông Minh
            </h2>
            <p className="text-muted-foreground max-w-md">
              Hỏi tôi về bất kỳ điều gì liên quan đến hệ thống nhà thông minh của bạn. 
              Tôi có thể giúp bạn kiểm tra trạng thái thiết bị, cung cấp hướng dẫn, và trả lời câu hỏi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
