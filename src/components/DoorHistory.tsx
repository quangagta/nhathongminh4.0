import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DoorHistoryEntry } from '@/hooks/useDoorControl';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DoorHistoryProps {
  history: DoorHistoryEntry[];
}

export const DoorHistory = ({ history }: DoorHistoryProps) => {
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Đang mở...';
    
    if (seconds < 60) {
      return `${seconds} giây`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút ${remainingSeconds} giây`;
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle>Lịch Sử Mở Khóa</CardTitle>
        </div>
        <CardDescription>
          {history.length > 0 
            ? `${history.length} lần mở khóa gần đây`
            : 'Chưa có lịch sử mở khóa'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có lịch sử mở khóa</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDateTime(entry.unlockedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Thời lượng:</span>
                        <span className="font-medium text-foreground">
                          {formatDuration(entry.duration)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entry.autoLocked ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              Tự động khóa
                            </span>
                          </>
                        ) : entry.lockedAt ? (
                          <>
                            <XCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">
                              Khóa thủ công
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600">
                              Đang mở
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
