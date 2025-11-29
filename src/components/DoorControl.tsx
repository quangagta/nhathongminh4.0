import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, LockOpen, Key, Clock, History } from 'lucide-react';
import { useDoorControl } from '@/hooks/useDoorControl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle } from 'lucide-react';

export const DoorControl = () => {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const { isUnlocked, loading, history, autoLockDelay, updateAutoLockDelay, verifyAndUnlock, changePassword, lockDoor } = useDoorControl();

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Đang mở...';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}ph ${remainingSeconds}s`;
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 4) {
      await verifyAndUnlock(password);
      setPassword('');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 4) {
      alert('Mật khẩu mới phải có ít nhất 4 ký tự');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <LockOpen className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-red-500" />
            )}
            <CardTitle>Điều Khiển Cửa</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  Lịch Sử
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Lịch Sử Mở Khóa</DialogTitle>
                  <DialogDescription>
                    {history.length > 0 
                      ? `${history.length} lần mở khóa gần đây`
                      : 'Chưa có lịch sử mở khóa'}
                  </DialogDescription>
                </DialogHeader>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có lịch sử mở khóa</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
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
              </DialogContent>
            </Dialog>
            
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Đổi Mật Khẩu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleChangePassword}>
                  <DialogHeader>
                    <DialogTitle>Đổi Mật Khẩu Cửa</DialogTitle>
                    <DialogDescription>
                      Nhập mật khẩu cũ và mật khẩu mới để thay đổi
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={4}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      Đổi Mật Khẩu
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription>
          Trạng thái: <span className={isUnlocked ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
            {isUnlocked ? "Đã Mở Khóa" : "Đã Khóa"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="autoLockDelay" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian tự động khóa
              </Label>
              <Select
                value={autoLockDelay.toString()}
                onValueChange={(value) => updateAutoLockDelay(parseInt(value))}
              >
                <SelectTrigger id="autoLockDelay" className="bg-card">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="5">5 giây</SelectItem>
                  <SelectItem value="10">10 giây</SelectItem>
                  <SelectItem value="30">30 giây</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Nhập mật khẩu để mở khóa</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={4}
                required
              />
              <p className="text-sm text-muted-foreground">
                Mật khẩu mặc định: 1234
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || password.length < 4}
            >
              <LockOpen className="mr-2 h-4 w-4" />
              Mở Khóa
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-600 text-center font-medium">
                Cửa đã mở! Sẽ tự động khóa sau {autoLockDelay} giây
              </p>
            </div>
            <Button 
              onClick={lockDoor}
              variant="destructive"
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Khóa Ngay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
